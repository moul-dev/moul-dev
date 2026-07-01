package tui

import (
	"testing"
)

func TestInitSettingsForm(t *testing.T) {
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

	// Run form initialization and ensure it doesn't panic and populates the form objects.
	m.initSettingsForm()

	if m.StorageSettingsForm == nil {
		t.Fatal("Expected StorageSettingsForm to be initialized, got nil")
	}

	if m.LiteSettingsForm == nil {
		t.Fatal("Expected LiteSettingsForm to be initialized, got nil")
	}
}
