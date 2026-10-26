package db

import (
	"context"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"testing"
)

func TestBuildDSN(t *testing.T) {
	dsn := buildDSN("moul.db")
	if !strings.HasPrefix(dsn, "moul.db?") {
		t.Fatalf("expected query to start after the path, got %q", dsn)
	}
	for _, want := range []string{"busy_timeout%285000%29", "foreign_keys%281%29", "journal_mode%28WAL%29", "synchronous%28NORMAL%29"} {
		if !strings.Contains(dsn, want) {
			t.Errorf("dsn %q is missing %q", dsn, want)
		}
	}

	withQuery := buildDSN("file:moul_bench?mode=memory&cache=shared")
	if !strings.HasPrefix(withQuery, "file:moul_bench?mode=memory&cache=shared&_pragma=") {
		t.Errorf("expected existing query to be extended with &, got %q", withQuery)
	}
}

func TestIsPrivateMemoryDB(t *testing.T) {
	cases := map[string]bool{
		":memory:":           true,
		"file::memory:":      true,
		"file:x?mode=memory": true,
		"file:moul_bench?mode=memory&cache=shared": false,
		"moul-local.db":         false,
		"/var/lib/moul/data.db": false,
	}
	for path, want := range cases {
		if got := isPrivateMemoryDB(path); got != want {
			t.Errorf("isPrivateMemoryDB(%q) = %v, want %v", path, got, want)
		}
	}
}

func TestInitDBMemoryKeepsSingleConnection(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()
	if got := dbConn.DB().Stats().MaxOpenConnections; got != 1 {
		t.Fatalf("expected a private in-memory database to use one connection, got %d", got)
	}
}

// TestInitDBConfiguresEveryConnection holds several pooled connections at once and checks that
// each one, not only the first, carries the busy timeout and the other pragmas.
func TestInitDBConfiguresEveryConnection(t *testing.T) {
	dbConn, err := InitDB(filepath.Join(t.TempDir(), "conns.db"))
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	sqlDB := dbConn.DB()
	if stats := sqlDB.Stats(); stats.MaxOpenConnections < 4 {
		t.Fatalf("expected a pool of at least 4 connections, got %d", stats.MaxOpenConnections)
	}

	const n = 4
	ctx := context.Background()
	var wg sync.WaitGroup
	errs := make(chan error, n)
	type result struct {
		busy, fk, sync int
		journal        string
	}
	results := make(chan result, n)
	ready := make(chan struct{})

	for i := 0; i < n; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			conn, err := sqlDB.Conn(ctx)
			if err != nil {
				errs <- err
				return
			}
			defer conn.Close()
			// Hold the connection until all goroutines have one, so the pool must open n of them.
			<-ready
			var r result
			if err := conn.QueryRowContext(ctx, "PRAGMA busy_timeout").Scan(&r.busy); err != nil {
				errs <- err
				return
			}
			if err := conn.QueryRowContext(ctx, "PRAGMA foreign_keys").Scan(&r.fk); err != nil {
				errs <- err
				return
			}
			if err := conn.QueryRowContext(ctx, "PRAGMA synchronous").Scan(&r.sync); err != nil {
				errs <- err
				return
			}
			if err := conn.QueryRowContext(ctx, "PRAGMA journal_mode").Scan(&r.journal); err != nil {
				errs <- err
				return
			}
			results <- r
		}()
	}

	// Wait until the pool has handed out n distinct connections.
	for sqlDB.Stats().InUse < n {
		select {
		case err := <-errs:
			t.Fatalf("acquiring connection: %v", err)
		default:
			runtime.Gosched()
		}
	}
	close(ready)
	wg.Wait()
	close(errs)
	close(results)

	for err := range errs {
		t.Fatalf("querying pragmas: %v", err)
	}
	count := 0
	for r := range results {
		count++
		if r.busy != 5000 {
			t.Errorf("busy_timeout = %d, want 5000", r.busy)
		}
		if r.fk != 1 {
			t.Errorf("foreign_keys = %d, want 1", r.fk)
		}
		if r.sync != 1 {
			t.Errorf("synchronous = %d, want 1 (NORMAL)", r.sync)
		}
		if !strings.EqualFold(r.journal, "wal") {
			t.Errorf("journal_mode = %q, want wal", r.journal)
		}
	}
	if count != n {
		t.Fatalf("expected %d results, got %d", n, count)
	}
	if idle := sqlDB.Stats().Idle; idle < n {
		t.Errorf("expected the %d connections to stay idle in the pool, got %d idle", n, idle)
	}
}
