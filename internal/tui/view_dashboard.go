package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

// updateDashboard handles navigation within the sidebar.
func (m *Model) updateDashboard(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		// Clear notifications on key press
		m.SuccessMsg = ""
		m.Err = nil

		switch msg.String() {
		case "up", "k":
			if m.ActiveSidebarIndex > 0 {
				m.ActiveSidebarIndex--
			} else {
				m.ActiveSidebarIndex = len(m.Mouls) + 2 // wrap to bottom
			}
		case "down", "j":
			totalItems := len(m.Mouls) + 3
			if m.ActiveSidebarIndex < totalItems-1 {
				m.ActiveSidebarIndex++
			} else {
				m.ActiveSidebarIndex = 0 // wrap to top
			}
		case "enter", "right", "l":
			return m.selectSidebarItem()
		case "esc":
			m.State = StateConnect
			m.initConnectionForm()
		case "n":
			m.State = StateMoulCreate
			m.initMoulForm()
			return m.MoulForm.Init()
		case "r":
			// Refresh moul schemas
			return func() tea.Msg {
				mouls, err := m.Client.ListMouls()
				if err != nil {
					return ErrMsg{err}
				}
				return moulsMsg{mouls}
			}
		}
	case moulsMsg:
		m.Mouls = msg.mouls
	}
	return nil
}

type moulsMsg struct {
	mouls []schema.Moul
}

// selectSidebarItem navigates to the selected menu view.
func (m *Model) selectSidebarItem() tea.Cmd {
	idx := m.ActiveSidebarIndex
	if idx >= 0 && idx < len(m.Mouls) {
		m.State = StateRecordList
		m.SelectedRecordIndex = 0
		m.collectionActiveTab = 0
		return m.fetchRecords()
	} else if idx == len(m.Mouls) {
		m.State = StateWorkerMonitor
		m.SelectedJobIndex = 0
		return m.fetchJobs()
	} else if idx == len(m.Mouls)+1 {
		m.State = StateAnalytics
		m.SelectedVisitIndex = 0
		return m.fetchVisits()
	} else if idx == len(m.Mouls)+2 {
		return m.fetchSettings()
	}
	return nil
}

// viewDashboard renders the sidebar + right panel layout.
func (m *Model) viewDashboard() string {
	sidebarWidth := 28
	rightWidth := m.Width - sidebarWidth - 2
	rightHeight := m.Height - 2

	if rightWidth < 10 {
		rightWidth = 10
	}
	if rightHeight < 5 {
		rightHeight = 5
	}

	sidebar := m.renderSidebar(sidebarWidth)
	var rightContent string

	idx := m.ActiveSidebarIndex
	if idx >= 0 && idx < len(m.Mouls) {
		rightContent = m.viewDashboardMoulInfo(idx, rightWidth)
	} else if idx == len(m.Mouls) {
		rightContent = m.viewDashboardWorkerInfo(rightWidth)
	} else if idx == len(m.Mouls)+1 {
		rightContent = m.viewDashboardAnalyticsInfo(rightWidth)
	} else if idx == len(m.Mouls)+2 {
		rightContent = m.viewDashboardSettingsInfo(rightWidth)
	}

	var banner string
	if m.SuccessMsg != "" {
		banner = AlertSuccessStyle.Render(m.SuccessMsg) + "\n\n"
	} else if m.Err != nil {
		banner = AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)) + "\n\n"
	}

	if banner != "" {
		rightContent = banner + rightContent
	}

	rightPanel := lipgloss.NewStyle().
		Width(rightWidth).
		Height(rightHeight).
		Render(rightContent)

	return lipgloss.JoinHorizontal(lipgloss.Top, sidebar, rightPanel)
}

