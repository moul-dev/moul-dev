package seed

import (
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func TestSeed(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init in-memory database: %v", err)
	}
	defer dbConn.Close()

	if err := Seed(dbConn); err != nil {
		t.Fatalf("Seed failed: %v", err)
	}

	// 1. Verify Users
	var userCount int
	err = dbConn.Select("COUNT(*)").From("users").Row(&userCount)
	if err != nil || userCount < 3 {
		t.Errorf("Expected at least 3 users, got %d (err: %v)", userCount, err)
	}

	// 2. Verify Posts
	var postCount int
	err = dbConn.Select("COUNT(*)").From("posts").Row(&postCount)
	if err != nil || postCount < 3 {
		t.Errorf("Expected at least 3 posts, got %d (err: %v)", postCount, err)
	}

	// 3. Verify Categories
	var catCount int
	err = dbConn.Select("COUNT(*)").From("categories").Row(&catCount)
	if err != nil || catCount < 4 {
		t.Errorf("Expected at least 4 categories, got %d (err: %v)", catCount, err)
	}

	// 4. Verify Tasks Queue
	var jobCount int
	err = dbConn.Select("COUNT(*)").From("tasks_queue").Row(&jobCount)
	if err != nil || jobCount < 3 {
		t.Errorf("Expected at least 3 worker jobs, got %d (err: %v)", jobCount, err)
	}

	// 5. Verify Flags in _feature_flags
	var flagCount int
	err = dbConn.Select("COUNT(*)").From("_feature_flags").Row(&flagCount)
	if err != nil || flagCount < 4 {
		t.Errorf("Expected at least 4 flags, got %d (err: %v)", flagCount, err)
	}

	// 6. Verify Root User
	var rootUser dbx.NullStringMap
	err = dbConn.Select("*").From("_rootUsers").Where(dbx.HashExp{"email": "admin@example.com"}).One(&rootUser)
	if err != nil {
		t.Errorf("Expected root admin user to exist in _rootUsers: %v", err)
	}
}
