package mcp_test

import (
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestMCPServerInitialization(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test db: %v", err)
	}
	defer dbConn.Close()

	srv := moulmcp.NewServer(dbConn, nil, nil, nil, "test")
	if srv == nil {
		t.Fatal("Expected non-nil MCP server")
	}

	if srv.MCPServer() == nil {
		t.Fatal("Expected non-nil underlying mcp-go MCPServer")
	}

	if srv.SSEServer() == nil {
		t.Fatal("Expected non-nil SSEServer")
	}
}

func TestCollectionMetadata(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test db: %v", err)
	}
	defer dbConn.Close()

	m := &schema.Moul{
		ID:   "test-col-id",
		Name: "posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
		},
	}

	if err := db.CreateMoulTable(dbConn, m); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}

	if err := db.SaveMoulMetadata(dbConn, m); err != nil {
		t.Fatalf("Failed to save metadata: %v", err)
	}

	srv := moulmcp.NewServer(dbConn, nil, nil, nil, "test")
	if srv == nil {
		t.Fatal("Expected non-nil MCP server")
	}
}
