package handlers

import (
	"bufio"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func setupRealtimeTestServer(t *testing.T) (*httptest.Server, *analytics.Engine, func()) {
	t.Helper()
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory test DB: %v", err)
	}

	auth.InitJWT("test-secret-key-realtime-tests-1234")
	analyticsEngine, err := analytics.NewEngine(testDB, "")
	if err != nil {
		testDB.Close()
		t.Fatalf("Failed to initialize analytics engine: %v", err)
	}

	testMoul := &schema.Moul{
		ID:   "moul_sse_test",
		Name: "sse_posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule: "", // public
		},
	}
	if err := db.SaveMoulMetadata(testDB, testMoul); err != nil {
		testDB.Close()
		t.Fatalf("Failed to save moul metadata: %v", err)
	}
	if err := db.CreateMoulTable(testDB, testMoul); err != nil {
		testDB.Close()
		t.Fatalf("Failed to create moul table: %v", err)
	}

	router := NewRouter(testDB, nil, analyticsEngine, nil, nil, nil, "admin-secret-key", true)
	server := httptest.NewServer(router)

	cleanup := func() {
		server.Close()
		analyticsEngine.Close()
		testDB.Close()
	}
	return server, analyticsEngine, cleanup
}

func TestRealtimeSubscribeCollectionSSE(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	// Connect to SSE endpoint
	req, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute GET /api/moul/sse_posts/subscribe: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", resp.StatusCode)
	}

	if contentType := resp.Header.Get("Content-Type"); !strings.Contains(contentType, "text/event-stream") {
		t.Errorf("Expected Content-Type text/event-stream, got %q", contentType)
	}

	reader := bufio.NewReader(resp.Body)

	// Read initial "connected" event
	eventLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read event line: %v", err)
	}
	if !strings.HasPrefix(eventLine, "event: connected") {
		t.Errorf("Expected event: connected, got %q", eventLine)
	}

	dataLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read data line: %v", err)
	}
	if !strings.Contains(dataLine, "connected") {
		t.Errorf("Expected data containing connected, got %q", dataLine)
	}

	// Read empty line separator
	if _, err := reader.ReadString('\n'); err != nil {
		t.Fatalf("Failed to read separator: %v", err)
	}

	// Publish test event asynchronously
	go func() {
		time.Sleep(50 * time.Millisecond)
		realtime.DefaultHub.Publish(realtime.Event{
			Action: "create",
			Moul:   "sse_posts",
			Record: map[string]interface{}{"id": "rec_sse_1", "title": "Realtime SSE Post"},
		}, nil)
	}()

	// Read published event
	publishedEventLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read published event line: %v", err)
	}
	if !strings.HasPrefix(publishedEventLine, "event: create") {
		t.Errorf("Expected event: create, got %q", publishedEventLine)
	}

	publishedDataLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read published data line: %v", err)
	}
	if !strings.Contains(publishedDataLine, "rec_sse_1") {
		t.Errorf("Expected published data containing rec_sse_1, got %q", publishedDataLine)
	}
}

func TestRealtimeTicketExchange_BearerAuth(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	token, err := auth.GenerateToken("usr_test_1", "test@moul.dev", "testuser", "users")
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket", nil)
	if err != nil {
		t.Fatalf("Failed to build ticket request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute ticket request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", resp.StatusCode)
	}

	var res map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		t.Fatalf("Failed to decode ticket JSON: %v", err)
	}

	ticket, ok := res["ticket"].(string)
	if !ok || !strings.HasPrefix(ticket, "tkt_") {
		t.Errorf("Expected ticket string with prefix 'tkt_', got %v", res["ticket"])
	}
	if res["expiresIn"] != float64(30) {
		t.Errorf("Expected expiresIn 30, got %v", res["expiresIn"])
	}
}

func TestRealtimeTicketExchange_AdminKeyAuth(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	req, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket", nil)
	if err != nil {
		t.Fatalf("Failed to build ticket request: %v", err)
	}
	req.Header.Set("X-Admin-Key", "admin-secret-key")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute ticket request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", resp.StatusCode)
	}

	var res map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		t.Fatalf("Failed to decode ticket JSON: %v", err)
	}
	ticket, ok := res["ticket"].(string)
	if !ok || !strings.HasPrefix(ticket, "tkt_") {
		t.Errorf("Expected ticket string with prefix 'tkt_', got %v", res["ticket"])
	}
}

