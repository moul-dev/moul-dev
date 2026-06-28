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

			huh.NewSelect[string]().
				Title("Authentication Method").
				Options(
					huh.NewOption("Admin Key (X-Admin-Key)", "admin_key"),
					huh.NewOption("Device Authorization Flow (OAuth 2.0)", "device_flow"),
				).
				Value(&m.authMode),

			huh.NewInput().
				Title("Admin Key (X-Admin-Key)").
				Placeholder("Required for Admin Key mode (leave blank for Device Flow)...").
				Value(&m.adminKey).
				EchoMode(huh.EchoModePassword).
				Validate(func(str string) error {
					if m.authMode == "admin_key" && strings.TrimSpace(str) == "" {
						return fmt.Errorf("admin key is required to manage collections")
					}
					return nil
				}),
		),
	).WithTheme(theme)
}

// viewConnect renders the connection screen.
func (m *Model) viewConnect() string {
	if m.State == StateDeviceAuth {
		return m.viewDeviceAuth()
	}

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

// viewDeviceAuth renders the device flow polling screen.
func (m *Model) viewDeviceAuth() string {
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

	cardStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorIndigo).
		Padding(1, 2).
		Width(60)

	titleStyle := lipgloss.NewStyle().
		Foreground(ColorCyan).
		Bold(true).
		MarginBottom(1)

	codeStyle := lipgloss.NewStyle().
		Foreground(ColorCyan).
		Bold(true).
		Background(lipgloss.Color("#1e1e2e")).
		Padding(1, 4).
		Margin(1, 0)

	urlStyle := lipgloss.NewStyle().
		Foreground(ColorIndigoLight).
		Underline(true)

	var errMsg string
	if m.Err != nil {
		errMsg = AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err))
	}

	var cardContent strings.Builder
	cardContent.WriteString(lipgloss.PlaceHorizontal(54, lipgloss.Center, titleStyle.Render("DEVICE AUTHORIZATION REQUIRED")) + "\n\n")
	cardContent.WriteString("  Please open your browser, visit the URL below and enter the\n  following code if prompted:\n\n")
	
	// Centered Code
	cardContent.WriteString(lipgloss.PlaceHorizontal(54, lipgloss.Center, codeStyle.Render(m.userCode)) + "\n\n")
	
	// URL
	cardContent.WriteString("  Verification URL:\n")
	cardContent.WriteString("  " + urlStyle.Render(m.verificationURI) + "\n\n")
	
	cardContent.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  ✓ Copied code to clipboard\n  ✓ Attempted to open browser automatically\n\n"))
	
	// Polling / Spinner info
	cardContent.WriteString(lipgloss.NewStyle().Foreground(ColorIndigoLight).Render("  ⟳ Waiting for authorization in browser...") + "\n\n")
	cardContent.WriteString(HelpStyle.Render("  [Esc] Cancel and go back"))

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		logoStyle.Render(logo),
		subTitleStyle.Render("Bring Your Own Compute. Simplified."),
		errMsg,
		cardStyle.Render(cardContent.String()),
	)

	return lipgloss.Place(
		m.Width,
		m.Height,
		lipgloss.Center,
		lipgloss.Center,
		content,
	)
}
