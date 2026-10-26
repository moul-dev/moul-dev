package db

import (
	"fmt"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/pocketbase/dbx"
)

// revokedRefreshInterval is how often the in-memory revoked-token set is re-read from
// _revoked_tokens, so tokens revoked by another process (or written to the table directly) are
// honoured within this delay. Revocations made through RevokeToken in this process apply at once.
var revokedRefreshInterval = 60 * time.Second

// revokedSet is the unexpired content of _revoked_tokens for one database: token hash -> expiry.
type revokedSet struct {
	mu       sync.RWMutex
	hashes   map[string]time.Time
	loadedAt time.Time
}

// revokedSets holds one revokedSet per *dbx.DB.
var revokedSets sync.Map // *dbx.DB -> *revokedSet

func revokedSetFor(dbConn *dbx.DB) *revokedSet {
	if v, ok := revokedSets.Load(dbConn); ok {
		return v.(*revokedSet)
	}
	v, _ := revokedSets.LoadOrStore(dbConn, &revokedSet{})
	return v.(*revokedSet)
}

// stale reports whether the set has never been loaded or is due for a refresh.
func (s *revokedSet) stale(now time.Time) bool {
	return s.hashes == nil || now.Sub(s.loadedAt) >= revokedRefreshInterval
}

// refresh re-reads the unexpired revoked hashes when the set is stale. A failed read keeps the
// previous content (an empty set before the first successful read) and is retried on the next
// check after the interval.
func (s *revokedSet) refresh(dbConn *dbx.DB, now time.Time) {
	s.mu.RLock()
	stale := s.stale(now)
	s.mu.RUnlock()
	if !stale {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.stale(now) {
		return // another goroutine refreshed it while we waited for the lock
	}
	hashes, err := loadRevokedHashes(dbConn, now)
	s.loadedAt = now
	if err != nil {
		logger.Error("Failed to refresh revoked tokens; keeping the previous set", "err", err)
		if s.hashes == nil {
			s.hashes = map[string]time.Time{}
		}
		return
	}
	s.hashes = hashes
}

func (s *revokedSet) add(tokenHash string, expiresAt time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.hashes == nil {
		// Not loaded yet: the next check loads the table, which already holds this row.
		return
	}
	s.hashes[tokenHash] = expiresAt
}

func (s *revokedSet) contains(tokenHash string, now time.Time) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	exp, ok := s.hashes[tokenHash]
	return ok && exp.After(now)
}

// pruneExpired drops expired hashes from the set.
func (s *revokedSet) pruneExpired(now time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for h, exp := range s.hashes {
		if !exp.After(now) {
			delete(s.hashes, h)
		}
	}
}

// loadRevokedHashes reads every unexpired row of _revoked_tokens.
func loadRevokedHashes(dbConn *dbx.DB, now time.Time) (map[string]time.Time, error) {
	var rows []struct {
		TokenHash string `db:"token_hash"`
		ExpiresAt string `db:"expires_at"`
	}
	err := dbConn.Select("token_hash", "expires_at").From("_revoked_tokens").
		Where(dbx.NewExp("expires_at > {:now}", dbx.Params{"now": now.UTC().Format(time.RFC3339)})).
		All(&rows)
	if err != nil {
		return nil, fmt.Errorf("failed to load revoked tokens: %w", err)
	}
	hashes := make(map[string]time.Time, len(rows))
	for _, row := range rows {
		exp, err := time.Parse(time.RFC3339, row.ExpiresAt)
		if err != nil {
			// An unreadable expiry is treated as revoked for the refresh interval rather than dropped.
			exp = now.Add(revokedRefreshInterval)
		}
		hashes[row.TokenHash] = exp
	}
	return hashes, nil
}
