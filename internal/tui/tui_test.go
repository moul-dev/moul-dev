package tui

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

func TestFormatJSON(t *testing.T) {
	data := map[string]interface{}{
		"key": "value",
		"num": 42,
	}

	result := formatJSON(data)

	// Check if output is a valid JSON string containing keys
	var decoded map[string]interface{}
	err := json.Unmarshal([]byte(result), &decoded)
	if err != nil {
		t.Fatalf("formatJSON returned invalid JSON: %v", err)
	}

	if decoded["key"] != "value" || decoded["num"].(float64) != 42 {
		t.Errorf("formatJSON lost data or misformatted: %s", result)
	}
}

func TestFormatTime(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"2026-06-27T19:40:06Z", "2026-06-27 19:40:06"},
		{"invalid-time-format", "invalid-time-format"},
	}

	for _, tc := range tests {
		result := formatTime(tc.input)
		// We format UTC. If local offset differs, formatTime parses UTC correctly because of 'Z' suffix.
		// So we just check if it parses or returns fallback.
		if tc.input == "invalid-time-format" && result != tc.expected {
			t.Errorf("Expected fallback %q, got %q", tc.expected, result)
		} else if tc.input != "invalid-time-format" && !strings.HasPrefix(result, "2026") {
			// Basic verification that it formatted
			t.Errorf("Expected formatted time, got %q", result)
		}
	}
}

func TestClientInitialization(t *testing.T) {
	client := NewClient("http://localhost:8090/", "test-key")
	if client.BaseURL != "http://localhost:8090" {
		t.Errorf("Expected trailing slash to be trimmed: %s", client.BaseURL)
	}
	if client.AdminKey != "test-key" {
		t.Errorf("Expected admin key to be set: %s", client.AdminKey)
	}
}

func TestConfigLoadSave(t *testing.T) {
	// Temporarily override user home dir for config testing to avoid polluting actual user config
	tempDir, err := os.MkdirTemp("", "moul-tui-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	originalHome := os.Getenv("HOME")
	os.Setenv("HOME", tempDir)
	defer os.Setenv("HOME", originalHome)

	cfg := &Config{
		ServerURL: "http://test-server:9000",
		AdminKey:  "secret-test-key",
	}

	err = SaveConfig(cfg)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	loaded, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}

	if loaded.ServerURL != cfg.ServerURL {
		t.Errorf("Expected ServerURL %q, got %q", cfg.ServerURL, loaded.ServerURL)
	}
	if loaded.AdminKey != "" {
		t.Errorf("Expected AdminKey to be cleared from config struct, got %q", loaded.AdminKey)
	}

	migratedKey, err := GetSecret(loaded.ServerURL, "admin_key")
	if err != nil {
		t.Fatalf("GetSecret failed: %v", err)
	}
	if migratedKey != cfg.AdminKey {
		t.Errorf("Expected migrated AdminKey %q, got %q", cfg.AdminKey, migratedKey)
	}
}
