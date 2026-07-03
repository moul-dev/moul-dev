package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
)

// RequestsHandler handles queries against the _requests table.
type RequestsHandler struct {
	DB *dbx.DB
}

// NewRequestsHandler creates a new RequestsHandler.
func NewRequestsHandler(dbConn *dbx.DB) *RequestsHandler {
	return &RequestsHandler{DB: dbConn}
}

// ListRequests lists tracked HTTP requests with pagination, requiring authentication.
func (h *RequestsHandler) ListRequests(c echo.Context) error {
	authUser := middleware.GetAuthRecord(c)
	if authUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to access request logs")
	}

	// Parse pagination params
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	perPage, _ := strconv.Atoi(c.QueryParam("perPage"))
	if perPage < 1 || perPage > 200 {
		perPage = 50
	}

	offset := (page - 1) * perPage

	// Get total count
	var totalItems int
	err := h.DB.Select("COUNT(*)").From("_requests").Row(&totalItems)
	if err != nil {
		logger.Error("Failed to count requests", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve request count")
	}

	// Fetch paginated results
	var rows []dbx.NullStringMap
	err = h.DB.Select("*").
		From("_requests").
		OrderBy("created_at DESC").
		Limit(int64(perPage)).
		Offset(int64(offset)).
		All(&rows)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to retrieve requests", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve requests")
	}

	requests := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		reqMap := make(map[string]interface{})
		for k, v := range row {
			if v.Valid {
				reqMap[k] = v.String
			} else {
				reqMap[k] = nil
			}
		}
		requests = append(requests, reqMap)
	}

	totalPages := (totalItems + perPage - 1) / perPage

	return c.JSON(http.StatusOK, map[string]interface{}{
		"page":       page,
		"perPage":    perPage,
		"totalItems": totalItems,
		"totalPages": totalPages,
		"items":      requests,
	})
}

// GetRequest retrieves a single tracked request by ID, requiring authentication.
func (h *RequestsHandler) GetRequest(c echo.Context) error {
	authUser := middleware.GetAuthRecord(c)
	if authUser == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to access request details")
	}

	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Request ID is required")
	}

	var row dbx.NullStringMap
	err := h.DB.Select("*").From("_requests").Where(dbx.HashExp{"id": id}).One(&row)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Request not found")
		}
		logger.Error("Failed to retrieve request", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	reqMap := make(map[string]interface{})
	for k, v := range row {
		if v.Valid {
			reqMap[k] = v.String
		} else {
			reqMap[k] = nil
		}
	}

	return c.JSON(http.StatusOK, reqMap)
}
