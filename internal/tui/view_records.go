package tui

import (
	"encoding/json"
	"fmt"
	"strings"

	"charm.land/bubbles/v2/textinput"
	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func (m *Model) initRecordSearchInput() {
	ti := textinput.New()
	ti.Placeholder = "Search or filter expression (e.g. name ~ 'admin', status = 'active')..."
	ti.CharLimit = 256
	s := ti.Styles()
	s.Focused.Text = lipgloss.NewStyle().Foreground(ColorCyanLight)
	s.Focused.Prompt = lipgloss.NewStyle().Foreground(ColorCyan)
	ti.SetStyles(s)
	ti.Prompt = "🔍 / "
	m.recordSearchInput = ti
}

func buildRecordFilter(moul *schema.Moul, query string) string {
	query = strings.TrimSpace(query)
	if query == "" {
		return ""
	}
	if strings.ContainsAny(query, "=~><!") {
		return query
	}
	var clauses []string
	clauses = append(clauses, fmt.Sprintf("id ~ %q", query))
	if moul != nil {
		for _, f := range moul.Fields {
			if f.Type == "text" || f.Type == "string" || f.Type == "email" || f.Type == "url" {
				clauses = append(clauses, fmt.Sprintf("%s ~ %q", f.Name, query))
			}
		}
	}
	return strings.Join(clauses, " || ")
}

func (m *Model) updateRecordList(msg tea.Msg) tea.Cmd {
	moul := m.currentMoul()
	if moul == nil {
		m.State = StateDashboard
		return nil
	}

	if m.collectionActiveTab == 1 {
		return m.updateWebhooksTab(msg)
	}
	if m.collectionActiveTab == 2 && moul.Type == "auth" {
		return m.updateEmailTemplatesTab(msg)
	}

	// Handle active search text input mode
	if m.recordSearchActive {
		if kp, ok := msg.(tea.KeyPressMsg); ok {
			switch kp.String() {
			case "esc":
				m.recordSearchActive = false
				m.recordSearchFilter = ""
				m.recordPage = 1
				m.SelectedRecordIndex = 0
				return m.fetchRecords()
			case "enter":
				m.recordSearchActive = false
				rawVal := strings.TrimSpace(m.recordSearchInput.Value())
				m.recordSearchFilter = rawVal
				m.recordPage = 1
				m.SelectedRecordIndex = 0
				return m.fetchRecords()
			}
		}
		var cmd tea.Cmd
		m.recordSearchInput, cmd = m.recordSearchInput.Update(msg)
		return cmd
	}

	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		// Clear success message on key press
		m.SuccessMsg = ""
		m.Err = nil

		switch msg.String() {
		case "up", "k":
			if m.SelectedRecordIndex > 0 {
				m.SelectedRecordIndex--
			}
		case "down", "j":
			if m.SelectedRecordIndex < len(m.Records)-1 {
				m.SelectedRecordIndex++
			}
		case "/", "ctrl+f":
			m.recordSearchActive = true
			m.initRecordSearchInput()
			m.recordSearchInput.Focus()
			return nil
		case ">", ".", "]", "pgdown":
			if m.recordTotalPages > 0 && m.recordPage < m.recordTotalPages {
				m.recordPage++
				m.SelectedRecordIndex = 0
				return m.fetchRecords()
			}
		case "<", ",", "[", "pgup":
			if m.recordPage > 1 {
				m.recordPage--
				m.SelectedRecordIndex = 0
				return m.fetchRecords()
			}
		case "enter", "v":
			// Open detail view
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				jsonStr := formatJSON(record)
				m.Viewport.SetContent(jsonStr)
				m.Viewport.SetYOffset(0)
				m.State = StateRecordDetail
				m.ViewDetail = "record"
			}
		case "e":
			// Edit record
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				if id, ok := record["id"].(string); ok {
					m.editRecordID = id
					m.initRecordForm(true)
					m.State = StateRecordEdit
					return m.RecordForm.Init()
				}
			}
		case "n":
			// New record
			m.editRecordID = ""
			m.initRecordForm(false)
			m.State = StateRecordEdit
			return m.RecordForm.Init()
		case "d":
			// Delete record
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				if id, ok := record["id"].(string); ok {
					return func() tea.Msg {
						err := m.Client.DeleteRecord(moul.Name, id)
						if err != nil {
							return ErrMsg{err}
						}
						// Reload
						records, err := m.Client.ListRecords(moul.Name, m.getExpandFields(moul)...)
						if err != nil {
							return ErrMsg{err}
						}
						return recordDeletedMsg{records}
					}
				}
			}
		case "u":
			// Update collection schema
			m.State = StateMoulCreate
			m.initMoulFormForEdit(*moul)
			return m.MoulForm.Init()
		case "w":
			// Jump to Webhooks tab
			m.collectionActiveTab = 1
			m.SelectedWebhookIndex = 0
			return m.fetchWebhooksCmd()
		case "tab":
			if m.collectionActiveTab == 0 {
				m.collectionActiveTab = 1
				m.SelectedWebhookIndex = 0
				return m.fetchWebhooksCmd()
			} else if m.collectionActiveTab == 1 {
				if moul.Type == "auth" {
					m.collectionActiveTab = 2
					m.selectedTemplateIndex = 0
					return m.fetchEmailTemplatesCmd()
				} else {
					m.collectionActiveTab = 0
					return m.fetchRecords()
				}
			} else {
				m.collectionActiveTab = 0
				return m.fetchRecords()
			}
		case "r":
			// Refresh
			return m.fetchRecords()
		case "esc", "left", "h":
			if m.recordSearchFilter != "" {
				m.recordSearchFilter = ""
				m.recordPage = 1
				m.SelectedRecordIndex = 0
				m.SuccessMsg = "Filter cleared"
				return m.fetchRecords()
			}
			m.State = StateDashboard
			m.Records = nil
			m.SelectedRecordIndex = 0
			m.collectionActiveTab = 0
		}
	case recordDeletedMsg:
		m.Records = msg.records
		m.SelectedRecordIndex = 0
		m.SuccessMsg = "Record deleted successfully!"
	}
	return nil
}

