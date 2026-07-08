package handlers

import (
	"bytes"
	"database/sql"
	"net/http"
	"text/template"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func renderEmailTemplate(tmplStr string, data interface{}) (string, error) {
	t, err := template.New("email").Parse(tmplStr)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func findWorkerTable(dbConn *dbx.DB) (string, error) {
	mouls, err := db.LoadAllMouls(dbConn)
	if err != nil {
		return "", err
	}
	for _, m := range mouls {
		if m.Type == "worker" {
			return m.Name, nil
		}
	}
	return "", nil
}

// GetEmailTemplates retrieves the email templates for the given auth moul collection.
func (h *AuthHandler) GetEmailTemplates(c *echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for email templates", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	if moul.EmailTemplates == nil {
		defaults := schema.GetDefaultEmailTemplates()
		moul.EmailTemplates = &defaults
	}

	return c.JSON(http.StatusOK, moul.EmailTemplates)
}

// UpdateEmailTemplates updates the email templates for the given auth moul collection.
func (h *AuthHandler) UpdateEmailTemplates(c *echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for email templates update", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	req := new(schema.EmailTemplates)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if err := db.UpdateMoulEmailTemplates(h.DB, moul.ID, req); err != nil {
		logger.Error("Failed to update email templates", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update email templates")
	}

	return c.JSON(http.StatusOK, req)
}

type TestEmailPayload struct {
	Email    string `json:"email"`
	Template string `json:"template"` // "verification", "password_reset", "confirm_email_change", "otp", "login_alert"
}

// SendTestEmail sends a mock/test email using the specified template config.
func (h *AuthHandler) SendTestEmail(c *echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul for test email", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	payload := new(TestEmailPayload)
	if err := c.Bind(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if payload.Email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email is required")
	}
	if payload.Template == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "template key is required")
	}

	if moul.EmailTemplates == nil {
		defaults := schema.GetDefaultEmailTemplates()
		moul.EmailTemplates = &defaults
	}

	var rawSubject, rawBody string
	switch payload.Template {
	case "verification":
		rawSubject = moul.EmailTemplates.Verification.Subject
		rawBody = moul.EmailTemplates.Verification.Body
	case "password_reset":
		rawSubject = moul.EmailTemplates.PasswordReset.Subject
		rawBody = moul.EmailTemplates.PasswordReset.Body
	case "confirm_email_change":
		rawSubject = moul.EmailTemplates.ConfirmEmailChange.Subject
		rawBody = moul.EmailTemplates.ConfirmEmailChange.Body
	case "otp":
		rawSubject = moul.EmailTemplates.OTP.Subject
		rawBody = moul.EmailTemplates.OTP.Body
	case "login_alert":
		rawSubject = moul.EmailTemplates.LoginAlert.Subject
		rawBody = moul.EmailTemplates.LoginAlert.Body
	default:
		return echo.NewHTTPError(http.StatusBadRequest, "invalid template key: must be verification, password_reset, confirm_email_change, otp, or login_alert")
	}

	// Substitute template parameters
	templateData := map[string]interface{}{
		"Link":     "http://localhost:8090/dummy-link-test",
		"OTP":      "123456",
		"Username": "TestUser",
		"Email":    payload.Email,
	}

	subject, err := renderEmailTemplate(rawSubject, templateData)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to render subject template: "+err.Error())
	}
	body, err := renderEmailTemplate(rawBody, templateData)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to render body template: "+err.Error())
	}

	// Log first for console visibility / mock delivery
	logger.Info("========================================")
	logger.Info("TEST EMAIL SENT", "moul", moulName, "template", payload.Template)
	logger.Info("To:", "email", payload.Email)
	logger.Info("Subject:", "subject", subject)
	logger.Info("Body:", "body", body)
	logger.Info("========================================")

	// If worker Engine is available, enqueue a SendEmail job
	if h.Engine != nil {
		tableName, err := findWorkerTable(h.DB)
		if err != nil {
			logger.Error("Failed to find worker table for background email job", "err", err)
		} else if tableName != "" {
			_, err = h.Engine.Enqueue(c.Request().Context(), tableName, map[string]interface{}{
				"worker":   "SendEmail",
				"priority": 1,
				"args": map[string]interface{}{
					"to":      payload.Email,
					"subject": subject,
					"body":    body,
				},
			})
			if err != nil {
				logger.Error("Failed to enqueue SendEmail test job", "err", err)
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to queue test email")
			}
		} else {
			logger.Warn("No worker collection found. Cannot enqueue background SendEmail job.")
		}
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Test email sent/queued successfully (check server logs/console for details)",
	})
}
