package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
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
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/updater"
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
	fmt.Println("  update   Update moul-dev binary to the latest release")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -f, --force             Force update even if already at latest version")
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
	case "update", "-u", "-update", "--update":
		runUpdate()
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

func runUpdate() {
	force := false
	for _, arg := range os.Args[2:] {
		if arg == "-f" || arg == "--force" {
			force = true
		}
	}

	opts := updater.Options{
		AppName:    "moul-dev",
		CurrentVer: Version,
		Force:      force,
	}

	if err := updater.Update(opts); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating moul-dev: %v\n", err)
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

	// ── Mailer Service ───────────────────────────────────────────────
	mailService, err := mailer.NewMailer(dbConn)
	if err != nil {
		logger.Error("Failed to initialize mailer service", "err", err)
	}

	// ── Worker Engine ───────────────────────────────────────────────
	workerEngine := worker.NewEngine(dbConn)

	// Register SendEmail worker handler
	workerEngine.Register("SendEmail", func(ctx context.Context, job *worker.Job) error {
		toStr, _ := job.Args["to"].(string)
		subjectStr, _ := job.Args["subject"].(string)
		bodyStr, _ := job.Args["body"].(string)
		fromStr, _ := job.Args["from"].(string)
		fromNameStr, _ := job.Args["from_name"].(string)

		var recipients []string
		if toStr != "" {
			for _, r := range strings.Split(toStr, ",") {
				if trimmed := strings.TrimSpace(r); trimmed != "" {
					recipients = append(recipients, trimmed)
				}
			}
		}

		emailMsg := &mailer.Email{
			From:     fromStr,
			FromName: fromNameStr,
			To:       recipients,
			Subject:  subjectStr,
			HTMLBody: bodyStr,
			TextBody: bodyStr,
		}

		if mailService != nil {
			return mailService.Send(ctx, emailMsg)
		}
		return nil
	})

	// Start Worker Engine with OS signal context for graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// ── System Monitoring (Telegraf UDS) ────────────────────────────
	socketPath := envy.Get("MOUL_TELEGRAF_SOCKET_PATH", "/tmp/moul-telegraf.sock")
	sysmonCollector := sysmon.NewCollector(socketPath)
	if err := sysmonCollector.Start(ctx); err != nil {
		logger.Error("Failed to start system monitoring collector", "err", err)
	} else {
		defer sysmonCollector.Close()
	}

	workerEngine.Start(ctx)
	defer workerEngine.Stop()

	// Start Analytics Request Flusher
	analyticsEngine.StartFlusher(ctx)

	// ── Echo server ─────────────────────────────────────────────────
	e := handlers.NewRouter(dbConn, workerEngine, analyticsEngine, mailService, sysmonCollector, adminKey, isDev, Version)

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
