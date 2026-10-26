package db

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"modernc.org/sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

// writeTxAttempts bounds how often WriteTx runs a transaction that failed with SQLITE_BUSY.
const writeTxAttempts = 4

// writeTxBackoff is the wait before the first retry; it doubles on each further retry.
var writeTxBackoff = 25 * time.Millisecond

// IsBusyError reports whether err (or an error it wraps) is SQLite's SQLITE_BUSY or SQLITE_LOCKED,
// including their extended codes such as SQLITE_BUSY_SNAPSHOT: another connection held a lock
// longer than the busy timeout, and running the same work again later can succeed.
func IsBusyError(err error) bool {
	if err == nil {
		return false
	}
	var sqliteErr *sqlite.Error
	if errors.As(err, &sqliteErr) {
		switch sqliteErr.Code() & 0xff {
		case sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED:
			return true
		}
		return false
	}
	msg := err.Error()
	return strings.Contains(msg, "database is locked") || strings.Contains(msg, "SQLITE_BUSY")
}

// WriteTx runs fn in one write transaction and is the way to read and then write atomically.
//
// Every transaction Moul opens starts with BEGIN IMMEDIATE (the DSN sets _txlock=immediate), so it
// owns SQLite's write lock before its first read: a read-then-write transaction can no longer fail
// with SQLITE_BUSY_SNAPSHOT because another connection committed between its read and its write,
// which the busy timeout cannot help with. WriteTx also runs the whole transaction again, up to a
// few times with a short backoff, when it still fails with SQLITE_BUSY or SQLITE_LOCKED (a lock
// held longer than the busy timeout). fn may therefore run more than once and must not have side
// effects outside tx; an error returned by fn rolls the transaction back and is returned as is.
func WriteTx(dbConn *dbx.DB, fn func(tx *dbx.Tx) error) error {
	if dbConn == nil {
		return errors.New("db: WriteTx requires a database connection")
	}
	backoff := writeTxBackoff
	var err error
	for attempt := 1; attempt <= writeTxAttempts; attempt++ {
		err = dbConn.Transactional(fn)
		if err == nil || !IsBusyError(err) {
			return err
		}
		if attempt < writeTxAttempts {
			time.Sleep(backoff)
			backoff *= 2
		}
	}
	return fmt.Errorf("write transaction still busy after %d attempts: %w", writeTxAttempts, err)
}
