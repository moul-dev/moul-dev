package tls

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/caddyserver/certmagic"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/pocketbase/dbx"
)

// Config represents TLS configuration options loaded from _settings.
type Config struct {
	Enabled    bool
	Domains    []string
	Email      string
	UseStaging bool
	HTTPPort   string
	HTTPSPort  string
}

// Manager orchestrates certmagic certificate issuance, renewal, and listeners.
type Manager struct {
	mu         sync.RWMutex
	dbConn     *dbx.DB
	cfg        Config
	magic      *certmagic.Config
	storage    *DBStorage
	httpServer *http.Server
}

// NewManager initializes a new TLS Manager.
func NewManager(dbConn *dbx.DB) (*Manager, error) {
	m := &Manager{
		dbConn:  dbConn,
		storage: NewDBStorage(dbConn),
	}

	if err := m.loadConfig(); err != nil {
		return nil, fmt.Errorf("failed to load TLS configuration: %w", err)
	}

	if m.cfg.Enabled {
		if err := m.initCertMagic(); err != nil {
			return nil, fmt.Errorf("failed to initialize CertMagic: %w", err)
		}
	}

	return m, nil
}

// loadConfig reads tls_* settings from _settings table.
func (m *Manager) loadConfig() error {
	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}
	err := m.dbConn.Select("key", "value").From("_settings").Where(dbx.NewExp("key LIKE 'tls_%'")).All(&rows)
	if err != nil {
		return err
	}

	settings := make(map[string]string)
	for _, r := range rows {
		settings[r.Key] = r.Value
	}

	enabled := settings["tls_enabled"] == "true"

	domainsStr := settings["tls_domains"]
	var domains []string
	if domainsStr != "" {
		for _, d := range strings.Split(domainsStr, ",") {
			if trimmed := strings.TrimSpace(d); trimmed != "" {
				domains = append(domains, trimmed)
			}
		}
	}

	email := strings.TrimSpace(settings["tls_email"])
	useStaging := settings["tls_use_staging"] == "true"

	httpPort := settings["tls_http_port"]
	if httpPort == "" {
		httpPort = "80"
	}

	httpsPort := settings["tls_https_port"]
	if httpsPort == "" {
		httpsPort = "443"
	}

	m.cfg = Config{
		Enabled:    enabled,
		Domains:    domains,
		Email:      email,
		UseStaging: useStaging,
		HTTPPort:   httpPort,
		HTTPSPort:  httpsPort,
	}

	return nil
}

// initCertMagic sets up CertMagic instance and starts background domain management.
func (m *Manager) initCertMagic() error {
	ca := certmagic.LetsEncryptProductionCA
	if m.cfg.UseStaging {
		ca = certmagic.LetsEncryptStagingCA
	}

	magic := certmagic.NewDefault()
	magic.Storage = m.storage

	acmeIssuer := certmagic.NewACMEIssuer(magic, certmagic.ACMEIssuer{
		CA:     ca,
		Email:  m.cfg.Email,
		Agreed: true,
	})
	magic.Issuers = []certmagic.Issuer{acmeIssuer}

	m.magic = magic

	if len(m.cfg.Domains) > 0 {
		logger.Info("CertMagic managing TLS domains", "domains", m.cfg.Domains, "staging", m.cfg.UseStaging)
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
			defer cancel()
			if err := magic.ManageAsync(ctx, m.cfg.Domains); err != nil {
				logger.Error("CertMagic ManageAsync failed", "err", err)
			}
		}()
	}

	return nil
}

// Reload refreshes settings from DB and updates managed domains or listener state.
func (m *Manager) Reload(dbConn *dbx.DB) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.dbConn = dbConn
	oldCfg := m.cfg

	if err := m.loadConfig(); err != nil {
		return err
	}

	if !m.cfg.Enabled {
		if m.httpServer != nil {
			_ = m.httpServer.Shutdown(context.Background())
			m.httpServer = nil
		}
		m.magic = nil
		return nil
	}

	// Enabled
	if m.magic == nil || oldCfg.UseStaging != m.cfg.UseStaging || oldCfg.Email != m.cfg.Email {
		if err := m.initCertMagic(); err != nil {
			return err
		}
	} else if len(m.cfg.Domains) > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
		defer cancel()
		_ = m.magic.ManageAsync(ctx, m.cfg.Domains)
	}

	return nil
}

// IsEnabled returns true if TLS is enabled in configuration.
func (m *Manager) IsEnabled() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.cfg.Enabled
}

// HTTPSPort returns the configured HTTPS port.
func (m *Manager) HTTPSPort() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.cfg.HTTPSPort
}

// GetTLSConfig returns standard tls.Config for Echo HTTPS listener.
func (m *Manager) GetTLSConfig() (*tls.Config, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if !m.cfg.Enabled || m.magic == nil {
		return nil, fmt.Errorf("TLS is not enabled")
	}

	tlsCfg := m.magic.TLSConfig()
	tlsCfg.NextProtos = append([]string{"h2", "http/1.1"}, tlsCfg.NextProtos...)
	return tlsCfg, nil
}

// HTTPHandler wraps a handler with ACME HTTP-01 challenge solver and HTTP->HTTPS redirect.
func (m *Manager) HTTPHandler(fallback http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		m.mu.RLock()
		magic := m.magic
		httpsPort := m.cfg.HTTPSPort
		m.mu.RUnlock()

		if magic != nil {
			// Check if request is an ACME HTTP-01 challenge
			if strings.HasPrefix(r.URL.Path, "/.well-known/acme-challenge/") {
				for _, issuer := range magic.Issuers {
					if acme, ok := issuer.(*certmagic.ACMEIssuer); ok {
						if acme.HandleHTTPChallenge(w, r) {
							return
						}
					}
				}
			}

			// Redirect HTTP to HTTPS
			host, _, err := net.SplitHostPort(r.Host)
			if err != nil {
				host = r.Host
			}

			targetURL := "https://" + host
			if httpsPort != "443" && httpsPort != "" {
				targetURL += ":" + httpsPort
			}
			targetURL += r.URL.RequestURI()

			http.Redirect(w, r, targetURL, http.StatusMovedPermanently)
			return
		}

		if fallback != nil {
			fallback.ServeHTTP(w, r)
		} else {
			http.NotFound(w, r)
		}
	})
}

// StartHTTPListener launches background HTTP port listener for ACME challenge & HTTPS redirect.
func (m *Manager) StartHTTPListener(ctx context.Context) error {
	m.mu.Lock()
	if !m.cfg.Enabled {
		m.mu.Unlock()
		return nil
	}

	addr := ":" + m.cfg.HTTPPort
	srv := &http.Server{
		Addr:    addr,
		Handler: m.HTTPHandler(nil),
	}
	m.httpServer = srv
	m.mu.Unlock()

	logger.Info("Starting HTTP challenge/redirect listener", "addr", addr)

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
	}()

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("TLS HTTP challenge listener error", "err", err)
		}
	}()

	return nil
}
