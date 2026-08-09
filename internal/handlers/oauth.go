package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

type AuthWithOAuth2Payload struct {
	Provider     string `json:"provider"`
	Code         string `json:"code"`
	CodeVerifier string `json:"codeVerifier"`
	RedirectURL  string `json:"redirectUrl"`
	User         string `json:"user,omitempty"`
}

type OAuthProviderInfo struct {
	Name          string `json:"name"`
	Title         string `json:"title"`
	AuthURL       string `json:"authUrl"`
	State         string `json:"state"`
	CodeVerifier  string `json:"codeVerifier,omitempty"`
	CodeChallenge string `json:"codeChallenge,omitempty"`
}

// GetAuthMethods lists all available authentication methods and configured OAuth2 providers.
func (h *AuthHandler) GetAuthMethods(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	settings, err := loadSettingsMap(h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load settings")
	}

	state, _ := auth.GenerateRandomState()
	verifier, challenge, _ := auth.GeneratePKCEVerifierAndChallenge()

	baseURL := getRedirectBaseURL(c, settings, moulName)

	var providers []OAuthProviderInfo
	supported := []struct {
		name  string
		title string
	}{
		{"github", "GitHub"},
		{"google", "Google"},
		{"apple", "Apple"},
	}

	for _, p := range supported {
		prov, err := auth.GetOAuthProvider(p.name, settings)
		if err == nil && prov != nil {
			redirectURL := fmt.Sprintf("%s/api/moul/%s/oauth2/%s/callback", baseURL, moulName, p.name)
			authURL := prov.GetAuthURL(state, redirectURL, challenge)
			providers = append(providers, OAuthProviderInfo{
				Name:          p.name,
				Title:         p.title,
				AuthURL:       authURL,
				State:         state,
				CodeVerifier:  verifier,
				CodeChallenge: challenge,
			})
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"password": map[string]bool{"enabled": true},
		"otp":      map[string]bool{"enabled": true},
		"passkeys": map[string]bool{"enabled": true},
		"oauth2": map[string]interface{}{
			"enabled":   len(providers) > 0,
			"providers": providers,
		},
	})
}

// OAuth2Authorize initiates OAuth2 authorization flow by building auth URL.
func (h *AuthHandler) OAuth2Authorize(c *echo.Context) error {
	moulName := c.Param("name")
	providerName := c.Param("provider")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	settings, err := loadSettingsMap(h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load settings")
	}

	prov, err := auth.GetOAuthProvider(providerName, settings)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	state := c.QueryParam("state")
	if state == "" {
		state, _ = auth.GenerateRandomState()
	}

	codeChallenge := c.QueryParam("codeChallenge")
	if codeChallenge == "" {
		codeChallenge = c.QueryParam("code_challenge")
	}

	redirectURL := c.QueryParam("redirectUrl")
	if redirectURL == "" {
		redirectURL = c.QueryParam("redirect_uri")
	}
	if redirectURL == "" {
		baseURL := getRedirectBaseURL(c, settings, moulName)
		redirectURL = fmt.Sprintf("%s/api/moul/%s/oauth2/%s/callback", baseURL, moulName, providerName)
	}

	authURL := prov.GetAuthURL(state, redirectURL, codeChallenge)

	accept := c.Request().Header.Get("Accept")
	if strings.Contains(accept, "application/json") || c.QueryParam("json") == "true" {
		return c.JSON(http.StatusOK, map[string]string{
			"authUrl": authURL,
			"state":   state,
		})
	}

	return c.Redirect(http.StatusFound, authURL)
}

