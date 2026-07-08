package handlers_test

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
)

func TestEmailOTPAuthFlow(t *testing.T) {
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
	e.POST("/api/mouls", moulHandler.CreateMoul)
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.POST("/api/mouls/:moulName/otp/request", authHandler.RequestOTP)
	e.POST("/api/mouls/:moulName/auth-with-otp", authHandler.AuthWithOTP)

	// Start test HTTP server
	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 3. Create 'users' Auth Moul
	createUsersPayload := schema.Moul{
		Name: "users",
		Type: "auth",
	}
	resp := postJSON(t, client, server.URL+"/api/mouls", createUsersPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for users moul creation, got %d", resp.StatusCode)
	}

	// 4. Request OTP (should trigger auto-signup since email doesn't exist)
	reqEmail := "newuser@example.com"
	requestPayload := map[string]string{
		"email": reqEmail,
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/otp/request", requestPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for OTP request, got %d", resp.StatusCode)
	}

	// 5. Query the database to retrieve the generated OTP code (since we are testing locally)
	var otpCode sql.NullString
	err = dbConn.Select("otpCode").From("users").Where(dbx.HashExp{"email": reqEmail}).Row(&otpCode)
	if err != nil {
		t.Fatalf("Failed to fetch generated OTP code from database: %v", err)
	}
	if !otpCode.Valid || otpCode.String == "" {
		t.Fatalf("Expected valid OTP code to be saved in db, got invalid/empty")
	}

	// 6. Verify OTP with incorrect code
	verifyBadPayload := map[string]string{
		"email": reqEmail,
		"code":  "000000",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-otp", verifyBadPayload, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for incorrect OTP verification, got %d", resp.StatusCode)
	}

	// 7. Verify OTP with correct code
	verifyGoodPayload := map[string]string{
		"email": reqEmail,
		"code":  otpCode.String,
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-otp", verifyGoodPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for correct OTP verification, got %d", resp.StatusCode)
	}

	var authResponse map[string]interface{}
	dec := json.NewDecoder(resp.Body)
	if err := dec.Decode(&authResponse); err != nil {
		t.Fatalf("Failed to decode auth response: %v", err)
	}

	token, ok := authResponse["token"].(string)
	if !ok || token == "" {
		t.Errorf("Expected signed JWT token in response, got none or invalid")
	}

	record, ok := authResponse["record"].(map[string]interface{})
	if !ok {
		t.Fatalf("Expected user record in response, got none")
	}

	if record["email"] != reqEmail {
		t.Errorf("Expected user email %s, got %v", reqEmail, record["email"])
	}

	// Check that username was generated from email prefix
	if !strings.HasPrefix(record["username"].(string), "newuser") {
		t.Errorf("Expected username to start with 'newuser', got %v", record["username"])
	}

	// Check that passwordHash, otpCode, and otpExpiresAt are sanitized and NOT returned in the record
	if _, exists := record["passwordHash"]; exists {
		t.Errorf("Expected passwordHash to be deleted from response record")
	}
	if _, exists := record["otpCode"]; exists {
		t.Errorf("Expected otpCode to be deleted from response record")
	}
	if _, exists := record["otpExpiresAt"]; exists {
		t.Errorf("Expected otpExpiresAt to be deleted from response record")
	}

	// 8. Ensure OTP fields in database were cleared after verification
	var clearedOtp sql.NullString
	_ = dbConn.Select("otpCode").From("users").Where(dbx.HashExp{"email": reqEmail}).Row(&clearedOtp)
	if clearedOtp.Valid && clearedOtp.String != "" {
		t.Errorf("Expected OTP code in DB to be cleared after successful verification, got %s", clearedOtp.String)
	}
}

