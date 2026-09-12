package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/pocketbase/dbx"
)

// WorkerEngine defines the minimal worker engine interface needed by WorkersHandler.
type WorkerEngine interface {
	Enqueue(ctx context.Context, tableName string, jobOpts map[string]interface{}) (map[string]interface{}, error)
	Trigger(tableName string, jobID string)
}

// WorkersHandler handles queries and operations against the _workers system table.
type WorkersHandler struct {
	DB     *dbx.DB
	Engine WorkerEngine
}

// NewWorkersHandler creates a new WorkersHandler.
func NewWorkersHandler(dbConn *dbx.DB, engine WorkerEngine) *WorkersHandler {
	return &WorkersHandler{
		DB:     dbConn,
		Engine: engine,
	}
}

func nullStringMapToWorkerMap(m dbx.NullStringMap) map[string]interface{} {
	res := make(map[string]interface{}, len(m))
	for k, v := range m {
		if v.Valid {
			res[k] = v.String
		} else {
			res[k] = nil
		}
	}
	return res
}

func parseWorkerSort(sortParam string) string {
	if sortParam == "" {
		return "createdAt DESC"
	}
	isDesc := false
	col := sortParam
	if strings.HasPrefix(col, "-") {
		isDesc = true
		col = col[1:]
	} else if strings.HasPrefix(col, "+") {
		col = col[1:]
	}

	validCols := map[string]bool{
		"id":           true,
		"createdAt":    true,
		"updatedAt":    true,
		"inserted_at":  true,
		"scheduled_at": true,
		"priority":     true,
		"attempt":      true,
		"state":        true,
		"worker":       true,
		"queue":        true,
	}
	if !validCols[col] {
		return "createdAt DESC"
	}
	if isDesc {
		return col + " DESC"
	}
	return col + " ASC"
}

// ListJobs lists jobs from the _workers table with filtering and pagination.
func (h *WorkersHandler) ListJobs(c *echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	perPage, _ := strconv.Atoi(c.QueryParam("perPage"))
	if perPage < 1 || perPage > 200 {
		perPage = 50
	}

	offset := (page - 1) * perPage

	var conditions []dbx.Expression
	if state := c.QueryParam("state"); state != "" {
		conditions = append(conditions, dbx.HashExp{"state": state})
	}
	if queue := c.QueryParam("queue"); queue != "" {
		conditions = append(conditions, dbx.HashExp{"queue": queue})
	}
	if worker := c.QueryParam("worker"); worker != "" {
		conditions = append(conditions, dbx.HashExp{"worker": worker})
	}

	countQuery := h.DB.Select("COUNT(*)").From("_workers")
	if len(conditions) > 0 {
		countQuery = countQuery.Where(dbx.And(conditions...))
	}

	var totalItems int
	if err := countQuery.Row(&totalItems); err != nil {
		logger.Error("Failed to count worker jobs", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to count worker jobs")
	}

	orderBy := parseWorkerSort(c.QueryParam("sort"))
	selectQuery := h.DB.Select("*").From("_workers").OrderBy(orderBy).Limit(int64(perPage)).Offset(int64(offset))
	if len(conditions) > 0 {
		selectQuery = selectQuery.Where(dbx.And(conditions...))
	}

	var rows []dbx.NullStringMap
	if err := selectQuery.All(&rows); err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to retrieve worker jobs", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve worker jobs")
	}

	items := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		items = append(items, nullStringMapToWorkerMap(row))
	}

	totalPages := 0
	if totalItems > 0 {
		totalPages = (totalItems + perPage - 1) / perPage
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"page":       page,
		"perPage":    perPage,
		"totalItems": totalItems,
		"totalPages": totalPages,
		"items":      items,
	})
}

// GetJob retrieves a single job record from _workers by ID.
func (h *WorkersHandler) GetJob(c *echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Job ID is required")
	}

	var row dbx.NullStringMap
	err := h.DB.Select("*").From("_workers").Where(dbx.HashExp{"id": id}).One(&row)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Worker job not found")
		}
		logger.Error("Failed to retrieve worker job", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	return c.JSON(http.StatusOK, nullStringMapToWorkerMap(row))
}

