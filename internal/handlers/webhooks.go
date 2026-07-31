package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/moul-dev/moul-dev/internal/webhooks"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
)

type WebhookHandler struct {
	DB *dbx.DB
}

func NewWebhookHandler(dbConn *dbx.DB) *WebhookHandler {
	return &WebhookHandler{DB: dbConn}
}

// ListWebhooks returns all configured webhooks for a collection.
func (h *WebhookHandler) ListWebhooks(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if moul.Webhooks == nil {
		return c.JSON(http.StatusOK, []schema.Webhook{})
	}
	return c.JSON(http.StatusOK, moul.Webhooks)
}

// CreateWebhook adds a new webhook to a collection.
func (h *WebhookHandler) CreateWebhook(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	hook := new(schema.Webhook)
	if err := c.Bind(hook); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	hook.URL = strings.TrimSpace(hook.URL)
	if hook.URL == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Webhook URL is required")
	}

	if hook.ID == "" {
		hook.ID = "wh-" + util.RandomID()
	}

	if len(hook.Events) == 0 {
		hook.Events = []string{"*"}
	}

	now := time.Now().UTC().Format(time.RFC3339)
	hook.CreatedAt = now
	hook.UpdatedAt = now

	moul.Webhooks = append(moul.Webhooks, *hook)

	if err := db.UpdateMoulMetadata(h.DB, moulName, moul); err != nil {
		logger.Error("Failed to update metadata for webhook addition", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save webhook")
	}

	return c.JSON(http.StatusCreated, hook)
}

// GetWebhook returns a specific webhook by ID.
func (h *WebhookHandler) GetWebhook(c *echo.Context) error {
	moulName := c.Param("name")
	hookID := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	for _, hook := range moul.Webhooks {
		if hook.ID == hookID {
			return c.JSON(http.StatusOK, hook)
		}
	}

	return echo.NewHTTPError(http.StatusNotFound, "Webhook not found")
}

// UpdateWebhook updates an existing webhook by ID.
func (h *WebhookHandler) UpdateWebhook(c *echo.Context) error {
	moulName := c.Param("name")
	hookID := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	var foundIdx = -1
	for i, hook := range moul.Webhooks {
		if hook.ID == hookID {
			foundIdx = i
			break
		}
	}

	if foundIdx == -1 {
		return echo.NewHTTPError(http.StatusNotFound, "Webhook not found")
	}

	updated := new(schema.Webhook)
	if err := c.Bind(updated); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	existing := &moul.Webhooks[foundIdx]
	if updated.URL != "" {
		existing.URL = strings.TrimSpace(updated.URL)
	}
	if len(updated.Events) > 0 {
		existing.Events = updated.Events
	}
	if updated.Secret != "" {
		existing.Secret = updated.Secret
	}
	existing.Enabled = updated.Enabled
	existing.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	if err := db.UpdateMoulMetadata(h.DB, moulName, moul); err != nil {
		logger.Error("Failed to update metadata for webhook modification", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update webhook")
	}

	return c.JSON(http.StatusOK, existing)
}

// DeleteWebhook removes a webhook by ID from a collection.
func (h *WebhookHandler) DeleteWebhook(c *echo.Context) error {
	moulName := c.Param("name")
	hookID := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	var newWebhooks []schema.Webhook
	found := false
	for _, hook := range moul.Webhooks {
		if hook.ID == hookID {
			found = true
		} else {
			newWebhooks = append(newWebhooks, hook)
		}
	}

	if !found {
		return echo.NewHTTPError(http.StatusNotFound, "Webhook not found")
	}

	moul.Webhooks = newWebhooks
	if err := db.UpdateMoulMetadata(h.DB, moulName, moul); err != nil {
		logger.Error("Failed to update metadata for webhook deletion", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete webhook")
	}

	return c.NoContent(http.StatusNoContent)
}

// TestWebhook triggers a test ping to a webhook.
func (h *WebhookHandler) TestWebhook(c *echo.Context) error {
	moulName := c.Param("name")
	hookID := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	var targetHook schema.Webhook
	if hookID != "" {
		found := false
		for _, hook := range moul.Webhooks {
			if hook.ID == hookID {
				targetHook = hook
				found = true
				break
			}
		}
		if !found {
			return echo.NewHTTPError(http.StatusNotFound, "Webhook not found")
		}
	} else {
		if err := c.Bind(&targetHook); err != nil || targetHook.URL == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid webhook body or missing URL")
		}
	}

	statusCode, duration, respText, testErr := webhooks.TestWebhook(c.Request().Context(), targetHook, moulName)
	success := statusCode >= 200 && statusCode < 300 && testErr == nil

	errStr := ""
	if testErr != nil {
		errStr = testErr.Error()
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status_code": statusCode,
		"duration_ms": duration,
		"response":    respText,
		"error":       errStr,
		"success":     success,
	})
}
