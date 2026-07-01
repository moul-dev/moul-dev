package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

func (m *Model) initAnalyticsLoginForm() {
	if m.analyticsMoul == "" {
		m.analyticsMoul = "users"
	}

	m.AnalyticsLoginForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Authentication Moul").
				Placeholder("users").
				Value(&m.analyticsMoul).
				Validate(func(s string) error {
					if strings.TrimSpace(s) == "" {
						return fmt.Errorf("auth moul is required")
					}
					return nil
				}),
			huh.NewInput().
				Title("Email / Username").
				Placeholder("admin@example.com").
				Value(&m.analyticsEmail).
				Validate(func(s string) error {
					if strings.TrimSpace(s) == "" {
						return fmt.Errorf("email or username is required")
					}
					return nil
				}),
			huh.NewInput().
				Title("Password").
				Value(&m.analyticsPassword).
				EchoMode(huh.EchoModePassword).
				Validate(func(s string) error {
					if strings.TrimSpace(s) == "" {
						return fmt.Errorf("password is required")
					}
					return nil
				}),
		),
	).WithTheme(ThemeCustom)
}

// updateAnalytics handles the interaction loop in the analytics tab.
func (m *Model) updateAnalytics(msg tea.Msg) tea.Cmd {
	// 1. If connection token is empty and form is active, handle form inputs
	if m.Client.Token == "" && m.AnalyticsLoginForm != nil && m.AnalyticsLoginForm.State == huh.StateNormal {
		newForm, cmd := m.AnalyticsLoginForm.Update(msg)
		if f, ok := newForm.(*huh.Form); ok {
			m.AnalyticsLoginForm = f
		}

		if m.AnalyticsLoginForm.State == huh.StateCompleted {
			m.analyticsAuthError = nil
			return func() tea.Msg {
				token, err := m.Client.Login(m.analyticsMoul, m.analyticsEmail, m.analyticsPassword)
				if err != nil {
					return analyticsAuthResultMsg{err: err}
				}
				// Save token in our config or memory
				m.Client.Token = token
				// Fetch visits now that we are authenticated
				visits, err := m.Client.ListVisits()
				if err != nil {
					return analyticsAuthResultMsg{err: err}
				}
				return analyticsAuthResultMsg{visits: visits}
			}
		}
		return cmd
	}

	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		m.SuccessMsg = ""
		m.Err = nil

		switch msg.String() {
		case "up", "k":
			if m.SelectedVisitIndex > 0 {
				m.SelectedVisitIndex--
			}
		case "down", "j":
			if m.SelectedVisitIndex < len(m.Visits)-1 {
				m.SelectedVisitIndex++
			}
		case "enter", "v":
			// Open visit detail
			if len(m.Visits) > 0 && m.SelectedVisitIndex >= 0 && m.SelectedVisitIndex < len(m.Visits) {
				visit := m.Visits[m.SelectedVisitIndex]
				jsonStr := formatJSON(visit)
				m.Viewport.SetContent(jsonStr)
				m.Viewport.SetYOffset(0)
				m.State = StateRecordDetail
				m.ViewDetail = "visit"
			}
		case "l":
			if m.Client.Token == "" {
				m.initAnalyticsLoginForm()
				return m.AnalyticsLoginForm.Init()
			}
		case "f":
			// Refresh
			if m.Client.Token != "" {
				return m.fetchVisits()
			}
		case "esc", "left", "h":
			m.State = StateDashboard
			m.Visits = nil
			m.SelectedVisitIndex = 0
			m.AnalyticsLoginForm = nil
		}

	case analyticsAuthResultMsg:
		if msg.err != nil {
			m.analyticsAuthError = msg.err
			// Re-enable form so user can try again
			if m.AnalyticsLoginForm != nil {
				m.AnalyticsLoginForm.State = huh.StateNormal
			}
		} else {
			m.Visits = msg.visits
			m.AnalyticsLoginForm = nil // hide form
			m.analyticsAuthError = nil
		}
	}

	return nil
}

type analyticsAuthResultMsg struct {
	visits []map[string]interface{}
	err    error
}

