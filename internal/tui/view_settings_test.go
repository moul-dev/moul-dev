package tui

import (
	"testing"
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
