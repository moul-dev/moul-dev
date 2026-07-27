package mailer

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/gobuffalo/envy"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/pocketbase/dbx"
)

type Mailer struct {
	mu       sync.RWMutex
	config   Config
	provider Provider
	dbConn   *dbx.DB
}

func NewMailer(dbConn *dbx.DB) (*Mailer, error) {
	m := &Mailer{dbConn: dbConn}
	if err := m.Reload(dbConn); err != nil {
		logger.Warn("Failed to load initial mailer config from DB, defaulting to console", "err", err)
	}
	return m, nil
}

func (m *Mailer) Config() Config {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.config
}

func (m *Mailer) ProviderName() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if m.provider != nil {
		return m.provider.Name()
	}
	return "console"
}

func (m *Mailer) Reload(dbConn *dbx.DB) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if dbConn != nil {
		m.dbConn = dbConn
	}

	cfg := m.loadConfig()
	m.config = cfg
	m.provider = m.createProvider(cfg)

	logger.Info("Mailer reloaded", "provider", m.provider.Name(), "enabled", cfg.Enabled)
	return nil
}

func (m *Mailer) loadConfig() Config {
	cfg := Config{
		Enabled:     false,
		Provider:    "console",
		FromAddress: envy.Get("EMAIL_FROM_ADDRESS", ""),
		FromName:    envy.Get("EMAIL_FROM_NAME", ""),
		APIKey:      envy.Get("EMAIL_API_KEY", ""),
		APISecret:   envy.Get("EMAIL_API_SECRET", ""),
		Domain:      envy.Get("EMAIL_DOMAIN", ""),
		Region:      envy.Get("EMAIL_REGION", "us-east-1"),
		Endpoint:    envy.Get("EMAIL_ENDPOINT", ""),
	}

	if envy.Get("EMAIL_ENABLED", "") != "" {
		cfg.Enabled = envy.Get("EMAIL_ENABLED", "") == "true"
	}
	if envy.Get("EMAIL_PROVIDER", "") != "" {
		cfg.Provider = envy.Get("EMAIL_PROVIDER", "")
	}

	if m.dbConn == nil {
		return cfg
	}

	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}

	err := m.dbConn.Select("key", "value").From("_settings").All(&rows)
	if err != nil {
		logger.Error("Failed to fetch email settings from DB", "err", err)
		return cfg
	}

	settings := make(map[string]string)
	for _, r := range rows {
		if strings.HasPrefix(r.Key, "email_") {
			settings[r.Key] = r.Value
		}
	}

	if val, ok := settings["email_enabled"]; ok && val != "" {
		cfg.Enabled = val == "true"
	}
	if val, ok := settings["email_provider"]; ok && val != "" {
		cfg.Provider = val
	}
	if val, ok := settings["email_from_address"]; ok && val != "" {
		cfg.FromAddress = val
	}
	if val, ok := settings["email_from_name"]; ok && val != "" {
		cfg.FromName = val
	}
	if val, ok := settings["email_api_key"]; ok && val != "" {
		cfg.APIKey = val
	}
	if val, ok := settings["email_api_secret"]; ok && val != "" {
		cfg.APISecret = val
	}
	if val, ok := settings["email_domain"]; ok && val != "" {
		cfg.Domain = val
	}
	if val, ok := settings["email_region"]; ok && val != "" {
		cfg.Region = val
	}
	if val, ok := settings["email_endpoint"]; ok && val != "" {
		cfg.Endpoint = val
	}

	return cfg
}

func (m *Mailer) createProvider(cfg Config) Provider {
	switch strings.ToLower(cfg.Provider) {
	case "ses":
		return NewSESProvider(cfg)
	case "resend":
		return NewResendProvider(cfg)
	case "mailgun":
		return NewMailgunProvider(cfg)
	case "sendgrid":
		return NewSendGridProvider(cfg)
	case "cloudflare":
		return NewCloudflareProvider(cfg)
	default:
		return NewConsoleProvider()
	}
}

func (m *Mailer) Send(ctx context.Context, email *Email) error {
	m.mu.RLock()
	cfg := m.config
	provider := m.provider
	m.mu.RUnlock()

	if !cfg.Enabled || provider == nil {
		// Default to console output if email delivery is disabled
		console := NewConsoleProvider()
		return console.Send(ctx, email)
	}

	if err := provider.Send(ctx, email); err != nil {
		logger.Error("Failed to send email via provider", "provider", provider.Name(), "err", err)
		return fmt.Errorf("mailer: sending failed via %s: %w", provider.Name(), err)
	}

	logger.Info("Email successfully dispatched", "provider", provider.Name(), "to", strings.Join(email.To, ", "), "subject", email.Subject)
	return nil
}
