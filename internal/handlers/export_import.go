package handlers

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/dataio"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/pocketbase/dbx"
)

// ExportImportHandler handles HTTP endpoints for bulk CSV and JSON data export and import.
type ExportImportHandler struct {
	DB *dbx.DB
}

// NewExportImportHandler creates a new ExportImportHandler instance.
func NewExportImportHandler(dbConn *dbx.DB) *ExportImportHandler {
	return &ExportImportHandler{DB: dbConn}
}

// ExportRecords streams records from a collection as a downloadable CSV or JSON file.
// GET /api/moul/:name/export
func (h *ExportImportHandler) ExportRecords(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Collection %q not found", moulName))
		}
		logger.Error("Failed to load collection for export", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load collection")
	}

	format := strings.ToLower(strings.TrimSpace(c.QueryParam("format")))
	if format == "" {
		format = "json"
	}
	if format != "csv" && format != "json" {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid export format (supported: 'csv', 'json')")
	}

	includeSchema := c.QueryParam("includeSchema") == "true"
	sortParam := c.QueryParam("sort")
	filterParam := c.QueryParam("filter")

	opts := dataio.ExportOptions{
		Format:        format,
		IncludeSchema: includeSchema,
		Sort:          sortParam,
		Filter:        filterParam,
	}

	timestamp := time.Now().UTC().Format("2006-01-02-150405")
	filename := fmt.Sprintf("%s-records-%s.%s", moulName, timestamp, format)

	if format == "csv" {
		c.Response().Header().Set(echo.HeaderContentType, "text/csv; charset=utf-8")
	} else {
		c.Response().Header().Set(echo.HeaderContentType, "application/json; charset=utf-8")
	}
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	c.Response().WriteHeader(http.StatusOK)

	if err := dataio.ExportCollection(h.DB, moul, opts, c.Response()); err != nil {
		logger.Error("Export failed during streaming", "moul", moulName, "err", err)
		return fmt.Errorf("failed to stream export data: %w", err)
	}

	return nil
}

// ImportRecords processes an uploaded CSV or JSON file/payload and inserts/updates records.
// POST /api/moul/:name/import
func (h *ExportImportHandler) ImportRecords(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Collection %q not found", moulName))
		}
		logger.Error("Failed to load collection for import", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to load collection")
	}

	mode := c.FormValue("mode")
	if mode == "" {
		mode = c.QueryParam("mode")
	}
	if mode == "" {
		mode = "upsert"
	}

	onError := c.FormValue("onError")
	if onError == "" {
		onError = c.FormValue("error_strategy")
	}
	if onError == "" {
		onError = c.QueryParam("onError")
	}
	if onError == "" {
		onError = c.QueryParam("error_strategy")
	}
	if onError == "" {
		onError = "atomic"
	}

	format := c.FormValue("format")
	if format == "" {
		format = c.QueryParam("format")
	}

	var reader io.Reader

	// Check if submitted as multipart form with file
	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		file, openErr := fileHeader.Open()
		if openErr != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Failed to read uploaded file: %v", openErr))
		}
		defer file.Close()
		reader = file

		if format == "" {
			ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
			if ext == ".csv" {
				format = "csv"
			} else if ext == ".json" {
				format = "json"
			}
		}
	} else {
		// Read directly from request body
		reader = c.Request().Body
		if format == "" {
			ct := c.Request().Header.Get(echo.HeaderContentType)
			if strings.Contains(ct, "text/csv") {
				format = "csv"
			} else if strings.Contains(ct, "application/json") {
				format = "json"
			}
		}
	}

	opts := dataio.ImportOptions{
		Format:  format,
		Mode:    mode,
		OnError: onError,
	}

	result, err := dataio.ImportCollection(h.DB, moul, opts, reader)
	if err != nil {
		if result != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"success": false,
				"error":   err.Error(),
				"result":  result,
			})
		}
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Import error: %v", err))
	}

	return c.JSON(http.StatusOK, result)
}
