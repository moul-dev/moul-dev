package mcp

import (
	"github.com/mark3labs/mcp-go/server"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/pocketbase/dbx"
)

type Server struct {
	mcpServer        *server.MCPServer
	sseServer        *server.SSEServer
	streamableServer *server.StreamableHTTPServer
	dbConn           *dbx.DB
	workerEngine     *worker.Engine
	analyticsEngine  *analytics.Engine
	sysmonCollector  *sysmon.Collector
}

func NewServer(dbConn *dbx.DB, workerEngine *worker.Engine, analyticsEngine *analytics.Engine, sysmonCollector *sysmon.Collector, version string) *Server {
	if version == "" {
		version = "dev"
	}
	s := server.NewMCPServer(
		"moul-dev",
		version,
		server.WithLogging(),
		server.WithToolCapabilities(true),
	)

	srv := &Server{
		mcpServer:       s,
		dbConn:          dbConn,
		workerEngine:    workerEngine,
		analyticsEngine: analyticsEngine,
		sysmonCollector: sysmonCollector,
	}

	srv.registerCollectionTools()
	srv.registerRecordTools()
	srv.registerWorkerTools()
	srv.registerFlagTools()
	srv.registerSysmonTools()

	// Initialize SSE Server endpoint configuration (Legacy SSE specification)
	srv.sseServer = server.NewSSEServer(
		s,
		server.WithSSEEndpoint("/api/mcp"),
		server.WithMessageEndpoint("/api/mcp/message"),
	)

	// Initialize Streamable HTTP Server endpoint configuration (MCP 2025 specification)
	srv.streamableServer = server.NewStreamableHTTPServer(
		s,
		server.WithEndpointPath("/api/mcp"),
	)

	return srv
}

func (s *Server) MCPServer() *server.MCPServer {
	return s.mcpServer
}

func (s *Server) SSEServer() *server.SSEServer {
	return s.sseServer
}

func (s *Server) StreamableServer() *server.StreamableHTTPServer {
	return s.streamableServer
}

func (s *Server) ServeStdio() error {
	return server.ServeStdio(s.mcpServer)
}