type recordDeletedMsg struct {
	records []map[string]interface{}
}

// viewRecordList renders the table of records.
func (m *Model) viewRecordList() string {
	moul := m.currentMoul()
	if moul == nil {
		return "No active collection selected."
	}

	var s strings.Builder
	var tabs []string
	if m.collectionActiveTab == 0 {
		tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ RECORDS ◀"))
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  WEBHOOKS  "))
		if moul.Type == "auth" {
			tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  EMAIL TEMPLATES  "))
		}
	} else if m.collectionActiveTab == 1 {
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  RECORDS  "))
		tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ WEBHOOKS ◀"))
		if moul.Type == "auth" {
			tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  EMAIL TEMPLATES  "))
		}
	} else {
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  RECORDS  "))
		tabs = append(tabs, lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  WEBHOOKS  "))
		tabs = append(tabs, lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render("▶ EMAIL TEMPLATES ◀"))
	}
	s.WriteString("  " + lipgloss.JoinHorizontal(lipgloss.Top, tabs...) + "\n\n")

	if m.SuccessMsg != "" {
		s.WriteString(AlertSuccessStyle.Render(m.SuccessMsg))
		s.WriteString("\n")
	}
	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n")
	}

	if m.recordSearchActive {
		s.WriteString("  " + m.recordSearchInput.View() + "\n\n")
	} else if m.recordSearchFilter != "" {
		filterTag := lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Background(ColorSelectionBg).Render(fmt.Sprintf(" [Filter: %s] ", m.recordSearchFilter))
		s.WriteString("  " + filterTag + " " + lipgloss.NewStyle().Foreground(ColorTextMuted).Render("(press [/] to edit, [Esc] to clear)") + "\n\n")
	}

	if len(m.Records) == 0 {
		s.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  No records found in this collection.\n"))
		s.WriteString("\n")
		s.WriteString(HelpStyle.Render(" [/] Search  [n] Create new record  [r] Refresh  [Esc] Back"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// Pagination indicator
	pageInfo := ""
	if m.recordTotalPages > 0 {
		pageInfo = fmt.Sprintf("Page %d of %d (Total: %d)", m.recordPage, m.recordTotalPages, m.recordTotalItems)
	} else {
		pageInfo = fmt.Sprintf("Total: %d items", len(m.Records))
	}
	s.WriteString("  " + lipgloss.NewStyle().Foreground(ColorIndigoLight).Render(pageInfo) + "\n\n")

	// Headers: ID + first 3 custom fields
	headers := []string{"ID"}
	for i, f := range moul.Fields {
		if i < 3 {
			headers = append(headers, f.Name)
		}
	}

	// Draw table header
	var headerLine strings.Builder
	for _, h := range headers {
		headerLine.WriteString(fmt.Sprintf("%-24s", strings.ToUpper(h)))
	}
	s.WriteString(TableHeaderStyle.Render(headerLine.String()))
	s.WriteString("\n")

	// Calculate window/scrolling logic
	maxRows := m.Height - 13
	if maxRows < 3 {
		maxRows = 3
	}

	startIndex := 0
	if m.SelectedRecordIndex >= maxRows {
		startIndex = m.SelectedRecordIndex - maxRows + 1
	}
	endIndex := startIndex + maxRows
	if endIndex > len(m.Records) {
		endIndex = len(m.Records)
	}

	visibleRecords := m.Records[startIndex:endIndex]

	// Draw table rows
	for i, r := range visibleRecords {
		rIdx := startIndex + i
		var rowLine strings.Builder
		for _, h := range headers {
			valStr := ""
			if h == "ID" {
				if id, ok := r["id"].(string); ok {
					valStr = id
				}
			} else {
				if v, ok := r[h]; ok && v != nil {
					valStr = fmt.Sprintf("%v", v)
				}
			}
			// Truncate if too long
			if len(valStr) > 22 {
				valStr = valStr[:19] + "..."
			}
			rowLine.WriteString(fmt.Sprintf("%-24s", valStr))
		}

		line := rowLine.String()
		if rIdx == m.SelectedRecordIndex {
			s.WriteString(TableCellSelectedStyle.Width(m.Width - 10).Render(line))
		} else {
			s.WriteString(TableCellStyle.Render(line))
		}
		s.WriteString("\n")
	}

	s.WriteString("\n")
	s.WriteString(HelpStyle.Render(" ↑/↓: Scroll  [>] Next  [<] Prev  [/] Search  [v/Enter] View  [n] New  [e] Edit  [d] Delete  [r] Refresh  [Esc] Back"))

	return ContentStyle.Width(m.Width).Render(s.String())
}

// updateRecordDetail handles details page viewport scrolling and keys.
func (m *Model) updateRecordDetail(msg tea.Msg) tea.Cmd {
	moul := m.currentMoul()
	if moul == nil {
		m.State = StateDashboard
		return nil
	}

	var cmd tea.Cmd
	m.Viewport, cmd = m.Viewport.Update(msg)

	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		switch msg.String() {
		case "esc", "q", "left", "h":
			m.State = StateRecordList
		case "c":
			// Copy JSON to clipboard
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				jsonStr := formatJSON(record)
				if err := copyToClipboard(jsonStr); err != nil {
					m.Err = fmt.Errorf("failed to copy JSON: %w", err)
				} else {
					m.SuccessMsg = "Record JSON copied to clipboard!"
				}
			}
			return nil
		case "e":
			// Edit record
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				if id, ok := record["id"].(string); ok {
					m.editRecordID = id
					m.initRecordForm(true)
					m.State = StateRecordEdit
					return m.RecordForm.Init()
				}
			}
		case "d":
			// Delete record
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				if id, ok := record["id"].(string); ok {
					return func() tea.Msg {
						err := m.Client.DeleteRecord(moul.Name, id)
						if err != nil {
							return ErrMsg{err}
						}
						// Reload
						records, err := m.Client.ListRecords(moul.Name, m.getExpandFields(moul)...)
						if err != nil {
							return ErrMsg{err}
						}
						return recordDeletedMsg{records}
					}
				}
			}
		}
	case recordDeletedMsg:
		m.Records = msg.records
		m.SelectedRecordIndex = 0
		m.SuccessMsg = "Record deleted successfully!"
		m.State = StateRecordList
	}
	return cmd
}

