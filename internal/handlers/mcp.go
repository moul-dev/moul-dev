package handlers

import (
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
	if h.server == nil || h.server.SSEServer() == nil {
		return echo.NewHTTPError(503, "MCP server not initialized")
	}
	h.server.SSEServer().ServeHTTP(c.Response(), c.Request())
	return nil
}
