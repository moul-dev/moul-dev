package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/moul-dev/moul-dev/pkg/app"
)

func main() {
	// Initialize Mould application instance
	mouldApp := app.New(app.Config{
		Version: "1.0.0-custom-backend",
	})

	// 1. Shorthand: Register a custom HTTP route via RegisterRoute helper
	mouldApp.RegisterRoute("GET", "/api/custom/ping", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"status":  "pong",
			"backend": "custom-mould-engine",
		})
	})

	// 2. Advanced: Access the underlying Echo router via OnRouterInit hook
	mouldApp.OnRouterInit(func(router *echo.Echo) error {
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
	mouldApp.OnBeforeStart(func(a *app.App) error {
		logger.Info("Executing OnBeforeStart hook",
			"has_db", a.DB() != nil,
			"has_router", a.Router() != nil,
		)
		return nil
	})

	// 4. Combine custom HTTP routes with custom background job workers
	mouldApp.RegisterWorker("ProcessCustomReport", func(ctx context.Context, job *worker.Job) error {
		logger.Info("Processing background report", "job_id", job.ID)
		return nil
	})

	fmt.Println("Starting custom Mould backend server on http://localhost:8090...")
	if err := mouldApp.Start(context.Background()); err != nil {
		logger.Fatal("Failed to start custom mould backend", "err", err)
		os.Exit(1)
	}
}
