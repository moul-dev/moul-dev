package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestEmailSettingsAndUpdate(t *testing.T) {
	adminKey := "test-admin-key"
	auth.InitJWT("test-jwt-secret")

	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize memory DB: %v", err)
	}
	defer dbConn.Close()

	analyticsEngine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("Failed to initialize analytics: %v", err)
	}
	defer analyticsEngine.Close()

	mailService, err := mailer.NewMailer(dbConn)
	if err != nil {
		t.Fatalf("Failed to initialize mailer: %v", err)
	}

	e := handlers.NewRouter(dbConn, nil, analyticsEngine, mailService, nil, adminKey, true)
	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 1. Get default settings
	req, _ := http.NewRequest("GET", server.URL+"/api/settings", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to get settings: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", resp.StatusCode)
	}

	var settings map[string]string
	json.NewDecoder(resp.Body).Decode(&settings)
	resp.Body.Close()

	if settings["email_enabled"] != "false" || settings["email_provider"] != "console" {
		t.Errorf("Unexpected default email settings: %+v", settings)
	}

	// 2. Update settings via PATCH
	patchBody, _ := json.Marshal(map[string]string{
		"email_enabled":      "true",
		"email_provider":     "resend",
		"email_from_address": "noreply@moul.dev",
		"email_from_name":    "Moul Dev Team",
		"email_api_key":      "re_test_key_123",
	})

	req, _ = http.NewRequest("PATCH", server.URL+"/api/settings", bytes.NewReader(patchBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)

	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to update settings: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200 on PATCH, got %d", resp.StatusCode)
	}

	json.NewDecoder(resp.Body).Decode(&settings)
	resp.Body.Close()

	if settings["email_enabled"] != "true" || settings["email_provider"] != "resend" || settings["email_from_address"] != "noreply@moul.dev" {
		t.Errorf("Updated settings mismatch: %+v", settings)
	}

	if mailService.ProviderName() != "resend" {
		t.Errorf("Expected mailer provider 'resend', got '%s'", mailService.ProviderName())
	}
}

func TestSendTestEmailHandler(t *testing.T) {
	adminKey := "test-admin-key"
	auth.InitJWT("test-jwt-secret")

	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize memory DB: %v", err)
	}
	defer dbConn.Close()

	// Create test auth moul
	moul := schema.Moul{
		ID:        "auth-moul-1",
		Name:      "users",
		Type:      "auth",
		Fields:    []schema.MoulField{},
		Rules:     schema.MoulRules{},
		CreatedAt: "2026-07-27T12:00:00Z",
		UpdatedAt: "2026-07-27T12:00:00Z",
	}

	fieldsJSON, _ := moul.SerializeFields()
	rulesJSON, _ := moul.SerializeRules()

	_, err = dbConn.Insert("_moul", map[string]interface{}{
		"id":         moul.ID,
		"name":       moul.Name,
		"type":       moul.Type,
		"fields":     fieldsJSON,
		"rules":      rulesJSON,
		"created_at": moul.CreatedAt,
		"updated_at": moul.UpdatedAt,
	}).Execute()

	if err != nil {
		t.Fatalf("Failed to insert auth moul: %v", err)
	}

	analyticsEngine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("Failed to initialize analytics: %v", err)
	}
	defer analyticsEngine.Close()

	mailService, err := mailer.NewMailer(dbConn)
	if err != nil {
		t.Fatalf("Failed to initialize mailer: %v", err)
	}

	e := handlers.NewRouter(dbConn, nil, analyticsEngine, mailService, nil, adminKey, true)
	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// Send test email
	payload, _ := json.Marshal(map[string]string{
		"email":    "testrecipient@example.com",
		"template": "otp",
	})

	req, _ := http.NewRequest("POST", server.URL+"/api/moul/users/email-templates/test", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to send test email request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for test email send, got %d", resp.StatusCode)
	}
	resp.Body.Close()
}
