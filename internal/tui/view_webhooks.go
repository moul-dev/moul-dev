package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

type WebhooksMsg struct {
	Webhooks []schema.Webhook
	Err      error
}

type WebhookSavedMsg struct {
	Err error
}

type WebhookTestMsg struct {
	Result map[string]interface{}
	Err    error
}

// fetchWebhooksCmd fetches all configured webhooks for the active collection.
func (m *Model) fetchWebhooksCmd() tea.Cmd {
	return func() tea.Msg {
		moul := m.currentMoul()
		if moul == nil {
			return nil
		}
		webhooks, err := m.Client.ListWebhooks(moul.Name)
		return WebhooksMsg{Webhooks: webhooks, Err: err}
	}
}

// updateWebhooksTab handles keyboard navigation and actions on the Webhooks tab.
func (m *Model) updateWebhooksTab(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case WebhooksMsg:
		if msg.Err != nil {
			m.Err = msg.Err
			return nil
		}
		m.Webhooks = msg.Webhooks
		if m.SelectedWebhookIndex >= len(m.Webhooks) && len(m.Webhooks) > 0 {
			m.SelectedWebhookIndex = len(m.Webhooks) - 1
		}

	case WebhookTestMsg:
		if msg.Err != nil {
			m.Err = msg.Err
		} else {
			var status float64
			if v, ok := msg.Result["status_code"].(float64); ok {
				status = v
			}
			var dur float64
			if v, ok := msg.Result["duration_ms"].(float64); ok {
				dur = v
			}
			respStr, _ := msg.Result["response"].(string)
			success, _ := msg.Result["success"].(bool)

			if success {
				m.SuccessMsg = fmt.Sprintf("Ping Test Success (HTTP %d, %dms): %s", int(status), int(dur), respStr)
			} else {
				m.Err = fmt.Errorf("Ping Test Failed (HTTP %d, %dms): %s", int(status), int(dur), respStr)
			}
		}

	case tea.KeyPressMsg:
		m.SuccessMsg = ""
		m.Err = nil

		switch msg.String() {
		case "up", "k":
			if m.SelectedWebhookIndex > 0 {
				m.SelectedWebhookIndex--
			}
		case "down", "j":
			if m.SelectedWebhookIndex < len(m.Webhooks)-1 {
				m.SelectedWebhookIndex++
			}
		case "n": // Create new webhook
			return m.initWebhookForm(false)

		case "e": // Edit selected webhook
			if len(m.Webhooks) > 0 && m.SelectedWebhookIndex >= 0 && m.SelectedWebhookIndex < len(m.Webhooks) {
				return m.initWebhookForm(true)
			}

		case "space", "t": // Toggle enabled switch
			if len(m.Webhooks) > 0 && m.SelectedWebhookIndex >= 0 && m.SelectedWebhookIndex < len(m.Webhooks) {
				return m.toggleWebhookCmd()
			}

		case "d": // Delete webhook
			if len(m.Webhooks) > 0 && m.SelectedWebhookIndex >= 0 && m.SelectedWebhookIndex < len(m.Webhooks) {
				return m.deleteWebhookCmd()
			}

		case "p", "x": // Test ping webhook
			if len(m.Webhooks) > 0 && m.SelectedWebhookIndex >= 0 && m.SelectedWebhookIndex < len(m.Webhooks) {
				return m.testWebhookCmd()
			}

		case "r": // Refresh webhooks
			return m.fetchWebhooksCmd()

		case "tab": // Switch tab
			moul := m.currentMoul()
			if moul != nil && moul.Type == "auth" {
				m.collectionActiveTab = 2 // Email templates
				m.selectedTemplateIndex = 0
				return m.fetchEmailTemplatesCmd()
			} else {
				m.collectionActiveTab = 0 // Back to records
				return m.fetchRecords()
			}
		}
	}
	return nil
}

