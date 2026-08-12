package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/pocketbase/dbx"
)

type RealtimeHandler struct {
	DB *dbx.DB
}

func NewRealtimeHandler(dbConn *dbx.DB) *RealtimeHandler {
	return &RealtimeHandler{DB: dbConn}
}

// SubscribeCollection handles GET /api/moul/:name/subscribe over SSE.
func (h *RealtimeHandler) SubscribeCollection(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil || moul == nil {
		return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Moul collection %q not found", moulName))
	}

	authUser := middleware.GetAuthRecord(c)
	isRootUser := authUser != nil && authUser["moul"] == "_rootUsers"
	adminKey := c.Request().Header.Get("X-Admin-Key")
	if adminKey == "" {
		adminKey = c.QueryParam("admin_key")
	}
	isAdmin := isRootUser || adminKey != ""

	// Access rule selection
	rule := moul.Rules.SubscribeRule
	if rule == "" {
		rule = moul.Rules.ListRule
	}
	if rule == "" {
		rule = moul.Rules.ViewRule
	}

	// Filter query parameters
	eventFilter := c.QueryParam("event")
	if eventFilter == "" {
		eventFilter = c.QueryParam("events")
	}
	recordIDFilter := c.QueryParam("id")
	if recordIDFilter == "" {
		recordIDFilter = c.QueryParam("record_id")
	}

	client := realtime.NewClient(moulName, authUser, isAdmin, rule, eventFilter, recordIDFilter)
	realtime.DefaultHub.Subscribe(client)
	defer realtime.DefaultHub.Unsubscribe(client)

	// Set SSE headers
	w := c.Response()
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	rc := http.NewResponseController(w)
	_ = rc.Flush()

	// Initial handshake payload
	handshakeData, _ := json.Marshal(map[string]string{
		"client_id": client.ID,
		"moul":      moulName,
		"status":    "connected",
	})
	fmt.Fprintf(w, "event: connected\ndata: %s\n\n", handshakeData)
	_ = rc.Flush()

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	ctx := c.Request().Context()
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			fmt.Fprintf(w, ": ping\n\n")
			_ = rc.Flush()
		case msg, ok := <-client.Send:
			if !ok {
				return nil
			}
			jsonBytes, err := json.Marshal(msg)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", msg.Action, jsonBytes)
			_ = rc.Flush()
		}
	}
}

// SubscribeGlobal handles GET /api/moul/subscribe over SSE (for multi-moul or global updates).
func (h *RealtimeHandler) SubscribeGlobal(c *echo.Context) error {
	moulsParam := c.QueryParam("mouls")
	if moulsParam == "" {
		moulsParam = c.QueryParam("moul")
	}
	moulName := "*"
	if moulsParam != "" && moulsParam != "*" {
		moulName = moulsParam
	}

	authUser := middleware.GetAuthRecord(c)
	isRootUser := authUser != nil && authUser["moul"] == "_rootUsers"
	adminKey := c.Request().Header.Get("X-Admin-Key")
	if adminKey == "" {
		adminKey = c.QueryParam("admin_key")
	}
	isAdmin := isRootUser || adminKey != ""

	eventFilter := c.QueryParam("event")
	if eventFilter == "" {
		eventFilter = c.QueryParam("events")
	}
	recordIDFilter := c.QueryParam("id")

	client := realtime.NewClient(moulName, authUser, isAdmin, "", eventFilter, recordIDFilter)
	realtime.DefaultHub.Subscribe(client)
	defer realtime.DefaultHub.Unsubscribe(client)

	w := c.Response()
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	rc := http.NewResponseController(w)
	_ = rc.Flush()

	handshakeData, _ := json.Marshal(map[string]string{
		"client_id": client.ID,
		"moul":      moulName,
		"status":    "connected",
	})
	fmt.Fprintf(w, "event: connected\ndata: %s\n\n", handshakeData)
	_ = rc.Flush()

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	ctx := c.Request().Context()
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			fmt.Fprintf(w, ": ping\n\n")
			_ = rc.Flush()
		case msg, ok := <-client.Send:
			if !ok {
				return nil
			}
			jsonBytes, err := json.Marshal(msg)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", msg.Action, jsonBytes)
			_ = rc.Flush()
		}
	}
}
