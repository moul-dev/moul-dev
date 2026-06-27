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
	AdminKey  string `json:"admin_key"`
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
				AdminKey:  "",
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