func TestRealtimeTicketExchange_Unauthenticated(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	req, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket", nil)
	if err != nil {
		t.Fatalf("Failed to build request: %v", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized, got %d", resp.StatusCode)
	}
}

func TestRealtimeSubscribeWithSingleUseTicket(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	token, err := auth.GenerateToken("usr_ticket_1", "ticket@moul.dev", "ticketuser", "users")
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	// 1. Request ticket
	ticketReq, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket", nil)
	if err != nil {
		t.Fatalf("Failed to build ticket request: %v", err)
	}
	ticketReq.Header.Set("Authorization", "Bearer "+token)

	ticketResp, err := http.DefaultClient.Do(ticketReq)
	if err != nil {
		t.Fatalf("Failed to execute ticket request: %v", err)
	}
	defer ticketResp.Body.Close()

	var res map[string]interface{}
	if err := json.NewDecoder(ticketResp.Body).Decode(&res); err != nil {
		t.Fatalf("Failed to decode ticket JSON: %v", err)
	}
	ticket := res["ticket"].(string)

	// 2. First connection with ticket -> Must succeed (status 200)
	connectReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?ticket="+ticket, nil)
	if err != nil {
		t.Fatalf("Failed to build subscribe request: %v", err)
	}

	connectResp, err := http.DefaultClient.Do(connectReq)
	if err != nil {
		t.Fatalf("Failed to execute subscribe request: %v", err)
	}
	defer connectResp.Body.Close()

	if connectResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200 for valid ticket connection, got %d", connectResp.StatusCode)
	}

	// 3. Second connection with same ticket -> Must fail (status 401, single-use enforced)
	reuseReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?ticket="+ticket, nil)
	if err != nil {
		t.Fatalf("Failed to build reuse request: %v", err)
	}

	reuseResp, err := http.DefaultClient.Do(reuseReq)
	if err != nil {
		t.Fatalf("Failed to execute reuse request: %v", err)
	}
	defer reuseResp.Body.Close()

	if reuseResp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected status 401 for reused ticket, got %d", reuseResp.StatusCode)
	}
}

func TestRealtimeSubscribe_QueryCredentialsRejected(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	// 1. ?token= parameter -> 400 Bad Request
	tokenReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?token=somejwttoken", nil)
	if err != nil {
		t.Fatalf("Failed to build request: %v", err)
	}
	tokenResp, err := http.DefaultClient.Do(tokenReq)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	defer tokenResp.Body.Close()

	if tokenResp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 Bad Request for ?token=, got %d", tokenResp.StatusCode)
	}

	// 2. ?admin_key= parameter -> 400 Bad Request
	adminReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?admin_key=secretkey", nil)
	if err != nil {
		t.Fatalf("Failed to build request: %v", err)
	}
	adminResp, err := http.DefaultClient.Do(adminReq)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	defer adminResp.Body.Close()

	if adminResp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 Bad Request for ?admin_key=, got %d", adminResp.StatusCode)
	}
}

func setupRealtimeTestServerWithDB(t *testing.T) (*httptest.Server, *dbx.DB, func()) {
	t.Helper()
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory test DB: %v", err)
	}

	auth.InitJWT("test-secret-key-realtime-tests-1234")
	analyticsEngine, err := analytics.NewEngine(testDB, "")
	if err != nil {
		if closeErr := testDB.Close(); closeErr != nil {
			t.Errorf("Failed to close testDB: %v", closeErr)
		}
		t.Fatalf("Failed to initialize analytics engine: %v", err)
	}

	testMoul := &schema.Moul{
		ID:   "moul_sse_test",
		Name: "sse_posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "authorId", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule: "", // public
		},
	}
	if err := db.SaveMoulMetadata(testDB, testMoul); err != nil {
		if closeErr := testDB.Close(); closeErr != nil {
			t.Errorf("Failed to close testDB: %v", closeErr)
		}
		t.Fatalf("Failed to save moul metadata: %v", err)
	}
	if err := db.CreateMoulTable(testDB, testMoul); err != nil {
		if closeErr := testDB.Close(); closeErr != nil {
			t.Errorf("Failed to close testDB: %v", closeErr)
		}
		t.Fatalf("Failed to create moul table: %v", err)
	}

	router := NewRouter(testDB, nil, analyticsEngine, nil, nil, nil, "admin-secret-key", true)
	server := httptest.NewServer(router)

	cleanup := func() {
		server.Close()
		if closeErr := analyticsEngine.Close(); closeErr != nil {
			t.Errorf("Failed to close analytics engine: %v", closeErr)
		}
		if closeErr := testDB.Close(); closeErr != nil {
			t.Errorf("Failed to close testDB: %v", closeErr)
		}
	}
	return server, testDB, cleanup
}

