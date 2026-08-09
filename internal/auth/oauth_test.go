package auth_test

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/auth"
)

func TestOAuthStateAndPKCEGeneration(t *testing.T) {
	state1, err := auth.GenerateRandomState()
	if err != nil || len(state1) != 32 {
		t.Fatalf("GenerateRandomState failed or unexpected length: err=%v, state=%s", err, state1)
	}

	state2, err := auth.GenerateRandomState()
	if err != nil || state1 == state2 {
		t.Fatalf("GenerateRandomState produced duplicate state: %s", state1)
	}

	verifier, challenge, err := auth.GeneratePKCEVerifierAndChallenge()
	if err != nil || verifier == "" || challenge == "" {
		t.Fatalf("GeneratePKCEVerifierAndChallenge failed: verifier=%s, challenge=%s, err=%v", verifier, challenge, err)
	}
}

func TestGetOAuthProviderDisabled(t *testing.T) {
	settings := map[string]string{
		"oauth_github_enabled": "false",
	}

	_, err := auth.GetOAuthProvider("github", settings)
	if err == nil {
		t.Fatalf("Expected error when requesting disabled provider, got nil")
	}
}

func TestGetOAuthProviderMissingKeys(t *testing.T) {
	settings := map[string]string{
		"oauth_github_enabled":   "true",
		"oauth_github_client_id": "",
	}

	_, err := auth.GetOAuthProvider("github", settings)
	if err == nil {
		t.Fatalf("Expected error when requesting provider with missing keys, got nil")
	}
}

func TestGitHubProviderAuthURL(t *testing.T) {
	settings := map[string]string{
		"oauth_github_enabled":       "true",
		"oauth_github_client_id":     "test_client_id",
		"oauth_github_client_secret": "test_client_secret",
	}

	provider, err := auth.GetOAuthProvider("github", settings)
	if err != nil {
		t.Fatalf("GetOAuthProvider failed: %v", err)
	}

	if provider.Name() != "github" {
		t.Fatalf("Expected provider name 'github', got '%s'", provider.Name())
	}

	authURL := provider.GetAuthURL("state123", "http://localhost:8090/callback", "challenge456")
	if !strings.Contains(authURL, "client_id=test_client_id") ||
		!strings.Contains(authURL, "state=state123") ||
		!strings.Contains(authURL, "code_challenge=challenge456") {
		t.Fatalf("Unexpected auth URL generated: %s", authURL)
	}
}

func TestGitHubProviderFetchUserProfileMock(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/login/oauth/access_token" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]string{
				"access_token": "mock_access_token",
			})
			return
		}
		if r.URL.Path == "/user" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"id":         12345,
				"login":      "octocat",
				"name":       "Monalisa Octocat",
				"email":      "octocat@github.com",
				"avatar_url": "https://github.com/images/error/octocat_happy.gif",
			})
			return
		}
		http.NotFound(w, r)
	}))
	defer mockServer.Close()

	ghProvider := &auth.GitHubProvider{
		Config: auth.ProviderConfig{
			ClientID:     "test_id",
			ClientSecret: "test_secret",
			AuthURL:      mockServer.URL + "/login/oauth/authorize",
			TokenURL:     mockServer.URL + "/login/oauth/access_token",
			UserInfoURL:  mockServer.URL + "/user",
		},
		HTTPClient: mockServer.Client(),
	}

	user, err := ghProvider.FetchUserProfile(context.Background(), "mock_code", "mock_verifier", "http://localhost/callback")
	if err != nil {
		t.Fatalf("FetchUserProfile failed: %v", err)
	}

	if user.ID != "12345" || user.Username != "octocat" || user.Email != "octocat@github.com" {
		t.Fatalf("Unexpected user profile returned: %+v", user)
	}
}

