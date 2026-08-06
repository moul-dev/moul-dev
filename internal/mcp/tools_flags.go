package mcp

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/moul-dev/moul-dev/internal/flags"
)

func (s *Server) registerFlagTools() {
	// 1. List Feature Flags
	listFlagsTool := mcp.NewTool(
		"moul_list_feature_flags",
		mcp.WithDescription("List all feature flags stored in moul-dev"),
	)
	s.mcpServer.AddTool(listFlagsTool, s.handleListFeatureFlags)

	// 2. Set Feature Flag
	setFlagTool := mcp.NewTool(
		"moul_set_feature_flag",
		mcp.WithDescription("Create or update a feature flag"),
		mcp.WithString("key", mcp.Required(), mcp.Description("Unique key of the feature flag")),
		mcp.WithBoolean("enabled", mcp.Required(), mcp.Description("Enable or disable flag")),
		mcp.WithString("description", mcp.Description("Description of what the feature flag controls")),
		mcp.WithString("default_value", mcp.Description("Default string/boolean/number value")),
	)
	s.mcpServer.AddTool(setFlagTool, s.handleSetFeatureFlag)
}

func (s *Server) handleListFeatureFlags(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	store := flags.NewStore(s.dbConn)
	flagList, err := store.ListFlags()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to list feature flags: %v", err)), nil
	}

	out, _ := json.MarshalIndent(flagList, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}

func (s *Server) handleSetFeatureFlag(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	key := req.GetString("key", "")
	if key == "" {
		return mcp.NewToolResultError("key parameter is required"), nil
	}

	enabled := req.GetBool("enabled", true)
	description := req.GetString("description", "")
	defaultValue := req.GetString("default_value", "")

	store := flags.NewStore(s.dbConn)
	existing, err := store.GetFlag(key)

	var flag *flags.Flag
	if err == nil && existing != nil {
		flag = existing
		flag.Enabled = enabled
		if description != "" {
			flag.Description = description
		}
		if defaultValue != "" {
			flag.DefaultValue = defaultValue
		}
	} else {
		flag = flags.NewFlag("", key, description, enabled, defaultValue, flags.GatesConfig{})
	}

	if err := store.SaveFlag(flag); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to save feature flag %q: %v", key, err)), nil
	}

	out, _ := json.MarshalIndent(flag, "", "  ")
	return mcp.NewToolResultText(string(out)), nil
}
