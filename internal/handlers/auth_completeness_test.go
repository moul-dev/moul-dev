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

func TestPasswordResetFlow(t *testing.T) {
	auth.InitJWT("test-jwt-secret-123456789-987654321-0")

	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware(dbConn))

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.POST("/api/moul/:name/auth-with-password", authHandler.AuthWithPassword)
	e.POST("/api/moul/:name/request-password-reset", authHandler.RequestPasswordReset)
	e.POST("/api/moul/:name/confirm-password-reset", authHandler.ConfirmPasswordReset)

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

	// 2. Create user record
	createUserPayload := map[string]interface{}{
		"username":        "resetuser",
		"email":           "reset@example.com",
		"password":        "OldPassword123",
		"passwordConfirm": "OldPassword123",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", createUserPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for user creation, got %d", resp.StatusCode)
	}

	// 3. Request password reset
	resetReqPayload := map[string]string{
		"email": "reset@example.com",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/request-password-reset", resetReqPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for request password reset, got %d", resp.StatusCode)
	}

	// Fetch resetToken from DB
	var record dbx.NullStringMap
	err = dbConn.Select("*").From("users").Where(dbx.HashExp{"email": "reset@example.com"}).One(&record)
	if err != nil {
		t.Fatalf("Failed to fetch user record after reset request: %v", err)
	}
	resetToken := record["resetToken"].String
	if resetToken == "" {
		t.Fatalf("Expected non-empty resetToken in DB")
	}

	// 4. Confirm password reset with new password
	confirmPayload := map[string]string{
		"token":           resetToken,
		"password":        "NewPassword123",
		"passwordConfirm": "NewPassword123",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/confirm-password-reset", confirmPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for confirm password reset, got %d", resp.StatusCode)
	}

	// 5. Authenticate with old password (should fail)
	oldAuthPayload := map[string]string{
		"identity": "reset@example.com",
		"password": "OldPassword123",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", oldAuthPayload, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request when logging in with old password, got %d", resp.StatusCode)
	}

	// 6. Authenticate with new password (should succeed)
	newAuthPayload := map[string]string{
		"identity": "reset@example.com",
		"password": "NewPassword123",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", newAuthPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK when logging in with new password, got %d", resp.StatusCode)
	}
}

func TestTokenRefreshAndLogoutFlow(t *testing.T) {
	auth.InitJWT("test-jwt-secret-123456789-987654321-0")

	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware(dbConn))

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.POST("/api/moul/:name/auth-with-password", authHandler.AuthWithPassword)
	e.POST("/api/moul/:name/refresh", authHandler.RefreshToken)
	e.POST("/api/moul/:name/logout", authHandler.Logout)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 1. Create auth collection with auth restriction rule
	createMoulPayload := schema.Moul{
		Name: "members",
		Type: "auth",
		Rules: schema.MoulRules{
			ListRule: "@request.auth.id != ''",
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createMoulPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for members moul creation, got %d", resp.StatusCode)
	}

	// 2. Create user record
	createUserPayload := map[string]interface{}{
		"username":        "member1",
		"email":           "member1@example.com",
		"password":        "MemberPass123",
		"passwordConfirm": "MemberPass123",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/members/records", createUserPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for user creation, got %d", resp.StatusCode)
	}

	// 3. Login
	loginPayload := map[string]string{
		"identity": "member1@example.com",
		"password": "MemberPass123",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/members/auth-with-password", loginPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for login, got %d", resp.StatusCode)
	}

	var authRes map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&authRes)
	token1, ok := authRes["token"].(string)
	if !ok || token1 == "" {
		t.Fatalf("Expected token in login response")
	}

	// Verify token1 works for listing records
	req, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/members/records", nil)
	req.Header.Set("Authorization", "Bearer "+token1)
	listResp, err := client.Do(req)
	if err != nil || listResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK using token1, got status %v", listResp.StatusCode)
	}

	// 4. Refresh token
	refreshReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/moul/members/refresh", nil)
	refreshReq.Header.Set("Authorization", "Bearer "+token1)
	refreshResp, err := client.Do(refreshReq)
	if err != nil || refreshResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for token refresh, got %v", refreshResp.StatusCode)
	}

	var refreshRes map[string]interface{}
	json.NewDecoder(refreshResp.Body).Decode(&refreshRes)
	token2, ok := refreshRes["token"].(string)
	if !ok || token2 == "" {
		t.Fatalf("Expected new token in refresh response")
	}

	// Old token1 should now be revoked and rejected on refresh endpoint
	req1Refresh, _ := http.NewRequest(http.MethodPost, server.URL+"/api/moul/members/refresh", nil)
	req1Refresh.Header.Set("Authorization", "Bearer "+token1)
	resp1Refresh, _ := client.Do(req1Refresh)
	if resp1Refresh.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized when refreshing with revoked token1, got %d", resp1Refresh.StatusCode)
	}

	// New token2 should work
	req2, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/members/records", nil)
	req2.Header.Set("Authorization", "Bearer "+token2)
	resp2, _ := client.Do(req2)
	if resp2.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK when using token2, got %d", resp2.StatusCode)
	}

	// 5. Logout using token2
	logoutReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/moul/members/logout", nil)
	logoutReq.Header.Set("Authorization", "Bearer "+token2)
	logoutResp, err := client.Do(logoutReq)
	if err != nil || logoutResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for logout, got %v", logoutResp.StatusCode)
	}

	// Token2 should now be revoked and rejected on refresh endpoint
	req2RefreshAfterLogout, _ := http.NewRequest(http.MethodPost, server.URL+"/api/moul/members/refresh", nil)
	req2RefreshAfterLogout.Header.Set("Authorization", "Bearer "+token2)
	resp2RefreshAfterLogout, _ := client.Do(req2RefreshAfterLogout)
	if resp2RefreshAfterLogout.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized when refreshing with token2 after logout, got %d", resp2RefreshAfterLogout.StatusCode)
	}
}
