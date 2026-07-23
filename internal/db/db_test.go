package db

import (
	"database/sql"
	"testing"

	"github.com/moul-dev/moul-dev/internal/schema"
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
			ListRule: "auth.id != nil",
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
