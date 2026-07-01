package tui

import (
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

var (
	// ── Colors ──────────────────────────────────────────────────────
	ColorIndigo       = lipgloss.Color("#6366f1") // Indigo-500
	ColorIndigoLight  = lipgloss.Color("#818cf8") // Indigo-400
	ColorCyan         = lipgloss.Color("#06b6d4") // Cyan-500
	ColorCyanLight    = lipgloss.Color("#22d3ee") // Cyan-400
	ColorGreen        = lipgloss.Color("#10b981") // Emerald-500
	ColorRed          = lipgloss.Color("#ef4444") // Red-500
	ColorYellow       = lipgloss.Color("#f59e0b") // Amber-500
	ColorBgDark       = lipgloss.Color("#09090b") // Zinc-950
	ColorBgPanel      = lipgloss.Color("#18181b") // Zinc-900
	ColorBorder       = lipgloss.Color("#27272a") // Zinc-800
	ColorBorderActive = lipgloss.Color("#4f46e5") // Indigo-600
	ColorTextMuted    = lipgloss.Color("#71717a") // Zinc-500
	ColorTextLight    = lipgloss.Color("#fafafa") // Zinc-50
	ColorSelectionBg  = lipgloss.Color("#2e2a47") // Deep Indigo-900ish

	// ── Base Styles ─────────────────────────────────────────────────
	MainContainerStyle = lipgloss.NewStyle().
				Foreground(ColorTextLight).
				Padding(0, 0)

	// ── Sidebar Styles ──────────────────────────────────────────────
	SidebarStyle = lipgloss.NewStyle().
			Width(26).
			Border(lipgloss.NormalBorder(), false, true, false, false).
			BorderForeground(ColorBorder).
			Padding(1, 1)

	SidebarTitleStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorCyan).
				MarginBottom(1)

	SidebarItemActiveStyle = lipgloss.NewStyle().
				Foreground(ColorTextLight).
				Background(ColorSelectionBg).
				PaddingLeft(1).
				Bold(true)

	SidebarItemInactiveStyle = lipgloss.NewStyle().
				Foreground(ColorTextMuted).
				PaddingLeft(1)

	SidebarHeaderStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorIndigoLight).
				MarginTop(1).
				MarginBottom(0)

	// ── Content Area Styles ─────────────────────────────────────────
	ContentStyle = lipgloss.NewStyle().
			Padding(0, 1)

	HeaderStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorTextLight).
			Border(lipgloss.NormalBorder(), false, false, true, false).
			BorderForeground(ColorBorder).
			PaddingBottom(1).
			MarginBottom(1)

	TitleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorIndigoLight).
			Padding(0, 1)

	SubtitleStyle = lipgloss.NewStyle().
			Foreground(ColorTextMuted).
			Italic(true)

	StatusStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorGreen)

	// ── Table / Grid Styles ─────────────────────────────────────────
	TableHeaderStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorCyanLight).
				Border(lipgloss.NormalBorder(), false, false, true, false).
				BorderForeground(ColorBorder).
				Padding(0, 1)

	TableCellStyle = lipgloss.NewStyle().
			Foreground(ColorTextLight).
			Padding(0, 1)

	TableCellSelectedStyle = lipgloss.NewStyle().
				Foreground(ColorTextLight).
				Background(ColorSelectionBg).
				Bold(true).
				Padding(0, 1)

	// ── Form Styles ─────────────────────────────────────────────────
	FormLabelStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorIndigoLight).
			MarginTop(1)

	FormInputActiveStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(ColorCyan).
				Padding(0, 1)

	FormInputInactiveStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(ColorBorder).
				Padding(0, 1)

	ButtonStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorBgDark).
			Background(ColorIndigo).
			Padding(0, 2).
			MarginTop(1).
			MarginRight(1)

	ButtonActiveStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorBgDark).
				Background(ColorCyan).
				Padding(0, 2).
				MarginTop(1).
				MarginRight(1)

	// ── Banner / Alert Styles ───────────────────────────────────────
	AlertSuccessStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorBgDark).
				Background(ColorGreen).
				Padding(0, 1).
				MarginBottom(1)

	AlertErrorStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorTextLight).
			Background(ColorRed).
			Padding(0, 1).
			MarginBottom(1)

	AlertInfoStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorBgDark).
			Background(ColorCyan).
			Padding(0, 1).
			MarginBottom(1)

	// ── Scroll / Viewport Details ──────────────────────────────────
	DetailTitleStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorCyan).
				MarginBottom(1)

	DetailBodyStyle = lipgloss.NewStyle().
			Foreground(ColorTextLight).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Padding(1)

	HelpStyle = lipgloss.NewStyle().
			Foreground(ColorTextMuted).
			MarginTop(1)

	// ── Breadcrumbs ─────────────────────────────────────────────────
	BreadcrumbsContainerStyle = lipgloss.NewStyle().
					Background(ColorBgPanel).
					Foreground(ColorTextLight).
					Padding(0, 1).
					Border(lipgloss.NormalBorder(), false, false, true, false).
					BorderForeground(ColorBorder)

	BreadcrumbActiveStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorCyan)

	BreadcrumbInactiveStyle = lipgloss.NewStyle().
				Foreground(ColorTextMuted)

	BreadcrumbSeparatorStyle = lipgloss.NewStyle().
					Foreground(ColorBorder).
					Padding(0, 1)

	// ── Settings Columns ────────────────────────────────────────────
	SettingsPaneStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(ColorBorder).
				Padding(0, 1)

	SettingsPaneFocusedStyle = lipgloss.NewStyle().
					Border(lipgloss.RoundedBorder()).
					BorderForeground(ColorIndigo).
					Padding(0, 1)

	SettingsButtonAreaStyle = lipgloss.NewStyle().
				MarginTop(0).
				Padding(0, 1)
)

var ThemeCustom huh.ThemeFunc = func(isDark bool) *huh.Styles {
	styles := huh.ThemeCharm(isDark)
	styles.Focused.Title = styles.Focused.Title.Foreground(ColorCyan)
	styles.Focused.TextInput.Prompt = styles.Focused.TextInput.Prompt.Foreground(ColorCyan)
	styles.Focused.Base = styles.Focused.Base.BorderForeground(ColorIndigo).MarginBottom(0).PaddingBottom(0)
	styles.Blurred.Base = styles.Blurred.Base.MarginBottom(0).PaddingBottom(0)
	return styles
}
