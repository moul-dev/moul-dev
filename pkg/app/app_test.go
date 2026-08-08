package app

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/worker"
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

