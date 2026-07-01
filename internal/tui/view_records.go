package tui

import (
	"encoding/json"
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

// updateRecordList handles key presses in the records list screen.
func (m *Model) updateRecordList(msg tea.Msg) tea.Cmd {
	moul := m.currentMoul()
	if moul == nil {
		m.State = StateDashboard
		return nil
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
		case "enter", "v":
			// Open detail view
			if len(m.Records) > 0 && m.SelectedRecordIndex >= 0 && m.SelectedRecordIndex < len(m.Records) {
				record := m.Records[m.SelectedRecordIndex]
				jsonStr := formatJSON(record)
				m.Viewport.SetContent(jsonStr)
				m.Viewport.SetYOffset(0)
				m.State = StateRecordDetail
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
		case "r":
			// Refresh
			return m.fetchRecords()
		case "esc", "left", "h":
			m.State = StateDashboard
			m.Records = nil
			m.SelectedRecordIndex = 0
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
	s.WriteString(HeaderStyle.Render(fmt.Sprintf("Records in: %s", moul.Name)))
	s.WriteString("\n")

	if m.SuccessMsg != "" {
		s.WriteString(AlertSuccessStyle.Render(m.SuccessMsg))
		s.WriteString("\n")
	}
	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n")
	}

	if len(m.Records) == 0 {
		s.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  No records found in this collection.\n"))
		s.WriteString("\n")
		s.WriteString(HelpStyle.Render(" [n] Create new record  [r] Refresh  [Esc] Back"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

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
	maxRows := m.Height - 11
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
	s.WriteString(HelpStyle.Render(" ↑/↓: Scroll  [v/Enter] View  [n] New  [e] Edit  [d] Delete  [r] Refresh  [Esc] Back"))

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

	s.WriteString(DetailTitleStyle.Render("Payload view"))
	s.WriteString("\n")
	s.WriteString(DetailBodyStyle.Render(m.Viewport.View()))
	s.WriteString("\n\n")
	s.WriteString(HelpStyle.Render(" ↑/↓: Scroll  [e] Edit  [d] Delete  [Esc/q] Back to records list"))

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
			huh.NewInput().Title("Username").Value(&usernameVal),
			huh.NewInput().Title("Email").Value(&emailVal),
		)

		if !isEdit {
			pwdVal := ""
			pwdConfirmVal := ""
			m.recordFormData["password"] = &pwdVal
			m.recordFormData["passwordConfirm"] = &pwdConfirmVal
			fields = append(fields,
				huh.NewInput().Title("Password").Value(&pwdVal).EchoMode(huh.EchoModePassword),
				huh.NewInput().Title("Confirm Password").Value(&pwdConfirmVal).EchoMode(huh.EchoModePassword),
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

		valStr := ""
		if record != nil {
			if val, ok := record[f.Name]; ok && val != nil {
				valStr = fmt.Sprintf("%v", val)
			}
		}

		m.recordFormData[f.Name] = &valStr
		fields = append(fields, huh.NewInput().Title(fmt.Sprintf("%s (%s)", f.Name, f.Type)).Value(&valStr))
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
