package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/schema"

	"github.com/labstack/echo/v5"
)

func TestWebhooksCRUD(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Create test collection
	testMoul := &schema.Moul{
		Name: "articles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
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

	e.GET("/api/moul/:name/webhooks", webhookHandler.ListWebhooks)
	e.POST("/api/moul/:name/webhooks", webhookHandler.CreateWebhook)
	e.GET("/api/moul/:name/webhooks/:id", webhookHandler.GetWebhook)
	e.PATCH("/api/moul/:name/webhooks/:id", webhookHandler.UpdateWebhook)
	e.DELETE("/api/moul/:name/webhooks/:id", webhookHandler.DeleteWebhook)
	e.POST("/api/moul/:name/webhooks/:id/test", webhookHandler.TestWebhook)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// 1. List Webhooks (empty initially)
	resp, err := client.Get(server.URL + "/api/moul/articles/webhooks")
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to list webhooks: status=%d, err=%v", resp.StatusCode, err)
	}

	// 2. Create Webhook
	createPayload := schema.Webhook{
		URL:     "https://example.com/webhook",
		Events:  []string{"create:before", "update:after"},
		Secret:  "supersecret",
		Enabled: true,
	}
	bodyBytes, _ := json.Marshal(createPayload)
	resp, err = client.Post(server.URL+"/api/moul/articles/webhooks", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create webhook: status=%d, err=%v", resp.StatusCode, err)
	}

	var createdHook schema.Webhook
	_ = json.NewDecoder(resp.Body).Decode(&createdHook)
	if createdHook.ID == "" || createdHook.URL != "https://example.com/webhook" {
		t.Fatalf("Unexpected created webhook payload: %+v", createdHook)
	}

	// 3. Get Webhook by ID
	resp, err = client.Get(server.URL + "/api/moul/articles/webhooks/" + createdHook.ID)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to get webhook by ID: status=%d, err=%v", resp.StatusCode, err)
	}

	// 4. Update Webhook
	updatePayload := map[string]interface{}{
		"url":     "https://example.com/webhook-updated",
		"enabled": false,
	}
	upBytes, _ := json.Marshal(updatePayload)
	req, _ := http.NewRequest(http.MethodPatch, server.URL+"/api/moul/articles/webhooks/"+createdHook.ID, bytes.NewReader(upBytes))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to update webhook: status=%d, err=%v", resp.StatusCode, err)
	}

	var updatedHook schema.Webhook
	_ = json.NewDecoder(resp.Body).Decode(&updatedHook)
	if updatedHook.URL != "https://example.com/webhook-updated" || updatedHook.Enabled != false {
		t.Fatalf("Unexpected updated webhook state: %+v", updatedHook)
	}

	// 5. Delete Webhook
	req, _ = http.NewRequest(http.MethodDelete, server.URL+"/api/moul/articles/webhooks/"+createdHook.ID, nil)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusNoContent {
		t.Fatalf("Failed to delete webhook: status=%d, err=%v", resp.StatusCode, err)
	}

	// 6. Verify Deleted
	resp, err = client.Get(server.URL + "/api/moul/articles/webhooks/" + createdHook.ID)
	if err != nil || resp.StatusCode != http.StatusNotFound {
		t.Fatalf("Expected 404 for deleted webhook, got status=%d, err=%v", resp.StatusCode, err)
	}
}

