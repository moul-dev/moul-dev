package middleware

import (
	"bytes"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/charmbracelet/log"
	"github.com/labstack/echo/v5"

	"github.com/moul-dev/moul-dev/internal/logger"
)

func TestRequestLogger(t *testing.T) {
	tests := []struct {
		name           string
		handler        echo.HandlerFunc
		authSetup      func(c *echo.Context)
		expectedStatus int
		expectedLevel  string
		expectErrorMsg string
		expectUser     bool
	}{
		{
			name: "Successful Request (200)",
			handler: func(c *echo.Context) error {
				return c.String(http.StatusOK, "OK")
			},
			expectedStatus: http.StatusOK,
			expectedLevel:  "INFO",
		},
		{
			name: "Client Error (404)",
			handler: func(c *echo.Context) error {
				return echo.NewHTTPError(http.StatusNotFound, "Not Found")
			},
			expectedStatus: http.StatusNotFound,
			expectedLevel:  "WARN",
		},
		{
			name: "Server Error (500)",
			handler: func(c *echo.Context) error {
				return errors.New("something went wrong")
			},
			expectedStatus: http.StatusInternalServerError,
			expectedLevel:  "ERRO",
			expectErrorMsg: "something went wrong",
		},
		{
			name: "With Auth Context",
			handler: func(c *echo.Context) error {
				return c.String(http.StatusOK, "OK")
			},
			authSetup: func(c *echo.Context) {
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
			// Redirect the package-level logger to a buffer for testing
			var buf bytes.Buffer
			logger.Default = log.NewWithOptions(&buf, log.Options{
				ReportTimestamp: false,
			})

			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/test-path", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			if tt.authSetup != nil {
				tt.authSetup(c)
			}

			h := RequestLogger()(tt.handler)
			_ = h(c) // Execute middleware

			// Parse logged output as text
			logOutput := buf.String()
			if logOutput == "" {
				t.Fatal("Expected log output, got empty buffer")
			}

			// Validate log level
			if !strings.Contains(logOutput, tt.expectedLevel) {
				t.Errorf("Expected level %q in log output, got: %s", tt.expectedLevel, logOutput)
			}

			// Validate standard fields
			if !strings.Contains(logOutput, "method=GET") {
				t.Errorf("Expected method=GET in log output, got: %s", logOutput)
			}
			if !strings.Contains(logOutput, "path=/test-path") {
				t.Errorf("Expected path=/test-path in log output, got: %s", logOutput)
			}
			statusStr := fmt.Sprintf("status=%d", tt.expectedStatus)
			if !strings.Contains(logOutput, statusStr) {
				t.Errorf("Expected %s in log output, got: %s", statusStr, logOutput)
			}

			// Validate user context
			if tt.expectUser {
				if !strings.Contains(logOutput, "user_id=user-123") {
					t.Errorf("Expected user_id=user-123 in log output, got: %s", logOutput)
				}
				if !strings.Contains(logOutput, "email=test@example.com") {
					t.Errorf("Expected email=test@example.com in log output, got: %s", logOutput)
				}
			}

			// Validate error message
			if tt.expectErrorMsg != "" {
				if !strings.Contains(logOutput, tt.expectErrorMsg) {
					t.Errorf("Expected error message %q in log output, got: %s", tt.expectErrorMsg, logOutput)
				}
			}
		})
	}
}

