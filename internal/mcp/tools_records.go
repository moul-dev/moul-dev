package mcp

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func (s *Server) registerRecordTools() {
	// 1. List Records
	listRecordsTool := mcp.NewTool(
		"moul_list_records",
		mcp.WithDescription("List records from a specified collection"),
		mcp.WithString("collection", mcp.Required(), mcp.Description("Collection/table name")),
		mcp.WithInteger("page", mcp.Description("Page number (default: 1)")),
		mcp.WithInteger("per_page", mcp.Description("Records per page (default: 30)")),
	)
	s.mcpServer.AddTool(listRecordsTool, s.handleListRecords)

	// 2. Get Record
	getRecordTool := mcp.NewTool(
		"moul_get_record",
		mcp.WithDescription("Get a single record by ID from a collection"),
		mcp.WithString("collection", mcp.Required(), mcp.Description("Collection/table name")),
		mcp.WithString("id", mcp.Required(), mcp.Description("Record ID")),
	)
	s.mcpServer.AddTool(getRecordTool, s.handleGetRecord)

	// 3. Create Record
	createRecordTool := mcp.NewTool(
		"moul_create_record",
		mcp.WithDescription("Create a new record in a collection"),
		mcp.WithString("collection", mcp.Required(), mcp.Description("Collection/table name")),
		mcp.WithString("data_json", mcp.Required(), mcp.Description("JSON object representing the record data")),
	)
	s.mcpServer.AddTool(createRecordTool, s.handleCreateRecord)

	// 4. Update Record
	updateRecordTool := mcp.NewTool(
		"moul_update_record",
		mcp.WithDescription("Update an existing record in a collection"),
		mcp.WithString("collection", mcp.Required(), mcp.Description("Collection/table name")),
		mcp.WithString("id", mcp.Required(), mcp.Description("Record ID")),
		mcp.WithString("data_json", mcp.Required(), mcp.Description("JSON object with fields to update")),
	)
	s.mcpServer.AddTool(updateRecordTool, s.handleUpdateRecord)

	// 5. Delete Record
	deleteRecordTool := mcp.NewTool(
		"moul_delete_record",
		mcp.WithDescription("Delete a record by ID from a collection"),
		mcp.WithString("collection", mcp.Required(), mcp.Description("Collection/table name")),
		mcp.WithString("id", mcp.Required(), mcp.Description("Record ID")),
	)
	s.mcpServer.AddTool(deleteRecordTool, s.handleDeleteRecord)
}

