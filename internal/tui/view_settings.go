package tui

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"charm.land/bubbles/v2/textinput"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

type settingField struct {
	label    string
	isBool   bool
	boolVal  *string
	strVal   *string
	inputIdx int
	isTable  bool // mark as the rate limit rules table
}

func (m *Model) getSettingsFields() []settingField {
	var fields []settingField
	if m.settingsActiveTab == 0 {
		fields = append(fields, settingField{
			label:   "S3 Storage Enabled",
			isBool:  true,
			boolVal: &m.settingFileS3Enabled,
		})
		if m.settingFileS3Enabled == "true" {
			fields = append(fields,
				settingField{label: "S3 Bucket", strVal: &m.settingFileS3Bucket, inputIdx: 0},
				settingField{label: "S3 Endpoint", strVal: &m.settingFileS3Endpoint, inputIdx: 1},
				settingField{label: "S3 Region", strVal: &m.settingFileS3Region, inputIdx: 2},
				settingField{label: "S3 Access Key", strVal: &m.settingFileS3AccessKey, inputIdx: 3},
				settingField{label: "S3 Secret Key", strVal: &m.settingFileS3SecretKey, inputIdx: 4},
				settingField{label: "S3 Force Path Style", isBool: true, boolVal: &m.settingFileS3ForcePath},
			)
		}
	} else if m.settingsActiveTab == 1 {
		fields = append(fields, settingField{
			label:   "Litestream Enabled",
			isBool:  true,
			boolVal: &m.settingLiteEnabled,
		})
		if m.settingLiteEnabled == "true" {
			fields = append(fields,
				settingField{label: "Litestream S3 Bucket", strVal: &m.settingLiteS3Bucket, inputIdx: 0},
				settingField{label: "Litestream S3 Endpoint", strVal: &m.settingLiteS3Endpoint, inputIdx: 1},
				settingField{label: "Litestream Region", strVal: &m.settingLiteS3Region, inputIdx: 2},
				settingField{label: "Litestream Access Key ID", strVal: &m.settingLiteAccessKey, inputIdx: 3},
				settingField{label: "Litestream Secret Access Key", strVal: &m.settingLiteSecretKey, inputIdx: 4},
				settingField{label: "Litestream S3 Force Path Style", isBool: true, boolVal: &m.settingLiteS3ForcePath},
				settingField{label: "Litestream Replica Path", strVal: &m.settingLiteReplica, inputIdx: 5},
			)
		}
	} else if m.settingsActiveTab == 2 {
		fields = append(fields, settingField{
			label:   "Rate Limiting Enabled",
			isBool:  true,
			boolVal: &m.settingRateLimitingEnabled,
		})
		if m.settingRateLimitingEnabled == "true" {
			fields = append(fields, settingField{
				label:   "Rate Limit Rules Table",
				isTable: true,
			})
		}
	}
	return fields
}

