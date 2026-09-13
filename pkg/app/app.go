package app

import (
	"context"
	"flag"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/labstack/echo/v5"
	mcpspec "github.com/mark3labs/mcp-go/mcp"
	mcpserver "github.com/mark3labs/mcp-go/server"
	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/mailer"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/tls"
	"github.com/moul-dev/moul-dev/pkg/ui"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

// Job represents a background job instance.
type Job = worker.Job

// JobHandler is the function signature for worker jobs.
type JobHandler = worker.JobHandler

// Config holds configuration options for starting a Mould application.
type Config struct {
	Env               string
	DBPath            string
	Port              string
	Version           string
	JWTSecret         string
	AdminKey          string
	AdminUIFS         fs.FS
	AdminUIPrefix     string
	APIPrefix         *string
	DisableAdminUI    bool
	DisableCLIParsing bool
}

// WorkerInitFunc is a hook callback invoked when the worker engine is initialized.
type WorkerInitFunc func(engine *worker.Engine) error

// RouterInitFunc is a hook callback invoked when the Echo router is initialized.
type RouterInitFunc func(router *echo.Echo) error

// BeforeStartFunc is a hook callback invoked after Bootstrap completes, prior to server startup.
type BeforeStartFunc func(app *App) error

// MCPInitFunc is a hook callback invoked when the MCP server is initialized.
type MCPInitFunc func(srv *moulmcp.Server) error

// App represents the core Mould server application instance.
type App struct {
	config          Config
	dbConn          *dbx.DB
	workerEngine    *worker.Engine
	analyticsEngine *analytics.Engine
	mailService     *mailer.Mailer
	sysmonCollector *sysmon.Collector
	tlsManager      *tls.Manager
	router          *echo.Echo
	mcpServer       *moulmcp.Server
	onWorkerInit    []WorkerInitFunc
	onRouterInit    []RouterInitFunc
	onBeforeStart   []BeforeStartFunc
	onMCPInit       []MCPInitFunc
	isDev           bool
	litestreamStore *backup.LitestreamStore
}

// New creates a new Mould App instance with the given configuration.
func New(cfg Config) *App {
	if cfg.Version == "" {
		cfg.Version = "dev"
	}
	if cfg.AdminUIPrefix == "" {
		cfg.AdminUIPrefix = "/_moul_"
	}
	return &App{
		config: cfg,
	}
}

// WithAdminUI sets or overrides the filesystem serving the Web Admin Console.
func (a *App) WithAdminUI(uiFS fs.FS) *App {
	a.config.AdminUIFS = uiFS
	return a
}

// WithAdminPrefix configures the URL prefix where the Web Admin Console is mounted.
func (a *App) WithAdminPrefix(prefix string) *App {
	a.config.AdminUIPrefix = prefix
	return a
}

// WithAPIPrefix configures the URL prefix where API routes are mounted.
// Pass "" to mount API endpoints at the root level without a prefix.
func (a *App) WithAPIPrefix(prefix string) *App {
	a.config.APIPrefix = &prefix
	return a
}

// DisableAdminUI disables mounting the embedded Web Admin Console.
func (a *App) DisableAdminUI() *App {
	a.config.DisableAdminUI = true
	return a
}

// WithAdminRedirect is deprecated and a no-op; /admin redirect has been removed to prevent route collisions.
func (a *App) WithAdminRedirect(_ bool) *App {
	return a
}

// DefaultAdminFS returns the default embedded Web Admin Console filesystem from pkg/ui.
func DefaultAdminFS() fs.FS {
	return ui.DistFS()
}

// OnWorkerInit registers a hook callback that executes when the worker engine is initialized.
func (a *App) OnWorkerInit(fn WorkerInitFunc) {
	if fn != nil {
		a.onWorkerInit = append(a.onWorkerInit, fn)
	}
}

// OnRouterInit registers a hook callback that executes when the Echo router is initialized.
func (a *App) OnRouterInit(fn RouterInitFunc) {
	if fn != nil {
		a.onRouterInit = append(a.onRouterInit, fn)
	}
}

// OnBeforeStart registers a hook callback that executes at the end of Bootstrap before the server starts.
func (a *App) OnBeforeStart(fn BeforeStartFunc) {
	if fn != nil {
		a.onBeforeStart = append(a.onBeforeStart, fn)
	}
}

// OnMCPInit registers a hook callback that executes when the built-in MCP server is initialized.
// This allows registering custom MCP tools and capabilities for both HTTP and Stdio transport modes.
func (a *App) OnMCPInit(fn MCPInitFunc) {
	if fn != nil {
		a.onMCPInit = append(a.onMCPInit, fn)
	}
}

// RegisterRoute registers a custom HTTP route handler with the embedded Echo router.
func (a *App) RegisterRoute(method, path string, handler echo.HandlerFunc, middleware ...echo.MiddlewareFunc) {
	a.OnRouterInit(func(router *echo.Echo) error {
		router.Add(method, path, handler, middleware...)
		return nil
	})
}

// RegisterWorker registers a custom job handler with the worker engine.
func (a *App) RegisterWorker(name string, handler worker.JobHandler) {
	a.OnWorkerInit(func(engine *worker.Engine) error {
		engine.Register(name, handler)
		return nil
	})
}

// RegisterPeriodicWorker registers a periodic background task with the worker engine.
func (a *App) RegisterPeriodicWorker(interval time.Duration, name string, handler worker.JobHandler) {
	a.OnWorkerInit(func(engine *worker.Engine) error {
		engine.RegisterPeriodicTask(interval, name, handler)
		return nil
	})
}

// RegisterMCPTool registers a custom MCP tool with the built-in MCP server.
// The tool is automatically exposed across both Stdio and Streamable HTTP / SSE transports.
func (a *App) RegisterMCPTool(tool mcpspec.Tool, handler mcpserver.ToolHandlerFunc) {
	a.OnMCPInit(func(srv *moulmcp.Server) error {
		srv.MCPServer().AddTool(tool, handler)
		return nil
	})
}

// WorkerEngine returns the worker engine instance.
func (a *App) WorkerEngine() *worker.Engine {
	return a.workerEngine
}

// DB returns the database connection instance.
func (a *App) DB() *dbx.DB {
	return a.dbConn
}

// Mailer returns the mailer service instance.
func (a *App) Mailer() *mailer.Mailer {
	return a.mailService
}

// AnalyticsEngine returns the analytics engine instance.
func (a *App) AnalyticsEngine() *analytics.Engine {
	return a.analyticsEngine
}

// Router returns the Echo router instance.
func (a *App) Router() *echo.Echo {
	return a.router
}

// MCPServer returns the underlying MCP server instance, if initialized.
func (a *App) MCPServer() *moulmcp.Server {
	return a.mcpServer
}

// IsMCP returns true if the application invocation is in MCP mode.
func (a *App) IsMCP() bool {
	return IsMCP()
}

// IsMCP returns true if the application invocation is in MCP mode
// (via "mcp" command, "--mcp" flag, or "MOUL_MCP=true"/"MCP=true" env vars).
func IsMCP() bool {
	if envy.Get("MOUL_MCP", "") == "true" || envy.Get("MOUL_MCP", "") == "1" || envy.Get("MCP", "") == "true" || envy.Get("MCP", "") == "1" {
		return true
	}
	for _, arg := range os.Args[1:] {
		if arg == "mcp" || arg == "--mcp" || strings.HasPrefix(arg, "--mcp=") {
			return true
		}
	}
	return false
}

// EnsureSystemTables ensures all system tables starting with "_*" are created in the database.
func (a *App) EnsureSystemTables() error {
	if a.dbConn == nil {
		return fmt.Errorf("database connection is nil; call Bootstrap() first or initialize database")
	}
	return db.EnsureSystemTables(a.dbConn)
}

// Bootstrap initializes database, mailer, analytics, worker engine, hooks, and HTTP router.
func (a *App) Bootstrap() error {
	moulEnv := a.config.Env
	if moulEnv == "" {
		moulEnv = envy.Get("MOUL_ENV", "development")
		a.config.Env = moulEnv
	}
	a.isDev = (moulEnv == "development")

	// Secrets
	jwtSecret := a.config.JWTSecret
	if jwtSecret == "" {
		var err error
		jwtSecret, err = envy.MustGet("MOUL_JWT_SECRET")
		if err != nil {
			return fmt.Errorf("MOUL_JWT_SECRET required: %w", err)
		}
	}
	auth.InitJWT(jwtSecret)

	adminKey := a.config.AdminKey
	if adminKey == "" {
		var err error
		adminKey, err = envy.MustGet("MOUL_ADMIN_KEY")
		if err != nil {
			return fmt.Errorf("MOUL_ADMIN_KEY required: %w", err)
		}
	}
	a.config.AdminKey = adminKey

	dbPath := a.config.DBPath
	if dbPath == "" {
		dbPath = envy.Get("MOUL_DB_PATH", "moul-local.db")
		a.config.DBPath = dbPath
	}

	// Init DB
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		return fmt.Errorf("database initialization failed: %w", err)
	}
	a.dbConn = dbConn

	// Ensure system tables (_*) exist on first startup
	if err := db.EnsureSystemTables(a.dbConn); err != nil {
		return fmt.Errorf("failed to ensure system tables on startup: %w", err)
	}
	logger.Info("System tables (_*) verified and ready")

	// Start Litestream replication
	store, err := backup.StartReplication(context.Background(), dbConn, dbPath)
	if err != nil {
		logger.Error("Failed to start Litestream replication", "err", err)
	} else {
		a.litestreamStore = store
	}

	// Analytics Engine
	geoIPPath := envy.Get("GEOIP_DB_PATH", "")
	analyticsEngine, err := analytics.NewEngine(dbConn, geoIPPath)
	if err != nil {
		return fmt.Errorf("analytics engine initialization failed: %w", err)
	}
	a.analyticsEngine = analyticsEngine

	// Mailer Service
	mailService, err := mailer.NewMailer(dbConn)
	if err != nil {
		logger.Error("Failed to initialize mailer service", "err", err)
	}
	a.mailService = mailService

	// Worker Engine
	a.workerEngine = worker.NewEngine(dbConn)

	// Register built-in worker handlers
	a.RegisterBuiltinWorkers()

	// Execute custom worker init hooks
	for _, hook := range a.onWorkerInit {
		if err := hook(a.workerEngine); err != nil {
			return fmt.Errorf("worker init hook failed: %w", err)
		}
	}

	// System Monitoring (Native Metrics)
	a.sysmonCollector = sysmon.NewCollector()

	// TLS / CertMagic Manager
	tlsManager, err := tls.NewManager(dbConn)
	if err != nil {
		logger.Error("Failed to initialize TLS Manager", "err", err)
	} else {
		a.tlsManager = tlsManager
	}

	// Echo Server / Router
	adminPrefix := a.config.AdminUIPrefix
	if adminPrefix == "" {
		adminPrefix = "/_moul_"
	}

	adminFS := a.config.AdminUIFS
	if adminFS == nil {
		adminFS = ui.DistFS()
	}

	// Built-in MCP Server
	if a.mcpServer == nil {
		a.mcpServer = moulmcp.NewServer(a.dbConn, a.workerEngine, a.analyticsEngine, a.sysmonCollector, a.config.Version)
		for _, hook := range a.onMCPInit {
			if err := hook(a.mcpServer); err != nil {
				return fmt.Errorf("mcp init hook failed: %w", err)
			}
		}
	}

	// API Prefix resolution from CLI flags or environment variable if not explicitly configured in code
	if a.config.APIPrefix == nil {
		if hasFlag("--api-prefix") {
			prefix := parseFlagString("--api-prefix")
			a.config.APIPrefix = &prefix
		} else if envVal, exists := os.LookupEnv("MOUL_API_PREFIX"); exists {
			a.config.APIPrefix = &envVal
		}
	}
	normalizedAPIPrefix := handlers.NormalizeAPIPrefix(a.config.APIPrefix)

	a.router = handlers.NewRouterWithOptions(
		a.dbConn,
		a.workerEngine,
		a.analyticsEngine,
		a.mailService,
		a.sysmonCollector,
		a.tlsManager,
		a.config.AdminKey,
		a.isDev,
		handlers.RouterConfig{
			Version:        a.config.Version,
			DisableAdminUI: a.config.DisableAdminUI,
			MCPServer:      a.mcpServer,
			APIPrefix:      a.config.APIPrefix,
			AdminUIOptions: handlers.AdminUIOptions{
				Prefix:     adminPrefix,
				FileSystem: adminFS,
				APIPrefix:  normalizedAPIPrefix,
			},
		},
	)

	// Execute custom router init hooks
	for _, hook := range a.onRouterInit {
		if err := hook(a.router); err != nil {
			return fmt.Errorf("router init hook failed: %w", err)
		}
	}

	// Execute before start hooks
	for _, hook := range a.onBeforeStart {
		if err := hook(a); err != nil {
			return fmt.Errorf("before start hook failed: %w", err)
		}
	}

	return nil
}

