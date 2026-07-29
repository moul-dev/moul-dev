package tui

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

type featureFlagsMsg struct {
	flags []FeatureFlagItem
}

type featureFlagSavedMsg struct {
	err error
}

type featureFlagEvalMsg struct {
	result *EvaluationResultItem
	err    error
}

// fetchFeatureFlags fetches all feature flags from the server.
func (m *Model) fetchFeatureFlags() tea.Cmd {
	return func() tea.Msg {
		flags, err := m.Client.ListFeatureFlags()
		if err != nil {
			return ErrMsg{err}
		}
		return featureFlagsMsg{flags}
	}
}

// updateFeatureFlags handles input & interactions in the Feature Flags view.
func (m *Model) updateFeatureFlags(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case featureFlagsMsg:
		m.FeatureFlags = msg.flags
		if m.SelectedFlagIndex >= len(m.FeatureFlags) && len(m.FeatureFlags) > 0 {
			m.SelectedFlagIndex = len(m.FeatureFlags) - 1
		}

	case tea.KeyPressMsg:
		switch msg.String() {
		case "up", "k":
			if m.SelectedFlagIndex > 0 {
				m.SelectedFlagIndex--
			}
		case "down", "j":
			if m.SelectedFlagIndex < len(m.FeatureFlags)-1 {
				m.SelectedFlagIndex++
			}
		case "space", "t": // Toggle Flag Enabled switch
			if len(m.FeatureFlags) > 0 && m.SelectedFlagIndex < len(m.FeatureFlags) {
				targetFlag := m.FeatureFlags[m.SelectedFlagIndex]
				newEnabled := !targetFlag.Enabled
				return func() tea.Msg {
					err := m.Client.UpdateFeatureFlag(targetFlag.Key, map[string]interface{}{
						"enabled": newEnabled,
					})
					if err != nil {
						return ErrMsg{err}
					}
					return m.fetchFeatureFlags()()
				}
			}
		case "n": // New Flag
			return m.initFeatureFlagForm(false)

		case "e": // Edit Flag
			if len(m.FeatureFlags) > 0 && m.SelectedFlagIndex < len(m.FeatureFlags) {
				return m.initFeatureFlagForm(true)
			}

		case "x": // Evaluate / Test Flag
			if len(m.FeatureFlags) > 0 && m.SelectedFlagIndex < len(m.FeatureFlags) {
				return m.initFeatureFlagEvalForm()
			}

		case "r": // Refresh flags
			return m.fetchFeatureFlags()

		case "d": // Delete Flag
			if len(m.FeatureFlags) > 0 && m.SelectedFlagIndex < len(m.FeatureFlags) {
				targetFlag := m.FeatureFlags[m.SelectedFlagIndex]
				return func() tea.Msg {
					err := m.Client.DeleteFeatureFlag(targetFlag.Key)
					if err != nil {
						return ErrMsg{err}
					}
					m.SuccessMsg = fmt.Sprintf("Flag %q deleted successfully", targetFlag.Key)
					return m.fetchFeatureFlags()()
				}
			}

		case "esc", "escape", "left", "h":
			m.State = StateDashboard
			m.Err = nil
			m.SuccessMsg = ""
		}
	}
	return nil
}

// viewFeatureFlagsPage renders full page Feature Flags state.
func (m *Model) viewFeatureFlagsPage() string {
	var s strings.Builder
	s.WriteString(m.renderBreadcrumbs())
	s.WriteString("\n\n")

	if m.SuccessMsg != "" {
		s.WriteString("  " + AlertSuccessStyle.Render(m.SuccessMsg) + "\n\n")
	} else if m.Err != nil {
		s.WriteString("  " + AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)) + "\n\n")
	}

	contentWidth := m.Width - 4
	if contentWidth < 20 {
		contentWidth = 20
	}
	contentHeight := m.Height - 6
	if contentHeight < 10 {
		contentHeight = 10
	}

	s.WriteString(m.viewFeatureFlags(contentWidth, contentHeight))
	return s.String()
}