func TestRecordWebhooksBeforeAndAfter(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Setup mock webhook receiver server
	var mu sync.Mutex
	var receivedEvents []string
	receiver := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		event := r.Header.Get("X-Moul-Event")
		mu.Lock()
		receivedEvents = append(receivedEvents, event)
		mu.Unlock()

		if event == "create:before" && r.Header.Get("X-Test-Reject") == "true" {
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(`{"error":"Rejected by test before-hook"}`))
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	}))
	defer receiver.Close()

	// Create collection with before and after webhooks
	testMoul := &schema.Moul{
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
		Webhooks: []schema.Webhook{
			{
				ID:      "wh-before",
				URL:     receiver.URL,
				Events:  []string{"create:before", "update:before", "delete:before"},
				Enabled: true,
			},
			{
				ID:      "wh-after",
				URL:     receiver.URL,
				Events:  []string{"create:after", "update:after", "delete:after"},
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
	recordHandler := handlers.NewRecordHandler(dbConn)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/moul/:name/records/:id", recordHandler.DeleteRecord)

	appServer := httptest.NewServer(e)
	defer appServer.Close()
	client := appServer.Client()

	// 1. Create Record (succeeds)
	createBody, _ := json.Marshal(map[string]interface{}{"name": "Widget A"})
	resp, err := client.Post(appServer.URL+"/api/moul/products/records", "application/json", bytes.NewReader(createBody))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("CreateRecord failed: status=%d, err=%v", resp.StatusCode, err)
	}

	var createdRec map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&createdRec)
	recID, _ := createdRec["id"].(string)

	// Wait briefly for background after-hook
	time.Sleep(100 * time.Millisecond)

	// Verify events received
	mu.Lock()
	eventsCopy := append([]string{}, receivedEvents...)
	mu.Unlock()

	hasCreateBefore := false
	hasCreateAfter := false
	for _, ev := range eventsCopy {
		if ev == "create:before" {
			hasCreateBefore = true
		}
		if ev == "create:after" {
			hasCreateAfter = true
		}
	}
	if !hasCreateBefore || !hasCreateAfter {
		t.Fatalf("Expected create:before and create:after events, got: %v", eventsCopy)
	}

	// 2. Update Record
	updateBody, _ := json.Marshal(map[string]interface{}{"name": "Widget A Updated"})
	req, _ := http.NewRequest(http.MethodPatch, appServer.URL+"/api/moul/products/records/"+recID, bytes.NewReader(updateBody))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("UpdateRecord failed: status=%d, err=%v", resp.StatusCode, err)
	}

	time.Sleep(100 * time.Millisecond)

	// 3. Delete Record
	req, _ = http.NewRequest(http.MethodDelete, appServer.URL+"/api/moul/products/records/"+recID, nil)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusNoContent {
		t.Fatalf("DeleteRecord failed: status=%d, err=%v", resp.StatusCode, err)
	}

	time.Sleep(100 * time.Millisecond)

	mu.Lock()
	finalEvents := append([]string{}, receivedEvents...)
	mu.Unlock()

	hasUpdateBefore, hasUpdateAfter := false, false
	hasDeleteBefore, hasDeleteAfter := false, false
	for _, ev := range finalEvents {
		if ev == "update:before" {
			hasUpdateBefore = true
		}
		if ev == "update:after" {
			hasUpdateAfter = true
		}
		if ev == "delete:before" {
			hasDeleteBefore = true
		}
		if ev == "delete:after" {
			hasDeleteAfter = true
		}
	}

	if !hasUpdateBefore || !hasUpdateAfter || !hasDeleteBefore || !hasDeleteAfter {
		t.Fatalf("Expected update and delete hooks, got events: %v", finalEvents)
	}
}

func TestBeforeWebhookRejectionBlocksOperation(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// Webhook server that rejects requests
	rejector := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnprocessableEntity)
		_, _ = w.Write([]byte(`{"error":"Rejected by business rule"}`))
	}))
	defer rejector.Close()

	testMoul := &schema.Moul{
		Name: "orders",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "item", Type: "text"},
		},
		Webhooks: []schema.Webhook{
			{
				ID:      "wh-strict-before",
				URL:     rejector.URL,
				Events:  []string{"create:before"},
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
	recordHandler := handlers.NewRecordHandler(dbConn)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)

	appServer := httptest.NewServer(e)
	defer appServer.Close()

	createBody, _ := json.Marshal(map[string]interface{}{"item": "Laptop"})
	resp, err := appServer.Client().Post(appServer.URL+"/api/moul/orders/records", "application/json", bytes.NewReader(createBody))
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	if resp.StatusCode == http.StatusCreated {
		t.Fatal("Expected operation to be blocked by before-hook rejection, but record was created!")
	}

	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte("Rejected by business rule")) {
		t.Errorf("Expected rejection error message in body, got: %s", string(body))
	}
}