// viewAnalytics renders the analytics dashboard or login prompt.
func (m *Model) viewAnalytics() string {
	var s strings.Builder
	s.WriteString(HeaderStyle.Render("System Dashboard: Visitor Analytics Console"))
	s.WriteString("\n")

	// 1. Show login form if active
	if m.Client.Token == "" && m.AnalyticsLoginForm != nil {
		s.WriteString(FormLabelStyle.Render("USER AUTHENTICATION REQUIRED"))
		s.WriteString("\n")
		if m.analyticsAuthError != nil {
			s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Login Failed: %v", m.analyticsAuthError)))
			s.WriteString("\n")
		}

		formContainer := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Padding(1, 2).
			Width(60)

		s.WriteString(formContainer.Render(m.AnalyticsLoginForm.View()))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// 2. Show prompt if not authenticated
	if m.Client.Token == "" {
		s.WriteString(AlertInfoStyle.Render("Access Restricted"))
		s.WriteString("\n\n")
		s.WriteString("  The visitor visits log contains sensitive geo-resolved logs and\n")
		s.WriteString("  requires a standard user account JWT token to access.\n\n")
		s.WriteString("  Please press [l] to enter credentials and log in as a user.\n")
		s.WriteString("\n\n")
		s.WriteString(HelpStyle.Render(" [l] Log In  [Esc] Back"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// 3. Show visits if authenticated
	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n")
	}

	if len(m.Visits) == 0 {
		s.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  No visits recorded yet.\n"))
		s.WriteString("\n")
		s.WriteString(HelpStyle.Render(" [f] Refresh  [Esc] Back"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// Headers
	headers := []string{"ID", "IP", "OS", "BROWSER", "REFERRER", "STARTED_AT"}

	// Draw table header
	var headerLine strings.Builder
	for _, h := range headers {
		width := 14
		if h == "ID" {
			width = 24
		} else if h == "REFERRER" {
			width = 20
		} else if h == "STARTED_AT" {
			width = 22
		}
		headerLine.WriteString(fmt.Sprintf("%-*s", width, strings.ToUpper(h)))
	}
	s.WriteString(TableHeaderStyle.Render(headerLine.String()))
	s.WriteString("\n")

	// Calculate window/scrolling logic
	maxRows := m.Height - 11
	if maxRows < 3 {
		maxRows = 3
	}

	startIndex := 0
	if m.SelectedVisitIndex >= maxRows {
		startIndex = m.SelectedVisitIndex - maxRows + 1
	}
	endIndex := startIndex + maxRows
	if endIndex > len(m.Visits) {
		endIndex = len(m.Visits)
	}

	visibleVisits := m.Visits[startIndex:endIndex]

	// Draw rows
	for i, v := range visibleVisits {
		rIdx := startIndex + i
		var rowLine strings.Builder
		for _, h := range headers {
			valStr := ""
			switch h {
			case "ID":
				valStr, _ = v["id"].(string)
			case "IP":
				valStr, _ = v["ip"].(string)
			case "OS":
				valStr, _ = v["os"].(string)
			case "BROWSER":
				valStr, _ = v["browser"].(string)
			case "REFERRER":
				valStr, _ = v["referring_domain"].(string)
			case "STARTED_AT":
				tStr, _ := v["started_at"].(string)
				valStr = formatTime(tStr)
			}

			width := 14
			if h == "ID" {
				width = 24
			} else if h == "REFERRER" {
				width = 20
			} else if h == "STARTED_AT" {
				width = 22
			}
			// Truncate cell content
			if len(valStr) > width-2 {
				valStr = valStr[:width-5] + "..."
			}
			rowLine.WriteString(fmt.Sprintf("%-*s", width, valStr))
		}

		line := rowLine.String()
		if rIdx == m.SelectedVisitIndex {
			s.WriteString(TableCellSelectedStyle.Width(m.Width - 10).Render(line))
		} else {
			s.WriteString(TableCellStyle.Render(line))
		}
		s.WriteString("\n")
	}

	s.WriteString("\n")
	s.WriteString(HelpStyle.Render(" ↑/↓: Scroll  [v/Enter] Detail payload  [f] Refresh  [Esc] Back"))

	return ContentStyle.Width(m.Width).Render(s.String())
}
