package handlers

import (
	"database/sql"
	"net/http"

	"github.com/moul-dev/moul-dev/internal/logger"

	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
)

type VisitsHandler struct {
	DB *dbx.DB
}

func NewVisitsHandler(dbConn *dbx.DB) *VisitsHandler {
	return &VisitsHandler{DB: dbConn}
}

// ListVisits lists all visits recorded, requiring authentication.
func (h *VisitsHandler) ListVisits(c echo.Context) error {
	authUser := middleware.GetAuthRecord(c)
	if authUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to access visits log")
	}

	var rows []dbx.NullStringMap
	err := h.DB.Select("*").From("_visits").OrderBy("started_at DESC").All(&rows)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to retrieve visits", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve visits")
	}

	visits := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		visitMap := make(map[string]interface{})
		for k, v := range row {
			if v.Valid {
				visitMap[k] = v.String
			} else {
				visitMap[k] = nil
			}
		}
		visits = append(visits, visitMap)
	}

	return c.JSON(http.StatusOK, visits)
}

// GetVisit retrieves a single visit record by ID, requiring authentication.
func (h *VisitsHandler) GetVisit(c echo.Context) error {
	authUser := middleware.GetAuthRecord(c)
	if authUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to access visit details")
	}

	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Visit ID is required")
	}

	var row dbx.NullStringMap
	err := h.DB.Select("*").From("_visits").Where(dbx.HashExp{"id": id}).One(&row)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Visit not found")
		}
		logger.Error("Failed to retrieve visit", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	visitMap := make(map[string]interface{})
	for k, v := range row {
		if v.Valid {
			visitMap[k] = v.String
		} else {
			visitMap[k] = nil
		}
	}

	return c.JSON(http.StatusOK, visitMap)
}
