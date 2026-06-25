package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
)

type MoulHandler struct {
	DB *dbx.DB
}

func NewMoulHandler(dbConn *dbx.DB) *MoulHandler {
	return &MoulHandler{DB: dbConn}
}

// CreateMoul creates a dynamic table and inserts its metadata.
func (h *MoulHandler) CreateMoul(c echo.Context) error {
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

	// Default to base type
	if m.Type != "auth" && m.Type != "worker" && m.Type != "analytic" {
		m.Type = "base"
	}

	if m.ID == "" {
		m.ID = util.RandomID()
	}

	// Create physical sqlite table
	if err := db.CreateMoulTable(h.DB, m); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Save schema metadata
	if err := db.SaveMoulMetadata(h.DB, m); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, m)
}

// ListMouls returns all metadata for registered mouls.
func (h *MoulHandler) ListMouls(c echo.Context) error {
	mouls, err := db.LoadAllMouls(h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, mouls)
}

// DeleteMoul drops the physical table and deletes its meta record.
func (h *MoulHandler) DeleteMoul(c echo.Context) error {
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
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Physical drop table
	_, err = h.DB.NewQuery(fmt.Sprintf("DROP TABLE IF EXISTS %s;", moul.Name)).Execute()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to drop table: "+err.Error())
	}

	// Delete from _mouls metadata
	_, err = h.DB.Delete("_mouls", dbx.HashExp{"name": name}).Execute()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete metadata: "+err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
