package tui

import (
	"encoding/json"
	"fmt"
	"time"

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
}

// NewModel initializes the TUI model with default values.
func NewModel(serverURLOverride, adminKeyOverride string) *Model {
	cfg, _ := LoadConfig()

	m := &Model{
		State:     StateConnect,
		Config:    cfg,
		serverURL: cfg.ServerURL,
		adminKey:  cfg.AdminKey,
	}

	if serverURLOverride != "" {
		m.serverURL = serverURLOverride
	}
	if adminKeyOverride != "" {
		m.adminKey = adminKeyOverride
	}

	m.initConnectionForm()
	return m
}

// Init initializes the Bubble Tea program.
func (m *Model) Init() tea.Cmd {
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

	case tea.KeyMsg:
		// Global exit on Ctrl+C (unless editing inside a text input, but global Ctrl+C is generally safe)
		if msg.Type == tea.KeyCtrlC {
			return m, tea.Quit
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

			// Try to connect & fetch collections
			mouls, err := m.Client.ListMouls()
			if err != nil {
				m.Err = err
				// Reset form to active to let user retry
				m.ConnForm.State = huh.StateNormal
			} else {
				m.Mouls = mouls
				m.State = StateDashboard
				// Save config
				m.Config.ServerURL = m.serverURL
				m.Config.AdminKey = m.adminKey
				_ = SaveConfig(m.Config)

				// Fetch initial background jobs / visits asynchronously
				// for system screens
				m.loadSystemData()
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
	case StateConnect:
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

// ── Asynchronous messages for background loading ─────────────────
type ErrMsg struct{ Err error }
type RecordsMsg struct{ Records []map[string]interface{} }
type JobsMsg struct{ Jobs []map[string]interface{} }
type VisitsMsg struct{ Visits []map[string]interface{} }

