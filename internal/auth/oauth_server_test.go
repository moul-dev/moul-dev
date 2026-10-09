package auth_test

import (
	"crypto/sha256"
	"encoding/base64"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/auth"
)

func TestOAuthStoreClientRegistration(t *testing.T) {
	store := auth.NewOAuthStore()

	client, err := store.RegisterClient("Gemini MCP", []string{"https://vertexaisearch.cloud.google.com/oauth-redirect"}, nil, nil, "")
	if err != nil {
		t.Fatalf("RegisterClient failed: %v", err)
	}

	if client.ClientID == "" || client.ClientSecret == "" {
		t.Fatalf("Expected non-empty client ID and secret, got id=%s, secret=%s", client.ClientID, client.ClientSecret)
	}
	if client.ClientName != "Gemini MCP" {
		t.Errorf("Expected client name 'Gemini MCP', got '%s'", client.ClientName)
	}

	fetched, ok := store.GetClient(client.ClientID)
	if !ok || fetched.ClientID != client.ClientID {
		t.Fatalf("Failed to fetch registered client from store")
	}
}

func TestOAuthStoreAuthorizationCodeAndPKCE(t *testing.T) {
	store := auth.NewOAuthStore()

	client, err := store.RegisterClient("TestClient", []string{"https://example.com/callback"}, nil, nil, "")
	if err != nil {
		t.Fatalf("RegisterClient failed: %v", err)
	}

	verifier := "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
	h := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(h[:])

	authCode, err := store.CreateAuthorizationCode(
		client.ClientID,
		"https://example.com/callback",
		challenge,
		"S256",
		"mcp",
		"user-123",
		"admin",
		"admin@moul.local",
		"_rootUsers",
		5*time.Minute,
	)
	if err != nil {
		t.Fatalf("CreateAuthorizationCode failed: %v", err)
	}

	// 1. Wrong PKCE verifier should fail
	_, err = store.ExchangeAuthorizationCode(authCode.Code, client.ClientID, "https://example.com/callback", "wrong-verifier", client.ClientSecret)
	if err == nil {
		t.Fatalf("Expected PKCE verification failure, got nil error")
	}

	// Recreate code since single-use deleted it
	authCode, err = store.CreateAuthorizationCode(
		client.ClientID,
		"https://example.com/callback",
		challenge,
		"S256",
		"mcp",
		"user-123",
		"admin",
		"admin@moul.local",
		"_rootUsers",
		5*time.Minute,
	)
	if err != nil {
		t.Fatalf("CreateAuthorizationCode failed: %v", err)
	}

	// 2. Correct PKCE verifier should succeed
	exchanged, err := store.ExchangeAuthorizationCode(authCode.Code, client.ClientID, "https://example.com/callback", verifier, client.ClientSecret)
	if err != nil {
		t.Fatalf("ExchangeAuthorizationCode failed with valid verifier: %v", err)
	}

	if exchanged.Username != "admin" || exchanged.UserID != "user-123" {
		t.Errorf("Unexpected exchanged code data: %+v", exchanged)
	}

	// 3. Second exchange should fail (single-use)
	_, err = store.ExchangeAuthorizationCode(authCode.Code, client.ClientID, "https://example.com/callback", verifier, client.ClientSecret)
	if err == nil {
		t.Fatalf("Expected second exchange to fail, but it succeeded")
	}
}

func TestOAuthStoreRefreshToken(t *testing.T) {
	store := auth.NewOAuthStore()

	ref, err := store.CreateRefreshToken("client-1", "user-1", "admin@moul.local", "admin", "_rootUsers", "mcp", time.Hour)
	if err != nil {
		t.Fatalf("CreateRefreshToken failed: %v", err)
	}

	fetched, err := store.ExchangeRefreshToken(ref.Token, "client-1")
	if err != nil {
		t.Fatalf("ExchangeRefreshToken failed: %v", err)
	}
	if fetched.UserID != "user-1" {
		t.Errorf("Expected user-1, got %s", fetched.UserID)
	}

	// Wrong client should fail
	_, err = store.ExchangeRefreshToken(ref.Token, "wrong-client")
	if err == nil {
		t.Fatalf("Expected client mismatch error, got nil")
	}
}
