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

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"

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

	// --- STEP 1 & 2: Seed a user into _rootUsers table ---
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("AdminPass123"), bcrypt.DefaultCost)
	_, err = dbConn.Insert("_rootUsers", dbx.Params{
		"id":           "rootuser12345",
		"username":     "admin",
		"email":        "admin@example.com",
		"passwordHash": string(hashedPassword),
		"created_at":   "2026-06-28T00:00:00Z",
		"updated_at":   "2026-06-28T00:00:00Z",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to seed root user: %v", err)
	}

	// --- STEP 3: Request Device Authorization ---
	authPayload := `{"client_id":"moul-tui"}`
	req, _ := http.NewRequest("POST", server.URL+"/api/oauth2/device/authorize", bytes.NewBufferString(authPayload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
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
	// 5.1 Render with invalid auth_moul (should fail)
	req, _ = http.NewRequest("GET", server.URL+"/device?user_code="+authResp.UserCode+"&auth_moul=users", nil)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request rendering with non-root auth_moul, got status=%d, err=%v", resp.StatusCode, err)
	}
	bodyBytes, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(bodyBytes), "Device authorization is only supported for the root account") {
		t.Error("Expected error message 'Device authorization is only supported for the root account'")
	}

	// 5.2 Render with valid/empty auth_moul (should succeed)
	req, _ = http.NewRequest("GET", server.URL+"/device?user_code="+authResp.UserCode, nil)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to render device page: status=%d, err=%v", resp.StatusCode, err)
	}

	// --- STEP 6: Verify device (Post credentials to verify endpoint) ---
	// 6.1 Verify with invalid auth_moul (should fail)
	invalidForm := url.Values{}
	invalidForm.Add("user_code", authResp.UserCode)
	invalidForm.Add("auth_moul", "users")
	invalidForm.Add("identity", "admin@example.com")
	invalidForm.Add("password", "AdminPass123")
	req, _ = http.NewRequest("POST", server.URL+"/device/verify", strings.NewReader(invalidForm.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request verifying with non-root auth_moul, got status=%d, err=%v", resp.StatusCode, err)
	}
	bodyBytes, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(bodyBytes), "Device authorization is only supported for the root account") {
		t.Error("Expected error message 'Device authorization is only supported for the root account' on verify")
	}

	// 6.2 Verify with valid root auth_moul (should succeed)
	form := url.Values{}
	form.Add("user_code", authResp.UserCode)
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
	if claims.Username != "admin" || claims.MoulName != "_rootUsers" {
		t.Errorf("Claims mismatch, username=%q, moul=%q", claims.Username, claims.MoulName)
	}
}

func TestDeviceFlowIPBlocking(t *testing.T) {
	// Initialize JWT
	auth.InitJWT("test-secret-key-device-flow-tests-ip")

	// 1. Setup in-memory SQLite DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Enable IP restrictions for test
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "true"}, dbx.HashExp{"key": "root_user_ip_enabled"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "127.0.0.1"}, dbx.HashExp{"key": "root_user_allowed_ips"}).Execute()

	// 2. Setup Echo router
	e := echo.New()
	e.IPExtractor = echo.LegacyIPExtractor()
	deviceFlowHandler := handlers.NewDeviceFlowHandler(dbConn)

	e.POST("/api/oauth2/device/authorize", deviceFlowHandler.DeviceAuthorize)
	e.POST("/device/verify", deviceFlowHandler.VerifyDevice)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// Seed root user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("AdminPass123"), bcrypt.DefaultCost)
	_, err = dbConn.Insert("_rootUsers", dbx.Params{
		"id":           "rootuser12345",
		"username":     "admin",
		"email":        "admin@example.com",
		"passwordHash": string(hashedPassword),
		"created_at":   "2026-06-28T00:00:00Z",
		"updated_at":   "2026-06-28T00:00:00Z",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to seed root user: %v", err)
	}

	// --- STEP 1: Request Device Authorization ---
	authPayload := `{"client_id":"moul-tui"}`
	req, _ := http.NewRequest("POST", server.URL+"/api/oauth2/device/authorize", bytes.NewBufferString(authPayload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Device authorize request failed: status=%d, err=%v", resp.StatusCode, err)
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	var authResp struct {
		UserCode string `json:"user_code"`
	}
	json.Unmarshal(bodyBytes, &authResp)

	// --- STEP 2: Verify device from DISALLOWED client IP ---
	form := url.Values{}
	form.Add("user_code", authResp.UserCode)
	form.Add("identity", "admin@example.com")
	form.Add("password", "AdminPass123")

	req, _ = http.NewRequest("POST", server.URL+"/device/verify", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	// Spoof/simulate disallowed remote address
	req.Header.Set("X-Real-IP", "192.168.1.50")

	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected Bad Request (IP blocked), got status=%d", resp.StatusCode)
	}

	bodyBytes, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(bodyBytes), "Your IP address is not authorized to log in as a root user") {
		t.Errorf("Expected IP authorization error message in response body, got:\n%s", string(bodyBytes))
	}

	// --- STEP 3: Verify device from ALLOWED client IP (127.0.0.1) ---
	req, _ = http.NewRequest("POST", server.URL+"/device/verify", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-Real-IP", "127.0.0.1")

	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected OK (IP allowed), got status=%d, err=%v", resp.StatusCode, err)
	}

	bodyBytes, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(bodyBytes), "Device Authorized") {
		t.Error("Expected success page response showing 'Device Authorized'")
	}
}
