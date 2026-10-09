package handlers

import (
	"strings"

	"github.com/labstack/echo/v5"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
)

type MCPHandler struct {
	server *moulmcp.Server
}

func NewMCPHandler(server *moulmcp.Server) *MCPHandler {
	return &MCPHandler{server: server}
}

func (h *MCPHandler) ServeHTTP(c *echo.Context) error {
	if h.server == nil {
		return echo.NewHTTPError(503, "MCP server not initialized")
	}

	req := c.Request()
	// Normalize path so both /mcp and /api/mcp match StreamableServer's registered endpoint
	if strings.HasPrefix(req.URL.Path, "/mcp") {
		req.URL.Path = "/api" + req.URL.Path
	}

	// Use StreamableServer if available (supports MCP 2025 specification: GET, POST, DELETE, etc.)
	if h.server.StreamableServer() != nil {
		h.server.StreamableServer().ServeHTTP(c.Response(), req)
		return nil
	}

	// Fallback to legacy SSEServer
	if h.server.SSEServer() != nil {
		h.server.SSEServer().ServeHTTP(c.Response(), req)
		return nil
	}

	return echo.NewHTTPError(503, "MCP server transport not available")
}