func (m *Model) renderSidebar(width int) string {
	var s strings.Builder
	s.WriteString(SidebarTitleStyle.Render("MOUL CONSOLE"))
	s.WriteString("\n\n")

	s.WriteString(SidebarHeaderStyle.Render("COLLECTIONS"))
	s.WriteString("\n")
	for i, moul := range m.Mouls {
		icon := "📁"
		switch moul.Type {
		case "auth":
			icon = "🔑"
		case "worker":
			icon = "⚙️"
		case "analytic":
			icon = "📊"
		}

		line := fmt.Sprintf(" %s %s", icon, moul.Name)
		if m.ActiveSidebarIndex == i {
			s.WriteString(SidebarItemActiveStyle.Width(width - 2).Render(line))
		} else {
			s.WriteString(SidebarItemInactiveStyle.Render(line))
		}
		s.WriteString("\n")
	}

	s.WriteString("\n")
	s.WriteString(SidebarHeaderStyle.Render("SYSTEM"))
	s.WriteString("\n")

	// Worker Queue
	workerIdx := len(m.Mouls)
	workerLine := " ⚙️ Background Jobs"
	if m.ActiveSidebarIndex == workerIdx {
		s.WriteString(SidebarItemActiveStyle.Width(width - 2).Render(workerLine))
	} else {
		s.WriteString(SidebarItemInactiveStyle.Render(workerLine))
	}
	s.WriteString("\n")

	// Analytics
	analyticsIdx := len(m.Mouls) + 1
	analyticsLine := " 📊 Visitor Analytics"
	if m.ActiveSidebarIndex == analyticsIdx {
		s.WriteString(SidebarItemActiveStyle.Width(width - 2).Render(analyticsLine))
	} else {
		s.WriteString(SidebarItemInactiveStyle.Render(analyticsLine))
	}
	s.WriteString("\n")
 
	// Settings
	settingsIdx := len(m.Mouls) + 2
	settingsLine := " ⚙️ Settings"
	if m.ActiveSidebarIndex == settingsIdx {
		s.WriteString(SidebarItemActiveStyle.Width(width - 2).Render(settingsLine))
	} else {
		s.WriteString(SidebarItemInactiveStyle.Render(settingsLine))
	}
	s.WriteString("\n")

	// Add hotkey hints at the bottom of the sidebar
	s.WriteString("\n")
	s.WriteString(HelpStyle.Render(" n      New collection\n r      Refresh schemas\n Esc    Disconnect\n ctrl+c Quit"))

	return SidebarStyle.Width(width).Height(m.Height - 2).Render(s.String())
}

func (m *Model) viewDashboardMoulInfo(idx int, width int) string {
	moul := m.Mouls[idx]

	var fieldsList strings.Builder
	for _, f := range moul.Fields {
		fieldsList.WriteString(fmt.Sprintf("  • %-16s %s\n", f.Name, lipgloss.NewStyle().Foreground(ColorTextMuted).Render(fmt.Sprintf("[%s]", f.Type))))
	}
	if len(moul.Fields) == 0 {
		fieldsList.WriteString("  No custom fields defined.\n")
	}

	// Format rules nicely
	rules := moul.Rules
	rulesStr := fmt.Sprintf("  • List Rule:   %s\n  • View Rule:   %s\n  • Create Rule: %s\n  • Update Rule: %s\n  • Delete Rule: %s\n",
		formatRule(rules.ListRule), formatRule(rules.ViewRule), formatRule(rules.CreateRule), formatRule(rules.UpdateRule), formatRule(rules.DeleteRule))

	moulTypeDesc := "Standard collection"
	switch moul.Type {
	case "auth":
		moulTypeDesc = "Auth collection with Bcrypt password hashing & JWT token issuing"
	case "worker":
		moulTypeDesc = "Background worker queue job storage"
	case "analytic":
		moulTypeDesc = "Analytics and visit sessions tracking table"
	}

	content := fmt.Sprintf(
		"%s\n%s\n\n%s\n%s\n\n%s\n%s\n\n%s\n%s\n\n%s",
		HeaderStyle.Render(fmt.Sprintf("Collection: %s", moul.Name)),
		SubtitleStyle.Render(fmt.Sprintf("Type: %s (%s)", moul.Type, moulTypeDesc)),
		FormLabelStyle.Render("FIELDS SCHEMA"),
		fieldsList.String(),
		FormLabelStyle.Render("ACCESS RULES"),
		rulesStr,
		FormLabelStyle.Render("METADATA"),
		fmt.Sprintf("  • ID:          %s\n  • Created At:  %s\n  • Updated At:  %s\n", moul.ID, formatTime(moul.CreatedAt), formatTime(moul.UpdatedAt)),
		lipgloss.NewStyle().Foreground(ColorCyanLight).Bold(true).Render("Press [Enter] or [l] to view and manage records.\nPress [n] to create a new collection."),
	)

	return ContentStyle.Width(width).Render(content)
}

func formatRule(rule string) string {
	if rule == "" {
		return lipgloss.NewStyle().Foreground(ColorGreen).Render("Public Access (empty)")
	}
	return lipgloss.NewStyle().Foreground(ColorIndigoLight).Render(rule)
}

