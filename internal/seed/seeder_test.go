package seed

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
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

// TestSeededPostsAcceptUnchangedRelations re-saves every seeded post with its own relation values,
// as the admin console's record drawer does. Seeded rows are inserted directly, so a relation
// declared stricter than the data (a 1:1 author shared by two posts) only shows up on update.
func TestSeededPostsAcceptUnchangedRelations(t *testing.T) {
	auth.InitJWT("test-secret-key-for-unit-tests-1234")
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init in-memory database: %v", err)
	}
	defer dbConn.Close()

	if err := Seed(dbConn); err != nil {
		t.Fatalf("Seed failed: %v", err)
	}

	postsMoul, err := db.LoadMoulByName(dbConn, "posts")
	if err != nil {
		t.Fatalf("Failed to load posts schema: %v", err)
	}
	var relationFields []string
	for _, f := range postsMoul.Fields {
		if f.Type == "relation" {
			relationFields = append(relationFields, f.Name)
		}
	}
	if len(relationFields) == 0 {
		t.Fatal("Expected the seeded posts collection to declare relation fields")
	}

	var posts []dbx.NullStringMap
	if err := dbConn.Select("*").From("posts").OrderBy("id").All(&posts); err != nil {
		t.Fatalf("Failed to list seeded posts: %v", err)
	}
	if len(posts) < 3 {
		t.Fatalf("Expected at least 3 seeded posts, got %d", len(posts))
	}

	router := handlers.NewRouter(dbConn, nil, nil, nil, nil, nil, "", true, "test")
	token, err := auth.GenerateToken("root_admin_01", "admin@example.com", "admin", "_rootUsers")
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}

	for _, post := range posts {
		id := post["id"].String
		body := map[string]interface{}{}
		for _, name := range relationFields {
			body[name] = post[name].String
		}
		raw, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}

		req := httptest.NewRequest(http.MethodPatch, "/api/moul/posts/records/"+id, bytes.NewReader(raw))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("PATCH posts/%s with %s: expected 200, got %d: %s", id, raw, rec.Code, rec.Body.String())
		}
	}
}
