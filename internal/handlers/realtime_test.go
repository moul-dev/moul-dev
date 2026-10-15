package handlers

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/cloak"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/middleware"
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

func TestRealtime_NonAdminRevealRejected(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	client := &http.Client{Timeout: 5 * time.Second}

	// 1. Non-admin attempting ?reveal=all on GET /api/moul/:name/subscribe
	req1, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?reveal=all", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	resp1, err := client.Do(req1)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	defer resp1.Body.Close()

	if resp1.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 for non-admin reveal on collection subscribe, got %d", resp1.StatusCode)
	}
	var errBody1 map[string]interface{}
	_ = json.NewDecoder(resp1.Body).Decode(&errBody1)
	if msg, _ := errBody1["message"].(string); !strings.Contains(msg, "The reveal parameter is not permitted on realtime broadcast streams") {
		t.Errorf("Expected rejection message, got %v", msg)
	}

	// 2. Non-admin attempting ?reveal=all on GET /api/moul/subscribe
	req2, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/subscribe?reveal=all", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	resp2, err := client.Do(req2)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	defer resp2.Body.Close()

	if resp2.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 for non-admin reveal on global subscribe, got %d", resp2.StatusCode)
	}

	// 3. Non-admin attempting ?reveal=all on POST /api/realtime/ticket
	req3, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket?reveal=all", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	token, _ := auth.GenerateToken("usr_regular", "regular@moul.dev", "regularuser", "users")
	req3.Header.Set("Authorization", "Bearer "+token)
	resp3, err := client.Do(req3)
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	defer resp3.Body.Close()

	if resp3.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 for non-admin reveal on ticket request, got %d", resp3.StatusCode)
	}
}

func TestRealtime_AdminRevealAllowed(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	client := &http.Client{Timeout: 5 * time.Second}

	// 1. Admin using X-Admin-Key requesting ticket with ?reveal=all
	ticketReq, err := http.NewRequest(http.MethodPost, server.URL+"/api/realtime/ticket?reveal=all", nil)
	if err != nil {
		t.Fatalf("Failed to create ticket request: %v", err)
	}
	ticketReq.Header.Set("X-Admin-Key", "admin-secret-key")

	ticketResp, err := client.Do(ticketReq)
	if err != nil {
		t.Fatalf("Failed to execute ticket request: %v", err)
	}
	defer ticketResp.Body.Close()

	if ticketResp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200 for admin ticket request, got %d", ticketResp.StatusCode)
	}

	var ticketPayload struct {
		Ticket string `json:"ticket"`
	}
	if err := json.NewDecoder(ticketResp.Body).Decode(&ticketPayload); err != nil {
		t.Fatalf("Failed to decode ticket: %v", err)
	}

	// 2. Admin connects to SSE with ticket and ?reveal=all
	sseReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe?ticket="+ticketPayload.Ticket, nil)
	if err != nil {
		t.Fatalf("Failed to create SSE request: %v", err)
	}

	sseResp, err := client.Do(sseReq)
	if err != nil {
		t.Fatalf("Failed to connect SSE: %v", err)
	}
	defer sseResp.Body.Close()

	if sseResp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 for admin SSE connection, got %d", sseResp.StatusCode)
	}
}

