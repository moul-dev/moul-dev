package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

// Commands for async REST requests
func (m *Model) fetchEmailTemplatesCmd() tea.Cmd {
	return func() tea.Msg {
		moul := m.currentMoul()
		if moul == nil {
			return nil
		}
		templates, err := m.Client.GetEmailTemplates(moul.Name)
		if err != nil {
			return ErrMsg{err}
		}
		return EmailTemplatesMsg{Templates: templates}
	}
}

// saveEmailTemplateForm compiles form values and saves them on the server.
func (m *Model) saveEmailTemplateForm() tea.Cmd {
	moul := m.currentMoul()
	if moul == nil || m.emailTemplates == nil {
		m.State = StateRecordList
		return nil
	}

	switch m.selectedTemplateIndex {
	case 0:
		m.emailTemplates.Verification.Subject = m.tempSubject
		m.emailTemplates.Verification.Body = m.tempBody
	case 1:
		m.emailTemplates.PasswordReset.Subject = m.tempSubject
		m.emailTemplates.PasswordReset.Body = m.tempBody
	case 2:
		m.emailTemplates.ConfirmEmailChange.Subject = m.tempSubject
		m.emailTemplates.ConfirmEmailChange.Body = m.tempBody
	case 3:
		m.emailTemplates.OTP.Subject = m.tempSubject
		m.emailTemplates.OTP.Body = m.tempBody
	case 4:
		m.emailTemplates.LoginAlert.Subject = m.tempSubject
		m.emailTemplates.LoginAlert.Body = m.tempBody
	}

	return func() tea.Msg {
		_, err := m.Client.UpdateEmailTemplates(moul.Name, m.emailTemplates)
		return emailTemplatesSavedMsg{err: err}
	}
}

func (m *Model) sendTestEmailCmd() tea.Cmd {
	moul := m.currentMoul()
	if moul == nil || m.testEmailRecipient == "" {
		m.State = StateRecordList
		return nil
	}

	var templateKey string
	switch m.selectedTemplateIndex {
	case 0:
		templateKey = "verification"
	case 1:
		templateKey = "password_reset"
	case 2:
		templateKey = "confirm_email_change"
	case 3:
		templateKey = "otp"
	case 4:
		templateKey = "login_alert"
	}

	return func() tea.Msg {
		msg, err := m.Client.SendTestEmail(moul.Name, m.testEmailRecipient, templateKey)
		return testEmailSentMsg{msg: msg, err: err}
	}
}

func (m *Model) initEmailTemplateForm() {
	if m.emailTemplates == nil {
		return
	}

	switch m.selectedTemplateIndex {
	case 0:
		m.tempSubject = m.emailTemplates.Verification.Subject
		m.tempBody = m.emailTemplates.Verification.Body
	case 1:
		m.tempSubject = m.emailTemplates.PasswordReset.Subject
		m.tempBody = m.emailTemplates.PasswordReset.Body
	case 2:
		m.tempSubject = m.emailTemplates.ConfirmEmailChange.Subject
		m.tempBody = m.emailTemplates.ConfirmEmailChange.Body
	case 3:
		m.tempSubject = m.emailTemplates.OTP.Subject
		m.tempBody = m.emailTemplates.OTP.Body
	case 4:
		m.tempSubject = m.emailTemplates.LoginAlert.Subject
		m.tempBody = m.emailTemplates.LoginAlert.Body
	}

	m.EmailTemplateForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Subject").
				Value(&m.tempSubject),
			huh.NewText().
				Title("Body").
				Value(&m.tempBody).
				Lines(12),
		),
	).WithTheme(ThemeCustom)
}

func (m *Model) initTestEmailForm() {
	m.testEmailRecipient = ""
	m.TestEmailForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Recipient Email Address").
				Value(&m.testEmailRecipient),
		),
	).WithTheme(ThemeCustom)
}

func (m *Model) updateEmailTemplatesTab(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		m.SuccessMsg = ""
		m.Err = nil

		switch msg.String() {
		case "tab":
			m.collectionActiveTab = 0
			return m.fetchRecords()
		case "up", "k":
			if m.selectedTemplateIndex > 0 {
				m.selectedTemplateIndex--
			}
		case "down", "j":
			if m.selectedTemplateIndex < 4 {
				m.selectedTemplateIndex++
			}
		case "e":
			m.initEmailTemplateForm()
			m.State = StateEmailTemplateEdit
			return m.EmailTemplateForm.Init()
		case "t":
			m.initTestEmailForm()
			m.State = StateTestEmailSend
			return m.TestEmailForm.Init()
		case "esc", "left", "h":
			m.State = StateDashboard
			m.collectionActiveTab = 0
			m.SelectedRecordIndex = 0
		}
	}
	return nil
}

