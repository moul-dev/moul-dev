package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
)

func TestDeviceFlowIntegration(t *testing.T) {
	// Initialize JWT
	auth.InitJWT("test-secret-key-device-flow-tests")

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
	deviceFlowHandler := handlers.NewDeviceFlowHandler(dbConn)

	e.POST("/api/mouls", moulHandler.CreateMoul)
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)

	e.POST("/api/oauth2/device/authorize", deviceFlowHandler.DeviceAuthorize)
	e.POST("/api/oauth2/device/token", deviceFlowHandler.DeviceToken)
	e.GET("/device", deviceFlowHandler.RenderDeviceForm)
	e.POST("/device/verify", deviceFlowHandler.VerifyDevice)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// --- STEP 1: Create 'users' Auth Moul ---
	moulPayload := `{"name":"users","type":"auth","fields":[]}`
	req, _ := http.NewRequest("POST", server.URL+"/api/mouls", bytes.NewBufferString(moulPayload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil || (resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated) {
		t.Fatalf("Failed to create auth moul: status=%d, err=%v", resp.StatusCode, err)
	}

	// --- STEP 2: Create a user record (username=admin, password=AdminPass123) ---
	userPayload := `{"username":"admin","email":"admin@example.com","password":"AdminPass123","passwordConfirm":"AdminPass123"}`
	req, _ = http.NewRequest("POST", server.URL+"/api/mouls/users/records", bytes.NewBufferString(userPayload))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to sign up user: status=%d, err=%v", resp.StatusCode, err)
	}

	// --- STEP 3: Request Device Authorization ---
	authPayload := `{"client_id":"moul-tui"}`
	req, _ = http.NewRequest("POST", server.URL+"/api/oauth2/device/authorize", bytes.NewBufferString(authPayload))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Device authorize request failed: status=%d, err=%v", resp.StatusCode, err)
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	var authResp struct {
		DeviceCode      string `json:"device_code"`
		UserCode        string `json:"user_code"`
		VerificationURI string `json:"verification_uri"`
	}
	if err := json.Unmarshal(bodyBytes, &authResp); err != nil {
		t.Fatalf("Failed to parse authorize response: %v", err)
	}

	if authResp.DeviceCode == "" || authResp.UserCode == "" {
		t.Fatal("Expected device_code and user_code to be returned")
	}

	// --- STEP 4: Poll token endpoint (should be pending) ---
	tokenPayload := map[string]string{
		"grant_type":  "urn:ietf:params:oauth:grant-type:device_code",
		"device_code": authResp.DeviceCode,
		"client_id":   "moul-tui",
	}
	tokenJSON, _ := json.Marshal(tokenPayload)
	req, _ = http.NewRequest("POST", server.URL+"/api/oauth2/device/token", bytes.NewBuffer(tokenJSON))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected token poll to fail: status=%d, err=%v", resp.StatusCode, err)
	}
	bodyBytes, _ = io.ReadAll(resp.Body)
	var errResp struct {
		Error string `json:"error"`
	}
	json.Unmarshal(bodyBytes, &errResp)
	if errResp.Error != "authorization_pending" {
		t.Errorf("Expected authorization_pending, got %q", errResp.Error)
	}

	// --- STEP 5: Render verification form ---
	req, _ = http.NewRequest("GET", server.URL+"/device?user_code="+authResp.UserCode, nil)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to render device page: status=%d, err=%v", resp.StatusCode, err)
	}

	// --- STEP 6: Verify device (Post credentials to verify endpoint) ---
	form := url.Values{}
	form.Add("user_code", authResp.UserCode)
	form.Add("auth_moul", "users")
	form.Add("identity", "admin@example.com")
	form.Add("password", "AdminPass123")

	req, _ = http.NewRequest("POST", server.URL+"/device/verify", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Device verification form post failed: status=%d, err=%v", resp.StatusCode, err)
	}
	bodyBytes, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(bodyBytes), "Device Authorized") {
		t.Error("Expected success page response showing 'Device Authorized'")
	}

	// --- STEP 7: Poll token endpoint again (should return JWT token) ---
	req, _ = http.NewRequest("POST", server.URL+"/api/oauth2/device/token", bytes.NewBuffer(tokenJSON))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Token poll failed after approval: status=%d, err=%v", resp.StatusCode, err)
	}
	bodyBytes, _ = io.ReadAll(resp.Body)
	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenResp); err != nil {
		t.Fatalf("Failed to parse token response: %v", err)
	}
	if tokenResp.AccessToken == "" || tokenResp.TokenType != "Bearer" {
		t.Errorf("Expected valid Bearer token, got token=%q, type=%q", tokenResp.AccessToken, tokenResp.TokenType)
	}

	// Verify the JWT token is valid
	claims, err := auth.VerifyToken(tokenResp.AccessToken)
	if err != nil {
		t.Fatalf("Failed to verify generated token: %v", err)
	}
	if claims.Username != "admin" || claims.MoulName != "users" {
		t.Errorf("Claims mismatch, username=%q, moul=%q", claims.Username, claims.MoulName)
	}
}
