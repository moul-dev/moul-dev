package auth_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

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
