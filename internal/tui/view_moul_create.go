package tui

import (
	"fmt"
	"regexp"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

var tableNamePattern = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_]{0,62}$`)

// validateFieldsString validates the custom fields input string.
func validateFieldsString(str string) error {
	fieldsStr := strings.TrimSpace(str)
	if fieldsStr == "" {
		return nil // no custom fields is fine
	}
	parts := strings.Split(fieldsStr, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		subParts := strings.Split(part, ":")
		if len(subParts) != 2 && len(subParts) != 4 {
			return fmt.Errorf("invalid format for %q: must be name:type or name:relation:targetMoul:cardinality", part)
		}
		fName := strings.TrimSpace(subParts[0])
		fType := strings.TrimSpace(subParts[1])
		if fName == "" {
			return fmt.Errorf("field name cannot be empty")
		}
		// Validate field name matches table name safety style
		if !tableNamePattern.MatchString(fName) {
			return fmt.Errorf("invalid field name %q: must start with a letter and contain only alphanumeric characters and underscores (max 63 chars)", fName)
		}
		// Validate type
		switch fType {
		case "text", "number", "bool", "json", "file":
			if len(subParts) != 2 {
				return fmt.Errorf("field %q of type %q cannot have extra parameters", fName, fType)
			}
		case "relation":
			if len(subParts) != 4 {
				return fmt.Errorf("relation field %q must specify target collection and cardinality (format: name:relation:targetMoul:cardinality)", fName)
			}
			targetMoul := strings.TrimSpace(subParts[2])
			cardinality := strings.TrimSpace(subParts[3])
			if targetMoul == "" {
				return fmt.Errorf("relation field %q must specify a target collection", fName)
			}
			if !tableNamePattern.MatchString(targetMoul) {
				return fmt.Errorf("invalid target collection name %q for field %q", targetMoul, fName)
			}
			if cardinality != "1:1" && cardinality != "1:N" && cardinality != "M:N" {
				return fmt.Errorf("invalid cardinality %q for relation field %q (allowed: 1:1, 1:N, M:N)", cardinality, fName)
			}
		default:
			return fmt.Errorf("invalid type %q for field %q (allowed: text, number, bool, json, file, relation)", fType, fName)
		}
	}
	return nil
}

// parseFieldsString parses a validated string to a slice of MoulField structs.
func parseFieldsString(str string) []schema.MoulField {
	var fields []schema.MoulField
	fieldsStr := strings.TrimSpace(str)
	if fieldsStr == "" {
		return fields
	}
	parts := strings.Split(fieldsStr, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		subParts := strings.Split(part, ":")
		if len(subParts) == 2 {
			fields = append(fields, schema.MoulField{
				Name: strings.TrimSpace(subParts[0]),
				Type: strings.TrimSpace(subParts[1]),
			})
		} else if len(subParts) == 4 && strings.TrimSpace(subParts[1]) == "relation" {
			fields = append(fields, schema.MoulField{
				Name: strings.TrimSpace(subParts[0]),
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  strings.TrimSpace(subParts[2]),
					Cardinality: strings.TrimSpace(subParts[3]),
				},
			})
		}
	}
	return fields
}

// initMoulForm initializes the collection creation form.
func (m *Model) initMoulForm() {
	m.newMoulName = ""
	m.newMoulType = "base"
	m.newMoulListRule = ""
	m.newMoulViewRule = ""
	m.newMoulCreateRule = ""
	m.newMoulUpdateRule = ""
	m.newMoulDeleteRule = ""
	m.newMoulFieldsList = []schema.MoulField{}
	m.moulWizardState = "metadata"
	m.isEditingField = false

	m.MoulForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Collection Name").
				Placeholder("e.g. posts").
				Value(&m.newMoulName).
				Validate(func(str string) error {
					name := strings.TrimSpace(str)
					if name == "" {
						return fmt.Errorf("collection name is required")
					}
					if strings.HasPrefix(name, "_") {
						return fmt.Errorf("collection name cannot start with underscore")
					}
					if !tableNamePattern.MatchString(name) {
						return fmt.Errorf("invalid name: must start with a letter and contain only letters, numbers, or underscores (max 63 chars)")
					}
					return nil
				}),

			huh.NewSelect[string]().
				Title("Collection Type").
				Options(
					huh.NewOption("Base (Standard Table)", "base"),
					huh.NewOption("Auth (User Management Table)", "auth"),
					huh.NewOption("Worker (Job Queue Table)", "worker"),
					huh.NewOption("Analytic (Traffic Tracking Table)", "analytic"),
				).
				Value(&m.newMoulType),
		),
	).WithTheme(ThemeCustom)
}

// initMoulActionForm initializes the field manager main action form.
func (m *Model) initMoulActionForm() {
	m.newMoulAction = "add"

	var options []huh.Option[string]
	options = append(options, huh.NewOption("Add custom field", "add"))
	if len(m.newMoulFieldsList) > 0 {
		options = append(options, huh.NewOption("Edit custom field", "edit"))
		options = append(options, huh.NewOption("Delete custom field", "delete"))
	}
	options = append(options,
		huh.NewOption("Customize Access Rules", "rules"),
		huh.NewOption("Save Collection", "save"),
		huh.NewOption("Cancel", "cancel"),
	)

	m.MoulActionForm = huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Select Action").
				Options(options...).
				Value(&m.newMoulAction),
		),
	).WithTheme(ThemeCustom)
}

// initMoulFieldForm initializes the field creator sub-form.
func (m *Model) initMoulFieldForm() {
	if !m.isEditingField {
		m.newFieldName = ""
		m.newFieldType = "text"
		m.newFieldRelationTarget = ""
		m.newFieldRelationCard = "1:N"
	} else {
		var fToEdit *schema.MoulField
		for i := range m.newMoulFieldsList {
			if m.newMoulFieldsList[i].Name == m.editingFieldName {
				fToEdit = &m.newMoulFieldsList[i]
				break
			}
		}
		if fToEdit != nil {
			m.newFieldName = fToEdit.Name
			m.newFieldType = fToEdit.Type
			if fToEdit.Type == "relation" && fToEdit.RelationConfig != nil {
				m.newFieldRelationTarget = fToEdit.RelationConfig.TargetMoul
				m.newFieldRelationCard = fToEdit.RelationConfig.Cardinality
			} else {
				m.newFieldRelationTarget = ""
				m.newFieldRelationCard = "1:N"
			}
		}
	}

	// Construct target collection options
	var targetOptions []huh.Option[string]
	if m.newMoulName != "" {
		targetOptions = append(targetOptions, huh.NewOption[string](m.newMoulName+" (self)", m.newMoulName))
		if m.newFieldRelationTarget == "" {
			m.newFieldRelationTarget = m.newMoulName
		}
	}
	for _, moul := range m.Mouls {
		if moul.Name != m.newMoulName {
			targetOptions = append(targetOptions, huh.NewOption[string](moul.Name, moul.Name))
			if m.newFieldRelationTarget == "" {
				m.newFieldRelationTarget = moul.Name
			}
		}
	}
	if len(targetOptions) == 0 {
		targetOptions = append(targetOptions, huh.NewOption[string]("(none available)", ""))
		m.newFieldRelationTarget = ""
	} else {
		// Set default target if not set yet or invalid
		foundTarget := false
		for _, opt := range targetOptions {
			if opt.Value == m.newFieldRelationTarget {
				foundTarget = true
				break
			}
		}
		if !foundTarget {
			m.newFieldRelationTarget = targetOptions[0].Value
		}
	}

	m.MoulFieldForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Field Name").
				Placeholder("e.g. title").
				Value(&m.newFieldName).
				Validate(func(str string) error {
					name := strings.TrimSpace(str)
					if name == "" {
						return fmt.Errorf("field name is required")
					}
					if !tableNamePattern.MatchString(name) {
						return fmt.Errorf("invalid name: must start with a letter and contain only alphanumeric characters and underscores (max 63 chars)")
					}
					for _, f := range m.newMoulFieldsList {
						if f.Name == name {
							if m.isEditingField && name == m.editingFieldName {
								continue
							}
							return fmt.Errorf("field name %q already exists", name)
						}
					}
					return nil
				}),

			huh.NewSelect[string]().
				Title("Field Type").
				Options(
					huh.NewOption("Text (String)", "text"),
					huh.NewOption("Number (Numeric/Float)", "number"),
					huh.NewOption("Boolean (True/False)", "bool"),
					huh.NewOption("JSON (Structured Object/Array)", "json"),
					huh.NewOption("File (File Metadata)", "file"),
					huh.NewOption("Association (Relation to other collection)", "relation"),
				).
				Value(&m.newFieldType),
		),
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Target Collection").
				Options(targetOptions...).
				Value(&m.newFieldRelationTarget),

			huh.NewSelect[string]().
				Title("Association Cardinality").
				Options(
					huh.NewOption("1:1 (One to One)", "1:1"),
					huh.NewOption("1:N (One to Many / Belongs To)", "1:N"),
					huh.NewOption("M:N (Many to Many)", "M:N"),
				).
				Value(&m.newFieldRelationCard),
		).WithHideFunc(func() bool {
			return m.newFieldType != "relation"
		}),
	).WithTheme(ThemeCustom)
}

// initMoulFieldDeleteForm initializes the selector to delete a custom field.
func (m *Model) initMoulFieldDeleteForm() {
	m.fieldToDelete = ""
	var options []huh.Option[string]
	for _, f := range m.newMoulFieldsList {
		options = append(options, huh.NewOption[string](f.Name, f.Name))
	}
	if len(options) > 0 {
		m.fieldToDelete = options[0].Value
	}

	m.MoulFieldDeleteForm = huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Select Field to Delete").
				Options(options...).
				Value(&m.fieldToDelete),
		),
	).WithTheme(ThemeCustom)
}

// initMoulFieldSelectForm initializes the selector to edit a custom field.
func (m *Model) initMoulFieldSelectForm() {
	m.fieldToEdit = ""
	var options []huh.Option[string]
	for _, f := range m.newMoulFieldsList {
		options = append(options, huh.NewOption[string](f.Name, f.Name))
	}
	if len(options) > 0 {
		m.fieldToEdit = options[0].Value
	}

	m.MoulFieldSelectForm = huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Select Field to Edit").
				Options(options...).
				Value(&m.fieldToEdit),
		),
	).WithTheme(ThemeCustom)
}

// initMoulRulesForm initializes the custom access rules form.
func (m *Model) initMoulRulesForm() {
	m.MoulRulesForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("List Access Rule (empty for public)").
				Placeholder("e.g. auth.id != nil").
				Value(&m.newMoulListRule),

			huh.NewInput().
				Title("View Access Rule (empty for public)").
				Placeholder("e.g. auth.id != nil").
				Value(&m.newMoulViewRule),

			huh.NewInput().
				Title("Create Access Rule (empty for public)").
				Placeholder("e.g. auth.id != nil").
				Value(&m.newMoulCreateRule),

			huh.NewInput().
				Title("Update Access Rule (empty for public)").
				Placeholder("e.g. auth.id == author_id").
				Value(&m.newMoulUpdateRule),

			huh.NewInput().
				Title("Delete Access Rule (empty for public)").
				Placeholder("e.g. auth.id == author_id").
				Value(&m.newMoulDeleteRule),
		),
	).WithTheme(ThemeCustom)
}

// createMoulResultMsg is sent after the CreateMoul API call completes.
type createMoulResultMsg struct {
	mouls []schema.Moul
	err   error
}

// saveMoulForm creates a Moul schema and issues the backend API request.
func (m *Model) saveMoulForm() tea.Cmd {
	listRule := strings.TrimSpace(m.newMoulListRule)
	viewRule := strings.TrimSpace(m.newMoulViewRule)
	createRule := strings.TrimSpace(m.newMoulCreateRule)
	updateRule := strings.TrimSpace(m.newMoulUpdateRule)
	deleteRule := strings.TrimSpace(m.newMoulDeleteRule)

	newMoul := &schema.Moul{
		Name:   strings.TrimSpace(m.newMoulName),
		Type:   m.newMoulType,
		Fields: m.newMoulFieldsList,
		Rules: schema.MoulRules{
			ListRule:   listRule,
			ViewRule:   viewRule,
			CreateRule: createRule,
			UpdateRule: updateRule,
			DeleteRule: deleteRule,
		},
	}

	return func() tea.Msg {
		err := m.Client.CreateMoul(newMoul)
		if err != nil {
			return createMoulResultMsg{err: err}
		}
		mouls, err := m.Client.ListMouls()
		return createMoulResultMsg{mouls: mouls, err: err}
	}
}

// viewMoulCreate renders the collection creation screen.
func (m *Model) viewMoulCreate() string {
	var errMsg string
	if m.Err != nil {
		errMsg = AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err))
	}

	formStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1, 2).
		Width(60)

	var innerView string
	switch m.moulWizardState {
	case "metadata":
		innerView = formStyle.Render(m.MoulForm.View())
	case "fields":
		var s strings.Builder
		s.WriteString(lipgloss.NewStyle().Foreground(ColorCyan).Bold(true).Render("Collection: ") + m.newMoulName + " (" + m.newMoulType + ")\n\n")
		s.WriteString(lipgloss.NewStyle().Bold(true).Render("Fields List:") + "\n")
		s.WriteString("  - id (system, text)\n")
		if m.newMoulType == "auth" {
			s.WriteString("  - username (system, text)\n")
			s.WriteString("  - email (system, text)\n")
			s.WriteString("  - created_at (system, text)\n")
			s.WriteString("  - updated_at (system, text)\n")
		} else if m.newMoulType == "worker" {
			s.WriteString("  - state (system, text)\n")
			s.WriteString("  - queue (system, text)\n")
			s.WriteString("  - worker (system, text)\n")
			s.WriteString("  - inserted_at (system, text)\n")
		} else if m.newMoulType == "analytic" {
			s.WriteString("  - visit_token (system, text)\n")
			s.WriteString("  - visitor_token (system, text)\n")
			s.WriteString("  - name (system, text)\n")
			s.WriteString("  - time (system, text)\n")
		} else {
			s.WriteString("  - created_at (system, text)\n")
			s.WriteString("  - updated_at (system, text)\n")
		}

		for _, f := range m.newMoulFieldsList {
			if f.Type == "relation" && f.RelationConfig != nil {
				s.WriteString(fmt.Sprintf("  - %s (relation:%s %s)\n", f.Name, f.RelationConfig.TargetMoul, f.RelationConfig.Cardinality))
			} else {
				s.WriteString(fmt.Sprintf("  - %s (%s)\n", f.Name, f.Type))
			}
		}
		s.WriteString("\n")
		s.WriteString(m.MoulActionForm.View())
		innerView = formStyle.Render(s.String())
	case "add_field":
		title := "Add Custom Field"
		if m.isEditingField {
			title = "Edit Custom Field: " + m.editingFieldName
		}
		innerView = formStyle.Render(lipgloss.JoinVertical(
			lipgloss.Left,
			lipgloss.NewStyle().Foreground(ColorCyan).Bold(true).Render(title),
			"",
			m.MoulFieldForm.View(),
		))
	case "edit_select":
		innerView = formStyle.Render(lipgloss.JoinVertical(
			lipgloss.Left,
			lipgloss.NewStyle().Foreground(ColorCyan).Bold(true).Render("Edit Custom Field"),
			"",
			m.MoulFieldSelectForm.View(),
		))
	case "delete_select":
		innerView = formStyle.Render(lipgloss.JoinVertical(
			lipgloss.Left,
			lipgloss.NewStyle().Foreground(ColorRed).Bold(true).Render("Delete Custom Field"),
			"",
			m.MoulFieldDeleteForm.View(),
		))
	case "rules":
		innerView = formStyle.Render(lipgloss.JoinVertical(
			lipgloss.Left,
			lipgloss.NewStyle().Foreground(ColorCyan).Bold(true).Render("Customize Collection Access Rules"),
			"",
			m.MoulRulesForm.View(),
		))
	}

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		HeaderStyle.Render("Create New Collection"),
		"",
		errMsg,
		innerView,
	)

	return ContentStyle.Width(m.Width).Render(content)
}