// viewFeatureFlags renders the Feature Flags list and detail inspector.
func (m *Model) viewFeatureFlags(width, height int) string {
	var s strings.Builder
	s.WriteString(HeaderStyle.Render(" 🚩 FEATURE FLAGS CONSOLE"))
	s.WriteString("\n\n")

	if len(m.FeatureFlags) == 0 {
		s.WriteString(HelpStyle.Render(" No feature flags found. Press [n] to create your first feature flag."))
		s.WriteString("\n\n")
		s.WriteString(HelpStyle.Render(" [n] New Flag  |  [r] Refresh  |  [Esc] Back"))
		return s.String()
	}

	// Calculate split heights: 40% for list, 60% for detail inspector
	listHeight := (height * 4) / 10
	if listHeight < 3 {
		listHeight = 3
	}

	s.WriteString(FormLabelStyle.Render("FEATURE FLAGS LIST"))
	s.WriteString("\n")

	for i, flag := range m.FeatureFlags {
		if i >= listHeight && i != m.SelectedFlagIndex && i != listHeight-1 {
			// Limit rendered rows to listHeight
			continue
		}

		status := "[OFF]"
		statusStyle := lipgloss.NewStyle().Foreground(ColorTextMuted)
		if flag.Enabled {
			status = "[ON]"
			statusStyle = lipgloss.NewStyle().Foreground(ColorGreen).Bold(true)
		}

		// Summary of gates
		var gatesSummary []string
		if pct, ok := flag.Gates["percentage"].(map[string]interface{}); ok {
			if pVal, ok := pct["percentage"].(float64); ok && pVal > 0 {
				gatesSummary = append(gatesSummary, fmt.Sprintf("%.0f%% rollout", pVal))
			}
		}
		if actors, ok := flag.Gates["actors"].(map[string]interface{}); ok && len(actors) > 0 {
			gatesSummary = append(gatesSummary, fmt.Sprintf("%d actors", len(actors)))
		}
		if groups, ok := flag.Gates["groups"].(map[string]interface{}); ok && len(groups) > 0 {
			gatesSummary = append(gatesSummary, fmt.Sprintf("%d groups", len(groups)))
		}
		gatesStr := ""
		if len(gatesSummary) > 0 {
			gatesStr = lipgloss.NewStyle().Foreground(ColorIndigoLight).Render("(" + strings.Join(gatesSummary, ", ") + ")")
		}

		line := fmt.Sprintf(" %-24s %s  %-30s %s", flag.Key, statusStyle.Render(status), flag.Description, gatesStr)
		if i == m.SelectedFlagIndex {
			s.WriteString(SidebarItemActiveStyle.Width(width - 2).Render(line))
		} else {
			s.WriteString(SidebarItemInactiveStyle.Render(line))
		}
		s.WriteString("\n")
	}

	s.WriteString("\n")
	s.WriteString(FormLabelStyle.Render("FLAG DETAIL INSPECTOR"))
	s.WriteString("\n")

	if m.SelectedFlagIndex < len(m.FeatureFlags) {
		flag := m.FeatureFlags[m.SelectedFlagIndex]
		var details strings.Builder

		statusText := "DISABLED (master switch OFF)"
		if flag.Enabled {
			statusText = "ENABLED (active)"
		}

		details.WriteString(fmt.Sprintf("  • Key:           %s\n", lipgloss.NewStyle().Bold(true).Foreground(ColorCyan).Render(flag.Key)))
		details.WriteString(fmt.Sprintf("  • Status:        %s\n", statusText))
		details.WriteString(fmt.Sprintf("  • Description:   %s\n", flag.Description))
		details.WriteString(fmt.Sprintf("  • Default Value: %s\n", flag.DefaultValue))

		// Render targeting gates details
		var gateLines []string
		if pct, ok := flag.Gates["percentage"].(map[string]interface{}); ok {
			if pVal, ok := pct["percentage"].(float64); ok {
				attr := "user_id / target_id"
				if a, ok := pct["attribute"].(string); ok && a != "" {
					attr = a
				}
				gateLines = append(gateLines, fmt.Sprintf("Percentage Rollout: %.2f%% (Attribute: %s)", pVal, attr))
			}
		}
		if actors, ok := flag.Gates["actors"].(map[string]interface{}); ok && len(actors) > 0 {
			var actorList []string
			for k := range actors {
				actorList = append(actorList, k)
			}
			gateLines = append(gateLines, fmt.Sprintf("Targeted Actors (%d): %s", len(actors), strings.Join(actorList, ", ")))
		}
		if groups, ok := flag.Gates["groups"].(map[string]interface{}); ok && len(groups) > 0 {
			var groupList []string
			for k := range groups {
				groupList = append(groupList, k)
			}
			gateLines = append(gateLines, fmt.Sprintf("Targeted Groups (%d): %s", len(groups), strings.Join(groupList, ", ")))
		}

		if len(gateLines) > 0 {
			details.WriteString("  • Gates:\n")
			for _, gLine := range gateLines {
				details.WriteString(fmt.Sprintf("     - %s\n", gLine))
			}
		} else {
			details.WriteString("  • Gates:         None (All enabled users receive default value)\n")
		}

		details.WriteString(fmt.Sprintf("  • Created At:    %s\n", formatTime(flag.CreatedAt)))
		details.WriteString(fmt.Sprintf("  • Updated At:    %s\n", formatTime(flag.UpdatedAt)))

		inspectorBox := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Padding(0, 1).
			Width(width - 2).
			Render(details.String())

		s.WriteString(inspectorBox)
		s.WriteString("\n")
	}

	s.WriteString(HelpStyle.Render(" [Space/t] Toggle ON/OFF  |  [n] New  |  [e] Edit  |  [x] Evaluate  |  [d] Delete  |  [r] Refresh  |  [Esc] Back"))

	return s.String()
}

