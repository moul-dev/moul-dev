package handlers

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
)

func TestNormalizeAPIPrefix(t *testing.T) {
	strPtr := func(s string) *string {
		return &s
	}

	tests := []struct {
		name     string
		input    *string
		expected string
	}{
		{"nil prefix defaults to /api", nil, "/api"},
		{"empty string normalizes to empty", strPtr(""), ""},
		{"slash normalizes to empty", strPtr("/"), ""},
		{"whitespace normalizes to empty", strPtr("   "), ""},
		{"standard /api", strPtr("/api"), "/api"},
		{"api without leading slash", strPtr("api"), "/api"},
		{"/api/ with trailing slash", strPtr("/api/"), "/api"},
		{"custom /v1", strPtr("/v1"), "/v1"},
		{"custom v1 without slash", strPtr("v1"), "/v1"},
		{"nested /api/v1/", strPtr("/api/v1/"), "/api/v1"},
		{"custom nested /internal/api", strPtr("/internal/api"), "/internal/api"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			actual := NormalizeAPIPrefix(tc.input)
			if actual != tc.expected {
				t.Fatalf("expected %q, got %q", tc.expected, actual)
			}
		})
	}
}

func TestRouter_APIPrefixConfigurations(t *testing.T) {
	dbConn, err := db.InitDB(filepath.Join(t.TempDir(), "test_router.db"))
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	defer dbConn.Close()
	if err := db.EnsureSystemTables(dbConn); err != nil {
		t.Fatalf("failed to ensure system tables: %v", err)
	}
	adminKey := "test-admin-key"

	strPtr := func(s string) *string {
		return &s
	}

	// 1. Default prefix (nil) -> /api
	t.Run("Default Nil Prefix", func(t *testing.T) {
		r := NewRouterWithOptions(dbConn, nil, nil, nil, nil, nil, adminKey, true, RouterConfig{
			APIPrefix: nil,
		})

		// /api/setup should respond
		req := httptest.NewRequest(http.MethodGet, "/api/setup", nil)
		req.Header.Set("X-Admin-Key", adminKey)
		rec := httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /api/setup, got %d", rec.Code)
		}

		// /setup should 404
		req = httptest.NewRequest(http.MethodGet, "/setup", nil)
		rec = httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404 on /setup, got %d", rec.Code)
		}
	})

	// 2. Custom prefix (/v1)
	t.Run("Custom /v1 Prefix", func(t *testing.T) {
		r := NewRouterWithOptions(dbConn, nil, nil, nil, nil, nil, adminKey, true, RouterConfig{
			APIPrefix: strPtr("/v1"),
		})

		// /v1/setup should respond
		req := httptest.NewRequest(http.MethodGet, "/v1/setup", nil)
		req.Header.Set("X-Admin-Key", adminKey)
		rec := httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /v1/setup, got %d", rec.Code)
		}

		// /v1/moul should respond
		req = httptest.NewRequest(http.MethodGet, "/v1/moul", nil)
		rec = httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /v1/moul, got %d", rec.Code)
		}

		// /api/setup should 404
		req = httptest.NewRequest(http.MethodGet, "/api/setup", nil)
		rec = httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404 on /api/setup, got %d", rec.Code)
		}
	})

	// 3. Empty prefix ("") -> Mounted at root
	t.Run("Empty Prefix At Root", func(t *testing.T) {
		r := NewRouterWithOptions(dbConn, nil, nil, nil, nil, nil, adminKey, true, RouterConfig{
			APIPrefix: strPtr(""),
		})

		// /setup should respond
		req := httptest.NewRequest(http.MethodGet, "/setup", nil)
		req.Header.Set("X-Admin-Key", adminKey)
		rec := httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /setup, got %d", rec.Code)
		}

		// /moul should respond
		req = httptest.NewRequest(http.MethodGet, "/moul", nil)
		rec = httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /moul, got %d", rec.Code)
		}

		// /visits should respond
		req = httptest.NewRequest(http.MethodGet, "/visits", nil)
		rec = httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		// /visits requires auth, so expecting 401 Unauthorized (not 404 Not Found)
		if rec.Code == http.StatusNotFound {
			t.Fatalf("expected route /visits to exist at root, got 404")
		}

		// Non-API docs endpoints stay at root
		req = httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
		rec = httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /openapi.json, got %d", rec.Code)
		}
	})

	// 4. Slash prefix ("/") -> Also normalizes to empty root
	t.Run("Slash Prefix Normalizes To Root", func(t *testing.T) {
		r := NewRouterWithOptions(dbConn, nil, nil, nil, nil, nil, adminKey, true, RouterConfig{
			APIPrefix: strPtr("/"),
		})

		req := httptest.NewRequest(http.MethodGet, "/setup", nil)
		req.Header.Set("X-Admin-Key", adminKey)
		rec := httptest.NewRecorder()
		r.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /setup, got %d", rec.Code)
		}
	})
}
