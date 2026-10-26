package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func newTrackerTestDB(t *testing.T) (*analytics.Engine, *dbx.DB) {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	engine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("NewEngine: %v", err)
	}
	t.Cleanup(func() {
		if err := engine.Close(); err != nil {
			t.Errorf("close engine: %v", err)
		}
		if err := dbConn.Close(); err != nil {
			t.Errorf("close db: %v", err)
		}
	})
	return engine, dbConn
}

func countRows(t *testing.T, dbConn *dbx.DB, table string) int {
	t.Helper()
	var n int
	if err := dbConn.Select("COUNT(*)").From(table).Row(&n); err != nil {
		t.Fatalf("count %s: %v", table, err)
	}
	return n
}

// TestRequestTracker_CookielessAPICallsCreateNoVisit sends API calls that bring no visit and
// cannot keep the cookie (no Sec-Fetch-Site, or a cross-site fetch): none may insert a _visits row
// or set cookies, and each is still logged to _requests without a visit.
func TestRequestTracker_CookielessAPICallsCreateNoVisit(t *testing.T) {
	engine, dbConn := newTrackerTestDB(t)
	engine.StartFlusher(context.Background())

	e := echo.New()
	mw := RequestTracker(engine, false)
	handler := mw(func(c *echo.Context) error {
		if v := c.Get("visit_id"); v != nil {
			t.Errorf("expected no visit_id for a cookieless API call, got %v", v)
		}
		return c.String(http.StatusOK, "OK")
	})

	for _, site := range []string{"", "cross-site", "same-site"} {
		req := httptest.NewRequest(http.MethodGet, "/api/moul/posts/records", nil)
		if site != "" {
			req.Header.Set("Sec-Fetch-Site", site)
		}
		rec := httptest.NewRecorder()
		if err := handler(e.NewContext(req, rec)); err != nil {
			t.Fatalf("handler: %v", err)
		}
		for _, ck := range rec.Result().Cookies() {
			if ck.Name == "moul_visit" || ck.Name == "moul_visitor" {
				t.Errorf("Sec-Fetch-Site=%q: unexpected %s cookie", site, ck.Name)
			}
		}
	}

	engine.Stop() // flushes the queued request records
	if n := countRows(t, dbConn, "_visits"); n != 0 {
		t.Fatalf("expected no _visits rows, got %d", n)
	}
	if n := countRows(t, dbConn, "_requests"); n != 3 {
		t.Fatalf("expected the 3 requests to be logged, got %d", n)
	}
	var withVisit int
	if err := dbConn.NewQuery("SELECT COUNT(*) FROM _requests WHERE visit_id IS NOT NULL").Row(&withVisit); err != nil {
		t.Fatalf("count: %v", err)
	}
	if withVisit != 0 {
		t.Fatalf("expected requests without a visit to have a NULL visit_id, got %d with one", withVisit)
	}
}

// TestRequestTracker_VisitorCookieStartsNewVisit checks a browser that returns its long-lived
// moul_visitor cookie (its 30-minute visit expired) gets a new visit even without Sec-Fetch-Site.
func TestRequestTracker_VisitorCookieStartsNewVisit(t *testing.T) {
	engine, dbConn := newTrackerTestDB(t)

	e := echo.New()
	handler := RequestTracker(engine, false)(func(c *echo.Context) error {
		return c.String(http.StatusOK, "OK")
	})
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{Name: "moul_visitor", Value: "visitor-1"})
	rec := httptest.NewRecorder()
	if err := handler(e.NewContext(req, rec)); err != nil {
		t.Fatalf("handler: %v", err)
	}
	if n := countRows(t, dbConn, "_visits"); n != 1 {
		t.Fatalf("expected one new visit, got %d", n)
	}
	var visitor string
	if err := dbConn.Select("visitor_token").From("_visits").Row(&visitor); err != nil {
		t.Fatalf("read visit: %v", err)
	}
	if visitor != "visitor-1" {
		t.Fatalf("expected the visit to keep the visitor token, got %q", visitor)
	}
}

// TestRequestTracker_KnownVisitDoesNoSQL sends repeat requests with a known visit and counts the
// SQL statements the tracker runs: after the first lookup, none.
func TestRequestTracker_KnownVisitDoesNoSQL(t *testing.T) {
	engine, dbConn := newTrackerTestDB(t)

	e := echo.New()
	handler := RequestTracker(engine, false)(func(c *echo.Context) error {
		return c.String(http.StatusOK, "OK")
	})

	first := httptest.NewRequest(http.MethodGet, "/", nil)
	first.Header.Set("Sec-Fetch-Site", "none")
	rec := httptest.NewRecorder()
	if err := handler(e.NewContext(first, rec)); err != nil {
		t.Fatalf("handler: %v", err)
	}
	var visitID string
	for _, ck := range rec.Result().Cookies() {
		if ck.Name == "moul_visit" {
			visitID = ck.Value
		}
	}
	if visitID == "" {
		t.Fatal("expected a visit cookie")
	}

	var mu sync.Mutex
	queries := 0
	dbConn.QueryLogFunc = func(context.Context, time.Duration, string, *sql.Rows, error) {
		mu.Lock()
		queries++
		mu.Unlock()
	}
	dbConn.ExecLogFunc = func(context.Context, time.Duration, string, sql.Result, error) {
		mu.Lock()
		queries++
		mu.Unlock()
	}

	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/moul/posts/records", nil)
		req.AddCookie(&http.Cookie{Name: "moul_visit", Value: visitID})
		if err := handler(e.NewContext(req, httptest.NewRecorder())); err != nil {
			t.Fatalf("handler: %v", err)
		}
	}
	mu.Lock()
	defer mu.Unlock()
	if queries != 0 {
		t.Fatalf("expected repeat requests with a known visit to run no SQL, ran %d statements", queries)
	}
}
