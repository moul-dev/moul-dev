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
)

func TestFeatureFlagsAPI(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_api.db")

	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	analyticsEngine, _ := analytics.NewEngine(dbConn, "")

	adminKey := "test-secret-key"
	router := handlers.NewRouter(dbConn, nil, analyticsEngine, nil, nil, nil, adminKey, true)
	server := httptest.NewServer(router)
	defer server.Close()

	client := server.Client()

	// 1. List Flags (Should be empty initially)
	req, _ := http.NewRequest(http.MethodGet, server.URL+"/api/feature-flags", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("List flags failed: status=%d, err=%v", resp.StatusCode, err)
	}

	// 2. Create a Feature Flag
	createBody := []byte(`{
		"key": "new-billing-flow",
		"description": "Enable new stripe checkout flow",
		"enabled": true,
		"default_value": "false",
		"gates": {
			"actors": { "user:101": true },
			"groups": { "beta_testers": true }
		}
	}`)
	req, _ = http.NewRequest(http.MethodPost, server.URL+"/api/feature-flags", bytes.NewBuffer(createBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Create flag failed: status=%d, err=%v", resp.StatusCode, err)
	}

	// 3. Get Flag details
	req, _ = http.NewRequest(http.MethodGet, server.URL+"/api/feature-flags/new-billing-flow", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Get flag failed: status=%d, err=%v", resp.StatusCode, err)
	}

	// 4. Evaluate Flag for actor user:101
	evalBody := []byte(`{
		"context": {
			"user_id": "101"
		}
	}`)
	req, _ = http.NewRequest(http.MethodPost, server.URL+"/api/feature-flags/new-billing-flow/eval", bytes.NewBuffer(evalBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Evaluate flag failed: status=%d, err=%v", resp.StatusCode, err)
	}

	var evalRes struct {
		Value  bool   `json:"value"`
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&evalRes)
	if !evalRes.Value || evalRes.Reason != "TARGETING_MATCH (Actor)" {
		t.Errorf("Expected evaluation value=true, reason=TARGETING_MATCH (Actor), got value=%v, reason=%s", evalRes.Value, evalRes.Reason)
	}

	// 5. Update Flag state to disabled
	patchBody := []byte(`{ "enabled": false }`)
	req, _ = http.NewRequest(http.MethodPatch, server.URL+"/api/feature-flags/new-billing-flow", bytes.NewBuffer(patchBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Update flag failed: status=%d, err=%v", resp.StatusCode, err)
	}

	// 6. Delete Flag
	req, _ = http.NewRequest(http.MethodDelete, server.URL+"/api/feature-flags/new-billing-flow", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Delete flag failed: status=%d, err=%v", resp.StatusCode, err)
	}
}
