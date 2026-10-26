package db

import (
	"context"
	"database/sql"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/pocketbase/dbx"
)

// countStatements makes dbConn count every SQL statement it runs from now on.
func countStatements(dbConn *dbx.DB) func() int {
	var mu sync.Mutex
	n := 0
	dbConn.QueryLogFunc = func(context.Context, time.Duration, string, *sql.Rows, error) {
		mu.Lock()
		n++
		mu.Unlock()
	}
	dbConn.ExecLogFunc = func(context.Context, time.Duration, string, sql.Result, error) {
		mu.Lock()
		n++
		mu.Unlock()
	}
	return func() int {
		mu.Lock()
		defer mu.Unlock()
		return n
	}
}

func TestIsTokenRevokedDoesNoSQLPerCheck(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	if err := RevokeToken(dbConn, "revoked-token", time.Now().Add(time.Hour)); err != nil {
		t.Fatalf("RevokeToken: %v", err)
	}
	// The first check loads the table once.
	if !IsTokenRevoked(dbConn, "revoked-token") {
		t.Fatal("expected the token to be revoked")
	}

	statements := countStatements(dbConn)
	for i := 0; i < 50; i++ {
		if !IsTokenRevoked(dbConn, "revoked-token") {
			t.Fatal("expected the token to stay revoked")
		}
		if IsTokenRevoked(dbConn, "other-token") {
			t.Fatal("an unrelated token must not be revoked")
		}
	}
	if n := statements(); n != 0 {
		t.Fatalf("expected revocation checks to run no SQL, ran %d statements", n)
	}

	// A revocation in this process applies at once, still without SQL for the check.
	if err := RevokeToken(dbConn, "late-token", time.Now().Add(time.Hour)); err != nil {
		t.Fatalf("RevokeToken: %v", err)
	}
	before := statements()
	if !IsTokenRevoked(dbConn, "late-token") {
		t.Fatal("expected a token revoked in this process to be revoked at once")
	}
	if statements() != before {
		t.Fatal("expected the check after RevokeToken to run no SQL")
	}
}

func TestIsTokenRevokedIgnoresExpiredRevocations(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	if err := RevokeToken(dbConn, "short-lived", time.Now().Add(-time.Minute)); err != nil {
		t.Fatalf("RevokeToken: %v", err)
	}
	if IsTokenRevoked(dbConn, "short-lived") {
		t.Fatal("a revocation that has expired no longer applies")
	}
	if _, err := CleanupExpiredRevokedTokens(dbConn); err != nil {
		t.Fatalf("cleanup: %v", err)
	}
}

// TestIsTokenRevokedSeesOtherProcesses revokes a token through a second database handle (as
// another process would) and checks the first handle honours it after the refresh interval.
func TestIsTokenRevokedSeesOtherProcesses(t *testing.T) {
	prev := revokedRefreshInterval
	revokedRefreshInterval = 50 * time.Millisecond
	defer func() { revokedRefreshInterval = prev }()

	path := filepath.Join(t.TempDir(), "revoked.db")
	server, err := InitDB(path)
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer server.Close()
	other, err := InitDB(path)
	if err != nil {
		t.Fatalf("InitDB (other process): %v", err)
	}
	defer other.Close()

	if IsTokenRevoked(server, "shared-token") {
		t.Fatal("token is not revoked yet")
	}
	if err := RevokeToken(other, "shared-token", time.Now().Add(time.Hour)); err != nil {
		t.Fatalf("RevokeToken: %v", err)
	}

	deadline := time.Now().Add(2 * time.Second)
	for !IsTokenRevoked(server, "shared-token") {
		if time.Now().After(deadline) {
			t.Fatal("revocation by another process was never picked up")
		}
		time.Sleep(10 * time.Millisecond)
	}
}
