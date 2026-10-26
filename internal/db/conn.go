package db

import (
	"net/url"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// BusyTimeout is how long a connection waits for a lock held by another connection before
// failing with SQLITE_BUSY.
const BusyTimeout = 5 * time.Second

// connectionPragmas are applied by the driver to every connection the pool opens (via the DSN's
// _pragma parameters), not once through the pool: a PRAGMA run with db.NewQuery only reaches the
// one pooled connection that happened to execute it, so every other connection would fail at once
// with SQLITE_BUSY instead of waiting for the lock.
var connectionPragmas = []string{
	"busy_timeout(" + strconv.FormatInt(BusyTimeout.Milliseconds(), 10) + ")",
	"journal_mode(WAL)",
	"synchronous(NORMAL)",
	"foreign_keys(1)",
}

// buildDSN appends the per-connection settings to dbPath. dbPath may be a plain file path,
// ":memory:" or a "file:" URI that already carries query parameters.
func buildDSN(dbPath string) string {
	params := url.Values{}
	for _, p := range connectionPragmas {
		params.Add("_pragma", p)
	}
	sep := "?"
	if strings.Contains(dbPath, "?") {
		sep = "&"
	}
	return dbPath + sep + params.Encode()
}

// isPrivateMemoryDB reports whether every connection to dbPath would open its own, empty in-memory
// database (":memory:" or a mode=memory URI without a shared cache). Such a pool must keep a single
// connection, or a second connection would see none of the first one's tables.
func isPrivateMemoryDB(dbPath string) bool {
	if dbPath == "" || dbPath == ":memory:" || strings.HasPrefix(dbPath, ":memory:?") {
		return true
	}
	lower := strings.ToLower(dbPath)
	isMemory := strings.HasPrefix(lower, "file::memory:") || strings.Contains(lower, "mode=memory")
	return isMemory && !strings.Contains(lower, "cache=shared")
}

// poolSize returns how many connections the pool may open and keep idle: MOUL_DB_MAX_CONNS when
// set to a positive integer, otherwise max(4, NumCPU).
func poolSize() int {
	if v := os.Getenv("MOUL_DB_MAX_CONNS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return n
		}
	}
	n := runtime.NumCPU()
	if n < 4 {
		n = 4
	}
	return n
}
