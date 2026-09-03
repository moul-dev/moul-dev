# Worker Handler Extensibility Guide

This document describes how to extend `moul` with custom background worker job handlers and periodic background tasks without modifying or forking core `moul` files (`cmd/moul/main.go`).

---

## Overview

`moul` exposes a public Go package `github.com/moul-dev/moul-dev/pkg/app` that allows developers to embed the `moul` engine into custom Go applications, register custom job handlers, and run tailored server binaries.

---

## Pattern 1: Extending via `pkg/app` Helper Methods

The simplest way to register custom worker job handlers is by using `app.RegisterWorker(...)` or `app.RegisterPeriodicWorker(...)`.

```go
package main

import (
	"context"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/moul-dev/moul-dev/pkg/app"
)

func main() {
	moulApp := app.New(app.Config{
		Version: "1.0.0-custom",
	})

	// Register custom worker handler
	moulApp.RegisterWorker("GenerateReport", func(ctx context.Context, job *worker.Job) error {
		reportID, _ := job.Args["report_id"].(string)
		logger.Info("Generating report background job", "report_id", reportID)
		return nil
	})

	// Register custom periodic task (runs every 30 minutes)
	moulApp.RegisterPeriodicWorker(30*time.Minute, "SyncStripeCustomers", func(ctx context.Context, job *worker.Job) error {
		logger.Info("Running periodic Stripe customer sync")
		return nil
	})

	// Start application
	if err := moulApp.Start(context.Background()); err != nil {
		logger.Fatal("Server failed", "err", err)
	}
}
```

---

## Pattern 2: Extending via Lifecycle Hooks (`OnWorkerInit`)

For modular codebases or multi-package plugins, you can register hooks using `OnWorkerInit`:

```go
moulApp.OnWorkerInit(func(engine *worker.Engine) error {
    engine.Register("ProcessImage", func(ctx context.Context, job *worker.Job) error {
        // Image processing logic
        return nil
    })
    return nil
})
```

---

## Enqueueing Custom Background Jobs

Once custom handlers are registered with `moulApp`, API routes or schema actions can enqueue jobs by inserting records into any collection table configured with type `"worker"`.

For example, enqueuing a `GenerateReport` job via Go:

```go
workerEngine := moulApp.WorkerEngine()
job, err := workerEngine.Enqueue("background_jobs", map[string]interface{}{
    "worker": "GenerateReport",
    "args": map[string]interface{}{
        "report_id": "rep_12345",
    },
})
```

---

## Executing Built-in & Custom Workers Side-by-Side

`pkg/app` automatically registers built-in background tasks (such as `SendEmail`, `CleanupRevokedTokens`, `CleanupOldRequests`, `CleanupOldVisits`, and `CleanupCompletedJobs`) during `app.Bootstrap()`. Your custom handlers run seamlessly alongside core system workers within the same concurrent worker engine.


---

## Runnable Example

A complete runnable example is available at [examples/custom-worker/main.go](../examples/custom-worker/main.go).
