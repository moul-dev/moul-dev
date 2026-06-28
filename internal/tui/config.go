package tui

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

// Config holds the TUI application configuration.
type Config struct {
	ServerURL string `json:"server_url"`
	AdminKey  string `json:"admin_key,omitempty"`
	AuthMode  string `json:"auth_mode"` // "admin_key" or "device_flow"
}

// getConfigPath returns the path to the config file: ~/.config/moul.json
func getConfigPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".config", "moul.json"), nil
}

// LoadConfig loads the configuration from disk.
// Returns an empty Config if the file does not exist.
func LoadConfig() (*Config, error) {
	path, err := getConfigPath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return &Config{
				ServerURL: "http://localhost:8090",
				AuthMode:  "admin_key",
			}, nil
		}
		return nil, err
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	if cfg.ServerURL == "" {
		cfg.ServerURL = "http://localhost:8090"
	}

	if cfg.AuthMode == "" {
		cfg.AuthMode = "admin_key"
	}

	// One-time migration of AdminKey to OS Keychain
	if cfg.AdminKey != "" {
		_ = SetSecret(cfg.ServerURL, "admin_key", cfg.AdminKey)
		cfg.AdminKey = ""
		_ = SaveConfig(&cfg)
	}

	return &cfg, nil
}

// SaveConfig saves the configuration to disk.
func SaveConfig(cfg *Config) error {
	path, err := getConfigPath()
	if err != nil {
		return err
	}

	// Create directories if necessary
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0600)
}
