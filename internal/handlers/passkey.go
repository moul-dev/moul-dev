package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/util"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
)

// WebAuthnUser implements the webauthn.User interface.
type WebAuthnUser struct {
	ID          string
	Username    string
	Email       string
	Credentials []webauthn.Credential
}

func (u *WebAuthnUser) WebAuthnID() []byte {
	return []byte(u.ID)
}

func (u *WebAuthnUser) WebAuthnName() string {
	return u.Username
}

func (u *WebAuthnUser) WebAuthnDisplayName() string {
	return u.Email
}

func (u *WebAuthnUser) WebAuthnIcon() string {
	return ""
}

func (u *WebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	return u.Credentials
}

type PasskeySessionState struct {
	SessionData *webauthn.SessionData
	User        *WebAuthnUser
	MoulName    string
	ExpiresAt   time.Time
}

var (
	passkeyStore = make(map[string]PasskeySessionState)
	passkeyMu    sync.RWMutex
)

func storePasskeySession(token string, data *webauthn.SessionData, user *WebAuthnUser, moulName string) {
	passkeyMu.Lock()
	defer passkeyMu.Unlock()
	passkeyStore[token] = PasskeySessionState{
		SessionData: data,
		User:        user,
		MoulName:    moulName,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
	}
}

func getPasskeySession(token string) (PasskeySessionState, bool) {
	passkeyMu.RLock()
	defer passkeyMu.RUnlock()
	state, ok := passkeyStore[token]
	if !ok || time.Now().After(state.ExpiresAt) {
		return PasskeySessionState{}, false
	}
	return state, true
}

func deletePasskeySession(token string) {
	passkeyMu.Lock()
	defer passkeyMu.Unlock()
	delete(passkeyStore, token)
}

type PasskeyIdentityPayload struct {
	Identity string `json:"identity"` // email or username
}

type PasskeyEmailPayload struct {
	Email string `json:"email"`
}

// getWebAuthnConfig dynamically instantiates a WebAuthn config based on request Host & Origin.
func getWebAuthnConfig(c echo.Context) (*webauthn.WebAuthn, error) {
	host := c.Request().Host // e.g. "localhost:8090"
	origin := c.Request().Header.Get("Origin")

	if origin == "" {
		referer := c.Request().Header.Get("Referer")
		if referer != "" {
			if parts := strings.Split(referer, "/"); len(parts) >= 3 {
				origin = parts[0] + "//" + parts[2]
			}
		}
	}
	if origin == "" {
		origin = "http://" + host
	}

	rpID := host
	if strings.Contains(host, ":") {
		rpID = strings.Split(host, ":")[0]
	}

	return webauthn.New(&webauthn.Config{
		RPID:          rpID,
		RPDisplayName: "Moul Engine",
		RPOrigins:     []string{origin},
	})
}

// helper to build WebAuthnUser from SQLite database record map
func buildWebAuthnUser(recordMap map[string]interface{}) *WebAuthnUser {
	id, _ := recordMap["id"].(string)
	username, _ := recordMap["username"].(string)
	email, _ := recordMap["email"].(string)

	var credentials []webauthn.Credential
	if passkeysVal, ok := recordMap["passkeys"].(string); ok && passkeysVal != "" {
		_ = json.Unmarshal([]byte(passkeysVal), &credentials)
	}

	return &WebAuthnUser{
		ID:          id,
		Username:    username,
		Email:       email,
		Credentials: credentials,
	}
}

// PasskeyRegisterOptions generates registration credentials options for an authenticated user.
func (h *AuthHandler) PasskeyRegisterOptions(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	// Fetch current authenticated user record
	authRecord := middleware.GetAuthRecord(c)
	if authRecord == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required")
	}
	userID, _ := authRecord["id"].(string)

	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": userID}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusUnauthorized, "User record not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	userMap := nullStringMapToMap(record)
	user := buildWebAuthnUser(userMap)

	webAuthn, err := getWebAuthnConfig(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to initialize WebAuthn: "+err.Error())
	}

	options, sessionData, err := webAuthn.BeginRegistration(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to start registration: "+err.Error())
	}

	sessionToken := "reg_" + util.RandomID()
	storePasskeySession(sessionToken, sessionData, user, moulName)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"sessionToken": sessionToken,
		"options":      options,
	})
}

