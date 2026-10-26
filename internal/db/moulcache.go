package db

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// moulCacheCheckInterval is how often a cached schema snapshot checks _moul_version for changes
// made outside this process (another process, or SQL that bypasses the db package). Writes made
// through this package invalidate the snapshot at once.
var moulCacheCheckInterval = time.Second

// moulSnapshot is the parsed content of _moul for one database.
type moulSnapshot struct {
	mu        sync.RWMutex
	valid     bool
	version   int64
	checkedAt time.Time
	ordered   []*schema.Moul
	byName    map[string]*schema.Moul
}

// moulSnapshots holds one snapshot per *dbx.DB.
var moulSnapshots sync.Map // *dbx.DB -> *moulSnapshot

func moulSnapshotFor(dbConn *dbx.DB) *moulSnapshot {
	if v, ok := moulSnapshots.Load(dbConn); ok {
		return v.(*moulSnapshot)
	}
	v, _ := moulSnapshots.LoadOrStore(dbConn, &moulSnapshot{})
	return v.(*moulSnapshot)
}

// InvalidateMoulCache drops the cached collection schemas of dbConn, so the next lookup re-reads
// _moul. Every write to _moul made through this package calls it; call it after writing _moul
// with raw SQL.
func InvalidateMoulCache(dbConn *dbx.DB) {
	if dbConn == nil {
		return
	}
	s := moulSnapshotFor(dbConn)
	s.mu.Lock()
	s.valid = false
	s.mu.Unlock()
}

// LoadAllMoul retrieves all defined mouls from the meta-table. Results come from an in-process
// cache of _moul (see moulCacheCheckInterval) and are copies the caller may modify.
func LoadAllMoul(dbConn *dbx.DB) ([]*schema.Moul, error) {
	ordered, _, err := moulSnapshotFor(dbConn).get(dbConn)
	if err != nil {
		return nil, err
	}
	mouls := make([]*schema.Moul, 0, len(ordered))
	for _, m := range ordered {
		mouls = append(mouls, m.Clone())
	}
	return mouls, nil
}

// LoadMoulByName retrieves a single moul by name, returning sql.ErrNoRows when it does not exist.
// Results come from an in-process cache of _moul and are copies the caller may modify.
func LoadMoulByName(dbConn *dbx.DB, name string) (*schema.Moul, error) {
	_, byName, err := moulSnapshotFor(dbConn).get(dbConn)
	if err != nil {
		return nil, err
	}
	m, ok := byName[name]
	if !ok {
		return nil, sql.ErrNoRows
	}
	return m.Clone(), nil
}

// get returns the current snapshot, reloading it when it was invalidated or _moul_version changed.
// The returned slice and map must not be modified.
func (s *moulSnapshot) get(dbConn *dbx.DB) ([]*schema.Moul, map[string]*schema.Moul, error) {
	now := time.Now()
	s.mu.RLock()
	if s.valid && now.Sub(s.checkedAt) < moulCacheCheckInterval {
		ordered, byName := s.ordered, s.byName
		s.mu.RUnlock()
		return ordered, byName, nil
	}
	s.mu.RUnlock()

	s.mu.Lock()
	defer s.mu.Unlock()
	if s.valid && now.Sub(s.checkedAt) < moulCacheCheckInterval {
		return s.ordered, s.byName, nil // refreshed by another goroutine meanwhile
	}

	version, versioned := readMoulVersion(dbConn)
	if s.valid && versioned && version == s.version {
		s.checkedAt = now
		return s.ordered, s.byName, nil
	}

	ordered, err := loadAllMoulFromDB(dbConn)
	if err != nil {
		return nil, nil, err
	}
	byName := make(map[string]*schema.Moul, len(ordered))
	for _, m := range ordered {
		byName[m.Name] = m
	}
	if !versioned {
		// Without _moul_version (a database not set up by EnsureSystemTables) nothing can tell when
		// _moul changes, so the result is used once and not cached.
		return ordered, byName, nil
	}
	s.ordered, s.byName, s.version, s.checkedAt, s.valid = ordered, byName, version, now, true
	return ordered, byName, nil
}

