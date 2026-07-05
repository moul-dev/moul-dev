package handlers

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
)

type OTPRequestPayload struct {
	Email string `json:"email"`
}

type OTPVerifyPayload struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// generateOTP creates a 6-digit numeric OTP code.
func generateOTP() (string, error) {
	codes := []byte("0123456789")
	otp := make([]byte, 6)
	_, err := rand.Read(otp)
	if err != nil {
		return "", err
	}
	for i := 0; i < 6; i++ {
		otp[i] = codes[int(otp[i])%len(codes)]
	}
	return string(otp), nil
}

// RequestOTP generates a 6-digit OTP, prints it to the console, and updates the DB.
func (h *AuthHandler) RequestOTP(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for OTP request", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(OTPRequestPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	email := strings.TrimSpace(payload.Email)
	if email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email is required")
	}

	// 1. Check if user already exists
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"email": email}).One(&record)

	if err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to query auth record during OTP request", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	var username string

	// 2. Auto-signup: If user does not exist, create a new record
	if err == sql.ErrNoRows {
		// Generate unique username from email prefix
		baseUsername := strings.Split(email, "@")[0]
		reg := regexp.MustCompile("[^a-zA-Z0-9_]")
		baseUsername = reg.ReplaceAllString(baseUsername, "")
		if baseUsername == "" {
			baseUsername = "user"
		}

		username = baseUsername
		for {
			var exists int
			err := h.DB.Select("COUNT(*)").From(moulName).Where(dbx.HashExp{"username": username}).Row(&exists)
			if err != nil {
				logger.Error("Failed to check username collision during OTP auto-signup", "moul", moulName, "err", err)
				return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
			}
			if exists == 0 {
				break
			}
			username = fmt.Sprintf("%s_%s", baseUsername, util.RandomID()[:4])
		}

		// Insert user with null passwordHash
		id := moulName + "-" + util.RandomID()
		now := time.Now().UTC().Format(time.RFC3339)
		_, err = h.DB.Insert(moulName, dbx.Params{
			"id":         id,
			"username":   username,
			"email":      email,
			"created_at": now,
			"updated_at": now,
		}).Execute()

		if err != nil {
			logger.Error("Failed to insert new user during OTP auto-signup", "moul", moulName, "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}
	} else {
		recordMap := nullStringMapToMap(record)
		username, _ = recordMap["username"].(string)
	}

	// 3. Generate and store OTP code
	otpCode, err := generateOTP()
	if err != nil {
		logger.Error("Failed to generate OTP code", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	otpExpiresAt := time.Now().UTC().Add(10 * time.Minute).Format(time.RFC3339)

	_, err = h.DB.Update(moulName, dbx.Params{
		"otpCode":      otpCode,
		"otpExpiresAt": otpExpiresAt,
		"updated_at":   time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"email": email}).Execute()

	if err != nil {
		logger.Error("Failed to update user OTP columns", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	// 4. Render template and dispatch email
	if moul.EmailTemplates == nil {
		defaults := schema.GetDefaultEmailTemplates()
		moul.EmailTemplates = &defaults
	}

	otpTemplate := moul.EmailTemplates.OTP
	templateData := map[string]interface{}{
		"OTP":      otpCode,
		"Username": username,
		"Email":    email,
	}

	subject, err := renderEmailTemplate(otpTemplate.Subject, templateData)
	if err != nil {
		logger.Error("Failed to render OTP subject template", "err", err)
		subject = otpTemplate.Subject
	}

	body, err := renderEmailTemplate(otpTemplate.Body, templateData)
	if err != nil {
		logger.Error("Failed to render OTP body template", "err", err)
		body = otpTemplate.Body
	}

	// Log OTP to terminal for local debugging / mock delivery
	logger.Info("========================================")
	logger.Info("EMAIL OTP REQUEST RECEIVED", "moul", moulName)
	logger.Info("To:", "email", email)
	logger.Info("Subject:", "subject", subject)
	logger.Info("Body:", "body", body)
	logger.Info("Code:", "otp", otpCode)
	logger.Info("Expires At:", "time", otpExpiresAt)
	logger.Info("========================================")

	// If worker Engine is available, enqueue a SendEmail job
	if h.Engine != nil {
		tableName, err := findWorkerTable(h.DB)
		if err != nil {
			logger.Error("Failed to find worker table for background OTP email job", "err", err)
		} else if tableName != "" {
			_, err = h.Engine.Enqueue(c.Request().Context(), tableName, map[string]interface{}{
				"worker":   "SendEmail",
				"priority": 1,
				"args": map[string]interface{}{
					"to":      email,
					"subject": subject,
					"body":    body,
				},
			})
			if err != nil {
				logger.Error("Failed to enqueue OTP SendEmail job", "err", err)
			}
		} else {
			logger.Warn("No worker collection found. Cannot enqueue background SendEmail job.")
		}
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "OTP generated and sent successfully (check server logs/console for code)",
	})
}

// AuthWithOTP verifies OTP and returns a signed JWT token.
func (h *AuthHandler) AuthWithOTP(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for OTP verification", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(OTPVerifyPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	email := strings.TrimSpace(payload.Email)
	code := strings.TrimSpace(payload.Code)

	if email == "" || code == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and code are required")
	}

	// Fetch record by email
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"email": email}).One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid email or OTP code")
		}
		logger.Error("Failed to query auth record during OTP verification", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)

	// Verify OTP
	dbOtpVal, ok := recordMap["otpCode"]
	if !ok || dbOtpVal == nil || dbOtpVal == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "No active OTP found for this email. Please request a new one.")
	}

	dbOtpCode, ok := dbOtpVal.(string)
	if !ok || dbOtpCode != code {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid email or OTP code")
	}

	dbExpiresVal, ok := recordMap["otpExpiresAt"]
	if !ok || dbExpiresVal == nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid email or OTP code")
	}

	dbExpiresStr, ok := dbExpiresVal.(string)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid email or OTP code")
	}

	expiresTime, err := time.Parse(time.RFC3339, dbExpiresStr)
	if err != nil {
		logger.Error("Failed to parse OTP expiration timestamp from DB", "expires", dbExpiresStr, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if time.Now().UTC().After(expiresTime) {
		return echo.NewHTTPError(http.StatusBadRequest, "OTP code has expired. Please request a new one.")
	}

	// Clear OTP fields in the database
	_, err = h.DB.Update(moulName, dbx.Params{
		"otpCode":      nil,
		"otpExpiresAt": nil,
		"updated_at":   time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"email": email}).Execute()

	if err != nil {
		logger.Error("Failed to clear OTP fields after successful verification", "moul", moulName, "err", err)
		// non-blocking, we can continue to log the user in
	}

	// Get claim details
	id, _ := recordMap["id"].(string)
	userEmail, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	// Generate JWT
	token, err := auth.GenerateToken(id, userEmail, username, moulName)
	if err != nil {
		logger.Error("Failed to generate auth token", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": normalizeRecord(moul, recordMap),
	})
}
