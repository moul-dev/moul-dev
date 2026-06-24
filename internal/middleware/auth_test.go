package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/moul-dev/moul-dev/internal/auth"
)

func TestLoadAuthContextMiddleware(t *testing.T) {
	e := echo.New()

	// Generate a valid token for testing
	validToken, err := auth.GenerateToken("user-1", "user@example.com", "username1", "users")
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	tests := []struct {
		name          string
		authHeader    string
		expectedAuth  map[string]interface{}
		shouldSucceed bool
	}{
		{
			name:         "No Authorization Header",
			authHeader:   "",
			expectedAuth: nil,
		},
		{
			name:         "Malformed Authorization Header (No Bearer)",
			authHeader:   "Token abc",
			expectedAuth: nil,
		},
		{
			name:         "Malformed Authorization Header (Too many parts)",
			authHeader:   "Bearer abc 123",
			expectedAuth: nil,
		},
		{
			name:         "Invalid Token",
			authHeader:   "Bearer invalid-token",
			expectedAuth: nil,
		},
		{
			name:       "Valid Token",
			authHeader: "Bearer " + validToken,
			expectedAuth: map[string]interface{}{
				"id":       "user-1",
				"email":    "user@example.com",
				"username": "username1",
				"moul":     "users",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handlerCalled := false
			h := LoadAuthContextMiddleware()(func(ctx echo.Context) error {
				handlerCalled = true
				// Verify context state
				record := GetAuthRecord(ctx)
				if tt.expectedAuth == nil {
					if record != nil {
						t.Errorf("Expected nil auth record, got: %v", record)
					}
				} else {
					if record == nil {
						t.Error("Expected non-nil auth record, got nil")
					} else {
						if record["id"] != tt.expectedAuth["id"] ||
							record["email"] != tt.expectedAuth["email"] ||
							record["username"] != tt.expectedAuth["username"] ||
							record["moul"] != tt.expectedAuth["moul"] {
							t.Errorf("Expected auth record %v, got %v", tt.expectedAuth, record)
						}
					}
				}
				return nil
			})

			err := h(c)
			if err != nil {
				t.Fatalf("Middleware handler returned error: %v", err)
			}
			if !handlerCalled {
				t.Error("Expected next handler to be called")
			}
		})
	}
}

func TestGetAuthRecordInvalidTypes(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Case 1: Key not in context
	if record := GetAuthRecord(c); record != nil {
		t.Errorf("Expected nil, got %v", record)
	}

	// Case 2: Value is not map[string]interface{}
	c.Set(AuthContextKey, "invalid-type-string")
	if record := GetAuthRecord(c); record != nil {
		t.Errorf("Expected nil when type is incorrect, got %v", record)
	}
}
