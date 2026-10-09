package handlers_test

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
)

func TestGeminiMCPOAuthFlow(t *testing.T) {
	// Initialize in-memory test database
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init test db: %v", err)
	}
	defer dbConn.Close()

	// Seed root administrator in _rootUsers
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("GeminiRootPassword123!"), bcrypt.DefaultCost)
	_, err = dbConn.Insert("_rootUsers", dbx.Params{
		"id":           "root-user-gemini",
		"username":     "geminiadmin",
		"email":        "gemini@moul.dev",
		"passwordHash": string(hashedPassword),
		"createdAt":    "2026-06-28T00:00:00Z",
		"updatedAt":    "2026-06-28T00:00:00Z",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to seed _rootUsers: %v", err)
	}

	adminKey := "test-admin-secret-key-1234"
	auth.InitJWT("test-jwt-secret-key-1234")

	e := handlers.NewRouter(dbConn, nil, nil, nil, nil, nil, adminKey, true)
	server := httptest.NewServer(e)
	defer server.Close()

	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Don't follow redirects automatically so we can inspect redirect responses
			return http.ErrUseLastResponse
		},
	}

	// ── 0. Gemini checks HEAD / (Root health / probe) ───────────────
	rootReq, err := http.NewRequest(http.MethodHead, server.URL+"/", nil)
	if err != nil {
		t.Fatalf("Failed to create HEAD / request: %v", err)
	}
	rootResp, err := client.Do(rootReq)
	if err != nil {
		t.Fatalf("HEAD / failed: %v", err)
	}
	rootResp.Body.Close()
	if rootResp.StatusCode != http.StatusOK && rootResp.StatusCode != http.StatusTemporaryRedirect {
		t.Errorf("Expected 200 or 307 on HEAD /, got %d", rootResp.StatusCode)
	}

	// ── 1. Gemini checks HEAD /api/mcp without credentials ───────────
	headReq, err := http.NewRequest(http.MethodHead, server.URL+"/api/mcp", nil)
	if err != nil {
		t.Fatalf("Failed to create HEAD request: %v", err)
	}
	headResp, err := client.Do(headReq)
	if err != nil {
		t.Fatalf("HEAD /api/mcp failed: %v", err)
	}
	headResp.Body.Close()

	if headResp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized on unauthenticated HEAD /api/mcp, got %d", headResp.StatusCode)
	}

	wwwAuth := headResp.Header.Get("WWW-Authenticate")
	if !strings.Contains(wwwAuth, "resource_metadata=") {
		t.Errorf("Expected WWW-Authenticate header with resource_metadata, got: %q", wwwAuth)
	}

	// ── 2. Gemini discovers RFC 9728 Protected Resource Metadata ─────
	// Path-specific: /.well-known/oauth-protected-resource/api/mcp
	prmReq, _ := http.NewRequest(http.MethodGet, server.URL+"/.well-known/oauth-protected-resource/api/mcp", nil)
	prmResp, err := client.Do(prmReq)
	if err != nil {
		t.Fatalf("GET /.well-known/oauth-protected-resource/api/mcp failed: %v", err)
	}
	defer prmResp.Body.Close()

	if prmResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for Protected Resource Metadata, got %d", prmResp.StatusCode)
	}

	var prmData map[string]interface{}
	if err := json.NewDecoder(prmResp.Body).Decode(&prmData); err != nil {
		t.Fatalf("Failed to decode PRM JSON: %v", err)
	}

	if !strings.HasSuffix(prmData["resource"].(string), "/api/mcp") {
		t.Errorf("Expected resource URI ending in /api/mcp, got %v", prmData["resource"])
	}

	authServers, ok := prmData["authorization_servers"].([]interface{})
	if !ok || len(authServers) == 0 {
		t.Fatalf("Expected authorization_servers array in PRM, got %v", prmData["authorization_servers"])
	}

	// Root path: /.well-known/oauth-protected-resource
	rootPrmReq, _ := http.NewRequest(http.MethodGet, server.URL+"/.well-known/oauth-protected-resource", nil)
	rootPrmResp, err := client.Do(rootPrmReq)
	if err != nil {
		t.Fatalf("GET /.well-known/oauth-protected-resource failed: %v", err)
	}
	rootPrmResp.Body.Close()
	if rootPrmResp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for root PRM, got %d", rootPrmResp.StatusCode)
	}

	// ── 3. Gemini discovers RFC 8414 Authorization Server Metadata ───
	asmReq, _ := http.NewRequest(http.MethodGet, server.URL+"/.well-known/oauth-authorization-server", nil)
	asmResp, err := client.Do(asmReq)
	if err != nil {
		t.Fatalf("GET /.well-known/oauth-authorization-server failed: %v", err)
	}
	defer asmResp.Body.Close()

	if asmResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for Authorization Server Metadata, got %d", asmResp.StatusCode)
	}

	var asmData map[string]interface{}
	if err := json.NewDecoder(asmResp.Body).Decode(&asmData); err != nil {
		t.Fatalf("Failed to decode ASM JSON: %v", err)
	}

	if asmData["authorization_endpoint"] == nil || asmData["token_endpoint"] == nil || asmData["registration_endpoint"] == nil {
		t.Fatalf("Missing required endpoints in ASM: %+v", asmData)
	}

	// Also verify /.well-known/openid-configuration alias
	oidcReq, _ := http.NewRequest(http.MethodGet, server.URL+"/.well-known/openid-configuration", nil)
	oidcResp, err := client.Do(oidcReq)
	if err != nil {
		t.Fatalf("GET /.well-known/openid-configuration failed: %v", err)
	}
	oidcResp.Body.Close()
	if oidcResp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for openid-configuration, got %d", oidcResp.StatusCode)
	}

	// ── 4. RFC 7591 Dynamic Client Registration ──────────────────────
	dcrBody := `{"client_name":"Google Gemini","redirect_uris":["https://vertexaisearch.cloud.google.com/oauth-redirect"]}`
	dcrReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/register", strings.NewReader(dcrBody))
	dcrReq.Header.Set("Content-Type", "application/json")
	dcrResp, err := client.Do(dcrReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/register failed: %v", err)
	}
	defer dcrResp.Body.Close()

	if dcrResp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for DCR, got %d", dcrResp.StatusCode)
	}

	var dcrData map[string]interface{}
	if err := json.NewDecoder(dcrResp.Body).Decode(&dcrData); err != nil {
		t.Fatalf("Failed to decode DCR response: %v", err)
	}

	clientID, ok := dcrData["client_id"].(string)
	if !ok || clientID == "" {
		t.Fatalf("Expected client_id in DCR response: %+v", dcrData)
	}
	clientSecret := dcrData["client_secret"].(string)
	redirectURI := "https://vertexaisearch.cloud.google.com/oauth-redirect"

	// ── 5. User opens /api/oauth2/authorize (Consent Page) ───────────
	verifier := "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
	h := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(h[:])
	state := "xyz123"

	authURL := server.URL + "/api/oauth2/authorize?" + url.Values{
		"response_type":         {"code"},
		"client_id":             {clientID},
		"redirect_uri":          {redirectURI},
		"scope":                 {"mcp"},
		"state":                 {state},
		"code_challenge":        {challenge},
		"code_challenge_method": {"S256"},
	}.Encode()

	authPageReq, _ := http.NewRequest(http.MethodGet, authURL, nil)
	authPageResp, err := client.Do(authPageReq)
	if err != nil {
		t.Fatalf("GET /api/oauth2/authorize failed: %v", err)
	}
	defer authPageResp.Body.Close()

	if authPageResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for consent page, got %d", authPageResp.StatusCode)
	}
	pageHTML, _ := io.ReadAll(authPageResp.Body)
	if !strings.Contains(string(pageHTML), "Google Gemini") {
		t.Errorf("Expected consent page to mention Google Gemini, got HTML: %s", string(pageHTML))
	}

	// ── 6. User submits credentials on /api/oauth2/authorize ─────────
	formValues := url.Values{
		"client_id":             {clientID},
		"redirect_uri":          {redirectURI},
		"response_type":         {"code"},
		"scope":                 {"mcp"},
		"state":                 {state},
		"code_challenge":        {challenge},
		"code_challenge_method": {"S256"},
		"identity":              {"gemini@moul.dev"},
		"password":              {"GeminiRootPassword123!"}, // Authenticate directly with Root User credentials
	}

	confirmReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/authorize", strings.NewReader(formValues.Encode()))
	confirmReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	confirmResp, err := client.Do(confirmReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/authorize failed: %v", err)
	}
	confirmResp.Body.Close()

	if confirmResp.StatusCode != http.StatusFound {
		t.Fatalf("Expected 302 Found redirect after approval, got %d", confirmResp.StatusCode)
	}

	loc := confirmResp.Header.Get("Location")
	if !strings.HasPrefix(loc, redirectURI) {
		t.Fatalf("Expected redirect to %s, got: %s", redirectURI, loc)
	}

	parsedLoc, err := url.Parse(loc)
	if err != nil {
		t.Fatalf("Failed to parse redirect location: %v", err)
	}
	code := parsedLoc.Query().Get("code")
	if code == "" {
		t.Fatalf("Missing code parameter in redirect URL: %s", loc)
	}
	if parsedLoc.Query().Get("state") != state {
		t.Errorf("Expected state '%s', got '%s'", state, parsedLoc.Query().Get("state"))
	}

	// ── 7. Gemini exchanges authorization code for access token ──────
	tokenForm := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {redirectURI},
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"code_verifier": {verifier},
	}

	tokenReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/token", strings.NewReader(tokenForm.Encode()))
	tokenReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	tokenResp, err := client.Do(tokenReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/token failed: %v", err)
	}
	defer tokenResp.Body.Close()

	if tokenResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(tokenResp.Body)
		t.Fatalf("Expected 200 OK from token endpoint, got %d. Body: %s", tokenResp.StatusCode, string(body))
	}

	var tokenData map[string]interface{}
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		t.Fatalf("Failed to decode token response: %v", err)
	}

	accessToken, ok := tokenData["access_token"].(string)
	if !ok || accessToken == "" {
		t.Fatalf("Expected access_token in token response: %+v", tokenData)
	}
	if tokenData["token_type"] != "Bearer" {
		t.Errorf("Expected token_type Bearer, got %v", tokenData["token_type"])
	}

	// ── 8. Gemini accesses MCP endpoint with the OAuth Bearer token ──
	mcpInit := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"gemini-test","version":"1.0"}}}`
	mcpReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/mcp", strings.NewReader(mcpInit))
	mcpReq.Header.Set("Authorization", "Bearer "+accessToken)
	mcpReq.Header.Set("Content-Type", "application/json")

	mcpResp, err := client.Do(mcpReq)
	if err != nil {
		t.Fatalf("POST /api/mcp with OAuth access token failed: %v", err)
	}
	defer mcpResp.Body.Close()

	if mcpResp.StatusCode != http.StatusOK && mcpResp.StatusCode != http.StatusAccepted {
		body, _ := io.ReadAll(mcpResp.Body)
		t.Errorf("Expected 200 or 202 from /api/mcp with OAuth token, got %d. Body: %s", mcpResp.StatusCode, string(body))
	}

	// ── 9. Also verify access via /mcp alias ─────────────────────────
	mcpAliasReq, _ := http.NewRequest(http.MethodPost, server.URL+"/mcp", strings.NewReader(mcpInit))
	mcpAliasReq.Header.Set("Authorization", "Bearer "+accessToken)
	mcpAliasReq.Header.Set("Content-Type", "application/json")

	mcpAliasResp, err := client.Do(mcpAliasReq)
	if err != nil {
		t.Fatalf("POST /mcp alias failed: %v", err)
	}
	defer mcpAliasResp.Body.Close()

	if mcpAliasResp.StatusCode != http.StatusOK && mcpAliasResp.StatusCode != http.StatusAccepted {
		body, _ := io.ReadAll(mcpAliasResp.Body)
		t.Errorf("Expected 200 or 202 from /mcp alias, got %d. Body: %s", mcpAliasResp.StatusCode, string(body))
	}
}

func TestOAuthAuthorizeWithRootUserAndRefreshToken(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	// Seed root user in _rootUsers table
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("StrongRootPassword123!"), bcrypt.DefaultCost)
	_, err = dbConn.Insert("_rootUsers", dbx.Params{
		"id":           "root-user-uuid-1",
		"username":     "rootboss",
		"email":        "rootboss@example.com",
		"passwordHash": string(hashedPassword),
		"createdAt":    "2026-06-28T00:00:00Z",
		"updatedAt":    "2026-06-28T00:00:00Z",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to seed _rootUsers: %v", err)
	}

	adminKey := "test-admin-key"
	auth.InitJWT("test-jwt-secret-key-1234")

	e := handlers.NewRouter(dbConn, nil, nil, nil, nil, nil, adminKey, true)
	server := httptest.NewServer(e)
	defer server.Close()

	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	// 1. Register dynamic client
	dcrBody := `{"client_name":"Claude Code","redirect_uris":["https://claude.ai/oauth-callback"]}`
	dcrReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/register", strings.NewReader(dcrBody))
	dcrReq.Header.Set("Content-Type", "application/json")
	dcrResp, err := client.Do(dcrReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/register failed: %v", err)
	}
	defer dcrResp.Body.Close()

	var dcrData map[string]interface{}
	_ = json.NewDecoder(dcrResp.Body).Decode(&dcrData)
	clientID := dcrData["client_id"].(string)
	clientSecret := dcrData["client_secret"].(string)
	redirectURI := "https://claude.ai/oauth-callback"

	// 2. Authorize using root user username & password (not admin key)
	verifier := "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
	h := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(h[:])

	formValues := url.Values{
		"client_id":             {clientID},
		"redirect_uri":          {redirectURI},
		"response_type":         {"code"},
		"scope":                 {"mcp"},
		"state":                 {"claude_state"},
		"code_challenge":        {challenge},
		"code_challenge_method": {"S256"},
		"identity":              {"rootboss"},
		"password":              {"StrongRootPassword123!"},
	}

	confirmReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/authorize", strings.NewReader(formValues.Encode()))
	confirmReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	confirmResp, err := client.Do(confirmReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/authorize failed: %v", err)
	}
	confirmResp.Body.Close()

	if confirmResp.StatusCode != http.StatusFound {
		t.Fatalf("Expected 302 redirect, got %d", confirmResp.StatusCode)
	}

	loc := confirmResp.Header.Get("Location")
	parsedLoc, _ := url.Parse(loc)
	code := parsedLoc.Query().Get("code")

	// 3. Token exchange
	tokenForm := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {redirectURI},
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"code_verifier": {verifier},
	}

	tokenReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/token", strings.NewReader(tokenForm.Encode()))
	tokenReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	tokenResp, err := client.Do(tokenReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/token failed: %v", err)
	}
	defer tokenResp.Body.Close()

	var tokenData map[string]interface{}
	_ = json.NewDecoder(tokenResp.Body).Decode(&tokenData)
	accessToken := tokenData["access_token"].(string)
	refreshToken := tokenData["refresh_token"].(string)

	claims, err := auth.VerifyToken(accessToken)
	if err != nil {
		t.Fatalf("Failed to verify access token: %v", err)
	}
	if claims.Username != "rootboss" || claims.ID != "root-user-uuid-1" {
		t.Errorf("Unexpected token claims: %+v", claims)
	}

	// 4. Refresh token exchange
	refreshForm := url.Values{
		"grant_type":    {"refresh_token"},
		"refresh_token": {refreshToken},
		"client_id":     {clientID},
	}

	refreshReq, _ := http.NewRequest(http.MethodPost, server.URL+"/api/oauth2/token", strings.NewReader(refreshForm.Encode()))
	refreshReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	refreshResp, err := client.Do(refreshReq)
	if err != nil {
		t.Fatalf("POST /api/oauth2/token refresh failed: %v", err)
	}
	defer refreshResp.Body.Close()

	if refreshResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(refreshResp.Body)
		t.Fatalf("Expected 200 OK from refresh token grant, got %d. Body: %s", refreshResp.StatusCode, string(body))
	}

	var refreshedData map[string]interface{}
	_ = json.NewDecoder(refreshResp.Body).Decode(&refreshedData)
	newAccessToken := refreshedData["access_token"].(string)

	refreshedClaims, err := auth.VerifyToken(newAccessToken)
	if err != nil {
		t.Fatalf("Failed to verify refreshed access token: %v", err)
	}
	if refreshedClaims.Username != "rootboss" {
		t.Errorf("Expected username rootboss in refreshed claims, got %s", refreshedClaims.Username)
	}
}

func TestConfiguredAppNameInOAuthAndMCP(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init test db: %v", err)
	}
	defer dbConn.Close()

	if err := db.EnsureSystemTables(dbConn); err != nil {
		t.Fatalf("Failed to ensure system tables: %v", err)
	}

	adminKey := "test-admin-secret-key-4321"
	auth.InitJWT("test-jwt-secret-key-4321")

	// 1. Router initialized with custom AppName
	e := handlers.NewRouterWithOptions(dbConn, nil, nil, nil, nil, nil, adminKey, true, handlers.RouterConfig{
		AppName:        "Custom Studio",
		Version:        "1.2.3",
		DisableAdminUI: true,
	})
	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 2. Check root health endpoint name
	rootResp, err := client.Get(server.URL + "/")
	if err != nil {
		t.Fatalf("GET / failed: %v", err)
	}
	var rootData map[string]interface{}
	_ = json.NewDecoder(rootResp.Body).Decode(&rootData)
	rootResp.Body.Close()
	if rootData["name"] != "Custom Studio" {
		t.Errorf("Expected root name 'Custom Studio', got %v", rootData["name"])
	}

	// 3. Check Protected Resource Metadata resource_name
	prmResp, err := client.Get(server.URL + "/.well-known/oauth-protected-resource")
	if err != nil {
		t.Fatalf("GET /.well-known/oauth-protected-resource failed: %v", err)
	}
	var prmData map[string]interface{}
	_ = json.NewDecoder(prmResp.Body).Decode(&prmData)
	prmResp.Body.Close()
	if prmData["resource_name"] != "Custom Studio MCP Server" {
		t.Errorf("Expected resource_name 'Custom Studio MCP Server', got %v", prmData["resource_name"])
	}

	// 4. Check OAuth consent page displays configured name
	authResp, err := client.Get(server.URL + "/api/oauth2/authorize?client_id=test-cli&redirect_uri=https://oauth.google.com/callback")
	if err != nil {
		t.Fatalf("GET /api/oauth2/authorize failed: %v", err)
	}
	authBodyBytes, _ := io.ReadAll(authResp.Body)
	authResp.Body.Close()
	authHTML := string(authBodyBytes)

	if !strings.Contains(authHTML, "Custom Studio MCP") {
		t.Errorf("Expected HTML consent page to contain 'Custom Studio MCP', got:\n%s", authHTML)
	}
}