// viewRecordDetail renders the record detail screen.
func (m *Model) viewRecordDetail() string {
	moul := m.currentMoul()
	if moul == nil {
		return "No active collection selected."
	}

	var s strings.Builder
	s.WriteString(HeaderStyle.Render(fmt.Sprintf("Record payload in %s", moul.Name)))
	s.WriteString("\n")

	if m.SuccessMsg != "" {
		s.WriteString(AlertSuccessStyle.Render(m.SuccessMsg))
		s.WriteString("\n")
	}
	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n")
	}

	s.WriteString(DetailTitleStyle.Render("Payload view"))
	s.WriteString("\n")
	s.WriteString(DetailBodyStyle.Render(m.Viewport.View()))
	s.WriteString("\n\n")
	s.WriteString(HelpStyle.Render(" ↑/↓: Scroll  [c] Copy JSON  [e] Edit  [d] Delete  [Esc/q] Back to records list"))

	return ContentStyle.Width(m.Width).Render(s.String())
}

// initRecordForm dynamically creates a form for editing or creating a record based on Moul schema.
func (m *Model) initRecordForm(isEdit bool) {
	moul := m.currentMoul()
	if moul == nil {
		return
	}

	var record map[string]interface{}
	if isEdit && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
		record = m.Records[m.SelectedRecordIndex]
	}

	var fields []huh.Field
	m.recordFormData = make(map[string]*string)
	m.recordFormMultiSel = make(map[string]*[]string)

	// Auth mouls standard fields
	if moul.Type == "auth" {
		usernameVal := ""
		emailVal := ""
		if record != nil {
			if u, ok := record["username"].(string); ok {
				usernameVal = u
			}
			if e, ok := record["email"].(string); ok {
				emailVal = e
			}
		}
		m.recordFormData["username"] = &usernameVal
		m.recordFormData["email"] = &emailVal

		fields = append(fields,
			huh.NewInput().Title("Username").Value(&usernameVal).Validate(ValidateUsername),
			huh.NewInput().Title("Email").Value(&emailVal).Validate(ValidateEmail),
		)

		if !isEdit {
			pwdVal := ""
			pwdConfirmVal := ""
			m.recordFormData["password"] = &pwdVal
			m.recordFormData["passwordConfirm"] = &pwdConfirmVal
			fields = append(fields,
				huh.NewInput().Title("Password").Value(&pwdVal).EchoMode(huh.EchoModePassword).Validate(ValidatePassword),
				huh.NewInput().Title("Confirm Password").Value(&pwdConfirmVal).EchoMode(huh.EchoModePassword).Validate(ValidateConfirmPassword(&pwdVal)),
			)
		}
	}

	// Custom fields
	for _, f := range moul.Fields {
		// Skip standard auth field overrides
		if moul.Type == "auth" && (f.Name == "username" || f.Name == "email" || f.Name == "password" || f.Name == "passwordConfirm") {
			continue
		}

		if f.Type == "relation" && f.RelationConfig != nil {
			targetMoul := f.RelationConfig.TargetMoul
			targetRecs, err := m.Client.ListRecords(targetMoul)
			if err == nil && len(targetRecs) < 100 {
				var options []huh.Option[string]
				options = append(options, huh.NewOption[string]("(none)", ""))
				for _, rec := range targetRecs {
					recID, _ := rec["id"].(string)
					label := recID
					if name, ok := rec["name"].(string); ok && name != "" {
						label = fmt.Sprintf("%s (%s)", name, recID)
					} else if title, ok := rec["title"].(string); ok && title != "" {
						label = fmt.Sprintf("%s (%s)", title, recID)
					} else if username, ok := rec["username"].(string); ok && username != "" {
						label = fmt.Sprintf("%s (%s)", username, recID)
					} else if email, ok := rec["email"].(string); ok && email != "" {
						label = fmt.Sprintf("%s (%s)", email, recID)
					}
					options = append(options, huh.NewOption[string](label, recID))
				}

				card := f.RelationConfig.Cardinality
				if card == "1:1" || card == "1:N" {
					valStr := ""
					if record != nil {
						if val, ok := record[f.Name]; ok && val != nil {
							valStr = fmt.Sprintf("%v", val)
						}
					}
					m.recordFormData[f.Name] = &valStr
					fields = append(fields, huh.NewSelect[string]().
						Title(fmt.Sprintf("%s (relation:%s)", f.Name, targetMoul)).
						Options(options...).
						Value(&valStr))
				} else if card == "M:N" {
					var selectedIDs []string
					if record != nil {
						if val, ok := record[f.Name]; ok && val != nil {
							if sliceVal, ok := val.([]interface{}); ok {
								for _, item := range sliceVal {
									if s, ok := item.(string); ok {
										selectedIDs = append(selectedIDs, s)
									}
								}
							} else if sliceVal, ok := val.([]string); ok {
								selectedIDs = sliceVal
							}
						}
					}
					m.recordFormMultiSel[f.Name] = &selectedIDs
					fields = append(fields, huh.NewMultiSelect[string]().
						Title(fmt.Sprintf("%s (relation:%s M:N)", f.Name, targetMoul)).
						Options(options[1:]...). // exclude (none)
						Value(m.recordFormMultiSel[f.Name]))
				}
				continue
			}

			// Fallback to text input if fetching fails or too many records
			valStr := ""
			if record != nil {
				if val, ok := record[f.Name]; ok && val != nil {
					if f.RelationConfig.Cardinality == "M:N" {
						if sliceVal, ok := val.([]interface{}); ok {
							var items []string
							for _, item := range sliceVal {
								if s, ok := item.(string); ok {
									items = append(items, s)
								}
							}
							valStr = strings.Join(items, ", ")
						} else if sliceVal, ok := val.([]string); ok {
							valStr = strings.Join(sliceVal, ", ")
						}
					} else {
						valStr = fmt.Sprintf("%v", val)
					}
				}
			}
			m.recordFormData[f.Name] = &valStr
			fields = append(fields, huh.NewInput().
				Title(fmt.Sprintf("%s (relation:%s - enter ID)", f.Name, targetMoul)).
				Value(&valStr))
			continue
		}

		if f.Type == "select" {
			valStr := ""
			if record != nil {
				if val, ok := record[f.Name]; ok && val != nil {
					valStr = fmt.Sprintf("%v", val)
				}
			}
			m.recordFormData[f.Name] = &valStr

			var selectOpts []huh.Option[string]
			selectOpts = append(selectOpts, huh.NewOption[string]("(none)", ""))
			for _, opt := range f.Options {
				selectOpts = append(selectOpts, huh.NewOption[string](opt, opt))
			}

			fields = append(fields, huh.NewSelect[string]().
				Title(fmt.Sprintf("%s (select)", f.Name)).
				Options(selectOpts...).
				Value(&valStr))
			continue
		}

		valStr := ""
		if record != nil {
			if val, ok := record[f.Name]; ok && val != nil {
				valStr = fmt.Sprintf("%v", val)
			}
		}

		m.recordFormData[f.Name] = &valStr
		inputField := huh.NewInput().Title(fmt.Sprintf("%s (%s)", f.Name, f.Type)).Value(&valStr)
		if f.Type == "number" {
			inputField = inputField.Validate(ValidateNumber)
		} else if f.Type == "json" {
			inputField = inputField.Validate(ValidateJSON)
		}
		fields = append(fields, inputField)
	}

	m.RecordForm = huh.NewForm(
		huh.NewGroup(fields...),
	).WithTheme(ThemeCustom)
}

