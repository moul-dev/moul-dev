package tui

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/atotto/clipboard"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/moul-dev/moul-dev/internal/schema"
)

type AppState int

const (
	StateConnect AppState = iota
	StateDashboard
	StateRecordList
	StateRecordDetail
	StateRecordEdit
	StateWorkerMonitor
	StateAnalytics
	StateDeviceAuth
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
	RecordForm         *huh.Form
	AnalyticsLoginForm *huh.Form

	// Analytics Login Data
	analyticsEmail     string
	analyticsPassword  string
	analyticsMoul      string
	analyticsAuthError error

	// Temporary data
	serverURL      string
	adminKey       string
	editRecordID   string
	recordFormData map[string]*string

	// Device Auth Data
	authMode        string
	deviceCode      string
	userCode        string
	verificationURI string
	pollInterval    int
	pollExpiry      time.Time
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
	if m.authMode == "admin_key" {
		adminKey, _ := GetSecret(m.serverURL, "admin_key")
		m.adminKey = adminKey
	}

	if adminKeyOverride != "" {
		m.adminKey = adminKeyOverride
		m.authMode = "admin_key"
	}

	m.initConnectionForm()
	return m
}

// Init initializes the Bubble Tea program.
func (m *Model) Init() tea.Cmd {
	// Attempt auto-connection if credentials exist
	if m.serverURL != "" {
		if m.authMode == "admin_key" && m.adminKey != "" {
			return m.connectCmd()
		} else if m.authMode == "device_flow" {
			token, _ := GetSecret(m.serverURL, "jwt_token")
			if token != "" {
				return m.connectCmd()
			}
		}
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
			m.Viewport = viewport.New(m.Width-32, vHeight)
		} else {
			m.Viewport.Width = m.Width - 32
			m.Viewport.Height = vHeight
		}

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

	case tea.KeyMsg:
		// Global exit on Ctrl+C (unless editing inside a text input, but global Ctrl+C is generally safe)
		if msg.Type == tea.KeyCtrlC {
			return m, tea.Quit
		}

		if m.State == StateDeviceAuth && msg.Type == tea.KeyEsc {
			m.State = StateConnect
			m.ConnForm.State = huh.StateNormal
			m.Err = fmt.Errorf("authorization cancelled")
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
			if m.authMode == "admin_key" {
				m.Client = NewClient(m.serverURL, m.adminKey)
				_ = SetSecret(m.serverURL, "admin_key", m.adminKey)
				return m, m.connectCmd()
			} else {
				m.Client = NewClient(m.serverURL, "")
				return m, m.startDeviceFlowCmd()
			}
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
	}

	return m, tea.Batch(cmds...)
}

// View compiles and renders the active layout.
func (m *Model) View() string {
	if !m.Ready {
		return "\n  Initializing moul TUI..."
	}

	var content string

	switch m.State {
	case StateConnect, StateDeviceAuth:
		content = m.viewConnect()
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
	}

	return MainContainerStyle.Width(m.Width).Height(m.Height).Render(content)
}

func (m *Model) recordViewportReady() bool {
	return m.Viewport.Height > 0
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
		} else if m.Client.AdminKey == "" && m.authMode == "admin_key" {
			m.Client.AdminKey = m.adminKey
		} else if m.Client.Token == "" && m.authMode == "device_flow" {
			token, _ := GetSecret(m.serverURL, "jwt_token")
			m.Client.Token = token
		}

		mouls, err := m.Client.ListMouls()
		return connectResultMsg{mouls: mouls, err: err}
	}
}

func (m *Model) startDeviceFlowCmd() tea.Cmd {
	return func() tea.Msg {
		resp, err := m.Client.RequestDeviceCode("moul-tui")
		return deviceFlowStartMsg{resp: resp, err: err}
	}
}

func (m *Model) pollDeviceTokenCmd(delay time.Duration) tea.Cmd {
	return tea.Tick(delay, func(t time.Time) tea.Msg {
		return devicePollTickMsg{}
	})
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

