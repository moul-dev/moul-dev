package tui

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/atotto/clipboard"
	"charm.land/bubbles/v2/textinput"
	"charm.land/bubbles/v2/viewport"
	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

type AppState int

const (
	StateConnect AppState = iota
	StateRootSetup
	StateDashboard
	StateRecordList
	StateRecordDetail
	StateRecordEdit
	StateWorkerMonitor
	StateAnalytics
	StateDeviceAuth
	StateMoulCreate
	StateSettings
)

// Model is the main state container for the moul TUI.
type Model struct {
	State        AppState
	Client       *Client
	Config       *Config
	Err          error
	SuccessMsg   string
	Width        int
	Height       int
	Ready        bool

	// Navigation & Sidebar
	Mouls              []schema.Moul
	ActiveSidebarIndex int // 0 to len(mouls)-1 for collections, len(mouls) for workers, len(mouls)+1 for analytics

	// Records Screen
	Records             []map[string]interface{}
	SelectedRecordIndex int

	// Details Viewport
	Viewport   viewport.Model
	ViewDetail string // What detail type we are viewing (JSON, job error, etc.)

	// Worker Screen
	Jobs             []map[string]interface{}
	SelectedJobIndex int

	// Analytics Screen
	Visits             []map[string]interface{}
	SelectedVisitIndex int

	// huh Forms
	ConnForm           *huh.Form
	RootSetupForm      *huh.Form
	RecordForm         *huh.Form
	AnalyticsLoginForm *huh.Form
	MoulForm           *huh.Form

	// Analytics Login Data
	analyticsEmail     string
	analyticsPassword  string
	analyticsMoul      string
	analyticsAuthError error

	// Root Setup Data
	rootUsername    string
	rootEmail       string
	rootPassword    string
	rootConfirmPass string

	// Temporary data
	serverURL          string
	adminKey           string
	editRecordID       string
	recordFormData     map[string]*string
	recordFormMultiSel map[string]*[]string

	// Moul creation data
	newMoulName            string
	newMoulType            string
	newMoulListRule        string
	newMoulViewRule        string
	newMoulCreateRule      string
	newMoulUpdateRule      string
	newMoulDeleteRule      string
	newMoulFieldsList      []schema.MoulField
	newMoulAction          string
	newFieldName           string
	newFieldType           string
	newFieldRelationTarget string
	newFieldRelationCard   string
	MoulActionForm         *huh.Form
	MoulFieldForm          *huh.Form
	MoulRulesForm          *huh.Form
	MoulFieldDeleteForm    *huh.Form
	MoulFieldSelectForm    *huh.Form
	fieldToDelete          string
	fieldToEdit            string
	editingFieldName       string
	isEditingField         bool
	moulWizardState        string // "metadata", "fields", "add_field", "edit_select", "delete_select", "rules"

	// Device Auth Data
	authMode        string
	deviceCode      string
	userCode        string
	verificationURI string
	pollInterval    int
	pollExpiry      time.Time

	// Settings Screen
	settingFileS3Enabled         string
	settingFileS3Bucket          string
	settingFileS3Endpoint        string
	settingFileS3Region          string
	settingFileS3AccessKey       string
	settingFileS3SecretKey       string
	settingFileS3ForcePath       string
	settingLiteEnabled           string
	settingLiteS3Bucket          string
	settingLiteS3Endpoint        string
	settingLiteS3Region          string
	settingLiteAccessKey         string
	settingLiteSecretKey         string
	settingLiteS3ForcePath       string
	settingLiteReplica           string

	// Settings Tabs & Custom Inputs
	settingsActiveTab            int // 0 = S3 Storage, 1 = Litestream
	settingsFocusIndex           int // 0 = Tabs, 1..N = Fields, N+1 = Save, N+2 = Cancel
	storageInputs                []textinput.Model
	liteInputs                   []textinput.Model
}

// NewModel initializes the TUI model with default values.
func NewModel(serverURLOverride, adminKeyOverride string) *Model {
	cfg, _ := LoadConfig()

	m := &Model{
		State:     StateConnect,
		Config:    cfg,
		serverURL: cfg.ServerURL,
		authMode:  cfg.AuthMode,
	}

	if serverURLOverride != "" {
		m.serverURL = serverURLOverride
	}

	// Fetch credentials from OS Keychain if not overridden
	adminKey, _ := GetSecret(m.serverURL, "admin_key")
	m.adminKey = adminKey

	if adminKeyOverride != "" {
		m.adminKey = adminKeyOverride
		m.authMode = "admin_key"
	}

	m.initConnectionForm()
	return m
}

