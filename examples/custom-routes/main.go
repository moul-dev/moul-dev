package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/pkg/app"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

func main() {
	// Initialize Moul application instance
	moulApp := app.New(app.Config{
		Version: "1.0.0-custom-backend",
	})

	// 1. Shorthand: Register a custom HTTP route via RegisterRoute helper
	moulApp.RegisterRoute("GET", "/api/custom/ping", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"status":  "pong",
			"backend": "custom-moul-engine",
		})
	})

	// 2. Advanced: Access the underlying Echo router via OnRouterInit hook
	moulApp.OnRouterInit(func(router *echo.Echo) error {
		// Define custom endpoint group or attach custom Echo middleware
		customGroup := router.Group("/api/custom")
		customGroup.GET("/health", func(c *echo.Context) error {
			return c.JSON(http.StatusOK, map[string]string{
				"health": "healthy",
			})
		})
		return nil
	})

	// 3. Lifecycle hook: OnBeforeStart runs after DB & services boot up
	moulApp.OnBeforeStart(func(a *app.App) error {
		slog.Info("Executing OnBeforeStart hook",
			"has_db", a.DB() != nil,
			"has_router", a.Router() != nil,
		)
		return nil
	})

	// 4. Combine custom HTTP routes with custom background job workers
	moulApp.RegisterWorker("ProcessCustomReport", func(ctx context.Context, job *worker.Job) error {
		slog.Info("Processing background report", "job_id", job.ID)
		return nil
	})

	fmt.Println("Starting custom Moul backend server on http://localhost:8090...")
	if err := moulApp.Start(context.Background()); err != nil {
		slog.Error("Failed to start custom moul backend", "err", err)
		os.Exit(1)
	}
}
