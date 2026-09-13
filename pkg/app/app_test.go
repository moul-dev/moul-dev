package app

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

func TestAppWorkerExtensibility(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	hookExecuted := false
	a.OnWorkerInit(func(engine *worker.Engine) error {
		hookExecuted = true
		return nil
	})

	customWorkerExecuted := false
	a.RegisterWorker("CustomTestTask", func(ctx context.Context, job *worker.Job) error {
		customWorkerExecuted = true
		return nil
	})

	periodicTaskExecuted := false
	a.RegisterPeriodicWorker(10*time.Minute, "CustomPeriodicTask", func(ctx context.Context, job *worker.Job) error {
		periodicTaskExecuted = true
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	if !hookExecuted {
		t.Errorf("Expected OnWorkerInit hook to be executed")
	}

	engine := a.WorkerEngine()
	if engine == nil {
		t.Fatalf("Expected WorkerEngine to be non-nil")
	}

	// Verify custom worker was registered
	handler, ok := engine.GetHandler("CustomTestTask")
	if !ok {
		t.Fatalf("Expected CustomTestTask to be registered in worker engine")
	}

	testJob := &worker.Job{
		ID:     "job-1",
		Worker: "CustomTestTask",
	}
	if err := handler(context.Background(), testJob); err != nil {
		t.Fatalf("Failed to execute CustomTestTask handler: %v", err)
	}

	if !customWorkerExecuted {
		t.Errorf("Expected CustomTestTask handler to run")
	}

	// Verify periodic worker was registered
	pHandler, ok := engine.GetHandler("CustomPeriodicTask")
	if !ok {
		t.Fatalf("Expected CustomPeriodicTask to be registered in worker engine")
	}

	if err := pHandler(context.Background(), testJob); err != nil {
		t.Fatalf("Failed to execute CustomPeriodicTask handler: %v", err)
	}

	if !periodicTaskExecuted {
		t.Errorf("Expected CustomPeriodicTask handler to run")
	}

	// Verify built-in handlers registered
	_, sendEmailRegistered := engine.GetHandler("SendEmail")
	if !sendEmailRegistered {
		t.Errorf("Expected built-in SendEmail worker handler to be registered")
	}

	_, cleanupRegistered := engine.GetHandler("CleanupRevokedTokens")
	if !cleanupRegistered {
		t.Errorf("Expected built-in CleanupRevokedTokens worker handler to be registered")
	}

	_, cleanupOldReqsRegistered := engine.GetHandler("CleanupOldRequests")
	if !cleanupOldReqsRegistered {
		t.Errorf("Expected built-in CleanupOldRequests worker handler to be registered")
	}

	_, cleanupOldVisitsRegistered := engine.GetHandler("CleanupOldVisits")
	if !cleanupOldVisitsRegistered {
		t.Errorf("Expected built-in CleanupOldVisits worker handler to be registered")
	}

	_, cleanupCompletedJobsRegistered := engine.GetHandler("CleanupCompletedJobs")
	if !cleanupCompletedJobsRegistered {
		t.Errorf("Expected built-in CleanupCompletedJobs worker handler to be registered")
	}
}

func TestAppRouteExtensibility(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	routerInitExecuted := false
	a.OnRouterInit(func(r *echo.Echo) error {
		routerInitExecuted = true
		r.GET("/api/custom-init", func(c *echo.Context) error {
			return c.String(http.StatusOK, "router-init-ok")
		})
		return nil
	})

	beforeStartExecuted := false
	a.OnBeforeStart(func(app *App) error {
		beforeStartExecuted = true
		if app.DB() == nil {
			return fmt.Errorf("expected DB connection in OnBeforeStart")
		}
		if app.Router() == nil {
			return fmt.Errorf("expected Router in OnBeforeStart")
		}
		return nil
	})

	a.RegisterRoute("GET", "/api/custom-hello", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "hello world"})
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	if !routerInitExecuted {
		t.Errorf("Expected OnRouterInit hook to execute")
	}

	if !beforeStartExecuted {
		t.Errorf("Expected OnBeforeStart hook to execute")
	}

	// Test GET /api/custom-hello
	req := httptest.NewRequest("GET", "/api/custom-hello", nil)
	rec := httptest.NewRecorder()
	a.Router().ServeHTTP(rec, req)

	if rec.Code != 200 {
		t.Errorf("Expected status code 200 for custom route, got %d", rec.Code)
	}
	if rec.Body.String() != `{"message":"hello world"}`+"\n" && rec.Body.String() != `{"message":"hello world"}` {
		t.Errorf("Unexpected body for custom route: %s", rec.Body.String())
	}

	// Test GET /api/custom-init
	req2 := httptest.NewRequest("GET", "/api/custom-init", nil)
	rec2 := httptest.NewRecorder()
	a.Router().ServeHTTP(rec2, req2)

	if rec2.Code != 200 {
		t.Errorf("Expected status code 200 for init route, got %d", rec2.Code)
	}
	if rec2.Body.String() != "router-init-ok" {
		t.Errorf("Unexpected body for init route: %s", rec2.Body.String())
	}
}

func TestAppHooksError(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	// Router hook error
	a1 := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})
	a1.OnRouterInit(func(r *echo.Echo) error {
		return fmt.Errorf("router hook failed deliberately")
	})
	if err := a1.Bootstrap(); err == nil {
		t.Errorf("Expected error from failing OnRouterInit hook")
	}

	// Before start hook error
	a2 := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})
	a2.OnBeforeStart(func(app *App) error {
		return fmt.Errorf("before start hook failed deliberately")
	})
	if err := a2.Bootstrap(); err == nil {
		t.Errorf("Expected error from failing OnBeforeStart hook")
	}
}

