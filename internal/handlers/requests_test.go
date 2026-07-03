package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

func seedTestRequests(t *testing.T, dbConn *dbx.DB, count int) {
	t.Helper()
	for i := 0; i < count; i++ {
		_, err := dbConn.Insert("_requests", dbx.Params{
			"id":               "req-" + util.RandomID(),
			"visit_id":         "visit-test-123",
			"method":           "GET",
			"path":             "/api/test",
			"status_code":      200,
			"response_time_ms": 42,
			"created_at":       time.Now().UTC().Format(time.RFC3339),
		}).Execute()
		if err != nil {
			t.Fatalf("Failed to seed test request %d: %v", i, err)
		}
	}
}

func TestListRequests_RequiresAuth(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	handler := NewRequestsHandler(dbConn)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err = handler.ListRequests(c)
	if err == nil {
		t.Fatal("Expected error for unauthenticated request")
	}

	httpErr, ok := err.(*echo.HTTPError)
	if !ok || httpErr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %v", err)
	}
}

func TestListRequests_ReturnsPaginated(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	// Seed 5 requests
	seedTestRequests(t, dbConn, 5)

	handler := NewRequestsHandler(dbConn)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/requests?page=1&perPage=2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Set auth context
	c.Set(middleware.AuthContextKey, map[string]interface{}{
		"id":    "user-123",
		"email": "admin@test.com",
	})

	err = handler.ListRequests(c)
	if err != nil {
		t.Fatalf("ListRequests returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rec.Code)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Check pagination fields
	if int(result["totalItems"].(float64)) != 5 {
		t.Errorf("Expected totalItems=5, got %v", result["totalItems"])
	}
	if int(result["perPage"].(float64)) != 2 {
		t.Errorf("Expected perPage=2, got %v", result["perPage"])
	}
	if int(result["totalPages"].(float64)) != 3 {
		t.Errorf("Expected totalPages=3, got %v", result["totalPages"])
	}

	items, ok := result["items"].([]interface{})
	if !ok || len(items) != 2 {
		t.Errorf("Expected 2 items on page 1, got %d", len(items))
	}
}

func TestGetRequest_RequiresAuth(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	handler := NewRequestsHandler(dbConn)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/requests/req-123", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("req-123")

	err = handler.GetRequest(c)
	if err == nil {
		t.Fatal("Expected error for unauthenticated request")
	}

	httpErr, ok := err.(*echo.HTTPError)
	if !ok || httpErr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %v", err)
	}
}

func TestGetRequest_ReturnsRecord(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	// Seed a specific request
	now := time.Now().UTC().Format(time.RFC3339)
	_, err = dbConn.Insert("_requests", dbx.Params{
		"id":               "req-specific-123",
		"visit_id":         "visit-abc",
		"method":           "POST",
		"path":             "/api/mouls/users/records",
		"status_code":      201,
		"response_time_ms": 55,
		"created_at":       now,
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to seed request: %v", err)
	}

	handler := NewRequestsHandler(dbConn)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/requests/req-specific-123", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("req-specific-123")

	c.Set(middleware.AuthContextKey, map[string]interface{}{
		"id":    "user-123",
		"email": "admin@test.com",
	})

	err = handler.GetRequest(c)
	if err != nil {
		t.Fatalf("GetRequest returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rec.Code)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if result["id"] != "req-specific-123" {
		t.Errorf("Expected id=req-specific-123, got %v", result["id"])
	}
	if result["method"] != "POST" {
		t.Errorf("Expected method=POST, got %v", result["method"])
	}
	if result["path"] != "/api/mouls/users/records" {
		t.Errorf("Expected path=/api/mouls/users/records, got %v", result["path"])
	}
}

func TestGetRequest_NotFound(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	handler := NewRequestsHandler(dbConn)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/requests/nonexistent", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("nonexistent")

	c.Set(middleware.AuthContextKey, map[string]interface{}{
		"id":    "user-123",
		"email": "admin@test.com",
	})

	err = handler.GetRequest(c)
	if err == nil {
		t.Fatal("Expected error for nonexistent request")
	}

	httpErr, ok := err.(*echo.HTTPError)
	if !ok || httpErr.Code != http.StatusNotFound {
		t.Errorf("Expected 404, got %v", err)
	}
}
