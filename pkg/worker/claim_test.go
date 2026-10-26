package worker

import (
	"context"
	"database/sql"
	"errors"
	"path/filepath"
	"sync"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
)

// TestClaimNextJobConcurrentClaimersNeverDoubleClaim runs several claimers (engines with distinct
// node ids, like several workers on one database) against the same queue while other writes land,
// and checks every job is claimed exactly once and no claim fails with SQLITE_BUSY.
func TestClaimNextJobConcurrentClaimersNeverDoubleClaim(t *testing.T) {
	dbConn, err := db.InitDB(filepath.Join(t.TempDir(), "claim.db"))
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})

	const jobs = 80
	enqueuer := NewEngine(dbConn)
	for i := 0; i < jobs; i++ {
		if _, err := enqueuer.Enqueue(context.Background(), "_workers", map[string]interface{}{"worker": "Noop"}); err != nil {
			t.Fatalf("enqueue %d: %v", i, err)
		}
	}

	const claimers = 8
	var (
		mu      sync.Mutex
		claimed = map[string]string{}
		wg      sync.WaitGroup
		errs    = make(chan error, claimers*jobs)
	)
	for i := 0; i < claimers; i++ {
		engine := NewEngine(dbConn)
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				job, err := engine.claimNextJob("_workers")
				if errors.Is(err, sql.ErrNoRows) {
					return
				}
				if err != nil {
					errs <- err
					return
				}
				if job.State != "executing" || job.Attempt != 1 {
					errs <- errors.New("claimed job has state " + job.State)
				}
				mu.Lock()
				if prev, dup := claimed[job.ID]; dup {
					errs <- errors.New("job " + job.ID + " claimed by " + prev + " and " + engine.nodeID)
				}
				claimed[job.ID] = engine.nodeID
				mu.Unlock()
				// Interleave an unrelated write, as an app request would.
				if _, err := dbConn.NewQuery("UPDATE _settings SET value = value WHERE key = 'app_name'").Execute(); err != nil {
					errs <- err
					return
				}
			}
		}()
	}
	wg.Wait()
	close(errs)
	for err := range errs {
		t.Fatalf("claim failed: %v", err)
	}
	if len(claimed) != jobs {
		t.Fatalf("expected %d distinct claimed jobs, got %d", jobs, len(claimed))
	}

	var attemptedBy int
	if err := dbConn.NewQuery("SELECT COUNT(*) FROM _workers WHERE state = 'executing' AND attempt = 1 AND attempted_by != ''").Row(&attemptedBy); err != nil {
		t.Fatalf("count claimed rows: %v", err)
	}
	if attemptedBy != jobs {
		t.Fatalf("expected %d rows marked executing by a node, got %d", jobs, attemptedBy)
	}
}

func TestClaimNextJobSkipsFutureAndPrefersPriority(t *testing.T) {
	dbConn, err := db.InitDB(filepath.Join(t.TempDir(), "claim-order.db"))
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})
	engine := NewEngine(dbConn)
	ctx := context.Background()
	if _, err := engine.Enqueue(ctx, "_workers", map[string]interface{}{"id": "low", "worker": "Noop", "priority": 5}); err != nil {
		t.Fatal(err)
	}
	if _, err := engine.Enqueue(ctx, "_workers", map[string]interface{}{"id": "high", "worker": "Noop", "priority": 0}); err != nil {
		t.Fatal(err)
	}
	if _, err := engine.Enqueue(ctx, "_workers", map[string]interface{}{"id": "later", "worker": "Noop", "scheduled_at": "2999-01-01T00:00:00Z"}); err != nil {
		t.Fatal(err)
	}

	for _, want := range []string{"high", "low"} {
		job, err := engine.claimNextJob("_workers")
		if err != nil {
			t.Fatalf("claim: %v", err)
		}
		if job.ID != want {
			t.Fatalf("expected %q next, got %q", want, job.ID)
		}
	}
	if _, err := engine.claimNextJob("_workers"); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected no claimable job (the last one is scheduled in the future), got %v", err)
	}
}
