package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
)

func TestRulesTestHandler(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init in-memory database: %v", err)
	}
	defer dbConn.Close()

	handler := NewRulesTestHandler(dbConn)
	e := echo.New()

	// 1. Test Valid matching rule
	t.Run("Valid Matching Rule", func(t *testing.T) {
		payload := RuleTestRequest{
			Rule:   "author_id = @request.auth.id",
			Record: map[string]interface{}{"author_id": "usr_123"},
			Auth:   map[string]interface{}{"id": "usr_123"},
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/rules/test", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if err := handler.TestRule(c); err != nil {
			t.Fatalf("Handler failed: %v", err)
		}

		var resp RuleTestResponse
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)

		if !resp.Valid {
			t.Errorf("Expected valid rule, got invalid: %s", resp.Error)
		}
		if !resp.Matched {
			t.Errorf("Expected rule to match")
		}
	})

	// 2. Test Valid Non-matching rule
	t.Run("Valid Non-Matching Rule", func(t *testing.T) {
		payload := RuleTestRequest{
			Rule:   "author_id = @request.auth.id",
			Record: map[string]interface{}{"author_id": "usr_123"},
			Auth:   map[string]interface{}{"id": "usr_456"},
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/rules/test", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if err := handler.TestRule(c); err != nil {
			t.Fatalf("Handler failed: %v", err)
		}

		var resp RuleTestResponse
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)

		if !resp.Valid {
			t.Errorf("Expected valid rule, got invalid: %s", resp.Error)
		}
		if resp.Matched {
			t.Errorf("Expected rule NOT to match")
		}
	})

	// 3. Test Invalid Syntax Rule
	t.Run("Invalid Syntax Rule", func(t *testing.T) {
		payload := RuleTestRequest{
			Rule: "invalid == (&&",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/rules/test", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if err := handler.TestRule(c); err != nil {
			t.Fatalf("Handler failed: %v", err)
		}

		var resp RuleTestResponse
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)

		if resp.Valid {
			t.Errorf("Expected syntax error, got valid")
		}
	})
}
