package auth

import (
	"context"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type OAuthUser struct {
	ID        string                 `json:"id"`
	Name      string                 `json:"name"`
	Username  string                 `json:"username"`
	Email     string                 `json:"email"`
	AvatarURL string                 `json:"avatarUrl"`
	RawUser   map[string]interface{} `json:"rawUser,omitempty"`
}

type ProviderConfig struct {
	ClientID     string
	ClientSecret string
	AuthURL      string
	TokenURL     string
	UserInfoURL  string
	Scopes       []string
}

type OAuthProvider interface {
	Name() string
	GetAuthURL(state, redirectURL, codeChallenge string) string
	FetchUserProfile(ctx context.Context, code, codeVerifier, redirectURL string) (*OAuthUser, error)
}

// GenerateRandomState generates a secure 32-character hex state parameter for CSRF protection.
func GenerateRandomState() (string, error) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// GeneratePKCEVerifierAndChallenge generates a PKCE code verifier and S256 code challenge.
func GeneratePKCEVerifierAndChallenge() (string, string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", "", err
	}
	verifier := base64.RawURLEncoding.EncodeToString(b)
	h := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(h[:])
	return verifier, challenge, nil
}

// GetOAuthProvider constructs the requested OAuth2 provider instance from settings.
func GetOAuthProvider(providerName string, settings map[string]string) (OAuthProvider, error) {
	lowerProvider := strings.ToLower(strings.TrimSpace(providerName))
	switch lowerProvider {
	case "github":
		if settings["oauth_github_enabled"] != "true" {
			return nil, fmt.Errorf("github oauth provider is not enabled")
		}
		clientID := settings["oauth_github_client_id"]
		clientSecret := settings["oauth_github_client_secret"]
		if clientID == "" || clientSecret == "" {
			return nil, fmt.Errorf("github oauth client_id and client_secret must be configured")
		}
		return &GitHubProvider{
			Config: ProviderConfig{
				ClientID:     clientID,
				ClientSecret: clientSecret,
				AuthURL:      "https://github.com/login/oauth/authorize",
				TokenURL:     "https://github.com/login/oauth/access_token",
				UserInfoURL:  "https://api.github.com/user",
				Scopes:       []string{"user:email"},
			},
		}, nil

	case "google":
		if settings["oauth_google_enabled"] != "true" {
			return nil, fmt.Errorf("google oauth provider is not enabled")
		}
		clientID := settings["oauth_google_client_id"]
		clientSecret := settings["oauth_google_client_secret"]
		if clientID == "" || clientSecret == "" {
			return nil, fmt.Errorf("google oauth client_id and client_secret must be configured")
		}
		return &GoogleProvider{
			Config: ProviderConfig{
				ClientID:     clientID,
				ClientSecret: clientSecret,
				AuthURL:      "https://accounts.google.com/o/oauth2/v2/auth",
				TokenURL:     "https://oauth2.googleapis.com/token",
				UserInfoURL:  "https://www.googleapis.com/oauth2/v3/userinfo",
				Scopes:       []string{"openid", "profile", "email"},
			},
		}, nil

	case "apple":
		if settings["oauth_apple_enabled"] != "true" {
			return nil, fmt.Errorf("apple oauth provider is not enabled")
		}
		clientID := settings["oauth_apple_client_id"]
		clientSecret := settings["oauth_apple_client_secret"]
		teamID := settings["oauth_apple_team_id"]
		keyID := settings["oauth_apple_key_id"]
		privateKey := settings["oauth_apple_private_key"]

		if clientID == "" {
			return nil, fmt.Errorf("apple oauth client_id must be configured")
		}
		if clientSecret == "" && (privateKey == "" || teamID == "" || keyID == "") {
			return nil, fmt.Errorf("apple oauth requires client_secret or (team_id, key_id, private_key)")
		}

		return &AppleProvider{
			Config: ProviderConfig{
				ClientID:     clientID,
				ClientSecret: clientSecret,
				AuthURL:      "https://appleid.apple.com/auth/authorize",
				TokenURL:     "https://appleid.apple.com/auth/token",
				Scopes:       []string{"name", "email"},
			},
			TeamID:     teamID,
			KeyID:      keyID,
			PrivateKey: privateKey,
		}, nil

	default:
		return nil, fmt.Errorf("unsupported oauth provider: %s", providerName)
	}
}

