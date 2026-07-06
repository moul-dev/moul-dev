package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gobuffalo/envy"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/worker"
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
	e := handlers.NewRouter(dbConn, workerEngine, analyticsEngine, adminKey, isDev)

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
