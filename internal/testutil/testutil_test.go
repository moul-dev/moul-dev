package testutil_test

import (
	"net/http"
	"testing"

	"github.com/moul-dev/moul-dev/internal/testutil"
)

func TestNewTestDB(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	if dbConn == nil {
		t.Fatalf("Expected dbConn to be non-nil")
	}

	// Verify table queries can be executed
	var count int
	err := dbConn.Select("count(*)").From("sqlite_master").Row(&count)
	if err != nil {
		t.Fatalf("Failed to query sqlite_master: %v", err)
	}
}

func TestNewTestServer(t *testing.T) {
	ts := testutil.NewTestServer(t)
	if ts.Server == nil {
		t.Fatalf("Expected Server to be non-nil")
	}
	if ts.URL == "" {
		t.Fatalf("Expected URL to be non-empty")
	}

	// Test Admin Header
	adminHeader := ts.AdminHeader()
	if adminHeader.Get("X-Admin-Key") != ts.AdminKey {
		t.Errorf("Expected X-Admin-Key header %s, got %s", ts.AdminKey, adminHeader.Get("X-Admin-Key"))
	}

	// Test Auth Token generation
	token, err := ts.AuthToken("user-1", "user@example.com")
	if err != nil {
		t.Fatalf("Failed to generate auth token: %v", err)
	}
	if token == "" {
		t.Fatalf("Generated empty auth token")
	}

	// Test Auth Header helper
	authHeader := ts.AuthHeader(t, "user-1", "user@example.com")
	if authHeader.Get("Authorization") != "Bearer "+token {
		t.Errorf("Expected Bearer token in Authorization header")
	}

	// Test hitting public docs/endpoint on test server
	req, err := http.NewRequest(http.MethodGet, ts.URL+"/openapi.json", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("Failed to perform request against TestServer: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK from /openapi.json on TestServer, got %d", resp.StatusCode)
	}
}