// ServeMCP starts the built-in MCP server in stdio transport mode.
// Unlike Bootstrap() and StartServer(), ServeMCP does not require MOUL_JWT_SECRET or MOUL_ADMIN_KEY
// as stdio mode operates locally as the executing user over standard input/output.
func (a *App) ServeMCP(ctx context.Context) error {
	dbPath := a.config.DBPath
	if dbPath == "" {
		dbPath = GetDBPath()
		a.config.DBPath = dbPath
	}

	if a.dbConn == nil {
		dbConn, err := db.InitDB(dbPath)
		if err != nil {
			return fmt.Errorf("database initialization failed: %w", err)
		}
		a.dbConn = dbConn
	}
	defer func() {
		if a.dbConn != nil {
			_ = a.dbConn.Close()
		}
	}()

	if err := db.EnsureSystemTables(a.dbConn); err != nil {
		return fmt.Errorf("failed to ensure system tables for MCP: %w", err)
	}

	if a.workerEngine == nil {
		a.workerEngine = worker.NewEngine(a.dbConn)
		a.RegisterBuiltinWorkers()
		for _, hook := range a.onWorkerInit {
			if err := hook(a.workerEngine); err != nil {
				return fmt.Errorf("worker init hook failed: %w", err)
			}
		}
	}

	if a.analyticsEngine == nil {
		geoIPPath := envy.Get("GEOIP_DB_PATH", "")
		analyticsEngine, err := analytics.NewEngine(a.dbConn, geoIPPath)
		if err == nil {
			a.analyticsEngine = analyticsEngine
		}
	}

	if a.sysmonCollector == nil {
		a.sysmonCollector = sysmon.NewCollector()
	}

	if a.mcpServer == nil {
		a.mcpServer = moulmcp.NewServer(a.dbConn, a.workerEngine, a.analyticsEngine, a.sysmonCollector, a.config.Version)
		for _, hook := range a.onMCPInit {
			if err := hook(a.mcpServer); err != nil {
				return fmt.Errorf("mcp init hook failed: %w", err)
			}
		}
	}

	for _, hook := range a.onBeforeStart {
		if err := hook(a); err != nil {
			return fmt.Errorf("before start hook failed: %w", err)
		}
	}

	return a.mcpServer.ServeStdio()
}

