package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/pocketbase/dbx"
)

// RulesTestHandler handles rule evaluation testing and debugging.
type RulesTestHandler struct {
	dbConn *dbx.DB
}

// NewRulesTestHandler creates a new RulesTestHandler instance.
func NewRulesTestHandler(dbConn *dbx.DB) *RulesTestHandler {
	return &RulesTestHandler{
		dbConn: dbConn,
	}
}

// RuleTestRequest defines the input payload for testing a rule expression.
type RuleTestRequest struct {
	Rule    string                 `json:"rule"`
	Record  map[string]interface{} `json:"record"`
	Auth    map[string]interface{} `json:"auth"`
	Request map[string]interface{} `json:"request"`
}

// RuleTestResponse defines the output diagnostic result of rule testing.
type RuleTestResponse struct {
	Valid      bool   `json:"valid"`
	Matched    bool   `json:"matched"`
	Translated string `json:"translated"`
	DurationUs int64  `json:"duration_us"`
	Error      string `json:"error,omitempty"`
}

// TestRule evaluates a rule against provided record and auth context.
func (h *RulesTestHandler) TestRule(c *echo.Context) error {
	var req RuleTestRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload: " + err.Error()})
	}

	start := time.Now()

	// 1. Translate rule syntax
	translated, _, err := rules.Translate(req.Rule)
	if err != nil {
		return c.JSON(http.StatusOK, RuleTestResponse{
			Valid:      false,
			Matched:    false,
			Translated: "",
			DurationUs: time.Since(start).Microseconds(),
			Error:      "Translation syntax error: " + err.Error(),
		})
	}

	// 2. Evaluate rule
	var reqCtx []map[string]interface{}
	if req.Request != nil {
		reqCtx = append(reqCtx, req.Request)
	}

	matched, evalErr := rules.EvaluateRule(h.dbConn, req.Rule, req.Auth, req.Record, reqCtx...)
	dur := time.Since(start).Microseconds()

	if evalErr != nil {
		return c.JSON(http.StatusOK, RuleTestResponse{
			Valid:      false,
			Matched:    false,
			Translated: translated,
			DurationUs: dur,
			Error:      "Evaluation error: " + evalErr.Error(),
		})
	}

	return c.JSON(http.StatusOK, RuleTestResponse{
		Valid:      true,
		Matched:    matched,
		Translated: translated,
		DurationUs: dur,
	})
}
