package tui

import (
	"fmt"
	"regexp"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
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
		if len(subParts) != 2 {
			return fmt.Errorf("invalid format for %q: must be name:type", part)
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
			// valid
		default:
			return fmt.Errorf("invalid type %q for field %q (allowed: text, number, bool, json, file)", fType, fName)
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
		}
	}
	return fields
}

// initMoulForm initializes the collection creation form.
func (m *Model) initMoulForm() {
	m.newMoulName = ""
	m.newMoulType = "base"
	m.newMoulFields = ""

	theme := huh.ThemeCharm()
	theme.Focused.Title = theme.Focused.Title.Foreground(ColorCyan)
	theme.Focused.TextInput.Prompt = theme.Focused.TextInput.Prompt.Foreground(ColorCyan)
	theme.Focused.Base = theme.Focused.Base.BorderForeground(ColorIndigo)

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

			huh.NewInput().
				Title("Custom Fields (format: name:type, comma-separated)").
				Placeholder("e.g. title:text, views:number, published:bool").
				Value(&m.newMoulFields).
				Validate(validateFieldsString),
		),
	).WithTheme(theme)
}

// createMoulResultMsg is sent after the CreateMoul API call completes.
type createMoulResultMsg struct {
	mouls []schema.Moul
	err   error
}

// saveMoulForm creates a Moul schema and issues the backend API request.
func (m *Model) saveMoulForm() tea.Cmd {
	newMoul := &schema.Moul{
		Name:   strings.TrimSpace(m.newMoulName),
		Type:   m.newMoulType,
		Fields: parseFieldsString(m.newMoulFields),
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

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		HeaderStyle.Render("Create New Collection"),
		"",
		errMsg,
		formStyle.Render(m.MoulForm.View()),
	)

	return ContentStyle.Width(m.Width).Render(content)
}
