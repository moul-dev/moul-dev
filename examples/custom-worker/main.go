package main

import (
	"context"
	"fmt"
	"os"

	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/moul-dev/moul-dev/pkg/app"
)

func main() {
	// Initialize moul application using pkg/app
	moulApp := app.New(app.Config{
		Version: "1.0.0-custom",
	})

	// Method 1: Register a custom job handler via helper method
	moulApp.RegisterWorker("GeneratePDF", func(ctx context.Context, job *worker.Job) error {
		docID, _ := job.Args["document_id"].(string)
		logger.Info("Executing custom GeneratePDF worker job", "document_id", docID)
		// Perform custom background logic here...
		return nil
	})

	// Method 2: Register a custom job handler via OnWorkerInit lifecycle hook
	moulApp.OnWorkerInit(func(engine *worker.Engine) error {
		engine.Register("SyncExternalAnalytics", func(ctx context.Context, job *worker.Job) error {
			logger.Info("Executing custom SyncExternalAnalytics job", "jobID", job.ID)
			return nil
		})
		return nil
	})

	fmt.Println("Starting custom Moul server with custom worker handlers...")
	if err := moulApp.Start(context.Background()); err != nil {
		logger.Fatal("Failed to start custom moul application", "err", err)
		os.Exit(1)
	}
}