func (m *Model) initSettingsInputs() {
	if len(m.storageInputs) == 0 {
		m.storageInputs = make([]textinput.Model, 5)
		for i := range m.storageInputs {
			t := textinput.New()
			t.CharLimit = 128

			s := t.Styles()
			s.Focused.Text = lipgloss.NewStyle().Foreground(ColorCyanLight)
			s.Focused.Prompt = lipgloss.NewStyle().Foreground(ColorCyan)
			t.SetStyles(s)

			m.storageInputs[i] = t
		}
		m.storageInputs[0].Placeholder = "e.g. my-bucket-name"
		m.storageInputs[1].Placeholder = "e.g. s3.amazonaws.com"
		m.storageInputs[2].Placeholder = "e.g. us-east-1"
		m.storageInputs[3].Placeholder = "e.g. AKIA..."
		m.storageInputs[4].Placeholder = "••••••••"
		m.storageInputs[4].EchoMode = textinput.EchoPassword
		m.storageInputs[4].EchoCharacter = '•'
	}

	if len(m.liteInputs) == 0 {
		m.liteInputs = make([]textinput.Model, 6)
		for i := range m.liteInputs {
			t := textinput.New()
			t.CharLimit = 128

			s := t.Styles()
			s.Focused.Text = lipgloss.NewStyle().Foreground(ColorCyanLight)
			s.Focused.Prompt = lipgloss.NewStyle().Foreground(ColorCyan)
			t.SetStyles(s)

			m.liteInputs[i] = t
		}
		m.liteInputs[0].Placeholder = "e.g. my-backup-bucket"
		m.liteInputs[1].Placeholder = "e.g. s3.amazonaws.com"
		m.liteInputs[2].Placeholder = "e.g. us-east-1"
		m.liteInputs[3].Placeholder = "e.g. AKIA..."
		m.liteInputs[4].Placeholder = "••••••••"
		m.liteInputs[4].EchoMode = textinput.EchoPassword
		m.liteInputs[4].EchoCharacter = '•'
		m.liteInputs[5].Placeholder = "e.g. s3://my-bucket/replica"
	}

	// Load values from model state
	m.storageInputs[0].SetValue(m.settingFileS3Bucket)
	m.storageInputs[1].SetValue(m.settingFileS3Endpoint)
	m.storageInputs[2].SetValue(m.settingFileS3Region)
	m.storageInputs[3].SetValue(m.settingFileS3AccessKey)
	m.storageInputs[4].SetValue(m.settingFileS3SecretKey)

	m.liteInputs[0].SetValue(m.settingLiteS3Bucket)
	m.liteInputs[1].SetValue(m.settingLiteS3Endpoint)
	m.liteInputs[2].SetValue(m.settingLiteS3Region)
	m.liteInputs[3].SetValue(m.settingLiteAccessKey)
	m.liteInputs[4].SetValue(m.settingLiteSecretKey)
	m.liteInputs[5].SetValue(m.settingLiteReplica)
}

func (m *Model) updateSettingsFocus(prevIndex, newIndex int) {
	fields := m.getSettingsFields()

	// Blur previous
	if prevIndex > 0 && prevIndex <= len(fields) {
		f := fields[prevIndex-1]
		if !f.isBool && !f.isTable {
			if m.settingsActiveTab == 0 {
				m.storageInputs[f.inputIdx].Blur()
			} else if m.settingsActiveTab == 1 {
				m.liteInputs[f.inputIdx].Blur()
			}
		}
	}

	// Focus new
	if newIndex > 0 && newIndex <= len(fields) {
		f := fields[newIndex-1]
		if !f.isBool && !f.isTable {
			if m.settingsActiveTab == 0 {
				m.storageInputs[f.inputIdx].Focus()
			} else if m.settingsActiveTab == 1 {
				m.liteInputs[f.inputIdx].Focus()
			}
		}
	}

	m.settingsFocusIndex = newIndex
}

func (m *Model) blurAllSettingsInputs() {
	for i := range m.storageInputs {
		m.storageInputs[i].Blur()
	}
	for i := range m.liteInputs {
		m.liteInputs[i].Blur()
	}
}

// saveSettingsForm compiles form values and saves them on the server.
func (m *Model) saveSettingsForm() {
	rulesJSON, err := json.Marshal(m.settingRateLimitingRules)
	if err != nil {
		m.Err = err
		return
	}

	payload := map[string]string{
		"file_s3_enabled":                 m.settingFileS3Enabled,
		"file_s3_bucket":                  m.settingFileS3Bucket,
		"file_s3_endpoint":                m.settingFileS3Endpoint,
		"file_s3_region":                  m.settingFileS3Region,
		"file_s3_access_key":              m.settingFileS3AccessKey,
		"file_s3_secret_key":              m.settingFileS3SecretKey,
		"file_s3_force_path_style":        m.settingFileS3ForcePath,
		"litestream_enabled":              m.settingLiteEnabled,
		"litestream_s3_bucket":            m.settingLiteS3Bucket,
		"litestream_s3_endpoint":          m.settingLiteS3Endpoint,
		"litestream_s3_region":            m.settingLiteS3Region,
		"litestream_access_key_id":        m.settingLiteAccessKey,
		"litestream_secret_access_key":    m.settingLiteSecretKey,
		"litestream_s3_force_path_style":  m.settingLiteS3ForcePath,
		"litestream_replica_path":         m.settingLiteReplica,
		"rate_limiting_enabled":           m.settingRateLimitingEnabled,
		"rate_limiting_rules":             string(rulesJSON),
	}

	_, err = m.Client.UpdateSettings(payload)
	if err != nil {
		m.Err = err
		return
	}

	m.State = StateDashboard
	m.SuccessMsg = "Settings saved successfully!"
}