// toggleWebhookCmd toggles the enabled state of the selected webhook.
func (m *Model) toggleWebhookCmd() tea.Cmd {
	moul := m.currentMoul()
	if moul == nil || len(m.Webhooks) == 0 || m.SelectedWebhookIndex < 0 || m.SelectedWebhookIndex >= len(m.Webhooks) {
		return nil
	}

	target := m.Webhooks[m.SelectedWebhookIndex]
	newEnabled := !target.Enabled

	return func() tea.Msg {
		_, err := m.Client.UpdateWebhook(moul.Name, target.ID, map[string]interface{}{
			"enabled": newEnabled,
		})
		if err != nil {
			return ErrMsg{err}
		}
		return m.fetchWebhooksCmd()()
	}
}

// deleteWebhookCmd deletes the selected webhook.
func (m *Model) deleteWebhookCmd() tea.Cmd {
	moul := m.currentMoul()
	if moul == nil || len(m.Webhooks) == 0 || m.SelectedWebhookIndex < 0 || m.SelectedWebhookIndex >= len(m.Webhooks) {
		return nil
	}

	target := m.Webhooks[m.SelectedWebhookIndex]

	return func() tea.Msg {
		err := m.Client.DeleteWebhook(moul.Name, target.ID)
		if err != nil {
			return ErrMsg{err}
		}
		return m.fetchWebhooksCmd()()
	}
}

// testWebhookCmd triggers a ping test on the selected webhook.
func (m *Model) testWebhookCmd() tea.Cmd {
	moul := m.currentMoul()
	if moul == nil || len(m.Webhooks) == 0 || m.SelectedWebhookIndex < 0 || m.SelectedWebhookIndex >= len(m.Webhooks) {
		return nil
	}

	target := m.Webhooks[m.SelectedWebhookIndex]

	return func() tea.Msg {
		res, err := m.Client.TestWebhook(moul.Name, target.ID)
		return WebhookTestMsg{Result: res, Err: err}
	}
}

// initWebhookForm sets up the form for creating or editing a webhook.
func (m *Model) initWebhookForm(isEdit bool) tea.Cmd {
	moul := m.currentMoul()
	if moul == nil {
		return nil
	}

	if isEdit && len(m.Webhooks) > 0 && m.SelectedWebhookIndex >= 0 && m.SelectedWebhookIndex < len(m.Webhooks) {
		target := m.Webhooks[m.SelectedWebhookIndex]
		m.editingWebhookID = target.ID
		m.webhookFormURL = target.URL
		m.webhookFormEvents = strings.Join(target.Events, ", ")
		m.webhookFormSecret = target.Secret
		m.webhookFormEnabled = target.Enabled
	} else {
		m.editingWebhookID = ""
		m.webhookFormURL = "https://"
		m.webhookFormEvents = "*"
		m.webhookFormSecret = ""
		m.webhookFormEnabled = true
	}

	m.WebhookForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Webhook Target URL").
				Placeholder("https://example.com/webhook").
				Description("Target HTTP POST endpoint URL").
				Value(&m.webhookFormURL),

			huh.NewInput().
				Title("Events (comma-separated)").
				Description("e.g. create:before, create:after, update:before, update:after, delete:before, delete:after or *").
				Value(&m.webhookFormEvents),

			huh.NewInput().
				Title("Secret Key (Optional)").
				Description("HMAC-SHA256 signature secret for X-Moul-Signature header").
				Value(&m.webhookFormSecret),

			huh.NewConfirm().
				Title("Enable Webhook").
				Description("Active webhooks trigger on record events").
				Value(&m.webhookFormEnabled),
		),
	)

	m.State = StateWebhookForm
	return m.WebhookForm.Init()
}