func (m *Model) viewEmailTemplates() string {
	moul := m.currentMoul()
	if moul == nil {
		return "No active collection selected."
	}

	var s strings.Builder

	// Draw tabs
	var tabs []string
	tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  RECORDS  "))
	tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ EMAIL TEMPLATES ◀"))
	s.WriteString("  " + lipgloss.JoinHorizontal(lipgloss.Top, tabs...) + "\n\n")

	if m.SuccessMsg != "" {
		s.WriteString(AlertSuccessStyle.Render(m.SuccessMsg))
		s.WriteString("\n")
	}
	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n")
	}

	if m.emailTemplates == nil {
		s.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  Loading email templates...\n"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// Layout: Left (list of 5 templates), Right (Selected template preview)
	leftWidth := 30
	rightWidth := m.Width - leftWidth - 6
	if rightWidth < 10 {
		rightWidth = 10
	}

	var leftSide strings.Builder
	templateNames := []string{
		"Verification",
		"Password Reset",
		"Confirm Email Change",
		"OTP",
		"Login Alert",
	}

	leftSide.WriteString(lipgloss.NewStyle().Bold(true).Foreground(ColorIndigoLight).Render("TEMPLATES") + "\n\n")
	for i, name := range templateNames {
		icon := "✉️"
		if i == m.selectedTemplateIndex {
			line := fmt.Sprintf(" %s %s ", icon, name)
			leftSide.WriteString(lipgloss.NewStyle().Bold(true).Foreground(ColorTextLight).Background(ColorSelectionBg).Width(leftWidth - 2).Render(line) + "\n")
		} else {
			line := fmt.Sprintf("   %s", name)
			leftSide.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render(line) + "\n")
		}
		leftSide.WriteString("\n")
	}

	var rightSide strings.Builder
	var currentSubject, currentBody string
	switch m.selectedTemplateIndex {
	case 0:
		currentSubject = m.emailTemplates.Verification.Subject
		currentBody = m.emailTemplates.Verification.Body
	case 1:
		currentSubject = m.emailTemplates.PasswordReset.Subject
		currentBody = m.emailTemplates.PasswordReset.Body
	case 2:
		currentSubject = m.emailTemplates.ConfirmEmailChange.Subject
		currentBody = m.emailTemplates.ConfirmEmailChange.Body
	case 3:
		currentSubject = m.emailTemplates.OTP.Subject
		currentBody = m.emailTemplates.OTP.Body
	case 4:
		currentSubject = m.emailTemplates.LoginAlert.Subject
		currentBody = m.emailTemplates.LoginAlert.Body
	}

	rightSide.WriteString(lipgloss.NewStyle().Bold(true).Foreground(ColorCyanLight).Render("TEMPLATE PREVIEW") + "\n\n")
	rightSide.WriteString(lipgloss.NewStyle().Bold(true).Foreground(ColorTextLight).Render("Subject: ") + lipgloss.NewStyle().Foreground(ColorTextLight).Render(currentSubject) + "\n\n")

	bodyHeight := m.Height - 15
	if bodyHeight < 5 {
		bodyHeight = 5
	}
	bodyBox := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1).
		Width(rightWidth - 2).
		Height(bodyHeight).
		Render(currentBody)
	rightSide.WriteString(bodyBox)

	// Combine Left and Right
	leftPane := lipgloss.NewStyle().Width(leftWidth).Render(leftSide.String())
	rightPane := lipgloss.NewStyle().Width(rightWidth).Render(rightSide.String())

	combined := lipgloss.JoinHorizontal(lipgloss.Top, leftPane, "  ", rightPane)
	s.WriteString(combined + "\n\n")

	s.WriteString(HelpStyle.Render("  Tab: Switch to Records  |  ↑/↓: Select Template  |  [e] Edit Template  |  [t] Send Test Email  |  [Esc] Back"))

	return ContentStyle.Width(m.Width).Render(s.String())
}

func (m *Model) viewEmailTemplateEdit() string {
	moul := m.currentMoul()
	if moul == nil {
		return "No active collection selected."
	}

	var templateName string
	switch m.selectedTemplateIndex {
	case 0:
		templateName = "Verification"
	case 1:
		templateName = "Password Reset"
	case 2:
		templateName = "Confirm Email Change"
	case 3:
		templateName = "OTP"
	case 4:
		templateName = "Login Alert"
	}

	var s strings.Builder
	s.WriteString(HeaderStyle.Render(fmt.Sprintf("Edit Email Template: %s - %s", templateName, moul.Name)))
	s.WriteString("\n")

	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Failed to save: %v", m.Err)))
		s.WriteString("\n")
	}

	formContainer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1, 2).
		Width(m.Width - 4)

	s.WriteString(formContainer.Render(m.EmailTemplateForm.View()))

	return ContentStyle.Width(m.Width).Render(s.String())
}

func (m *Model) viewTestEmailSend() string {
	moul := m.currentMoul()
	if moul == nil {
		return "No active collection selected."
	}

	var s strings.Builder
	s.WriteString(HeaderStyle.Render(fmt.Sprintf("Send Test Email - %s", moul.Name)))
	s.WriteString("\n")

	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Failed to send: %v", m.Err)))
		s.WriteString("\n")
	}

	formContainer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1, 2).
		Width(60)

	s.WriteString(formContainer.Render(m.TestEmailForm.View()))

	return ContentStyle.Width(m.Width).Render(s.String())
}
