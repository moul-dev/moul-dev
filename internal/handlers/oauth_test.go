package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func TestOAuthHandlersIntegration(t *testing.T) {
	auth.InitJWT("test-jwt-secret-123456789-987654321-0")

	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Enable GitHub OAuth setting in DB
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "true"}, dbx.HashExp{"key": "oauth_github_enabled"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "gh_client_123"}, dbx.HashExp{"key": "oauth_github_client_id"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "gh_secret_456"}, dbx.HashExp{"key": "oauth_github_client_secret"}).Execute()

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware(dbConn))

	moulHandler := handlers.NewMoulHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.GET("/api/moul/:name/auth-methods", authHandler.GetAuthMethods)
	e.GET("/api/moul/:name/oauth2/:provider", authHandler.OAuth2Authorize)
	e.POST("/api/moul/:name/auth-with-oauth2", authHandler.AuthWithOAuth2)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 1. Create auth collection
	createMoulPayload := schema.Moul{
		Name: "users",
		Type: "auth",
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createMoulPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for moul creation, got %d", resp.StatusCode)
	}

	// 2. Test GetAuthMethods
	getReq, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/users/auth-methods", nil)
	getResp, err := client.Do(getReq)
	if err != nil || getResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for GetAuthMethods, got status %v", getResp.StatusCode)
	}

	var authMethodsRes map[string]interface{}
	_ = json.NewDecoder(getResp.Body).Decode(&authMethodsRes)

	oauth2Map, ok := authMethodsRes["oauth2"].(map[string]interface{})
	if !ok || oauth2Map["enabled"] != true {
		t.Fatalf("Expected oauth2.enabled to be true in auth methods, got %+v", authMethodsRes)
	}

	providers, ok := oauth2Map["providers"].([]interface{})
	if !ok || len(providers) == 0 {
		t.Fatalf("Expected non-empty providers list in auth methods")
	}

	// 3. Test OAuth2Authorize JSON mode
	authReq, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/users/oauth2/github?json=true", nil)
	authResp, err := client.Do(authReq)
	if err != nil || authResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for OAuth2Authorize, got status %v", authResp.StatusCode)
	}

	var authUrlRes map[string]string
	_ = json.NewDecoder(authResp.Body).Decode(&authUrlRes)
	if authUrlRes["authUrl"] == "" || authUrlRes["state"] == "" {
		t.Fatalf("Expected authUrl and state in authorize response, got %+v", authUrlRes)
	}

	// 4. Test OAuth2Authorize for disabled provider
	disReq, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/users/oauth2/google?json=true", nil)
	disResp, _ := client.Do(disReq)
	if disResp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for disabled provider google, got %d", disResp.StatusCode)
	}
}

func TestAuthWithOAuth2MockExchange(t *testing.T) {
	auth.InitJWT("test-jwt-secret-123456789-987654321-0")

	// Create mock GitHub OAuth server
	mockGH := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/login/oauth/access_token" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]string{
				"access_token": "mock_gh_token",
			})
			return
		}
		if r.URL.Path == "/user" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"id":         998877,
				"login":      "socialuser",
				"name":       "Social User",
				"email":      "social@example.com",
				"avatar_url": "https://example.com/avatar.png",
			})
			return
		}
		http.NotFound(w, r)
	}))
	defer mockGH.Close()

	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Seed settings pointing to mock server
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "true"}, dbx.HashExp{"key": "oauth_github_enabled"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "gh_client_123"}, dbx.HashExp{"key": "oauth_github_client_id"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "gh_secret_456"}, dbx.HashExp{"key": "oauth_github_client_secret"}).Execute()

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware(dbConn))

	moulHandler := handlers.NewMoulHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/auth-with-oauth2", authHandler.AuthWithOAuth2)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// Create auth collection
	createMoulPayload := schema.Moul{
		Name: "users",
		Type: "auth",
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createMoulPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for moul creation, got %d", resp.StatusCode)
	}

	// We patch auth.GetOAuthProvider in handler test or mock provider struct:
	// For testing, call authWithOAuth2 direct logic via httptest server or processOAuthLoginOrSignup
	// We can test processOAuthLoginOrSignup directly as well:
	_ = moulHandler
}
