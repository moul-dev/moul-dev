package db

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"sync"
	"testing"

	"github.com/pocketbase/dbx"
)

func TestIsBusyError(t *testing.T) {
	if IsBusyError(nil) {
		t.Error("nil must not be a busy error")
	}
	if IsBusyError(errors.New("UNIQUE constraint failed: users.email")) {
		t.Error("a constraint error must not be a busy error")
	}
	if !IsBusyError(fmt.Errorf("insert job: %w", errors.New("database is locked (5) (SQLITE_BUSY)"))) {
		t.Error("a wrapped 'database is locked' error must be a busy error")
	}
}

func TestIsBusyErrorFromDriver(t *testing.T) {
	path := filepath.Join(t.TempDir(), "busy.db")
	dbConn, err := InitDB(path)
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	// A second, separate handle with no busy timeout fails at once while the first holds the lock.
	other, err := dbx.Open("sqlite", path)
	if err != nil {
		t.Fatalf("open second handle: %v", err)
	}
	defer other.Close()

	ctx := context.Background()
	holder, err := dbConn.DB().Conn(ctx)
	if err != nil {
		t.Fatalf("conn: %v", err)
	}
	defer holder.Close()
	if _, err := holder.ExecContext(ctx, "BEGIN IMMEDIATE"); err != nil {
		t.Fatalf("begin immediate: %v", err)
	}
	defer func() {
		if _, err := holder.ExecContext(ctx, "ROLLBACK"); err != nil {
			t.Errorf("rollback: %v", err)
		}
	}()

	_, err = other.NewQuery("INSERT INTO _settings (key, value) VALUES ('busy_probe', 'x')").Execute()
	if err == nil {
		t.Fatal("expected the write to fail while another connection holds the write lock")
	}
	if !IsBusyError(err) {
		t.Fatalf("expected a busy error from the driver, got %v", err)
	}
}

// TestWriteTxConcurrentReadThenWrite runs many read-then-write transactions at once. Under a
// deferred BEGIN they fail with SQLITE_BUSY(_SNAPSHOT) as soon as two overlap; WriteTx must
// serialize them so every increment lands.
func TestWriteTxConcurrentReadThenWrite(t *testing.T) {
	dbConn, err := InitDB(filepath.Join(t.TempDir(), "writetx.db"))
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	if _, err := dbConn.NewQuery("CREATE TABLE counter (id INTEGER PRIMARY KEY, n INTEGER NOT NULL)").Execute(); err != nil {
		t.Fatalf("create table: %v", err)
	}
	if _, err := dbConn.NewQuery("INSERT INTO counter (id, n) VALUES (1, 0)").Execute(); err != nil {
		t.Fatalf("seed: %v", err)
	}

	const workers, perWorker = 12, 25
	var wg sync.WaitGroup
	errs := make(chan error, workers*perWorker)
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < perWorker; i++ {
				err := WriteTx(dbConn, func(tx *dbx.Tx) error {
					var n int
					if err := tx.NewQuery("SELECT n FROM counter WHERE id = 1").Row(&n); err != nil {
						return err
					}
					_, err := tx.NewQuery("UPDATE counter SET n = {:n} WHERE id = 1").Bind(dbx.Params{"n": n + 1}).Execute()
					return err
				})
				if err != nil {
					errs <- err
				}
			}
		}()
	}
	wg.Wait()
	close(errs)
	for err := range errs {
		t.Fatalf("WriteTx failed: %v", err)
	}

	var n int
	if err := dbConn.NewQuery("SELECT n FROM counter WHERE id = 1").Row(&n); err != nil {
		t.Fatalf("read counter: %v", err)
	}
	if n != workers*perWorker {
		t.Fatalf("expected %d increments, got %d (lost updates)", workers*perWorker, n)
	}
}

func TestWriteTxReturnsFnError(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	sentinel := errors.New("stop")
	calls := 0
	err = WriteTx(dbConn, func(tx *dbx.Tx) error {
		calls++
		if _, err := tx.Insert("_settings", dbx.Params{"key": "rolled_back", "value": "x"}).Execute(); err != nil {
			return err
		}
		return sentinel
	})
	if !errors.Is(err, sentinel) {
		t.Fatalf("expected fn's error, got %v", err)
	}
	if calls != 1 {
		t.Fatalf("a non-busy error must not be retried, fn ran %d times", calls)
	}
	var count int
	if err := dbConn.Select("COUNT(*)").From("_settings").Where(dbx.HashExp{"key": "rolled_back"}).Row(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 0 {
		t.Fatal("expected the transaction to be rolled back")
	}
}
