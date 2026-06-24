package main

import (
	"log"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"

	"github.com/labstack/echo/v4"
)

func main() {
	// Initialize SQLite database
	dbConn, err := db.InitDB("moul-local.db")
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer dbConn.Close()

	e := echo.New()

	// Global Middlewares
	e.Use(middleware.LoadAuthContextMiddleware())

	// Handlers initialization
	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

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

	// Start Echo HTTP server
	log.Println("Starting moul-dev engine server on http://localhost:8090")
	if err := e.Start(":8090"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