// OAuth2Callback handles OAuth2 code exchange from provider callback.
func (h *AuthHandler) OAuth2Callback(c *echo.Context) error {
	moulName := c.Param("name")
	providerName := c.Param("provider")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	code := c.FormValue("code")
	if code == "" {
		code = c.QueryParam("code")
	}
	if code == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing code parameter")
	}

	codeVerifier := c.FormValue("codeVerifier")
	if codeVerifier == "" {
		codeVerifier = c.FormValue("code_verifier")
	}
	if codeVerifier == "" {
		codeVerifier = c.QueryParam("codeVerifier")
	}
	if codeVerifier == "" {
		codeVerifier = c.QueryParam("code_verifier")
	}

	redirectURL := c.FormValue("redirectUrl")
	if redirectURL == "" {
		redirectURL = c.FormValue("redirect_uri")
	}
	if redirectURL == "" {
		redirectURL = c.QueryParam("redirectUrl")
	}
	if redirectURL == "" {
		redirectURL = c.QueryParam("redirect_uri")
	}

	settings, err := loadSettingsMap(h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load settings")
	}

	if redirectURL == "" {
		baseURL := getRedirectBaseURL(c, settings, moulName)
		redirectURL = fmt.Sprintf("%s/api/moul/%s/oauth2/%s/callback", baseURL, moulName, providerName)
	}

	prov, err := auth.GetOAuthProvider(providerName, settings)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userPayload := c.FormValue("user")
	if userPayload == "" {
		userPayload = c.QueryParam("user")
	}
	if appleProv, ok := prov.(*auth.AppleProvider); ok && userPayload != "" {
		appleProv.UserPayload = userPayload
	}

	oauthUser, err := prov.FetchUserProfile(c.Request().Context(), code, codeVerifier, redirectURL)
	if err != nil {
		logger.Error("Failed to fetch OAuth user profile", "provider", providerName, "err", err)
		return echo.NewHTTPError(http.StatusBadRequest, "OAuth token exchange failed: "+err.Error())
	}

	token, recordMap, err := h.processOAuthLoginOrSignup(moul, providerName, oauthUser)
	if err != nil {
		logger.Error("Failed to process OAuth login/signup", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to complete authentication")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": recordMap,
	})
}

// AuthWithOAuth2 handles direct SPA / Client API authorization code exchange.
func (h *AuthHandler) AuthWithOAuth2(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(AuthWithOAuth2Payload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	providerName := strings.TrimSpace(payload.Provider)
	code := strings.TrimSpace(payload.Code)
	if providerName == "" || code == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "provider and code are required")
	}

	settings, err := loadSettingsMap(h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load settings")
	}

	redirectURL := strings.TrimSpace(payload.RedirectURL)
	if redirectURL == "" {
		baseURL := getRedirectBaseURL(c, settings, moulName)
		redirectURL = fmt.Sprintf("%s/api/moul/%s/oauth2/%s/callback", baseURL, moulName, providerName)
	}

	prov, err := auth.GetOAuthProvider(providerName, settings)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if appleProv, ok := prov.(*auth.AppleProvider); ok && payload.User != "" {
		appleProv.UserPayload = payload.User
	}

	oauthUser, err := prov.FetchUserProfile(c.Request().Context(), code, strings.TrimSpace(payload.CodeVerifier), redirectURL)
	if err != nil {
		logger.Error("Failed to fetch OAuth user profile in AuthWithOAuth2", "provider", providerName, "err", err)
		return echo.NewHTTPError(http.StatusBadRequest, "OAuth token exchange failed: "+err.Error())
	}

	token, recordMap, err := h.processOAuthLoginOrSignup(moul, providerName, oauthUser)
	if err != nil {
		logger.Error("Failed to process OAuth login/signup", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to complete authentication")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": recordMap,
	})
}

// ── Private Helpers ──────────────────────────────────────────────────────────

