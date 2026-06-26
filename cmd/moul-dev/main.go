package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gobuffalo/envy"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/worker"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load environment variables (envy automatically loads .env files)
	moulEnv := envy.Get("MOUL_ENV", "development")
	isDev := moulEnv == "development"

	// ── Required secrets ────────────────────────────────────────────
	jwtSecret, err := envy.MustGet("MOUL_JWT_SECRET")
	if err != nil {
		log.Fatalf("MOUL_JWT_SECRET environment variable is required: %v", err)
	}
	auth.InitJWT(jwtSecret)

	adminKey, err := envy.MustGet("MOUL_ADMIN_KEY")
	if err != nil {
		log.Fatalf("MOUL_ADMIN_KEY environment variable is required: %v", err)
	}

	// ── Database ────────────────────────────────────────────────────
	dbConn, err := db.InitDB("moul-local.db")
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer dbConn.Close()

	// ── Analytics Engine ────────────────────────────────────────────
	geoIPPath := envy.Get("GEOIP_DB_PATH", "")
	analyticsEngine, err := analytics.NewEngine(dbConn, geoIPPath)
	if err != nil {
		log.Fatalf("Analytics engine initialization failed: %v", err)
	}
	defer analyticsEngine.Close()

	// ── Worker Engine ───────────────────────────────────────────────
	workerEngine := worker.NewEngine(dbConn)

	// Register a default worker handler as an example
	workerEngine.Register("SendEmail", func(ctx context.Context, job *worker.Job) error {
		log.Printf("[Worker Handler] Successfully processed SendEmail job with ID=%s, args=%v\n", job.ID, job.Args)
		return nil
	})

	// Start Worker Engine
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	workerEngine.Start(ctx)
	defer workerEngine.Stop()

	// ── Echo server ─────────────────────────────────────────────────
	e := echo.New()

	// ── Global Middleware ────────────────────────────────────────────

	// Request body size limit (5MB)
	e.Use(echoMiddleware.BodyLimit("5M"))

	// CORS configuration
	corsOrigins := envy.Get("MOUL_CORS_ORIGINS", "")
	var allowOrigins []string
	if corsOrigins != "" {
		allowOrigins = strings.Split(corsOrigins, ",")
		for i, o := range allowOrigins {
			allowOrigins[i] = strings.TrimSpace(o)
		}
	} else if isDev {
		allowOrigins = []string{"*"}
	}
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: allowOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderAuthorization, echo.HeaderContentType, "X-Admin-Key", "X-Visit-Token", "X-Visitor-Token"},
	}))

	// Auth context loader (JWT extraction from Authorization header)
	e.Use(middleware.LoadAuthContextMiddleware())

	// ── Handlers initialization ─────────────────────────────────────
	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	recordHandler.Engine = workerEngine
	recordHandler.AnalyticsEngine = analyticsEngine
	recordHandler.SecureCookies = !isDev // Secure cookies in production, insecure in dev
	authHandler := handlers.NewAuthHandler(dbConn)
	visitsHandler := handlers.NewVisitsHandler(dbConn)

	// ── API Routes ──────────────────────────────────────────────────

	// 1. Moul schema management (Admin-protected)
	adminGroup := e.Group("/api/mouls", middleware.RequireAdminKey(adminKey))
	adminGroup.POST("", moulHandler.CreateMoul)
	adminGroup.DELETE("/:name", moulHandler.DeleteMoul)

	// Public moul listing (read-only, no admin key needed)
	e.GET("/api/mouls", moulHandler.ListMouls)

	// 2. Auth collections with rate limiting (5 requests/second per IP)
	authGroup := e.Group("", echoMiddleware.RateLimiter(echoMiddleware.NewRateLimiterMemoryStore(5)))
	authGroup.POST("/api/mouls/:moulName/auth-with-password", authHandler.AuthWithPassword)

	// 3. Record management (Data CRUD) — protected by per-moul rules
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/mouls/:moulName/records", recordHandler.ListRecords)
	e.GET("/api/mouls/:moulName/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/mouls/:moulName/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/mouls/:moulName/records/:id", recordHandler.DeleteRecord)

	// 4. Analytics visits log (JWT-protected)
	e.GET("/api/visits", visitsHandler.ListVisits)
	e.GET("/api/visits/:id", visitsHandler.GetVisit)

	// ── Start server ────────────────────────────────────────────────
	go func() {
		log.Printf("Starting moul-dev engine server on http://localhost:8090 (env=%s)", moulEnv)
		if err := e.Start(":8090"); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")
	cancel()            // Cancel context for background workers
	workerEngine.Stop() // Wait for active jobs to complete

	ctxShutdown, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()
	if err := e.Shutdown(ctxShutdown); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	log.Println("Server stopped gracefully")
}
