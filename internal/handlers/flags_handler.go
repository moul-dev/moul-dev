package handlers

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/flags"
	"github.com/pocketbase/dbx"
)

type FlagsHandler struct {
	store *flags.Store
}

func NewFlagsHandler(dbConn *dbx.DB) *FlagsHandler {
	return &FlagsHandler{
		store: flags.NewStore(dbConn),
	}
}

// GetStore returns the underlying feature flag store.
func (h *FlagsHandler) GetStore() *flags.Store {
	return h.store
}

// ListFlags returns all feature flags.
func (h *FlagsHandler) ListFlags(c *echo.Context) error {
	list, err := h.store.ListFlags()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, list)
}

// GetFlag returns a single feature flag by key.
func (h *FlagsHandler) GetFlag(c *echo.Context) error {
	key := c.Param("key")
	flag, err := h.store.GetFlag(key)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Flag not found"})
	}
	return c.JSON(http.StatusOK, flag)
}

// CreateFlag creates a new feature flag.
func (h *FlagsHandler) CreateFlag(c *echo.Context) error {
	var payload struct {
		Key          string            `json:"key"`
		Description  string            `json:"description"`
		Enabled      *bool             `json:"enabled"`
		DefaultValue string            `json:"default_value"`
		Gates        flags.GatesConfig `json:"gates"`
	}

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	if payload.Key == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Flag key is required"})
	}

	enabled := true
	if payload.Enabled != nil {
		enabled = *payload.Enabled
	}

	flag := flags.NewFlag("", payload.Key, payload.Description, enabled, payload.DefaultValue, payload.Gates)
	if err := h.store.SaveFlag(flag); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, flag)
}

// UpdateFlag updates an existing feature flag.
func (h *FlagsHandler) UpdateFlag(c *echo.Context) error {
	key := c.Param("key")
	existing, err := h.store.GetFlag(key)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Flag not found"})
	}

	var payload struct {
		Description  *string            `json:"description"`
		Enabled      *bool              `json:"enabled"`
		DefaultValue *string            `json:"default_value"`
		Gates        *flags.GatesConfig `json:"gates"`
	}

	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	if payload.Description != nil {
		existing.Description = *payload.Description
	}
	if payload.Enabled != nil {
		existing.Enabled = *payload.Enabled
	}
	if payload.DefaultValue != nil {
		existing.DefaultValue = *payload.DefaultValue
	}
	if payload.Gates != nil {
		existing.Gates = *payload.Gates
	}

	if err := h.store.SaveFlag(existing); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, existing)
}

// DeleteFlag deletes a feature flag by key.
func (h *FlagsHandler) DeleteFlag(c *echo.Context) error {
	key := c.Param("key")
	if err := h.store.DeleteFlag(key); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Flag deleted successfully"})
}

// EvaluateFlag evaluates a feature flag against an optional context payload.
func (h *FlagsHandler) EvaluateFlag(c *echo.Context) error {
	key := c.Param("key")
	flag, err := h.store.GetFlag(key)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Flag not found"})
	}

	var payload struct {
		Context map[string]interface{} `json:"context"`
	}

	_ = c.Bind(&payload)

	res := flags.Evaluate(flag, payload.Context)
	return c.JSON(http.StatusOK, res)
}
