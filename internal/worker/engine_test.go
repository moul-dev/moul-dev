package worker

import (
	"context"
	"errors"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

func initTestDB(t *testing.T) *dbx.DB {
	dbPath := "test-worker-" + util.RandomID() + ".db"
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	t.Cleanup(func() {
		dbConn.Close()
		os.Remove(dbPath)
	})
	return dbConn
}

func TestEngineSuccessFlow(t *testing.T) {
	dbConn := initTestDB(t)

	// 1. Create a worker moul collection
	workerMoul := &schema.Moul{
		ID:   "moul-worker-1",
		Name: "tasks",
		Type: "worker",
	}
	if err := db.CreateMoulTable(dbConn, workerMoul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, workerMoul); err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}

	// 2. Initialize Engine and register handler
	engine := NewEngine(dbConn)
	
	var wg sync.WaitGroup
	wg.Add(1)
	var executedJob *Job

	engine.Register("SendEmail", func(ctx context.Context, job *Job) error {
		executedJob = job
		wg.Done()
		return nil
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	engine.Start(ctx)
	defer engine.Stop()

	// 3. Enqueue job via API
	jobOpts := map[string]interface{}{
		"worker": "SendEmail",
		"args": map[string]interface{}{
			"to": "user@example.com",
		},
	}
	jobRes, err := engine.Enqueue(ctx, "tasks", jobOpts)
	if err != nil {
		t.Fatalf("Enqueue failed: %v", err)
	}

	if jobRes["state"] != "available" {
		t.Errorf("Expected initial state to be 'available', got %s", jobRes["state"])
	}

	// Wait for handler execution
	wg.Wait()

	if executedJob == nil {
		t.Fatal("Expected job to be executed, but handler was not called")
	}

	if executedJob.Worker != "SendEmail" {
		t.Errorf("Expected worker SendEmail, got %s", executedJob.Worker)
	}

	if executedJob.Args["to"] != "user@example.com" {
		t.Errorf("Expected args to contain to=user@example.com, got %v", executedJob.Args)
	}

	// Wait for database state to settle
	time.Sleep(100 * time.Millisecond)

	// Fetch back to verify database state updated to completed
	var record dbx.NullStringMap
	err = dbConn.Select("*").From("tasks").Where(dbx.HashExp{"id": executedJob.ID}).One(&record)
	if err != nil {
		t.Fatalf("Failed to fetch job record from db: %v", err)
	}
	recordMap := nullStringMapToMap(record)

	if recordMap["state"] != "completed" {
		t.Errorf("Expected job state to be 'completed' in database, got %v", recordMap["state"])
	}
	if recordMap["completed_at"] == nil || recordMap["completed_at"] == "" {
		t.Error("Expected completed_at timestamp to be set")
	}
}

func TestEngineFailureFlow(t *testing.T) {
	dbConn := initTestDB(t)

	workerMoul := &schema.Moul{
		ID:   "moul-worker-2",
		Name: "tasks",
		Type: "worker",
	}
	if err := db.CreateMoulTable(dbConn, workerMoul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, workerMoul); err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}

	engine := NewEngine(dbConn)

	var wg sync.WaitGroup
	wg.Add(1)

	engine.Register("FailTask", func(ctx context.Context, job *Job) error {
		wg.Done()
		return errors.New("simulated task error")
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	engine.Start(ctx)
	defer engine.Stop()

	// Enqueue job with max_attempts = 1 so it fails permanently and gets discarded
	jobOpts := map[string]interface{}{
		"worker":       "FailTask",
		"max_attempts": 1,
	}
	jobRes, err := engine.Enqueue(ctx, "tasks", jobOpts)
	if err != nil {
		t.Fatalf("Enqueue failed: %v", err)
	}

	wg.Wait()
	time.Sleep(100 * time.Millisecond)

	// Fetch back to check state
	var record dbx.NullStringMap
	err = dbConn.Select("*").From("tasks").Where(dbx.HashExp{"id": jobRes["id"]}).One(&record)
	if err != nil {
		t.Fatalf("Failed to fetch job record: %v", err)
	}
	recordMap := nullStringMapToMap(record)

	if recordMap["state"] != "discarded" {
		t.Errorf("Expected job state to be 'discarded', got %v", recordMap["state"])
	}
	if recordMap["discarded_at"] == nil || recordMap["discarded_at"] == "" {
		t.Error("Expected discarded_at timestamp to be set")
	}
}

func TestUnregisteredWorker(t *testing.T) {
	dbConn := initTestDB(t)

	workerMoul := &schema.Moul{
		ID:   "moul-worker-3",
		Name: "tasks",
		Type: "worker",
	}
	if err := db.CreateMoulTable(dbConn, workerMoul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, workerMoul); err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}

	engine := NewEngine(dbConn)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	engine.Start(ctx)
	defer engine.Stop()

	// Enqueue unregistered job
	jobOpts := map[string]interface{}{
		"worker":       "UnknownWorker",
		"max_attempts": 1,
	}
	jobRes, err := engine.Enqueue(ctx, "tasks", jobOpts)
	if err != nil {
		t.Fatalf("Enqueue failed: %v", err)
	}

	time.Sleep(150 * time.Millisecond)

	// Fetch back to verify job state is discarded (failed immediately due to unknown worker)
	var record dbx.NullStringMap
	err = dbConn.Select("*").From("tasks").Where(dbx.HashExp{"id": jobRes["id"]}).One(&record)
	if err != nil {
		t.Fatalf("Failed to fetch job: %v", err)
	}
	recordMap := nullStringMapToMap(record)

	if recordMap["state"] != "discarded" {
		t.Errorf("Expected job to be discarded, got %v", recordMap["state"])
	}
}