// PasskeyRegisterVerify verifies credential signature and registers a passkey for an authenticated user.
func (h *AuthHandler) PasskeyRegisterVerify(c echo.Context) error {
	moulName := c.Param("moulName")
	sessionToken := c.QueryParam("sessionToken")
	if sessionToken == "" {
		sessionToken = c.Request().Header.Get("X-Session-Token")
	}
	if sessionToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "sessionToken query parameter or X-Session-Token header is required")
	}

	state, ok := getPasskeySession(sessionToken)
	if !ok || state.MoulName != moulName {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid or expired sessionToken")
	}
	defer deletePasskeySession(sessionToken)

	webAuthn, err := getWebAuthnConfig(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to initialize WebAuthn: "+err.Error())
	}

	credential, err := webAuthn.FinishRegistration(state.User, *state.SessionData, c.Request())
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Verification failed: "+err.Error())
	}

	// Append and save credential
	state.User.Credentials = append(state.User.Credentials, *credential)
	passkeysJSON, err := json.Marshal(state.User.Credentials)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to serialize passkeys: "+err.Error())
	}

	_, err = h.DB.Update(moulName, dbx.Params{
		"passkeys":   string(passkeysJSON),
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"id": state.User.ID}).Execute()

	if err != nil {
		logger.Error("Failed to save registered passkey", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save passkey")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Passkey registered successfully",
	})
}

// PasskeySignupOptions starts registration options for a new user.
func (h *AuthHandler) PasskeySignupOptions(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(PasskeyEmailPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	email := strings.TrimSpace(payload.Email)
	if email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email is required")
	}

	// Check if email already exists
	var count int
	err = h.DB.Select("COUNT(*)").From(moulName).Where(dbx.HashExp{"email": email}).Row(&count)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if count > 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "Email already registered")
	}

	// Generate unique username from email prefix
	baseUsername := strings.Split(email, "@")[0]
	reg := regexp.MustCompile("[^a-zA-Z0-9_]")
	baseUsername = reg.ReplaceAllString(baseUsername, "")
	if baseUsername == "" {
		baseUsername = "user"
	}

	username := baseUsername
	for {
		var exists int
		err := h.DB.Select("COUNT(*)").From(moulName).Where(dbx.HashExp{"username": username}).Row(&exists)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
		if exists == 0 {
			break
		}
		username = fmt.Sprintf("%s_%s", baseUsername, util.RandomID()[:4])
	}

	// Create temporary uncommitted user
	user := &WebAuthnUser{
		ID:          moulName + "-" + util.RandomID(),
		Username:    username,
		Email:       email,
		Credentials: []webauthn.Credential{},
	}

	webAuthn, err := getWebAuthnConfig(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to initialize WebAuthn: "+err.Error())
	}

	options, sessionData, err := webAuthn.BeginRegistration(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to start registration: "+err.Error())
	}

	sessionToken := "signup_" + util.RandomID()
	storePasskeySession(sessionToken, sessionData, user, moulName)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"sessionToken": sessionToken,
		"options":      options,
	})
}