func TestRealtime_CloakFieldMaskingEndToEnd(t *testing.T) {
	cloak.Reset()
	if err := cloak.Init("test-secret-key-for-realtime-streams-123456"); err != nil {
		t.Fatalf("cloak.Init failed: %v", err)
	}
	defer cloak.Reset()

	server, testDB, cleanup := setupRealtimeTestServerWithDB(t)
	defer cleanup()

	// Create collection "patients" with a cloak field
	patientsMoul := &schema.Moul{
		ID:   "moul_patients_sse",
		Name: "patients",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "fullName", Type: "text"},
			{Name: "ssn", Type: "cloak", Searchable: true},
		},
		Rules: schema.MoulRules{
			ListRule:      "",
			ViewRule:      "",
			SubscribeRule: "",
		},
	}
	if err := db.SaveMoulMetadata(testDB, patientsMoul); err != nil {
		t.Fatalf("SaveMoulMetadata failed: %v", err)
	}
	if err := db.CreateMoulTable(testDB, patientsMoul); err != nil {
		t.Fatalf("CreateMoulTable failed: %v", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}

	// 1. Connect standard SSE subscriber (no reveal)
	standardReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/patients/subscribe", nil)
	if err != nil {
		t.Fatalf("Failed to build standard SSE req: %v", err)
	}
	standardResp, err := client.Do(standardReq)
	if err != nil {
		t.Fatalf("Failed to connect standard SSE: %v", err)
	}
	defer standardResp.Body.Close()
	standardReader := bufio.NewReader(standardResp.Body)

	// Read initial connected event for standard subscriber
	line, err := standardReader.ReadString('\n')
	if err != nil || !strings.HasPrefix(line, "event: connected") {
		t.Fatalf("Failed reading initial connected event for standard: %v, line: %s", err, line)
	}
	_, _ = standardReader.ReadString('\n')
	_, _ = standardReader.ReadString('\n')

	// 2. Connect admin SSE subscriber with ?reveal=all
	adminReq, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/patients/subscribe?reveal=all", nil)
	if err != nil {
		t.Fatalf("Failed to build admin SSE req: %v", err)
	}
	adminReq.Header.Set("X-Admin-Key", "admin-secret-key")
	adminResp, err := client.Do(adminReq)
	if err != nil {
		t.Fatalf("Failed to connect admin SSE: %v", err)
	}
	defer adminResp.Body.Close()
	adminReader := bufio.NewReader(adminResp.Body)

	// Read initial connected event for admin subscriber
	line, err = adminReader.ReadString('\n')
	if err != nil || !strings.HasPrefix(line, "event: connected") {
		t.Fatalf("Failed reading initial connected event for admin: %v, line: %s", err, line)
	}
	_, _ = adminReader.ReadString('\n')
	_, _ = adminReader.ReadString('\n')

	// 3. Admin creates a record with cloak SSN
	createPayload := map[string]interface{}{
		"fullName": "Alice Smith",
		"ssn":      "987-65-4321",
	}
	payloadBytes, _ := json.Marshal(createPayload)
	createReq, err := http.NewRequest(http.MethodPost, server.URL+"/api/moul/patients/records", bytes.NewReader(payloadBytes))
	if err != nil {
		t.Fatalf("Failed to create record req: %v", err)
	}
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("X-Admin-Key", "admin-secret-key")

	createResp, err := client.Do(createReq)
	if err != nil {
		t.Fatalf("Failed to execute create record: %v", err)
	}
	defer createResp.Body.Close()
	if createResp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected status 201 Created, got %d", createResp.StatusCode)
	}

	// 4. Verify standard subscriber receives MASKED payload and NO companion hash
	var standardEventLine, standardDataLine string
	standardEventLine, err = standardReader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read standard event line: %v", err)
	}
	if !strings.HasPrefix(standardEventLine, "event: create") {
		t.Errorf("Expected event: create, got %q", standardEventLine)
	}
	standardDataLine, err = standardReader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read standard data line: %v", err)
	}
	_, _ = standardReader.ReadString('\n')

	standardJSON := strings.TrimPrefix(standardDataLine, "data: ")
	var standardEvt struct {
		Action string                 `json:"action"`
		Record map[string]interface{} `json:"record"`
	}
	if err := json.Unmarshal([]byte(standardJSON), &standardEvt); err != nil {
		t.Fatalf("Failed to unmarshal standard SSE event: %v", err)
	}
	if standardEvt.Record["ssn"] != "••••4321" {
		t.Errorf("Standard subscriber expected masked ssn '••••4321', got %v", standardEvt.Record["ssn"])
	}
	if _, exists := standardEvt.Record["ssnHash"]; exists {
		t.Errorf("Security breach: companion ssnHash column leaked over SSE: %v", standardEvt.Record["ssnHash"])
	}

	// 5. Verify admin subscriber with ?reveal=all receives UNMASKED plaintext and NO companion hash
	var adminEventLine, adminDataLine string
	adminEventLine, err = adminReader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read admin event line: %v", err)
	}
	if !strings.HasPrefix(adminEventLine, "event: create") {
		t.Errorf("Expected admin event: create, got %q", adminEventLine)
	}
	adminDataLine, err = adminReader.ReadString('\n')
	if err != nil {
		t.Fatalf("Failed to read admin data line: %v", err)
	}
	_, _ = adminReader.ReadString('\n')

	adminJSON := strings.TrimPrefix(adminDataLine, "data: ")
	var adminEvt struct {
		Action string                 `json:"action"`
		Record map[string]interface{} `json:"record"`
	}
	if err := json.Unmarshal([]byte(adminJSON), &adminEvt); err != nil {
		t.Fatalf("Failed to unmarshal admin SSE event: %v", err)
	}
	if adminEvt.Record["ssn"] != "987-65-4321" {
		t.Errorf("Admin subscriber expected unmasked ssn '987-65-4321', got %v", adminEvt.Record["ssn"])
	}
	if _, exists := adminEvt.Record["ssnHash"]; exists {
		t.Errorf("Companion ssnHash should still be stripped for admin subscriber: %v", adminEvt.Record["ssnHash"])
	}
}

