package tui

import (
	"encoding/json"
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
)

func TestInitSettingsInputs(t *testing.T) {
	m := &Model{
		settingFileS3Enabled:   "true",
		settingFileS3Bucket:    "my-test-bucket",
		settingFileS3Endpoint:  "s3.us-east-1.amazonaws.com",
		settingFileS3Region:    "us-east-1",
		settingFileS3AccessKey: "test-access-key",
		settingFileS3SecretKey: "test-secret-key",
		settingFileS3ForcePath: "false",
		settingLiteEnabled:     "true",
		settingLiteS3Bucket:    "my-backup-bucket",
		settingLiteS3Endpoint:  "s3.amazonaws.com",
		settingLiteS3Region:    "us-east-1",
		settingLiteAccessKey:   "litestream-access-key",
		settingLiteSecretKey:   "litestream-secret-key",
		settingLiteS3ForcePath: "false",
		settingLiteReplica:     "s3://my-test-bucket/replica",
		settingRootIPEnabled:   "true",
		settingRootAllowedIPs:  "127.0.0.1, 10.0.0.0/24",
	}

	m.initSettingsInputs()

	if len(m.storageInputs) != 5 {
		t.Fatalf("Expected 5 storage inputs, got %d", len(m.storageInputs))
	}
	if m.storageInputs[0].Value() != "my-test-bucket" {
		t.Errorf("Expected storage bucket value 'my-test-bucket', got %q", m.storageInputs[0].Value())
	}

	if len(m.liteInputs) != 6 {
		t.Fatalf("Expected 6 litestream inputs, got %d", len(m.liteInputs))
	}
	if m.liteInputs[5].Value() != "s3://my-test-bucket/replica" {
		t.Errorf("Expected litestream replica value 's3://my-test-bucket/replica', got %q", m.liteInputs[5].Value())
	}

	if len(m.rootIPsInputs) != 1 {
		t.Fatalf("Expected 1 root IPs input, got %d", len(m.rootIPsInputs))
	}
	if m.rootIPsInputs[0].Value() != "127.0.0.1, 10.0.0.0/24" {
		t.Errorf("Expected root IPs value '127.0.0.1, 10.0.0.0/24', got %q", m.rootIPsInputs[0].Value())
	}
}

func TestGetSettingsFieldsRootIPs(t *testing.T) {
	m := &Model{
		settingsActiveTab:    3,
		settingRootIPEnabled: "true",
	}

	fields := m.getSettingsFields()
	if len(fields) != 2 {
		t.Fatalf("Expected 2 fields for active tab 3 when enabled, got %d", len(fields))
	}
	if fields[0].label != "Root User IP Check Enabled" || !fields[0].isBool {
		t.Errorf("Expected first field to be 'Root User IP Check Enabled' bool field, got label=%q, isBool=%v", fields[0].label, fields[0].isBool)
	}
	if fields[1].label != "Allowed IP Ranges" || fields[1].isBool {
		t.Errorf("Expected second field to be 'Allowed IP Ranges' text field, got label=%q, isBool=%v", fields[1].label, fields[1].isBool)
	}

	m.settingRootIPEnabled = "false"
	fields = m.getSettingsFields()
	if len(fields) != 1 {
		t.Fatalf("Expected 1 field for active tab 3 when disabled, got %d", len(fields))
	}
	if fields[0].label != "Root User IP Check Enabled" {
		t.Errorf("Expected field to be 'Root User IP Check Enabled', got %q", fields[0].label)
	}
}

