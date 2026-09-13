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
	"github.com/moul-dev/moul-dev/pkg/worker"
	"github.com/pocketbase/dbx"
)

// RouterConfig holds optional configuration settings for creating an Echo router.
type RouterConfig struct {
	Version        string
	APIPrefix      *string
	AdminUIOptions AdminUIOptions
	DisableAdminUI bool
	MCPServer      *moulmcp.Server
}

// NormalizeAPIPrefix normalizes the API path prefix.
// If prefix is nil, the default "/api" is returned.
// An empty string or "/" normalizes to "" (mounted at root).
// Non-empty prefixes will always start with "/" and have no trailing slash (e.g. "/v1").
func NormalizeAPIPrefix(prefix *string) string {
	if prefix == nil {
		return "/api"
	}
	p := strings.TrimSpace(*prefix)
	p = strings.TrimRight(p, "/")
	if p == "" || p == "/" {
		return ""
	}
	if !strings.HasPrefix(p, "/") {
		p = "/" + p
	}
	return p
}

// NewRouter constructs and returns a fully configured Echo server instance with default options.
func NewRouter(dbConn *dbx.DB, workerEngine *worker.Engine, analyticsEngine *analytics.Engine, mailService *mailer.Mailer, sysmonCollector *sysmon.Collector, tlsManager *tls.Manager, adminKey string, isDev bool, version ...string) *echo.Echo {
	appVersion := "dev"
	if len(version) > 0 && version[0] != "" {
		appVersion = version[0]
	}
	return NewRouterWithOptions(dbConn, workerEngine, analyticsEngine, mailService, sysmonCollector, tlsManager, adminKey, isDev, RouterConfig{
		Version: appVersion,
		AdminUIOptions: AdminUIOptions{
			Prefix: "/_moul_",
		},
	})
}

