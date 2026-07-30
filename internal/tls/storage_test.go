package tls

import (
	"context"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func setupTestDB(t *testing.T) *dbx.DB {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory DB: %v", err)
	}
	return dbConn
}

func TestDBStorageStoreLoadDelete(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()

	storage := NewDBStorage(dbConn)
	ctx := context.Background()

	key := "certificates/example.com/example.com.crt"
	val := []byte("-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----")

	// Store
	if err := storage.Store(ctx, key, val); err != nil {
		t.Fatalf("Store failed: %v", err)
	}

	// Exists
	if !storage.Exists(ctx, key) {
		t.Fatalf("Exists returned false for stored key")
	}

	// Load
	loaded, err := storage.Load(ctx, key)
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}
	if string(loaded) != string(val) {
		t.Fatalf("Loaded content mismatch. Got %s, want %s", loaded, val)
	}

	// Stat
	info, err := storage.Stat(ctx, key)
	if err != nil {
		t.Fatalf("Stat failed: %v", err)
	}
	if info.Key != key {
		t.Errorf("Stat Key mismatch: got %s, want %s", info.Key, key)
	}
	if info.Size != int64(len(val)) {
		t.Errorf("Stat Size mismatch: got %d, want %d", info.Size, len(val))
	}

	// Delete
	if err := storage.Delete(ctx, key); err != nil {
		t.Fatalf("Delete failed: %v", err)
	}
	if storage.Exists(ctx, key) {
		t.Fatalf("Exists returned true after Delete")
	}
}

func TestDBStorageList(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()

	storage := NewDBStorage(dbConn)
	ctx := context.Background()

	_ = storage.Store(ctx, "certs/site1/cert.crt", []byte("cert1"))
	_ = storage.Store(ctx, "certs/site1/key.key", []byte("key1"))
	_ = storage.Store(ctx, "certs/site2/cert.crt", []byte("cert2"))
	_ = storage.Store(ctx, "users/admin@example.com/account.json", []byte("account"))

	// List recursive under certs/
	listRec, err := storage.List(ctx, "certs", true)
	if err != nil {
		t.Fatalf("List recursive failed: %v", err)
	}
	if len(listRec) != 3 {
		t.Fatalf("Expected 3 items recursive, got %d: %v", len(listRec), listRec)
	}

	// List non-recursive under certs/
	listNonRec, err := storage.List(ctx, "certs", false)
	if err != nil {
		t.Fatalf("List non-recursive failed: %v", err)
	}
	if len(listNonRec) != 2 {
		t.Fatalf("Expected 2 subdirectories/items non-recursive, got %d: %v", len(listNonRec), listNonRec)
	}
}

func TestDBStorageLockUnlock(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()

	storage := NewDBStorage(dbConn)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	lockKey := "issue:example.com"

	// Lock
	if err := storage.Lock(ctx, lockKey); err != nil {
		t.Fatalf("Lock failed: %v", err)
	}

	// Unlock
	if err := storage.Unlock(ctx, lockKey); err != nil {
		t.Fatalf("Unlock failed: %v", err)
	}
}