func TestAppleClientSecretGeneration(t *testing.T) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatalf("Failed to generate ECDSA test key: %v", err)
	}

	derBytes, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		t.Fatalf("Failed to marshal private key to PKCS8: %v", err)
	}

	pemBlock := &pem.Block{
		Type:  "PRIVATE KEY",
		Bytes: derBytes,
	}
	pemStr := string(pem.EncodeToMemory(pemBlock))

	jwtSecret, err := auth.GenerateAppleClientSecret("TEAM123456", "KEY1234567", "com.example.service", pemStr, 10*time.Minute)
	if err != nil {
		t.Fatalf("GenerateAppleClientSecret failed: %v", err)
	}

	parts := strings.Split(jwtSecret, ".")
	if len(parts) != 3 {
		t.Fatalf("Expected JWT to have 3 parts, got %d (secret: %s)", len(parts), jwtSecret)
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil || !strings.Contains(string(headerBytes), "KEY1234567") {
		t.Fatalf("Header does not contain key ID: %s", string(headerBytes))
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || !strings.Contains(string(claimsBytes), "com.example.service") || !strings.Contains(string(claimsBytes), "TEAM123456") {
		t.Fatalf("Claims do not contain team or client ID: %s", string(claimsBytes))
	}
}

func TestAppleProviderFetchUserProfile(t *testing.T) {
	privateKey, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	derBytes, _ := x509.MarshalPKCS8PrivateKey(privateKey)
	pemStr := string(pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: derBytes}))

	// Create mock id_token
	headerB64 := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"RS256","kid":"apple_kid"}`))
	claimsB64 := base64.RawURLEncoding.EncodeToString([]byte(`{"sub":"apple_sub_12345","email":"john.appleseed@example.com"}`))
	mockIDToken := headerB64 + "." + claimsB64 + ".mock_sig"

	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/auth/token" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]string{
				"access_token": "mock_apple_access_token",
				"id_token":     mockIDToken,
			})
			return
		}
		http.NotFound(w, r)
	}))
	defer mockServer.Close()

	// Test 1: First-time auth with UserPayload
	appleProvider := &auth.AppleProvider{
		Config: auth.ProviderConfig{
			ClientID: "com.example.service",
			AuthURL:  mockServer.URL + "/auth/authorize",
			TokenURL: mockServer.URL + "/auth/token",
		},
		TeamID:      "TEAM123",
		KeyID:       "KEY456",
		PrivateKey:  pemStr,
		UserPayload: `{"name":{"firstName":"John","lastName":"Appleseed"},"email":"john.appleseed@example.com"}`,
		HTTPClient:  mockServer.Client(),
	}

	user1, err := appleProvider.FetchUserProfile(context.Background(), "code123", "", "http://localhost/callback")
	if err != nil {
		t.Fatalf("FetchUserProfile with UserPayload failed: %v", err)
	}

	if user1.ID != "apple_sub_12345" || user1.Name != "John Appleseed" || user1.Email != "john.appleseed@example.com" {
		t.Fatalf("Unexpected user1 returned: %+v", user1)
	}

	// Test 2: Re-auth / missing UserPayload (subsequent login after revocation)
	appleProviderNoPayload := &auth.AppleProvider{
		Config: auth.ProviderConfig{
			ClientID: "com.example.service",
			AuthURL:  mockServer.URL + "/auth/authorize",
			TokenURL: mockServer.URL + "/auth/token",
		},
		TeamID:     "TEAM123",
		KeyID:      "KEY456",
		PrivateKey: pemStr,
		HTTPClient: mockServer.Client(),
	}

	user2, err := appleProviderNoPayload.FetchUserProfile(context.Background(), "code123", "", "http://localhost/callback")
	if err != nil {
		t.Fatalf("FetchUserProfile without UserPayload failed: %v", err)
	}

	if user2.ID != "apple_sub_12345" || user2.Email != "john.appleseed@example.com" || user2.Name != "john.appleseed" {
		t.Fatalf("Unexpected user2 returned: %+v", user2)
	}
}