func renderBoolField(label string, val bool, focused bool) string {
	yesStr := " Yes "
	noStr := " No "
	if val {
		yesStr = lipgloss.NewStyle().Bold(true).Foreground(ColorGreen).Render("[ Yes ]")
		noStr = " No "
	} else {
		yesStr = " Yes "
		noStr = lipgloss.NewStyle().Bold(true).Foreground(ColorRed).Render("[ No ]")
	}

	lbl := label + ":"
	if focused {
		return fmt.Sprintf("  %s %-30s %s  %s",
			lipgloss.NewStyle().Foreground(ColorCyan).Render(">"),
			lipgloss.NewStyle().Bold(true).Foreground(ColorTextLight).Render(lbl),
			yesStr, noStr)
	}
	return fmt.Sprintf("    %-30s %s  %s",
		lipgloss.NewStyle().Foreground(ColorTextMuted).Render(lbl),
		yesStr, noStr)
}

func renderTextField(label string, input textinput.Model, focused bool) string {
	lbl := label + ":"
	if focused {
		return fmt.Sprintf("  %s %-30s %s",
			lipgloss.NewStyle().Foreground(ColorCyan).Render(">"),
			lipgloss.NewStyle().Bold(true).Foreground(ColorTextLight).Render(lbl),
			input.View())
	}
	return fmt.Sprintf("    %-30s %s",
		lipgloss.NewStyle().Foreground(ColorTextMuted).Render(lbl),
		input.View())
}