func TestGetSettingsFieldsOAuth(t *testing.T) {
	m := &Model{
		settingsActiveTab:          5,
		settingOAuthRedirectURL:    "http://localhost:8090/callback",
		settingOAuthGitHubEnabled:  "true",
		settingOAuthGitHubClientID: "gh_id",
		settingOAuthGoogleEnabled:  "false",
		settingOAuthAppleEnabled:   "false",
	}

	m.initSettingsInputs()

	fields := m.getSettingsFields()
	if len(fields) != 6 {
		t.Fatalf("Expected 6 fields for active tab 5 with GitHub enabled and Google/Apple disabled, got %d", len(fields))
	}

	if len(m.oauthInputs) != 10 {
		t.Fatalf("Expected 10 oauth inputs initialized, got %d", len(m.oauthInputs))
	}
	if m.oauthInputs[0].Value() != "http://localhost:8090/callback" {
		t.Errorf("Expected oauth redirect URL input 'http://localhost:8090/callback', got %q", m.oauthInputs[0].Value())
	}
}

func TestGetSettingsFieldsRootPassword(t *testing.T) {
	m := &Model{
		settingsActiveTab:   6,
		settingRootUsername: "admin",
		settingRootName:     "Administrator",
		settingRootEmail:    "admin@moul.dev",
	}

	m.initSettingsInputs()

	fields := m.getSettingsFields()
	if len(fields) != 6 {
		t.Fatalf("Expected 6 fields for active tab 6 (Root Account), got %d", len(fields))
	}
	if fields[0].label != "Username" || fields[1].label != "Display Name" || fields[2].label != "Email Address" ||
		fields[3].label != "Current Password" || fields[4].label != "New Password" || fields[5].label != "Confirm New Password" {
		t.Errorf("Unexpected fields on tab 6: %v", fields)
	}
	if len(m.rootPwdInputs) != 6 {
		t.Fatalf("Expected 6 root account inputs initialized, got %d", len(m.rootPwdInputs))
	}
	if m.rootPwdInputs[0].Value() != "admin" {
		t.Errorf("Expected username input 'admin', got %q", m.rootPwdInputs[0].Value())
	}
}

func TestSettingsTabNavigation(t *testing.T) {
	m := &Model{
		State:             StateSettings,
		settingsActiveTab: 4, // Email Delivery
	}

	// Press right arrow on header tab
	newM, _ := m.Update(tea.KeyPressMsg{Code: tea.KeyRight})
	updatedModel := newM.(*Model)
	if updatedModel.settingsActiveTab != 5 {
		t.Fatalf("Expected active tab to advance to 5 (OAuth2 Providers), got %d", updatedModel.settingsActiveTab)
	}

	// Press right arrow to advance to tab 6 (Root Password)
	newM2, _ := updatedModel.Update(tea.KeyPressMsg{Code: tea.KeyRight})
	updatedModel2 := newM2.(*Model)
	if updatedModel2.settingsActiveTab != 6 {
		t.Fatalf("Expected active tab to advance to 6 (Root Password), got %d", updatedModel2.settingsActiveTab)
	}

	// Press right arrow again (wraps back to 0 S3 Storage)
	newM3, _ := updatedModel2.Update(tea.KeyPressMsg{Code: tea.KeyRight})
	updatedModel3 := newM3.(*Model)
	if updatedModel3.settingsActiveTab != 0 {
		t.Fatalf("Expected active tab to wrap to 0 (S3 Storage), got %d", updatedModel3.settingsActiveTab)
	}
}

func TestRenderRootAccountCard(t *testing.T) {
	m := &Model{
		Width:                80,
		settingRootID:        "usr_root_001",
		settingRootUsername:  "admin",
		settingRootName:      "Administrator",
		settingRootEmail:     "admin@moul.dev",
		settingRootCreatedAt: "2026-10-14T10:00:00Z",
		settingRootUpdatedAt: "2026-10-14T12:00:00Z",
	}

	card := m.renderRootAccountCard(m.Width)
	if !strings.Contains(card, "CURRENT ROOT ACCOUNT INFORMATION") {
		t.Errorf("Expected card to have title 'CURRENT ROOT ACCOUNT INFORMATION', got: %s", card)
	}
	if !strings.Contains(card, "admin") {
		t.Errorf("Expected card to contain username 'admin', got: %s", card)
	}
	if !strings.Contains(card, "Administrator") {
		t.Errorf("Expected card to contain name 'Administrator', got: %s", card)
	}
	if !strings.Contains(card, "admin@moul.dev") {
		t.Errorf("Expected card to contain email 'admin@moul.dev', got: %s", card)
	}
	if !strings.Contains(card, "usr_root_001") {
		t.Errorf("Expected card to contain ID 'usr_root_001', got: %s", card)
	}
	if !strings.Contains(card, "_rootUsers") {
		t.Errorf("Expected card to contain collection '_rootUsers', got: %s", card)
	}
}

