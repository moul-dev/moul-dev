package mcp

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func (s *Server) registerWorkerTools() {
	// 1. List Worker Jobs
	listJobsTool := mcp.NewTool(
		"moul_list_worker_jobs",
		mcp.WithDescription("List background jobs from a worker table"),
		mcp.WithString("table", mcp.Required(), mcp.Description("Worker table name (e.g. jobs)")),
		mcp.WithString("state", mcp.Description("Filter by state: available, executing, completed, retryable, cancelled, discarded")),
		mcp.WithInteger("limit", mcp.Description("Max records to fetch (default: 50)")),
	)
	s.mcpServer.AddTool(listJobsTool, s.handleListWorkerJobs)

	// 2. Enqueue Job
	enqueueJobTool := mcp.NewTool(
		"moul_enqueue_job",
		mcp.WithDescription("Enqueue a new background job into a worker table"),
		mcp.WithString("table", mcp.Required(), mcp.Description("Worker table name")),
		mcp.WithString("worker", mcp.Required(), mcp.Description("Worker handler name (e.g. SendEmail)")),
		mcp.WithString("args_json", mcp.Description("JSON object with job arguments")),
		mcp.WithString("queue", mcp.Description("Queue name (default: default)")),
		mcp.WithInteger("priority", mcp.Description("Job priority (higher priority runs first, default: 0)")),
	)
	s.mcpServer.AddTool(enqueueJobTool, s.handleEnqueueJob)

	// 3. Cancel Job
	cancelJobTool := mcp.NewTool(
		"moul_cancel_job",
		mcp.WithDescription("Cancel a pending or retryable worker job"),
		mcp.WithString("table", mcp.Required(), mcp.Description("Worker table name")),
		mcp.WithString("id", mcp.Required(), mcp.Description("Job ID")),
	)
	s.mcpServer.AddTool(cancelJobTool, s.handleCancelJob)
}

func (s *Server) handleListWorkerJobs(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	tableName := req.GetString("table", "")
	if tableName == "" {
		return mcp.NewToolResultError("table parameter is required"), nil
	}

	moul, err := db.LoadMoulByName(s.dbConn, tableName)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("table %q not found: %v", tableName, err)), nil
	}
	if moul.Type != "worker" {
		return mcp.NewToolResultError(fmt.Sprintf("table %q is not of type 'worker'", tableName)), nil
	}

	stateFilter := req.GetString("state", "")
	limit := req.GetInt("limit", 50)
	if limit < 1 || limit > 500 {
		limit = 50
	}

	q := s.dbConn.Select("*").From(db.QuoteIdentifier(tableName))
	if stateFilter != "" {
		q.Where(dbx.HashExp{"state": stateFilter})
	}
	q.OrderBy("inserted_at DESC").Limit(int64(limit))

	var rows []dbx.NullStringMap
	if err := q.All(&rows); err != nil && err != sql.ErrNoRows {
		return mcp.NewToolResultError(fmt.Sprintf("failed to query worker jobs: %v", err)), nil
	}

	jobs := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		j := make(map[string]interface{})
		for k, v := range row {
			if v.Valid {
				j[k] = v.String
			} else {
				j[k] = nil
			}
		}
		jobs = append(jobs, j)
	}

	out, _ := json.MarshalIndent(jobs, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleEnqueueJob(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	tableName := req.GetString("table", "")
	workerName := req.GetString("worker", "")
	if tableName == "" || workerName == "" {
		return mcp.NewToolResultError("table and worker parameters are required"), nil
	}

	argsJSON := req.GetString("args_json", "")
	var args map[string]interface{}
	if argsJSON != "" {
		if err := json.Unmarshal([]byte(argsJSON), &args); err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid args_json: %v", err)), nil
		}
	}

	jobOpts := map[string]interface{}{
		"worker":   workerName,
		"args":     args,
		"queue":    req.GetString("queue", "default"),
		"priority": req.GetInt("priority", 0),
	}

	if s.workerEngine == nil {
		return mcp.NewToolResultError("worker engine is not initialized"), nil
	}

	res, err := s.workerEngine.Enqueue(ctx, tableName, jobOpts)
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to enqueue job: %v", err)), nil
	}

	out, _ := json.MarshalIndent(res, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleCancelJob(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	tableName := req.GetString("table", "")
	id := req.GetString("id", "")
	if tableName == "" || id == "" {
		return mcp.NewToolResultError("table and id parameters are required"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)
	res, err := s.dbConn.Update(db.QuoteIdentifier(tableName), dbx.Params{
		"state":        "cancelled",
		"cancelled_at": now,
	}, dbx.HashExp{"id": id}).Execute()

	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to cancel job %q: %v", id, err)), nil
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return mcp.NewToolResultError(fmt.Sprintf("job %q not found in table %q", id, tableName)), nil
	}

	return mcp.NewToolResultText(fmt.Sprintf("Job %q cancelled successfully", id)), nil
}
