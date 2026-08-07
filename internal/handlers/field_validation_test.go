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

func TestFieldValidationConstraints(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init DB: %v", err)
	}
	defer dbConn.Close()

	// Define a collection with field validation rules
	productsMoul := &schema.Moul{
		ID:   "moul-prod-1",
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text", Required: true, Min: floatPtr(3), Max: floatPtr(20)},
			{Name: "price", Type: "number", Required: true, Min: floatPtr(10), Max: floatPtr(1000)},
		},
		Rules: schema.MoulRules{
			CreateRule: "",
			UpdateRule: "",
		},
	}

	if err := db.CreateMoulTable(dbConn, productsMoul); err != nil {
		t.Fatalf("Failed to create moul table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, productsMoul); err != nil {
		t.Fatalf("Failed to save moul metadata: %v", err)
	}

	e := echo.New()
	handler := NewRecordHandler(dbConn)
	e.POST("/api/moul/:name/records", handler.CreateRecord)
	e.PATCH("/api/moul/:name/records/:id", handler.UpdateRecord)

	// 1. CreateRecord missing required field "title" -> expect 400
	payloadMissing := map[string]interface{}{"price": 50}
	bodyBytes, _ := json.Marshal(payloadMissing)
	req := httptest.NewRequest(http.MethodPost, "/api/moul/products/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 when required field title is missing, got %d", rec.Code)
	}

	// 2. CreateRecord title string length less than min (2 chars < 3) -> expect 400
	payloadShortTitle := map[string]interface{}{"title": "ab", "price": 50}
	bodyBytes, _ = json.Marshal(payloadShortTitle)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/products/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 when title length < min, got %d", rec.Code)
	}

	// 3. CreateRecord price below min (5 < 10) -> expect 400
	payloadLowPrice := map[string]interface{}{"title": "Valid Title", "price": 5}
	bodyBytes, _ = json.Marshal(payloadLowPrice)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/products/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 when price < min, got %d", rec.Code)
	}

	// 4. CreateRecord valid -> expect 201
	payloadValid := map[string]interface{}{"title": "Valid Title", "price": 100}
	bodyBytes, _ = json.Marshal(payloadValid)
	req = httptest.NewRequest(http.MethodPost, "/api/moul/products/records", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("Expected 201 for valid record create, got %d", rec.Code)
	}

	var createdRecord map[string]interface{}
	_ = json.Unmarshal(rec.Body.Bytes(), &createdRecord)
	recordID, _ := createdRecord["id"].(string)

	// 5. UpdateRecord price exceeding max (2000 > 1000) -> expect 400
	payloadPriceTooHigh := map[string]interface{}{"price": 2000}
	bodyBytes, _ = json.Marshal(payloadPriceTooHigh)
	req = httptest.NewRequest(http.MethodPatch, "/api/moul/products/records/"+recordID, bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 when update price > max, got %d", rec.Code)
	}

	// 6. UpdateRecord valid price -> expect 200
	payloadValidUpdate := map[string]interface{}{"price": 250}
	bodyBytes, _ = json.Marshal(payloadValidUpdate)
	req = httptest.NewRequest(http.MethodPatch, "/api/moul/products/records/"+recordID, bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 for valid record update, got %d", rec.Code)
	}
}
