package tui

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
)

func TestFeatureFlagsModelNavigation(t *testing.T) {
	model := NewModel("http://localhost:8090", "test-key")

	// Set initial state with feature flags
	model.State = StateFeatureFlags
	model.FeatureFlags = []FeatureFlagItem{
		{
			ID:           "ff_1",
			Key:          "beta_feature",
			Description:  "Controls beta feature access",
			Enabled:      true,
			DefaultValue: "false",
			Gates: map[string]interface{}{
				"percentage": map[string]interface{}{
					"percentage": 50.0,
				},
				"actors": map[string]interface{}{
					"user_1": true,
				},
			},
		},
		{
			ID:           "ff_2",
			Key:          "dark_mode",
			Description:  "Enable dark mode theme",
			Enabled:      false,
			DefaultValue: "true",
			Gates:        map[string]interface{}{},
		},
	}
	model.SelectedFlagIndex = 0

	// 1. Check rendering of feature flags view
	viewOutput := model.viewFeatureFlags(80, 24)
	if !strings.Contains(viewOutput, "FEATURE FLAGS CONSOLE") {
		t.Errorf("Expected view to contain header 'FEATURE FLAGS CONSOLE', got:\n%s", viewOutput)
	}
	if !strings.Contains(viewOutput, "beta_feature") || !strings.Contains(viewOutput, "dark_mode") {
		t.Errorf("Expected view to display flag keys 'beta_feature' and 'dark_mode'")
	}
	if !strings.Contains(viewOutput, "[ON]") || !strings.Contains(viewOutput, "[OFF]") {
		t.Errorf("Expected status badges [ON] and [OFF] in view output")
	}

	// 2. Test navigation down with 'j' key
	cmd := model.updateFeatureFlags(tea.KeyPressMsg{Code: 'j', Text: "j"})
	if cmd != nil {
		t.Errorf("Expected no command on navigation down")
	}
	if model.SelectedFlagIndex != 1 {
		t.Errorf("Expected SelectedFlagIndex to be 1 after pressing 'j', got %d", model.SelectedFlagIndex)
	}

	// 3. Test navigation up with 'k' key
	_ = model.updateFeatureFlags(tea.KeyPressMsg{Code: 'k', Text: "k"})
	if model.SelectedFlagIndex != 0 {
		t.Errorf("Expected SelectedFlagIndex to be 0 after pressing 'k', got %d", model.SelectedFlagIndex)
	}

	// 4. Test pressing 'n' to enter feature flag creation form
	_ = model.updateFeatureFlags(tea.KeyPressMsg{Code: 'n', Text: "n"})
	if model.State != StateFeatureFlagForm {
		t.Errorf("Expected State to transition to StateFeatureFlagForm on 'n', got %v", model.State)
	}
	if model.isEditingFlag {
		t.Errorf("Expected isEditingFlag to be false for new flag form")
	}

	// 5. Check breadcrumbs rendering for StateFeatureFlagForm
	model.Width = 80
	crumbs := model.renderBreadcrumbs()
	if !strings.Contains(crumbs, "FEATURE FLAGS") || !strings.Contains(crumbs, "NEW FLAG") {
		t.Errorf("Expected breadcrumbs to contain FEATURE FLAGS > NEW FLAG, got: %s", crumbs)
	}

	// 6. Test esc returns to StateDashboard from StateFeatureFlags
	model.State = StateFeatureFlags
	_ = model.updateFeatureFlags(tea.KeyPressMsg{Code: 27, Text: "esc"}) // Esc code
	if model.State != StateDashboard {
		t.Errorf("Expected State to return to StateDashboard on Esc, got %v", model.State)
	}
}

func TestFeatureFlagFormInitAndSavePayload(t *testing.T) {
	model := NewModel("http://localhost:8090", "test-key")
	model.FeatureFlags = []FeatureFlagItem{
		{
			ID:           "ff_10",
			Key:          "new_checkout",
			Description:  "V2 checkout flow",
			Enabled:      true,
			DefaultValue: "false",
			Gates: map[string]interface{}{
				"percentage": map[string]interface{}{
					"percentage": 25.0,
				},
				"actors": map[string]interface{}{
					"user_99": true,
				},
				"groups": map[string]interface{}{
					"vip_users": true,
				},
			},
		},
	}
	model.SelectedFlagIndex = 0

	// Initialize form in Edit mode
	_ = model.initFeatureFlagForm(true)
	if !model.isEditingFlag {
		t.Errorf("Expected isEditingFlag to be true")
	}
	if model.flagFormKey != "new_checkout" {
		t.Errorf("Expected flagFormKey 'new_checkout', got %q", model.flagFormKey)
	}
	if model.flagFormPercentage != "25" {
		t.Errorf("Expected flagFormPercentage '25', got %q", model.flagFormPercentage)
	}
	if !strings.Contains(model.flagFormActors, "user_99") {
		t.Errorf("Expected flagFormActors to contain 'user_99', got %q", model.flagFormActors)
	}
	if !strings.Contains(model.flagFormGroups, "vip_users") {
		t.Errorf("Expected flagFormGroups to contain 'vip_users', got %q", model.flagFormGroups)
	}
}
