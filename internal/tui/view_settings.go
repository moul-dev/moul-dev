package tui

import (
	"fmt"
	"strings"

	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

// initSettingsForm initializes the system settings editor form.
func (m *Model) initSettingsForm() {
	var storageFields []huh.Field
	storageFields = append(storageFields,
		huh.NewSelect[string]().
			Title("S3 Storage Enabled").
			Options(
				huh.NewOption("Yes", "true"),
				huh.NewOption("No", "false"),
			).
			Value(&m.settingFileS3Enabled),
	)

	if m.settingFileS3Enabled == "true" {
		storageFields = append(storageFields,
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
		)
	}

	m.lastStorageField = storageFields[len(storageFields)-1]

	m.StorageSettingsForm = huh.NewForm(
		huh.NewGroup(storageFields...),
	).WithTheme(ThemeCustom)

	var liteFields []huh.Field
	liteFields = append(liteFields,
		huh.NewSelect[string]().
			Title("Litestream Enabled").
			Options(
				huh.NewOption("Yes", "true"),
				huh.NewOption("No", "false"),
			).
			Value(&m.settingLiteEnabled),
	)

	if m.settingLiteEnabled == "true" {
		liteFields = append(liteFields,
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
		)
	}

	m.lastLiteField = liteFields[len(liteFields)-1]

	m.LiteSettingsForm = huh.NewForm(
		huh.NewGroup(liteFields...),
	).WithTheme(ThemeCustom)
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
		// Reset forms state to allow retries
		m.StorageSettingsForm.State = huh.StateNormal
		m.LiteSettingsForm.State = huh.StateNormal
		return
	}

	m.State = StateDashboard
	m.SuccessMsg = "Settings saved successfully!"
}

// viewSettings renders the settings split screen layout.
func (m *Model) viewSettings() string {
	var s strings.Builder

	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Failed to save settings: %v", m.Err)))
		s.WriteString("\n")
	}

	colWidth := (m.Width - 6) / 2
	if colWidth < 20 {
		colWidth = 20
	}

	// Dynamic height calculation
	headerHeight := 2 // breadcrumbs
	if m.Err != nil {
		headerHeight += 2
	}
	formHeight := m.Height - headerHeight - 8
	if formHeight < 6 {
		formHeight = 6
	}

	// Update width and height on both forms
	m.StorageSettingsForm.WithWidth(colWidth).WithHeight(formHeight)
	m.LiteSettingsForm.WithWidth(colWidth).WithHeight(formHeight)

	// Determine split pane styling based on current focus
	storageStyle := SettingsPaneStyle
	liteStyle := SettingsPaneStyle

	if m.SettingsFocus == FocusStorage {
		storageStyle = SettingsPaneFocusedStyle
	} else if m.SettingsFocus == FocusLite {
		liteStyle = SettingsPaneFocusedStyle
	}

	// Render Left and Right panels
	storageView := storageStyle.Width(colWidth).Height(formHeight).Render(
		lipgloss.JoinVertical(lipgloss.Left,
			lipgloss.NewStyle().Bold(true).Foreground(ColorIndigoLight).Render(" S3 STORAGE SETTINGS"),
			"",
			m.StorageSettingsForm.View(),
		),
	)

	liteView := liteStyle.Width(colWidth).Height(formHeight).Render(
		lipgloss.JoinVertical(lipgloss.Left,
			lipgloss.NewStyle().Bold(true).Foreground(ColorIndigoLight).Render(" LITESTREAM BACKUP SETTINGS"),
			"",
			m.LiteSettingsForm.View(),
		),
	)

	// Render side-by-side pane
	s.WriteString(lipgloss.JoinHorizontal(lipgloss.Top, storageView, "  ", liteView))
	s.WriteString("\n")

	// Render Save/Cancel Buttons
	saveBtnStyle := ButtonStyle
	cancelBtnStyle := ButtonStyle

	if m.SettingsFocus == FocusSave {
		saveBtnStyle = ButtonActiveStyle
	} else if m.SettingsFocus == FocusCancel {
		cancelBtnStyle = ButtonActiveStyle
	}

	buttons := lipgloss.JoinHorizontal(
		lipgloss.Left,
		saveBtnStyle.Render(" Save Settings "),
		"  ",
		cancelBtnStyle.Render(" Cancel "),
	)

	s.WriteString(SettingsButtonAreaStyle.Render(buttons))

	return ContentStyle.Width(m.Width).Render(s.String())
}