// saveRecordForm compiles inputs and sends request to server.
func (m *Model) saveRecordForm() {
	moul := m.currentMoul()
	if moul == nil {
		m.State = StateDashboard
		return
	}

	payload := make(map[string]interface{})
	for name, ptr := range m.recordFormData {
		val := *ptr
		// Resolve type and cardinality
		fieldType := "text"
		var relationConf *schema.RelationConfig
		for _, f := range moul.Fields {
			if f.Name == name {
				fieldType = f.Type
				relationConf = f.RelationConfig
				break
			}
		}

		if fieldType == "relation" && relationConf != nil {
			if relationConf.Cardinality == "M:N" {
				if _, ok := m.recordFormMultiSel[name]; !ok {
					var ids []string
					if val != "" {
						for _, part := range strings.Split(val, ",") {
							trimmed := strings.TrimSpace(part)
							if trimmed != "" {
								ids = append(ids, trimmed)
							}
						}
					}
					payload[name] = ids
				}
			} else {
				if val == "" || val == "(none)" {
					payload[name] = nil
				} else {
					payload[name] = val
				}
			}
			continue
		}

		if val == "" {
			if name == "password" || name == "passwordConfirm" {
				continue // skip blank passwords
			}
			payload[name] = nil
			continue
		}

		switch fieldType {
		case "number":
			var num float64
			if _, err := fmt.Sscanf(val, "%f", &num); err == nil {
				payload[name] = num
			} else {
				payload[name] = nil
			}
		case "bool":
			payload[name] = (strings.ToLower(val) == "true" || val == "1" || val == "yes")
		case "json":
			var jsonVal interface{}
			if err := json.Unmarshal([]byte(val), &jsonVal); err == nil {
				payload[name] = jsonVal
			} else {
				payload[name] = val // fallback to string
			}
		default:
			payload[name] = val
		}
	}

	for name, ids := range m.recordFormMultiSel {
		if ids != nil {
			payload[name] = *ids
		}
	}

	var err error
	if m.editRecordID != "" {
		_, err = m.Client.UpdateRecord(moul.Name, m.editRecordID, payload)
	} else {
		_, err = m.Client.CreateRecord(moul.Name, payload)
	}

	if err != nil {
		m.Err = err
		m.RecordForm.State = huh.StateNormal // Allow retry
		return
	}

	m.State = StateRecordList
	m.SuccessMsg = "Record saved successfully!"
	m.editRecordID = ""

	// Refresh list
	records, err := m.Client.ListRecords(moul.Name, m.getExpandFields(moul)...)
	if err == nil {
		m.Records = records
	}
}

// viewRecordEdit renders the huh form editor.
func (m *Model) viewRecordEdit() string {
	moul := m.currentMoul()
	if moul == nil {
		return "No active collection selected."
	}

	title := "Create new record"
	if m.editRecordID != "" {
		title = fmt.Sprintf("Edit record: %s", m.editRecordID)
	}

	var s strings.Builder
	s.WriteString(HeaderStyle.Render(fmt.Sprintf("%s - %s", title, moul.Name)))
	s.WriteString("\n")

	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Failed to save: %v", m.Err)))
		s.WriteString("\n")
	}

	formContainer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1, 2).
		Width(60)

	s.WriteString(formContainer.Render(m.RecordForm.View()))

	return ContentStyle.Width(m.Width).Render(s.String())
}

func (m *Model) getExpandFields(moul *schema.Moul) []string {
	if moul == nil {
		return nil
	}
	var expandList []string
	for _, field := range moul.Fields {
		if field.Type == "relation" {
			expandList = append(expandList, field.Name)
		}
	}
	return expandList
}