// Init initializes the Bubble Tea program.
func (m *Model) Init() tea.Cmd {
	// Attempt auto-connection if credentials exist (we default to checking the cached JWT token first)
	token, _ := GetSecret(m.serverURL, "jwt_token")
	if m.serverURL != "" && token != "" {
		m.authMode = "device_flow"
		return m.connectCmd()
	}
	return m.ConnForm.Init()
}

// Update acts as the central router for message updates.
func (m *Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case ErrMsg:
		m.Err = msg.Err
		return m, nil
	case RecordsMsg:
		m.Records = msg.Records
		return m, nil
	case JobsMsg:
		m.Jobs = msg.Jobs
		return m, nil
	case VisitsMsg:
		m.Visits = msg.Visits
		return m, nil

	case SettingsMsg:
		m.settingFileS3Enabled = msg.Settings["file_s3_enabled"]
		m.settingFileS3Bucket = msg.Settings["file_s3_bucket"]
		m.settingFileS3Endpoint = msg.Settings["file_s3_endpoint"]
		m.settingFileS3Region = msg.Settings["file_s3_region"]
		m.settingFileS3AccessKey = msg.Settings["file_s3_access_key"]
		m.settingFileS3SecretKey = msg.Settings["file_s3_secret_key"]
		m.settingFileS3ForcePath = msg.Settings["file_s3_force_path_style"]
		m.settingLiteEnabled = msg.Settings["litestream_enabled"]
		m.settingLiteS3Bucket = msg.Settings["litestream_s3_bucket"]
		m.settingLiteS3Endpoint = msg.Settings["litestream_s3_endpoint"]
		m.settingLiteS3Region = msg.Settings["litestream_region"]
		m.settingLiteAccessKey = msg.Settings["litestream_access_key_id"]
		m.settingLiteSecretKey = msg.Settings["litestream_secret_access_key"]
		m.settingLiteS3ForcePath = msg.Settings["litestream_s3_force_path_style"]
		m.settingLiteReplica = msg.Settings["litestream_replica_path"]

		m.initSettingsInputs()
		m.State = StateSettings
		m.settingsActiveTab = 0
		m.settingsFocusIndex = 0
		return m, textinput.Blink

	case settingsSavedMsg:
		if msg.err != nil {
			m.Err = msg.err
			m.SuccessMsg = ""
		} else {
			m.SuccessMsg = "Settings saved successfully!"
			m.Err = nil
		}
		m.State = StateDashboard
		return m, nil

	case setupStatusMsg:
		if msg.err != nil {
			m.Err = msg.err
			m.ConnForm.State = huh.StateNormal
			m.State = StateConnect
		} else if msg.needsSetup {
			m.initRootSetupForm()
			m.State = StateRootSetup
			return m, m.RootSetupForm.Init()
		} else {
			return m, m.startDeviceFlowCmd()
		}
		return m, nil

	case setupRootUserResultMsg:
		if msg.err != nil {
			m.Err = msg.err
			m.RootSetupForm.State = huh.StateNormal
		} else {
			return m, m.startDeviceFlowCmd()
		}
		return m, nil

	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height
		m.Ready = true

		// Re-size viewport
		hHeader := 3
		hFooter := 3
		vHeight := m.Height - hHeader - hFooter - 4
		if vHeight < 5 {
			vHeight = 5
		}
		if !m.recordViewportReady() {
			m.Viewport = viewport.New(viewport.WithWidth(m.Width-32), viewport.WithHeight(vHeight))
		} else {
			m.Viewport.SetWidth(m.Width - 32)
			m.Viewport.SetHeight(vHeight)
		}

	case createMoulResultMsg:
		if msg.err != nil {
			m.Err = msg.err
			m.MoulForm.State = huh.StateNormal
		} else {
			m.Mouls = msg.mouls
			m.SuccessMsg = "Collection created successfully!"
			m.State = StateDashboard
		}
		return m, nil

	case connectResultMsg:
		if msg.err != nil {
			m.Err = msg.err
			// Clear invalid token from keychain on connection error
			if m.authMode == "device_flow" {
				_ = DeleteSecret(m.serverURL, "jwt_token")
			}
			m.ConnForm.State = huh.StateNormal
			m.State = StateConnect
		} else {
			m.Mouls = msg.mouls
			m.State = StateDashboard
			m.loadSystemData()
			// Save config
			m.Config.ServerURL = m.serverURL
			m.Config.AuthMode = m.authMode
			_ = SaveConfig(m.Config)
		}
		return m, nil

	case deviceFlowStartMsg:
		if msg.err != nil {
			m.Err = msg.err
			m.ConnForm.State = huh.StateNormal
			m.State = StateConnect
		} else {
			m.deviceCode = msg.resp.DeviceCode
			m.userCode = msg.resp.UserCode
			m.verificationURI = msg.resp.VerificationURIComplete
			m.pollInterval = msg.resp.Interval
			if m.pollInterval <= 0 {
				m.pollInterval = 5
			}
			m.pollExpiry = time.Now().Add(time.Duration(msg.resp.ExpiresIn) * time.Second)
			m.State = StateDeviceAuth

			// Copy user code to clipboard
			_ = copyToClipboard(msg.resp.UserCode)

			// Open browser
			_ = openBrowser(msg.resp.VerificationURIComplete)

			return m, m.pollDeviceTokenCmd(time.Duration(m.pollInterval) * time.Second)
		}
		return m, nil

	case devicePollTickMsg:
		if m.State != StateDeviceAuth {
			return m, nil
		}
		if time.Now().After(m.pollExpiry) {
			m.Err = fmt.Errorf("authorization request expired")
			m.ConnForm.State = huh.StateNormal
			m.State = StateConnect
			return m, nil
		}
		return m, func() tea.Msg {
			resp, err := m.Client.PollDeviceToken("moul-tui", m.deviceCode)
			if err != nil {
				return devicePollResultMsg{err: err}
			}
			return devicePollResultMsg{token: resp.AccessToken}
		}

	case devicePollResultMsg:
		if m.State != StateDeviceAuth {
			return m, nil
		}
		if msg.err != nil {
			errMsg := msg.err.Error()
			if strings.Contains(errMsg, "authorization_pending") {
				return m, m.pollDeviceTokenCmd(time.Duration(m.pollInterval) * time.Second)
			} else if strings.Contains(errMsg, "slow_down") {
				m.pollInterval += 5
				return m, m.pollDeviceTokenCmd(time.Duration(m.pollInterval) * time.Second)
			} else {
				m.Err = msg.err
				m.ConnForm.State = huh.StateNormal
				m.State = StateConnect
				return m, nil
			}
		}

		// Success! Save JWT token to OS Keychain
		_ = SetSecret(m.serverURL, "jwt_token", msg.token)

		m.Config.ServerURL = m.serverURL
		m.Config.AuthMode = m.authMode
		_ = SaveConfig(m.Config)

		return m, m.connectCmd()

	case tea.KeyPressMsg:
		// Global exit on Ctrl+C (unless editing inside a text input, but global Ctrl+C is generally safe)
		if msg.String() == "ctrl+c" {
			return m, tea.Quit
		}

		if (m.State == StateDeviceAuth || m.State == StateRootSetup) && msg.String() == "esc" {
			m.State = StateConnect
			m.ConnForm.State = huh.StateNormal
			m.Err = fmt.Errorf("authorization cancelled")
			return m, nil
		}

		if m.State == StateMoulCreate && msg.String() == "esc" {
			switch m.moulWizardState {
			case "add_field", "edit_select", "delete_select", "rules":
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				return m, m.MoulActionForm.Init()
			case "fields":
				m.moulWizardState = "metadata"
				return m, m.MoulForm.Init()
			default:
				m.State = StateDashboard
			}
			return m, nil
		}
	}

	// Route based on state
	switch m.State {
	case StateConnect:
		newForm, cmd := m.ConnForm.Update(msg)
		if f, ok := newForm.(*huh.Form); ok {
			m.ConnForm = f
		}
		cmds = append(cmds, cmd)

		// Check if form is completed/submitted
		if m.ConnForm.State == huh.StateCompleted {
			m.Err = nil
			m.Client = NewClient(m.serverURL, m.adminKey)
			_ = SetSecret(m.serverURL, "admin_key", m.adminKey)
			return m, m.checkSetupStatusCmd()
		}

	case StateRootSetup:
		if m.RootSetupForm == nil {
			m.initRootSetupForm()
		}
		newForm, cmd := m.RootSetupForm.Update(msg)
		if f, ok := newForm.(*huh.Form); ok {
			m.RootSetupForm = f
		}
		cmds = append(cmds, cmd)

		if m.RootSetupForm.State == huh.StateCompleted {
			m.Err = nil
			return m, m.setupRootUserCmd()
		}

	case StateDashboard:
		cmd := m.updateDashboard(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}

	case StateRecordList:
		cmd := m.updateRecordList(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}

	case StateRecordDetail:
		cmd := m.updateRecordDetail(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}

	case StateRecordEdit:
		newForm, cmd := m.RecordForm.Update(msg)
		if f, ok := newForm.(*huh.Form); ok {
			m.RecordForm = f
		}
		cmds = append(cmds, cmd)

		if m.RecordForm.State == huh.StateCompleted {
			m.saveRecordForm()
		}

	case StateMoulCreate:
		switch m.moulWizardState {
		case "metadata":
			newForm, cmd := m.MoulForm.Update(msg)
			if f, ok := newForm.(*huh.Form); ok {
				m.MoulForm = f
			}
			cmds = append(cmds, cmd)

			if m.MoulForm.State == huh.StateCompleted {
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			} else if m.MoulForm.State == huh.StateAborted {
				m.State = StateDashboard
			}

		case "fields":
			newForm, cmd := m.MoulActionForm.Update(msg)
			if f, ok := newForm.(*huh.Form); ok {
				m.MoulActionForm = f
			}
			cmds = append(cmds, cmd)

			if m.MoulActionForm.State == huh.StateCompleted {
				switch m.newMoulAction {
				case "add":
					m.isEditingField = false
					m.initMoulFieldForm()
					m.moulWizardState = "add_field"
					cmds = append(cmds, m.MoulFieldForm.Init())
				case "edit":
					m.initMoulFieldSelectForm()
					m.moulWizardState = "edit_select"
					cmds = append(cmds, m.MoulFieldSelectForm.Init())
				case "delete":
					m.initMoulFieldDeleteForm()
					m.moulWizardState = "delete_select"
					cmds = append(cmds, m.MoulFieldDeleteForm.Init())
				case "rules":
					m.initMoulRulesForm()
					m.moulWizardState = "rules"
					cmds = append(cmds, m.MoulRulesForm.Init())
				case "save":
					return m, m.saveMoulForm()
				case "cancel":
					m.State = StateDashboard
				}
			} else if m.MoulActionForm.State == huh.StateAborted {
				m.State = StateDashboard
			}

		case "add_field":
			newForm, cmd := m.MoulFieldForm.Update(msg)
			if f, ok := newForm.(*huh.Form); ok {
				m.MoulFieldForm = f
			}
			cmds = append(cmds, cmd)

			if m.MoulFieldForm.State == huh.StateCompleted {
				newField := schema.MoulField{
					Name: strings.TrimSpace(m.newFieldName),
					Type: m.newFieldType,
				}
				if m.newFieldType == "relation" {
					newField.RelationConfig = &schema.RelationConfig{
						TargetMoul:  m.newFieldRelationTarget,
						Cardinality: m.newFieldRelationCard,
					}
				}

				if m.isEditingField {
					for i := range m.newMoulFieldsList {
						if m.newMoulFieldsList[i].Name == m.editingFieldName {
							m.newMoulFieldsList[i] = newField
							break
						}
					}
				} else {
					m.newMoulFieldsList = append(m.newMoulFieldsList, newField)
				}

				m.isEditingField = false
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			} else if m.MoulFieldForm.State == huh.StateAborted {
				m.isEditingField = false
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			}

		case "edit_select":
			newForm, cmd := m.MoulFieldSelectForm.Update(msg)
			if f, ok := newForm.(*huh.Form); ok {
				m.MoulFieldSelectForm = f
			}
			cmds = append(cmds, cmd)

			if m.MoulFieldSelectForm.State == huh.StateCompleted {
				m.isEditingField = true
				m.editingFieldName = m.fieldToEdit
				m.initMoulFieldForm()
				m.moulWizardState = "add_field"
				cmds = append(cmds, m.MoulFieldForm.Init())
			} else if m.MoulFieldSelectForm.State == huh.StateAborted {
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			}

		case "delete_select":
			newForm, cmd := m.MoulFieldDeleteForm.Update(msg)
			if f, ok := newForm.(*huh.Form); ok {
				m.MoulFieldDeleteForm = f
			}
			cmds = append(cmds, cmd)

			if m.MoulFieldDeleteForm.State == huh.StateCompleted {
				var filtered []schema.MoulField
				for _, f := range m.newMoulFieldsList {
					if f.Name != m.fieldToDelete {
						filtered = append(filtered, f)
					}
				}
				m.newMoulFieldsList = filtered

				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			} else if m.MoulFieldDeleteForm.State == huh.StateAborted {
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			}

		case "rules":
			newForm, cmd := m.MoulRulesForm.Update(msg)
			if f, ok := newForm.(*huh.Form); ok {
				m.MoulRulesForm = f
			}
			cmds = append(cmds, cmd)

			if m.MoulRulesForm.State == huh.StateCompleted {
				return m, m.saveMoulForm()
			} else if m.MoulRulesForm.State == huh.StateAborted {
				m.initMoulActionForm()
				m.moulWizardState = "fields"
				cmds = append(cmds, m.MoulActionForm.Init())
			}
		}

	case StateWorkerMonitor:
		cmd := m.updateWorkerMonitor(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}

	case StateAnalytics:
		cmd := m.updateAnalytics(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}

	case StateSettings:
		fields := m.getSettingsFields()
		numFields := len(fields)

		if kp, ok := msg.(tea.KeyPressMsg); ok {
			keyStr := kp.String()
			switch keyStr {
			case "esc":
				m.State = StateDashboard
				return m, nil
			case "left", "h":
				if m.settingsFocusIndex == 0 {
					m.settingsActiveTab = (m.settingsActiveTab - 1 + 2) % 2
					m.updateSettingsFocus(m.settingsFocusIndex, 0)
					return m, nil
				} else if m.settingsFocusIndex == numFields+2 { // Cancel -> Save
					m.updateSettingsFocus(m.settingsFocusIndex, numFields+1)
					return m, nil
				}
			case "right", "l":
				if m.settingsFocusIndex == 0 {
					m.settingsActiveTab = (m.settingsActiveTab + 1) % 2
					m.updateSettingsFocus(m.settingsFocusIndex, 0)
					return m, nil
				} else if m.settingsFocusIndex == numFields+1 { // Save -> Cancel
					m.updateSettingsFocus(m.settingsFocusIndex, numFields+2)
					return m, nil
				}
			case "up", "k":
				prev := m.settingsFocusIndex
				next := prev - 1
				if next < 0 {
					next = numFields + 2 // wrap to Cancel
				}
				m.updateSettingsFocus(prev, next)
				return m, nil
			case "down", "j":
				prev := m.settingsFocusIndex
				next := prev + 1
				if next > numFields+2 {
					next = 0 // wrap to Tabs
				}
				m.updateSettingsFocus(prev, next)
				return m, nil
			case "tab":
				prev := m.settingsFocusIndex
				next := prev + 1
				if next > numFields+2 {
					next = 0 // wrap to Tabs
				}
				m.updateSettingsFocus(prev, next)
				return m, nil
			case "shift+tab":
				prev := m.settingsFocusIndex
				next := prev - 1
				if next < 0 {
					next = numFields + 2 // wrap to Cancel
				}
				m.updateSettingsFocus(prev, next)
				return m, nil
			case "enter", " ":
				if m.settingsFocusIndex > 0 && m.settingsFocusIndex <= numFields {
					f := fields[m.settingsFocusIndex-1]
					if f.isBool {
						if *f.boolVal == "true" {
							*f.boolVal = "false"
						} else {
							*f.boolVal = "true"
						}
						// If toggled enable state, number of fields changes.
						// Adjust next focus to not exceed new fields limit
						newFields := m.getSettingsFields()
						newNumFields := len(newFields)
						if m.settingsFocusIndex > newNumFields {
							m.updateSettingsFocus(m.settingsFocusIndex, 1)
						}
						return m, nil
					}
				} else if m.settingsFocusIndex == numFields+1 { // Save
					m.saveSettingsForm()
					return m, nil
				} else if m.settingsFocusIndex == numFields+2 { // Cancel
					m.State = StateDashboard
					return m, nil
				}
			}
		}

		// Update inputs if focused
		if m.settingsFocusIndex > 0 && m.settingsFocusIndex <= numFields {
			f := fields[m.settingsFocusIndex-1]
			if !f.isBool {
				var cmd tea.Cmd
				if m.settingsActiveTab == 0 {
					m.storageInputs[f.inputIdx], cmd = m.storageInputs[f.inputIdx].Update(msg)
					*f.strVal = m.storageInputs[f.inputIdx].Value()
				} else {
					m.liteInputs[f.inputIdx], cmd = m.liteInputs[f.inputIdx].Update(msg)
					*f.strVal = m.liteInputs[f.inputIdx].Value()
				}
				if cmd != nil {
					cmds = append(cmds, cmd)
				}
			}
		}
	}

	return m, tea.Batch(cmds...)
}

