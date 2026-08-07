package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func TestServeStorageLocalAndS3Redirect(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init DB: %v", err)
	}
	defer dbConn.Close()

	// 1. Create a dummy local file in storage/testfile.txt
	_ = os.MkdirAll("storage", 0755)
	defer os.RemoveAll("storage")
	testFilePath := filepath.Join("storage", "testfile.txt")
	if err := os.WriteFile(testFilePath, []byte("hello storage"), 0644); err != nil {
		t.Fatalf("Failed to write test file: %v", err)
	}

	e := echo.New()
	uploadHandler := NewUploadHandler(dbConn)
	e.GET("/storage/*", uploadHandler.ServeStorage)

	// Test GET /storage/testfile.txt when S3 is disabled -> 200 OK
	req := httptest.NewRequest(http.MethodGet, "/storage/testfile.txt", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK serving local file, got %d", rec.Code)
	}
	if rec.Body.String() != "hello storage" {
		t.Errorf("Expected content 'hello storage', got %q", rec.Body.String())
	}

	// Test GET /storage/nonexistent.txt when S3 is disabled -> 404 Not Found
	req = httptest.NewRequest(http.MethodGet, "/storage/nonexistent.txt", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent local file, got %d", rec.Code)
	}

	// Enable S3 in settings (Update existing seeded setting rows)
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "true"}, dbx.HashExp{"key": "file_s3_enabled"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "mybucket"}, dbx.HashExp{"key": "file_s3_bucket"}).Execute()
	_, _ = dbConn.Update("_settings", dbx.Params{"value": "http://localhost:9000"}, dbx.HashExp{"key": "file_s3_endpoint"}).Execute()

	// Test GET /storage/testfile.txt when S3 is enabled -> 302 Found redirect to S3
	req = httptest.NewRequest(http.MethodGet, "/storage/testfile.txt", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusFound {
		t.Errorf("Expected 302 Found redirect when S3 is enabled, got %d", rec.Code)
	}
	location := rec.Header().Get("Location")
	expectedLocation := "http://localhost:9000/mybucket/testfile.txt"
	if location != expectedLocation {
		t.Errorf("Expected redirect Location %q, got %q", expectedLocation, location)
	}
}
