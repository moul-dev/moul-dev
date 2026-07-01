package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
)

type SettingsHandler struct {
	DB *dbx.DB
}

func NewSettingsHandler(dbConn *dbx.DB) *SettingsHandler {
	return &SettingsHandler{DB: dbConn}
}

// GetSettings fetches all settings from the database and returns them as a JSON object.
func (h *SettingsHandler) GetSettings(c echo.Context) error {
	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}
	err := h.DB.Select("key", "value").From("_settings").All(&rows)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load settings: "+err.Error())
	}

	settings := make(map[string]string)
	for _, row := range rows {
		settings[row.Key] = row.Value
	}

	return c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates key-value settings in the database.
func (h *SettingsHandler) UpdateSettings(c echo.Context) error {
	body := make(map[string]string)
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON payload")
	}

	// Update only existing settings keys for security
	allowedKeys := map[string]bool{
		"s3_enabled":              true,
		"s3_bucket":               true,
		"s3_endpoint":             true,
		"s3_region":               true,
		"s3_access_key":           true,
		"s3_secret_key":           true,
		"s3_force_path_style":     true,
		"litestream_enabled":      true,
		"litestream_replica_path": true,
	}

	tx, err := h.DB.Begin()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to start transaction: "+err.Error())
	}
	defer tx.Rollback()

	for k, v := range body {
		if !allowedKeys[k] {
			continue
		}

		_, err = tx.Update("_settings", dbx.Params{"value": v}, dbx.HashExp{"key": k}).Execute()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update setting "+k+": "+err.Error())
		}
	}

	if err := tx.Commit(); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to commit settings: "+err.Error())
	}

	// Return updated settings
	return h.GetSettings(c)
}