func (m *Model) renderBreadcrumbs() string {
	var crumbs []string
	crumbs = append(crumbs, "MOUL")

	switch m.State {
	case StateDashboard:
		crumbs = append(crumbs, "Dashboard")
		idx := m.ActiveSidebarIndex
		if idx >= 0 && idx < len(m.Mouls) {
			crumbs = append(crumbs, "Collections", m.Mouls[idx].Name)
		} else if idx == len(m.Mouls) {
			crumbs = append(crumbs, "System", "Background Jobs")
		} else if idx == len(m.Mouls)+1 {
			crumbs = append(crumbs, "System", "Visitor Analytics")
		} else if idx == len(m.Mouls)+2 {
			crumbs = append(crumbs, "System", "Settings")
		}
	case StateRecordList:
		crumbs = append(crumbs, "Collections")
		if moul := m.currentMoul(); moul != nil {
			crumbs = append(crumbs, moul.Name, "Records")
		}
	case StateRecordDetail:
		crumbs = append(crumbs, "Collections")
		if moul := m.currentMoul(); moul != nil {
			crumbs = append(crumbs, moul.Name, "Records", "Detail")
		} else if m.ViewDetail == "job" {
			crumbs = append(crumbs, "System", "Background Jobs", "Job Payload")
		} else if m.ViewDetail == "visit" {
			crumbs = append(crumbs, "System", "Visitor Analytics", "Session Detail")
		}
	case StateRecordEdit:
		crumbs = append(crumbs, "Collections")
		if moul := m.currentMoul(); moul != nil {
			crumbs = append(crumbs, moul.Name, "Records")
			if m.editRecordID != "" {
				crumbs = append(crumbs, "Edit")
			} else {
				crumbs = append(crumbs, "New")
			}
		}
	case StateWorkerMonitor:
		crumbs = append(crumbs, "System", "Background Jobs")
	case StateAnalytics:
		crumbs = append(crumbs, "System", "Visitor Analytics")
	case StateMoulCreate:
		crumbs = append(crumbs, "Collections", "Create Collection")
	case StateSettings:
		crumbs = append(crumbs, "System", "Settings")
	}

	var formatted []string
	for i, crumb := range crumbs {
		if i == len(crumbs)-1 {
			formatted = append(formatted, BreadcrumbActiveStyle.Render(strings.ToUpper(crumb)))
		} else {
			formatted = append(formatted, BreadcrumbInactiveStyle.Render(strings.ToUpper(crumb)))
		}
	}

	separator := BreadcrumbSeparatorStyle.Render(" > ")
	joined := strings.Join(formatted, separator)
	return BreadcrumbsContainerStyle.Width(m.Width).Render("  " + joined)
}

