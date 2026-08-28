package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/moul-dev/moul-dev/internal/logger"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/pocketbase/dbx"
)

type VisitsHandler struct {
	DB *dbx.DB
}

func NewVisitsHandler(dbConn *dbx.DB) *VisitsHandler {
	return &VisitsHandler{DB: dbConn}
}

// ListVisits lists visits recorded with pagination support, requiring authentication.
func (h *VisitsHandler) ListVisits(c *echo.Context) error {
	authUser := middleware.GetAuthRecord(c)
	if authUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to access visits log")
	}

	pageParam := c.QueryParam("page")
	perPageParam := c.QueryParam("perPage")

	page := 1
	if pageParam != "" {
		if p, err := strconv.Atoi(pageParam); err == nil && p > 0 {
			page = p
		}
	}

	perPage := 50
	if perPageParam != "" {
		if pp, err := strconv.Atoi(perPageParam); err == nil && pp > 0 {
			perPage = pp
		}
	}
	if perPage > 200 {
		perPage = 200
	}

	fromParam := c.QueryParam("from")
	toParam := c.QueryParam("to")

	var conditions []dbx.Expression
	if fromParam != "" {
		conditions = append(conditions, dbx.NewExp("started_at >= {:from}", dbx.Params{"from": fromParam}))
	}
	if toParam != "" {
		conditions = append(conditions, dbx.NewExp("started_at <= {:to}", dbx.Params{"to": toParam}))
	}

	var rows []dbx.NullStringMap
	var err error

	// If page parameter is explicitly requested, return paginated envelope
	if pageParam != "" || perPageParam != "" {
		offset := (page - 1) * perPage

		countQuery := h.DB.Select("COUNT(*)").From("_visits")
		if len(conditions) > 0 {
			countQuery = countQuery.Where(dbx.And(conditions...))
		}

		var totalItems int
		if err := countQuery.Row(&totalItems); err != nil {
			logger.Error("Failed to count visits", "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to count visits")
		}

		selectQuery := h.DB.Select("*").From("_visits").OrderBy("started_at DESC").Limit(int64(perPage)).Offset(int64(offset))
		if len(conditions) > 0 {
			selectQuery = selectQuery.Where(dbx.And(conditions...))
		}

		err = selectQuery.All(&rows)
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

		totalPages := (totalItems + perPage - 1) / perPage
		return c.JSON(http.StatusOK, map[string]interface{}{
			"page":       page,
			"perPage":    perPage,
			"totalItems": totalItems,
			"totalPages": totalPages,
			"items":      visits,
		})
	}

	// Legacy / default array response capped at 200 records
	selectQuery := h.DB.Select("*").From("_visits").OrderBy("started_at DESC").Limit(200)
	if len(conditions) > 0 {
		selectQuery = selectQuery.Where(dbx.And(conditions...))
	}
	err = selectQuery.All(&rows)
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
func (h *VisitsHandler) GetVisit(c *echo.Context) error {
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