func TestApp_EnsureSystemTables_OnStartup(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	// Before bootstrap, EnsureSystemTables should return error (nil db)
	if err := a.EnsureSystemTables(); err == nil {
		t.Errorf("Expected EnsureSystemTables to fail before Bootstrap")
	}

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	// Verify all system tables starting with "_" were automatically created
	var tableRows []struct {
		Name string `db:"name"`
	}
	err := a.DB().NewQuery("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '\\_%' ESCAPE '\\' ORDER BY name ASC").All(&tableRows)
	if err != nil {
		t.Fatalf("Failed to query sqlite_master: %v", err)
	}

	createdTables := make(map[string]bool)
	for _, row := range tableRows {
		createdTables[row.Name] = true
	}

	for _, expectedTable := range db.SystemTables {
		if !createdTables[expectedTable] {
			t.Errorf("Expected system table %q to be created automatically on first startup", expectedTable)
		}
	}

	// Idempotency check via App method
	if err := a.EnsureSystemTables(); err != nil {
		t.Errorf("Expected a.EnsureSystemTables() to be idempotent, got error: %v", err)
	}
}

func TestAppAdminUIEmbedding(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	router := a.Router()
	if router == nil {
		t.Fatal("expected non-nil router")
	}

	// 1. Verify default admin console is served at /_moul_/
	req := httptest.NewRequest(http.MethodGet, "/_moul_/", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on /_moul_/, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "moul") {
		t.Fatalf("expected html response from embedded admin UI, got: %s", rec.Body.String())
	}

	// 2. Verify /admin is NOT registered by default in embedded mode
	req = httptest.NewRequest(http.MethodGet, "/admin", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on /admin when embedded without RegisterAdminRedirect, got %d", rec.Code)
	}

	// 3. Verify DefaultAdminFS helper
	dfs := DefaultAdminFS()
	if dfs == nil {
		t.Fatal("expected DefaultAdminFS() to return non-nil fs.FS")
	}
}

