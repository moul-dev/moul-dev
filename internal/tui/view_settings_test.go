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
}
