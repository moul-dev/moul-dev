package auth

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

var (
	ErrInvalidClient        = errors.New("invalid client")
	ErrInvalidGrant         = errors.New("invalid or expired authorization code")
	ErrInvalidRedirectURI   = errors.New("redirect URI mismatch")
	ErrPKCEVerificationFail = errors.New("PKCE verification failed")
	ErrInvalidRefreshToken  = errors.New("invalid or expired refresh token")
)

// OAuthClient represents a registered OAuth 2.0 / 2.1 client application.
type OAuthClient struct {
	ClientID                string    `json:"clientId"`
	ClientSecret            string    `json:"clientSecret,omitempty"`
	ClientName              string    `json:"clientName"`
	RedirectURIs            []string  `json:"redirectUris"`
	GrantTypes              []string  `json:"grantTypes"`
	ResponseTypes           []string  `json:"responseTypes"`
	TokenEndpointAuthMethod string    `json:"tokenEndpointAuthMethod"`
	CreatedAt               time.Time `json:"createdAt"`
}

// AuthorizationCode represents a short-lived authorization code issued during authorization code grant.
type AuthorizationCode struct {
	Code                string    `json:"code"`
	ClientID            string    `json:"clientId"`
	RedirectURI         string    `json:"redirectUri"`
	CodeChallenge       string    `json:"codeChallenge"`
	CodeChallengeMethod string    `json:"codeChallengeMethod"`
	Scope               string    `json:"scope"`
	UserID              string    `json:"userId"`
	Username            string    `json:"username"`
	Email               string    `json:"email"`
	AuthMoul            string    `json:"authMoul"`
	ExpiresAt           time.Time `json:"expiresAt"`
}