// Start executes the application. If CLI arguments or flags are present (e.g. "mcp", "worker", "seed", etc.)
// and CLI parsing is not disabled, Start dispatches to the matching subcommand.
// Otherwise, it starts the HTTP server engine via StartServer.
func (a *App) Start(ctx context.Context) error {
	if !a.config.DisableCLIParsing && !isTesting() {
		cmd, handled, err := a.dispatchCLI(ctx)
		if handled {
			return err
		}
		if cmd != "" && cmd != "start" {
			return fmt.Errorf("unknown command: %s", cmd)
		}
	}
	return a.StartServer(ctx)
}

// StartServer boots the HTTP server listeners and worker engines, blocking until context is cancelled or SIGINT/SIGTERM is received.
func (a *App) StartServer(ctx context.Context) error {
	if a.dbConn == nil {
		if err := a.Bootstrap(); err != nil {
			return err
		}
	}

	// Setup cleanup defers when Start exits
	defer func() {
		if a.analyticsEngine != nil {
			a.analyticsEngine.Close()
		}
		if a.dbConn != nil {
			a.dbConn.Close()
		}
		if a.litestreamStore != nil {
			logger.Info("Stopping Litestream replication...")
			if err := a.litestreamStore.Close(context.Background()); err != nil {
				logger.Error("Error stopping Litestream replication", "err", err)
			}
		}
	}()

	signalCtx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := a.sysmonCollector.Start(signalCtx); err != nil {
		logger.Error("Failed to start system monitoring collector", "err", err)
	} else {
		defer a.sysmonCollector.Close()
	}

	a.workerEngine.Start(signalCtx)
	defer a.workerEngine.Stop()

	a.analyticsEngine.StartFlusher(signalCtx)

	if a.tlsManager != nil && a.tlsManager.IsEnabled() {
		if err := a.tlsManager.StartHTTPListener(signalCtx); err != nil {
			logger.Error("Failed to start TLS HTTP listener", "err", err)
		}
	}

	port := a.config.Port
	if port == "" {
		port = envy.Get("MOUL_PORT", "8090")
	}

	if a.tlsManager != nil && a.tlsManager.IsEnabled() {
		tlsCfg, err := a.tlsManager.GetTLSConfig()
		if err != nil {
			return fmt.Errorf("failed to configure TLS for Echo server: %w", err)
		}
		addr := ":" + a.tlsManager.HTTPSPort()
		logger.Info("Starting moul engine server (HTTPS)", "version", a.config.Version, "addr", "https://localhost"+addr, "env", a.config.Env)
		sc := echo.StartConfig{
			Address:         addr,
			TLSConfig:       tlsCfg,
			GracefulTimeout: 10 * time.Second,
		}
		if err := sc.StartTLS(signalCtx, a.router, "", ""); err != nil && err != http.ErrServerClosed {
			return fmt.Errorf("server failed to start TLS: %w", err)
		}
	} else {
		addr := ":" + port
		logger.Info("Starting moul engine server", "version", a.config.Version, "addr", "http://localhost"+addr, "env", a.config.Env)
		sc := echo.StartConfig{
			Address:         addr,
			GracefulTimeout: 10 * time.Second,
		}
		if err := sc.Start(signalCtx, a.router); err != nil && err != http.ErrServerClosed {
			return fmt.Errorf("server failed to start: %w", err)
		}
	}

	logger.Info("Server stopped gracefully")
	return nil
}

func isTesting() bool {
	if flag.Lookup("test.v") != nil {
		return true
	}
	if len(os.Args) > 0 {
		base := filepath.Base(os.Args[0])
		if strings.HasSuffix(base, ".test") || strings.HasSuffix(base, ".test.exe") {
			return true
		}
	}
	for _, arg := range os.Args {
		if strings.HasPrefix(arg, "-test.") {
			return true
		}
	}
	return envy.Get("MOUL_TEST_ENV", "") == "true"
}
