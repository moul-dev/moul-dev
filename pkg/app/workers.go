package app

import (
	"context"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/worker"
)

// RegisterBuiltinWorkers registers standard mould background workers like SendEmail and CleanupRevokedTokens.
func (a *App) RegisterBuiltinWorkers() {
	if a.workerEngine == nil {
		return
	}

	// Register SendEmail worker handler
	a.workerEngine.Register("SendEmail", func(ctx context.Context, job *worker.Job) error {
		toStr, _ := job.Args["to"].(string)
		subjectStr, _ := job.Args["subject"].(string)
		bodyStr, _ := job.Args["body"].(string)
		fromStr, _ := job.Args["from"].(string)
		fromNameStr, _ := job.Args["from_name"].(string)

		var recipients []string
		if toStr != "" {
			for _, r := range strings.Split(toStr, ",") {
				if trimmed := strings.TrimSpace(r); trimmed != "" {
					recipients = append(recipients, trimmed)
				}
			}
		}

		emailMsg := &mailer.Email{
			From:     fromStr,
			FromName: fromNameStr,
			To:       recipients,
			Subject:  subjectStr,
			HTMLBody: bodyStr,
			TextBody: bodyStr,
		}

		if a.mailService != nil {
			return a.mailService.Send(ctx, emailMsg)
		}
		return nil
	})

	// Register periodic revoked token garbage collection worker
	a.workerEngine.RegisterPeriodicTask(1*time.Hour, "CleanupRevokedTokens", func(ctx context.Context, job *worker.Job) error {
		count, err := db.CleanupExpiredRevokedTokens(a.dbConn)
		if err != nil {
			logger.Error("Failed to cleanup expired revoked tokens", "err", err)
			return err
		}
		if count > 0 {
			logger.Info("Cleaned up expired revoked tokens", "count", count)
		}
		return nil
	})
}
