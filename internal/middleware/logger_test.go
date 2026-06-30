package middleware

import (
	"bytes"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestRequestLogger(t *testing.T) {
	// Set up slog to write JSON to a buffer for parsing
	var buf bytes.Buffer
	logger := slog.New(slog.NewJSONHandler(&buf, nil))
	slog.SetDefault(logger)

	tests := []struct {
		name           string
		handler        echo.HandlerFunc
		authSetup      func(c echo.Context)
		expectedStatus int
		expectedLevel  string
		expectErrorMsg string
		expectUser     bool
	}{
		{
			name: "Successful Request (200)",
			handler: func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			},
			expectedStatus: http.StatusOK,
			expectedLevel:  "INFO",
		},
		{
			name: "Client Error (404)",
			handler: func(c echo.Context) error {
				return echo.NewHTTPError(http.StatusNotFound, "Not Found")
			},
			expectedStatus: http.StatusNotFound,
			expectedLevel:  "WARN",
		},
		{
			name: "Server Error (500)",
			handler: func(c echo.Context) error {
				return errors.New("something went wrong")
			},
			expectedStatus: http.StatusInternalServerError,
			expectedLevel:  "ERROR",
			expectErrorMsg: "something went wrong",
		},
		{
			name: "With Auth Context",
			handler: func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			},
			authSetup: func(c echo.Context) {
				c.Set(AuthContextKey, map[string]interface{}{
					"id":    "user-123",
					"email": "test@example.com",
				})
			},
			expectedStatus: http.StatusOK,
			expectedLevel:  "INFO",
			expectUser:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			buf.Reset()
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/test-path", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			if tt.authSetup != nil {
				tt.authSetup(c)
			}

			h := RequestLogger()(tt.handler)
			_ = h(c) // Execute middleware

			// Parse logged output
			logOutput := buf.Bytes()
			if len(logOutput) == 0 {
				t.Fatal("Expected log output, got empty buffer")
			}

			var logData map[string]interface{}
			if err := json.Unmarshal(logOutput, &logData); err != nil {
				t.Fatalf("Failed to parse log JSON: %v. Output was: %s", err, string(logOutput))
			}

			// Validate standard fields
			if logData["level"] != tt.expectedLevel {
				t.Errorf("Expected level %q, got %q", tt.expectedLevel, logData["level"])
			}
			if logData["method"] != "GET" {
				t.Errorf("Expected method GET, got %v", logData["method"])
			}
			if logData["path"] != "/test-path" {
				t.Errorf("Expected path /test-path, got %v", logData["path"])
			}

			// In JSON handler, numbers are parsed as float64
			status, ok := logData["status"].(float64)
			if !ok || int(status) != tt.expectedStatus {
				t.Errorf("Expected status %d, got %v", tt.expectedStatus, logData["status"])
			}

			// Validate user context
			if tt.expectUser {
				if logData["user_id"] != "user-123" {
					t.Errorf("Expected user_id 'user-123', got %v", logData["user_id"])
				}
				if logData["email"] != "test@example.com" {
					t.Errorf("Expected email 'test@example.com', got %v", logData["email"])
				}
			}

			// Validate error message
			if tt.expectErrorMsg != "" {
				if logData["error"] != tt.expectErrorMsg {
					t.Errorf("Expected error message %q, got %v", tt.expectErrorMsg, logData["error"])
				}
			}
		})
	}
}
