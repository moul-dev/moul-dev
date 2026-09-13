package handlers

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/pkg/ui"
)

func TestAdminUIRedirectsAndFallback(t *testing.T) {
	e := echo.New()
	RegisterAdminUIWithOptions(e, AdminUIOptions{
		Prefix:    "/_moul_",
		APIPrefix: "/api",
	})

	// 1. /admin is not redirected (removed to prevent collision with root API routes)
	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for /admin (no redirect), got %d", rec.Code)
	}

	// 2. Test redirect /_moul_ -> /_moul_/
	req = httptest.NewRequest(http.MethodGet, "/_moul_", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusMovedPermanently {
		t.Fatalf("expected redirect 301 for /_moul_, got %d", rec.Code)
	}
	if loc := rec.Header().Get("Location"); loc != "/_moul_/" {
		t.Fatalf("expected Location /_moul_/, got %q", loc)
	}

	// 3. Test serving index.html on /_moul_/
	req = httptest.NewRequest(http.MethodGet, "/_moul_/", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for /_moul_/, got %d", rec.Code)
	}
	if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "no-cache") {
		t.Fatalf("expected Cache-Control no-cache for index.html, got %q", cc)
	}
	if !strings.Contains(rec.Body.String(), "<div id=\"root\"></div>") && !strings.Contains(rec.Body.String(), "moul Web Admin Console") {
		t.Fatalf("unexpected index.html body: %s", rec.Body.String())
	}

	// 5. Test missing asset returns 404
	req = httptest.NewRequest(http.MethodGet, "/_moul_/assets/nonexistent-bundle.js", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for missing asset in /assets/, got %d", rec.Code)
	}

	// 6. Test serving favicon.svg
	req = httptest.NewRequest(http.MethodGet, "/_moul_/favicon.svg", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code == http.StatusOK {
		if ui.HasCustomUI() {
			if !strings.Contains(rec.Body.String(), "<polygon") && !strings.Contains(rec.Body.String(), "<svg") {
				t.Fatalf("expected favicon svg content, got %s", rec.Body.String())
			}
		}
	}

	// 7. Test SPA sub-path fallback (e.g. /_moul_/records/users)
	req = httptest.NewRequest(http.MethodGet, "/_moul_/records/users", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for SPA fallback route /_moul_/records/users, got %d", rec.Code)
	}
	if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "no-cache") {
		t.Fatalf("expected Cache-Control no-cache for SPA fallback, got %q", cc)
	}
}

func TestAdminUINoRedirectByDefault(t *testing.T) {
	e := echo.New()
	RegisterAdminUIWithOptions(e, AdminUIOptions{
		Prefix: "/_moul_",
	})

	// /admin is never registered as a redirect
	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for /admin, got %d", rec.Code)
	}
}

func TestAdminUICustomFileSystem(t *testing.T) {
	e := echo.New()

	customFS := fstest.MapFS{
		"index.html": &fstest.MapFile{
			Data: []byte("<!DOCTYPE html><html><head><title>Test</title></head><body>Custom Admin Dashboard</body></html>"),
		},
		"assets/bundle-123.js": &fstest.MapFile{
			Data: []byte("console.log('custom dashboard bundle');"),
		},
	}

	RegisterAdminUIWithOptions(e, AdminUIOptions{
		Prefix:     "/custom-admin",
		APIPrefix:  "/v1",
		FileSystem: customFS,
	})

	// 1. Test redirect /custom-admin -> /custom-admin/
	req := httptest.NewRequest(http.MethodGet, "/custom-admin", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusMovedPermanently {
		t.Fatalf("expected 301 redirect, got %d", rec.Code)
	}
	if loc := rec.Header().Get("Location"); loc != "/custom-admin/" {
		t.Fatalf("expected Location /custom-admin/, got %q", loc)
	}

	// 2. Test serving index.html with window.__MOUL_API_PREFIX__ injected
	req = httptest.NewRequest(http.MethodGet, "/custom-admin/", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}
	body := rec.Body.String()
	if !strings.Contains(body, "Custom Admin Dashboard") {
		t.Fatalf("expected custom dashboard content, got: %s", body)
	}
	if !strings.Contains(body, `<script>window.__MOUL_API_PREFIX__="/v1";</script>`) {
		t.Fatalf("expected window.__MOUL_API_PREFIX__ script to be injected, got: %s", body)
	}

	// 3. Test static asset serving with immutable caching
	req = httptest.NewRequest(http.MethodGet, "/custom-admin/assets/bundle-123.js", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for asset, got %d", rec.Code)
	}
	if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "immutable") {
		t.Fatalf("expected immutable cache control, got %q", cc)
	}
	if !strings.Contains(rec.Body.String(), "custom dashboard bundle") {
		t.Fatalf("expected asset content, got %s", rec.Body.String())
	}

	// 4. Test SPA route fallback
	req = httptest.NewRequest(http.MethodGet, "/custom-admin/settings/general", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for SPA fallback, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "Custom Admin Dashboard") {
		t.Fatalf("expected custom dashboard content on SPA fallback, got %s", rec.Body.String())
	}
}

func TestRouterDisableAdminUI(t *testing.T) {
	tempDir := t.TempDir()
	dbConn, err := db.InitDB(filepath.Join(tempDir, "test.db"))
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	defer dbConn.Close()

	router := NewRouterWithOptions(dbConn, nil, nil, nil, nil, nil, "test-admin-key", true, RouterConfig{
		DisableAdminUI: true,
	})

	req := httptest.NewRequest(http.MethodGet, "/_moul_/", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for /_moul_/ when DisableAdminUI is true, got %d", rec.Code)
	}
}
