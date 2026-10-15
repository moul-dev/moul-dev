package realtime

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/pocketbase/dbx"
)

var (
	// ErrInvalidTicket indicates a ticket was not found, has expired, or was already consumed.
	ErrInvalidTicket = errors.New("invalid or expired realtime ticket")
)

// Ticket represents a short-lived opaque credential for SSE connection handshake.
type Ticket struct {
	ID             string                 `json:"ticket"`
	AuthRecord     map[string]interface{} `json:"authRecord,omitempty"`
	IsAdmin        bool                   `json:"isAdmin"`
	TokenHash      string                 `json:"tokenHash,omitempty"`
	TokenExpiresAt string                 `json:"tokenExpiresAt,omitempty"`
	ExpiresAt      string                 `json:"expiresAt"`
	CreatedAt      string                 `json:"createdAt"`
}

type ticketRow struct {
	ID             string         `db:"id"`
	AuthRecord     string         `db:"authRecord"`
	IsAdmin        int            `db:"isAdmin"`
	TokenHash      sql.NullString `db:"tokenHash"`
	TokenExpiresAt sql.NullString `db:"tokenExpiresAt"`
	ExpiresAt      string         `db:"expiresAt"`
	CreatedAt      string         `db:"createdAt"`
}

// TicketStore handles issuing, consuming, and pruning SSE tickets backed by SQLite.
type TicketStore struct {
	db *dbx.DB
}

// NewTicketStore returns a new TicketStore.
func NewTicketStore(db *dbx.DB) *TicketStore {
	return &TicketStore{db: db}
}

// IssueTicket creates and persists a single-use ticket for the authenticated user or admin.
// Optional tokenMeta parameters: tokenMeta[0] = tokenHash, tokenMeta[1] = tokenExpiresAt.
func (s *TicketStore) IssueTicket(authRecord map[string]interface{}, isAdmin bool, ttl time.Duration, tokenMeta ...string) (*Ticket, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("database connection is required for ticket store")
	}

	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return nil, fmt.Errorf("failed to generate ticket entropy: %w", err)
	}
	ticketID := "tkt_" + hex.EncodeToString(b)

	now := time.Now().UTC()
	if ttl == 0 {
		ttl = 30 * time.Second
	}
	expiresAt := now.Add(ttl)

	var authRecordJSON string
	if authRecord != nil {
		data, err := json.Marshal(authRecord)
		if err != nil {
			return nil, fmt.Errorf("failed to serialize auth record for ticket: %w", err)
		}
		authRecordJSON = string(data)
	}

	adminVal := 0
	if isAdmin {
		adminVal = 1
	}

	var tokenHash, tokenExpiresAt string
	if len(tokenMeta) > 0 {
		tokenHash = tokenMeta[0]
	}
	if len(tokenMeta) > 1 {
		tokenExpiresAt = tokenMeta[1]
	}

	row := ticketRow{
		ID:             ticketID,
		AuthRecord:     authRecordJSON,
		IsAdmin:        adminVal,
		TokenHash:      sql.NullString{String: tokenHash, Valid: tokenHash != ""},
		TokenExpiresAt: sql.NullString{String: tokenExpiresAt, Valid: tokenExpiresAt != ""},
		ExpiresAt:      expiresAt.Format(time.RFC3339),
		CreatedAt:      now.Format(time.RFC3339),
	}

	_, err := s.db.Insert("_realtime_tickets", dbx.Params{
		"id":             row.ID,
		"authRecord":     row.AuthRecord,
		"isAdmin":        row.IsAdmin,
		"tokenHash":      row.TokenHash,
		"tokenExpiresAt": row.TokenExpiresAt,
		"expiresAt":      row.ExpiresAt,
		"createdAt":      row.CreatedAt,
	}).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to persist realtime ticket: %w", err)
	}

	return &Ticket{
		ID:             ticketID,
		AuthRecord:     authRecord,
		IsAdmin:        isAdmin,
		TokenHash:      tokenHash,
		TokenExpiresAt: tokenExpiresAt,
		ExpiresAt:      row.ExpiresAt,
		CreatedAt:      row.CreatedAt,
	}, nil
}

// ConsumeTicket atomically retrieves and deletes a ticket if valid and unexpired.
func (s *TicketStore) ConsumeTicket(ticketID string) (*Ticket, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("database connection is required for ticket store")
	}
	if ticketID == "" {
		return nil, ErrInvalidTicket
	}

	var res *Ticket
	nowStr := time.Now().UTC().Format(time.RFC3339)

	err := s.db.Transactional(func(tx *dbx.Tx) error {
		var row ticketRow
		err := tx.Select("*").
			From("_realtime_tickets").
			Where(dbx.And(
				dbx.HashExp{"id": ticketID},
				dbx.NewExp("expiresAt > {:now}", dbx.Params{"now": nowStr}),
			)).
			One(&row)
		if err != nil {
			return ErrInvalidTicket
		}

		deleteResult, err := tx.Delete("_realtime_tickets", dbx.HashExp{"id": ticketID}).Execute()
		if err != nil {
			return fmt.Errorf("failed to consume realtime ticket: %w", err)
		}
		rowsAffected, err := deleteResult.RowsAffected()
		if err != nil {
			return fmt.Errorf("failed to check consumed ticket rows: %w", err)
		}
		if rowsAffected == 0 {
			return ErrInvalidTicket
		}

		var authRecord map[string]interface{}
		if row.AuthRecord != "" {
			if err := json.Unmarshal([]byte(row.AuthRecord), &authRecord); err != nil {
				return fmt.Errorf("failed to parse ticket auth record: %w", err)
			}
		}

		res = &Ticket{
			ID:             row.ID,
			AuthRecord:     authRecord,
			IsAdmin:        row.IsAdmin == 1,
			TokenHash:      row.TokenHash.String,
			TokenExpiresAt: row.TokenExpiresAt.String,
			ExpiresAt:      row.ExpiresAt,
			CreatedAt:      row.CreatedAt,
		}
		return nil
	})

	if err != nil {
		if errors.Is(err, ErrInvalidTicket) {
			return nil, ErrInvalidTicket
		}
		return nil, fmt.Errorf("ticket consumption transaction failed: %w", err)
	}

	return res, nil
}

// CleanupExpired deletes all expired tickets from the database.
func (s *TicketStore) CleanupExpired() (int64, error) {
	if s == nil || s.db == nil {
		return 0, errors.New("database connection is required for ticket store")
	}
	nowStr := time.Now().UTC().Format(time.RFC3339)
	res, err := s.db.Delete("_realtime_tickets", dbx.NewExp("expiresAt <= {:now}", dbx.Params{"now": nowStr})).Execute()
	if err != nil {
		return 0, fmt.Errorf("failed to clean up expired tickets: %w", err)
	}
	count, err := res.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get count of cleaned tickets: %w", err)
	}
	return count, nil
}
