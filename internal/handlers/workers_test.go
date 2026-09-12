package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

func TestWorkersAPI(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_workers_api.db")

	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	workerEngine := worker.NewEngine(dbConn)
	analyticsEngine, _ := analytics.NewEngine(dbConn, "")

	adminKey := "test-secret-key"
	router := handlers.NewRouter(dbConn, workerEngine, analyticsEngine, nil, nil, nil, adminKey, true)
	server := httptest.NewServer(router)
	defer server.Close()

	client := server.Client()

	// 1. Verify /api/moul/_workers/records is strictly blocked (404 Not Found)
	unauthReq, _ := http.NewRequest(http.MethodGet, server.URL+"/api/moul/_workers/records", nil)
	unauthResp, err := client.Do(unauthReq)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}
	if unauthResp.StatusCode != http.StatusNotFound {
		t.Fatalf("Expected /api/moul/_workers/records to return 404, got %d", unauthResp.StatusCode)
	}

	// 2. Verify unauthenticated access to /api/workers is rejected (401 Unauthorized)
	unauthWorkersReq, _ := http.NewRequest(http.MethodGet, server.URL+"/api/workers", nil)
	unauthWorkersResp, err := client.Do(unauthWorkersReq)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}
	if unauthWorkersResp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected unauthenticated /api/workers to return 401, got %d", unauthWorkersResp.StatusCode)
	}

	// 3. Authenticated ListJobs (empty queue)
	req, _ := http.NewRequest(http.MethodGet, server.URL+"/api/workers", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("List workers failed: status=%d, err=%v", resp.StatusCode, err)
	}
	var listEnvelope struct {
		Page       int                      `json:"page"`
		PerPage    int                      `json:"perPage"`
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&listEnvelope); err != nil {
		t.Fatalf("Failed to decode list workers response: %v", err)
	}
	if listEnvelope.TotalItems != 0 {
		t.Errorf("Expected 0 totalItems, got %d", listEnvelope.TotalItems)
	}

	// 4. Create / Enqueue a job via POST /api/workers
	createPayload := []byte(`{
		"worker": "process-order",
		"queue": "orders",
		"args": { "order_id": "ord_123", "amount": 99.5 },
		"priority": 10
	}`)
	req, _ = http.NewRequest(http.MethodPost, server.URL+"/api/workers", bytes.NewBuffer(createPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Create worker job failed: status=%d, err=%v", resp.StatusCode, err)
	}
	var createdJob map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&createdJob); err != nil {
		t.Fatalf("Failed to decode created job: %v", err)
	}
	jobID, _ := createdJob["id"].(string)
	if jobID == "" {
		t.Fatalf("Expected created job to have id, got %+v", createdJob)
	}

	// 5. Get Job details via GET /api/workers/:id
	req, _ = http.NewRequest(http.MethodGet, server.URL+"/api/workers/"+jobID, nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Get worker job failed: status=%d, err=%v", resp.StatusCode, err)
	}
	var fetchedJob map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&fetchedJob); err != nil {
		t.Fatalf("Failed to decode fetched job: %v", err)
	}
	if fetchedJob["worker"] != "process-order" {
		t.Errorf("Expected worker name 'process-order', got %v", fetchedJob["worker"])
	}

	// 6. Update job state to discarded via PATCH /api/workers/:id
	updatePayload := []byte(`{ "state": "discarded" }`)
	req, _ = http.NewRequest(http.MethodPatch, server.URL+"/api/workers/"+jobID, bytes.NewBuffer(updatePayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Update worker job failed: status=%d, err=%v", resp.StatusCode, err)
	}
	var updatedJob map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&updatedJob); err != nil {
		t.Fatalf("Failed to decode updated job: %v", err)
	}
	if updatedJob["state"] != "discarded" {
		t.Errorf("Expected state 'discarded', got %v", updatedJob["state"])
	}

	// 7. Retry jobs via POST /api/workers/retry
	retryPayload := []byte(`{ "ids": ["` + jobID + `"] }`)
	req, _ = http.NewRequest(http.MethodPost, server.URL+"/api/workers/retry", bytes.NewBuffer(retryPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Retry worker jobs failed: status=%d, err=%v", resp.StatusCode, err)
	}
	var retryResult struct {
		Success      bool  `json:"success"`
		RowsAffected int64 `json:"rows_affected"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&retryResult); err != nil {
		t.Fatalf("Failed to decode retry result: %v", err)
	}
	if !retryResult.Success || retryResult.RowsAffected != 1 {
		t.Errorf("Expected retry success with 1 row affected, got %+v", retryResult)
	}

	// Check job is available again
	req, _ = http.NewRequest(http.MethodGet, server.URL+"/api/workers/"+jobID, nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, _ = client.Do(req)
	var retriedJob map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&retriedJob)
	if retriedJob["state"] != "available" {
		t.Errorf("Expected state to be 'available' after retry, got %v", retriedJob["state"])
	}

	// 8. Delete job via DELETE /api/workers/:id
	req, _ = http.NewRequest(http.MethodDelete, server.URL+"/api/workers/"+jobID, nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Delete worker job failed: status=%d, err=%v", resp.StatusCode, err)
	}

	// Verify job no longer exists
	req, _ = http.NewRequest(http.MethodGet, server.URL+"/api/workers/"+jobID, nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 after delete, got %d", resp.StatusCode)
	}
}
