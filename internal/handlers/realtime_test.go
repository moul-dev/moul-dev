package handlers

import (
	"bufio"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestRealtimeSubscribeCollectionSSE(t *testing.T) {
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory test DB: %v", err)
	}
	defer testDB.Close()

	analyticsEngine, _ := analytics.NewEngine(testDB, "")

	// Create test moul schema
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
		t.Fatalf("Failed to save moul metadata: %v", err)
	}
	if err := db.CreateMoulTable(testDB, testMoul); err != nil {
		t.Fatalf("Failed to create moul table: %v", err)
	}

	router := NewRouter(testDB, nil, analyticsEngine, nil, nil, nil, "admin-secret-key", true)
	server := httptest.NewServer(router)
	defer server.Close()

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
	_, _ = reader.ReadString('\n')

	// Publish test event asynchronously
	go func() {
		time.Sleep(50 * time.Millisecond)
		realtime.DefaultHub.Publish(realtime.Event{
			Action: "create",
			Moul:   "sse_posts",
			Record: map[string]interface{}{"id": "rec_sse_1", "title": "Realtime SSE Post"},
		}, testDB)
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
