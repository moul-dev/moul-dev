package db

import (
	"database/sql"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func TestInitDB(t *testing.T) {
	// Success path
	db, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer db.Close()

	// Verify _moul table exists by query
	_, err = db.NewQuery("SELECT 1 FROM _moul").Execute()
	if err != nil {
		t.Errorf("Expected _moul table to exist, query returned error: %v", err)
	}

	// Error path: Invalid file path to fail DB creation
	_, err = InitDB("/nonexistent/directory/db.sqlite")
	if err == nil {
		t.Error("Expected error when opening database at invalid path, got nil")
	}
}

func TestCreateMoulTableAndMetadata(t *testing.T) {
	db, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer db.Close()

	// 1. Create a Base Moul
	baseMoul := &schema.Moul{
		ID:   "moul-base-123",
		Name: "posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "id", Type: "text"}, // Should be ignored (system field override check)
			{Name: "title", Type: "text"},
			{Name: "views", Type: "number"},
			{Name: "is_published", Type: "bool"},
			{Name: "metadata", Type: "json"},
		},
		Rules: schema.MoulRules{
			ListRule: "@request.auth.id != ''",
		},
	}

	err = CreateMoulTable(db, baseMoul)
	if err != nil {
		t.Fatalf("CreateMoulTable for base moul failed: %v", err)
	}

	// Try inserting metadata
	err = SaveMoulMetadata(db, baseMoul)
	if err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}

	// 2. Create an Auth Moul
	authMoul := &schema.Moul{
		ID:   "moul-auth-456",
		Name: "users",
		Type: "auth",
		Fields: []schema.MoulField{
			{Name: "bio", Type: "text"},
		},
		Rules: schema.MoulRules{
			CreateRule: "",
		},
	}

	err = CreateMoulTable(db, authMoul)
	if err != nil {
		t.Fatalf("CreateMoulTable for auth moul failed: %v", err)
	}

	err = SaveMoulMetadata(db, authMoul)
	if err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}

	// 3. Load All Moul
	allMouls, err := LoadAllMoul(db)
	if err != nil {
		t.Fatalf("LoadAllMoul failed: %v", err)
	}

	if len(allMouls) != 2 {
		t.Errorf("Expected 2 mouls loaded, got %d", len(allMouls))
	}

	// 4. Load Moul by Name
	postsMoul, err := LoadMoulByName(db, "posts")
	if err != nil {
		t.Fatalf("LoadMoulByName failed: %v", err)
	}
	if postsMoul.ID != baseMoul.ID || postsMoul.Name != "posts" || postsMoul.Type != "base" {
		t.Errorf("Loaded moul fields mismatch: %+v", postsMoul)
	}

	// Load non-existent moul
	_, err = LoadMoulByName(db, "nonexistent")
	if err != sql.ErrNoRows {
		t.Errorf("Expected sql.ErrNoRows when loading non-existent moul, got %v", err)
	}

	// 5. Test error on CreateMoulTable with bad sql names
	badMoul := &schema.Moul{
		Name: "`; DROP TABLE posts; --",
	}
	err = CreateMoulTable(db, badMoul)
	if err == nil {
		t.Error("Expected error on invalid table name, got nil")
	}
}

func TestRevokedTokenGC(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer dbConn.Close()

	expiredToken := "expired.token.jwt"
	expiredTime := time.Now().Add(-1 * time.Hour)
	if err := RevokeToken(dbConn, expiredToken, expiredTime); err != nil {
		t.Fatalf("RevokeToken failed: %v", err)
	}

	validToken := "valid.token.jwt"
	validTime := time.Now().Add(1 * time.Hour)
	if err := RevokeToken(dbConn, validToken, validTime); err != nil {
		t.Fatalf("RevokeToken failed: %v", err)
	}

	count, err := CleanupExpiredRevokedTokens(dbConn)
	if err != nil {
		t.Fatalf("CleanupExpiredRevokedTokens failed: %v", err)
	}
	if count != 1 {
		t.Errorf("Expected 1 expired token cleaned up, got %d", count)
	}

	if !IsTokenRevoked(dbConn, validToken) {
		t.Errorf("Expected validToken to remain revoked")
	}
}

