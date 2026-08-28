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

	// Register periodic old requests garbage collection worker (keep 30 days)
	a.workerEngine.RegisterPeriodicTask(24*time.Hour, "CleanupOldRequests", func(ctx context.Context, job *worker.Job) error {
		count, err := db.CleanupOldRequests(a.dbConn, 30*24*time.Hour)
		if err != nil {
			logger.Error("Failed to cleanup old requests", "err", err)
			return err
		}
		if count > 0 {
			logger.Info("Cleaned up old requests", "count", count)
		}
		return nil
	})

	// Register periodic old visits garbage collection worker (keep 30 days)
	a.workerEngine.RegisterPeriodicTask(24*time.Hour, "CleanupOldVisits", func(ctx context.Context, job *worker.Job) error {
		count, err := db.CleanupOldVisits(a.dbConn, 30*24*time.Hour)
		if err != nil {
			logger.Error("Failed to cleanup old visits", "err", err)
			return err
		}
		if count > 0 {
			logger.Info("Cleaned up old visits", "count", count)
		}
		return nil
	})

	// Register periodic completed & discarded worker jobs garbage collection worker (keep completed 7 days, discard failed jobs immediately)
	a.workerEngine.RegisterPeriodicTask(1*time.Hour, "CleanupCompletedJobs", func(ctx context.Context, job *worker.Job) error {
		count, err := db.CleanupCompletedJobs(a.dbConn, 7*24*time.Hour, 0)
		if err != nil {
			logger.Error("Failed to cleanup completed worker jobs", "err", err)
			return err
		}
		if count > 0 {
			logger.Info("Cleaned up completed worker jobs", "count", count)
		}
		return nil
	})
}