// NewRouterWithOptions constructs and returns a fully configured Echo server instance with custom configuration options.
func NewRouterWithOptions(dbConn *dbx.DB, workerEngine *worker.Engine, analyticsEngine *analytics.Engine, mailService *mailer.Mailer, sysmonCollector *sysmon.Collector, tlsManager *tls.Manager, adminKey string, isDev bool, cfg RouterConfig) *echo.Echo {
	e := echo.New()
	e.Logger = slog.New(logger.Default)
	e.IPExtractor = echo.LegacyIPExtractor()

	appVersion := cfg.Version
	if appVersion == "" {
		appVersion = "dev"
	}

	apiPrefix := NormalizeAPIPrefix(cfg.APIPrefix)
	apiPath := func(path string) string {
		clean := "/" + strings.TrimLeft(path, "/")
		if apiPrefix == "" {
			return clean
		}
		return apiPrefix + clean
	}

	if analyticsEngine == nil {
		analyticsEngine, _ = analytics.NewEngine(dbConn, "")
	}
	if mailService == nil {
		mailService, _ = mailer.NewMailer(dbConn)
	}

	docsHandler := NewDocsHandler(dbConn, appVersion)
	docsHandler.SetAPIPrefix(apiPrefix)

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
		middleware.WithExcludePaths([]string{
			apiPath("/visits"),
			apiPath("/requests"),
			apiPath("/workers"),
			"/openapi.yml",
			"/openapi.json",
			"/docs",
			apiPath("/mcp"),
			"/AGENTS.md",
			"/llms.txt",
			"/llms-full.txt",
			"/_moul_",
		}),
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
	recordHandler := NewRecordHandler(dbConn, adminKey)
	recordHandler.Engine = workerEngine
	recordHandler.AnalyticsEngine = analyticsEngine
	recordHandler.SecureCookies = !isDev // Secure cookies in production, insecure in dev
	authHandler := NewAuthHandler(dbConn)
	authHandler.Engine = workerEngine
	authHandler.Mailer = mailService
	deviceFlowHandler := NewDeviceFlowHandler(dbConn)
	visitsHandler := NewVisitsHandler(dbConn)
	requestsHandler := NewRequestsHandler(dbConn)
	workersHandler := NewWorkersHandler(dbConn, workerEngine)
	settingsHandler := NewSettingsHandler(dbConn)
	settingsHandler.Mailer = mailService
	settingsHandler.TLSManager = tlsManager
	uploadHandler := NewUploadHandler(dbConn)
	setupHandler := NewSetupHandler(dbConn)
	flagsHandler := NewFlagsHandler(dbConn)
	webhookHandler := NewWebhookHandler(dbConn)
	realtimeHandler := NewRealtimeHandler(dbConn)
	rulesTestHandler := NewRulesTestHandler(dbConn)
	exportImportHandler := NewExportImportHandler(dbConn)

	// Built-in MCP Server
	mcpServer := cfg.MCPServer
	if mcpServer == nil {
		mcpServer = moulmcp.NewServer(dbConn, workerEngine, analyticsEngine, sysmonCollector, appVersion)
	}
	mcpHandler := NewMCPHandler(mcpServer)

	// ── API Routes ──────────────────────────────────────────────────

	// Built-in MCP Server SSE endpoint (Admin-protected)
	e.Any(apiPath("/mcp*"), mcpHandler.ServeHTTP, middleware.RequireAuthOrAdmin(adminKey))

	// Rule expression testing and validation sandbox
	e.POST(apiPath("/rules/test"), rulesTestHandler.TestRule, middleware.RequireAuthOrAdmin(adminKey))

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
	setupGroup := e.Group(apiPath("/setup"), middleware.RequireAdminKey(adminKey))
	setupGroup.GET("", setupHandler.CheckSetupStatus)
	setupGroup.POST("", setupHandler.SetupRootUser)
	setupGroup.GET("/account", setupHandler.GetRootAccount)
	setupGroup.POST("/account", setupHandler.UpdateRootAccount)
	setupGroup.PATCH("/account", setupHandler.UpdateRootAccount)
	setupGroup.POST("/password", setupHandler.UpdateRootPassword)
	setupGroup.PATCH("/password", setupHandler.UpdateRootPassword)

	adminAuthGroup := e.Group(apiPath("/admin"), middleware.RequireAdminKey(adminKey))
	adminAuthGroup.POST("/login", setupHandler.AdminLogin)
	adminAuthGroup.GET("/account", setupHandler.GetRootAccount)
	adminAuthGroup.POST("/account", setupHandler.UpdateRootAccount)
	adminAuthGroup.PATCH("/account", setupHandler.UpdateRootAccount)
	adminAuthGroup.POST("/password", setupHandler.UpdateRootPassword)
	adminAuthGroup.PATCH("/password", setupHandler.UpdateRootPassword)
	adminAuthGroup.POST("/reload", settingsHandler.ReloadSettings)

	e.GET(apiPath("/settings/account"), setupHandler.GetRootAccount, middleware.RequireAdminKey(adminKey))
	e.POST(apiPath("/settings/account"), setupHandler.UpdateRootAccount, middleware.RequireAdminKey(adminKey))
	e.PATCH(apiPath("/settings/account"), setupHandler.UpdateRootAccount, middleware.RequireAdminKey(adminKey))
	e.POST(apiPath("/settings/password"), setupHandler.UpdateRootPassword, middleware.RequireAdminKey(adminKey))
	e.PATCH(apiPath("/settings/password"), setupHandler.UpdateRootPassword, middleware.RequireAdminKey(adminKey))
	e.POST(apiPath("/settings/reload"), settingsHandler.ReloadSettings, middleware.RequireAdminKey(adminKey))

	// Feature flags management & evaluation (Admin-protected)
	flagsGroup := e.Group(apiPath("/feature-flags"), middleware.RequireAuthOrAdmin(adminKey))
	flagsGroup.GET("", flagsHandler.ListFlags)
	flagsGroup.POST("", flagsHandler.CreateFlag)
	flagsGroup.GET("/:key", flagsHandler.GetFlag)
	flagsGroup.PATCH("/:key", flagsHandler.UpdateFlag)
	flagsGroup.DELETE("/:key", flagsHandler.DeleteFlag)
	flagsGroup.POST("/:key/eval", flagsHandler.EvaluateFlag)

	// 1. Moul schema management (Admin-protected)
	adminGroup := e.Group(apiPath("/moul"), middleware.RequireAuthOrAdmin(adminKey))
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
	adminGroup.GET("/:name/export", exportImportHandler.ExportRecords)
	adminGroup.POST("/:name/import", exportImportHandler.ImportRecords)

	// Admin settings management (Admin-protected)
	adminSettingsGroup := e.Group(apiPath("/settings"), middleware.RequireAuthOrAdmin(adminKey))
	adminSettingsGroup.GET("", settingsHandler.GetSettings)
	adminSettingsGroup.PATCH("", settingsHandler.UpdateSettings)

	// File upload & storage management endpoints (Requires auth or admin key)
	e.POST(apiPath("/upload"), uploadHandler.UploadFile, middleware.RequireAuthOrAdmin(adminKey))
	e.GET(apiPath("/upload"), uploadHandler.ListFiles, middleware.RequireAuthOrAdmin(adminKey))
	e.GET(apiPath("/files"), uploadHandler.ListFiles, middleware.RequireAuthOrAdmin(adminKey))
	e.DELETE(apiPath("/upload/*"), uploadHandler.DeleteFile, middleware.RequireAuthOrAdmin(adminKey))
	e.DELETE(apiPath("/files/*"), uploadHandler.DeleteFile, middleware.RequireAuthOrAdmin(adminKey))

	// Storage directory serving (local or S3 redirect)
	e.GET("/storage/*", uploadHandler.ServeStorage)

	// Public moul listing (read-only, no admin key needed)
	e.GET(apiPath("/moul"), moulHandler.ListMoul)

	// 2. Auth collections
	authGroup := e.Group("")
	authGroup.POST(apiPath("/moul/:name/auth-with-password"), authHandler.AuthWithPassword)
	authGroup.POST(apiPath("/moul/:name/request-password-reset"), authHandler.RequestPasswordReset)
	authGroup.POST(apiPath("/moul/:name/confirm-password-reset"), authHandler.ConfirmPasswordReset)
	authGroup.POST(apiPath("/moul/:name/refresh"), authHandler.RefreshToken)
	authGroup.POST(apiPath("/moul/:name/auth-refresh"), authHandler.RefreshToken)
	authGroup.POST(apiPath("/moul/:name/logout"), authHandler.Logout)
	authGroup.POST(apiPath("/moul/:name/otp/request"), authHandler.RequestOTP)
	authGroup.POST(apiPath("/moul/:name/auth-with-otp"), authHandler.AuthWithOTP)
	authGroup.POST(apiPath("/moul/:name/passkey/register/options"), authHandler.PasskeyRegisterOptions)
	authGroup.POST(apiPath("/moul/:name/passkey/register/verify"), authHandler.PasskeyRegisterVerify)
	authGroup.POST(apiPath("/moul/:name/passkey/signup/options"), authHandler.PasskeySignupOptions)
	authGroup.POST(apiPath("/moul/:name/passkey/signup/verify"), authHandler.PasskeySignupVerify)
	authGroup.POST(apiPath("/moul/:name/passkey/login/options"), authHandler.PasskeyLoginOptions)
	authGroup.POST(apiPath("/moul/:name/passkey/login/verify"), authHandler.PasskeyLoginVerify)
	authGroup.GET(apiPath("/moul/:name/auth-methods"), authHandler.GetAuthMethods)
	authGroup.GET(apiPath("/moul/:name/oauth2/:provider"), authHandler.OAuth2Authorize)
	authGroup.GET(apiPath("/moul/:name/oauth2/:provider/callback"), authHandler.OAuth2Callback)
	authGroup.POST(apiPath("/moul/:name/oauth2/:provider/callback"), authHandler.OAuth2Callback)
	authGroup.POST(apiPath("/moul/:name/auth-with-oauth2"), authHandler.AuthWithOAuth2)
	authGroup.POST(apiPath("/oauth2/device/authorize"), deviceFlowHandler.DeviceAuthorize)
	authGroup.POST(apiPath("/oauth2/device/token"), deviceFlowHandler.DeviceToken)
	authGroup.GET("/device", deviceFlowHandler.RenderDeviceForm)
	authGroup.POST("/device/verify", deviceFlowHandler.VerifyDevice)
	authGroup.GET("/favicon.svg", deviceFlowHandler.ServeFavicon)
	authGroup.GET("/favicon.ico", deviceFlowHandler.ServeFavicon)

	// 3. Record management (Data CRUD) — protected by per-moul rules
	e.POST(apiPath("/moul/:name/records"), recordHandler.CreateRecord)
	e.GET(apiPath("/moul/:name/records"), recordHandler.ListRecords)
	e.GET(apiPath("/moul/:name/records/:id"), recordHandler.GetRecord)
	e.PATCH(apiPath("/moul/:name/records/:id"), recordHandler.UpdateRecord)
	e.DELETE(apiPath("/moul/:name/records/:id"), recordHandler.DeleteRecord)
	e.POST(apiPath("/moul/:name/retry-jobs"), recordHandler.RetryJobs, middleware.RequireAuthOrAdmin(adminKey))

	// Real-time SSE record subscriptions
	e.GET(apiPath("/moul/:name/subscribe"), realtimeHandler.SubscribeCollection)
	e.GET(apiPath("/moul/subscribe"), realtimeHandler.SubscribeGlobal)

	// 4. Analytics visits log (JWT-protected)
	e.GET(apiPath("/visits"), visitsHandler.ListVisits)
	e.GET(apiPath("/visits/:id"), visitsHandler.GetVisit)

	// 5. Request tracking log (JWT-protected)
	e.GET(apiPath("/requests"), requestsHandler.ListRequests)
	e.GET(apiPath("/requests/:id"), requestsHandler.GetRequest)

	// 6. Background worker management (JWT/Admin-protected)
	workersGroup := e.Group(apiPath("/workers"), middleware.RequireAuthOrAdmin(adminKey))
	workersGroup.GET("", workersHandler.ListJobs)
	workersGroup.POST("", workersHandler.CreateJob)
	workersGroup.GET("/:id", workersHandler.GetJob)
	workersGroup.PATCH("/:id", workersHandler.UpdateJob)
	workersGroup.DELETE("/:id", workersHandler.DeleteJob)
	workersGroup.POST("/retry", workersHandler.RetryJobs)

	// 7. System monitoring metrics (JWT/Admin-protected)
	sysmonHandler := NewSysmonHandler(sysmonCollector)
	sysmonGroup := e.Group(apiPath("/system/metrics"), middleware.RequireAuthOrAdmin(adminKey))
	sysmonGroup.GET("", sysmonHandler.GetMetrics)
	sysmonGroup.POST("", sysmonHandler.PushMetrics)

	// 7. Embedded Web Admin Console
	if !cfg.DisableAdminUI {
		adminUIOpts := cfg.AdminUIOptions
		if adminUIOpts.APIPrefix == "" {
			adminUIOpts.APIPrefix = apiPrefix
		}
		RegisterAdminUIWithOptions(e, adminUIOpts)
	}

	return e
}
