package app

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/tls"
	"github.com/moul-dev/moul-dev/internal/worker"
)

// Config holds configuration options for starting a Mould application.
type Config struct {
	Env       string
	DBPath    string
	Port      string
	Version   string
	JWTSecret string
	AdminKey  string
}

// WorkerInitFunc is a hook callback invoked when the worker engine is initialized.
type WorkerInitFunc func(engine *worker.Engine) error

// RouterInitFunc is a hook callback invoked when the Echo router is initialized.
type RouterInitFunc func(router *echo.Echo) error

// BeforeStartFunc is a hook callback invoked after Bootstrap completes, prior to server startup.
type BeforeStartFunc func(app *App) error

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
	onWorkerInit    []WorkerInitFunc
	onRouterInit    []RouterInitFunc
	onBeforeStart   []BeforeStartFunc
	isDev           bool
	litestreamStore *backup.LitestreamStore
}

// New creates a new Mould App instance with the given configuration.
func New(cfg Config) *App {
	if cfg.Version == "" {
		cfg.Version = "dev"
	}
	return &App{
		config: cfg,
	}
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
	a.router = handlers.NewRouter(
		a.dbConn,
		a.workerEngine,
		a.analyticsEngine,
		a.mailService,
		a.sysmonCollector,
		a.tlsManager,
		a.config.AdminKey,
		a.isDev,
		a.config.Version,
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

// Start boots the server listeners and worker engines, blocking until context is cancelled or SIGINT/SIGTERM is received.
func (a *App) Start(ctx context.Context) error {
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