// initFeatureFlagForm initializes form for creating or editing a feature flag.
func (m *Model) initFeatureFlagForm(isEdit bool) tea.Cmd {
	m.isEditingFlag = isEdit

	enabledStr := "true"
	if isEdit && m.SelectedFlagIndex < len(m.FeatureFlags) {
		flag := m.FeatureFlags[m.SelectedFlagIndex]
		m.flagFormKey = flag.Key
		m.flagFormDescription = flag.Description
		if !flag.Enabled {
			enabledStr = "false"
		}
		m.flagFormDefaultValue = flag.DefaultValue
		if m.flagFormDefaultValue == "" {
			m.flagFormDefaultValue = "false"
		}

		// Extract gate rules
		m.flagFormPercentage = "0"
		if pct, ok := flag.Gates["percentage"].(map[string]interface{}); ok {
			if pVal, ok := pct["percentage"].(float64); ok {
				m.flagFormPercentage = fmt.Sprintf("%.0f", pVal)
			}
		}

		var actorKeys []string
		if actors, ok := flag.Gates["actors"].(map[string]interface{}); ok {
			for k := range actors {
				actorKeys = append(actorKeys, k)
			}
		}
		m.flagFormActors = strings.Join(actorKeys, ", ")

		var groupKeys []string
		if groups, ok := flag.Gates["groups"].(map[string]interface{}); ok {
			for k := range groups {
				groupKeys = append(groupKeys, k)
			}
		}
		m.flagFormGroups = strings.Join(groupKeys, ", ")

	} else {
		m.flagFormKey = ""
		m.flagFormDescription = ""
		enabledStr = "true"
		m.flagFormDefaultValue = "false"
		m.flagFormPercentage = "0"
		m.flagFormActors = ""
		m.flagFormGroups = ""
	}

	var keyInput *huh.Input
	if isEdit {
		keyInput = huh.NewInput().
			Title("Flag Key").
			Value(&m.flagFormKey).
			Validate(func(s string) error { return nil })
	} else {
		keyInput = huh.NewInput().
			Title("Flag Key (e.g., new_user_onboarding)").
			Placeholder("unique_flag_key").
			Value(&m.flagFormKey).
			Validate(func(str string) error {
				k := strings.TrimSpace(str)
				if k == "" {
					return fmt.Errorf("flag key is required")
				}
				return nil
			})
	}

	m.FeatureFlagForm = huh.NewForm(
		huh.NewGroup(
			keyInput,
			huh.NewInput().
				Title("Description").
				Placeholder("Short description of what this flag controls").
				Value(&m.flagFormDescription),
			huh.NewInput().
				Title("Default Value").
				Placeholder("false, true, or JSON payload").
				Value(&m.flagFormDefaultValue),
			huh.NewSelect[string]().
				Title("Enabled (Master Switch)").
				Options(
					huh.NewOption("Enabled (ON)", "true"),
					huh.NewOption("Disabled (OFF)", "false"),
				).
				Value(&enabledStr),
			huh.NewInput().
				Title("Percentage Rollout Gate (0 - 100)").
				Placeholder("0").
				Value(&m.flagFormPercentage),
			huh.NewInput().
				Title("Targeted Actors (comma-separated IDs/emails)").
				Placeholder("user_123, admin@moul.dev").
				Value(&m.flagFormActors),
			huh.NewInput().
				Title("Targeted Groups (comma-separated roles/groups)").
				Placeholder("beta_testers, internal_staff").
				Value(&m.flagFormGroups),
		),
	).WithTheme(ThemeCustom)

	m.flagFormEnabled = (enabledStr == "true")
	m.State = StateFeatureFlagForm
	return m.FeatureFlagForm.Init()
}