// OAuthRefreshToken represents a persistent refresh token issued upon successful authorization code exchange.
type OAuthRefreshToken struct {
	Token     string    `json:"token"`
	ClientID  string    `json:"clientId"`
	UserID    string    `json:"userId"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	AuthMoul  string    `json:"authMoul"`
	Scope     string    `json:"scope"`
	ExpiresAt time.Time `json:"expiresAt"`
}

// OAuthStore manages registered OAuth clients, active authorization codes, and refresh tokens.
type OAuthStore struct {
	mu            sync.RWMutex
	clients       map[string]*OAuthClient
	codes         map[string]*AuthorizationCode
	refreshTokens map[string]*OAuthRefreshToken
}

// DefaultOAuthStore is the global in-memory OAuth store.
var DefaultOAuthStore = NewOAuthStore()

// NewOAuthStore creates a new OAuthStore instance.
func NewOAuthStore() *OAuthStore {
	return &OAuthStore{
		clients:       make(map[string]*OAuthClient),
		codes:         make(map[string]*AuthorizationCode),
		refreshTokens: make(map[string]*OAuthRefreshToken),
	}
}

// RegisterClient dynamically registers a new OAuth client (RFC 7591).
func (s *OAuthStore) RegisterClient(name string, redirectURIs []string, grantTypes []string, responseTypes []string, authMethod string) (*OAuthClient, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	idSuffix, err := generateRandomString(16)
	if err != nil {
		return nil, fmt.Errorf("failed to generate client ID: %w", err)
	}
	clientID := "moul_client_" + idSuffix

	secretSuffix, err := generateRandomString(32)
	if err != nil {
		return nil, fmt.Errorf("failed to generate client secret: %w", err)
	}
	clientSecret := "moul_sec_" + secretSuffix

	if len(grantTypes) == 0 {
		grantTypes = []string{"authorization_code", "refresh_token"}
	}
	if len(responseTypes) == 0 {
		responseTypes = []string{"code"}
	}
	if authMethod == "" {
		authMethod = "client_secret_post"
	}
	if name == "" {
		name = "Custom MCP Client"
	}

	client := &OAuthClient{
		ClientID:                clientID,
		ClientSecret:            clientSecret,
		ClientName:              name,
		RedirectURIs:            redirectURIs,
		GrantTypes:              grantTypes,
		ResponseTypes:           responseTypes,
		TokenEndpointAuthMethod: authMethod,
		CreatedAt:               time.Now(),
	}

	s.clients[clientID] = client
	return client, nil
}

// EnsureClient retrieves an existing client or auto-creates one if clientID is passed directly without prior registration.
func (s *OAuthStore) EnsureClient(clientID, redirectURI, name string) *OAuthClient {
	s.mu.Lock()
	defer s.mu.Unlock()

	if client, exists := s.clients[clientID]; exists {
		// If redirectURI is not registered yet, add it
		if redirectURI != "" {
			found := false
			for _, u := range client.RedirectURIs {
				if u == redirectURI {
					found = true
					break
				}
			}
			if !found {
				client.RedirectURIs = append(client.RedirectURIs, redirectURI)
			}
		}
		return client
	}

	// Auto-register ad-hoc client so manual client ID configuration works
	if name == "" {
		name = "MCP Client (" + clientID + ")"
	}
	var uris []string
	if redirectURI != "" {
		uris = []string{redirectURI}
	}
	client := &OAuthClient{
		ClientID:                clientID,
		ClientSecret:            "",
		ClientName:              name,
		RedirectURIs:            uris,
		GrantTypes:              []string{"authorization_code", "refresh_token"},
		ResponseTypes:           []string{"code"},
		TokenEndpointAuthMethod: "none",
		CreatedAt:               time.Now(),
	}
	s.clients[clientID] = client
	return client
}

// GetClient returns a registered OAuth client by ID.
func (s *OAuthStore) GetClient(clientID string) (*OAuthClient, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clientID]
	return client, exists
}

// CreateAuthorizationCode generates an authorization code (valid for 5 minutes).
func (s *OAuthStore) CreateAuthorizationCode(
	clientID, redirectURI, codeChallenge, codeChallengeMethod, scope, userID, username, email, authMoul string,
	expiry time.Duration,
) (*AuthorizationCode, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.cleanupExpiredLocked()

	codeStr, err := generateRandomString(32)
	if err != nil {
		return nil, fmt.Errorf("failed to generate authorization code: %w", err)
	}

	if expiry <= 0 {
		expiry = 5 * time.Minute
	}

	authCode := &AuthorizationCode{
		Code:                codeStr,
		ClientID:            clientID,
		RedirectURI:         redirectURI,
		CodeChallenge:       codeChallenge,
		CodeChallengeMethod: codeChallengeMethod,
		Scope:               scope,
		UserID:              userID,
		Username:            username,
		Email:               email,
		AuthMoul:            authMoul,
		ExpiresAt:           time.Now().Add(expiry),
	}

	s.codes[codeStr] = authCode
	return authCode, nil
}

// ExchangeAuthorizationCode validates and consumes a one-time authorization code.
func (s *OAuthStore) ExchangeAuthorizationCode(code, clientID, redirectURI, codeVerifier, clientSecret string) (*AuthorizationCode, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	authCode, exists := s.codes[code]
	if !exists || time.Now().After(authCode.ExpiresAt) {
		return nil, ErrInvalidGrant
	}

	// Single-use code: delete immediately
	delete(s.codes, code)

	if authCode.ClientID != clientID {
		return nil, ErrInvalidClient
	}

	// Validate redirect URI if one was set during authorize
	if authCode.RedirectURI != "" && redirectURI != "" {
		normAuth := strings.TrimRight(authCode.RedirectURI, "/")
		normReq := strings.TrimRight(redirectURI, "/")
		if normAuth != normReq && authCode.RedirectURI != redirectURI {
			return nil, ErrInvalidRedirectURI
		}
	}

	// Validate client secret if client has one registered and secret was supplied
	if client, exists := s.clients[clientID]; exists && client.ClientSecret != "" && clientSecret != "" {
		if subtle.ConstantTimeCompare([]byte(client.ClientSecret), []byte(clientSecret)) != 1 {
			return nil, ErrInvalidClient
		}
	}

	// Validate PKCE if challenge was set
	if authCode.CodeChallenge != "" {
		if codeVerifier == "" {
			return nil, ErrPKCEVerificationFail
		}
		if !VerifyPKCE(codeVerifier, authCode.CodeChallenge, authCode.CodeChallengeMethod) {
			return nil, ErrPKCEVerificationFail
		}
	}

	return authCode, nil
}

// CreateRefreshToken creates a persistent refresh token (default 30 days).
func (s *OAuthStore) CreateRefreshToken(clientID, userID, email, username, authMoul, scope string, expiry time.Duration) (*OAuthRefreshToken, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	tokenStr, err := generateRandomString(40)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	if expiry <= 0 {
		expiry = 30 * 24 * time.Hour
	}

	ref := &OAuthRefreshToken{
		Token:     tokenStr,
		ClientID:  clientID,
		UserID:    userID,
		Username:  username,
		Email:     email,
		AuthMoul:  authMoul,
		Scope:     scope,
		ExpiresAt: time.Now().Add(expiry),
	}

	s.refreshTokens[tokenStr] = ref
	return ref, nil
}

// ExchangeRefreshToken validates a refresh token and returns user details.
func (s *OAuthStore) ExchangeRefreshToken(token, clientID string) (*OAuthRefreshToken, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ref, exists := s.refreshTokens[token]
	if !exists || time.Now().After(ref.ExpiresAt) {
		return nil, ErrInvalidRefreshToken
	}

	if clientID != "" && ref.ClientID != clientID {
		return nil, ErrInvalidClient
	}

	return ref, nil
}

// VerifyPKCE validates PKCE code_verifier against code_challenge using S256 or plain.
func VerifyPKCE(verifier, challenge, method string) bool {
	if method == "" || strings.ToUpper(method) == "S256" {
		h := sha256.Sum256([]byte(verifier))
		calc := base64.RawURLEncoding.EncodeToString(h[:])
		return subtle.ConstantTimeCompare([]byte(calc), []byte(challenge)) == 1
	}
	if strings.ToLower(method) == "plain" {
		return subtle.ConstantTimeCompare([]byte(verifier), []byte(challenge)) == 1
	}
	return false
}

// cleanupExpiredLocked removes expired authorization codes and refresh tokens.
func (s *OAuthStore) cleanupExpiredLocked() {
	now := time.Now()
	for code, item := range s.codes {
		if now.After(item.ExpiresAt) {
			delete(s.codes, code)
		}
	}
	for token, item := range s.refreshTokens {
		if now.After(item.ExpiresAt) {
			delete(s.refreshTokens, token)
		}
	}
}