type LinkedOAuthProvider struct {
	Provider  string `json:"provider"`
	ID        string `json:"id"`
	Email     string `json:"email,omitempty"`
	Name      string `json:"name,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}

func (h *AuthHandler) processOAuthLoginOrSignup(moul *schema.Moul, providerName string, oauthUser *auth.OAuthUser) (string, map[string]interface{}, error) {
	_ = db.EnsureAuthColumns(h.DB, moul.Name)

	var record dbx.NullStringMap
	var foundRecord bool

	// 1. Try finding user by provider ID in linked oauthProviders JSON
	if oauthUser.ID != "" {
		var rows []dbx.NullStringMap
		err := h.DB.Select("*").From(moul.Name).All(&rows)
		if err == nil {
			for _, r := range rows {
				m := nullStringMapToMap(r)
				if provVal, ok := m["oauthProviders"].(string); ok && provVal != "" {
					var linked []LinkedOAuthProvider
					if json.Unmarshal([]byte(provVal), &linked) == nil {
						for _, l := range linked {
							if strings.EqualFold(l.Provider, providerName) && l.ID == oauthUser.ID {
								record = r
								foundRecord = true
								break
							}
						}
					}
				}
				if foundRecord {
					break
				}
			}
		}
	}

	// 2. If not found by provider ID, try finding user by email
	if !foundRecord && oauthUser.Email != "" {
		err := h.DB.Select("*").From(moul.Name).Where(dbx.HashExp{"email": oauthUser.Email}).One(&record)
		if err == nil {
			foundRecord = true
		}
	}

	now := time.Now().UTC().Format(time.RFC3339)

	var recordMap map[string]interface{}

	if !foundRecord {
		// Auto-signup: Create a new user record
		baseUsername := oauthUser.Username
		if baseUsername == "" {
			if oauthUser.Email != "" {
				baseUsername = strings.Split(oauthUser.Email, "@")[0]
			} else {
				baseUsername = oauthUser.Name
			}
		}
		reg := regexp.MustCompile("[^a-zA-Z0-9_]")
		baseUsername = reg.ReplaceAllString(baseUsername, "")
		if baseUsername == "" {
			baseUsername = "user"
		}

		username := baseUsername
		for {
			var count int
			err := h.DB.Select("COUNT(*)").From(moul.Name).Where(dbx.HashExp{"username": username}).Row(&count)
			if err != nil || count == 0 {
				break
			}
			username = fmt.Sprintf("%s_%s", baseUsername, util.RandomID()[:4])
		}

		email := oauthUser.Email
		if email == "" {
			email = fmt.Sprintf("%s@%s.oauth", oauthUser.ID, providerName)
		}

		linked := []LinkedOAuthProvider{
			{
				Provider:  providerName,
				ID:        oauthUser.ID,
				Email:     oauthUser.Email,
				Name:      oauthUser.Name,
				AvatarURL: oauthUser.AvatarURL,
			},
		}
		linkedJSON, _ := json.Marshal(linked)

		id := fmt.Sprintf("%s-%s", util.Singularize(moul.Name), util.RandomID())

		insertParams := dbx.Params{
			"id":             id,
			"username":       username,
			"email":          email,
			"oauthProviders": string(linkedJSON),
			"created_at":     now,
			"updated_at":     now,
		}

		_, err := h.DB.Insert(moul.Name, insertParams).Execute()
		if err != nil {
			return "", nil, fmt.Errorf("failed to insert new oauth user: %w", err)
		}

		var newRec dbx.NullStringMap
		_ = h.DB.Select("*").From(moul.Name).Where(dbx.HashExp{"id": id}).One(&newRec)
		recordMap = nullStringMapToMap(newRec)

	} else {
		recordMap = nullStringMapToMap(record)

		// Link provider if not already linked
		var linked []LinkedOAuthProvider
		if provVal, ok := recordMap["oauthProviders"].(string); ok && provVal != "" {
			_ = json.Unmarshal([]byte(provVal), &linked)
		}

		alreadyLinked := false
		for _, l := range linked {
			if strings.EqualFold(l.Provider, providerName) && l.ID == oauthUser.ID {
				alreadyLinked = true
				break
			}
		}

		if !alreadyLinked {
			linked = append(linked, LinkedOAuthProvider{
				Provider:  providerName,
				ID:        oauthUser.ID,
				Email:     oauthUser.Email,
				Name:      oauthUser.Name,
				AvatarURL: oauthUser.AvatarURL,
			})
			linkedJSON, _ := json.Marshal(linked)

			_, _ = h.DB.Update(moul.Name, dbx.Params{
				"oauthProviders": string(linkedJSON),
				"updated_at":     now,
			}, dbx.HashExp{"id": recordMap["id"]}).Execute()

			recordMap["oauthProviders"] = string(linkedJSON)
		}
	}

	id, _ := recordMap["id"].(string)
	userEmail, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	token, err := auth.GenerateToken(id, userEmail, username, moul.Name)
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return token, normalizeRecord(moul, recordMap), nil
}

func loadSettingsMap(dbConn *dbx.DB) (map[string]string, error) {
	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}
	err := dbConn.Select("key", "value").From("_settings").All(&rows)
	if err != nil {
		return nil, err
	}
	settings := make(map[string]string)
	for _, r := range rows {
		settings[r.Key] = r.Value
	}
	return settings, nil
}

func getRedirectBaseURL(c *echo.Context, settings map[string]string, moulName string) string {
	if custom := settings["oauth_redirect_url"]; custom != "" {
		return strings.TrimSuffix(custom, "/")
	}
	scheme := c.Scheme()
	if scheme == "" {
		scheme = "http"
	}
	host := c.Request().Host
	if host == "" {
		return util.GetPublicURL()
	}
	return fmt.Sprintf("%s://%s", scheme, host)
}
