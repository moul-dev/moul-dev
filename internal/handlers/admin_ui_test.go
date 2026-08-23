package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
)

func TestAdminUIRedirectsAndFallback(t *testing.T) {
	e := echo.New()
	RegisterAdminUIRoutes(e, "/_moul_")

	// 1. Test redirect /admin -> /_moul_/
	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusMovedPermanently {
		t.Fatalf("expected redirect 301 for /admin, got %d", rec.Code)
	}
	if loc := rec.Header().Get("Location"); loc != "/_moul_/" {
		t.Fatalf("expected Location /_moul_/, got %q", loc)
	}

	// 2. Test redirect /admin/collections -> /_moul_/collections
	req = httptest.NewRequest(http.MethodGet, "/admin/collections", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusMovedPermanently {
		t.Fatalf("expected redirect 301 for /admin/collections, got %d", rec.Code)
	}
	if loc := rec.Header().Get("Location"); loc != "/_moul_/collections" {
		t.Fatalf("expected Location /_moul_/collections, got %q", loc)
	}

	// 3. Test redirect /_moul_ -> /_moul_/
	req = httptest.NewRequest(http.MethodGet, "/_moul_", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusMovedPermanently {
		t.Fatalf("expected redirect 301 for /_moul_, got %d", rec.Code)
	}
	if loc := rec.Header().Get("Location"); loc != "/_moul_/" {
		t.Fatalf("expected Location /_moul_/, got %q", loc)
	}

	// 4. Test serving index.html on /_moul_/
	req = httptest.NewRequest(http.MethodGet, "/_moul_/", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for /_moul_/, got %d", rec.Code)
	}
	if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "no-cache") {
		t.Fatalf("expected Cache-Control no-cache for index.html, got %q", cc)
	}
	if !strings.Contains(rec.Body.String(), "<div id=\"root\"></div>") && !strings.Contains(rec.Body.String(), "mould Web Admin Console") {
		t.Fatalf("unexpected index.html body: %s", rec.Body.String())
	}

	// 5. Test serving real embedded static assets (e.g. JS and CSS)
	req = httptest.NewRequest(http.MethodGet, "/_moul_/assets/index-DsmNpSvL.js", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code == http.StatusOK {
		if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "immutable") {
			t.Fatalf("expected immutable cache-control for JS asset, got %q", cc)
		}
		if len(rec.Body.Bytes()) == 0 {
			t.Fatalf("expected non-empty JS asset body")
		}
	}

	req = httptest.NewRequest(http.MethodGet, "/_moul_/assets/index-C2iHN8Fm.css", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code == http.StatusOK {
		if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "immutable") {
			t.Fatalf("expected immutable cache-control for CSS asset, got %q", cc)
		}
		if len(rec.Body.Bytes()) == 0 {
			t.Fatalf("expected non-empty CSS asset body")
		}
	}

	// 6. Test missing asset returns 404
	req = httptest.NewRequest(http.MethodGet, "/_moul_/assets/nonexistent-bundle.js", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for missing asset in /assets/, got %d", rec.Code)
	}

	// 7. Test serving favicon.svg
	req = httptest.NewRequest(http.MethodGet, "/_moul_/favicon.svg", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code == http.StatusOK {
		if !strings.Contains(rec.Body.String(), "<polygon") {
			t.Fatalf("expected favicon svg content, got %s", rec.Body.String())
		}
	}

	// 8. Test SPA sub-path fallback (e.g. /_moul_/records/users)
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
