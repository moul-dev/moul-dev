package handlers_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
)

func TestMCPRouterEndpoints(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	adminKey := "test-admin-key-1234"
	e := handlers.NewRouter(dbConn, nil, nil, nil, nil, nil, adminKey, true)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 1. Direct POST /api/mcp with initialize JSON-RPC (Streamable HTTP specification)
	initJSON := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0"}}}`
	postReq, _ := http.NewRequest("POST", server.URL+"/api/mcp", strings.NewReader(initJSON))
	postReq.Header.Set("X-Admin-Key", adminKey)
	postReq.Header.Set("Content-Type", "application/json")

	postResp, err := client.Do(postReq)
	if err != nil {
		t.Fatalf("POST /api/mcp failed: %v", err)
	}
	defer postResp.Body.Close()

	postBody, _ := io.ReadAll(postResp.Body)
	t.Logf("POST /api/mcp status: %d, body: %s", postResp.StatusCode, string(postBody))

	if postResp.StatusCode != http.StatusOK && postResp.StatusCode != http.StatusAccepted {
		t.Errorf("Expected status 200 or 202 for POST /api/mcp, got %d. Body: %s", postResp.StatusCode, string(postBody))
	}
}
