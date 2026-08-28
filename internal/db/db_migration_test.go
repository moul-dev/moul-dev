package db

import (
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func TestSyncMoulTableColumns_ColumnRemovalAndTypeChange(t *testing.T) {
	database, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer database.Close()

	// 1. Initial schema definition
	moul := &schema.Moul{
		ID:   "moul-test-migration",
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "text"},            // Stored as text initially ("99.99")
			{Name: "in_stock", Type: "text"},         // Stored as text ("true")
			{Name: "deprecated_notes", Type: "text"}, // Field to be removed
		},
	}

	if err := CreateMoulTable(database, moul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	// Insert test data
	_, err = database.NewQuery(`
		INSERT INTO products (id, created_at, updated_at, title, price, in_stock, deprecated_notes)
		VALUES ('p1', {:now}, {:now}, 'Widget A', '99.99', 'true', 'old note');
	`).Bind(dbx.Params{"now": now}).Execute()
	if err != nil {
		t.Fatalf("Failed to insert test row: %v", err)
	}

	// 2. Updated schema:
	// - Remove `deprecated_notes`
	// - Change `price` type from "text" to "number" (NUMERIC)
	// - Change `in_stock` type from "text" to "bool" (INTEGER)
	// - Add `category` field ("text")
	updatedMoul := &schema.Moul{
		ID:   "moul-test-migration",
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "number"},  // Type changed to number
			{Name: "in_stock", Type: "bool"}, // Type changed to bool
			{Name: "category", Type: "text"}, // New field added
		},
	}

	if err := SyncMoulTableColumns(database, updatedMoul); err != nil {
		t.Fatalf("SyncMoulTableColumns failed: %v", err)
	}

	// 3. Inspect columns of updated table via PRAGMA table_info
	type colInfo struct {
		Name string `db:"name"`
		Type string `db:"type"`
	}
	var cols []colInfo
	if err := database.NewQuery("PRAGMA table_info(products);").All(&cols); err != nil {
		t.Fatalf("PRAGMA table_info failed: %v", err)
	}

	colMap := make(map[string]string)
	for _, c := range cols {
		colMap[strings.ToLower(c.Name)] = strings.ToUpper(c.Type)
	}

	// Verify deprecated_notes is gone
	if _, exists := colMap["deprecated_notes"]; exists {
		t.Errorf("Expected column 'deprecated_notes' to be removed from products table")
	}

	// Verify system fields exist
	if _, exists := colMap["id"]; !exists {
		t.Errorf("Expected system column 'id' to exist")
	}

	// Verify price is NUMERIC
	if colMap["price"] != "NUMERIC" {
		t.Errorf("Expected column 'price' to have type NUMERIC, got %q", colMap["price"])
	}

	// Verify in_stock is INTEGER
	if colMap["in_stock"] != "INTEGER" {
		t.Errorf("Expected column 'in_stock' to have type INTEGER, got %q", colMap["in_stock"])
	}

	// Verify new column category exists
	if colMap["category"] != "TEXT" {
		t.Errorf("Expected column 'category' to have type TEXT, got %q", colMap["category"])
	}

	// 4. Verify row data was converted properly
	var row struct {
		ID      string  `db:"id"`
		Title   string  `db:"title"`
		Price   float64 `db:"price"`
		InStock int     `db:"in_stock"`
	}

	err = database.NewQuery("SELECT id, title, price, in_stock FROM products WHERE id = 'p1'").One(&row)
	if err != nil {
		t.Fatalf("Failed to fetch migrated row: %v", err)
	}

	if row.Title != "Widget A" {
		t.Errorf("Expected title 'Widget A', got %q", row.Title)
	}
	if row.Price != 99.99 {
		t.Errorf("Expected price 99.99, got %v", row.Price)
	}
	if row.InStock != 1 {
		t.Errorf("Expected in_stock 1, got %v", row.InStock)
	}
}

func TestSyncMoulTableColumns_WorkerMoulIndexPreservation(t *testing.T) {
	database, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer database.Close()

	workerMoul := &schema.Moul{
		ID:   "moul-worker-test",
		Name: "tasks",
		Type: "worker",
		Fields: []schema.MoulField{
			{Name: "payload", Type: "text"},
		},
	}

	if err := CreateMoulTable(database, workerMoul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}

	// Update payload to number type to trigger rebuild
	updatedWorker := &schema.Moul{
		ID:   "moul-worker-test",
		Name: "tasks",
		Type: "worker",
		Fields: []schema.MoulField{
			{Name: "payload", Type: "number"},
		},
	}

	if err := SyncMoulTableColumns(database, updatedWorker); err != nil {
		t.Fatalf("SyncMoulTableColumns rebuild failed for worker moul: %v", err)
	}

	// Verify index idx_tasks_job_processing still exists after rebuild
	var indexCount int
	err = database.NewQuery("SELECT count(*) FROM sqlite_master WHERE type='index' AND name='idx_tasks_job_processing';").Row(&indexCount)
	if err != nil {
		t.Fatalf("Failed to query index existence: %v", err)
	}

	if indexCount != 1 {
		t.Errorf("Expected index idx_tasks_job_processing to exist after table rebuild, got count %d", indexCount)
	}
}
