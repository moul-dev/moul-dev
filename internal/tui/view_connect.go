package tui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
)

// initConnectionForm initializes the connection setup form.
func (m *Model) initConnectionForm() {
	theme := huh.ThemeCharm()
	theme.Focused.Title = theme.Focused.Title.Foreground(ColorCyan)
	theme.Focused.TextInput.Prompt = theme.Focused.TextInput.Prompt.Foreground(ColorCyan)
	theme.Focused.Base = theme.Focused.Base.BorderForeground(ColorIndigo)

	m.ConnForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Server URL").
				Placeholder("http://localhost:8090").
				Value(&m.serverURL).
				Validate(func(str string) error {
					if strings.TrimSpace(str) == "" {
						return fmt.Errorf("server URL is required")
					}
					if !strings.HasPrefix(str, "http://") && !strings.HasPrefix(str, "https://") {
						return fmt.Errorf("URL must start with http:// or https://")
					}
					return nil
				}),

			huh.NewInput().
				Title("Admin Key (X-Admin-Key)").
				Placeholder("Enter admin key...").
				Value(&m.adminKey).
				EchoMode(huh.EchoModePassword).
				Validate(func(str string) error {
					if strings.TrimSpace(str) == "" {
						return fmt.Errorf("admin key is required to manage collections")
					}
					return nil
				}),
		),
	).WithTheme(theme)
}

// viewConnect renders the connection screen.
func (m *Model) viewConnect() string {
	logo := `
    __  ___  ____  __  __ __   
   /  |/  / / __ \/ / / // /   
  / /|_/ / / / / / / / // /    
 / /  / / / /_/ / /_/ // /___  
/_/  /_/  \____/\____//_____/  
`

	logoStyle := lipgloss.NewStyle().
		Foreground(ColorIndigoLight).
		Bold(true).
		MarginBottom(1)

	subTitleStyle := lipgloss.NewStyle().
		Foreground(ColorTextMuted).
		Italic(true).
		MarginBottom(2)

	formStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1, 2).
		Width(60)

	var errMsg string
	if m.Err != nil {
		errMsg = AlertErrorStyle.Render(fmt.Sprintf("Connection Error: %v", m.Err))
	}

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		logoStyle.Render(logo),
		subTitleStyle.Render("Bring Your Own Compute. Simplified."),
		errMsg,
		formStyle.Render(m.ConnForm.View()),
	)

	// Center the content on screen
	return lipgloss.Place(
		m.Width,
		m.Height,
		lipgloss.Center,
		lipgloss.Center,
		content,
	)
}