func TestRealtimeSSE_ImmediateDisconnectOnTokenRevocation(t *testing.T) {
	server, testDB, cleanup := setupRealtimeTestServerWithDB(t)
	defer cleanup()

	token, err := auth.GenerateToken("usr_sse_rev", "rev@moul.dev", "revuser", "users")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute SSE connect: %v", err)
	}
	defer resp.Body.Close()

	reader := bufio.NewReader(resp.Body)

	// Read initial connected event
	eventLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read event line: %v", err)
	}
	if !strings.HasPrefix(eventLine, "event: connected") {
		t.Fatalf("Expected event: connected, got %q", eventLine)
	}
	if _, err := reader.ReadString('\n'); err != nil {
		t.Fatalf("Failed to read data line: %v", err)
	}
	if _, err := reader.ReadString('\n'); err != nil {
		t.Fatalf("Failed to read separator line: %v", err)
	}

	// Revoke token via database
	if err := db.RevokeToken(testDB, token, time.Now().Add(1*time.Hour)); err != nil {
		t.Fatalf("Failed to revoke token: %v", err)
	}

	// Read next event: must be event: auth_expired
	authExpiredEventLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read auth_expired line: %v", err)
	}
	if !strings.HasPrefix(authExpiredEventLine, "event: auth_expired") {
		t.Fatalf("Expected event: auth_expired, got %q", authExpiredEventLine)
	}

	authExpiredDataLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read auth_expired data: %v", err)
	}
	if !strings.Contains(authExpiredDataLine, "auth_expired") {
		t.Fatalf("Expected data containing auth_expired, got %q", authExpiredDataLine)
	}
}

func TestRealtimeTicketWithTokenRevocation(t *testing.T) {
	server, testDB, cleanup := setupRealtimeTestServerWithDB(t)
	defer cleanup()

	token, err := auth.GenerateToken("usr_ticket_rev", "ticketrev@moul.dev", "ticketuser", "users")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// 1. Issue ticket with Authorization header
	ticketReq, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket", nil)
	if err != nil {
		t.Fatalf("Failed to build ticket request: %v", err)
	}
	ticketReq.Header.Set("Authorization", "Bearer "+token)

	ticketResp, err := http.DefaultClient.Do(ticketReq)
	if err != nil {
		t.Fatalf("Failed to issue ticket: %v", err)
	}
	defer ticketResp.Body.Close()

	var ticketPayload struct {
		Ticket string `json:"ticket"`
	}
	if err := json.NewDecoder(ticketResp.Body).Decode(&ticketPayload); err != nil {
		t.Fatalf("Failed to decode ticket: %v", err)
	}

	// 2. Connect to SSE via ?ticket=
	sseReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?ticket="+ticketPayload.Ticket, nil)
	if err != nil {
		t.Fatalf("Failed to build SSE request: %v", err)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	sseResp, err := client.Do(sseReq)
	if err != nil {
		t.Fatalf("Failed to execute SSE request: %v", err)
	}
	defer sseResp.Body.Close()

	reader := bufio.NewReader(sseResp.Body)
	// Read initial connected event
	eventLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read event line: %v", err)
	}
	if !strings.HasPrefix(eventLine, "event: connected") {
		t.Fatalf("Expected event: connected, got %q", eventLine)
	}
	if _, err := reader.ReadString('\n'); err != nil {
		t.Fatalf("Failed to read data line: %v", err)
	}
	if _, err := reader.ReadString('\n'); err != nil {
		t.Fatalf("Failed to read separator line: %v", err)
	}

	// 3. Revoke original JWT token
	if err := db.RevokeToken(testDB, token, time.Now().Add(1*time.Hour)); err != nil {
		t.Fatalf("Failed to revoke token: %v", err)
	}

	// 4. Ticket-based stream must receive auth_expired
	authExpiredEventLine, err := reader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read auth_expired line: %v", err)
	}
	if !strings.HasPrefix(authExpiredEventLine, "event: auth_expired") {
		t.Fatalf("Expected event: auth_expired, got %q", authExpiredEventLine)
	}
}
