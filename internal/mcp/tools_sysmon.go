package mcp

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/pocketbase/dbx"
)

func (s *Server) registerSysmonTools() {
	// 1. System Metrics
	sysMetricsTool := mcp.NewTool(
		"moul_get_system_metrics",
		mcp.WithDescription("Get current host system resource usage metrics (CPU, RAM, Disk, Load)"),
	)
	s.mcpServer.AddTool(sysMetricsTool, s.handleGetSystemMetrics)

	// 2. Analytics Summary
	analyticsSummaryTool := mcp.NewTool(
		"moul_get_analytics_summary",
		mcp.WithDescription("Get analytics summary including total visitors and HTTP request statistics"),
	)
	s.mcpServer.AddTool(analyticsSummaryTool, s.handleGetAnalyticsSummary)

	// 3. List Request Logs
	listRequestsTool := mcp.NewTool(
		"moul_list_requests",
		mcp.WithDescription("List recent HTTP request logs captured by moul-dev tracking middleware"),
		mcp.WithInteger("limit", mcp.Description("Max records to return (default: 30)")),
	)
	s.mcpServer.AddTool(listRequestsTool, s.handleListRequests)
}

func (s *Server) handleGetSystemMetrics(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	if s.sysmonCollector == nil {
		return mcp.NewToolResultError("system monitoring collector is not initialized"), nil
	}

	snapshot := s.sysmonCollector.GetSnapshot()
	out, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to format sysmon snapshot: %v", err)), nil
	}

	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleGetAnalyticsSummary(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	var totalVisits int
	_ = s.dbConn.Select("COUNT(*)").From("_visits").Row(&totalVisits)

	var totalRequests int
	_ = s.dbConn.Select("COUNT(*)").From("_requests").Row(&totalRequests)

	summary := map[string]interface{}{
		"total_visits":   totalVisits,
		"total_requests": totalRequests,
	}

	out, _ := json.MarshalIndent(summary, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleListRequests(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	limit := req.GetInt("limit", 30)
	if limit < 1 || limit > 500 {
		limit = 30
	}

	var rows []dbx.NullStringMap
	err := s.dbConn.Select("*").
		From("_requests").
		OrderBy("created_at DESC").
		Limit(int64(limit)).
		All(&rows)

	if err != nil && err != sql.ErrNoRows {
		return mcp.NewToolResultError(fmt.Sprintf("failed to list requests: %v", err)), nil
	}

	requests := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		r := make(map[string]interface{})
		for k, v := range row {
			if v.Valid {
				r[k] = v.String
			} else {
				r[k] = nil
			}
		}
		requests = append(requests, r)
	}

	out, _ := json.MarshalIndent(requests, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}
