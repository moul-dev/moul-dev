package mcp_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
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

func TestMCPSSEFlow(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test db: %v", err)
	}
	defer dbConn.Close()

	srv := moulmcp.NewServer(dbConn, nil, nil, nil, "test")
	sseServer := srv.SSEServer()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sseServer.ServeHTTP(w, r)
	}))
	defer ts.Close()

	client := ts.Client()
	req, _ := http.NewRequest("GET", ts.URL+"/api/mcp", nil)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("GET /api/mcp failed: %v", err)
	}
	defer resp.Body.Close()

	buf := make([]byte, 1024)
	n, _ := resp.Body.Read(buf)
	sseText := string(buf[:n])
	t.Logf("Received SSE initial output:\n%s", sseText)

	// Extract session ID or endpoint URL
	// data: /api/mcp/message?sessionId=...
	lines := strings.Split(sseText, "\n")
	var endpointPath string
	for _, l := range lines {
		if strings.HasPrefix(l, "data: ") {
			endpointPath = strings.TrimSpace(strings.TrimPrefix(l, "data: "))
			break
		}
	}
	t.Logf("Extracted endpointPath: %s", endpointPath)

	// Send POST initialize request
	initJSON := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0"}}}`
	postReq, _ := http.NewRequest("POST", ts.URL+endpointPath, strings.NewReader(initJSON))
	postReq.Header.Set("Content-Type", "application/json")
	postResp, err := client.Do(postReq)
	if err != nil {
		t.Fatalf("POST initialize failed: %v", err)
	}
	defer postResp.Body.Close()

	postBuf := make([]byte, 1024)
	postN, _ := postResp.Body.Read(postBuf)
	t.Logf("POST initialize status: %d, response: %s", postResp.StatusCode, string(postBuf[:postN]))
}

func TestAppNameConfiguration(t *testing.T) {
	// 1. Default fallback
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init test db: %v", err)
	}
	defer dbConn.Close()

	if err := db.EnsureSystemTables(dbConn); err != nil {
		t.Fatalf("Failed to ensure system tables: %v", err)
	}

	name := moulmcp.ResolveAppName(dbConn)
	if name != "moul-dev" {
		t.Fatalf("Expected default 'moul-dev', got %q", name)
	}

	// 2. Explicit argument override
	explicitSrv := moulmcp.NewServer(dbConn, nil, nil, nil, "1.0.0", "Explicit App")
	if explicitSrv.AppName() != "Explicit App" {
		t.Fatalf("Expected 'Explicit App', got %q", explicitSrv.AppName())
	}

	// 3. Environment variable override
	t.Setenv("MOUL_APP_NAME", "Env App Name")
	nameFromEnv := moulmcp.ResolveAppName(dbConn)
	if nameFromEnv != "Env App Name" {
		t.Fatalf("Expected 'Env App Name', got %q", nameFromEnv)
	}

	// 4. Database _settings table override
	_, err = dbConn.Update("_settings", dbx.Params{"value": "Database Custom App"}, dbx.HashExp{"key": "app_name"}).Execute()
	if err != nil {
		t.Fatalf("Failed to update _settings: %v", err)
	}

	nameFromDB := moulmcp.ResolveAppName(dbConn)
	if nameFromDB != "Database Custom App" {
		t.Fatalf("Expected 'Database Custom App', got %q", nameFromDB)
	}
}