func (s *Server) handleListRecords(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	colName := req.GetString("collection", "")
	if colName == "" {
		return mcp.NewToolResultError("collection parameter is required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, colName)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("collection %q not found: %v", colName, err)), nil
	}

	page := req.GetInt("page", 1)
	if page < 1 {
		page = 1
	}
	perPage := req.GetInt("per_page", 30)
	if perPage < 1 || perPage > 500 {
		perPage = 30
	}
	offset := (page - 1) * perPage

	var count int
	err = s.dbConn.Select("COUNT(*)").From(db.QuoteIdentifier(moul.Name)).Row(&count)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to count records: %v", err)), nil
	}

	var rows []dbx.NullStringMap
	err = s.dbConn.Select("*").
		From(db.QuoteIdentifier(moul.Name)).
		Limit(int64(perPage)).
		Offset(int64(offset)).
		OrderBy("created_at DESC").
		All(&rows)

	if err != nil && err != sql.ErrNoRows {
		return mcp.NewToolResultError(fmt.Sprintf("failed to query records: %v", err)), nil
	}

	records := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		rec := make(map[string]interface{})
		for k, v := range row {
			if v.Valid {
				rec[k] = v.String
			} else {
				rec[k] = nil
			}
		}
		records = append(records, rec)
	}

	result := map[string]interface{}{
		"page":        page,
		"per_page":    perPage,
		"total_items": count,
		"total_pages": (count + perPage - 1) / perPage,
		"items":       records,
	}

	out, _ := json.MarshalIndent(result, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleGetRecord(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	colName := req.GetString("collection", "")
	id := req.GetString("id", "")
	if colName == "" || id == "" {
		return mcp.NewToolResultError("collection and id parameters are required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, colName)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("collection %q not found: %v", colName, err)), nil
	}

	var row dbx.NullStringMap
	err = s.dbConn.Select("*").
		From(db.QuoteIdentifier(moul.Name)).
		Where(dbx.HashExp{"id": id}).
		One(&row)

	if err != nil {
		if err == sql.ErrNoRows {
			return mcp.NewToolResultError(fmt.Sprintf("record %q not found in collection %q", id, colName)), nil
		}
		return mcp.NewToolResultError(fmt.Sprintf("failed to load record: %v", err)), nil
	}

	rec := make(map[string]interface{})
	for k, v := range row {
		if v.Valid {
			rec[k] = v.String
		} else {
			rec[k] = nil
		}
	}

	out, _ := json.MarshalIndent(rec, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleCreateRecord(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	colName := req.GetString("collection", "")
	dataJSON := req.GetString("data_json", "")
	if colName == "" || dataJSON == "" {
		return mcp.NewToolResultError("collection and data_json parameters are required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, colName)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("collection %q not found: %v", colName, err)), nil
	}

	var body map[string]interface{}
	if err := json.Unmarshal([]byte(dataJSON), &body); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("invalid data_json: %v", err)), nil
	}

	id, ok := body["id"].(string)
	if !ok || strings.TrimSpace(id) == "" {
		id = uuid.New().String()
	}

	now := time.Now().UTC().Format(time.RFC3339)
	params := dbx.Params{
		"id":         id,
		"created_at": now,
		"updated_at": now,
	}

	for k, v := range body {
		if k == "id" || k == "created_at" || k == "updated_at" {
			continue
		}
		if v == nil {
			params[k] = nil
		} else if str, ok := v.(string); ok {
			params[k] = str
		} else {
			bytes, _ := json.Marshal(v)
			params[k] = string(bytes)
		}
	}

	_, err = s.dbConn.Insert(db.QuoteIdentifier(moul.Name), params).Execute()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to insert record into %q: %v", colName, err)), nil
	}

	params["id"] = id
	params["created_at"] = now
	params["updated_at"] = now
	out, _ := json.MarshalIndent(params, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleUpdateRecord(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	colName := req.GetString("collection", "")
	id := req.GetString("id", "")
	dataJSON := req.GetString("data_json", "")
	if colName == "" || id == "" || dataJSON == "" {
		return mcp.NewToolResultError("collection, id, and data_json parameters are required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, colName)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("collection %q not found: %v", colName, err)), nil
	}

	var body map[string]interface{}
	if err := json.Unmarshal([]byte(dataJSON), &body); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("invalid data_json: %v", err)), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)
	params := dbx.Params{
		"updated_at": now,
	}

	for k, v := range body {
		if k == "id" || k == "created_at" || k == "updated_at" {
			continue
		}
		if v == nil {
			params[k] = nil
		} else if str, ok := v.(string); ok {
			params[k] = str
		} else {
			bytes, _ := json.Marshal(v)
			params[k] = string(bytes)
		}
	}

	res, err := s.dbConn.Update(db.QuoteIdentifier(moul.Name), params, dbx.HashExp{"id": id}).Execute()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to update record %q: %v", id, err)), nil
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return mcp.NewToolResultError(fmt.Sprintf("record %q not found in collection %q", id, colName)), nil
	}

	return s.handleGetRecord(ctx, req)
}

func (s *Server) handleDeleteRecord(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	colName := req.GetString("collection", "")
	id := req.GetString("id", "")
	if colName == "" || id == "" {
		return mcp.NewToolResultError("collection and id parameters are required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, colName)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("collection %q not found: %v", colName, err)), nil
	}

	res, err := s.dbConn.Delete(db.QuoteIdentifier(moul.Name), dbx.HashExp{"id": id}).Execute()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to delete record %q: %v", id, err)), nil
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return mcp.NewToolResultError(fmt.Sprintf("record %q not found in collection %q", id, colName)), nil
	}

	return mcp.NewToolResultText(fmt.Sprintf("Record %q deleted successfully from collection %q", id, colName)), nil
}
