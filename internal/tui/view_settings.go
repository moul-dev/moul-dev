package tui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
)

// initSettingsForm initializes the system settings editor form.
func (m *Model) initSettingsForm() {
	theme := huh.ThemeCharm()
	theme.Focused.Title = theme.Focused.Title.Foreground(ColorCyan)
	theme.Focused.TextInput.Prompt = theme.Focused.TextInput.Prompt.Foreground(ColorCyan)
	theme.Focused.Base = theme.Focused.Base.BorderForeground(ColorIndigo)

	m.SettingsForm = huh.NewForm(
		// Group 0: Toggle Settings
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("S3 Enabled").
				Options(
					huh.NewOption("Yes", "true"),
					huh.NewOption("No", "false"),
				).
				Value(&m.settingFileS3Enabled),

			huh.NewSelect[string]().
				Title("Litestream Enabled").
				Options(
					huh.NewOption("Yes", "true"),
					huh.NewOption("No", "false"),
				).
				Value(&m.settingLiteEnabled),
		),

		// Group 1: S3 Details (hidden if S3 is not enabled)
		huh.NewGroup(
			huh.NewInput().
				Title("S3 Bucket").
				Placeholder("e.g. my-bucket-name").
				Value(&m.settingFileS3Bucket),

			huh.NewInput().
				Title("S3 Endpoint").
				Placeholder("e.g. s3.amazonaws.com").
				Value(&m.settingFileS3Endpoint),

			huh.NewInput().
				Title("S3 Region").
				Placeholder("e.g. us-east-1").
				Value(&m.settingFileS3Region),

			huh.NewInput().
				Title("S3 Access Key").
				Placeholder("e.g. AKIA...").
				Value(&m.settingFileS3AccessKey),

			huh.NewInput().
				Title("S3 Secret Key").
				Placeholder("••••••••").
				Value(&m.settingFileS3SecretKey).
				EchoMode(huh.EchoModePassword),

			huh.NewSelect[string]().
				Title("S3 Force Path Style").
				Options(
					huh.NewOption("Yes", "true"),
					huh.NewOption("No", "false"),
				).
				Value(&m.settingFileS3ForcePath),
		).WithHideFunc(func() bool {
			return m.settingFileS3Enabled != "true"
		}),

		// Group 2: Litestream Details (hidden if Litestream is not enabled)
		huh.NewGroup(
			huh.NewInput().
				Title("Litestream S3 Bucket").
				Placeholder("e.g. my-backup-bucket").
				Value(&m.settingLiteS3Bucket),

			huh.NewInput().
				Title("Litestream S3 Endpoint").
				Placeholder("e.g. s3.amazonaws.com").
				Value(&m.settingLiteS3Endpoint),

			huh.NewInput().
				Title("Litestream Region").
				Placeholder("e.g. us-east-1").
				Value(&m.settingLiteS3Region),

			huh.NewInput().
				Title("Litestream Access Key ID").
				Placeholder("e.g. AKIA...").
				Value(&m.settingLiteAccessKey),

			huh.NewInput().
				Title("Litestream Secret Access Key").
				Placeholder("••••••••").
				Value(&m.settingLiteSecretKey).
				EchoMode(huh.EchoModePassword),

			huh.NewSelect[string]().
				Title("Litestream S3 Force Path Style").
				Options(
					huh.NewOption("Yes", "true"),
					huh.NewOption("No", "false"),
				).
				Value(&m.settingLiteS3ForcePath),

			huh.NewInput().
				Title("Litestream Replica Path").
				Placeholder("e.g. s3://my-bucket/replica").
				Value(&m.settingLiteReplica),
		).WithHideFunc(func() bool {
			return m.settingLiteEnabled != "true"
		}),
	).WithTheme(theme)
}

// saveSettingsForm compiles form values and saves them on the server.
func (m *Model) saveSettingsForm() {
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
	}

	_, err := m.Client.UpdateSettings(payload)
	if err != nil {
		m.Err = err
		m.SettingsForm.State = huh.StateNormal // Allow retry
		return
	}

	m.State = StateDashboard
	m.SuccessMsg = "Settings saved successfully!"
}

// viewSettings renders the settings form with headers.
func (m *Model) viewSettings() string {
	var s strings.Builder
	s.WriteString(HeaderStyle.Render("System Settings - S3 Storage & Litestream Backup"))
	s.WriteString("\n")

	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Failed to save settings: %v", m.Err)))
		s.WriteString("\n")
	}

	formContainer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(ColorBorder).
		Padding(1, 2).
		Width(60)

	s.WriteString(formContainer.Render(m.SettingsForm.View()))

	return ContentStyle.Width(m.Width).Render(s.String())
}