func TestRealtimeSSE_SlowConsumerEviction(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	req, err := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to connect to SSE endpoint: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", resp.StatusCode)
	}

	reader := bufio.NewReader(resp.Body)

	// Read initial connected handshake
	eventLine, err := reader.ReadString('\n')
	if err != nil || !strings.HasPrefix(eventLine, "event: connected") {
		t.Fatalf("Expected event: connected, got %q (err: %v)", eventLine, err)
	}
	_, _ = reader.ReadString('\n') // data
	_, _ = reader.ReadString('\n') // newline

	// Flood the hub with large events to fill both OS socket buffer and the 128-event client channel
	largePayload := strings.Repeat("A", 1024)
	for i := 0; i < 500; i++ {
		realtime.DefaultHub.Publish(realtime.Event{
			Action: "create",
			Moul:   "sse_posts",
			Record: map[string]interface{}{"id": fmt.Sprintf("flood_%d", i), "title": "Flood Post", "data": largePayload},
		}, nil)
	}

	// Read until we encounter the slow_consumer event
	foundSlowConsumer := false
	for {
		line, readErr := reader.ReadString('\n')
		if readErr != nil {
			break
		}
		if strings.HasPrefix(line, "event: slow_consumer") {
			foundSlowConsumer = true
			dataLine, _ := reader.ReadString('\n')
			if !strings.Contains(dataLine, "slow_consumer") {
				t.Errorf("Expected slow_consumer data line, got %q", dataLine)
			}
			break
		}
	}

	if !foundSlowConsumer {
		t.Fatal("Expected to receive event: slow_consumer before stream termination")
	}
}

func TestRealtimeSSE_ConcurrentConnectionLimit(t *testing.T) {
	server, _, cleanup := setupRealtimeTestServer(t)
	defer cleanup()

	middleware.ResetActiveConnections()

	// Update DB settings to configure a rule for sse_posts:subscribe with maxConcurrent: 2
	rulesJSON := `[{"label":"sse_posts:subscribe","maxRequests":100,"interval":60,"targetedUsers":"all","maxConcurrent":2}]`
	httpClient := &http.Client{Timeout: 5 * time.Second}

	// Enable rate limiting with our rule via settings API
	updateSettingsReq, err := http.NewRequest(http.MethodPatch, server.URL+"/api/settings", strings.NewReader(fmt.Sprintf(`{"rate_limiting_enabled":"true","rate_limiting_rules":%q}`, rulesJSON)))
	if err != nil {
		t.Fatalf("Failed to create settings request: %v", err)
	}
	updateSettingsReq.Header.Set("Content-Type", "application/json")
	updateSettingsReq.Header.Set("X-Admin-Key", "admin-secret-key")
	settingsResp, err := httpClient.Do(updateSettingsReq)
	if err != nil || settingsResp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to update settings: %v, status: %d", err, settingsResp.StatusCode)
	}
	settingsResp.Body.Close()

	// Establish connection 1
	req1, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	resp1, err := httpClient.Do(req1)
	if err != nil || resp1.StatusCode != http.StatusOK {
		t.Fatalf("Connection 1 failed: %v, status: %d", err, resp1.StatusCode)
	}
	defer resp1.Body.Close()

	// Establish connection 2
	req2, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	resp2, err := httpClient.Do(req2)
	if err != nil || resp2.StatusCode != http.StatusOK {
		t.Fatalf("Connection 2 failed: %v, status: %d", err, resp2.StatusCode)
	}
	defer resp2.Body.Close()

	// Attempt connection 3 (must be rejected with HTTP 429)
	req3, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	resp3, err := httpClient.Do(req3)
	if err != nil {
		t.Fatalf("Connection 3 request failed: %v", err)
	}
	defer resp3.Body.Close()

	if resp3.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("Expected HTTP 429 Too Many Requests for connection 3, got status %d", resp3.StatusCode)
	}

	// Close connection 1, freeing up a slot
	resp1.Body.Close()
	// Allow small window for defer release to execute
	time.Sleep(50 * time.Millisecond)

	// Attempt connection 4 (must now succeed with HTTP 200)
	req4, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/sse_posts/subscribe", nil)
	resp4, err := httpClient.Do(req4)
	if err != nil || resp4.StatusCode != http.StatusOK {
		t.Fatalf("Connection 4 should succeed after slot release: %v, status: %d", err, resp4.StatusCode)
	}
	defer resp4.Body.Close()
}
