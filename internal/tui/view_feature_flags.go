package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
)

type featureFlagsMsg struct {
	flags []FeatureFlagItem
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
		case "r":
			return m.fetchFeatureFlags()
		case "d": // Delete Flag
			if len(m.FeatureFlags) > 0 && m.SelectedFlagIndex < len(m.FeatureFlags) {
				targetFlag := m.FeatureFlags[m.SelectedFlagIndex]
				return func() tea.Msg {
					err := m.Client.DeleteFeatureFlag(targetFlag.Key)
					if err != nil {
						return ErrMsg{err}
					}
					return m.fetchFeatureFlags()()
				}
			}
		case "esc":
			m.State = StateDashboard
		}
	}
	return nil
}

// viewFeatureFlags renders the Feature Flags list and detail view.
func (m *Model) viewFeatureFlags(width, height int) string {
	var s strings.Builder
	s.WriteString(HeaderStyle.Render(" 🚩 FEATURE FLAGS"))
	s.WriteString("\n\n")

	if len(m.FeatureFlags) == 0 {
		s.WriteString(HelpStyle.Render(" No feature flags found. Create one via REST API or CLI."))
		return s.String()
	}

	for i, flag := range m.FeatureFlags {
		status := " [OFF]"
		statusStyle := lipgloss.NewStyle().Foreground(ColorTextMuted)
		if flag.Enabled {
			status = " [ON]"
			statusStyle = lipgloss.NewStyle().Foreground(ColorGreen).Bold(true)
		}

		line := fmt.Sprintf(" %-24s %s  %s", flag.Key, statusStyle.Render(status), flag.Description)
		if i == m.SelectedFlagIndex {
			s.WriteString(SidebarItemActiveStyle.Width(width - 4).Render(line))
		} else {
			s.WriteString(SidebarItemInactiveStyle.Render(line))
		}
		s.WriteString("\n")
	}

	s.WriteString("\n")
	s.WriteString(HelpStyle.Render(" [Space/t] Toggle ON/OFF  |  [r] Refresh  |  [d] Delete  |  [Esc] Back"))

	return s.String()
}
