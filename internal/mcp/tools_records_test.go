package mcp

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestHandleCreateRecord_IDPrefixPattern(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize db: %v", err)
	}
	defer dbConn.Close()

	// Create a collection named "users"
	m := &schema.Moul{
		ID:   "col-users-1",
		Name: "users",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	}
	if err := db.CreateMoulTable(dbConn, m); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, m); err != nil {
		t.Fatalf("Failed to save metadata: %v", err)
	}

	srv := NewServer(dbConn, nil, nil, nil, "test")

	// Invoke handleCreateRecord
	req := mcp.CallToolRequest{}
	req.Params.Arguments = map[string]interface{}{
		"collection": "users",
		"data_json":  `{"name":"Test User"}`,
	}

	res, err := srv.handleCreateRecord(context.Background(), req)
	if err != nil {
		t.Fatalf("handleCreateRecord failed: %v", err)
	}
	if res.IsError {
		t.Fatalf("handleCreateRecord returned error result: %s", res.Content[0].(mcp.TextContent).Text)
	}

	textContent := res.Content[0].(mcp.TextContent).Text
	var created map[string]interface{}
	if err := json.Unmarshal([]byte(textContent), &created); err != nil {
		t.Fatalf("Failed to parse returned JSON: %v", err)
	}

	id, ok := created["id"].(string)
	if !ok || id == "" {
		t.Fatalf("Expected id in created record, got: %v", created["id"])
	}

	if !strings.HasPrefix(id, "user-") {
		t.Errorf("Expected ID to start with 'user-', got: %q", id)
	}
}
