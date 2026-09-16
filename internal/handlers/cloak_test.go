package handlers_test

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/cloak"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/testutil"
	"github.com/pocketbase/dbx"
)

func TestCloak_EndToEnd(t *testing.T) {
	cloak.Reset()
	testDB := testutil.NewTestDB(t)
	defer testDB.Close()

	moulHandler := handlers.NewMoulHandler(testDB)
	recordHandler := handlers.NewRecordHandler(testDB, "admin-secret-key-123")

	e := echo.New()
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.GET("/api/moul/:name/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)

	// 1. Attempt to create a collection with a cloak field before MOUL_ENCRYPTION_KEY is configured
	patientsMoul := schema.Moul{
		Name: "patients",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "fullName", Type: "text"},
			{Name: "ssn", Type: "cloak", Searchable: true},
			{Name: "medicalHistory", Type: "cloak", Searchable: false},
		},
	}
	moulBytes, err := json.Marshal(patientsMoul)
	if err != nil {
		t.Fatalf("failed to marshal moul: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/moul", bytes.NewReader(moulBytes))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected CreateMoul to return 400 when cloak is not initialized, got %d: %s", rec.Code, rec.Body.String())
	}

	// 2. Initialize cloak encryption
	masterKey := "test-encryption-key-for-records-testing-123456"
	if err := cloak.Init(masterKey); err != nil {
		t.Fatalf("failed to init cloak: %v", err)
	}

	// Now creation should succeed
	req = httptest.NewRequest(http.MethodPost, "/api/moul", bytes.NewReader(moulBytes))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("CreateMoul failed after cloak init (code %d): %s", rec.Code, rec.Body.String())
	}

	// Verify table has ssn BLOB and ssnHash TEXT columns
	var tableInfo []struct {
		CID       int            `db:"cid"`
		Name      string         `db:"name"`
		Type      string         `db:"type"`
		NotNull   int            `db:"notnull"`
		DfltValue sqlNullHandler `db:"dflt_value"`
		PK        int            `db:"pk"`
	}
	if err := testDB.NewQuery("PRAGMA table_info(patients);").All(&tableInfo); err != nil {
		t.Fatalf("failed to inspect patients table: %v", err)
	}

	colsMap := make(map[string]string)
	for _, col := range tableInfo {
		colsMap[col.Name] = col.Type
	}
	if colsMap["ssn"] != "BLOB" {
		t.Errorf("ssn column type = %q, want 'BLOB'", colsMap["ssn"])
	}
	if colsMap["ssnHash"] != "TEXT" {
		t.Errorf("ssnHash column type = %q, want 'TEXT'", colsMap["ssnHash"])
	}
	if colsMap["medicalHistory"] != "BLOB" {
		t.Errorf("medicalHistory column type = %q, want 'BLOB'", colsMap["medicalHistory"])
	}
	// non-searchable should not have medicalHistoryHash
	if _, exists := colsMap["medicalHistoryHash"]; exists {
		t.Error("medicalHistoryHash should not exist because medicalHistory is not searchable")
	}

	// 3. Insert record with cloak fields
	recordPayload := map[string]interface{}{
		"fullName":       "John Doe",
		"ssn":            "123-45-6789",
		"medicalHistory": "High blood pressure, seasonal allergies",
	}
	recBytes, err := json.Marshal(recordPayload)
	if err != nil {
		t.Fatalf("failed to marshal record payload: %v", err)
	}

	req = httptest.NewRequest(http.MethodPost, "/api/moul/patients/records", bytes.NewReader(recBytes))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("CreateRecord returned status %d: %s", rec.Code, rec.Body.String())
	}

	var createdRec map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &createdRec); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	recordID, ok := createdRec["id"].(string)
	if !ok || recordID == "" {
		t.Fatalf("missing id in response: %v", createdRec)
	}

	// 4. Verify raw DB storage directly
	var rawRow struct {
		SSN            []byte `db:"ssn"`
		SSNHash        string `db:"ssnHash"`
		MedicalHistory []byte `db:"medicalHistory"`
	}
	err = testDB.Select("ssn", "ssnHash", "medicalHistory").From("patients").Where(dbx.HashExp{"id": recordID}).One(&rawRow)
	if err != nil {
		t.Fatalf("failed to query raw record: %v", err)
	}

	// Raw SSN must NOT contain plaintext "123-45-6789"
	if bytes.Contains(rawRow.SSN, []byte("123-45-6789")) {
		t.Fatal("security violation: raw database BLOB contains unencrypted plaintext SSN")
	}
	if rawRow.SSN[0] != cloak.Version1 {
		t.Fatalf("expected version byte 0x01, got 0x%02x", rawRow.SSN[0])
	}
	// Verify raw hash is hex encoded HMAC
	if _, err := hex.DecodeString(rawRow.SSNHash); err != nil || len(rawRow.SSNHash) != 64 {
		t.Fatalf("invalid ssnHash HMAC hex string: %q", rawRow.SSNHash)
	}
	expectedHash := cloak.ComputeHash("123-45-6789")
	if rawRow.SSNHash != expectedHash {
		t.Fatalf("ssnHash mismatch: got %q, want %q", rawRow.SSNHash, expectedHash)
	}

	// 5. Read back record without reveal -> should be masked
	req = httptest.NewRequest(http.MethodGet, "/api/moul/patients/records/"+recordID, nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GetRecord failed (status %d): %s", rec.Code, rec.Body.String())
	}

	var fetchedRec map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &fetchedRec); err != nil {
		t.Fatalf("failed to unmarshal fetched record: %v", err)
	}

	// Companion hash column must be stripped from response
	if _, exists := fetchedRec["ssnHash"]; exists {
		t.Fatal("ssnHash companion column must be excluded from API responses")
	}

	// Values should be masked
	if fetchedRec["ssn"] != "••••6789" {
		t.Errorf("ssn = %v, want '••••6789'", fetchedRec["ssn"])
	}
	if fetchedRec["medicalHistory"] != "••••gies" {
		t.Errorf("medicalHistory = %v, want '••••gies'", fetchedRec["medicalHistory"])
	}

	// 6. Read back record with ?reveal=ssn
	req = httptest.NewRequest(http.MethodGet, "/api/moul/patients/records/"+recordID+"?reveal=ssn", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GetRecord with reveal failed (status %d): %s", rec.Code, rec.Body.String())
	}
	fetchedRec = nil
	if err := json.Unmarshal(rec.Body.Bytes(), &fetchedRec); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if fetchedRec["ssn"] != "123-45-6789" {
		t.Errorf("revealed ssn = %v, want '123-45-6789'", fetchedRec["ssn"])
	}
	if fetchedRec["medicalHistory"] != "••••gies" {
		t.Errorf("unrequested medicalHistory should still be masked: %v", fetchedRec["medicalHistory"])
	}

	// 7. Read back as Admin -> automatically revealed
	req = httptest.NewRequest(http.MethodGet, "/api/moul/patients/records/"+recordID, nil)
	req.Header.Set("X-Admin-Key", "admin-secret-key-123")
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GetRecord as admin failed (status %d): %s", rec.Code, rec.Body.String())
	}
	fetchedRec = nil
	if err := json.Unmarshal(rec.Body.Bytes(), &fetchedRec); err != nil {
		t.Fatalf("failed to unmarshal admin response: %v", err)
	}
	if fetchedRec["ssn"] != "123-45-6789" {
		t.Errorf("admin ssn = %v, want '123-45-6789'", fetchedRec["ssn"])
	}
	if fetchedRec["medicalHistory"] != "High blood pressure, seasonal allergies" {
		t.Errorf("admin medicalHistory = %v, want full plaintext", fetchedRec["medicalHistory"])
	}

	// 8. List and search by exact match on searchable cloak field
	req = httptest.NewRequest(http.MethodGet, `/api/moul/patients/records?filter=ssn="123-45-6789"`, nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("ListRecords with filter failed (status %d): %s", rec.Code, rec.Body.String())
	}
	var listResp struct {
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &listResp); err != nil {
		t.Fatalf("failed to unmarshal list response: %v", err)
	}
	if listResp.TotalItems != 1 {
		t.Errorf("expected 1 match for ssn search, got %d", listResp.TotalItems)
	}

	// 9. Searching non-searchable field must return 400 Bad Request
	req = httptest.NewRequest(http.MethodGet, `/api/moul/patients/records?filter=medicalHistory="allergies"`, nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request when searching non-searchable cloak field, got %d: %s", rec.Code, rec.Body.String())
	}
}

type sqlNullHandler struct{}

func (s *sqlNullHandler) Scan(value interface{}) error {
	return nil
}