// View compiles and renders the active layout.
func (m *Model) View() tea.View {
	v := tea.NewView("")
	v.AltScreen = true

	if !m.Ready {
		v.SetContent("\n  Initializing moul TUI...")
		return v
	}

	var content string

	switch m.State {
	case StateConnect, StateRootSetup, StateDeviceAuth:
		content = m.viewConnect()
		v.SetContent(content)
		return v
	case StateDashboard:
		content = m.viewDashboard()
	case StateRecordList:
		content = m.viewRecordList()
	case StateRecordDetail:
		content = m.viewRecordDetail()
	case StateRecordEdit:
		content = m.viewRecordEdit()
	case StateWorkerMonitor:
		content = m.viewWorkerMonitor()
	case StateAnalytics:
		content = m.viewAnalytics()
	case StateMoulCreate:
		content = m.viewMoulCreate()
	case StateSettings:
		content = m.viewSettings()
	}

	// Available height for middle content is main height
	contentHeight := m.Height
	if contentHeight < 1 {
		contentHeight = 1
	}

	mainContent := lipgloss.NewStyle().
		Height(contentHeight).
		Width(m.Width).
		Render(content)

	v.SetContent(mainContent)
	return v
}

func (m *Model) recordViewportReady() bool {
	return m.Viewport.Height() > 0
}

