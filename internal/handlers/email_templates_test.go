package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func doRequest(client *http.Client, method, url string, body interface{}, adminKey string) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(jsonData)
	}
	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if adminKey != "" {
		req.Header.Set("X-Admin-Key", adminKey)
	}
	return client.Do(req)
}

func TestEmailTemplates(t *testing.T) {
	// Initialize JWT secret
	auth.InitJWT("test-jwt-secret-123456789-987654321-0")

	// 1. Setup DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// 2. Setup router
	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	// Admin routes
	adminKey := "super-admin-key"
	adminGroup := e.Group("/api/moul", middleware.RequireAdminKey(adminKey))
	adminGroup.POST("", moulHandler.CreateMoul)
	adminGroup.GET("/:moulName/email-templates", authHandler.GetEmailTemplates)
	adminGroup.PUT("/:moulName/email-templates", authHandler.UpdateEmailTemplates)
	adminGroup.POST("/:moulName/email-templates/test", authHandler.SendTestEmail)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 3. Create 'users' Auth collection
	usersMoul := schema.Moul{
		Name: "users",
		Type: "auth",
	}
	resp, err := doRequest(client, "POST", server.URL+"/api/moul", usersMoul, adminKey)
	if err != nil {
		t.Fatalf("Create users request failed: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create users collection: %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 4. Create 'posts' Base (non-auth) collection
	postsMoul := schema.Moul{
		Name: "posts",
		Type: "base",
	}
	resp, err = doRequest(client, "POST", server.URL+"/api/moul", postsMoul, adminKey)
	if err != nil {
		t.Fatalf("Create posts request failed: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create posts collection: %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 5. Get default templates for users (auth)
	resp, err = doRequest(client, "GET", server.URL+"/api/moul/users/email-templates", nil, adminKey)
	if err != nil {
		t.Fatalf("GET templates failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for GET templates, got %d", resp.StatusCode)
	}

	var fetchedTemplates schema.EmailTemplates
	if err := json.NewDecoder(resp.Body).Decode(&fetchedTemplates); err != nil {
		t.Fatalf("Failed to decode templates response: %v", err)
	}
	resp.Body.Close()

	// Verify defaults
	if fetchedTemplates.OTP.Subject != "Your OTP Code" {
		t.Errorf("Expected default OTP subject 'Your OTP Code', got '%s'", fetchedTemplates.OTP.Subject)
	}

	// 6. Get templates for posts (non-auth) - should fail
	resp, err = doRequest(client, "GET", server.URL+"/api/moul/posts/email-templates", nil, adminKey)
	if err != nil {
		t.Fatalf("GET non-auth templates failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for non-auth templates, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 7. Update templates for users (auth)
	updatedTemplates := fetchedTemplates
	updatedTemplates.OTP.Subject = "New Custom OTP Subject"
	updatedTemplates.OTP.Body = "Custom OTP is {{.OTP}}"

	resp, err = doRequest(client, "PUT", server.URL+"/api/moul/users/email-templates", updatedTemplates, adminKey)
	if err != nil {
		t.Fatalf("PUT templates failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for PUT templates, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 8. Re-fetch templates to confirm they updated
	resp, err = doRequest(client, "GET", server.URL+"/api/moul/users/email-templates", nil, adminKey)
	if err != nil {
		t.Fatalf("GET updated templates failed: %v", err)
	}
	var reFetchedTemplates schema.EmailTemplates
	if err := json.NewDecoder(resp.Body).Decode(&reFetchedTemplates); err != nil {
		t.Fatalf("Failed to decode re-fetched templates: %v", err)
	}
	resp.Body.Close()

	if reFetchedTemplates.OTP.Subject != "New Custom OTP Subject" {
		t.Errorf("Expected updated OTP subject 'New Custom OTP Subject', got '%s'", reFetchedTemplates.OTP.Subject)
	}
	if reFetchedTemplates.OTP.Body != "Custom OTP is {{.OTP}}" {
		t.Errorf("Expected updated OTP body 'Custom OTP is {{.OTP}}', got '%s'", reFetchedTemplates.OTP.Body)
	}

	// 9. Send test email
	testPayload := map[string]string{
		"email":    "test@example.com",
		"template": "otp",
	}
	resp, err = doRequest(client, "POST", server.URL+"/api/moul/users/email-templates/test", testPayload, adminKey)
	if err != nil {
		t.Fatalf("POST test email failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for test email, got %d", resp.StatusCode)
	}
	resp.Body.Close()
}