// CreateJob enqueues a new background job into the _workers table.
func (h *WorkersHandler) CreateJob(c *echo.Context) error {
	if h.Engine == nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "Worker engine is not initialized")
	}

	var payload map[string]interface{}
	if err := c.Bind(&payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request payload")
	}

	workerName, _ := payload["worker"].(string)
	if workerName == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "worker field is required")
	}

	job, err := h.Engine.Enqueue(c.Request().Context(), "_workers", payload)
	if err != nil {
		logger.Error("Failed to enqueue worker job", "worker", workerName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to enqueue job: %v", err))
	}

	return c.JSON(http.StatusCreated, job)
}

// UpdateJob updates an existing worker job record.
func (h *WorkersHandler) UpdateJob(c *echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Job ID is required")
	}

	var existing dbx.NullStringMap
	if err := h.DB.Select("*").From("_workers").Where(dbx.HashExp{"id": id}).One(&existing); err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Worker job not found")
		}
		logger.Error("Failed to retrieve worker job for update", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	var payload map[string]interface{}
	if err := c.Bind(&payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request payload")
	}

	nowStr := time.Now().UTC().Format(time.RFC3339)
	params := dbx.Params{
		"updatedAt": nowStr,
	}

	var triggerEngine bool
	if state, ok := payload["state"].(string); ok && state != "" {
		params["state"] = state
		if state == "available" {
			params["attempt"] = 0
			if _, hasSched := payload["scheduled_at"]; !hasSched {
				params["scheduled_at"] = nowStr
			}
			triggerEngine = true
		} else if state == "discarded" {
			params["discarded_at"] = nowStr
		} else if state == "cancelled" {
			params["cancelled_at"] = nowStr
		}
	}

	if sched, ok := payload["scheduled_at"].(string); ok && sched != "" {
		params["scheduled_at"] = sched
	}
	if prio, ok := payload["priority"].(float64); ok {
		params["priority"] = int(prio)
	}
	if maxAtt, ok := payload["max_attempts"].(float64); ok {
		params["max_attempts"] = int(maxAtt)
	}

	if _, err := h.DB.Update("_workers", params, dbx.HashExp{"id": id}).Execute(); err != nil {
		logger.Error("Failed to update worker job", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update worker job")
	}

	if triggerEngine && h.Engine != nil {
		h.Engine.Trigger("_workers", id)
	}

	var updated dbx.NullStringMap
	if err := h.DB.Select("*").From("_workers").Where(dbx.HashExp{"id": id}).One(&updated); err == nil {
		return c.JSON(http.StatusOK, nullStringMapToWorkerMap(updated))
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"success": true, "id": id})
}

// DeleteJob deletes a worker job record by ID.
func (h *WorkersHandler) DeleteJob(c *echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Job ID is required")
	}

	res, err := h.DB.Delete("_workers", dbx.HashExp{"id": id}).Execute()
	if err != nil {
		logger.Error("Failed to delete worker job", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete worker job")
	}

	affected, err := res.RowsAffected()
	if err != nil {
		logger.Error("Failed to check rows affected on delete worker job", "id", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	if affected == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "Worker job not found")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"success": true})
}

// RetryJobs resets discarded or specific worker jobs back to available state.
func (h *WorkersHandler) RetryJobs(c *echo.Context) error {
	var req struct {
		IDs []string `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		// Non-fatal if body is empty or invalid JSON
		req.IDs = nil
	}

	nowStr := time.Now().UTC().Format(time.RFC3339)
	params := dbx.Params{
		"state":        "available",
		"scheduled_at": nowStr,
		"attempt":      0,
		"updatedAt":    nowStr,
	}

	var where dbx.Expression
	if len(req.IDs) > 0 {
		var ids []interface{}
		for _, id := range req.IDs {
			ids = append(ids, id)
		}
		where = dbx.In("id", ids...)
	} else {
		where = dbx.In("state", "discarded", "cancelled", "retryable")
	}

	res, err := h.DB.Update("_workers", params, where).Execute()
	if err != nil {
		logger.Error("Failed to retry worker jobs", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retry worker jobs")
	}

	affected, err := res.RowsAffected()
	if err != nil {
		logger.Error("Failed to check rows affected on retry worker jobs", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if affected > 0 && h.Engine != nil {
		h.Engine.Trigger("_workers", "")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success":       true,
		"rows_affected": affected,
	})
}
