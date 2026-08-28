package tls

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io/fs"
	"path"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/caddyserver/certmagic"
	"github.com/pocketbase/dbx"
)

var (
	_ certmagic.Storage = (*DBStorage)(nil)
)

// DBStorage implements certmagic.Storage using SQLite via dbx.
type DBStorage struct {
	db      *dbx.DB
	locks   map[string]time.Time
	locksMu sync.Mutex
}

// NewDBStorage creates a new DBStorage instance.
func NewDBStorage(db *dbx.DB) *DBStorage {
	return &DBStorage{
		db:    db,
		locks: make(map[string]time.Time),
	}
}

// Lock acquires a lock for key.
func (s *DBStorage) Lock(ctx context.Context, key string) error {
	lockKey := "lock:" + key
	const lockTimeout = 2 * time.Minute

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		s.locksMu.Lock()
		expiry, exists := s.locks[lockKey]
		if exists && time.Now().Before(expiry) {
			s.locksMu.Unlock()
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(50 * time.Millisecond):
				continue
			}
		}

		// Try DB lock insert or update if expired
		var existingKey string
		var modifiedStr string
		err := s.db.Select("key", "modified").From("_certmagic").Where(dbx.HashExp{"key": lockKey}).Row(&existingKey, &modifiedStr)
		if err == nil && existingKey != "" {
			modTime, parseErr := time.Parse(time.RFC3339Nano, modifiedStr)
			if parseErr == nil && time.Since(modTime) < lockTimeout {
				s.locksMu.Unlock()
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(50 * time.Millisecond):
					continue
				}
			}
		}

		// Acquire lock in DB and memory
		now := time.Now()
		nowStr := now.Format(time.RFC3339Nano)
		_, err = s.db.Insert("_certmagic", dbx.Params{
			"key":      lockKey,
			"value":    []byte(nowStr),
			"modified": nowStr,
			"is_dir":   0,
		}).Execute()

		if err != nil {
			// Row exists, update it if expired
			_, err = s.db.Update("_certmagic", dbx.Params{
				"modified": nowStr,
			}, dbx.HashExp{"key": lockKey}).Execute()
			if err != nil {
				s.locksMu.Unlock()
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(50 * time.Millisecond):
					continue
				}
			}
		}

		s.locks[lockKey] = now.Add(lockTimeout)
		s.locksMu.Unlock()
		return nil
	}
}

// Unlock releases the lock for key.
func (s *DBStorage) Unlock(ctx context.Context, key string) error {
	lockKey := "lock:" + key

	s.locksMu.Lock()
	delete(s.locks, lockKey)
	s.locksMu.Unlock()

	_, err := s.db.Delete("_certmagic", dbx.HashExp{"key": lockKey}).Execute()
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("failed to unlock %s: %w", key, err)
	}
	return nil
}

// Store saves value at key.
func (s *DBStorage) Store(ctx context.Context, key string, value []byte) error {
	nowStr := time.Now().Format(time.RFC3339Nano)

	var count int
	err := s.db.Select("COUNT(*)").From("_certmagic").Where(dbx.HashExp{"key": key}).Row(&count)
	if err != nil {
		return fmt.Errorf("failed to check key %s: %w", key, err)
	}

	if count > 0 {
		_, err = s.db.Update("_certmagic", dbx.Params{
			"value":    value,
			"modified": nowStr,
			"is_dir":   0,
		}, dbx.HashExp{"key": key}).Execute()
	} else {
		_, err = s.db.Insert("_certmagic", dbx.Params{
			"key":      key,
			"value":    value,
			"modified": nowStr,
			"is_dir":   0,
		}).Execute()
	}

	if err != nil {
		return fmt.Errorf("failed to store %s: %w", key, err)
	}
	return nil
}

// Load retrieves the value at key.
func (s *DBStorage) Load(ctx context.Context, key string) ([]byte, error) {
	var val []byte
	err := s.db.Select("value").From("_certmagic").Where(dbx.HashExp{"key": key, "is_dir": 0}).Row(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fs.ErrNotExist
		}
		return nil, fmt.Errorf("failed to load %s: %w", key, err)
	}
	if val == nil {
		return nil, fs.ErrNotExist
	}
	return val, nil
}

// Delete removes key.
func (s *DBStorage) Delete(ctx context.Context, key string) error {
	res, err := s.db.Delete("_certmagic", dbx.HashExp{"key": key}).Execute()
	if err != nil {
		return fmt.Errorf("failed to delete %s: %w", key, err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fs.ErrNotExist
	}
	return nil
}

// Exists returns true if key exists.
func (s *DBStorage) Exists(ctx context.Context, key string) bool {
	var count int
	err := s.db.Select("COUNT(*)").From("_certmagic").Where(dbx.HashExp{"key": key}).Row(&count)
	return err == nil && count > 0
}

// List returns all keys matching prefix.
func (s *DBStorage) List(ctx context.Context, prefix string, recursive bool) ([]string, error) {
	// Clean prefix
	prefix = strings.TrimPrefix(prefix, "/")
	if prefix != "" && !strings.HasSuffix(prefix, "/") {
		prefix = prefix + "/"
	}

	var rows []struct {
		Key   string `db:"key"`
		IsDir int    `db:"is_dir"`
	}

	err := s.db.Select("key", "is_dir").From("_certmagic").All(&rows)
	if err != nil {
		return nil, fmt.Errorf("failed to list keys: %w", err)
	}

	resultSet := make(map[string]bool)

	for _, r := range rows {
		k := r.Key
		if strings.HasPrefix(k, "lock:") {
			continue
		}

		if prefix != "" && !strings.HasPrefix(k, prefix) {
			continue
		}

		if recursive {
			resultSet[k] = true
		} else {
			// Non-recursive: slice off prefix and get relative path
			rel := strings.TrimPrefix(k, prefix)
			parts := strings.Split(rel, "/")
			if len(parts) == 1 {
				resultSet[path.Join(prefix, parts[0])] = true
			} else if len(parts) > 1 {
				// Immediate directory child
				dirKey := path.Join(prefix, parts[0])
				resultSet[dirKey] = true
			}
		}
	}

	var keys []string
	for k := range resultSet {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	return keys, nil
}

// Stat returns metadata about key.
func (s *DBStorage) Stat(ctx context.Context, key string) (certmagic.KeyInfo, error) {
	var row struct {
		Key      string `db:"key"`
		Value    []byte `db:"value"`
		Modified string `db:"modified"`
		IsDir    int    `db:"is_dir"`
	}

	err := s.db.Select("key", "value", "modified", "is_dir").From("_certmagic").Where(dbx.HashExp{"key": key}).One(&row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Check if key is a prefix directory
			prefix := key
			if !strings.HasSuffix(prefix, "/") {
				prefix += "/"
			}
			var count int
			_ = s.db.Select("COUNT(*)").From("_certmagic").Where(dbx.NewExp("key LIKE {:prefix}", dbx.Params{"prefix": prefix + "%"})).Row(&count)
			if count > 0 {
				return certmagic.KeyInfo{
					Key:        key,
					Modified:   time.Now(),
					Size:       0,
					IsTerminal: false,
				}, nil
			}
			return certmagic.KeyInfo{}, fs.ErrNotExist
		}
		return certmagic.KeyInfo{}, fmt.Errorf("failed to stat %s: %w", key, err)
	}

	modTime, _ := time.Parse(time.RFC3339Nano, row.Modified)

	return certmagic.KeyInfo{
		Key:        row.Key,
		Modified:   modTime,
		Size:       int64(len(row.Value)),
		IsTerminal: row.IsDir == 0,
	}, nil
}