// saveFeatureFlagForm processes form submission for creating or updating a feature flag.
func (m *Model) saveFeatureFlagForm() tea.Cmd {
	return func() tea.Msg {
		gates := make(map[string]interface{})

		if m.flagFormPercentage != "" {
			pct, err := strconv.ParseFloat(strings.TrimSpace(m.flagFormPercentage), 64)
			if err == nil && pct > 0 {
				gates["percentage"] = map[string]interface{}{
					"percentage": pct,
				}
			}
		}

		if actorsStr := strings.TrimSpace(m.flagFormActors); actorsStr != "" {
			actorsMap := make(map[string]bool)
			for _, a := range strings.Split(actorsStr, ",") {
				a = strings.TrimSpace(a)
				if a != "" {
					actorsMap[a] = true
				}
			}
			if len(actorsMap) > 0 {
				gates["actors"] = actorsMap
			}
		}

		if groupsStr := strings.TrimSpace(m.flagFormGroups); groupsStr != "" {
			groupsMap := make(map[string]bool)
			for _, g := range strings.Split(groupsStr, ",") {
				g = strings.TrimSpace(g)
				if g != "" {
					groupsMap[g] = true
				}
			}
			if len(groupsMap) > 0 {
				gates["groups"] = groupsMap
			}
		}

		key := strings.TrimSpace(m.flagFormKey)
		if m.isEditingFlag {
			payload := map[string]interface{}{
				"description":   strings.TrimSpace(m.flagFormDescription),
				"enabled":       m.flagFormEnabled,
				"default_value": strings.TrimSpace(m.flagFormDefaultValue),
				"gates":         gates,
			}
			err := m.Client.UpdateFeatureFlag(key, payload)
			if err != nil {
				return featureFlagSavedMsg{err: err}
			}
			m.SuccessMsg = fmt.Sprintf("Flag %q updated successfully", key)
		} else {
			payload := map[string]interface{}{
				"key":           key,
				"description":   strings.TrimSpace(m.flagFormDescription),
				"enabled":       m.flagFormEnabled,
				"default_value": strings.TrimSpace(m.flagFormDefaultValue),
				"gates":         gates,
			}
			err := m.Client.CreateFeatureFlag(payload)
			if err != nil {
				return featureFlagSavedMsg{err: err}
			}
			m.SuccessMsg = fmt.Sprintf("Flag %q created successfully", key)
		}

		m.State = StateFeatureFlags
		return featureFlagSavedMsg{err: nil}
	}
}

