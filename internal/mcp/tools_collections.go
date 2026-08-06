package mcp

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func (s *Server) registerCollectionTools() {
	// 1. List Collections
	listCollectionsTool := mcp.NewTool(
		"moul_list_collections",
		mcp.WithDescription("List all dynamic collections/tables defined in moul-dev"),
	)
	s.mcpServer.AddTool(listCollectionsTool, s.handleListCollections)

	// 2. Get Collection
	getCollectionTool := mcp.NewTool(
		"moul_get_collection",
		mcp.WithDescription("Get detailed schema and rules for a dynamic collection by name"),
		mcp.WithString("name", mcp.Required(), mcp.Description("Name of the collection")),
	)
	s.mcpServer.AddTool(getCollectionTool, s.handleGetCollection)

	// 3. Create Collection
	createCollectionTool := mcp.NewTool(
		"moul_create_collection",
		mcp.WithDescription("Create a new dynamic collection schema and SQLite table"),
		mcp.WithString("name", mcp.Required(), mcp.Description("Name of the collection")),
		mcp.WithString("type", mcp.Description("Collection type: base, auth, worker, or analytic (default: base)")),
		mcp.WithString("fields_json", mcp.Description("JSON array of field definitions (e.g. [{\"name\":\"title\",\"type\":\"text\"}])")),
	)
	s.mcpServer.AddTool(createCollectionTool, s.handleCreateCollection)

	// 4. Delete Collection
	deleteCollectionTool := mcp.NewTool(
		"moul_delete_collection",
		mcp.WithDescription("Delete a dynamic collection and drop its SQLite table"),
		mcp.WithString("name", mcp.Required(), mcp.Description("Name of the collection to delete")),
	)
	s.mcpServer.AddTool(deleteCollectionTool, s.handleDeleteCollection)
}

func (s *Server) handleListCollections(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	collections, err := db.LoadAllMoul(s.dbConn)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to load collections: %v", err)), nil
	}

	out, err := json.MarshalIndent(collections, "", "  ")
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to format collections JSON: %v", err)), nil
	}

	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleGetCollection(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	name := req.GetString("name", "")
	if name == "" {
		return mcp.NewToolResultError("collection name is required"), nil
	}

	m, err := db.LoadMoulByName(s.dbConn, name)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to find collection %q: %v", name, err)), nil
	}

	out, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to format collection JSON: %v", err)), nil
	}

	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleCreateCollection(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	name := strings.TrimSpace(req.GetString("name", ""))
	if name == "" {
		return mcp.NewToolResultError("collection name is required"), nil
	}

	if err := db.ValidateTableName(name); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("invalid collection name: %v", err)), nil
	}

	colType := req.GetString("type", "base")
	if colType != "auth" && colType != "worker" && colType != "analytic" {
		colType = "base"
	}

	fieldsJSON := req.GetString("fields_json", "")
	var fields []schema.MoulField
	if fieldsJSON != "" {
		if err := json.Unmarshal([]byte(fieldsJSON), &fields); err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid fields_json format: %v", err)), nil
		}
	}

	m := &schema.Moul{
		ID:     uuid.New().String(),
		Name:   name,
		Type:   colType,
		Fields: fields,
	}

	if err := db.CreateMoulTable(s.dbConn, m); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to create table: %v", err)), nil
	}

	if err := db.SaveMoulMetadata(s.dbConn, m); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to save collection metadata: %v", err)), nil
	}

	out, _ := json.MarshalIndent(m, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleDeleteCollection(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	name := req.GetString("name", "")
	if name == "" {
		return mcp.NewToolResultError("collection name is required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, name)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("collection %q not found: %v", name, err)), nil
	}

	_, err = s.dbConn.NewQuery(fmt.Sprintf("DROP TABLE IF EXISTS %s;", db.QuoteIdentifier(moul.Name))).Execute()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to drop table %q: %v", moul.Name, err)), nil
	}

	_, err = s.dbConn.Delete("_moul", dbx.HashExp{"name": name}).Execute()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to delete collection metadata %q: %v", name, err)), nil
	}

	return mcp.NewToolResultText(fmt.Sprintf("Collection %q deleted successfully", name)), nil
}
