package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
)

func TestPasskeyFlowsOptions(t *testing.T) {
	// Initialize JWT secret for testing
	auth.InitJWT("test-jwt-secret-123456789-987654321-0")

	// 1. Setup in-memory SQLite DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// 2. Setup Echo router
	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	// Register Routes
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:moulName/records", recordHandler.CreateRecord)
	e.POST("/api/moul/:moulName/passkey/register/options", authHandler.PasskeyRegisterOptions)
	e.POST("/api/moul/:moulName/passkey/signup/options", authHandler.PasskeySignupOptions)
	e.POST("/api/moul/:moulName/passkey/login/options", authHandler.PasskeyLoginOptions)

	// Start test HTTP server
	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 3. Create 'users' Auth Moul
	createUsersPayload := schema.Moul{
		Name: "users",
		Type: "auth",
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createUsersPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for users moul creation, got %d", resp.StatusCode)
	}

	// 4. Test Passkey Signup Options (Generates credentials creation options)
	signupPayload := map[string]string{
		"email": "passkeyuser@example.com",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/passkey/signup/options", signupPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for Passkey signup options request, got %d", resp.StatusCode)
	}

	var signupOptionsRes map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&signupOptionsRes); err != nil {
		t.Fatalf("Failed to parse options response: %v", err)
	}

	sessionToken, ok := signupOptionsRes["sessionToken"].(string)
	if !ok || sessionToken == "" {
		t.Errorf("Expected sessionToken in options response, got none")
	}

	options, ok := signupOptionsRes["options"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected WebAuthn options structure, got none")
	}

	publicKey, ok := options["publicKey"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected publicKey parameters in options, got none")
	}

	// Validate dynamic Relying Party ID is matched to our test HTTP client request host
	rp, ok := publicKey["rp"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected relying party config, got none")
	}
	if rp["name"] != "Moul Engine" {
		t.Errorf("Expected RP name to be 'Moul Engine', got %v", rp["name"])
	}

	// 5. Test Passkey Login Options for account with registered credentials
	// First, let's manually write a user with a mock credential inside the passkeys column
	mockCredsJSON := `[{"id":"Y3JlZDE","publicKey":"cHVia2V5MQ==","attestationType":"none","authenticator":{"aaguid":"","signCount":1}}]`
	userID := "users-123456"
	_, err = dbConn.Insert("users", dbx.Params{
		"id":         userID,
		"username":   "existingpasskeyuser",
		"email":      "existing@example.com",
		"passkeys":   mockCredsJSON,
		"created_at": "2026-07-02T12:00:00Z",
		"updated_at": "2026-07-02T12:00:00Z",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to seed user with mock passkeys: %v", err)
	}

	loginPayload := map[string]string{
		"identity": "existing@example.com",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/passkey/login/options", loginPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for Passkey login options request, got %d", resp.StatusCode)
	}

	var loginOptionsRes map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&loginOptionsRes); err != nil {
		t.Fatalf("Failed to parse login options response: %v", err)
	}

	loginSessionToken, ok := loginOptionsRes["sessionToken"].(string)
	if !ok || loginSessionToken == "" {
		t.Errorf("Expected login sessionToken in response, got none")
	}

	loginOptions, ok := loginOptionsRes["options"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected WebAuthn login options structure, got none")
	}

	loginPublicKey, ok := loginOptions["publicKey"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected publicKey parameters in login options, got none")
	}

	allowCredentials, ok := loginPublicKey["allowCredentials"].([]interface{})
	if !ok || len(allowCredentials) != 1 {
		t.Errorf("Expected user's registered credential in allowCredentials list, got: %v", allowCredentials)
	}
}
