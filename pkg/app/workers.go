package app

import (
	"context"
	"strings"
	"time"

	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/mailer"
	"github.com/moul-dev/moul-dev/internal/storage"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

// retentionPeriod returns how long _visits (visits=true) or _requests rows are kept, from the
// visit_retention_days / request_log_retention_days settings. Invalid values keep the default
// and are logged.
func retentionPeriod(dbConn *dbx.DB, visits bool) time.Duration {
	s, err := analytics.LoadRequestLogSettings(dbConn)
	if err != nil {
		logger.Warn("Invalid log retention settings; defaults apply", "err", err)
	}
	days := s.RetentionDays
	if visits {
		days = s.VisitRetentionDays
	}
	return time.Duration(days) * 24 * time.Hour
}

// RegisterBuiltinWorkers registers standard moul background workers like SendEmail and CleanupRevokedTokens.
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

	// Register the image renditions worker used when the file_thumbs_async setting is "true"
	a.workerEngine.Register("GenerateImageSizes", func(ctx context.Context, job *worker.Job) error {
		fileID, _ := job.Args["id"].(string)
		key, _ := job.Args["key"].(string)
		return storage.GenerateImageSizes(ctx, a.dbConn, fileID, key)
	})
	engine := a.workerEngine
	storage.SetImageSizesEnqueuer(func(ctx context.Context, fileID, key string) error {
		_, err := engine.Enqueue(ctx, "_workers", map[string]interface{}{
			"worker": "GenerateImageSizes",
			"args":   map[string]interface{}{"id": fileID, "key": key},
		})
		return err
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

	// Register periodic old requests garbage collection worker (request_log_retention_days, default 30)
	a.workerEngine.RegisterPeriodicTask(24*time.Hour, "CleanupOldRequests", func(ctx context.Context, job *worker.Job) error {
		count, err := db.CleanupOldRequests(a.dbConn, retentionPeriod(a.dbConn, false))
		if err != nil {
			logger.Error("Failed to cleanup old requests", "err", err)
			return err
		}
		if count > 0 {
			logger.Info("Cleaned up old requests", "count", count)
		}
		return nil
	})

	// Register periodic old visits garbage collection worker (visit_retention_days, default 30)
	a.workerEngine.RegisterPeriodicTask(24*time.Hour, "CleanupOldVisits", func(ctx context.Context, job *worker.Job) error {
		count, err := db.CleanupOldVisits(a.dbConn, retentionPeriod(a.dbConn, true))
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
