package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/worker"

	"github.com/labstack/echo/v4"
)

func main() {
	// Initialize SQLite database
	dbConn, err := db.InitDB("moul-local.db")
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer dbConn.Close()

	// Initialize Analytics Engine
	geoIPPath := os.Getenv("GEOIP_DB_PATH")
	analyticsEngine, err := analytics.NewEngine(dbConn, geoIPPath)
	if err != nil {
		log.Fatalf("Analytics engine initialization failed: %v", err)
	}
	defer analyticsEngine.Close()

	// Initialize Worker Engine
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

	e := echo.New()

	// Global Middlewares
	e.Use(middleware.LoadAuthContextMiddleware())

	// Handlers initialization
	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	recordHandler.Engine = workerEngine
	recordHandler.AnalyticsEngine = analyticsEngine
	authHandler := handlers.NewAuthHandler(dbConn)
	visitsHandler := handlers.NewVisitsHandler(dbConn)

	// API Routes

	// 1. Moul schema management (Meta)
	e.POST("/api/mouls", moulHandler.CreateMoul)
	e.GET("/api/mouls", moulHandler.ListMouls)
	e.DELETE("/api/mouls/:name", moulHandler.DeleteMoul)

	// 2. Auth collections specific actions
	e.POST("/api/mouls/:moulName/auth-with-password", authHandler.AuthWithPassword)

	// 3. Record management (Data CRUD)
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/mouls/:moulName/records", recordHandler.ListRecords)
	e.GET("/api/mouls/:moulName/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/mouls/:moulName/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/mouls/:moulName/records/:id", recordHandler.DeleteRecord)

	// 4. Analytics visits log
	e.GET("/api/visits", visitsHandler.ListVisits)
	e.GET("/api/visits/:id", visitsHandler.GetVisit)

	// Start Echo HTTP server in a goroutine for graceful shutdown
	go func() {
		log.Println("Starting moul-dev engine server on http://localhost:8090")
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
