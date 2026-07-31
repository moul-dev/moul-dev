package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/moul-dev/moul-dev/internal/worker"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB     *dbx.DB
	Engine *worker.Engine
	Mailer *mailer.Mailer
}

func NewAuthHandler(dbConn *dbx.DB) *AuthHandler {
	return &AuthHandler{DB: dbConn}
}

type AuthRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

// AuthWithPassword verifies credentials and returns a signed JWT token.
func (h *AuthHandler) AuthWithPassword(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for auth", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	req := new(AuthRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if req.Identity == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "identity and password are required")
	}

	// Fetch record by email or username using dbx.NullStringMap
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).
		Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": req.Identity})).
		One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid credentials")
		}
		logger.Error("Failed to query auth record", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)

	// Extract password hash
	hashVal, ok := recordMap["passwordHash"]
	if !ok || hashVal == nil {
		logger.Error("Missing password hash in database record", "moul", moulName)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	passwordHash, ok := hashVal.(string)
	if !ok {
		logger.Error("Invalid password hash type in database record", "moul", moulName)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	// Compare password
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid credentials")
	}

	// Get claim details
	id, _ := recordMap["id"].(string)
	email, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	// Generate JWT
	token, err := auth.GenerateToken(id, email, username, moulName)
	if err != nil {
		logger.Error("Failed to generate auth token", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": normalizeRecord(moul, recordMap),
	})
}

type RequestPasswordResetPayload struct {
	Email string `json:"email"`
}

