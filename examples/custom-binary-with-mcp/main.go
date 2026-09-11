package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/moul-dev/moul-dev/pkg/app"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

func main() {
	// Initialize Moul application instance.
	// In embedded mode, all built-in services (SQLite DB, Worker Engine, Analytics,
	// System Monitoring, Web Admin Console, and MCP Server) are pre-wired.
	moulApp := app.New(app.Config{
		Version: "1.0.0-custom-mcp",
	})

	// 1. Register custom application HTTP routes
	moulApp.RegisterRoute("GET", "/api/custom/info", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"service": "custom-binary-with-mcp",
			"status":  "healthy",
			"adminUI": "/_moul_/",
			"mcp":     "/api/mcp",
		})
	})

	// 2. Register custom background worker tasks
	moulApp.RegisterWorker("ProcessInvoice", func(ctx context.Context, job *worker.Job) error {
		slog.Info("Executing background invoice processing", "job_id", job.ID)
		return nil
	})

	// 3. Register custom Model Context Protocol (MCP) tools
	// Custom MCP tools are automatically exposed in both transport modes:
	//   - Stdio transport (`go run main.go mcp`)
	//   - Streamable HTTP / SSE transport (`go run main.go start` at http://localhost:8090/api/mcp)
	calculateDiscountTool := mcp.NewTool(
		"calculate_customer_discount",
		mcp.WithDescription("Calculate personalized customer discount rate based on tier and order amount"),
		mcp.WithString("tier", mcp.Required(), mcp.Description("Customer membership tier: standard, silver, gold, or platinum")),
		mcp.WithNumber("amount", mcp.Required(), mcp.Description("Total order amount in USD")),
	)

	moulApp.RegisterMCPTool(calculateDiscountTool, func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		tier := req.GetString("tier", "standard")
		amount := req.GetFloat("amount", 0.0)

		var discountPercent float64
		switch tier {
		case "platinum":
			discountPercent = 0.25
		case "gold":
			discountPercent = 0.15
		case "silver":
			discountPercent = 0.10
		default:
			discountPercent = 0.05
		}

		discountTotal := amount * discountPercent
		finalPrice := amount - discountTotal

		resultMsg := fmt.Sprintf(
			"Tier: %s | Base: $%.2f | Discount: %.0f%% (-$%.2f) | Final: $%.2f",
			tier, amount, discountPercent*100, discountTotal, finalPrice,
		)
		return mcp.NewToolResultText(resultMsg), nil
	})

	// 4. IMPORTANT: Guard console banners with !app.IsMCP()!
	// In Stdio MCP mode, stdout is reserved strictly for JSON-RPC message frames.
	// Any non-JSON text printed to stdout will corrupt communication with AI assistants (Claude, Cursor, etc.).
	if !app.IsMCP() {
		fmt.Println("==================================================================")
		fmt.Println("🚀 Custom Moul Binary with Built-in MCP Server")
		fmt.Println("🛠️  Web Admin Console:             http://localhost:8090/_moul_/")
		fmt.Println("📡 Custom API Route:              http://localhost:8090/api/custom/info")
		fmt.Println("🤖 Streamable HTTP MCP Endpoint:  http://localhost:8090/api/mcp")
		fmt.Println("   - Auth Option 1 (Bearer):      Authorization: Bearer <ADMIN_KEY>")
		fmt.Println("   - Auth Option 2 (Admin Key):   X-Admin-Key: <ADMIN_KEY>")
		fmt.Println("   Stdio Transport Command:       go run main.go mcp")
		fmt.Println("==================================================================")
	}

	// 5. Start the application.
	// If invoked with the 'mcp' CLI argument or MOUL_MCP=true, Start() automatically
	// runs in MCP stdio transport mode. Otherwise, it starts the full HTTP server engine.
	if err := moulApp.Start(context.Background()); err != nil {
		slog.Error("Failed to start application", "err", err)
		os.Exit(1)
	}
}
