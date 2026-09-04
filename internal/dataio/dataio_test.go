package dataio_test

import (
	"bytes"
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/dataio"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/testutil"
	"github.com/pocketbase/dbx"
)

func setupTestCollection(t *testing.T) (*dbx.DB, *schema.Moul) {
	t.Helper()
	dbConn := testutil.NewTestDB(t)

	moul := &schema.Moul{
		ID:   "col_articles",
		Name: "articles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text", Required: true},
			{Name: "views", Type: "number"},
			{Name: "is_published", Type: "bool"},
			{Name: "metadata", Type: "json"},
			{Name: "category", Type: "select", Options: []string{"tech", "news", "design"}},
		},
		Rules: schema.MoulRules{},
	}

	if err := db.CreateMoulTable(dbConn, moul); err != nil {
		t.Fatalf("failed to create moul table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, moul); err != nil {
		t.Fatalf("failed to save moul metadata: %v", err)
	}

	return dbConn, moul
}

func setupTestAuthCollection(t *testing.T) (*dbx.DB, *schema.Moul) {
	t.Helper()
	dbConn := testutil.NewTestDB(t)

	moul := &schema.Moul{
		ID:   "col_members",
		Name: "members",
		Type: "auth",
		Fields: []schema.MoulField{
			{Name: "role", Type: "text"},
		},
		Rules: schema.MoulRules{},
	}

	if err := db.CreateMoulTable(dbConn, moul); err != nil {
		t.Fatalf("failed to create auth table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, moul); err != nil {
		t.Fatalf("failed to save auth metadata: %v", err)
	}

	return dbConn, moul
}

func TestExportAndImportJSON(t *testing.T) {
	dbConn, moul := setupTestCollection(t)

	// 1. Insert sample records
	jsonPayload := `[
		{
			"id": "rec_001",
			"title": "Getting Started with Moul",
			"views": 1500,
			"is_published": true,
			"metadata": {"tags": ["go", "sqlite"]},
			"category": "tech"
		},
		{
			"id": "rec_002",
			"title": "Design Systems with StyleX",
			"views": 420,
			"is_published": false,
			"category": "design"
		}
	]`

	res, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{
		Format: "json",
		Mode:   "insert",
	}, strings.NewReader(jsonPayload))
	if err != nil {
		t.Fatalf("ImportCollection failed: %v", err)
	}
	if res.Inserted != 2 {
		t.Errorf("expected 2 inserted records, got %d", res.Inserted)
	}

	// 2. Export records as JSON
	var buf bytes.Buffer
	err = dataio.ExportCollection(dbConn, moul, dataio.ExportOptions{
		Format:        "json",
		IncludeSchema: true,
	}, &buf)
	if err != nil {
		t.Fatalf("ExportCollection failed: %v", err)
	}

	exportedStr := buf.String()
	if !strings.Contains(exportedStr, "Getting Started with Moul") {
		t.Errorf("exported JSON missing expected record title: %s", exportedStr)
	}
	if !strings.Contains(exportedStr, `"schema"`) {
		t.Errorf("expected schema envelope in exported JSON: %s", exportedStr)
	}

	// 3. Re-import the exported envelope with upsert
	res2, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{
		Format: "json",
		Mode:   "upsert",
	}, strings.NewReader(exportedStr))
	if err != nil {
		t.Fatalf("Re-import failed: %v", err)
	}
	if res2.Updated != 2 {
		t.Errorf("expected 2 updated records in upsert, got %d", res2.Updated)
	}
}

