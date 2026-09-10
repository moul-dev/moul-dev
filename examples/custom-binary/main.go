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
	// Initialize Moul application instance.
	// In embedded mode, the Web Admin Console is automatically bundled and served at "/_moul_/".
	moulApp := app.New(app.Config{
		Version: "1.0.0-custom-binary",
	})

	// Optional: You can customize or disable the admin console:
	//
	// 1. Change the admin console URL mount prefix:
	//    moulApp.WithAdminPrefix("/dashboard")
	//
	// 2. Supply your own custom embedded frontend (fs.FS) instead of default console:
	//    moulApp.WithAdminUI(myCustomSPAFileSystem)
	//
	// 3. Disable the admin console completely for a headless API microservice:
	//    moulApp.DisableAdminUI()
	//
	// 4. Enable convenience /admin redirect (disabled by default in embedded mode so your own routes aren't hijacked):
	//    moulApp.WithAdminRedirect(true)

	// Register custom application routes alongside Moul's built-in APIs
	moulApp.RegisterRoute("GET", "/api/custom/hello", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "Hello from custom Moul embedded binary!",
			"adminUI": "/_moul_/",
		})
	})

	// Access the underlying Echo router for grouping, custom middleware, etc.
	moulApp.OnRouterInit(func(router *echo.Echo) error {
		v1 := router.Group("/api/v1")
		v1.GET("/status", func(c *echo.Context) error {
			return c.JSON(http.StatusOK, map[string]string{
				"status": "online",
			})
		})
		return nil
	})

	// Register custom background worker tasks
	moulApp.RegisterWorker("SendWeeklyReport", func(ctx context.Context, job *worker.Job) error {
		slog.Info("Executing background report task", "job_id", job.ID)
		return nil
	})

	// Only print banners in HTTP mode (never in MCP stdio mode where stdout is reserved for JSON-RPC)
	if !app.IsMCP() {
		fmt.Println("==========================================================")
		fmt.Println("🚀 Custom Moul Server running at http://localhost:8090")
		fmt.Println("🛠️  Web Admin Console at       http://localhost:8090/_moul_/")
		fmt.Println("📡 Custom API Route at         http://localhost:8090/api/custom/hello")
		fmt.Println("==========================================================")
	}

	if err := moulApp.Start(context.Background()); err != nil {
		slog.Error("Failed to start custom Moul server", "err", err)
		os.Exit(1)
	}
}