func (m *Model) loadSystemData() {
	// Try loading worker jobs and visits
	// Since we are running in Bubble Tea, we can just load them sync or let the screens fetch them.
	// We'll load them when entering the screens.
}

// Helper to check if current moul is auth type
func (m *Model) currentMoul() *schema.Moul {
	idx := m.ActiveSidebarIndex
	if idx >= 0 && idx < len(m.Mouls) {
		return &m.Mouls[idx]
	}
	return nil
}

// Safe string formatter
func formatJSON(data interface{}) string {
	b, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Sprintf("%v", data)
	}
	return string(b)
}

func formatTime(tStr string) string {
	t, err := time.Parse(time.RFC3339, tStr)
	if err != nil {
		return tStr
	}
	return t.Format("2006-01-02 15:04:05")
}

// ── Asynchronous methods for backend operations ──────────────────

func (m *Model) connectCmd() tea.Cmd {
	return func() tea.Msg {
		if m.Client == nil {
			m.Client = NewClient(m.serverURL, m.adminKey)
			if m.authMode == "device_flow" {
				token, _ := GetSecret(m.serverURL, "jwt_token")
				m.Client.Token = token
			}
		} else {
			if m.Client.AdminKey == "" && m.adminKey != "" {
				m.Client.AdminKey = m.adminKey
			}
			if m.Client.Token == "" && m.authMode == "device_flow" {
				token, _ := GetSecret(m.serverURL, "jwt_token")
				m.Client.Token = token
			}
		}

		mouls, err := m.Client.ListMouls()
		return connectResultMsg{mouls: mouls, err: err}
	}
}

