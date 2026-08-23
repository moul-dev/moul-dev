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
	"github.com/moul-dev/moul-dev/internal/mailer"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/tls"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/pocketbase/dbx"
)

// NewRouter constructs and returns a fully configured Echo server instance with all routes and middleware.
func NewRouter(dbConn *dbx.DB, workerEngine *worker.Engine, analyticsEngine *analytics.Engine, mailService *mailer.Mailer, sysmonCollector *sysmon.Collector, tlsManager *tls.Manager, adminKey string, isDev bool, version ...string) *echo.Echo {
	e := echo.New()
	e.Logger = slog.New(logger.Default)
	e.IPExtractor = echo.LegacyIPExtractor()

	appVersion := "dev"
	if len(version) > 0 && version[0] != "" {
		appVersion = version[0]
	}

	docsHandler := NewDocsHandler(dbConn, appVersion)

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
	if len(allowOrigins) == 0 {
		allowOrigins = []string{"*"}
	}
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: allowOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderAuthorization, echo.HeaderContentType, "X-Admin-Key", "X-Visit-Token", "X-Visitor-Token"},
	}))

	// Auth context loader (JWT extraction from Authorization header)
	e.Use(middleware.LoadAuthContextMiddleware(dbConn))

	// Request tracking middleware (creates visit sessions, tracks all requests)
	e.Use(middleware.RequestTracker(analyticsEngine, !isDev,
		middleware.WithExcludePaths([]string{"/api/visits", "/api/requests", "/openapi.yml", "/openapi.json", "/docs", "/api/mcp", "/AGENTS.md", "/llms.txt", "/llms-full.txt", "/_moul_", "/admin"}),
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
	if analyticsEngine == nil {
		analyticsEngine, _ = analytics.NewEngine(dbConn, "")
	}
	if mailService == nil {
		mailService, _ = mailer.NewMailer(dbConn)
	}

	moulHandler := NewMoulHandler(dbConn)
	recordHandler := NewRecordHandler(dbConn)
	recordHandler.Engine = workerEngine
	recordHandler.AnalyticsEngine = analyticsEngine
	recordHandler.SecureCookies = !isDev // Secure cookies in production, insecure in dev
	authHandler := NewAuthHandler(dbConn)
	authHandler.Engine = workerEngine
	authHandler.Mailer = mailService
	deviceFlowHandler := NewDeviceFlowHandler(dbConn)
	visitsHandler := NewVisitsHandler(dbConn)
	requestsHandler := NewRequestsHandler(dbConn)
	settingsHandler := NewSettingsHandler(dbConn)
	settingsHandler.Mailer = mailService
	settingsHandler.TLSManager = tlsManager
	uploadHandler := NewUploadHandler(dbConn)
	setupHandler := NewSetupHandler(dbConn)
	flagsHandler := NewFlagsHandler(dbConn)
	webhookHandler := NewWebhookHandler(dbConn)
	realtimeHandler := NewRealtimeHandler(dbConn)

	// Built-in MCP Server
	mcpServer := moulmcp.NewServer(dbConn, workerEngine, analyticsEngine, sysmonCollector, appVersion)
	mcpHandler := NewMCPHandler(mcpServer)

	// ── API Routes ──────────────────────────────────────────────────

	// Built-in MCP Server SSE endpoint (Admin-protected)
	e.Any("/api/mcp*", mcpHandler.ServeHTTP, middleware.RequireAuthOrAdmin(adminKey))

	// Documentation & AI Agent Specification endpoints
	e.GET("/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/openapi.json", docsHandler.ServeOpenAPISpecJSON)
	e.GET("/docs/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/docs/openapi.json", docsHandler.ServeOpenAPISpecJSON)
	e.GET("/docs", docsHandler.ServeAPIDocs)
	e.GET("/docs/", docsHandler.ServeAPIDocs)
	e.GET("/AGENTS.md", docsHandler.ServeAgentsMD)
	e.GET("/llms.txt", docsHandler.ServeLLMSTxt)
	e.GET("/llms-full.txt", docsHandler.ServeLLMSFullTxt)

	// Setup & Admin Console authentication (AdminKey-protected)
	setupGroup := e.Group("/api/setup", middleware.RequireAdminKey(adminKey))
	setupGroup.GET("", setupHandler.CheckSetupStatus)
	setupGroup.POST("", setupHandler.SetupRootUser)
	setupGroup.POST("/password", setupHandler.UpdateRootPassword)
	setupGroup.PATCH("/password", setupHandler.UpdateRootPassword)

	adminAuthGroup := e.Group("/api/admin", middleware.RequireAdminKey(adminKey))
	adminAuthGroup.POST("/login", setupHandler.AdminLogin)
	adminAuthGroup.POST("/password", setupHandler.UpdateRootPassword)
	adminAuthGroup.PATCH("/password", setupHandler.UpdateRootPassword)

	e.POST("/api/settings/password", setupHandler.UpdateRootPassword, middleware.RequireAdminKey(adminKey))
	e.PATCH("/api/settings/password", setupHandler.UpdateRootPassword, middleware.RequireAdminKey(adminKey))

	// Feature flags management & evaluation (Admin-protected)
	flagsGroup := e.Group("/api/feature-flags", middleware.RequireAuthOrAdmin(adminKey))
	flagsGroup.GET("", flagsHandler.ListFlags)
	flagsGroup.POST("", flagsHandler.CreateFlag)
	flagsGroup.GET("/:key", flagsHandler.GetFlag)
	flagsGroup.PATCH("/:key", flagsHandler.UpdateFlag)
	flagsGroup.DELETE("/:key", flagsHandler.DeleteFlag)
	flagsGroup.POST("/:key/eval", flagsHandler.EvaluateFlag)

	// 1. Moul schema management (Admin-protected)
	adminGroup := e.Group("/api/moul", middleware.RequireAuthOrAdmin(adminKey))
	adminGroup.POST("", moulHandler.CreateMoul)
	adminGroup.GET("/:name", moulHandler.GetMoul)
	adminGroup.PATCH("/:name", moulHandler.UpdateMoul)
	adminGroup.PUT("/:name", moulHandler.UpdateMoul)
	adminGroup.DELETE("/:name", moulHandler.DeleteMoul)
	adminGroup.GET("/:name/email-templates", authHandler.GetEmailTemplates)
	adminGroup.PUT("/:name/email-templates", authHandler.UpdateEmailTemplates)
	adminGroup.POST("/:name/email-templates/test", authHandler.SendTestEmail)
	adminGroup.GET("/:name/webhooks", webhookHandler.ListWebhooks)
	adminGroup.POST("/:name/webhooks", webhookHandler.CreateWebhook)
	adminGroup.GET("/:name/webhooks/:id", webhookHandler.GetWebhook)
	adminGroup.PATCH("/:name/webhooks/:id", webhookHandler.UpdateWebhook)
	adminGroup.PUT("/:name/webhooks/:id", webhookHandler.UpdateWebhook)
	adminGroup.DELETE("/:name/webhooks/:id", webhookHandler.DeleteWebhook)
	adminGroup.POST("/:name/webhooks/:id/test", webhookHandler.TestWebhook)
	adminGroup.POST("/:name/webhooks/test", webhookHandler.TestWebhook)

	// Admin settings management (Admin-protected)
	adminSettingsGroup := e.Group("/api/settings", middleware.RequireAuthOrAdmin(adminKey))
	adminSettingsGroup.GET("", settingsHandler.GetSettings)
	adminSettingsGroup.PATCH("", settingsHandler.UpdateSettings)

	// File upload & storage management endpoints (Requires auth or admin key)
	e.POST("/api/upload", uploadHandler.UploadFile, middleware.RequireAuthOrAdmin(adminKey))
	e.GET("/api/upload", uploadHandler.ListFiles, middleware.RequireAuthOrAdmin(adminKey))
	e.GET("/api/files", uploadHandler.ListFiles, middleware.RequireAuthOrAdmin(adminKey))
	e.DELETE("/api/upload/*", uploadHandler.DeleteFile, middleware.RequireAuthOrAdmin(adminKey))
	e.DELETE("/api/files/*", uploadHandler.DeleteFile, middleware.RequireAuthOrAdmin(adminKey))


	// Storage directory serving (local or S3 redirect)
	e.GET("/storage/*", uploadHandler.ServeStorage)

	// Public moul listing (read-only, no admin key needed)
	e.GET("/api/moul", moulHandler.ListMoul)

	// 2. Auth collections
	authGroup := e.Group("")
	authGroup.POST("/api/moul/:name/auth-with-password", authHandler.AuthWithPassword)
	authGroup.POST("/api/moul/:name/request-password-reset", authHandler.RequestPasswordReset)
	authGroup.POST("/api/moul/:name/confirm-password-reset", authHandler.ConfirmPasswordReset)
	authGroup.POST("/api/moul/:name/refresh", authHandler.RefreshToken)
	authGroup.POST("/api/moul/:name/auth-refresh", authHandler.RefreshToken)
	authGroup.POST("/api/moul/:name/logout", authHandler.Logout)
	authGroup.POST("/api/moul/:name/otp/request", authHandler.RequestOTP)
	authGroup.POST("/api/moul/:name/auth-with-otp", authHandler.AuthWithOTP)
	authGroup.POST("/api/moul/:name/passkey/register/options", authHandler.PasskeyRegisterOptions)
	authGroup.POST("/api/moul/:name/passkey/register/verify", authHandler.PasskeyRegisterVerify)
	authGroup.POST("/api/moul/:name/passkey/signup/options", authHandler.PasskeySignupOptions)
	authGroup.POST("/api/moul/:name/passkey/signup/verify", authHandler.PasskeySignupVerify)
	authGroup.POST("/api/moul/:name/passkey/login/options", authHandler.PasskeyLoginOptions)
	authGroup.POST("/api/moul/:name/passkey/login/verify", authHandler.PasskeyLoginVerify)
	authGroup.GET("/api/moul/:name/auth-methods", authHandler.GetAuthMethods)
	authGroup.GET("/api/moul/:name/oauth2/:provider", authHandler.OAuth2Authorize)
	authGroup.GET("/api/moul/:name/oauth2/:provider/callback", authHandler.OAuth2Callback)
	authGroup.POST("/api/moul/:name/oauth2/:provider/callback", authHandler.OAuth2Callback)
	authGroup.POST("/api/moul/:name/auth-with-oauth2", authHandler.AuthWithOAuth2)
	authGroup.POST("/api/oauth2/device/authorize", deviceFlowHandler.DeviceAuthorize)
	authGroup.POST("/api/oauth2/device/token", deviceFlowHandler.DeviceToken)
	authGroup.GET("/device", deviceFlowHandler.RenderDeviceForm)
	authGroup.POST("/device/verify", deviceFlowHandler.VerifyDevice)
	authGroup.GET("/favicon.svg", deviceFlowHandler.ServeFavicon)
	authGroup.GET("/favicon.ico", deviceFlowHandler.ServeFavicon)


	// 3. Record management (Data CRUD) — protected by per-moul rules
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.GET("/api/moul/:name/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/moul/:name/records/:id", recordHandler.DeleteRecord)

	// Real-time SSE record subscriptions
	e.GET("/api/moul/:name/subscribe", realtimeHandler.SubscribeCollection)
	e.GET("/api/moul/subscribe", realtimeHandler.SubscribeGlobal)

	// 4. Analytics visits log (JWT-protected)
	e.GET("/api/visits", visitsHandler.ListVisits)
	e.GET("/api/visits/:id", visitsHandler.GetVisit)

	// 5. Request tracking log (JWT-protected)
	e.GET("/api/requests", requestsHandler.ListRequests)
	e.GET("/api/requests/:id", requestsHandler.GetRequest)

	// 6. System monitoring metrics (JWT/Admin-protected)
	sysmonHandler := NewSysmonHandler(sysmonCollector)
	sysmonGroup := e.Group("/api/system/metrics", middleware.RequireAuthOrAdmin(adminKey))
	sysmonGroup.GET("", sysmonHandler.GetMetrics)
	sysmonGroup.POST("", sysmonHandler.PushMetrics)

	// 7. Embedded Web Admin Console
	RegisterAdminUIRoutes(e, "/_moul_")

	return e
}
