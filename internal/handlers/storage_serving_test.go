package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

const testUploadID = "AbCdEfGhIjKlMnO"

func TestServeStorageLocalAndS3Redirect(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init DB: %v", err)
	}
	defer dbConn.Close()

	// 1. Create a dummy local upload in storage/<id>/original.txt
	if err := os.MkdirAll(filepath.Join("storage", testUploadID), 0755); err != nil {
		t.Fatalf("mkdir: %v", err)
	}
	defer os.RemoveAll("storage")
	testFilePath := filepath.Join("storage", testUploadID, "original.txt")
	if err := os.WriteFile(testFilePath, []byte("hello storage"), 0644); err != nil {
		t.Fatalf("Failed to write test file: %v", err)
	}

	e := echo.New()
	uploadHandler := NewUploadHandler(dbConn)
	e.GET("/storage/*", uploadHandler.ServeStorage)

	get := func(path string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		return rec
	}

	// S3 disabled: the upload is served with hardening headers, as an attachment (not an image).
	rec := get("/storage/" + testUploadID + "/original.txt")
	if rec.Code != http.StatusOK || rec.Body.String() != "hello storage" {
		t.Fatalf("serving local file: %d %q", rec.Code, rec.Body.String())
	}
	if rec.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Error("missing nosniff")
	}
	if !strings.Contains(rec.Header().Get("Content-Security-Policy"), "sandbox") {
		t.Error("missing sandboxing CSP")
	}
	if !strings.HasPrefix(rec.Header().Get("Content-Disposition"), "attachment") {
		t.Errorf("text file not served as attachment: %q", rec.Header().Get("Content-Disposition"))
	}

	// Missing uploads and paths that do not name an upload answer the same 404.
	for _, path := range []string{
		"/storage/" + testUploadID + "/missing.txt",
		"/storage/testfile.txt",
		"/storage/../moul-local.db",
		"/storage/short/original.txt",
	} {
		if rec := get(path); rec.Code != http.StatusNotFound {
			t.Errorf("%s: expected 404, got %d", path, rec.Code)
		}
	}

	// Enable S3: the handler redirects to a presigned URL of the object.
	for k, v := range map[string]string{
		"file_s3_enabled":          "true",
		"file_s3_bucket":           "mybucket",
		"file_s3_endpoint":         "http://localhost:9000",
		"file_s3_region":           "us-east-1",
		"file_s3_access_key":       "AKIAEXAMPLE",
		"file_s3_secret_key":       "secret",
		"file_s3_force_path_style": "true",
	} {
		if _, err := dbConn.Update("_settings", dbx.Params{"value": v}, dbx.HashExp{"key": k}).Execute(); err != nil {
			t.Fatalf("update setting %s: %v", k, err)
		}
	}
	rec = get("/storage/" + testUploadID + "/original.txt")
	if rec.Code != http.StatusFound {
		t.Fatalf("Expected 302 Found redirect when S3 is enabled, got %d: %s", rec.Code, rec.Body.String())
	}
	location := rec.Header().Get("Location")
	if !strings.HasPrefix(location, "http://localhost:9000/mybucket/"+testUploadID+"/original.txt?") || !strings.Contains(location, "X-Amz-Signature=") {
		t.Errorf("Expected a presigned redirect, got %q", location)
	}
}
