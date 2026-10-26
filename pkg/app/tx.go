package app

import (
	"fmt"

	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/db"
)

// WriteTx runs fn in one SQLite write transaction on the app's database. Use it whenever code
// reads and then writes: the transaction starts with BEGIN IMMEDIATE, so it holds the write lock
// before its first read and cannot fail because another connection committed in between, and it
// is run again (a few times, with backoff) if the lock stays busy past the busy timeout. fn may
// therefore run more than once; keep it free of side effects outside tx and short, since every
// other writer waits for it.
func (a *App) WriteTx(fn func(tx *dbx.Tx) error) error {
	if a.dbConn == nil {
		return fmt.Errorf("database connection is nil; call Bootstrap() first")
	}
	return db.WriteTx(a.dbConn, fn)
}
