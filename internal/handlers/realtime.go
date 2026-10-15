package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/pocketbase/dbx"
)

type RealtimeHandler struct {
	DB             *dbx.DB
	TicketStore    *realtime.TicketStore
	AdminSecretKey string
}

func NewRealtimeHandler(dbConn *dbx.DB, ticketStore *realtime.TicketStore, adminSecretKey string) *RealtimeHandler {
	return &RealtimeHandler{
		DB:             dbConn,
		TicketStore:    ticketStore,
		AdminSecretKey: adminSecretKey,
	}
}

// extractTokenCredentials parses Bearer token string, hash, and expiration from request headers.
func extractTokenCredentials(c *echo.Context) (tokenHash string, tokenExpiresAt time.Time) {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return "", time.Time{}
	}
	parts := strings.Split(authHeader, " ")
	if len(parts) == 2 && strings.EqualFold(parts[0], "bearer") {
		tokenString := parts[1]
		tokenHash = db.HashToken(tokenString)
		if claims, err := auth.VerifyToken(tokenString); err == nil && claims.ExpiresAt != nil {
			tokenExpiresAt = claims.ExpiresAt.Time
		}
	}
	return tokenHash, tokenExpiresAt
}

// CreateTicket handles POST /api/realtime/ticket.
// It exchanges authenticated user JWT or admin credentials for a 30-second single-use ticket.
func (h *RealtimeHandler) CreateTicket(c *echo.Context) error {
	authUser := middleware.GetAuthRecord(c)
	adminKey := c.Request().Header.Get("X-Admin-Key")
	isAdmin := (authUser != nil && authUser["moul"] == "_rootUsers") ||
		(adminKey != "" && h.AdminSecretKey != "" && middleware.CheckAdminKey(c, h.AdminSecretKey))

	if authUser == nil && !isAdmin {
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to request a realtime ticket")
	}

	if h.TicketStore == nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Realtime ticket store unavailable")
	}

	// Clean up expired tickets opportunistically
	if _, err := h.TicketStore.CleanupExpired(); err != nil {
		logger.Warn("Failed to clean up expired tickets", "err", err)
	}

	tokenHash, tokenExp := extractTokenCredentials(c)
	var expStr string
	if !tokenExp.IsZero() {
		expStr = tokenExp.UTC().Format(time.RFC3339)
	}

	ticket, err := h.TicketStore.IssueTicket(authUser, isAdmin, 30*time.Second, tokenHash, expStr)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to issue realtime ticket: %v", err))
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ticket":    ticket.ID,
		"expiresAt": ticket.ExpiresAt,
		"expiresIn": 30,
	})
}

// SubscribeCollection handles GET /api/moul/:name/subscribe over SSE.
func (h *RealtimeHandler) SubscribeCollection(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil || moul == nil {
		return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Moul collection %q not found", moulName))
	}

	authUser := middleware.GetAuthRecord(c)
	adminKey := c.Request().Header.Get("X-Admin-Key")
	isAdmin := (authUser != nil && authUser["moul"] == "_rootUsers") ||
		(adminKey != "" && h.AdminSecretKey != "" && middleware.CheckAdminKey(c, h.AdminSecretKey))

	tokenHash, tokenExpiresAt := extractTokenCredentials(c)

	// Consume ticket if provided in query string
	if ticketID := c.QueryParam("ticket"); ticketID != "" {
		if h.TicketStore == nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Realtime ticket store unavailable")
		}
		ticket, err := h.TicketStore.ConsumeTicket(ticketID)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired realtime ticket")
		}
		if ticket.AuthRecord != nil {
			authUser = ticket.AuthRecord
		}
		if ticket.IsAdmin {
			isAdmin = true
		}
		if ticket.TokenHash != "" {
			tokenHash = ticket.TokenHash
		}
		if ticket.TokenExpiresAt != "" {
			if parsedExp, err := time.Parse(time.RFC3339, ticket.TokenExpiresAt); err == nil {
				tokenExpiresAt = parsedExp
			}
		}
	}

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

	clientOpts := realtime.ClientOptions{
		TokenHash:      tokenHash,
		TokenExpiresAt: tokenExpiresAt,
	}
	client := realtime.NewClient(moulName, authUser, isAdmin, rule, eventFilter, recordIDFilter, clientOpts)
	return h.serveSSE(c, client, moulName)
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
	adminKey := c.Request().Header.Get("X-Admin-Key")
	isAdmin := (authUser != nil && authUser["moul"] == "_rootUsers") ||
		(adminKey != "" && h.AdminSecretKey != "" && middleware.CheckAdminKey(c, h.AdminSecretKey))

	tokenHash, tokenExpiresAt := extractTokenCredentials(c)

	// Consume ticket if provided in query string
	if ticketID := c.QueryParam("ticket"); ticketID != "" {
		if h.TicketStore == nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Realtime ticket store unavailable")
		}
		ticket, err := h.TicketStore.ConsumeTicket(ticketID)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired realtime ticket")
		}
		if ticket.AuthRecord != nil {
			authUser = ticket.AuthRecord
		}
		if ticket.IsAdmin {
			isAdmin = true
		}
		if ticket.TokenHash != "" {
			tokenHash = ticket.TokenHash
		}
		if ticket.TokenExpiresAt != "" {
			if parsedExp, err := time.Parse(time.RFC3339, ticket.TokenExpiresAt); err == nil {
				tokenExpiresAt = parsedExp
			}
		}
	}

	eventFilter := c.QueryParam("event")
	if eventFilter == "" {
		eventFilter = c.QueryParam("events")
	}
	recordIDFilter := c.QueryParam("id")

	clientOpts := realtime.ClientOptions{
		TokenHash:      tokenHash,
		TokenExpiresAt: tokenExpiresAt,
	}
	client := realtime.NewClient(moulName, authUser, isAdmin, "", eventFilter, recordIDFilter, clientOpts)
	return h.serveSSE(c, client, moulName)
}

// serveSSE establishes the SSE stream, sends the connection handshake, and monitors client lifecycle.
func (h *RealtimeHandler) serveSSE(c *echo.Context, client *realtime.Client, moulName string) error {
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

		case reason := <-client.Disconnect:
			expiredData, _ := json.Marshal(map[string]string{
				"message": "Token has expired or was revoked",
				"reason":  reason,
			})
			fmt.Fprintf(w, "event: auth_expired\ndata: %s\n\n", expiredData)
			_ = rc.Flush()
			return nil

		case <-ticker.C:
			// Mid-stream heartbeat check: token expiry & revocation
			if !client.IsAdmin && client.TokenHash != "" {
				if !client.TokenExpiresAt.IsZero() && time.Now().After(client.TokenExpiresAt) {
					expiredData, _ := json.Marshal(map[string]string{
						"message": "Token has expired or was revoked",
						"reason":  "auth_expired",
					})
					fmt.Fprintf(w, "event: auth_expired\ndata: %s\n\n", expiredData)
					_ = rc.Flush()
					return nil
				}
				if h.DB != nil && db.IsTokenRevokedByHash(h.DB, client.TokenHash) {
					expiredData, _ := json.Marshal(map[string]string{
						"message": "Token has expired or was revoked",
						"reason":  "auth_expired",
					})
					fmt.Fprintf(w, "event: auth_expired\ndata: %s\n\n", expiredData)
					_ = rc.Flush()
					return nil
				}
			}
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
