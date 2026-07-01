package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/charmbracelet/log"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

// Job represents a background job instance.
type Job struct {
	ID          string                 `json:"id"`
	Table       string                 `json:"table"`
	State       string                 `json:"state"`
	Queue       string                 `json:"queue"`
	Worker      string                 `json:"worker"`
	Args        map[string]interface{} `json:"args"`
	Meta        map[string]interface{} `json:"meta"`
	Tags        []string               `json:"tags"`
	Errors      []string               `json:"errors"`
	Attempt     int                    `json:"attempt"`
	MaxAttempts int                    `json:"max_attempts"`
	Priority    int                    `json:"priority"`
	InsertedAt  string                 `json:"inserted_at"`
	ScheduledAt string                 `json:"scheduled_at"`
}

// JobRow matches the database structure for parsing.
type JobRow struct {
	ID          string `db:"id"`
	State       string `db:"state"`
	Queue       string `db:"queue"`
	Worker      string `db:"worker"`
	Args        string `db:"args"`
	Meta        string `db:"meta"`
	Tags        string `db:"tags"`
	Errors      string `db:"errors"`
	Attempt     int    `db:"attempt"`
	MaxAttempts int    `db:"max_attempts"`
	Priority    int    `db:"priority"`
	InsertedAt  string `db:"inserted_at"`
	ScheduledAt string `db:"scheduled_at"`
}

// JobHandler is the function signature for worker jobs.
type JobHandler func(ctx context.Context, job *Job) error

// Engine manages the background execution of jobs.
type Engine struct {
	db             *dbx.DB
	handlers       map[string]JobHandler
	handlersMu     sync.RWMutex
	nodeID         string
	wakeupChan     chan struct{}
	maxConcurrency int
	activeJobs     chan struct{}
	wg             sync.WaitGroup
	ctx            context.Context
	cancel         context.CancelFunc
	logger         *log.Logger
}

// NewEngine creates a new background job worker engine.
func NewEngine(dbConn *dbx.DB) *Engine {
	// Node ID is useful for identifying which node claimed the job
	nodeID := "node-" + util.RandomID()

	return &Engine{
		db:             dbConn,
		handlers:       make(map[string]JobHandler),
		nodeID:         nodeID,
		wakeupChan:     make(chan struct{}, 100),
		maxConcurrency: 10,
		activeJobs:     make(chan struct{}, 10), // semaphore for max concurrency
		logger:         logger.With("component", "worker"),
	}
}

// Register registers a new handler function for a given worker name.
func (e *Engine) Register(workerName string, handler JobHandler) {
	e.handlersMu.Lock()
	defer e.handlersMu.Unlock()
	e.handlers[workerName] = handler
	e.logger.Info("Registered background worker handler", "worker", workerName)
}

// Start spawns the polling loop in the background.
func (e *Engine) Start(ctx context.Context) {
	e.ctx, e.cancel = context.WithCancel(ctx)
	e.wg.Add(1)
	go e.loop()
	e.logger.Info("Background worker engine started", "nodeID", e.nodeID, "maxConcurrency", e.maxConcurrency)
}

// Stop waits for all active jobs to complete.
func (e *Engine) Stop() {
	if e.cancel != nil {
		e.cancel()
	}
	e.logger.Info("Stopping background worker engine, waiting for active jobs to complete...")
	e.wg.Wait()
	e.logger.Info("Background worker engine stopped gracefully")
}

// Trigger wakes up the loop immediately when a job is enqueued.
func (e *Engine) Trigger(tableName string, jobID string) {
	select {
	case e.wakeupChan <- struct{}{}:
	default:
		// Channel buffer full, loop is already waking up or busy
	}
}