// initFeatureFlagEvalForm initializes evaluation test context form.
func (m *Model) initFeatureFlagEvalForm() tea.Cmd {
	if m.SelectedFlagIndex < len(m.FeatureFlags) {
		m.flagEvalKey = m.FeatureFlags[m.SelectedFlagIndex].Key
	}
	m.flagEvalContextJSON = "{\n  \"user_id\": \"user_123\",\n  \"role\": \"beta\"\n}"
	m.flagEvalResult = nil

	m.FeatureFlagEvalForm = huh.NewForm(
		huh.NewGroup(
			huh.NewText().
				Title(fmt.Sprintf("Evaluation Context (JSON) for flag: %s", m.flagEvalKey)).
				Value(&m.flagEvalContextJSON),
		),
	).WithTheme(ThemeCustom)

	m.State = StateFeatureFlagEval
	return m.FeatureFlagEvalForm.Init()
}

// evaluateFeatureFlagCmd runs feature flag evaluation against provided context JSON.
func (m *Model) evaluateFeatureFlagCmd() tea.Cmd {
	return func() tea.Msg {
		var ctxMap map[string]interface{}
		if strings.TrimSpace(m.flagEvalContextJSON) != "" {
			err := json.Unmarshal([]byte(m.flagEvalContextJSON), &ctxMap)
			if err != nil {
				return featureFlagEvalMsg{err: fmt.Errorf("invalid context JSON: %w", err)}
			}
		}

		res, err := m.Client.EvaluateFeatureFlag(m.flagEvalKey, ctxMap)
		if err != nil {
			return featureFlagEvalMsg{err: err}
		}
		return featureFlagEvalMsg{result: res, err: nil}
	}
}

// viewFeatureFlagForm renders feature flag creation / editing form.
func (m *Model) viewFeatureFlagForm() string {
	var s strings.Builder
	s.WriteString(m.renderBreadcrumbs())
	s.WriteString("\n\n")

	title := "CREATE NEW FEATURE FLAG"
	if m.isEditingFlag {
		title = fmt.Sprintf("EDIT FEATURE FLAG (%s)", m.flagFormKey)
	}

	s.WriteString(HeaderStyle.Render(" 🚩 " + title))
	s.WriteString("\n\n")
	s.WriteString(m.FeatureFlagForm.View())
	return s.String()
}

// viewFeatureFlagEval renders feature flag evaluation test page.
func (m *Model) viewFeatureFlagEval() string {
	var s strings.Builder
	s.WriteString(m.renderBreadcrumbs())
	s.WriteString("\n\n")

	s.WriteString(HeaderStyle.Render(fmt.Sprintf(" 🧪 TEST EVALUATE FLAG: %s", m.flagEvalKey)))
	s.WriteString("\n\n")

	if m.Err != nil {
		s.WriteString("  " + AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)) + "\n\n")
	}

	s.WriteString(m.FeatureFlagEvalForm.View())

	if m.flagEvalResult != nil {
		s.WriteString("\n\n")
		s.WriteString(FormLabelStyle.Render("EVALUATION RESULT"))
		s.WriteString("\n")

		valStr := fmt.Sprintf("%v", m.flagEvalResult.Value)
		valStyle := lipgloss.NewStyle().Foreground(ColorGreen).Bold(true)
		if valStr == "false" {
			valStyle = lipgloss.NewStyle().Foreground(ColorRed).Bold(true)
		}

		resultBox := fmt.Sprintf(
			"  • Evaluated Value: %s\n  • Reason Code:     %s",
			valStyle.Render(valStr),
			lipgloss.NewStyle().Foreground(ColorIndigoLight).Render(m.flagEvalResult.Reason),
		)

		s.WriteString(lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Padding(1, 2).
			Render(resultBox))
	}

	return s.String()
}