func (m *Model) viewDashboardWorkerInfo(width int) string {
	content := fmt.Sprintf(
		"%s\n%s\n\n%s\n%s\n\n%s",
		HeaderStyle.Render("System: Background Workers Monitor"),
		SubtitleStyle.Render("Oban-inspired SQLite job processing engine"),
		FormLabelStyle.Render("DESCRIPTION"),
		"  Monitor tasks enqueued, currently executing, scheduled, retryable,\n  discarded, or completed on the background workers engine.\n\n  You can inspect worker payload parameters, stack trace errors, priority\n  queues, and force retry discarded jobs.",
		lipgloss.NewStyle().Foreground(ColorCyanLight).Bold(true).Render("Press [Enter] or [l] to open the Background Jobs manager."),
	)
	return ContentStyle.Width(width).Render(content)
}

func (m *Model) viewDashboardAnalyticsInfo(width int) string {
	content := fmt.Sprintf(
		"%s\n%s\n\n%s\n%s\n\n%s",
		HeaderStyle.Render("System: Visitor Analytics Console"),
		SubtitleStyle.Render("First-party user sessions and tracking engine"),
		FormLabelStyle.Render("DESCRIPTION"),
		"  Browse visits and user session histories tracked on this server.\n\n  The system automatically extracts operating systems, client browsers, IP\n  addresses, referrer domains, and UTM campaign parameters from events\n  posted to analytic collections.",
		lipgloss.NewStyle().Foreground(ColorCyanLight).Bold(true).Render("Press [Enter] or [l] to open the Analytics session inspector."),
	)
	return ContentStyle.Width(width).Render(content)
}

// Commands for async REST requests
func (m *Model) fetchRecords() tea.Cmd {
	return func() tea.Msg {
		moul := m.currentMoul()
		if moul == nil {
			return nil
		}
		var expandList []string
		for _, field := range moul.Fields {
			if field.Type == "relation" {
				expandList = append(expandList, field.Name)
			}
		}
		records, err := m.Client.ListRecords(moul.Name, expandList...)
		if err != nil {
			return ErrMsg{err}
		}
		return RecordsMsg{records}
	}
}

func (m *Model) fetchJobs() tea.Cmd {
	return func() tea.Msg {
		// Find a worker moul in our collections, or if none, try 'background_tasks'
		workerMoul := ""
		for _, moul := range m.Mouls {
			if moul.Type == "worker" {
				workerMoul = moul.Name
				break
			}
		}
		if workerMoul == "" {
			workerMoul = "background_tasks" // default fallback
		}

		jobs, err := m.Client.ListRecords(workerMoul)
		if err != nil {
			// If moul doesn't exist, return empty list rather than error out
			return JobsMsg{make([]map[string]interface{}, 0)}
		}
		return JobsMsg{jobs}
	}
}

func (m *Model) fetchVisits() tea.Cmd {
	return func() tea.Msg {
		// Visits requires JWT token. Let's make sure we have one.
		// If we don't have one, we can prompt or try to auto-login.
		// For now, let's execute the request, if it returns 401,
		// we'll display the authentication requirement in the view!
		visits, err := m.Client.ListVisits()
		if err != nil {
			return ErrMsg{err}
		}
		return VisitsMsg{visits}
	}
}

func (m *Model) viewDashboardSettingsInfo(width int) string {
	content := fmt.Sprintf(
		"%s\n%s\n\n%s\n%s\n\n%s",
		HeaderStyle.Render("System: Settings Console"),
		SubtitleStyle.Render("Configure S3 Storage & Litestream Backups"),
		FormLabelStyle.Render("DESCRIPTION"),
		"  Manage system-wide configuration directly in the database settings table.\n\n  Configure AWS S3 (or S3-compatible) buckets for file storage and set up\n  Litestream database replica paths to automatically back up your SQLite DB.",
		lipgloss.NewStyle().Foreground(ColorCyanLight).Bold(true).Render("Press [Enter] or [l] to open the Settings panel."),
	)
	return ContentStyle.Width(width).Render(content)
}

func (m *Model) fetchSettings() tea.Cmd {
	return func() tea.Msg {
		settings, err := m.Client.GetSettings()
		if err != nil {
			return ErrMsg{err}
		}
		return SettingsMsg{Settings: settings}
	}
}
