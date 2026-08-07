package app

import (
	"context"
	"testing"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/moul-dev/moul-dev/internal/worker"
)

func TestAppWorkerExtensibility(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	hookExecuted := false
	a.OnWorkerInit(func(engine *worker.Engine) error {
		hookExecuted = true
		return nil
	})

	customWorkerExecuted := false
	a.RegisterWorker("CustomTestTask", func(ctx context.Context, job *worker.Job) error {
		customWorkerExecuted = true
		return nil
	})

	periodicTaskExecuted := false
	a.RegisterPeriodicWorker(10*time.Minute, "CustomPeriodicTask", func(ctx context.Context, job *worker.Job) error {
		periodicTaskExecuted = true
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	if !hookExecuted {
		t.Errorf("Expected OnWorkerInit hook to be executed")
	}

	engine := a.WorkerEngine()
	if engine == nil {
		t.Fatalf("Expected WorkerEngine to be non-nil")
	}

	// Verify custom worker was registered
	handler, ok := engine.GetHandler("CustomTestTask")
	if !ok {
		t.Fatalf("Expected CustomTestTask to be registered in worker engine")
	}

	testJob := &worker.Job{
		ID:     "job-1",
		Worker: "CustomTestTask",
	}
	if err := handler(context.Background(), testJob); err != nil {
		t.Fatalf("Failed to execute CustomTestTask handler: %v", err)
	}

	if !customWorkerExecuted {
		t.Errorf("Expected CustomTestTask handler to run")
	}

	// Verify periodic worker was registered
	pHandler, ok := engine.GetHandler("CustomPeriodicTask")
	if !ok {
		t.Fatalf("Expected CustomPeriodicTask to be registered in worker engine")
	}

	if err := pHandler(context.Background(), testJob); err != nil {
		t.Fatalf("Failed to execute CustomPeriodicTask handler: %v", err)
	}

	if !periodicTaskExecuted {
		t.Errorf("Expected CustomPeriodicTask handler to run")
	}

	// Verify built-in handlers registered
	_, sendEmailRegistered := engine.GetHandler("SendEmail")
	if !sendEmailRegistered {
		t.Errorf("Expected built-in SendEmail worker handler to be registered")
	}

	_, cleanupRegistered := engine.GetHandler("CleanupRevokedTokens")
	if !cleanupRegistered {
		t.Errorf("Expected built-in CleanupRevokedTokens worker handler to be registered")
	}
}