func (m *Model) startDeviceFlowCmd() tea.Cmd {
	return func() tea.Msg {
		m.authMode = "device_flow"
		resp, err := m.Client.RequestDeviceCode("moul-tui")
		return deviceFlowStartMsg{resp: resp, err: err}
	}
}

func (m *Model) pollDeviceTokenCmd(delay time.Duration) tea.Cmd {
	return tea.Tick(delay, func(t time.Time) tea.Msg {
		return devicePollTickMsg{}
	})
}

type setupStatusMsg struct {
	needsSetup bool
	err        error
}

func (m *Model) checkSetupStatusCmd() tea.Cmd {
	return func() tea.Msg {
		needsSetup, err := m.Client.CheckSetupStatus()
		return setupStatusMsg{needsSetup: needsSetup, err: err}
	}
}

type setupRootUserResultMsg struct {
	err error
}

func (m *Model) setupRootUserCmd() tea.Cmd {
	return func() tea.Msg {
		err := m.Client.SetupRootUser(m.rootUsername, m.rootEmail, m.rootPassword)
		return setupRootUserResultMsg{err: err}
	}
}

// copyToClipboard copies the given code string to the clipboard.
func copyToClipboard(text string) error {
	return clipboard.WriteAll(text)
}

// openBrowser attempts to open the default web browser.
func openBrowser(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default:
		cmd = "xdg-open"
		args = []string{url}
	}
	return exec.Command(cmd, args...).Start()
}

// ── Asynchronous messages for background loading ─────────────────
type ErrMsg struct{ Err error }
type RecordsMsg struct{ Records []map[string]interface{} }
type JobsMsg struct{ Jobs []map[string]interface{} }
type VisitsMsg struct{ Visits []map[string]interface{} }

type connectResultMsg struct {
	mouls []schema.Moul
	err   error
}

type deviceFlowStartMsg struct {
	resp *DeviceAuthResponse
	err  error
}

type devicePollTickMsg struct{}

type devicePollResultMsg struct {
	token string
	err   error
}

type SettingsMsg struct {
	Settings map[string]string
}

type settingsSavedMsg struct {
	err error
}

