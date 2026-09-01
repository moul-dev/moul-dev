package testutil

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/tls"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/pocketbase/dbx"
)

// Default test credentials and secrets.
const (
	DefaultAdminKey  = "test-admin-key-1234"
	DefaultJWTSecret = "test-secret-key-for-unit-tests-1234"
)

// TestServer wraps an in-memory test HTTP server with attached SQLite DB and Echo router.
type TestServer struct {
	Server          *httptest.Server
	DB              *dbx.DB
	Echo            *echo.Echo
	AdminKey        string
	JWTSecret       string
	URL             string
	Client          *http.Client
	WorkerEngine    *worker.Engine
	AnalyticsEngine *analytics.Engine
	MailService     *mailer.Mailer
}

// ServerOption configures test server instances.
type ServerOption func(*serverConfig)

type serverConfig struct {
	adminKey        string
	jwtSecret       string
	db              *dbx.DB
	workerEngine    *worker.Engine
	analyticsEngine *analytics.Engine
	mailService     *mailer.Mailer
	isDev           bool
}

// WithAdminKey overrides the default admin key.
func WithAdminKey(key string) ServerOption {
	return func(c *serverConfig) {
		c.adminKey = key
	}
}

// WithJWTSecret overrides the default JWT secret.
func WithJWTSecret(secret string) ServerOption {
	return func(c *serverConfig) {
		c.jwtSecret = secret
	}
}

// WithDB allows passing an existing database instance.
func WithDB(dbConn *dbx.DB) ServerOption {
	return func(c *serverConfig) {
		c.db = dbConn
	}
}

// WithWorkerEngine configures a custom worker engine.
func WithWorkerEngine(engine *worker.Engine) ServerOption {
	return func(c *serverConfig) {
		c.workerEngine = engine
	}
}

// WithAnalyticsEngine configures a custom analytics engine.
func WithAnalyticsEngine(engine *analytics.Engine) ServerOption {
	return func(c *serverConfig) {
		c.analyticsEngine = engine
	}
}

// NewTestDB creates an in-memory SQLite database for testing, automatically closing it on test completion.
func NewTestDB(t testing.TB) *dbx.DB {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("testutil.NewTestDB: failed to initialize memory DB: %v", err)
	}
	t.Cleanup(func() {
		_ = dbConn.Close()
	})
	return dbConn
}

// NewTestServer initializes an Echo HTTP server with an in-memory SQLite database and full router configuration.
func NewTestServer(t testing.TB, opts ...ServerOption) *TestServer {
	t.Helper()

	cfg := serverConfig{
		adminKey:  DefaultAdminKey,
		jwtSecret: DefaultJWTSecret,
		isDev:     true,
	}
	for _, opt := range opts {
		opt(&cfg)
	}

	auth.InitJWT(cfg.jwtSecret)

	dbConn := cfg.db
	if dbConn == nil {
		dbConn = NewTestDB(t)
	}

	sysmonCollector := sysmon.NewCollector()
	tlsManager, _ := tls.NewManager(dbConn)

	e := handlers.NewRouter(
		dbConn,
		cfg.workerEngine,
		cfg.analyticsEngine,
		cfg.mailService,
		sysmonCollector,
		tlsManager,
		cfg.adminKey,
		cfg.isDev,
		"test",
	)

	server := httptest.NewServer(e)
	t.Cleanup(func() {
		server.Close()
	})

	ts := &TestServer{
		Server:          server,
		DB:              dbConn,
		Echo:            e,
		AdminKey:        cfg.adminKey,
		JWTSecret:       cfg.jwtSecret,
		URL:             server.URL,
		Client:          server.Client(),
		WorkerEngine:    cfg.workerEngine,
		AnalyticsEngine: cfg.analyticsEngine,
		MailService:     cfg.mailService,
	}

	return ts
}

// AdminHeader returns an http.Header populated with X-Admin-Key.
func (ts *TestServer) AdminHeader() http.Header {
	h := make(http.Header)
	h.Set("X-Admin-Key", ts.AdminKey)
	return h
}

// AuthToken generates a signed JWT for testing authentication flows.
func (ts *TestServer) AuthToken(userID, email string, customClaims ...map[string]interface{}) (string, error) {
	claims := jwt.MapClaims{
		"id":    userID,
		"email": email,
		"exp":   time.Now().Add(2 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	}
	if len(customClaims) > 0 && customClaims[0] != nil {
		for k, v := range customClaims[0] {
			claims[k] = v
		}
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(ts.JWTSecret))
}

// AuthHeader returns an http.Header populated with Authorization: Bearer <token>.
func (ts *TestServer) AuthHeader(t testing.TB, userID, email string, customClaims ...map[string]interface{}) http.Header {
	t.Helper()
	token, err := ts.AuthToken(userID, email, customClaims...)
	if err != nil {
		t.Fatalf("testutil: failed to generate test auth token: %v", err)
	}
	h := make(http.Header)
	h.Set("Authorization", "Bearer "+token)
	return h
}
