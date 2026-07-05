package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gobuffalo/envy"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/logger"
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
		logger.Fatal("MOUL_JWT_SECRET environment variable is required", "err", err)
	}
	auth.InitJWT(jwtSecret)

	adminKey, err := envy.MustGet("MOUL_ADMIN_KEY")
	if err != nil {
		logger.Fatal("MOUL_ADMIN_KEY environment variable is required", "err", err)
	}

	dbPath := envy.Get("MOUL_DB_PATH", "moul-local.db")

	// 1. Defer Litestream store shutdown (must run AFTER dbConn.Close())
	var litestreamStore *backup.LitestreamStore
	defer func() {
		if litestreamStore != nil {
			logger.Info("Stopping Litestream replication...")
			if err := litestreamStore.Close(context.Background()); err != nil {
				logger.Error("Error stopping Litestream replication", "err", err)
			}
		}
	}()

	// 2. Check if the database file exists; if missing, attempt restore
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		logger.Info("Database file not found, attempting Litestream S3 restore", "path", dbPath)
		if err := backup.RestoreFromS3(context.Background(), dbPath); err != nil {
			logger.Error("Litestream restore error", "err", err)
		}
	}

	// ── Database ────────────────────────────────────────────────────
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		logger.Fatal("Database initialization failed", "err", err)
	}
	defer dbConn.Close()

	// 3. Start Litestream replication
	store, err := backup.StartReplication(context.Background(), dbConn, dbPath)
	if err != nil {
		logger.Error("Failed to start Litestream replication", "err", err)
	} else {
		litestreamStore = store
	}

	// ── Analytics Engine ────────────────────────────────────────────
	geoIPPath := envy.Get("GEOIP_DB_PATH", "")
	analyticsEngine, err := analytics.NewEngine(dbConn, geoIPPath)
	if err != nil {
		logger.Fatal("Analytics engine initialization failed", "err", err)
	}
	defer analyticsEngine.Close()

	// ── Worker Engine ───────────────────────────────────────────────
	workerEngine := worker.NewEngine(dbConn)

	// Register a default worker handler as an example
	workerEngine.Register("SendEmail", func(ctx context.Context, job *worker.Job) error {
		logger.Info("Successfully processed SendEmail job", "jobID", job.ID, "args", job.Args)
		return nil
	})

	// Start Worker Engine
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	workerEngine.Start(ctx)
	defer workerEngine.Stop()

	// Start Analytics Request Flusher
	analyticsEngine.StartFlusher(ctx)

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

	// Request tracking middleware (creates visit sessions, tracks all requests)
	e.Use(middleware.RequestTracker(analyticsEngine, !isDev,
		middleware.WithExcludePaths([]string{"/api/visits", "/api/requests"}),
	))

	// HTTP Request logging
	e.Use(middleware.RequestLogger())

	// ── Handlers initialization ─────────────────────────────────────
	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	recordHandler.Engine = workerEngine
	recordHandler.AnalyticsEngine = analyticsEngine
	recordHandler.SecureCookies = !isDev // Secure cookies in production, insecure in dev
	authHandler := handlers.NewAuthHandler(dbConn)
	authHandler.Engine = workerEngine
	deviceFlowHandler := handlers.NewDeviceFlowHandler(dbConn)
	visitsHandler := handlers.NewVisitsHandler(dbConn)
	requestsHandler := handlers.NewRequestsHandler(dbConn)
	settingsHandler := handlers.NewSettingsHandler(dbConn)
	uploadHandler := handlers.NewUploadHandler(dbConn)
	setupHandler := handlers.NewSetupHandler(dbConn)

	// ── API Routes ──────────────────────────────────────────────────

	// Setup management (Admin-protected)
	setupGroup := e.Group("/api/setup", middleware.RequireAdminKey(adminKey))
	setupGroup.GET("", setupHandler.CheckSetupStatus)
	setupGroup.POST("", setupHandler.SetupRootUser)

	// 1. Moul schema management (Admin-protected)
	adminGroup := e.Group("/api/mouls", middleware.RequireAdminKey(adminKey))
	adminGroup.POST("", moulHandler.CreateMoul)
	adminGroup.DELETE("/:name", moulHandler.DeleteMoul)
	adminGroup.GET("/:moulName/email-templates", authHandler.GetEmailTemplates)
	adminGroup.PUT("/:moulName/email-templates", authHandler.UpdateEmailTemplates)
	adminGroup.POST("/:moulName/email-templates/test", authHandler.SendTestEmail)

	// Admin settings management (Admin-protected)
	adminSettingsGroup := e.Group("/api/settings", middleware.RequireAdminKey(adminKey))
	adminSettingsGroup.GET("", settingsHandler.GetSettings)
	adminSettingsGroup.PATCH("", settingsHandler.UpdateSettings)

	// File upload endpoint (Requires auth or admin key)
	e.POST("/api/upload", uploadHandler.UploadFile, middleware.RequireAuthOrAdmin(adminKey))

	// Static local storage directory serving
	e.Static("/storage", "storage")

	// Public moul listing (read-only, no admin key needed)
	e.GET("/api/mouls", moulHandler.ListMouls)

	// 2. Auth collections with rate limiting (5 requests/second per IP)
	authGroup := e.Group("", echoMiddleware.RateLimiter(echoMiddleware.NewRateLimiterMemoryStore(5)))
	authGroup.POST("/api/mouls/:moulName/auth-with-password", authHandler.AuthWithPassword)
	authGroup.POST("/api/mouls/:moulName/otp/request", authHandler.RequestOTP)
	authGroup.POST("/api/mouls/:moulName/auth-with-otp", authHandler.AuthWithOTP)
	authGroup.POST("/api/mouls/:moulName/passkey/register/options", authHandler.PasskeyRegisterOptions)
	authGroup.POST("/api/mouls/:moulName/passkey/register/verify", authHandler.PasskeyRegisterVerify)
	authGroup.POST("/api/mouls/:moulName/passkey/signup/options", authHandler.PasskeySignupOptions)
	authGroup.POST("/api/mouls/:moulName/passkey/signup/verify", authHandler.PasskeySignupVerify)
	authGroup.POST("/api/mouls/:moulName/passkey/login/options", authHandler.PasskeyLoginOptions)
	authGroup.POST("/api/mouls/:moulName/passkey/login/verify", authHandler.PasskeyLoginVerify)
	authGroup.POST("/api/oauth2/device/authorize", deviceFlowHandler.DeviceAuthorize)
	authGroup.POST("/api/oauth2/device/token", deviceFlowHandler.DeviceToken)
	authGroup.GET("/device", deviceFlowHandler.RenderDeviceForm)
	authGroup.POST("/device/verify", deviceFlowHandler.VerifyDevice)

	// 3. Record management (Data CRUD) — protected by per-moul rules
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/mouls/:moulName/records", recordHandler.ListRecords)
	e.GET("/api/mouls/:moulName/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/mouls/:moulName/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/mouls/:moulName/records/:id", recordHandler.DeleteRecord)

	// 4. Analytics visits log (JWT-protected)
	e.GET("/api/visits", visitsHandler.ListVisits)
	e.GET("/api/visits/:id", visitsHandler.GetVisit)

	// 5. Request tracking log (JWT-protected)
	e.GET("/api/requests", requestsHandler.ListRequests)
	e.GET("/api/requests/:id", requestsHandler.GetRequest)

	// ── Start server ────────────────────────────────────────────────
	go func() {
		logger.Info("Starting moul-dev engine server", "addr", "http://localhost:8090", "env", moulEnv)
		if err := e.Start(":8090"); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server failed to start", "err", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server gracefully...")
	cancel()            // Cancel context for background workers
	workerEngine.Stop() // Wait for active jobs to complete

	ctxShutdown, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()
	if err := e.Shutdown(ctxShutdown); err != nil {
		logger.Fatal("Server shutdown failed", "err", err)
	}
	logger.Info("Server stopped gracefully")
}
