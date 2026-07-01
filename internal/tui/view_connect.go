package tui

import (
	"fmt"
	"strings"

	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

func (m *Model) initConnectionForm() {
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
				Placeholder("Required to verify setup/configure system...").
				Value(&m.adminKey).
				EchoMode(huh.EchoModePassword).
				Validate(func(str string) error {
					if strings.TrimSpace(str) == "" {
						return fmt.Errorf("admin key is required")
					}
					return nil
				}),
		),
	).WithTheme(ThemeCustom)
}

func (m *Model) initRootSetupForm() {
	m.RootSetupForm = huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Root Username").
				Placeholder("e.g. admin").
				Value(&m.rootUsername).
				Validate(func(str string) error {
					if strings.TrimSpace(str) == "" {
						return fmt.Errorf("username is required")
					}
					return nil
				}),

			huh.NewInput().
				Title("Root Email").
				Placeholder("e.g. admin@moul.dev").
				Value(&m.rootEmail).
				Validate(func(str string) error {
					if !strings.Contains(str, "@") {
						return fmt.Errorf("invalid email address")
					}
					return nil
				}),

			huh.NewInput().
				Title("Password").
				Placeholder("••••••••").
				Value(&m.rootPassword).
				EchoMode(huh.EchoModePassword).
				Validate(func(str string) error {
					if len(str) < 8 {
						return fmt.Errorf("password must be at least 8 characters")
					}
					return nil
				}),

			huh.NewInput().
				Title("Confirm Password").
				Placeholder("••••••••").
				Value(&m.rootConfirmPass).
				EchoMode(huh.EchoModePassword).
				Validate(func(str string) error {
					if str != m.rootPassword {
						return fmt.Errorf("passwords do not match")
					}
					return nil
				}),
		),
	).WithTheme(ThemeCustom)
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
		errMsg = AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err))
	}

	var formView string
	var sectionTitle string = "Bring Your Own Compute. Simplified."

	if m.State == StateRootSetup {
		sectionTitle = "Initial Server Setup: Create Root User"
		if m.RootSetupForm != nil {
			formView = m.RootSetupForm.View()
		}
	} else {
		formView = m.ConnForm.View()
	}

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		logoStyle.Render(logo),
		subTitleStyle.Render(sectionTitle),
		errMsg,
		formStyle.Render(formView),
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
