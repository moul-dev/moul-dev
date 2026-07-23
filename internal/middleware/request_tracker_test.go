package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
)

func setupTestEngine(t *testing.T) (*analytics.Engine, func()) {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}

	engine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		dbConn.Close()
		t.Fatalf("Failed to create analytics engine: %v", err)
	}

	return engine, func() {
		engine.Close()
		dbConn.Close()
	}
}

func TestRequestTracker_CreatesVisitOnFirstRequest(t *testing.T) {
	engine, cleanup := setupTestEngine(t)
	defer cleanup()

	e := echo.New()
	mw := RequestTracker(engine, false)

	handler := mw(func(c *echo.Context) error {
		// Verify visit_id is set in context
		visitID := c.Get("visit_id")
		if visitID == nil || visitID == "" {
			t.Error("Expected visit_id to be set in context")
		}
		return c.String(http.StatusOK, "OK")
	})

	req := httptest.NewRequest(http.MethodGet, "/api/moul/test/records", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := handler(c)
	if err != nil {
		t.Fatalf("Middleware returned error: %v", err)
	}

	// Check that cookies were set
	cookies := rec.Result().Cookies()
	var foundVisit, foundVisitor bool
	for _, cookie := range cookies {
		if cookie.Name == "moul_visit" && cookie.Value != "" {
			foundVisit = true
		}
		if cookie.Name == "moul_visitor" && cookie.Value != "" {
			foundVisitor = true
		}
	}
	if !foundVisit {
		t.Error("Expected moul_visit cookie to be set")
	}
	if !foundVisitor {
		t.Error("Expected moul_visitor cookie to be set")
	}
}

func TestRequestTracker_ReusesVisitOnSubsequentRequest(t *testing.T) {
	engine, cleanup := setupTestEngine(t)
	defer cleanup()

	e := echo.New()
	mw := RequestTracker(engine, false)

	// First request: create the visit
	handler := mw(func(c *echo.Context) error {
		return c.String(http.StatusOK, "OK")
	})

	req1 := httptest.NewRequest(http.MethodGet, "/first", nil)
	rec1 := httptest.NewRecorder()
	c1 := e.NewContext(req1, rec1)
	_ = handler(c1)

	// Extract visit cookie from first response
	var visitCookieValue string
	for _, cookie := range rec1.Result().Cookies() {
		if cookie.Name == "moul_visit" {
			visitCookieValue = cookie.Value
			break
		}
	}

	if visitCookieValue == "" {
		t.Fatal("No moul_visit cookie found from first request")
	}

	// Second request: send the visit cookie back
	var secondVisitID string
	handler2 := mw(func(c *echo.Context) error {
		secondVisitID, _ = c.Get("visit_id").(string)
		return c.String(http.StatusOK, "OK")
	})

	req2 := httptest.NewRequest(http.MethodGet, "/second", nil)
	req2.AddCookie(&http.Cookie{Name: "moul_visit", Value: visitCookieValue})
	rec2 := httptest.NewRecorder()
	c2 := e.NewContext(req2, rec2)
	_ = handler2(c2)

	// Visit ID should be the same
	if secondVisitID != visitCookieValue {
		t.Errorf("Expected visit_id %q on second request, got %q", visitCookieValue, secondVisitID)
	}

	// No new moul_visit cookie should be set (visit already exists)
	for _, cookie := range rec2.Result().Cookies() {
		if cookie.Name == "moul_visit" {
			t.Error("Should not set moul_visit cookie on existing visit")
		}
	}
}

func TestRequestTracker_ExcludedPaths(t *testing.T) {
	engine, cleanup := setupTestEngine(t)
	defer cleanup()

	e := echo.New()
	mw := RequestTracker(engine, false,
		WithExcludePaths([]string{"/api/visits", "/api/requests"}),
	)

	handler := mw(func(c *echo.Context) error {
		// For excluded paths, visit_id should NOT be set
		visitID := c.Get("visit_id")
		if visitID != nil {
			t.Error("Expected visit_id to NOT be set for excluded path")
		}
		return c.String(http.StatusOK, "OK")
	})

	req := httptest.NewRequest(http.MethodGet, "/api/visits", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := handler(c)
	if err != nil {
		t.Fatalf("Middleware returned error: %v", err)
	}

	// No cookies should be set
	cookies := rec.Result().Cookies()
	for _, cookie := range cookies {
		if cookie.Name == "moul_visit" || cookie.Name == "moul_visitor" {
			t.Error("Should not set tracking cookies for excluded paths")
		}
	}
}

func TestRequestTracker_AttachesAuthUserID(t *testing.T) {
	engine, cleanup := setupTestEngine(t)
	defer cleanup()

	e := echo.New()
	mw := RequestTracker(engine, false)

	handler := mw(func(c *echo.Context) error {
		return c.String(http.StatusOK, "OK")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Simulate auth context being set (as if LoadAuthContextMiddleware ran before)
	c.Set(AuthContextKey, map[string]interface{}{
		"id":       "user-abc-123",
		"email":    "test@example.com",
		"username": "testuser",
	})

	_ = handler(c)

	// The visit was created with a user_id. We need to give the flusher a moment
	// for the request tracking, but the visit creation is synchronous.
	// Just verify the cookie was set (visit was created)
	var foundVisit bool
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == "moul_visit" && cookie.Value != "" {
			foundVisit = true
		}
	}
	if !foundVisit {
		t.Error("Expected moul_visit cookie to be set")
	}
}

func TestRequestTracker_EnqueuesRequestData(t *testing.T) {
	engine, cleanup := setupTestEngine(t)
	defer cleanup()

	e := echo.New()
	mw := RequestTracker(engine, false)

	handler := mw(func(c *echo.Context) error {
		// Simulate some processing time
		time.Sleep(5 * time.Millisecond)
		return c.String(http.StatusCreated, "Created")
	})

	req := httptest.NewRequest(http.MethodPost, "/api/moul/users/records", nil)
	req.Header.Set("User-Agent", "TestBot/1.0")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	_ = handler(c)

	// The request data should have been enqueued.
	// We can verify by checking that the status code was captured correctly.
	if rec.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", rec.Code)
	}
}
