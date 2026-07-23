package handlers

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/gobuffalo/envy"
	"github.com/labstack/echo/v5"
	echoMiddleware "github.com/labstack/echo/v5/middleware"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/pocketbase/dbx"
)

// NewRouter constructs and returns a fully configured Echo server instance with all routes and middleware.
func NewRouter(dbConn *dbx.DB, workerEngine *worker.Engine, analyticsEngine *analytics.Engine, adminKey string, isDev bool) *echo.Echo {
	e := echo.New()
	e.Logger = slog.New(logger.Default)
	e.IPExtractor = echo.LegacyIPExtractor()

	// ── Global Middleware ────────────────────────────────────────────

	// Request body size limit (5MB)
	e.Use(echoMiddleware.BodyLimit(5 * 1024 * 1024))

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

	// Initialize dynamic rate limiter
	if err := middleware.InitRateLimiter(dbConn); err != nil {
		e.Logger.Error("Failed to initialize dynamic rate limiter", "error", err)
	}
	// Initialize root user allowed IPs
	if err := middleware.InitRootIPs(dbConn); err != nil {
		e.Logger.Error("Failed to initialize root user allowed IPs", "error", err)
	}
	// Use dynamic rate limiter globally
	e.Use(middleware.DynamicRateLimiter(adminKey))

	// ── Handlers initialization ─────────────────────────────────────
	moulHandler := NewMoulHandler(dbConn)
	recordHandler := NewRecordHandler(dbConn)
	recordHandler.Engine = workerEngine
	recordHandler.AnalyticsEngine = analyticsEngine
	recordHandler.SecureCookies = !isDev // Secure cookies in production, insecure in dev
	authHandler := NewAuthHandler(dbConn)
	authHandler.Engine = workerEngine
	deviceFlowHandler := NewDeviceFlowHandler(dbConn)
	visitsHandler := NewVisitsHandler(dbConn)
	requestsHandler := NewRequestsHandler(dbConn)
	settingsHandler := NewSettingsHandler(dbConn)
	uploadHandler := NewUploadHandler(dbConn)
	setupHandler := NewSetupHandler(dbConn)

	// ── API Routes ──────────────────────────────────────────────────

	// Setup management (Admin-protected)
	setupGroup := e.Group("/api/setup", middleware.RequireAdminKey(adminKey))
	setupGroup.GET("", setupHandler.CheckSetupStatus)
	setupGroup.POST("", setupHandler.SetupRootUser)

	// 1. Moul schema management (Admin-protected)
	adminGroup := e.Group("/api/moul", middleware.RequireAuthOrAdmin(adminKey))
	adminGroup.POST("", moulHandler.CreateMoul)
	adminGroup.PATCH("/:name", moulHandler.UpdateMoul)
	adminGroup.PUT("/:name", moulHandler.UpdateMoul)
	adminGroup.DELETE("/:name", moulHandler.DeleteMoul)
	adminGroup.GET("/:moulName/email-templates", authHandler.GetEmailTemplates)
	adminGroup.PUT("/:moulName/email-templates", authHandler.UpdateEmailTemplates)
	adminGroup.POST("/:moulName/email-templates/test", authHandler.SendTestEmail)

	// Admin settings management (Admin-protected)
	adminSettingsGroup := e.Group("/api/settings", middleware.RequireAuthOrAdmin(adminKey))
	adminSettingsGroup.GET("", settingsHandler.GetSettings)
	adminSettingsGroup.PATCH("", settingsHandler.UpdateSettings)

	// File upload endpoint (Requires auth or admin key)
	e.POST("/api/upload", uploadHandler.UploadFile, middleware.RequireAuthOrAdmin(adminKey))

	// Static local storage directory serving
	e.Static("/storage", "storage")

	// Public moul listing (read-only, no admin key needed)
	e.GET("/api/moul", moulHandler.ListMoul)

	// 2. Auth collections
	authGroup := e.Group("")
	authGroup.POST("/api/moul/:moulName/auth-with-password", authHandler.AuthWithPassword)
	authGroup.POST("/api/moul/:moulName/otp/request", authHandler.RequestOTP)
	authGroup.POST("/api/moul/:moulName/auth-with-otp", authHandler.AuthWithOTP)
	authGroup.POST("/api/moul/:moulName/passkey/register/options", authHandler.PasskeyRegisterOptions)
	authGroup.POST("/api/moul/:moulName/passkey/register/verify", authHandler.PasskeyRegisterVerify)
	authGroup.POST("/api/moul/:moulName/passkey/signup/options", authHandler.PasskeySignupOptions)
	authGroup.POST("/api/moul/:moulName/passkey/signup/verify", authHandler.PasskeySignupVerify)
	authGroup.POST("/api/moul/:moulName/passkey/login/options", authHandler.PasskeyLoginOptions)
	authGroup.POST("/api/moul/:moulName/passkey/login/verify", authHandler.PasskeyLoginVerify)
	authGroup.POST("/api/oauth2/device/authorize", deviceFlowHandler.DeviceAuthorize)
	authGroup.POST("/api/oauth2/device/token", deviceFlowHandler.DeviceToken)
	authGroup.GET("/device", deviceFlowHandler.RenderDeviceForm)
	authGroup.POST("/device/verify", deviceFlowHandler.VerifyDevice)
	authGroup.GET("/favicon.svg", deviceFlowHandler.ServeFavicon)
	authGroup.GET("/favicon.ico", deviceFlowHandler.ServeFavicon)


	// 3. Record management (Data CRUD) — protected by per-moul rules
	e.POST("/api/moul/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:moulName/records", recordHandler.ListRecords)
	e.GET("/api/moul/:moulName/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/moul/:moulName/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/moul/:moulName/records/:id", recordHandler.DeleteRecord)

	// 4. Analytics visits log (JWT-protected)
	e.GET("/api/visits", visitsHandler.ListVisits)
	e.GET("/api/visits/:id", visitsHandler.GetVisit)

	// 5. Request tracking log (JWT-protected)
	e.GET("/api/requests", requestsHandler.ListRequests)
	e.GET("/api/requests/:id", requestsHandler.GetRequest)

	return e
}
