package handlers

import (
	"io"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/sysmon"
)

// SysmonHandler manages system monitoring HTTP API endpoints.
type SysmonHandler struct {
	collector *sysmon.Collector
}

// NewSysmonHandler constructs a new SysmonHandler.
func NewSysmonHandler(collector *sysmon.Collector) *SysmonHandler {
	return &SysmonHandler{
		collector: collector,
	}
}

// GetMetrics returns the current host system metrics and history snapshots.
func (h *SysmonHandler) GetMetrics(c *echo.Context) error {
	if h.collector == nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"error": "system monitoring collector not initialized",
		})
	}

	snapshot := h.collector.GetSnapshot()
	return c.JSON(http.StatusOK, snapshot)
}

// PushMetrics allows pushing JSON metric payloads via HTTP POST.
func (h *SysmonHandler) PushMetrics(c *echo.Context) error {
	if h.collector == nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"error": "system monitoring collector not initialized",
		})
	}

	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "failed to read request body",
		})
	}

	h.collector.ProcessPayload(body)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":  "ok",
		"message": "metrics ingested successfully",
	})
}