// ── GitHub Provider ─────────────────────────────────────────────────────────

type GitHubProvider struct {
	Config ProviderConfig
	HTTPClient *http.Client
}

func (p *GitHubProvider) client() *http.Client {
	if p.HTTPClient != nil {
		return p.HTTPClient
	}
	return &http.Client{Timeout: 10 * time.Second}
}

func (p *GitHubProvider) Name() string { return "github" }

func (p *GitHubProvider) GetAuthURL(state, redirectURL, codeChallenge string) string {
	u, _ := url.Parse(p.Config.AuthURL)
	q := u.Query()
	q.Set("client_id", p.Config.ClientID)
	q.Set("redirect_uri", redirectURL)
	q.Set("scope", strings.Join(p.Config.Scopes, " "))
	q.Set("state", state)
	if codeChallenge != "" {
		q.Set("code_challenge", codeChallenge)
		q.Set("code_challenge_method", "S256")
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func (p *GitHubProvider) FetchUserProfile(ctx context.Context, code, codeVerifier, redirectURL string) (*OAuthUser, error) {
	// 1. Exchange code for access token
	form := url.Values{}
	form.Set("client_id", p.Config.ClientID)
	form.Set("client_secret", p.Config.ClientSecret)
	form.Set("code", code)
	form.Set("redirect_uri", redirectURL)
	if codeVerifier != "" {
		form.Set("code_verifier", codeVerifier)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", p.Config.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := p.client().Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to github token endpoint: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github token endpoint returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenRes struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
		ErrorDesc   string `json:"error_description"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenRes); err != nil {
		return nil, fmt.Errorf("failed to parse github token response: %w", err)
	}
	if tokenRes.Error != "" {
		return nil, fmt.Errorf("github auth error: %s - %s", tokenRes.Error, tokenRes.ErrorDesc)
	}
	if tokenRes.AccessToken == "" {
		return nil, fmt.Errorf("github token response did not contain access_token")
	}

	// 2. Fetch user profile
	userReq, err := http.NewRequestWithContext(ctx, "GET", p.Config.UserInfoURL, nil)
	if err != nil {
		return nil, err
	}
	userReq.Header.Set("Authorization", "Bearer "+tokenRes.AccessToken)
	userReq.Header.Set("Accept", "application/json")
	userReq.Header.Set("User-Agent", "moul-dev")

	userResp, err := p.client().Do(userReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch github user profile: %w", err)
	}
	defer userResp.Body.Close()

	userBytes, _ := io.ReadAll(userResp.Body)
	if userResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github user endpoint returned status %d: %s", userResp.StatusCode, string(userBytes))
	}

	var ghUser struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
	}
	if err := json.Unmarshal(userBytes, &ghUser); err != nil {
		return nil, fmt.Errorf("failed to parse github user response: %w", err)
	}

	rawMap := make(map[string]interface{})
	_ = json.Unmarshal(userBytes, &rawMap)

	email := ghUser.Email
	// If email is private in primary profile, fetch from /user/emails
	if email == "" {
		emailsReq, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/user/emails", nil)
		if err == nil {
			emailsReq.Header.Set("Authorization", "Bearer "+tokenRes.AccessToken)
			emailsReq.Header.Set("Accept", "application/json")
			emailsReq.Header.Set("User-Agent", "moul-dev")
			if emailsResp, err := p.client().Do(emailsReq); err == nil {
				defer emailsResp.Body.Close()
				var emails []struct {
					Email    string `json:"email"`
					Primary  bool   `json:"primary"`
					Verified bool   `json:"verified"`
				}
				if json.NewDecoder(emailsResp.Body).Decode(&emails) == nil {
					for _, em := range emails {
						if em.Primary && em.Verified {
							email = em.Email
							break
						}
					}
					if email == "" && len(emails) > 0 {
						email = emails[0].Email
					}
				}
			}
		}
	}

	name := ghUser.Name
	if name == "" {
		name = ghUser.Login
	}

	return &OAuthUser{
		ID:        fmt.Sprintf("%d", ghUser.ID),
		Name:      name,
		Username:  ghUser.Login,
		Email:     email,
		AvatarURL: ghUser.AvatarURL,
		RawUser:   rawMap,
	}, nil
}

// ── Google Provider ─────────────────────────────────────────────────────────

type GoogleProvider struct {
	Config     ProviderConfig
	HTTPClient *http.Client
}

func (p *GoogleProvider) client() *http.Client {
	if p.HTTPClient != nil {
		return p.HTTPClient
	}
	return &http.Client{Timeout: 10 * time.Second}
}

func (p *GoogleProvider) Name() string { return "google" }

func (p *GoogleProvider) GetAuthURL(state, redirectURL, codeChallenge string) string {
	u, _ := url.Parse(p.Config.AuthURL)
	q := u.Query()
	q.Set("client_id", p.Config.ClientID)
	q.Set("redirect_uri", redirectURL)
	q.Set("response_type", "code")
	q.Set("scope", strings.Join(p.Config.Scopes, " "))
	q.Set("state", state)
	if codeChallenge != "" {
		q.Set("code_challenge", codeChallenge)
		q.Set("code_challenge_method", "S256")
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func (p *GoogleProvider) FetchUserProfile(ctx context.Context, code, codeVerifier, redirectURL string) (*OAuthUser, error) {
	form := url.Values{}
	form.Set("client_id", p.Config.ClientID)
	form.Set("client_secret", p.Config.ClientSecret)
	form.Set("code", code)
	form.Set("grant_type", "authorization_code")
	form.Set("redirect_uri", redirectURL)
	if codeVerifier != "" {
		form.Set("code_verifier", codeVerifier)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", p.Config.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := p.client().Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to google token endpoint: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google token endpoint returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenRes struct {
		AccessToken string `json:"access_token"`
		IDToken     string `json:"id_token"`
		Error       string `json:"error"`
		ErrorDesc   string `json:"error_description"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenRes); err != nil {
		return nil, fmt.Errorf("failed to parse google token response: %w", err)
	}
	if tokenRes.Error != "" {
		return nil, fmt.Errorf("google auth error: %s - %s", tokenRes.Error, tokenRes.ErrorDesc)
	}
	if tokenRes.AccessToken == "" {
		return nil, fmt.Errorf("google token response did not contain access_token")
	}

	// Fetch user profile from Google userinfo endpoint
	userReq, err := http.NewRequestWithContext(ctx, "GET", p.Config.UserInfoURL, nil)
	if err != nil {
		return nil, err
	}
	userReq.Header.Set("Authorization", "Bearer "+tokenRes.AccessToken)

	userResp, err := p.client().Do(userReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch google user info: %w", err)
	}
	defer userResp.Body.Close()

	userBytes, _ := io.ReadAll(userResp.Body)
	if userResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google userinfo endpoint returned status %d: %s", userResp.StatusCode, string(userBytes))
	}

	var gUser struct {
		Sub           string `json:"sub"`
		Name          string `json:"name"`
		GivenName     string `json:"given_name"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Picture       string `json:"picture"`
	}
	if err := json.Unmarshal(userBytes, &gUser); err != nil {
		return nil, fmt.Errorf("failed to parse google userinfo response: %w", err)
	}

	rawMap := make(map[string]interface{})
	_ = json.Unmarshal(userBytes, &rawMap)

	username := strings.Split(gUser.Email, "@")[0]
	if username == "" {
		username = gUser.Sub
	}

	return &OAuthUser{
		ID:        gUser.Sub,
		Name:      gUser.Name,
		Username:  username,
		Email:     gUser.Email,
		AvatarURL: gUser.Picture,
		RawUser:   rawMap,
	}, nil
}

// ── Apple Provider ──────────────────────────────────────────────────────────

type AppleProvider struct {
	Config      ProviderConfig
	TeamID      string
	KeyID       string
	PrivateKey  string
	UserPayload string
	HTTPClient  *http.Client
}

// GenerateAppleClientSecret generates a signed ES256 JWT for Apple OAuth client authentication.
func GenerateAppleClientSecret(teamID, keyID, clientID, privateKeyPEM string, validFor time.Duration) (string, error) {
	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		return "", fmt.Errorf("failed to parse PEM block from private key")
	}

	var parsedKey interface{}
	var err error
	if parsedKey, err = x509.ParsePKCS8PrivateKey(block.Bytes); err != nil {
		if parsedKey, err = x509.ParseECPrivateKey(block.Bytes); err != nil {
			return "", fmt.Errorf("failed to parse ECDSA private key: %w", err)
		}
	}

	ecKey, ok := parsedKey.(*ecdsa.PrivateKey)
	if !ok {
		return "", fmt.Errorf("private key is not an ECDSA key")
	}

	now := time.Now().UTC()
	if validFor <= 0 {
		validFor = 5 * time.Minute
	}
	exp := now.Add(validFor)

	header := map[string]string{
		"alg": "ES256",
		"kid": keyID,
	}
	headerBytes, _ := json.Marshal(header)
	headerB64 := base64.RawURLEncoding.EncodeToString(headerBytes)

	claims := map[string]interface{}{
		"iss": teamID,
		"iat": now.Unix(),
		"exp": exp.Unix(),
		"aud": "https://appleid.apple.com",
		"sub": clientID,
	}
	claimsBytes, _ := json.Marshal(claims)
	claimsB64 := base64.RawURLEncoding.EncodeToString(claimsBytes)

	signingInput := headerB64 + "." + claimsB64
	hash := sha256.Sum256([]byte(signingInput))

	r, s, err := ecdsa.Sign(rand.Reader, ecKey, hash[:])
	if err != nil {
		return "", fmt.Errorf("failed to sign apple client secret JWT: %w", err)
	}

	curveBits := ecKey.Params().BitSize
	keyBytes := (curveBits + 7) / 8

	rBytes := r.Bytes()
	sBytes := s.Bytes()

	sig := make([]byte, 2*keyBytes)
	copy(sig[keyBytes-len(rBytes):keyBytes], rBytes)
	copy(sig[2*keyBytes-len(sBytes):], sBytes)

	sigB64 := base64.RawURLEncoding.EncodeToString(sig)

	return signingInput + "." + sigB64, nil
}

func (p *AppleProvider) getClientSecret() (string, error) {
	// If static clientSecret is set and is a valid 3-part JWT, use it directly
	if p.Config.ClientSecret != "" && len(strings.Split(p.Config.ClientSecret, ".")) == 3 {
		return p.Config.ClientSecret, nil
	}

	pemData := p.PrivateKey
	if pemData == "" && strings.Contains(p.Config.ClientSecret, "PRIVATE KEY") {
		pemData = p.Config.ClientSecret
	}

	if pemData != "" && p.TeamID != "" && p.KeyID != "" {
		return GenerateAppleClientSecret(p.TeamID, p.KeyID, p.Config.ClientID, pemData, 5*time.Minute)
	}

	if p.Config.ClientSecret != "" {
		return p.Config.ClientSecret, nil
	}

	return "", fmt.Errorf("apple oauth client secret configuration incomplete")
}

func (p *AppleProvider) client() *http.Client {
	if p.HTTPClient != nil {
		return p.HTTPClient
	}
	return &http.Client{Timeout: 10 * time.Second}
}

func (p *AppleProvider) Name() string { return "apple" }

func (p *AppleProvider) GetAuthURL(state, redirectURL, codeChallenge string) string {
	u, _ := url.Parse(p.Config.AuthURL)
	q := u.Query()
	q.Set("client_id", p.Config.ClientID)
	q.Set("redirect_uri", redirectURL)
	q.Set("response_type", "code id_token")
	q.Set("response_mode", "form_post")
	q.Set("scope", strings.Join(p.Config.Scopes, " "))
	q.Set("state", state)
	if codeChallenge != "" {
		q.Set("code_challenge", codeChallenge)
		q.Set("code_challenge_method", "S256")
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func (p *AppleProvider) FetchUserProfile(ctx context.Context, code, codeVerifier, redirectURL string) (*OAuthUser, error) {
	secret, err := p.getClientSecret()
	if err != nil {
		return nil, fmt.Errorf("failed to obtain apple client secret: %w", err)
	}

	form := url.Values{}
	form.Set("client_id", p.Config.ClientID)
	form.Set("client_secret", secret)
	form.Set("code", code)
	form.Set("grant_type", "authorization_code")
	form.Set("redirect_uri", redirectURL)
	if codeVerifier != "" {
		form.Set("code_verifier", codeVerifier)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", p.Config.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := p.client().Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to apple token endpoint: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("apple token endpoint returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenRes struct {
		AccessToken string `json:"access_token"`
		IDToken     string `json:"id_token"`
		Error       string `json:"error"`
		ErrorDesc   string `json:"error_description"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenRes); err != nil {
		return nil, fmt.Errorf("failed to parse apple token response: %w", err)
	}
	if tokenRes.Error != "" {
		return nil, fmt.Errorf("apple auth error: %s - %s", tokenRes.Error, tokenRes.ErrorDesc)
	}
	if tokenRes.IDToken == "" {
		return nil, fmt.Errorf("apple token response did not contain id_token")
	}

	// Parse unverified JWT payload claims from ID token
	parts := strings.Split(tokenRes.IDToken, ".")
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid apple id_token format")
	}

	payloadSegment := parts[1]
	if m := len(payloadSegment) % 4; m != 0 {
		payloadSegment += strings.Repeat("=", 4-m)
	}

	claimsBytes, err := base64.URLEncoding.DecodeString(payloadSegment)
	if err != nil {
		return nil, fmt.Errorf("failed to decode apple id_token claims: %w", err)
	}

	var claims struct {
		Sub   string `json:"sub"`
		Email string `json:"email"`
	}
	_ = json.Unmarshal(claimsBytes, &claims)

	rawMap := make(map[string]interface{})
	_ = json.Unmarshal(claimsBytes, &rawMap)

	email := claims.Email
	name := ""

	if p.UserPayload != "" {
		var userObj struct {
			Name struct {
				FirstName string `json:"firstName"`
				LastName  string `json:"lastName"`
			} `json:"name"`
			Email string `json:"email"`
		}
		if json.Unmarshal([]byte(p.UserPayload), &userObj) == nil {
			first := strings.TrimSpace(userObj.Name.FirstName)
			last := strings.TrimSpace(userObj.Name.LastName)
			if first != "" || last != "" {
				name = strings.TrimSpace(first + " " + last)
			}
			if email == "" && userObj.Email != "" {
				email = userObj.Email
			}
			rawMap["user"] = userObj
		}
	}

	username := ""
	if name != "" {
		username = name
	} else if email != "" {
		username = strings.Split(email, "@")[0]
	}
	if username == "" {
		if len(claims.Sub) > 8 {
			username = "apple_" + claims.Sub[:8]
		} else {
			username = "apple_" + claims.Sub
		}
	}

	if name == "" {
		name = username
	}

	return &OAuthUser{
		ID:       claims.Sub,
		Name:     name,
		Username: username,
		Email:    email,
		RawUser:  rawMap,
	}, nil
}