func TestCleanupOldRequestsAndVisits(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer dbConn.Close()

	oldTime := time.Now().Add(-40 * 24 * time.Hour).Format(time.RFC3339)
	recentTime := time.Now().Add(-10 * 24 * time.Hour).Format(time.RFC3339)

	// Insert requests
	_, err = dbConn.Insert("_requests", map[string]interface{}{
		"id":               "req-old",
		"visit_id":         "visit-1",
		"method":           "GET",
		"path":             "/old",
		"status_code":      200,
		"response_time_ms": 10,
		"createdAt":        oldTime,
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert old request: %v", err)
	}

	_, err = dbConn.Insert("_requests", map[string]interface{}{
		"id":               "req-recent",
		"visit_id":         "visit-1",
		"method":           "GET",
		"path":             "/recent",
		"status_code":      200,
		"response_time_ms": 10,
		"createdAt":        recentTime,
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert recent request: %v", err)
	}

	// Test CleanupOldRequests
	cleanedReqs, err := CleanupOldRequests(dbConn, 30*24*time.Hour)
	if err != nil {
		t.Fatalf("CleanupOldRequests failed: %v", err)
	}
	if cleanedReqs != 1 {
		t.Errorf("Expected 1 old request cleaned up, got %d", cleanedReqs)
	}

	// Insert visits
	_, err = dbConn.Insert("_visits", map[string]interface{}{
		"id":            "visit-old",
		"visitor_token": "token-1",
		"started_at":    oldTime,
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert old visit: %v", err)
	}

	_, err = dbConn.Insert("_visits", map[string]interface{}{
		"id":            "visit-recent",
		"visitor_token": "token-1",
		"started_at":    recentTime,
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert recent visit: %v", err)
	}

	// Test CleanupOldVisits
	cleanedVisits, err := CleanupOldVisits(dbConn, 30*24*time.Hour)
	if err != nil {
		t.Fatalf("CleanupOldVisits failed: %v", err)
	}
	if cleanedVisits != 1 {
		t.Errorf("Expected 1 old visit cleaned up, got %d", cleanedVisits)
	}
}

func TestCleanupCompletedJobs(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer dbConn.Close()

	// Create worker moul table
	workerMoul := &schema.Moul{
		ID:   "moul-worker-1",
		Name: "tasks",
		Type: "worker",
	}
	if err := CreateMoulTable(dbConn, workerMoul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}
	if err := SaveMoulMetadata(dbConn, workerMoul); err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}

	oldTime := time.Now().Add(-10 * 24 * time.Hour).Format(time.RFC3339)
	recentTime := time.Now().Add(-1 * 24 * time.Hour).Format(time.RFC3339)
	nowStr := time.Now().Format(time.RFC3339)

	// Old completed job (10 days old) -> should be deleted
	_, err = dbConn.Insert("tasks", map[string]interface{}{
		"id":           "job-completed-old",
		"createdAt":    oldTime,
		"updatedAt":    oldTime,
		"inserted_at":  oldTime,
		"scheduled_at": oldTime,
		"completed_at": oldTime,
		"state":        "completed",
		"worker":       "test-worker",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert old completed job: %v", err)
	}

	// Recent completed job (1 day old) -> should be kept
	_, err = dbConn.Insert("tasks", map[string]interface{}{
		"id":           "job-completed-recent",
		"createdAt":    recentTime,
		"updatedAt":    recentTime,
		"inserted_at":  recentTime,
		"scheduled_at": recentTime,
		"completed_at": recentTime,
		"state":        "completed",
		"worker":       "test-worker",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert recent completed job: %v", err)
	}

	// Discarded job -> should be deleted immediately when discardedMaxAge <= 0
	_, err = dbConn.Insert("tasks", map[string]interface{}{
		"id":           "job-discarded",
		"createdAt":    nowStr,
		"updatedAt":    nowStr,
		"inserted_at":  nowStr,
		"scheduled_at": nowStr,
		"discarded_at": nowStr,
		"state":        "discarded",
		"worker":       "test-worker",
	}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert discarded job: %v", err)
	}

	cleanedJobs, err := CleanupCompletedJobs(dbConn, 7*24*time.Hour, 0)
	if err != nil {
		t.Fatalf("CleanupCompletedJobs failed: %v", err)
	}

	if cleanedJobs != 2 {
		t.Errorf("Expected 2 jobs cleaned up (1 old completed, 1 discarded), got %d", cleanedJobs)
	}

	// Verify job-completed-recent still exists
	var count int
	_ = dbConn.Select("COUNT(*)").From("tasks").Where(dbx.HashExp{"id": "job-completed-recent"}).Row(&count)
	if count != 1 {
		t.Errorf("Expected job-completed-recent to remain in database, got count %d", count)
	}
}

func TestEnsureSystemTables_FirstStartup(t *testing.T) {
	// 1. Open a fresh raw in-memory SQLite database without tables
	rawDB, err := dbx.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open memory db: %v", err)
	}
	defer rawDB.Close()

	// 2. Ensure system tables on first startup
	if err := EnsureSystemTables(rawDB); err != nil {
		t.Fatalf("EnsureSystemTables failed: %v", err)
	}

	// 3. Query all tables starting with '_' from sqlite_master
	var tableRows []struct {
		Name string `db:"name"`
	}
	err = rawDB.NewQuery("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '\\_%' ESCAPE '\\' ORDER BY name ASC").All(&tableRows)
	if err != nil {
		t.Fatalf("Failed to query sqlite_master: %v", err)
	}

	createdTables := make(map[string]bool)
	for _, row := range tableRows {
		createdTables[row.Name] = true
	}

	for _, expectedTable := range SystemTables {
		if !createdTables[expectedTable] {
			t.Errorf("Expected system table %q to be created on first startup, but it was missing", expectedTable)
		}
		if !IsSystemTable(expectedTable) {
			t.Errorf("Expected IsSystemTable(%q) to be true", expectedTable)
		}
	}

	if IsSystemTable("users") || IsSystemTable("posts") {
		t.Errorf("Expected IsSystemTable to be false for non-system tables")
	}

	// 4. Verify columns in _moul
	var moulCols []struct {
		Name string `db:"name"`
	}
	if err := rawDB.NewQuery("PRAGMA table_info(_moul);").All(&moulCols); err != nil {
		t.Fatalf("PRAGMA table_info(_moul) failed: %v", err)
	}
	moulColMap := make(map[string]bool)
	for _, c := range moulCols {
		moulColMap[c.Name] = true
	}
	for _, reqCol := range []string{"id", "name", "type", "fields", "rules", "email_templates", "webhooks", "createdAt", "updatedAt"} {
		if !moulColMap[reqCol] {
			t.Errorf("Expected column %q in _moul table", reqCol)
		}
	}

	// 5. Verify columns in _rootUsers
	var rootCols []struct {
		Name string `db:"name"`
	}
	if err := rawDB.NewQuery("PRAGMA table_info(_rootUsers);").All(&rootCols); err != nil {
		t.Fatalf("PRAGMA table_info(_rootUsers) failed: %v", err)
	}
	rootColMap := make(map[string]bool)
	for _, c := range rootCols {
		rootColMap[c.Name] = true
	}
	for _, reqCol := range []string{"id", "username", "email", "name", "passwordHash", "createdAt", "updatedAt"} {
		if !rootColMap[reqCol] {
			t.Errorf("Expected column %q in _rootUsers table", reqCol)
		}
	}

	// 6. Verify default settings seeded
	var settingsCount int
	if err := rawDB.Select("COUNT(*)").From("_settings").Row(&settingsCount); err != nil {
		t.Fatalf("Failed to count _settings: %v", err)
	}
	if settingsCount == 0 {
		t.Errorf("Expected default settings to be seeded in _settings table")
	}
}

func TestEnsureSystemTables_Idempotency(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer dbConn.Close()

	// Calling EnsureSystemTables multiple times must succeed without error
	for i := 0; i < 3; i++ {
		if err := EnsureSystemTables(dbConn); err != nil {
			t.Fatalf("EnsureSystemTables failed on iteration %d: %v", i+1, err)
		}
	}
}