func TestRenderRootAccountCardDefaults(t *testing.T) {
	m := &Model{
		Width: 80,
	}

	card := m.renderRootAccountCard(m.Width)
	if !strings.Contains(card, "(not loaded)") {
		t.Errorf("Expected card to show '(not loaded)' when username empty, got: %s", card)
	}
	if !strings.Contains(card, "(primary root)") {
		t.Errorf("Expected card to show '(primary root)' when ID empty, got: %s", card)
	}
}

func TestRootAccountResponseUnmarshal(t *testing.T) {
	// Test Flat JSON unmarshaling (from GET /api/settings/account)
	flatJSON := `{"id":"usr_flat","username":"root","name":"Root Admin","email":"root@moul.dev","createdAt":"2026-10-14T10:00:00Z","updatedAt":"2026-10-14T10:00:00Z"}`
	var flatRes RootAccountResponse
	if err := json.Unmarshal([]byte(flatJSON), &flatRes); err != nil {
		t.Fatalf("Failed to unmarshal flat root account JSON: %v", err)
	}
	if flatRes.Record == nil {
		t.Fatal("Expected Record to be non-nil for flat JSON")
	}
	if flatRes.Record["username"] != "root" || flatRes.Record["email"] != "root@moul.dev" {
		t.Errorf("Unexpected record from flat JSON: %v", flatRes.Record)
	}

	// Test Wrapped JSON unmarshaling (from PATCH /api/settings/account)
	wrappedJSON := `{"message":"ok","token":"jwt-test-token","record":{"id":"usr_wrapped","username":"superadmin","name":"Super","email":"super@moul.dev"}}`
	var wrappedRes RootAccountResponse
	if err := json.Unmarshal([]byte(wrappedJSON), &wrappedRes); err != nil {
		t.Fatalf("Failed to unmarshal wrapped root account JSON: %v", err)
	}
	if wrappedRes.Record == nil {
		t.Fatal("Expected Record to be non-nil for wrapped JSON")
	}
	if wrappedRes.Record["username"] != "superadmin" || wrappedRes.Token != "jwt-test-token" {
		t.Errorf("Unexpected record or token from wrapped JSON: %v, token=%q", wrappedRes.Record, wrappedRes.Token)
	}
}

func TestViewSettingsRootAccount(t *testing.T) {
	m := &Model{
		Width:                100,
		State:                StateSettings,
		settingsActiveTab:    6, // ROOT ACCOUNT
		settingRootID:        "usr_01j7",
		settingRootUsername:  "admin",
		settingRootName:      "Administrator",
		settingRootEmail:     "admin@moul.dev",
		settingRootCreatedAt: "2026-10-14T08:00:00Z",
		settingRootUpdatedAt: "2026-10-14T09:00:00Z",
	}
	m.initSettingsInputs()

	output := m.viewSettings()
	if !strings.Contains(output, "CURRENT ROOT ACCOUNT INFORMATION") {
		t.Errorf("Expected viewSettings to include root account information card, got: %s", output)
	}
	if !strings.Contains(output, "admin") || !strings.Contains(output, "Administrator") || !strings.Contains(output, "admin@moul.dev") {
		t.Errorf("Expected viewSettings to display existing root credentials, got: %s", output)
	}
	if !strings.Contains(output, "UPDATE ROOT ACCOUNT CREDENTIALS") {
		t.Errorf("Expected viewSettings to include credentials update section header, got: %s", output)
	}
}