// saveWebhookForm submits the webhook creation or update request.
func (m *Model) saveWebhookForm() tea.Cmd {
	moul := m.currentMoul()
	if moul == nil {
		m.State = StateRecordList
		return nil
	}

	var events []string
	for _, e := range strings.Split(m.webhookFormEvents, ",") {
		trimmed := strings.TrimSpace(e)
		if trimmed != "" {
			events = append(events, trimmed)
		}
	}
	if len(events) == 0 {
		events = []string{"*"}
	}

	isEdit := m.editingWebhookID != ""
	editingID := m.editingWebhookID
	urlVal := strings.TrimSpace(m.webhookFormURL)
	secretVal := strings.TrimSpace(m.webhookFormSecret)
	enabledVal := m.webhookFormEnabled

	return func() tea.Msg {
		if isEdit {
			_, err := m.Client.UpdateWebhook(moul.Name, editingID, map[string]interface{}{
				"url":     urlVal,
				"events":  events,
				"secret":  secretVal,
				"enabled": enabledVal,
			})
			return WebhookSavedMsg{Err: err}
		} else {
			hook := schema.Webhook{
				URL:     urlVal,
				Events:  events,
				Secret:  secretVal,
				Enabled: enabledVal,
			}
			_, err := m.Client.CreateWebhook(moul.Name, hook)
			return WebhookSavedMsg{Err: err}
		}
	}
}

// updateWebhookForm handles inputs inside the webhook form.
func (m *Model) updateWebhookForm(msg tea.Msg) tea.Cmd {
	if m.WebhookForm == nil {
		m.State = StateRecordList
		return nil
	}

	form, cmd := m.WebhookForm.Update(msg)
	if f, ok := form.(*huh.Form); ok {
		m.WebhookForm = f
	}

	if m.WebhookForm.State == huh.StateCompleted {
		m.State = StateRecordList
		return m.saveWebhookForm()
	}

	if keyMsg, ok := msg.(tea.KeyPressMsg); ok && keyMsg.String() == "esc" {
		m.State = StateRecordList
		return nil
	}

	return cmd
}

// renderWebhooksTab renders the styled Webhooks tab interface.
func (m *Model) renderWebhooksTab() string {
	moul := m.currentMoul()
	if moul == nil {
		return ""
	}

	var b strings.Builder

	// Header banner with tabs
	var tabs []string
	if m.collectionActiveTab == 1 {
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  RECORDS  "))
		tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ WEBHOOKS ◀"))
		if moul.Type == "auth" {
			tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  EMAIL TEMPLATES  "))
		}
	}
	b.WriteString("  " + lipgloss.JoinHorizontal(lipgloss.Top, tabs...) + "\n\n")

	// Notice or Error
	if m.Err != nil {
		b.WriteString(AlertErrorStyle.Render("Error: "+m.Err.Error()) + "\n\n")
	} else if m.SuccessMsg != "" {
		b.WriteString(AlertSuccessStyle.Render(m.SuccessMsg) + "\n\n")
	}

	if len(m.Webhooks) == 0 {
		b.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  No webhooks configured for this collection.") + "\n")
		b.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  Press 'n' to create your first outbound HTTP webhook trigger.") + "\n\n")
	} else {
		// Render webhooks table
		b.WriteString(TableHeaderStyle.Render("  ID            URL                             EVENTS                    SECRET   STATUS    ") + "\n")

		for i, hook := range m.Webhooks {
			statusStr := lipgloss.NewStyle().Bold(true).Foreground(ColorGreen).Render("ENABLED")
			if !hook.Enabled {
				statusStr = lipgloss.NewStyle().Foreground(ColorRed).Render("DISABLED")
			}

			secretStr := "none"
			if hook.Secret != "" {
				secretStr = "***"
			}

			eventsStr := strings.Join(hook.Events, ", ")
			if len(eventsStr) > 25 {
				eventsStr = eventsStr[:22] + "..."
			}

			urlStr := hook.URL
			if len(urlStr) > 30 {
				urlStr = urlStr[:27] + "..."
			}

			line := fmt.Sprintf("  %-13s %-31s %-25s %-8s %s", hook.ID, urlStr, eventsStr, secretStr, statusStr)

			if i == m.SelectedWebhookIndex {
				b.WriteString(TableCellSelectedStyle.Render(">"+line) + "\n")
			} else {
				b.WriteString(TableCellStyle.Render(" "+line) + "\n")
			}
		}
		b.WriteString("\n")
	}

	// Hotkeys Footer
	footer := HelpStyle.Render(" [n] New  [e] Edit  [d] Delete  [space] Toggle  [p] Ping test  [r] Refresh  [Tab] Switch tabs")
	b.WriteString(footer)

	return ContentStyle.Width(m.Width).Render(b.String())
}
