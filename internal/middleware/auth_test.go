package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func TestLoadAuthContextMiddleware(t *testing.T) {
	// Initialize JWT for testing
	auth.InitJWT("test-secret-key-for-unit-tests-1234")

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
			h := LoadAuthContextMiddleware()(func(ctx *echo.Context) error {
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

func TestLoadAuthContextMiddlewareIPBlocking(t *testing.T) {
	// Initialize JWT for testing
	auth.InitJWT("test-secret-key-for-unit-tests-1234")

	e := echo.New()

	// Generate a valid root user token
	rootToken, err := auth.GenerateToken("root-1", "root@moul.dev", "root", "_rootUsers")
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	// Helper to set/reset mock DB/settings
	mockDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init DB: %v", err)
	}
	defer mockDB.Close()

	// Enable IP restrictions for test
	_, _ = mockDB.Update("_settings", dbx.Params{"value": "true"}, dbx.HashExp{"key": "root_user_ip_enabled"}).Execute()
	_, _ = mockDB.Update("_settings", dbx.Params{"value": "127.0.0.1, 10.0.0.0/24"}, dbx.HashExp{"key": "root_user_allowed_ips"}).Execute()

	err = InitRootIPs(mockDB)
	if err != nil {
		t.Fatalf("Failed to load root IPs: %v", err)
	}

	tests := []struct {
		name          string
		clientIP      string
		token         string
		expectedCode  int
		shouldSucceed bool
	}{
		{
			name:          "Allowed exact IP",
			clientIP:      "127.0.0.1",
			token:         rootToken,
			shouldSucceed: true,
		},
		{
			name:          "Allowed CIDR IP",
			clientIP:      "10.0.0.5",
			token:         rootToken,
			shouldSucceed: true,
		},
		{
			name:          "Disallowed IP",
			clientIP:      "192.168.1.1",
			token:         rootToken,
			expectedCode:  http.StatusForbidden,
			shouldSucceed: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			req.Header.Set("Authorization", "Bearer "+tt.token)
			// Mock client IP
			req.RemoteAddr = tt.clientIP + ":12345"

			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handlerCalled := false
			h := LoadAuthContextMiddleware()(func(ctx *echo.Context) error {
				handlerCalled = true
				return nil
			})

			err := h(c)
			if tt.shouldSucceed {
				if err != nil {
					t.Errorf("Expected request to succeed, but got error: %v", err)
				}
				if !handlerCalled {
					t.Error("Expected next handler to be called")
				}
			} else {
				if err == nil {
					t.Error("Expected error but got nil")
				} else {
					he, ok := err.(*echo.HTTPError)
					if !ok {
						t.Errorf("Expected echo.HTTPError, got %T", err)
					} else if he.Code != tt.expectedCode {
						t.Errorf("Expected status code %d, got %d", tt.expectedCode, he.Code)
					}
				}
				if handlerCalled {
					t.Error("Expected next handler NOT to be called")
				}
			}
		})
	}
}