func TestExportAndImportCSV(t *testing.T) {
	dbConn, moul := setupTestCollection(t)

	// 1. Import from CSV
	csvData := `id,title,views,is_published,category,metadata
rec_csv_1,"First CSV Post",350,true,news,"{""featured"":true}"
rec_csv_2,"Second CSV Post",120,false,tech,""
`
	res, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{
		Format: "csv",
		Mode:   "insert",
	}, strings.NewReader(csvData))
	if err != nil {
		t.Fatalf("ImportCollection CSV failed: %v", err)
	}
	if res.Inserted != 2 {
		t.Errorf("expected 2 inserted records, got %d", res.Inserted)
	}

	// 2. Export as CSV
	var buf bytes.Buffer
	err = dataio.ExportCollection(dbConn, moul, dataio.ExportOptions{
		Format: "csv",
	}, &buf)
	if err != nil {
		t.Fatalf("ExportCollection CSV failed: %v", err)
	}

	exportedCSV := buf.String()
	if !strings.Contains(exportedCSV, "First CSV Post") || !strings.Contains(exportedCSV, "Second CSV Post") {
		t.Errorf("exported CSV missing record content: %s", exportedCSV)
	}
	if !strings.Contains(exportedCSV, "id,") || !strings.Contains(exportedCSV, "title") {
		t.Errorf("exported CSV missing expected headers: %s", exportedCSV)
	}
}

func TestImportModes(t *testing.T) {
	dbConn, moul := setupTestCollection(t)

	initData := `[{"id": "r1", "title": "Initial 1"}, {"id": "r2", "title": "Initial 2"}]`
	_, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(initData))
	if err != nil {
		t.Fatalf("initial import failed: %v", err)
	}

	// Test 1: Duplicate insert fails with mode=insert in atomic mode
	dupData := `[{"id": "r1", "title": "Duplicate 1"}]`
	res, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert", OnError: "atomic"}, strings.NewReader(dupData))
	if err == nil {
		t.Fatalf("expected error on duplicate insert with mode=insert, got nil")
	}
	if res.Success {
		t.Errorf("expected res.Success to be false")
	}

	// Test 2: Upsert updates existing record
	upsertData := `[{"id": "r1", "title": "Updated 1"}, {"id": "r3", "title": "New 3"}]`
	resUpsert, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "upsert"}, strings.NewReader(upsertData))
	if err != nil {
		t.Fatalf("upsert failed: %v", err)
	}
	if resUpsert.Updated != 1 || resUpsert.Inserted != 1 {
		t.Errorf("expected 1 updated and 1 inserted, got updated=%d, inserted=%d", resUpsert.Updated, resUpsert.Inserted)
	}

	// Test 3: Replace truncates and re-populates
	replaceData := `[{"id": "fresh_1", "title": "Only One"}]`
	resReplace, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "replace"}, strings.NewReader(replaceData))
	if err != nil {
		t.Fatalf("replace failed: %v", err)
	}
	if resReplace.Inserted != 1 {
		t.Errorf("expected 1 inserted record in replace mode, got %d", resReplace.Inserted)
	}

	var count int
	_ = dbConn.Select("COUNT(1)").From("articles").Row(&count)
	if count != 1 {
		t.Errorf("expected table to have exactly 1 record after replace, got %d", count)
	}
}

func TestImportErrorStrategies(t *testing.T) {
	dbConn, moul := setupTestCollection(t)

	// Row 1 is valid, Row 2 is missing required "title", Row 3 is valid
	mixedData := `[
		{"id": "v1", "title": "Valid One"},
		{"id": "inv", "title": ""},
		{"id": "v2", "title": "Valid Two"}
	]`

	// 1. Atomic mode: should rollback completely
	resAtomic, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{
		Mode:    "insert",
		OnError: "atomic",
	}, strings.NewReader(mixedData))
	if err == nil {
		t.Fatalf("expected atomic import to fail due to row 2, got nil")
	}
	if resAtomic.Success {
		t.Errorf("expected resAtomic.Success to be false")
	}

	var countAfterAtomic int
	_ = dbConn.Select("COUNT(1)").From("articles").Row(&countAfterAtomic)
	if countAfterAtomic != 0 {
		t.Errorf("expected 0 records after atomic rollback, got %d", countAfterAtomic)
	}

	// 2. Continue mode: should import v1 and v2, recording error for inv
	resContinue, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{
		Mode:    "insert",
		OnError: "continue",
	}, strings.NewReader(mixedData))
	if err != nil {
		t.Fatalf("expected continue mode to not return fatal error, got: %v", err)
	}
	if resContinue.Inserted != 2 {
		t.Errorf("expected 2 inserted records in continue mode, got %d", resContinue.Inserted)
	}
	if len(resContinue.Errors) != 1 {
		t.Errorf("expected 1 row error in continue mode, got %d", len(resContinue.Errors))
	}
	if resContinue.Errors[0].Row != 2 {
		t.Errorf("expected error on row 2, got row %d", resContinue.Errors[0].Row)
	}
}