// RequestPasswordReset initiates password reset by generating a reset token and dispatching an email.
func (h *AuthHandler) RequestPasswordReset(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for password reset request", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(RequestPasswordResetPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	email := strings.TrimSpace(payload.Email)
	if email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email is required")
	}

	_ = db.EnsureAuthColumns(h.DB, moulName)

	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"email": email}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusOK, map[string]string{
				"message": "If the email exists, a password reset link has been sent.",
			})
		}
		logger.Error("Failed to query auth record for password reset", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	username, _ := recordMap["username"].(string)

	resetToken := util.RandomID() + util.RandomID()
	expiresAt := time.Now().UTC().Add(30 * time.Minute).Format(time.RFC3339)

	_, err = h.DB.Update(moulName, dbx.Params{
		"resetToken":          resetToken,
		"resetTokenExpiresAt": expiresAt,
		"updated_at":          time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"email": email}).Execute()
	if err != nil {
		logger.Error("Failed to save password reset token", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.EmailTemplates == nil {
		defaults := schema.GetDefaultEmailTemplates()
		moul.EmailTemplates = &defaults
	}

	tmpl := moul.EmailTemplates.PasswordReset
	templateData := map[string]interface{}{
		"Link":     fmt.Sprintf("http://localhost:8090/reset-password?token=%s", resetToken),
		"Token":    resetToken,
		"Username": username,
		"Email":    email,
	}

	subject, err := renderEmailTemplate(tmpl.Subject, templateData)
	if err != nil {
		subject = tmpl.Subject
	}
	body, err := renderEmailTemplate(tmpl.Body, templateData)
	if err != nil {
		body = tmpl.Body
	}

	logger.Info("========================================")
	logger.Info("PASSWORD RESET REQUEST RECEIVED", "moul", moulName)
	logger.Info("To:", "email", email)
	logger.Info("Subject:", "subject", subject)
	logger.Info("Body:", "body", body)
	logger.Info("Token:", "resetToken", resetToken)
	logger.Info("Expires At:", "time", expiresAt)
	logger.Info("========================================")

	sent := false
	if h.Engine != nil {
		tableName, err := findWorkerTable(h.DB)
		if err == nil && tableName != "" {
			_, err = h.Engine.Enqueue(c.Request().Context(), tableName, map[string]interface{}{
				"worker":   "SendEmail",
				"priority": 1,
				"args": map[string]interface{}{
					"to":      email,
					"subject": subject,
					"body":    body,
				},
			})
			if err == nil {
				sent = true
			}
		}
	}

	if !sent && h.Mailer != nil {
		_ = h.Mailer.Send(c.Request().Context(), &mailer.Email{
			To:       []string{email},
			Subject:  subject,
			HTMLBody: body,
			TextBody: body,
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "If the email exists, a password reset link has been sent.",
	})
}

type ConfirmPasswordResetPayload struct {
	Token           string `json:"token"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

// ConfirmPasswordReset resets a user's password using a valid reset token.
func (h *AuthHandler) ConfirmPasswordReset(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for password reset confirm", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(ConfirmPasswordResetPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	token := strings.TrimSpace(payload.Token)
	password := payload.Password
	if token == "" || password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "token and password are required")
	}
	if payload.PasswordConfirm != "" && password != payload.PasswordConfirm {
		return echo.NewHTTPError(http.StatusBadRequest, "password and passwordConfirm do not match")
	}
	if err := auth.ValidatePassword(password); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	_ = db.EnsureAuthColumns(h.DB, moulName)

	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"resetToken": token}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid or expired password reset token")
		}
		logger.Error("Failed to query auth record for token confirmation", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	expiresVal, _ := recordMap["resetTokenExpiresAt"].(string)
	if expiresVal == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid or expired password reset token")
	}

	expiresTime, err := time.Parse(time.RFC3339, expiresVal)
	if err != nil || time.Now().UTC().After(expiresTime) {
		return echo.NewHTTPError(http.StatusBadRequest, "Password reset token has expired")
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error("Failed to hash new password", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	_, err = h.DB.Update(moulName, dbx.Params{
		"passwordHash":        string(newHash),
		"resetToken":          nil,
		"resetTokenExpiresAt": nil,
		"updated_at":          time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"id": recordMap["id"]}).Execute()
	if err != nil {
		logger.Error("Failed to update user password hash", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Password reset successfully",
	})
}

type RefreshTokenPayload struct {
	Token string `json:"token"`
}

// RefreshToken revokes the existing JWT token and issues a fresh JWT token.
func (h *AuthHandler) RefreshToken(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for token refresh", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	tokenString := ""
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			tokenString = parts[1]
		}
	}
	if tokenString == "" {
		payload := new(RefreshTokenPayload)
		if err := c.Bind(payload); err == nil && payload.Token != "" {
			tokenString = strings.TrimSpace(payload.Token)
		}
	}

	if tokenString == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Authorization token is required")
	}

	if db.IsTokenRevoked(h.DB, tokenString) {
		return echo.NewHTTPError(http.StatusUnauthorized, "Token has been revoked")
	}

	claims, err := auth.VerifyTokenAllowExpired(tokenString)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token: "+err.Error())
	}

	if claims.MoulName != moulName {
		return echo.NewHTTPError(http.StatusUnauthorized, "Token does not belong to this collection")
	}

	// Revoke old token
	var expTime time.Time
	if claims.ExpiresAt != nil {
		expTime = claims.ExpiresAt.Time
	} else {
		expTime = time.Now().Add(24 * time.Hour)
	}
	_ = db.RevokeToken(h.DB, tokenString, expTime)

	// Fetch fresh user record
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": claims.ID}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusUnauthorized, "User record not found")
		}
		logger.Error("Failed to query user record for refresh", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	id, _ := recordMap["id"].(string)
	userEmail, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	newToken, err := auth.GenerateToken(id, userEmail, username, moulName)
	if err != nil {
		logger.Error("Failed to generate refreshed auth token", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  newToken,
		"record": normalizeRecord(moul, recordMap),
	})
}

// Logout revokes the current user's Authorization JWT token.
func (h *AuthHandler) Logout(c *echo.Context) error {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Authorization header is required")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid Authorization header format")
	}

	tokenString := parts[1]
	claims, err := auth.VerifyTokenAllowExpired(tokenString)
	if err != nil {
		_ = db.RevokeToken(h.DB, tokenString, time.Now().Add(24*time.Hour))
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Logged out successfully",
		})
	}

	var expTime time.Time
	if claims.ExpiresAt != nil {
		expTime = claims.ExpiresAt.Time
	} else {
		expTime = time.Now().Add(24 * time.Hour)
	}

	_ = db.RevokeToken(h.DB, tokenString, expTime)

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}
