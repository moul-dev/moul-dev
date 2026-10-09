package mcp

import (
	"os"
	"strings"

	"github.com/gobuffalo/envy"
	"github.com/mark3labs/mcp-go/server"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/pkg/worker"
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
	appName          string
	version          string
}

// ResolveAppName determines the configured name for the application and MCP server.
// Resolution precedence:
// 1. Explicit argument(s) passed to this function (e.g. from CLI flag or app.Config.AppName).
// 2. Database _settings table key "app_name" if customized (not empty and not default "moul-dev").
// 3. Environment variable MOUL_APP_NAME or MOUL_MCP_NAME.
// 4. Database _settings table key "app_name" (if "moul-dev").
// 5. Default fallback: "moul-dev".
func ResolveAppName(dbConn *dbx.DB, explicit ...string) string {
	for _, name := range explicit {
		if trimmed := strings.TrimSpace(name); trimmed != "" {
			return trimmed
		}
	}

	var dbName string
	if dbConn != nil {
		_ = dbConn.Select("value").From("_settings").Where(dbx.HashExp{"key": "app_name"}).Row(&dbName)
		dbName = strings.TrimSpace(dbName)
	}

	// If DB setting is set and customized (not generic "moul-dev"), use it
	if dbName != "" && dbName != "moul-dev" {
		return dbName
	}

	getEnv := func(key string) string {
		if val := strings.TrimSpace(os.Getenv(key)); val != "" {
			return val
		}
		return strings.TrimSpace(envy.Get(key, ""))
	}

	if envName := getEnv("MOUL_APP_NAME"); envName != "" {
		return envName
	}
	if envName := getEnv("MOUL_MCP_NAME"); envName != "" {
		return envName
	}

	if dbName != "" {
		return dbName
	}

	return "moul-dev"
}

func NewServer(dbConn *dbx.DB, workerEngine *worker.Engine, analyticsEngine *analytics.Engine, sysmonCollector *sysmon.Collector, version string, appName ...string) *Server {
	if version == "" {
		version = "dev"
	}
	resolvedName := ResolveAppName(dbConn, appName...)
	s := server.NewMCPServer(
		resolvedName,
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
		appName:         resolvedName,
		version:         version,
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
		server.WithSSEDisableLocalhostProtection(true),
	)

	// Initialize Streamable HTTP Server endpoint configuration (MCP 2025 specification)
	srv.streamableServer = server.NewStreamableHTTPServer(
		s,
		server.WithEndpointPath("/api/mcp"),
		server.WithDisableLocalhostProtection(true),
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

func (s *Server) AppName() string {
	return s.appName
}

func (s *Server) Version() string {
	return s.version
}
