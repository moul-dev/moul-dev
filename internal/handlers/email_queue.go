package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

// enqueueEmailAttempts bounds how often a SendEmail job insert is tried when SQLite is busy.
const enqueueEmailAttempts = 3

// enqueueEmailBackoff is the wait before the first retry; it doubles on each further retry.
var enqueueEmailBackoff = 50 * time.Millisecond

// enqueueSendEmail queues a SendEmail job in tableName. An insert that fails because another
// connection held the write lock past the busy timeout (SQLITE_BUSY / SQLITE_LOCKED) is tried
// again a few times with backoff; any other error is returned at once.
func enqueueSendEmail(ctx context.Context, engine *worker.Engine, tableName string, args map[string]interface{}) error {
	backoff := enqueueEmailBackoff
	var err error
	for attempt := 1; attempt <= enqueueEmailAttempts; attempt++ {
		_, err = engine.Enqueue(ctx, tableName, map[string]interface{}{
			"worker":   "SendEmail",
			"priority": 1,
			"args":     args,
		})
		if err == nil || !db.IsBusyError(err) {
			return err
		}
		if attempt == enqueueEmailAttempts {
			break
		}
		select {
		case <-ctx.Done():
			return fmt.Errorf("enqueue SendEmail: %w", ctx.Err())
		case <-time.After(backoff):
		}
		backoff *= 2
	}
	return fmt.Errorf("enqueue SendEmail still busy after %d attempts: %w", enqueueEmailAttempts, err)
}
