package rules

import (
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func TestEvaluateRule_PocketBaseSyntax(t *testing.T) {
	// Initialize in-memory SQLite database
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("failed to init test database: %v", err)
	}

	// 1. Create table structure for testing @collection and get/exists
	_, err = testDB.NewQuery("CREATE TABLE user_roles (id TEXT PRIMARY KEY, user_id TEXT, role TEXT)").Execute()
	if err != nil {
		t.Fatalf("failed to create user_roles table: %v", err)
	}
	_, err = testDB.NewQuery("CREATE TABLE posts (id TEXT PRIMARY KEY, title TEXT, author_id TEXT)").Execute()
	if err != nil {
		t.Fatalf("failed to create posts table: %v", err)
	}

	// Insert test data
	_, err = testDB.Insert("user_roles", dbx.Params{"id": "ur1", "user_id": "u1", "role": "admin"}).Execute()
	if err != nil {
		t.Fatalf("failed to seed user_roles: %v", err)
	}
	_, err = testDB.Insert("posts", dbx.Params{"id": "post1", "title": "Lorem Ipsum", "author_id": "u1"}).Execute()
	if err != nil {
		t.Fatalf("failed to seed posts: %v", err)
	}

	// Insert Moul metadata for get test
	postsMoul := schema.Moul{
		ID:   "moul-posts",
		Name: "posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "author_id", Type: "text"},
		},
	}
	fieldsJson, _ := postsMoul.SerializeFields()
	rulesJson, _ := postsMoul.SerializeRules()
	_, err = testDB.Insert("_moul", dbx.Params{
		"id":         postsMoul.ID,
		"name":       postsMoul.Name,
		"type":       postsMoul.Type,
		"fields":     fieldsJson,
		"rules":      rulesJson,
		"created_at": time.Now().Format(time.RFC3339),
		"updated_at": time.Now().Format(time.RFC3339),
	}).Execute()
	if err != nil {
		t.Fatalf("failed to register posts moul: %v", err)
	}

	// Define test cases
	tests := []struct {
		name           string
		rule           string
		auth           map[string]interface{}
		record         map[string]interface{}
		requestContext map[string]interface{}
		expected       bool
		expectError    bool
	}{
		{
			name:     "Empty rule",
			rule:     "",
			expected: true,
		},
		{
			name: "Basic equality operator translation",
			rule: "status = 'active'",
			record: map[string]interface{}{
				"status": "active",
			},
			expected: true,
		},
		{
			name: "Basic request auth path",
			rule: "@request.auth.id != ''",
			auth: map[string]interface{}{
				"id": "u1",
			},
			expected: true,
		},
		{
			name: "Request query check",
			rule: "@request.query.search != ''",
			requestContext: map[string]interface{}{
				"query": map[string]interface{}{
					"search": "golang",
				},
			},
			expected: true,
		},
		{
			name: "Request header check (normalization)",
			rule: "@request.headers.x_custom_header = 'val'",
			requestContext: map[string]interface{}{
				"headers": map[string]interface{}{
					"x_custom_header": "val",
				},
			},
			expected: true,
		},
		{
			name: "Like (~) operator translation",
			rule: "title ~ 'Lorem%'",
			record: map[string]interface{}{
				"title": "Lorem Ipsum",
			},
			expected: true,
		},
		{
			name: "Like (~) operator default wildcard wrapping",
			rule: "title ~ 'Ipsum'",
			record: map[string]interface{}{
				"title": "Lorem Ipsum dolor",
			},
			expected: true,
		},
		{
			name: "Wildcard operator ?=",
			rule: "tags ?= 'test'",
			record: map[string]interface{}{
				"tags": []interface{}{"other", "test"},
			},
			expected: true,
		},
		{
			name: "Datetime macro @now comparison",
			rule: "created_at < @now",
			record: map[string]interface{}{
				"created_at": "2020-01-01 00:00:00Z",
			},
			expected: true,
		},
		{
			name: "Modifier :lower",
			rule: "title:lower = 'lorem'",
			record: map[string]interface{}{
				"title": "LOREM",
			},
			expected: true,
		},
		{
			name: "Modifier :length on slice",
			rule: "tags:length = 2",
			record: map[string]interface{}{
				"tags": []interface{}{"a", "b"},
			},
			expected: true,
		},
		{
			name: "Modifier :isset on request body",
			rule: "@request.body.role:isset = false",
			requestContext: map[string]interface{}{
				"body": map[string]interface{}{
					"title": "hello",
				},
			},
			expected: true,
		},
		{
			name: "Modifier :changed on request body",
			rule: "@request.body.role:changed = false",
			record: map[string]interface{}{
				"role": "user",
			},
			requestContext: map[string]interface{}{
				"body": map[string]interface{}{
					"role": "user",
				},
			},
			expected: true,
		},
		{
			name: "Modifier :each with like",
			rule: "tags:each ~ 'tag'",
			record: map[string]interface{}{
				"tags": []interface{}{"tag1", "tag2"},
			},
			expected: true,
		},
		{
			name: "Modifier :each mismatch",
			rule: "tags:each ~ 'tag'",
			record: map[string]interface{}{
				"tags": []interface{}{"tag1", "other"},
			},
			expected: false,
		},
		{
			name: "Function geoDistance",
			rule: "geoDistance(23.32, 42.69, 23.33, 42.70) < 5",
			expected: true,
		},
		{
			name: "Function strftime",
			rule: "strftime('%Y-%m', '2026-07-19 12:34:56') = '2026-07'",
			expected: true,
		},
		{
			name: "Grouped @collection query check (Match)",
			rule: "@collection.user_roles.user_id = @request.auth.id && @collection.user_roles.role = 'admin'",
			auth: map[string]interface{}{
				"id": "u1",
			},
			expected: true,
		},
		{
			name: "Grouped @collection query check (Mismatch)",
			rule: "@collection.user_roles.user_id = @request.auth.id && @collection.user_roles.role = 'editor'",
			auth: map[string]interface{}{
				"id": "u1",
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			allowed, err := EvaluateRule(testDB, tt.rule, tt.auth, tt.record, tt.requestContext)
			if (err != nil) != tt.expectError {
				t.Fatalf("unexpected error state: %v (expected error: %t)", err, tt.expectError)
			}
			if allowed != tt.expected {
				t.Errorf("expected allowed=%t, got %t", tt.expected, allowed)
			}
		})
	}
}
