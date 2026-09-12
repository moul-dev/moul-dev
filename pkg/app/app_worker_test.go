package app

import (
	"context"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/moul-dev/moul-dev/pkg/worker"
	"github.com/pocketbase/dbx"
)

func TestApp_CustomBinary_WorkerExecution(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "test-custom-binary.db")

	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")

	// 1. Simulate custom binary embedding: create app instance with custom worker
	moulApp := New(Config{
		DBPath:    dbPath,
		Env:       "test",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})

	var wg sync.WaitGroup
	wg.Add(1)
	var handledJob *worker.Job

	// 2. Register custom worker on embedded app before Bootstrap
	moulApp.RegisterWorker("ProcessInvoice", func(ctx context.Context, job *worker.Job) error {
		handledJob = job
		wg.Done()
		return nil
	})

	// 3. Bootstrap application (creates DB, ensures system tables including _workers, registers workers)
	if err := moulApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}
	defer moulApp.DB().Close()

	// 4. Verify _workers system table exists
	var count int
	err := moulApp.DB().NewQuery("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='_workers'").Row(&count)
	if err != nil || count == 0 {
		t.Fatalf("Expected _workers system table to exist in embedded database, err: %v", err)
	}

	// 5. Enqueue job without collection name (should default to _workers)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	jobOpts := map[string]interface{}{
		"worker": "ProcessInvoice",
		"args": map[string]interface{}{
			"invoice_id": "INV-2026-001",
			"amount":     49.99,
		},
	}
	jobRes, err := moulApp.WorkerEngine().Enqueue(ctx, "", jobOpts)
	if err != nil {
		t.Fatalf("Failed to enqueue job to default table in embedded mode: %v", err)
	}

	// 6. Start worker engine
	moulApp.WorkerEngine().Start(ctx)
	defer moulApp.WorkerEngine().Stop()

	// Wait for handler execution
	wg.Wait()

	if handledJob == nil {
		t.Fatal("Expected ProcessInvoice handler to be invoked")
	}
	if handledJob.Worker != "ProcessInvoice" {
		t.Errorf("Expected worker ProcessInvoice, got %s", handledJob.Worker)
	}
	if handledJob.Args["invoice_id"] != "INV-2026-001" {
		t.Errorf("Expected invoice_id INV-2026-001, got %v", handledJob.Args["invoice_id"])
	}

	// 7. Verify job in _workers reached completed state
	time.Sleep(100 * time.Millisecond)

	var record struct {
		State  string `db:"state"`
		Worker string `db:"worker"`
	}
	err = moulApp.DB().Select("state", "worker").From("_workers").Where(dbx.HashExp{"id": jobRes["id"]}).One(&record)
	if err != nil {
		t.Fatalf("Failed to query job from _workers: %v", err)
	}

	if record.State != "completed" {
		t.Errorf("Expected job state to be 'completed' in _workers, got %q", record.State)
	}
}