func TestAuthCollectionExportImport(t *testing.T) {
	dbConn, moul := setupTestAuthCollection(t)

	authData := `[
		{
			"id": "usr_1",
			"username": "admin",
			"email": "admin@example.com",
			"password_hash": "$2a$10$hashedstringvalue",
			"role": "superadmin",
			"verified": true
		}
	]`

	res, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{
		Mode: "insert",
	}, strings.NewReader(authData))
	if err != nil {
		t.Fatalf("auth import failed: %v", err)
	}
	if res.Inserted != 1 {
		t.Errorf("expected 1 inserted auth record, got %d", res.Inserted)
	}

	var buf bytes.Buffer
	err = dataio.ExportCollection(dbConn, moul, dataio.ExportOptions{Format: "json"}, &buf)
	if err != nil {
		t.Fatalf("auth export failed: %v", err)
	}

	out := buf.String()
	if !strings.Contains(out, "$2a$10$hashedstringvalue") {
		t.Errorf("expected password_hash to be preserved in export: %s", out)
	}
	if !strings.Contains(out, "admin@example.com") {
		t.Errorf("expected email to be present: %s", out)
	}
}

func TestFieldTypeValidations(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	minVal := 10.0
	maxVal := 100.0

	moul := &schema.Moul{
		ID:   "col_complex",
		Name: "complex_records",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "email", Type: "email"},
			{Name: "website", Type: "url"},
			{Name: "rating", Type: "number", Min: &minVal, Max: &maxVal},
			{Name: "start_date", Type: "date"},
			{Name: "event_time", Type: "datetime"},
			{Name: "avatar", Type: "file"},
			{Name: "status", Type: "select", Options: []string{"active", "pending", "archived"}},
			{Name: "author_rel", Type: "relation"},
		},
	}

	if err := db.CreateMoulTable(dbConn, moul); err != nil {
		t.Fatalf("failed to create complex table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, moul); err != nil {
		t.Fatalf("failed to save complex metadata: %v", err)
	}

	// 1. Valid record
	validData := `[
		{
			"id": "c1",
			"email": "test@example.com",
			"website": "https://example.com",
			"rating": 50,
			"start_date": "2026-09-04",
			"event_time": "2026-09-04T12:00:00Z",
			"avatar": "photo.png",
			"status": "active",
			"author_rel": "usr_001"
		}
	]`
	res, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(validData))
	if err != nil {
		t.Fatalf("valid import failed: %v", err)
	}
	if res.Inserted != 1 {
		t.Errorf("expected 1 inserted record, got %d", res.Inserted)
	}

	// 2. Invalid date format
	invalidDate := `[{"id": "c2", "start_date": "not-a-date"}]`
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(invalidDate))
	if err == nil {
		t.Errorf("expected error on invalid date, got nil")
	}

	// 3. Invalid datetime format
	invalidDateTime := `[{"id": "c3", "event_time": "yesterday"}]`
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(invalidDateTime))
	if err == nil {
		t.Errorf("expected error on invalid datetime, got nil")
	}

	// 4. Number below min
	belowMin := `[{"id": "c4", "rating": 5}]`
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(belowMin))
	if err == nil {
		t.Errorf("expected error for rating below min, got nil")
	}

	// 5. Number above max
	aboveMax := `[{"id": "c5", "rating": 150}]`
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(aboveMax))
	if err == nil {
		t.Errorf("expected error for rating above max, got nil")
	}

	// 6. Invalid select option
	invalidSelect := `[{"id": "c6", "status": "unknown_status"}]`
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(invalidSelect))
	if err == nil {
		t.Errorf("expected error on invalid select option, got nil")
	}
}