func TestAppAdminUICustomization(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	customFS := fstest.MapFS{
		"index.html": &fstest.MapFile{
			Data: []byte("<!DOCTYPE html><html><body>My Custom Embedded App Console</body></html>"),
		},
	}

	// Test custom prefix and custom FS via fluent setters
	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	}).
		WithAdminPrefix("/custom-console").
		WithAdminUI(customFS).
		WithAdminRedirect(true)

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	router := a.Router()

	// 1. Check custom console serves custom index.html
	req := httptest.NewRequest(http.MethodGet, "/custom-console/", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "My Custom Embedded App Console") {
		t.Fatalf("unexpected content: %s", rec.Body.String())
	}

	// 2. Check /admin is NOT redirected (removed to prevent route collision with root APIs)
	req = httptest.NewRequest(http.MethodGet, "/admin", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for /admin (no redirect), got %d", rec.Code)
	}

	// 3. Test DisableAdminUI
	disabledApp := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	}).DisableAdminUI()

	if err := disabledApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	req = httptest.NewRequest(http.MethodGet, "/_moul_/", nil)
	rec = httptest.NewRecorder()
	disabledApp.Router().ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 when admin UI is disabled, got %d", rec.Code)
	}
}

func TestAppAPIPrefix(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	// 1. Test Default Prefix (/api)
	defaultApp := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})
	if err := defaultApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap defaultApp failed: %v", err)
	}
	// GET /api/setup should respond
	req := httptest.NewRequest(http.MethodGet, "/api/setup", nil)
	req.Header.Set("X-Admin-Key", "test-admin-key")
	rec := httptest.NewRecorder()
	defaultApp.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /api/setup with default prefix, got %d", rec.Code)
	}
	// GET /setup without prefix should 404
	req = httptest.NewRequest(http.MethodGet, "/setup", nil)
	req.Header.Set("X-Admin-Key", "test-admin-key")
	rec = httptest.NewRecorder()
	defaultApp.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on /setup with default prefix, got %d", rec.Code)
	}

	// 2. Test Custom Prefix (/v1)
	customApp := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	}).WithAPIPrefix("/v1")
	if err := customApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap customApp failed: %v", err)
	}
	// GET /v1/setup should respond
	req = httptest.NewRequest(http.MethodGet, "/v1/setup", nil)
	req.Header.Set("X-Admin-Key", "test-admin-key")
	rec = httptest.NewRecorder()
	customApp.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /v1/setup with custom prefix, got %d", rec.Code)
	}
	// GET /api/setup should 404
	req = httptest.NewRequest(http.MethodGet, "/api/setup", nil)
	req.Header.Set("X-Admin-Key", "test-admin-key")
	rec = httptest.NewRecorder()
	customApp.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on /api/setup when custom prefix is /v1, got %d", rec.Code)
	}

	// 3. Test Empty Prefix ("") - root level mounting
	emptyApp := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	}).WithAPIPrefix("")
	if err := emptyApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap emptyApp failed: %v", err)
	}
	// GET /setup should respond at root
	req = httptest.NewRequest(http.MethodGet, "/setup", nil)
	req.Header.Set("X-Admin-Key", "test-admin-key")
	rec = httptest.NewRecorder()
	emptyApp.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /setup with empty prefix, got %d", rec.Code)
	}
	// GET /moul should respond at root
	req = httptest.NewRequest(http.MethodGet, "/moul", nil)
	rec = httptest.NewRecorder()
	emptyApp.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /moul with empty prefix, got %d", rec.Code)
	}
	// POST /admin/login should respond at root (under /admin)
	req = httptest.NewRequest(http.MethodPost, "/admin/login", strings.NewReader(`{"identity":"admin","password":"password"}`))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	emptyApp.Router().ServeHTTP(rec, req)
	// It should reach the handler and return 400 or 401 or 200 (not 404 or 301 redirect!)
	if rec.Code == http.StatusNotFound || rec.Code == http.StatusMovedPermanently {
		t.Fatalf("expected /admin/login to route to handler, got status %d", rec.Code)
	}
}
