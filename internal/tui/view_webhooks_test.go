package tui_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/tui"

	"github.com/labstack/echo/v5"
)

func TestTUIWebhooksClientAndModel(t *testing.T) {
	// 1. Setup in-memory DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// 2. Setup collection
	testMoul := &schema.Moul{
		Name: "projects",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	}
	if err := db.CreateMoulTable(dbConn, testMoul); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, testMoul); err != nil {
		t.Fatalf("Failed to save metadata: %v", err)
	}

	// 3. Router & Server
	e := echo.New()
	webhookHandler := handlers.NewWebhookHandler(dbConn)
	moulHandler := handlers.NewMoulHandler(dbConn)

	e.GET("/api/moul", moulHandler.ListMoul)
	e.GET("/api/moul/:name/webhooks", webhookHandler.ListWebhooks)
	e.POST("/api/moul/:name/webhooks", webhookHandler.CreateWebhook)
	e.GET("/api/moul/:name/webhooks/:id", webhookHandler.GetWebhook)
	e.PATCH("/api/moul/:name/webhooks/:id", webhookHandler.UpdateWebhook)
	e.DELETE("/api/moul/:name/webhooks/:id", webhookHandler.DeleteWebhook)
	e.POST("/api/moul/:name/webhooks/:id/test", webhookHandler.TestWebhook)

	server := httptest.NewServer(e)
	defer server.Close()

	// 4. Test TUI Client Methods
	client := tui.NewClient(server.URL, "admin")

	// List Webhooks (Empty initially)
	hooks, err := client.ListWebhooks("projects")
	if err != nil {
		t.Fatalf("ListWebhooks failed: %v", err)
	}
	if len(hooks) != 0 {
		t.Errorf("Expected 0 webhooks, got %d", len(hooks))
	}

	// Create Webhook
	created, err := client.CreateWebhook("projects", schema.Webhook{
		URL:     "https://webhook.site/test",
		Events:  []string{"create:before"},
		Enabled: true,
	})
	if err != nil || created.ID == "" {
		t.Fatalf("CreateWebhook failed: err=%v, created=%+v", err, created)
	}

	// Update Webhook
	updated, err := client.UpdateWebhook("projects", created.ID, map[string]interface{}{
		"enabled": false,
	})
	if err != nil || updated.Enabled != false {
		t.Fatalf("UpdateWebhook failed: err=%v, updated=%+v", err, updated)
	}

	// List Webhooks (Now 1)
	hooks, err = client.ListWebhooks("projects")
	if err != nil || len(hooks) != 1 {
		t.Fatalf("Expected 1 webhook, got len=%d, err=%v", len(hooks), err)
	}

	// Delete Webhook
	err = client.DeleteWebhook("projects", created.ID)
	if err != nil {
		t.Fatalf("DeleteWebhook failed: %v", err)
	}

	// List Webhooks (Empty again)
	hooks, err = client.ListWebhooks("projects")
	if err != nil || len(hooks) != 0 {
		t.Fatalf("Expected 0 webhooks after delete, got len=%d", len(hooks))
	}
}

func TestTUIWebhookTestPing(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Mock external receiver
	receiver := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`pong`))
	}))
	defer receiver.Close()

	testMoul := &schema.Moul{
		Name: "tasks",
		Type: "base",
		Webhooks: []schema.Webhook{
			{
				ID:      "wh-test-ping",
				URL:     receiver.URL,
				Events:  []string{"*"},
				Enabled: true,
			},
		},
	}
	if err := db.CreateMoulTable(dbConn, testMoul); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, testMoul); err != nil {
		t.Fatalf("Failed to save metadata: %v", err)
	}

	e := echo.New()
	webhookHandler := handlers.NewWebhookHandler(dbConn)
	e.POST("/api/moul/:name/webhooks/:id/test", webhookHandler.TestWebhook)

	server := httptest.NewServer(e)
	defer server.Close()

	client := tui.NewClient(server.URL, "admin")
	res, err := client.TestWebhook("tasks", "wh-test-ping")
	if err != nil {
		t.Fatalf("TestWebhook client call failed: %v", err)
	}

	success, _ := res["success"].(bool)
	if !success {
		bytes, _ := json.Marshal(res)
		t.Fatalf("Expected test webhook success, got: %s", string(bytes))
	}
}