// PasskeySignupVerify verifies credential signature and creates the new user with their first passkey.
func (h *AuthHandler) PasskeySignupVerify(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	sessionToken := c.QueryParam("sessionToken")
	if sessionToken == "" {
		sessionToken = c.Request().Header.Get("X-Session-Token")
	}
	if sessionToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "sessionToken is required")
	}

	state, ok := getPasskeySession(sessionToken)
	if !ok || state.MoulName != moulName {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid or expired sessionToken")
	}
	defer deletePasskeySession(sessionToken)

	webAuthn, err := getWebAuthnConfig(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to initialize WebAuthn: "+err.Error())
	}

	credential, err := webAuthn.FinishRegistration(state.User, *state.SessionData, c.Request())
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Verification failed: "+err.Error())
	}

	// Double check email availability again to prevent race condition
	var count int
	err = h.DB.Select("COUNT(*)").From(moulName).Where(dbx.HashExp{"email": state.User.Email}).Row(&count)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if count > 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "Email already registered")
	}

	state.User.Credentials = append(state.User.Credentials, *credential)
	passkeysJSON, err := json.Marshal(state.User.Credentials)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to serialize passkeys: "+err.Error())
	}

	now := time.Now().UTC().Format(time.RFC3339)
	_, err = h.DB.Insert(moulName, dbx.Params{
		"id":         state.User.ID,
		"username":   state.User.Username,
		"email":      state.User.Email,
		"passkeys":   string(passkeysJSON),
		"created_at": now,
		"updated_at": now,
	}).Execute()

	if err != nil {
		logger.Error("Failed to create new user during passkey signup", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user account")
	}

	// Fetch fresh record
	var record dbx.NullStringMap
	_ = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": state.User.ID}).One(&record)
	recordMap := nullStringMapToMap(record)

	// Generate JWT
	token, err := auth.GenerateToken(state.User.ID, state.User.Email, state.User.Username, moulName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": normalizeRecord(moul, recordMap),
	})
}

// PasskeyLoginOptions begins assertion details for passkey login.
func (h *AuthHandler) PasskeyLoginOptions(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(PasskeyIdentityPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	identity := strings.TrimSpace(payload.Identity)
	if identity == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "identity (email or username) is required")
	}

	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).
		Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
		One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "User not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	userMap := nullStringMapToMap(record)
	user := buildWebAuthnUser(userMap)

	if len(user.Credentials) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "This account has no registered Passkeys. Please log in with password or OTP first.")
	}

	webAuthn, err := getWebAuthnConfig(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to initialize WebAuthn: "+err.Error())
	}

	options, sessionData, err := webAuthn.BeginLogin(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to start login: "+err.Error())
	}

	sessionToken := "login_" + util.RandomID()
	storePasskeySession(sessionToken, sessionData, user, moulName)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"sessionToken": sessionToken,
		"options":      options,
	})
}

// PasskeyLoginVerify verifies assertion signature and issues JWT.
func (h *AuthHandler) PasskeyLoginVerify(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	sessionToken := c.QueryParam("sessionToken")
	if sessionToken == "" {
		sessionToken = c.Request().Header.Get("X-Session-Token")
	}
	if sessionToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "sessionToken is required")
	}

	state, ok := getPasskeySession(sessionToken)
	if !ok || state.MoulName != moulName {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid or expired sessionToken")
	}
	defer deletePasskeySession(sessionToken)

	webAuthn, err := getWebAuthnConfig(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to initialize WebAuthn: "+err.Error())
	}

	credential, err := webAuthn.FinishLogin(state.User, *state.SessionData, c.Request())
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Verification failed: "+err.Error())
	}

	// Update credential counter in user credentials list
	for i, cred := range state.User.Credentials {
		if bytes.Equal(cred.ID, credential.ID) {
			state.User.Credentials[i].Authenticator.SignCount = credential.Authenticator.SignCount
			break
		}
	}

	passkeysJSON, err := json.Marshal(state.User.Credentials)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to serialize passkeys")
	}

	_, err = h.DB.Update(moulName, dbx.Params{
		"passkeys":   string(passkeysJSON),
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"id": state.User.ID}).Execute()

	if err != nil {
		logger.Error("Failed to update passkey signature counter", "err", err)
	}

	// Fetch fresh record Map
	var record dbx.NullStringMap
	_ = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": state.User.ID}).One(&record)
	recordMap := nullStringMapToMap(record)

	// Generate JWT
	token, err := auth.GenerateToken(state.User.ID, state.User.Email, state.User.Username, moulName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": normalizeRecord(moul, recordMap),
	})
}
