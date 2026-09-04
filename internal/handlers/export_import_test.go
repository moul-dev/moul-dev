package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/testutil"
)

func createTestCollection(t *testing.T, ts *testutil.TestServer, name string) {
	t.Helper()
	moul := &schema.Moul{
		ID:   "col_" + name,
		Name: name,
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text", Required: true},
			{Name: "score", Type: "number"},
			{Name: "active", Type: "bool"},
		},
		Rules: schema.MoulRules{},
	}
	if err := db.CreateMoulTable(ts.DB, moul); err != nil {
		t.Fatalf("failed to create moul table: %v", err)
	}
	if err := db.SaveMoulMetadata(ts.DB, moul); err != nil {
		t.Fatalf("failed to save moul metadata: %v", err)
	}
}

func TestExportRecordsAPI(t *testing.T) {
	ts := testutil.NewTestServer(t)
	createTestCollection(t, ts, "posts")

	// Pre-insert some records
	_, err := ts.DB.Insert("posts", map[string]interface{}{
		"id":         "p1",
		"title":      "Hello World",
		"score":      100,
		"active":     1,
		"created_at": "2026-09-04T10:00:00Z",
		"updated_at": "2026-09-04T10:00:00Z",
	}).Execute()
	if err != nil {
		t.Fatalf("failed to insert initial record: %v", err)
	}

	// 1. Unauthorized without Admin Key
	req, _ := http.NewRequest(http.MethodGet, ts.URL+"/api/moul/posts/export", nil)
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized without admin key, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 2. Export as JSON (default)
	req, _ = http.NewRequest(http.MethodGet, ts.URL+"/api/moul/posts/export", nil)
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("export request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	var records []map[string]interface{}
	if err := json.Unmarshal(body, &records); err != nil {
		t.Fatalf("failed to parse exported JSON: %v", err)
	}
	if len(records) != 1 || records[0]["title"] != "Hello World" {
		t.Errorf("unexpected exported records: %s", string(body))
	}

	// 3. Export as CSV
	req, _ = http.NewRequest(http.MethodGet, ts.URL+"/api/moul/posts/export?format=csv", nil)
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("csv export request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK for CSV export, got %d", resp.StatusCode)
	}
	csvBody, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	csvStr := string(csvBody)
	if !strings.Contains(csvStr, "Hello World") || !strings.Contains(csvStr, "title") {
		t.Errorf("expected CSV to contain record title and headers: %s", csvStr)
	}

	// 4. Non-existent collection returns 404
	req, _ = http.NewRequest(http.MethodGet, ts.URL+"/api/moul/nonexistent/export", nil)
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("export request failed: %v", err)
	}
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("expected 404 for nonexistent collection, got %d", resp.StatusCode)
	}
	resp.Body.Close()
}

func TestImportRecordsAPI(t *testing.T) {
	ts := testutil.NewTestServer(t)
	createTestCollection(t, ts, "products")

	// 1. Import via JSON request body
	jsonData := `[
		{"id": "prod_1", "title": "Keyboard", "score": 99.5, "active": true},
		{"id": "prod_2", "title": "Mouse", "score": 45.0, "active": true}
	]`
	req, _ := http.NewRequest(http.MethodPost, ts.URL+"/api/moul/products/import?mode=insert", strings.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("import request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("expected 200 OK, got %d: %s", resp.StatusCode, string(body))
	}
	var res map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&res)
	resp.Body.Close()

	if res["inserted"] != float64(2) {
		t.Errorf("expected 2 inserted items, got %v", res["inserted"])
	}

	// 2. Import via multipart form file (.csv)
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	part, err := w.CreateFormFile("file", "products.csv")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	csvContent := `id,title,score,active
prod_1,"Keyboard Updated",120.0,true
prod_3,"Monitor",300.0,false
`
	_, _ = part.Write([]byte(csvContent))
	_ = w.WriteField("mode", "upsert")
	_ = w.Close()

	req, _ = http.NewRequest(http.MethodPost, ts.URL+"/api/moul/products/import", &b)
	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("multipart import failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("expected 200 OK for multipart import, got %d: %s", resp.StatusCode, string(body))
	}
	var resMultipart map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&resMultipart)
	resp.Body.Close()

	if resMultipart["updated"] != float64(1) || resMultipart["inserted"] != float64(1) {
		t.Errorf("expected 1 updated and 1 inserted, got %v", resMultipart)
	}

	// 3. Mode replace truncates
	replacePayload := `[{"id": "prod_solo", "title": "Only One Product", "score": 10.0, "active": true}]`
	req, _ = http.NewRequest(http.MethodPost, ts.URL+"/api/moul/products/import?mode=replace", strings.NewReader(replacePayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("replace import failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK for replace, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	var totalCount int
	_ = ts.DB.Select("COUNT(1)").From("products").Row(&totalCount)
	if totalCount != 1 {
		t.Errorf("expected exactly 1 record after replace, got %d", totalCount)
	}
}

func TestExportImportErrorsAPI(t *testing.T) {
	ts := testutil.NewTestServer(t)
	createTestCollection(t, ts, "items")

	// 1. Export with unsupported format
	req, _ := http.NewRequest(http.MethodGet, ts.URL+"/api/moul/items/export?format=xml", nil)
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request for unsupported format, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 2. Import into non-existent collection
	req, _ = http.NewRequest(http.MethodPost, ts.URL+"/api/moul/nonexistent/import", strings.NewReader("[]"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("expected 404 Not Found for non-existent collection, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 3. Import with invalid mode
	req, _ = http.NewRequest(http.MethodPost, ts.URL+"/api/moul/items/import?mode=invalid_mode", strings.NewReader("[]"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request for invalid mode, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 4. Import with invalid error strategy
	req, _ = http.NewRequest(http.MethodPost, ts.URL+"/api/moul/items/import?error_strategy=invalid_strat", strings.NewReader("[]"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request for invalid error strategy, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// 5. Import with raw CSV body
	csvPayload := `id,title,score,active
item_1,"Item One",25.5,true
item_2,"Item Two",50.0,false
`
	req, _ = http.NewRequest(http.MethodPost, ts.URL+"/api/moul/items/import", strings.NewReader(csvPayload))
	req.Header.Set("Content-Type", "text/csv")
	req.Header.Set("X-Admin-Key", testutil.DefaultAdminKey)
	resp, err = ts.Client.Do(req)
	if err != nil {
		t.Fatalf("csv import request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("expected 200 OK for raw CSV import, got %d: %s", resp.StatusCode, string(body))
	}
	var res map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&res)
	resp.Body.Close()

	if res["inserted"] != float64(2) {
		t.Errorf("expected 2 inserted items from raw CSV, got %v", res["inserted"])
	}
}
