package main

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

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/worker"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func printUsage() {
	fmt.Println("Usage: moul-dev [command] [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  start    Start the moul-dev engine server (default)")
	fmt.Println("  restore  Restore database from Litestream S3 backup")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -v, --version, version  Print version information and exit")
	fmt.Println("  -h, --help, help        Show help and usage instructions")
}

func main() {
	cmd := "start"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}

	switch cmd {
	case "start":
		runStart()
	case "restore":
		runRestore()
	case "-v", "-version", "--version", "version":
		fmt.Printf("moul-dev version %s\n", Version)
	case "-h", "-help", "--help", "help":
		printUsage()
	default:
		fmt.Printf("Unknown command: %s\n\n", cmd)
		printUsage()
		os.Exit(1)
	}
}

func runRestore() {
	dbPath := envy.Get("MOUL_DB_PATH", "moul-local.db")
	logger.Info("Attempting Litestream S3 database restore", "path", dbPath)
	if err := backup.RestoreFromS3(context.Background(), dbPath); err != nil {
		logger.Fatal("Litestream restore failed", "err", err)
	}
	logger.Info("Restore operation completed successfully")
}

func runStart() {
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

	// ── Database ────────────────────────────────────────────────────
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		logger.Fatal("Database initialization failed", "err", err)
	}
	defer dbConn.Close()

	// 2. Start Litestream replication
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

	// Start Worker Engine with OS signal context for graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	workerEngine.Start(ctx)
	defer workerEngine.Stop()

	// Start Analytics Request Flusher
	analyticsEngine.StartFlusher(ctx)

	// ── Echo server ─────────────────────────────────────────────────
	e := handlers.NewRouter(dbConn, workerEngine, analyticsEngine, adminKey, isDev)

	// ── Start server with StartConfig for graceful shutdown ──────────
	logger.Info("Starting moul-dev engine server", "version", Version, "addr", "http://localhost:8090", "env", moulEnv)
	sc := echo.StartConfig{
		Address:         ":8090",
		GracefulTimeout: 10 * time.Second,
	}

	if err := sc.Start(ctx, e); err != nil && err != http.ErrServerClosed {
		logger.Fatal("Server failed to start", "err", err)
	}

	logger.Info("Server stopped gracefully")
}