func TestInvalidPayloadsAndEdgeCases(t *testing.T) {
	dbConn, moul := setupTestCollection(t)

	// 1. Empty input succeeds with 0 records
	res, err := dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Format: "json"}, strings.NewReader(""))
	if err != nil {
		t.Errorf("expected empty input to succeed as no-op, got error: %v", err)
	}
	if res.Total != 0 {
		t.Errorf("expected total=0 for empty input, got %d", res.Total)
	}

	// 1b. ParseJSON directly returns error on empty input
	_, _, err = dataio.ParseJSON(strings.NewReader(""))
	if err == nil {
		t.Errorf("expected ParseJSON to return error on empty input, got nil")
	}

	// 2. Malformed JSON
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Format: "json"}, strings.NewReader("{invalid json"))
	if err == nil {
		t.Errorf("expected error on malformed json, got nil")
	}

	// 3. JSON not array or envelope
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Format: "json"}, strings.NewReader(`"a string"`))
	if err == nil {
		t.Errorf("expected error on non-array json, got nil")
	}

	// 4. Unsupported format
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Format: "xml"}, strings.NewReader("<data></data>"))
	if err == nil {
		t.Errorf("expected error on unsupported format, got nil")
	}

	// 5. Unsupported export format
	var buf bytes.Buffer
	err = dataio.ExportCollection(dbConn, moul, dataio.ExportOptions{Format: "xml"}, &buf)
	if err == nil {
		t.Errorf("expected error on unsupported export format, got nil")
	}

	// 6. Malformed CSV
	malformedCSV := "id,title\n1,\"unclosed quote"
	_, err = dataio.ImportCollection(dbConn, moul, dataio.ImportOptions{Format: "csv"}, strings.NewReader(malformedCSV))
	if err == nil {
		t.Errorf("expected error on malformed csv, got nil")
	}
}

func TestWorkerAndAnalyticCollections(t *testing.T) {
	dbConn := testutil.NewTestDB(t)

	// Worker collection
	workerMoul := &schema.Moul{
		ID:   "col_worker_jobs",
		Name: "worker_jobs",
		Type: "worker",
	}
	if err := db.CreateMoulTable(dbConn, workerMoul); err != nil {
		t.Fatalf("failed to create worker table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, workerMoul); err != nil {
		t.Fatalf("failed to save worker metadata: %v", err)
	}

	workerData := `[
		{
			"id": "job_1",
			"worker": "send_email",
			"state": "available",
			"queue": "default",
			"priority": 1,
			"payload": {"recipient": "user@example.com"}
		}
	]`
	resW, err := dataio.ImportCollection(dbConn, workerMoul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(workerData))
	if err != nil {
		t.Fatalf("worker import failed: %v", err)
	}
	if resW.Inserted != 1 {
		t.Errorf("expected 1 inserted worker job, got %d", resW.Inserted)
	}

	// Analytic collection
	analyticMoul := &schema.Moul{
		ID:   "col_pageviews",
		Name: "pageviews",
		Type: "analytic",
	}
	if err := db.CreateMoulTable(dbConn, analyticMoul); err != nil {
		t.Fatalf("failed to create analytic table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, analyticMoul); err != nil {
		t.Fatalf("failed to save analytic metadata: %v", err)
	}

	analyticData := `[
		{
			"id": "pv_1",
			"name": "page_view",
			"landing_page": "/pricing",
			"referrer": "https://google.com"
		}
	]`
	resA, err := dataio.ImportCollection(dbConn, analyticMoul, dataio.ImportOptions{Mode: "insert"}, strings.NewReader(analyticData))
	if err != nil {
		t.Fatalf("analytic import failed: %v", err)
	}
	if resA.Inserted != 1 {
		t.Errorf("expected 1 inserted analytic record, got %d", resA.Inserted)
	}
}
