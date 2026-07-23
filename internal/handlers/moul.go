package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
)

type MoulHandler struct {
	DB *dbx.DB
}

func NewMoulHandler(dbConn *dbx.DB) *MoulHandler {
	return &MoulHandler{DB: dbConn}
}

// CreateMoul creates a dynamic table and inserts its metadata.
func (h *MoulHandler) CreateMoul(c *echo.Context) error {
	m := new(schema.Moul)
	if err := c.Bind(m); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Validate name
	m.Name = strings.TrimSpace(m.Name)
	if m.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Moul name is required")
	}
	if strings.HasPrefix(m.Name, "_") {
		return echo.NewHTTPError(http.StatusBadRequest, "Moul name cannot start with underscore")
	}

	// Validate table name is safe for SQL
	if err := db.ValidateTableName(m.Name); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid moul name: must start with a letter and contain only letters, digits, or underscores (max 63 chars)")
	}

	// Default to base type
	if m.Type != "auth" && m.Type != "worker" && m.Type != "analytic" {
		m.Type = "base"
	}

	// Default rules for auth type
	if m.Type == "auth" {
		if m.Rules.ListRule == "" {
			m.Rules.ListRule = "id = @request.auth.id"
		}
		if m.Rules.ViewRule == "" {
			m.Rules.ViewRule = "id = @request.auth.id"
		}
		if m.Rules.UpdateRule == "" {
			m.Rules.UpdateRule = "id = @request.auth.id"
		}
		if m.Rules.DeleteRule == "" {
			m.Rules.DeleteRule = "id = @request.auth.id"
		}
	}

	if m.ID == "" {
		m.ID = util.RandomID()
	}

	// Create physical sqlite table
	if err := db.CreateMoulTable(h.DB, m); err != nil {
		logger.Error("Failed to create table", "moul", m.Name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create table")
	}

	// Save schema metadata
	if err := db.SaveMoulMetadata(h.DB, m); err != nil {
		logger.Error("Failed to save metadata for moul", "moul", m.Name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save moul metadata")
	}

	return c.JSON(http.StatusCreated, m)
}

// ListMoul returns all metadata for registered moul.
func (h *MoulHandler) ListMoul(c *echo.Context) error {
	mouls, err := db.LoadAllMoul(h.DB)
	if err != nil {
		logger.Error("Failed to fetch moul", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve moul")
	}
	return c.JSON(http.StatusOK, mouls)
}

// DeleteMoul drops the physical table and deletes its meta record.
func (h *MoulHandler) DeleteMoul(c *echo.Context) error {
	name := c.Param("name")
	if name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Moul name is required")
	}

	// Verify moul exists
	moul, err := db.LoadMoulByName(h.DB, name)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul", "moul", name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to look up moul")
	}

	// Physical drop table (use QuoteIdentifier for safety)
	_, err = h.DB.NewQuery(fmt.Sprintf("DROP TABLE IF EXISTS %s;", db.QuoteIdentifier(moul.Name))).Execute()
	if err != nil {
		logger.Error("Failed to drop table", "moul", moul.Name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to drop table")
	}

	// Delete from _moul metadata
	_, err = h.DB.Delete("_moul", dbx.HashExp{"name": name}).Execute()
	if err != nil {
		logger.Error("Failed to delete metadata for moul", "moul", name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete moul metadata")
	}

	return c.NoContent(http.StatusNoContent)
}

// UpdateMoul updates an existing collection schema, rules, fields, and physical table.
func (h *MoulHandler) UpdateMoul(c *echo.Context) error {
	name := c.Param("name")
	if name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Moul name is required")
	}

	origMoul, err := db.LoadMoulByName(h.DB, name)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul", "moul", name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to look up moul")
	}

	updated := new(schema.Moul)
	if err := c.Bind(updated); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	updated.Name = strings.TrimSpace(updated.Name)
	if updated.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Moul name is required")
	}
	if strings.HasPrefix(updated.Name, "_") {
		return echo.NewHTTPError(http.StatusBadRequest, "Moul name cannot start with underscore")
	}

	if err := db.ValidateTableName(updated.Name); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid moul name: must start with a letter and contain only letters, digits, or underscores (max 63 chars)")
	}

	updated.ID = origMoul.ID
	updated.CreatedAt = origMoul.CreatedAt
	if updated.Type == "" {
		updated.Type = origMoul.Type
	}

	// Default rules for auth type if blank
	if updated.Type == "auth" {
		if updated.Rules.ListRule == "" {
			updated.Rules.ListRule = "id = @request.auth.id"
		}
		if updated.Rules.ViewRule == "" {
			updated.Rules.ViewRule = "id = @request.auth.id"
		}
		if updated.Rules.UpdateRule == "" {
			updated.Rules.UpdateRule = "id = @request.auth.id"
		}
		if updated.Rules.DeleteRule == "" {
			updated.Rules.DeleteRule = "id = @request.auth.id"
		}
	}

	// Rename physical table if name changed
	if updated.Name != name {
		// Verify target name does not already exist
		if _, err := db.LoadMoulByName(h.DB, updated.Name); err == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Moul with name %q already exists", updated.Name))
		}
		if err := db.RenameMoulTable(h.DB, name, updated.Name); err != nil {
			logger.Error("Failed to rename table", "old", name, "new", updated.Name, "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to rename table")
		}
	}

	// Sync new field columns to table
	if err := db.SyncMoulTableColumns(h.DB, updated); err != nil {
		logger.Error("Failed to sync table columns", "moul", updated.Name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to sync table columns")
	}

	// Update metadata in _moul
	if err := db.UpdateMoulMetadata(h.DB, name, updated); err != nil {
		logger.Error("Failed to update metadata for moul", "moul", updated.Name, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update moul metadata")
	}

	return c.JSON(http.StatusOK, updated)
}