// Enqueue inserts a new job record programmatically.
func (e *Engine) Enqueue(ctx context.Context, tableName string, jobOpts map[string]interface{}) (map[string]interface{}, error) {
	moul, err := db.LoadMoulByName(e.db, tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to load moul: %w", err)
	}
	if moul.Type != "worker" {
		return nil, fmt.Errorf("moul '%s' is not of type 'worker'", tableName)
	}

	workerVal, _ := jobOpts["worker"].(string)
	if workerVal == "" {
		return nil, fmt.Errorf("worker name is required")
	}

	insertData := make(map[string]interface{})

	// Handle custom fields
	for _, field := range moul.Fields {
		if val, ok := jobOpts[field.Name]; ok {
			if field.Type == "json" {
				bytes, err := json.Marshal(val)
				if err != nil {
					return nil, fmt.Errorf("invalid json field '%s'", field.Name)
				}
				insertData[field.Name] = string(bytes)
			} else if field.Type == "bool" {
				if boolVal, ok := val.(bool); ok {
					if boolVal {
						insertData[field.Name] = 1
					} else {
						insertData[field.Name] = 0
					}
				} else {
					insertData[field.Name] = val
				}
			} else {
				insertData[field.Name] = val
			}
		}
	}

	recordID := fmt.Sprintf("%s-%s", util.Singularize(tableName), util.RandomID())
	if customID, ok := jobOpts["id"].(string); ok && customID != "" {
		recordID = customID
	}
	insertData["id"] = recordID

	now := time.Now().UTC().Format(time.RFC3339)
	insertData["state"] = "available"
	insertData["worker"] = workerVal
	insertData["attempt"] = 0
	insertData["errors"] = "[]"
	insertData["inserted_at"] = now

	queueVal, _ := jobOpts["queue"].(string)
	if queueVal == "" {
		queueVal = "default"
	}
	insertData["queue"] = queueVal

	maxAttempts := 20
	if maxAttemptsVal, ok := jobOpts["max_attempts"]; ok {
		if num, err := toInt(maxAttemptsVal); err == nil {
			maxAttempts = num
		}
	}
	insertData["max_attempts"] = maxAttempts

	priority := 0
	if priorityVal, ok := jobOpts["priority"]; ok {
		if num, err := toInt(priorityVal); err == nil {
			priority = num
		}
	}
	insertData["priority"] = priority

	scheduledAt := now
	if scheduledAtStr, ok := jobOpts["scheduled_at"].(string); ok && scheduledAtStr != "" {
		if _, err := time.Parse(time.RFC3339, scheduledAtStr); err != nil {
			return nil, fmt.Errorf("invalid scheduled_at format (must be RFC3339)")
		}
		scheduledAt = scheduledAtStr
	}
	insertData["scheduled_at"] = scheduledAt

	// JSON serialization of args, meta, tags
	for _, jsonField := range []string{"args", "meta", "tags"} {
		defaultVal := "{}"
		if jsonField == "tags" {
			defaultVal = "[]"
		}
		if val, ok := jobOpts[jsonField]; ok {
			bytes, err := json.Marshal(val)
			if err != nil {
				return nil, fmt.Errorf("invalid json field '%s'", jsonField)
			}
			insertData[jsonField] = string(bytes)
		} else {
			insertData[jsonField] = defaultVal
		}
	}

	_, err = e.db.Insert(tableName, dbx.Params(insertData)).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to insert job record: %w", err)
	}

	e.Trigger(tableName, recordID)

	// Fetch back and parse response format
	var record dbx.NullStringMap
	err = e.db.Select("*").From(tableName).Where(dbx.HashExp{"id": recordID}).One(&record)
	if err != nil {
		return nil, err
	}

	// Normalize response map
	resMap := nullStringMapToMap(record)
	for _, jsonField := range []string{"args", "meta", "tags", "errors"} {
		if strVal, ok := resMap[jsonField].(string); ok && strVal != "" {
			var decoded interface{}
			_ = json.Unmarshal([]byte(strVal), &decoded)
			resMap[jsonField] = decoded
		}
	}
	for _, intField := range []string{"attempt", "max_attempts", "priority"} {
		if strVal, ok := resMap[intField].(string); ok && strVal != "" {
			var intVal int
			_, _ = fmt.Sscanf(strVal, "%d", &intVal)
			resMap[intField] = intVal
		}
	}

	return resMap, nil
}

func (e *Engine) loop() {
	defer e.wg.Done()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-e.ctx.Done():
			return
		case <-ticker.C:
			e.pollAndRunJobs()
		case <-e.wakeupChan:
			e.pollAndRunJobs()
		}
	}
}

func (e *Engine) pollAndRunJobs() {
	// Find all tables that are of type "worker"
	mouls, err := db.LoadAllMouls(e.db)
	if err != nil {
		e.logger.Error("Failed to fetch mouls to poll background jobs", "error", err)
		return
	}

	for _, moul := range mouls {
		if moul.Type != "worker" {
			continue
		}

		// Pull jobs until concurrency is full or no more jobs exist
	pollLoop:
		for {
			select {
			case <-e.ctx.Done():
				return
			default:
			}

			// Try to acquire execution slot
			select {
			case e.activeJobs <- struct{}{}:
				// slot acquired, poll next job
				job, err := e.claimNextJob(moul.Name)
				if err != nil {
					// Release slot immediately if we didn't get a job
					<-e.activeJobs
					if err.Error() != "sql: no rows in result set" {
						e.logger.Error("Failed to claim background job", "table", moul.Name, "error", err)
					}
					// Exit loop for this table since no jobs are available or there's a DB error
					break pollLoop
				}

				e.wg.Add(1)
				go e.executeJob(job)
			default:
				// Concurrency limit reached, stop pulling jobs for now
				return
			}
		}
	}
}