// readMoulVersion reads the change counter the _moul triggers maintain. ok is false when the
// database has no _moul_version table.
func readMoulVersion(dbConn *dbx.DB) (int64, bool) {
	var version int64
	if err := dbConn.NewQuery("SELECT version FROM _moul_version WHERE id = 1").Row(&version); err != nil {
		return 0, false
	}
	return version, true
}

// moulRow is one row of _moul.
type moulRow struct {
	ID             string         `db:"id"`
	Name           string         `db:"name"`
	Type           string         `db:"type"`
	Fields         string         `db:"fields"`
	Rules          string         `db:"rules"`
	EmailTemplates sql.NullString `db:"email_templates"`
	Webhooks       sql.NullString `db:"webhooks"`
	CreatedAt      string         `db:"createdAt"`
	UpdatedAt      string         `db:"updatedAt"`
}

// loadAllMoulFromDB reads and parses every row of _moul.
func loadAllMoulFromDB(dbConn *dbx.DB) ([]*schema.Moul, error) {
	var rows []moulRow
	err := dbConn.Select("id", "name", "type", "fields", "rules", "email_templates", "webhooks", "createdAt", "updatedAt").
		From("_moul").
		All(&rows)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("failed to fetch moul: %w", err)
	}

	mouls := make([]*schema.Moul, 0, len(rows))
	for _, row := range rows {
		m, err := parseMoulRow(row)
		if err != nil {
			return nil, err
		}
		mouls = append(mouls, m)
	}
	return mouls, nil
}

// parseMoulRow decodes the JSON columns of a _moul row.
func parseMoulRow(row moulRow) (*schema.Moul, error) {
	var fields []schema.MoulField
	var rules schema.MoulRules
	var templates *schema.EmailTemplates
	var webhooks []schema.Webhook

	if err := json.Unmarshal([]byte(row.Fields), &fields); err != nil {
		return nil, fmt.Errorf("failed to parse fields of moul %s: %w", row.Name, err)
	}
	if err := json.Unmarshal([]byte(row.Rules), &rules); err != nil {
		return nil, fmt.Errorf("failed to parse rules of moul %s: %w", row.Name, err)
	}
	if row.EmailTemplates.Valid && row.EmailTemplates.String != "" && row.EmailTemplates.String != "{}" {
		var t schema.EmailTemplates
		if err := json.Unmarshal([]byte(row.EmailTemplates.String), &t); err != nil {
			logger.Warn("Ignoring unreadable email templates", "moul", row.Name, "err", err)
		} else {
			templates = &t
		}
	}
	if row.Webhooks.Valid && row.Webhooks.String != "" && row.Webhooks.String != "[]" {
		if err := json.Unmarshal([]byte(row.Webhooks.String), &webhooks); err != nil {
			logger.Warn("Ignoring unreadable webhooks", "moul", row.Name, "err", err)
			webhooks = nil
		}
	}

	if templates == nil && row.Type == "auth" {
		defaults := schema.GetDefaultEmailTemplates()
		templates = &defaults
	}

	return &schema.Moul{
		ID:             row.ID,
		Name:           row.Name,
		Type:           row.Type,
		Fields:         fields,
		Rules:          rules,
		EmailTemplates: templates,
		Webhooks:       webhooks,
		CreatedAt:      row.CreatedAt,
		UpdatedAt:      row.UpdatedAt,
	}, nil
}

// DeleteMoulMetadata removes a moul's definition from the _moul table.
func DeleteMoulMetadata(dbConn *dbx.DB, name string) error {
	if _, err := dbConn.Delete("_moul", dbx.HashExp{"name": name}).Execute(); err != nil {
		return fmt.Errorf("failed to delete metadata for moul %s: %w", name, err)
	}
	InvalidateMoulCache(dbConn)
	return nil
}
