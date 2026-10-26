package analytics

import (
	"database/sql"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/pocketbase/dbx"
)

const (
	// visitCacheTTL matches the moul_visit cookie lifetime: a visit seen within it is not re-read.
	visitCacheTTL = 30 * time.Minute
	// visitCacheMax bounds the number of cached visits.
	visitCacheMax = 10000
)

type visitCacheEntry struct {
	userID  string // the user_id stored on the visit ("" when none)
	expires time.Time
}

// visitCache remembers visits known to exist in _visits and the user_id they carry, so a request
// that brings a known visit does no SQL at all.
type visitCache struct {
	mu      sync.Mutex
	entries map[string]visitCacheEntry
}

func newVisitCache() *visitCache {
	return &visitCache{entries: make(map[string]visitCacheEntry)}
}

func (c *visitCache) get(id string, now time.Time) (visitCacheEntry, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.entries[id]
	if !ok || now.After(e.expires) {
		return visitCacheEntry{}, false
	}
	return e, true
}

func (c *visitCache) put(id, userID string, now time.Time) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if _, exists := c.entries[id]; !exists && len(c.entries) >= visitCacheMax {
		for k, e := range c.entries {
			if now.After(e.expires) {
				delete(c.entries, k)
			}
		}
		if len(c.entries) >= visitCacheMax {
			c.entries = make(map[string]visitCacheEntry)
		}
	}
	c.entries[id] = visitCacheEntry{userID: userID, expires: now.Add(visitCacheTTL)}
}

// resolveVisit reports whether the visit exists and, when userID is set and the visit has none
// yet, attaches userID to it. A cached visit costs no SQL; otherwise one SELECT reads id and
// user_id together (and one UPDATE attaches the user the first time).
func (e *Engine) resolveVisit(visitID, userID string) (bool, error) {
	now := time.Now()
	if entry, ok := e.visits.get(visitID, now); ok && (userID == "" || entry.userID != "") {
		return true, nil
	}

	var row struct {
		ID     string         `db:"id"`
		UserID sql.NullString `db:"user_id"`
	}
	err := e.db.Select("id", "user_id").From("_visits").Where(dbx.HashExp{"id": visitID}).One(&row)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("failed to look up visit: %w", err)
	}

	stored := row.UserID.String
	if userID != "" && stored == "" {
		_, err := e.db.Update("_visits", dbx.Params{"user_id": userID},
			dbx.And(dbx.HashExp{"id": visitID}, dbx.NewExp("(user_id IS NULL OR user_id = '')"))).Execute()
		if err != nil {
			return true, fmt.Errorf("failed to attach user to visit: %w", err)
		}
		stored = userID
	}
	e.visits.put(visitID, stored, now)
	return true, nil
}