// viewSettings renders the settings split screen layout.
func (m *Model) viewSettings() string {
	var s strings.Builder

	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n\n")
	}

	// Render Tabs
	var tabs []string

	// S3 Storage Tab
	if m.settingsActiveTab == 0 {
		if m.settingsFocusIndex == 0 {
			tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ S3 STORAGE ◀"))
		} else {
			tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorIndigoLight).Background(ColorSelectionBg).Render("  S3 STORAGE  "))
		}
	} else {
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  S3 STORAGE  "))
	}

	// Litestream Tab
	if m.settingsActiveTab == 1 {
		if m.settingsFocusIndex == 0 {
			tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ LITESTREAM BACKUPS ◀"))
		} else {
			tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorIndigoLight).Background(ColorSelectionBg).Render("  LITESTREAM BACKUPS  "))
		}
	} else {
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  LITESTREAM BACKUPS  "))
	}

	// Rate Limiting Tab
	if m.settingsActiveTab == 2 {
		if m.settingsFocusIndex == 0 {
			tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ RATE LIMITING ◀"))
		} else {
			tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorIndigoLight).Background(ColorSelectionBg).Render("  RATE LIMITING  "))
		}
	} else {
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  RATE LIMITING  "))
	}

	s.WriteString("  " + lipgloss.JoinHorizontal(lipgloss.Top, tabs...) + "\n\n\n")

	// Render form state if adding or editing a rate limit rule
	if m.settingsActiveTab == 2 && m.rateLimitSubState != "list" {
		var title string
		if m.rateLimitSubState == "add" {
			title = "ADD NEW RATE LIMIT RULE"
		} else {
			title = "EDIT RATE LIMIT RULE"
		}
		s.WriteString("  " + lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Render(title) + "\n\n")

		labels := []string{"Rate Limit Label", "Max Requests (per IP)", "Interval (in seconds)", "Targeted Users (all/authenticated/guest)"}
		for i, label := range labels {
			focused := (m.rateLimitFormFocusIdx == i)
			s.WriteString(renderTextField(label, m.rateLimitFormInputs[i], focused) + "\n\n")
		}

		saveBtnStyle := ButtonStyle
		cancelBtnStyle := ButtonStyle
		if m.rateLimitFormFocusIdx == 4 {
			saveBtnStyle = ButtonActiveStyle
		} else if m.rateLimitFormFocusIdx == 5 {
			cancelBtnStyle = ButtonActiveStyle
		}
		buttons := lipgloss.JoinHorizontal(
			lipgloss.Left,
			saveBtnStyle.Render(" Save Rule "),
			"  ",
			cancelBtnStyle.Render(" Cancel "),
		)
		s.WriteString("\n" + SettingsButtonAreaStyle.Render(buttons))
		s.WriteString("\n\n" + HelpStyle.Render("  Tab/Arrows: Navigate fields  |  Space/Enter: Trigger button  |  Esc: Cancel"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// Render fields of the active tab
	fields := m.getSettingsFields()
	for i, f := range fields {
		focused := (m.settingsFocusIndex == i+1)

		var line string
		if f.isBool {
			valBool := (*f.boolVal == "true")
			line = renderBoolField(f.label, valBool, focused)
			s.WriteString(line + "\n\n")
		} else if f.isTable {
			// Draw dynamic interactive table for rate limiting rules
			s.WriteString("  " + TableHeaderStyle.Render(fmt.Sprintf("%-25s %-15s %-15s %-20s", "RATE LIMIT LABEL", "MAX REQUESTS", "INTERVAL (S)", "TARGETED USERS")) + "\n")
			if len(m.settingRateLimitingRules) == 0 {
				s.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("    No rate limit rules configured. Press [a] to add a rule.") + "\n")
			} else {
				for rIdx, r := range m.settingRateLimitingRules {
					line := fmt.Sprintf("%-25s %-15d %-15d %-20s", r.Label, r.MaxRequests, r.Interval, r.TargetedUsers)
					isTableFocused := (m.settingsFocusIndex == 2)
					if rIdx == m.selectedRateLimitRuleIdx && isTableFocused {
						s.WriteString(TableCellSelectedStyle.Width(m.Width - 10).Render(line) + "\n")
					} else {
						if rIdx == m.selectedRateLimitRuleIdx {
							s.WriteString("  " + lipgloss.NewStyle().Foreground(ColorCyan).Render(">") + " " + TableCellStyle.Render(line) + "\n")
						} else {
							s.WriteString("    " + TableCellStyle.Render(line) + "\n")
						}
					}
				}
			}
			s.WriteString("\n")
		} else {
			var input textinput.Model
			if m.settingsActiveTab == 0 {
				input = m.storageInputs[f.inputIdx]
			} else {
				input = m.liteInputs[f.inputIdx]
			}
			line = renderTextField(f.label, input, focused)
			s.WriteString(line + "\n\n")
		}
	}

	// Render Save/Cancel Buttons
	numFields := len(fields)
	saveBtnStyle := ButtonStyle
	cancelBtnStyle := ButtonStyle

	if m.settingsFocusIndex == numFields+1 {
		saveBtnStyle = ButtonActiveStyle
	} else if m.settingsFocusIndex == numFields+2 {
		cancelBtnStyle = ButtonActiveStyle
	}

	buttons := lipgloss.JoinHorizontal(
		lipgloss.Left,
		saveBtnStyle.Render(" Save Settings "),
		"  ",
		cancelBtnStyle.Render(" Cancel "),
	)

	s.WriteString("\n" + SettingsButtonAreaStyle.Render(buttons))

	// Render navigation help
	s.WriteString("\n\n")
	if m.settingsActiveTab == 2 && m.settingRateLimitingEnabled == "true" {
		s.WriteString(HelpStyle.Render("  ←/→: Switch Tabs (when top row is active) or toggle Save/Cancel buttons\n  ↑/↓ or Tab: Navigate fields  |  Space/Enter: Toggle booleans or trigger buttons\n  [a]: Add Rule  |  [e]: Edit Rule  |  [d]: Delete Rule  |  Esc: Back"))
	} else {
		s.WriteString(HelpStyle.Render("  ←/→: Switch Tabs (when top row is active) or toggle Save/Cancel buttons\n  ↑/↓ or Tab: Navigate fields  |  Space/Enter: Toggle booleans or trigger buttons  |  Esc: Back"))
	}

	return ContentStyle.Width(m.Width).Render(s.String())
}

func (m *Model) initRateLimitForm(action string, rule *schema.RateLimitRule) {
	m.rateLimitSubState = action
	m.rateLimitFormFocusIdx = 0

	m.rateLimitFormInputs = make([]textinput.Model, 4)
	for i := range m.rateLimitFormInputs {
		t := textinput.New()
		t.CharLimit = 128
		s := t.Styles()
		s.Focused.Text = lipgloss.NewStyle().Foreground(ColorCyanLight)
		s.Focused.Prompt = lipgloss.NewStyle().Foreground(ColorCyan)
		t.SetStyles(s)
		m.rateLimitFormInputs[i] = t
	}

	m.rateLimitFormInputs[0].Placeholder = "e.g. *:auth, /api/batch, users:list"
	m.rateLimitFormInputs[1].Placeholder = "e.g. 10"
	m.rateLimitFormInputs[2].Placeholder = "e.g. 3"
	m.rateLimitFormInputs[3].Placeholder = "all, authenticated, guest"

	if action == "edit" && rule != nil {
		m.rateLimitFormInputs[0].SetValue(rule.Label)
		m.rateLimitFormInputs[1].SetValue(fmt.Sprintf("%d", rule.MaxRequests))
		m.rateLimitFormInputs[2].SetValue(fmt.Sprintf("%d", rule.Interval))
		m.rateLimitFormInputs[3].SetValue(rule.TargetedUsers)
	}

	m.rateLimitFormInputs[0].Focus()
}

func (m *Model) updateRateLimitForm(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	if kp, ok := msg.(tea.KeyPressMsg); ok {
		keyStr := kp.String()
		switch keyStr {
		case "esc":
			m.rateLimitSubState = "list"
			m.Err = nil
			return m, nil
		case "tab", "down", "j":
			m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Blur()
			m.rateLimitFormFocusIdx = (m.rateLimitFormFocusIdx + 1) % 6
			if m.rateLimitFormFocusIdx < 4 {
				m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Focus()
			}
			return m, nil
		case "shift+tab", "up", "k":
			m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Blur()
			m.rateLimitFormFocusIdx = (m.rateLimitFormFocusIdx - 1 + 6) % 6
			if m.rateLimitFormFocusIdx < 4 {
				m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Focus()
			}
			return m, nil
		case "enter", " ":
			// If on input, enter behaves like Tab (advance to next input)
			if m.rateLimitFormFocusIdx < 4 {
				m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Blur()
				m.rateLimitFormFocusIdx = (m.rateLimitFormFocusIdx + 1) % 6
				if m.rateLimitFormFocusIdx < 4 {
					m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Focus()
				}
				return m, nil
			}

			if m.rateLimitFormFocusIdx == 4 { // Save Rule
				label := strings.TrimSpace(m.rateLimitFormInputs[0].Value())
				maxReqStr := strings.TrimSpace(m.rateLimitFormInputs[1].Value())
				intervalStr := strings.TrimSpace(m.rateLimitFormInputs[2].Value())
				targetedUsers := strings.ToLower(strings.TrimSpace(m.rateLimitFormInputs[3].Value()))

				if label == "" {
					m.Err = fmt.Errorf("rule label cannot be empty")
					return m, nil
				}
				maxReq, err := strconv.Atoi(maxReqStr)
				if err != nil || maxReq <= 0 {
					m.Err = fmt.Errorf("max requests must be a positive integer")
					return m, nil
				}
				interval, err := strconv.Atoi(intervalStr)
				if err != nil || interval <= 0 {
					m.Err = fmt.Errorf("interval must be a positive integer")
					return m, nil
				}
				if targetedUsers != "all" && targetedUsers != "authenticated" && targetedUsers != "guest" {
					m.Err = fmt.Errorf("targeted users must be 'all', 'authenticated', or 'guest'")
					return m, nil
				}

				rule := schema.RateLimitRule{
					Label:         label,
					MaxRequests:   maxReq,
					Interval:      interval,
					TargetedUsers: targetedUsers,
				}

				if m.rateLimitSubState == "add" {
					m.settingRateLimitingRules = append(m.settingRateLimitingRules, rule)
					m.selectedRateLimitRuleIdx = len(m.settingRateLimitingRules) - 1
				} else { // edit
					if m.selectedRateLimitRuleIdx >= 0 && m.selectedRateLimitRuleIdx < len(m.settingRateLimitingRules) {
						m.settingRateLimitingRules[m.selectedRateLimitRuleIdx] = rule
					}
				}

				m.rateLimitSubState = "list"
				m.Err = nil
				return m, nil
			}

			if m.rateLimitFormFocusIdx == 5 { // Cancel
				m.rateLimitSubState = "list"
				m.Err = nil
				return m, nil
			}
		}
	}

	// Update active textinput
	if m.rateLimitFormFocusIdx < 4 {
		var cmd tea.Cmd
		m.rateLimitFormInputs[m.rateLimitFormFocusIdx], cmd = m.rateLimitFormInputs[m.rateLimitFormFocusIdx].Update(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}
	}

	return m, tea.Batch(cmds...)
}
