package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func floatPtr(v float64) *float64 {
	return &v
}

func TestExtendedFieldTypes(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init DB: %v", err)
	}
	defer dbConn.Close()

	// Define a collection featuring all 10 field types
	articleMoul := &schema.Moul{
		ID:   "moul-article-1",
		Name: "articles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text", Required: true, Min: floatPtr(3), Max: floatPtr(100)},
			{Name: "view_count", Type: "number", Min: floatPtr(0)},
			{Name: "is_published", Type: "bool"},
			{Name: "publish_date", Type: "date"},
			{Name: "published_at", Type: "datetime"},
			{Name: "metadata", Type: "json"},
			{Name: "website_url", Type: "url"},
			{Name: "status", Type: "select", Options: []string{"draft", "published", "archived"}},
			{Name: "cover_file", Type: "file"},
		},
		Rules: schema.MoulRules{},
	}

	if err := db.CreateMoulTable(dbConn, articleMoul); err != nil {
		t.Fatalf("Failed to create moul table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, articleMoul); err != nil {
		t.Fatalf("Failed to save moul metadata: %v", err)
	}

	e := echo.New()
	handler := NewRecordHandler(dbConn)
	e.POST("/api/moul/:name/records", handler.CreateRecord)
	e.GET("/api/moul/:name/records/:id", handler.GetRecord)
	e.PATCH("/api/moul/:name/records/:id", handler.UpdateRecord)

	// 1. Invalid Date format -> expect 400
	badDatePayload := map[string]interface{}{
		"title":        "Valid Article Title",
		"publish_date": "2026/08/12", // bad format
	}
	bodyBytes, _ := json.Marshal(badDatePayload)
	req := httptest.NewRequest(http.MethodPost, "/api/moul/articles/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid date format, got %d", rec.Code)
	}

	// 2. Invalid DateTime format -> expect 400
	badDateTimePayload := map[string]interface{}{
		"title":        "Valid Article Title",
		"published_at": "not-a-timestamp",
	}
	bodyBytes, _ = json.Marshal(badDateTimePayload)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/articles/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid datetime format, got %d", rec.Code)
	}

	// 3. Invalid URL -> expect 400
	badURLPayload := map[string]interface{}{
		"title":       "Valid Article Title",
		"website_url": "ftp://not-http-url",
	}
	bodyBytes, _ = json.Marshal(badURLPayload)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/articles/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid URL format, got %d", rec.Code)
	}

	// 4. Invalid JSON string -> expect 400
	badJSONPayload := map[string]interface{}{
		"title":    "Valid Article Title",
		"metadata": "{invalid-json-content",
	}
	bodyBytes, _ = json.Marshal(badJSONPayload)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/articles/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid JSON content, got %d", rec.Code)
	}

	// 5. Valid record creation with all extended field types -> expect 201
	validPayload := map[string]interface{}{
		"title":        "Exploring Go Engine Architecture",
		"view_count":   1500,
		"is_published": true,
		"publish_date": "2026-08-12",
		"published_at": "2026-08-12T10:15:44Z",
		"metadata": map[string]interface{}{
			"category": "engineering",
			"tags":     []interface{}{"go", "database", "moul"},
		},
		"website_url": "https://moul.dev",
		"status":      "published",
	}
	bodyBytes, _ = json.Marshal(validPayload)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/articles/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("Expected 201 for valid record create, got %d: %s", rec.Code, rec.Body.String())
	}

	var created map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &created); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	recID, _ := created["id"].(string)

	// Verify types in response payload
	if isPub, ok := created["is_published"].(bool); !ok || !isPub {
		t.Errorf("Expected is_published to be bool true, got %v (%T)", created["is_published"], created["is_published"])
	}
	if views, ok := created["view_count"].(float64); !ok || views != 1500 {
		t.Errorf("Expected view_count to be float64 1500, got %v (%T)", created["view_count"], created["view_count"])
	}
	if pDate, ok := created["publish_date"].(string); !ok || pDate != "2026-08-12" {
		t.Errorf("Expected publish_date to be '2026-08-12', got %v", created["publish_date"])
	}
	if pAt, ok := created["published_at"].(string); !ok || pAt != "2026-08-12T10:15:44Z" {
		t.Errorf("Expected published_at to be '2026-08-12T10:15:44Z', got %v", created["published_at"])
	}
	if urlVal, ok := created["website_url"].(string); !ok || urlVal != "https://moul.dev" {
		t.Errorf("Expected website_url to be 'https://moul.dev', got %v", created["website_url"])
	}
	metaMap, ok := created["metadata"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected metadata to be decoded JSON map, got %T: %v", created["metadata"], created["metadata"])
	}
	if metaMap["category"] != "engineering" {
		t.Errorf("Expected metadata.category to be 'engineering', got %v", metaMap["category"])
	}

	// 6. Fetch record by ID -> expect 200 and formatted payload
	req = httptest.NewRequest(http.MethodGet, "/api/moul/articles/records/"+recID, nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 for GetRecord, got %d", rec.Code)
	}

	var fetched map[string]interface{}
	_ = json.Unmarshal(rec.Body.Bytes(), &fetched)
	if isPub, ok := fetched["is_published"].(bool); !ok || !isPub {
		t.Errorf("Expected fetched is_published to be bool true, got %v", fetched["is_published"])
	}

	// 7. UpdateRecord -> expect 200
	updatePayload := map[string]interface{}{
		"is_published": false,
		"view_count":   1501,
	}
	bodyBytes, _ = json.Marshal(updatePayload)
	req = httptest.NewRequest(http.MethodPatch, "/api/moul/articles/records/"+recID, bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 for UpdateRecord, got %d: %s", rec.Code, rec.Body.String())
	}

	var updated map[string]interface{}
	_ = json.Unmarshal(rec.Body.Bytes(), &updated)
	if isPub, ok := updated["is_published"].(bool); !ok || isPub {
		t.Errorf("Expected updated is_published to be false, got %v", updated["is_published"])
	}
}