func (e *Engine) claimNextJob(tableName string) (*Job, error) {
	// Start transaction to claim job atomically
	tx, err := e.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	nowStr := time.Now().UTC().Format(time.RFC3339)

	var row JobRow
	err = tx.Select("id", "state", "queue", "worker", "args", "meta", "tags", "errors", "attempt", "max_attempts", "priority", "inserted_at", "scheduled_at").
		From(tableName).
		Where(dbx.NewExp("state = 'available' AND scheduled_at <= {:now}", dbx.Params{"now": nowStr})).
		OrderBy("priority ASC", "scheduled_at ASC", "id ASC").
		Limit(1).
		One(&row)
	if err != nil {
		return nil, err
	}

	newAttempt := row.Attempt + 1
	_, err = tx.Update(tableName, dbx.Params{
		"state":        "executing",
		"attempt":      newAttempt,
		"attempted_at": nowStr,
		"attempted_by": e.nodeID,
	}, dbx.HashExp{"id": row.ID}).Execute()
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Parse JSON fields
	var args map[string]interface{}
	var meta map[string]interface{}
	var tags []string
	var errors []string

	_ = json.Unmarshal([]byte(row.Args), &args)
	_ = json.Unmarshal([]byte(row.Meta), &meta)
	_ = json.Unmarshal([]byte(row.Tags), &tags)
	_ = json.Unmarshal([]byte(row.Errors), &errors)

	return &Job{
		ID:          row.ID,
		Table:       tableName,
		State:       "executing",
		Queue:       row.Queue,
		Worker:      row.Worker,
		Args:        args,
		Meta:        meta,
		Tags:        tags,
		Errors:      errors,
		Attempt:     newAttempt,
		MaxAttempts: row.MaxAttempts,
		Priority:    row.Priority,
		InsertedAt:  row.InsertedAt,
		ScheduledAt: row.ScheduledAt,
	}, nil
}

func (e *Engine) executeJob(job *Job) {
	defer func() {
		<-e.activeJobs
		e.wg.Done()
	}()

	e.logger.Info("Executing background job", "jobID", job.ID, "worker", job.Worker, "attempt", job.Attempt)

	e.handlersMu.RLock()
	handler, found := e.handlers[job.Worker]
	e.handlersMu.RUnlock()

	var err error

	// Run job execution with panic recovery
	func() {
		defer func() {
			if r := recover(); r != nil {
				err = fmt.Errorf("job panicked: %v", r)
			}
		}()

		if !found {
			// Fail immediately if worker not registered
			err = fmt.Errorf("no handler registered for worker: %s", job.Worker)
		} else {
			// Exec registered handler
			err = handler(e.ctx, job)
		}
	}()

	if err != nil {
		e.handleFailure(job, err)
	} else {
		e.handleSuccess(job)
	}
}

func (e *Engine) handleSuccess(job *Job) {
	nowStr := time.Now().UTC().Format(time.RFC3339)
	_, err := e.db.Update(job.Table, dbx.Params{
		"state":        "completed",
		"completed_at": nowStr,
	}, dbx.HashExp{"id": job.ID}).Execute()
	if err != nil {
		e.logger.Error("Failed to mark background job as completed", "jobID", job.ID, "error", err)
	} else {
		e.logger.Info("Background job completed successfully", "jobID", job.ID, "worker", job.Worker)
	}
}

func (e *Engine) handleFailure(job *Job, jobErr error) {
	nowStr := time.Now().UTC().Format(time.RFC3339)

	// Append failure logs
	errors := append(job.Errors, fmt.Sprintf("[%s] %v", nowStr, jobErr))
	errBytes, _ := json.Marshal(errors)

	params := dbx.Params{
		"errors": string(errBytes),
	}

	if job.Attempt >= job.MaxAttempts {
		params["state"] = "discarded"
		params["discarded_at"] = nowStr
		e.logger.Error("Background job failed permanently (max attempts reached)", "jobID", job.ID, "worker", job.Worker, "attempts", job.Attempt, "error", jobErr)
	} else {
		// Oban backoff: attempt^4 + 15 + jitter
		jitter := rand.Intn(30)
		backoffSeconds := (job.Attempt * job.Attempt * 10) + 10 + jitter
		scheduledAt := time.Now().UTC().Add(time.Duration(backoffSeconds) * time.Second).Format(time.RFC3339)

		params["state"] = "available"
		params["scheduled_at"] = scheduledAt
		e.logger.Warn("Background job failed, scheduled for retry", "jobID", job.ID, "worker", job.Worker, "nextAttemptAt", scheduledAt, "error", jobErr)
	}

	_, err := e.db.Update(job.Table, params, dbx.HashExp{"id": job.ID}).Execute()
	if err != nil {
		e.logger.Error("Failed to update failed job state", "jobID", job.ID, "error", err)
	}
}

// Helpers

func toInt(v interface{}) (int, error) {
	switch val := v.(type) {
	case int:
		return val, nil
	case int64:
		return int(val), nil
	case float64:
		return int(val), nil
	case string:
		var n int
		_, err := fmt.Sscanf(val, "%d", &n)
		return n, err
	default:
		return 0, fmt.Errorf("invalid type")
	}
}

func nullStringMapToMap(m dbx.NullStringMap) map[string]interface{} {
	res := make(map[string]interface{})
	for k, v := range m {
		if v.Valid {
			res[k] = v.String
		} else {
			res[k] = nil
		}
	}
	return res
}
