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

func TestSetupFlow(t *testing.T) {
	// Initialize JWT
	auth.InitJWT("test-secret-key-setup-tests")

	// 1. Setup in-memory SQLite DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// 2. Setup Echo router
	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	setupHandler := handlers.NewSetupHandler(dbConn)
	deviceFlowHandler := handlers.NewDeviceFlowHandler(dbConn)

	adminKey := "test-admin-key"
	adminGroup := e.Group("/api/setup", middleware.RequireAdminKey(adminKey))
	adminGroup.GET("", setupHandler.CheckSetupStatus)
	adminGroup.POST("", setupHandler.SetupRootUser)

	e.POST("/api/oauth2/device/authorize", deviceFlowHandler.DeviceAuthorize)
	e.POST("/api/oauth2/device/token", deviceFlowHandler.DeviceToken)
	e.GET("/device", deviceFlowHandler.RenderDeviceForm)
	e.POST("/device/verify", deviceFlowHandler.VerifyDevice)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 1. GET /api/setup - Should return needsSetup: true
	req, _ := http.NewRequest("GET", server.URL+"/api/setup", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("GET /api/setup failed: status=%d, err=%v", resp.StatusCode, err)
	}
	var statusResp struct {
		NeedsSetup bool `json:"needsSetup"`
	}
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &statusResp)
	if !statusResp.NeedsSetup {
		t.Error("Expected NeedsSetup to be true initially")
	}

	// 2. POST /api/setup - Invalid payload (missing password)
	invalidPayload := `{"username":"root","email":"root@moul.dev"}`
	req, _ = http.NewRequest("POST", server.URL+"/api/setup", bytes.NewBufferString(invalidPayload))
	req.Header.Set("X-Admin-Key", adminKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected bad request on invalid setup payload: status=%d, err=%v", resp.StatusCode, err)
	}

	// 3. POST /api/setup - Success creation
	validPayload := `{"username":"root","email":"root@moul.dev","password":"supersecretpassword"}`
	req, _ = http.NewRequest("POST", server.URL+"/api/setup", bytes.NewBufferString(validPayload))
	req.Header.Set("X-Admin-Key", adminKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("POST /api/setup failed: status=%d, err=%v", resp.StatusCode, err)
	}

	// 4. GET /api/setup - Should return needsSetup: false now
	req, _ = http.NewRequest("GET", server.URL+"/api/setup", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("GET /api/setup failed: status=%d, err=%v", resp.StatusCode, err)
	}
	body, _ = io.ReadAll(resp.Body)
	json.Unmarshal(body, &statusResp)
	if statusResp.NeedsSetup {
		t.Error("Expected NeedsSetup to be false after setup complete")
	}

	// 5. POST /api/setup - Should return error (setup already done)
	req, _ = http.NewRequest("POST", server.URL+"/api/setup", bytes.NewBufferString(validPayload))
	req.Header.Set("X-Admin-Key", adminKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected bad request on secondary setup attempt: status=%d, err=%v", resp.StatusCode, err)
	}

	// 6. Test device authorization verification against the root user we created
	// Request device auth
	authPayload := `{"client_id":"moul-tui"}`
	req, _ = http.NewRequest("POST", server.URL+"/api/oauth2/device/authorize", bytes.NewBufferString(authPayload))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Device auth request failed: status=%d, err=%v", resp.StatusCode, err)
	}
	body, _ = io.ReadAll(resp.Body)
	var authResp struct {
		DeviceCode string `json:"device_code"`
		UserCode   string `json:"user_code"`
	}
	json.Unmarshal(body, &authResp)

	// Post credentials to verify endpoint
	form := url.Values{}
	form.Add("user_code", authResp.UserCode)
	form.Add("identity", "root")
	form.Add("password", "supersecretpassword")

	req, _ = http.NewRequest("POST", server.URL+"/device/verify", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Device verification failed: status=%d, err=%v", resp.StatusCode, err)
	}
	body, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "Device Authorized") {
		t.Error("Expected page to show 'Device Authorized'")
	}
}
