package handlers

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/pkg/worker"
	"github.com/pocketbase/dbx"
)

// TestEnqueueSendEmailWaitsForWriteLock queues the sign-in email while another connection holds
// SQLite's write lock: the insert must wait for the lock and succeed instead of failing at once.
func TestEnqueueSendEmailWaitsForWriteLock(t *testing.T) {
	dbConn, err := db.InitDB(filepath.Join(t.TempDir(), "enqueue.db"))
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})

	ctx := context.Background()
	holder, err := dbConn.DB().Conn(ctx)
	if err != nil {
		t.Fatalf("conn: %v", err)
	}
	if _, err := holder.ExecContext(ctx, "BEGIN IMMEDIATE"); err != nil {
		t.Fatalf("begin immediate: %v", err)
	}
	released := make(chan error, 1)
	go func() {
		time.Sleep(150 * time.Millisecond)
		_, err := holder.ExecContext(ctx, "COMMIT")
		if closeErr := holder.Close(); err == nil {
			err = closeErr
		}
		released <- err
	}()

	engine := worker.NewEngine(dbConn)
	err = enqueueSendEmail(ctx, engine, "_workers", map[string]interface{}{
		"to": "member@example.com", "subject": "Your code", "body": "123456",
	})
	if err != nil {
		t.Fatalf("enqueueSendEmail: %v", err)
	}
	if err := <-released; err != nil {
		t.Fatalf("release lock: %v", err)
	}

	var count int
	if err := dbConn.Select("COUNT(*)").From("_workers").Where(dbx.HashExp{"worker": "SendEmail"}).Row(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected one queued SendEmail job, got %d", count)
	}
}

func TestEnqueueSendEmailReturnsNonBusyErrors(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})

	engine := worker.NewEngine(dbConn)
	start := time.Now()
	err = enqueueSendEmail(context.Background(), engine, "missingWorkers", map[string]interface{}{"to": "x@example.com"})
	if err == nil {
		t.Fatal("expected an error for an unknown worker collection")
	}
	if time.Since(start) > enqueueEmailBackoff {
		t.Fatalf("a non-busy error must not be retried with backoff (took %s)", time.Since(start))
	}
}
