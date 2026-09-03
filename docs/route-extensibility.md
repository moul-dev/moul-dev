# Custom HTTP Route Extensibility Guide

This document describes how to extend `moul` with custom HTTP routes, Echo middlewares, and server lifecycle hooks without modifying or forking core `moul` files (`cmd/moul/main.go`).

---

## Overview

`moul` exposes a public Go package `github.com/moul-dev/moul-dev/pkg/app` that allows developers to embed the `moul` engine into custom Go applications, attach custom endpoints directly to the embedded Echo web server, and register startup lifecycle hooks.

---

## Pattern 1: Expressive Route Registration (`RegisterRoute`)

The simplest way to attach custom HTTP endpoints is by calling `app.RegisterRoute(method, path, handler, middleware...)`.

```go
package main

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/pkg/app"
)

func main() {
	moulApp := app.New(app.Config{
		Version: "1.0.0-custom",
	})

	// Register custom GET endpoint
	moulApp.RegisterRoute("GET", "/api/v1/healthcheck", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "healthy",
		})
	})

	// Start application
	if err := moulApp.Start(context.Background()); err != nil {
		logger.Fatal("Server failed", "err", err)
	}
}
```

---

## Pattern 2: Echo Router Hook (`OnRouterInit`)

For complex routing needs (such as endpoint groups, custom router middlewares, or third-party webhooks), use `OnRouterInit`. The callback receives the underlying `*echo.Echo` instance immediately after core `moul` routes are configured.

```go
moulApp.OnRouterInit(func(router *echo.Echo) error {
    // Add custom route group
    v2Group := router.Group("/api/v2")
    
    v2Group.POST("/webhooks/stripe", func(c *echo.Context) error {
        // Handle incoming Stripe webhook
        return c.NoContent(http.StatusOK)
    })
    
    return nil
})
```

---

## Pattern 3: Server Lifecycle Hook (`OnBeforeStart`)

`OnBeforeStart` executes at the end of `Bootstrap()`, before server listeners start accepting traffic. This callback provides full access to initialized services via `app.DB()`, `app.Router()`, `app.WorkerEngine()`, `app.Mailer()`, and `app.AnalyticsEngine()`.

```go
moulApp.OnBeforeStart(func(a *app.App) error {
    // Access database or services during startup
    dbConn := a.DB()
    logger.Info("App bootstrapped with DB connection", "db", dbConn != nil)
    return nil
})
```

---

## Combining Route Hooks & Worker Handlers

`pkg/app` allows you to register custom HTTP routes and background worker handlers side-by-side in the same binary.

```go
// Custom HTTP Route enqueuing a background job
moulApp.RegisterRoute("POST", "/api/v1/reports", func(c *echo.Context) error {
    engine := moulApp.WorkerEngine()
    job, err := engine.Enqueue(c.Request().Context(), "background_jobs", map[string]interface{}{
        "worker": "GenerateReport",
        "args": map[string]interface{}{"report_type": "monthly"},
    })
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusAccepted, job)
})

// Custom worker handler processing the job
moulApp.RegisterWorker("GenerateReport", func(ctx context.Context, job *worker.Job) error {
    // Process report asynchronously
    return nil
})
```

---

## Runnable Example

A complete runnable example is available at [examples/custom-routes/main.go](../examples/custom-routes/main.go).

---

## Integration Testing Hooks

When embedding `moul`, integration-test custom hooks (`OnWorkerInit`, `OnRouterInit`, `OnBeforeStart`) by calling `app.Bootstrap()` and leveraging standard Go test utilities (`httptest.NewServer(app.Router())` and `t.TempDir()`):

```go
func TestEmbeddedAppIntegration(t *testing.T) {
	moulApp := app.New(app.Config{
		DBPath:    filepath.Join(t.TempDir(), "test.db"),
		Env:       "test",
		JWTSecret: "test-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	moulApp.OnBeforeStart(func(a *app.App) error {
		// Initialize database tables or seed data
		return nil
	})

	moulApp.OnRouterInit(func(r *echo.Echo) error {
		// Attach custom routes and middleware
		return nil
	})

	if err := moulApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	server := httptest.NewServer(moulApp.Router())
	defer server.Close()

	// Execute HTTP requests against server.URL
}
```
