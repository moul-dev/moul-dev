package storage

import (
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/pocketbase/dbx"
	_ "modernc.org/sqlite"
)

func prepareTestDB(t *testing.T) (*dbx.DB, func()) {
	db, err := dbx.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open memory db: %v", err)
	}

	_, err = db.NewQuery(`
		CREATE TABLE _settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
	`).Execute()
	if err != nil {
		t.Fatalf("Failed to create _settings table: %v", err)
	}

	defaultSettings := map[string]string{
		"s3_enabled":               "false",
		"s3_bucket":                "",
		"s3_endpoint":              "",
		"s3_region":                "",
		"s3_access_key":            "",
		"s3_secret_key":            "",
		"s3_force_path_style":      "false",
		"litestream_enabled":      "false",
		"litestream_replica_path": "",
	}
	for k, v := range defaultSettings {
		_, err = db.Insert("_settings", dbx.Params{"key": k, "value": v}).Execute()
		if err != nil {
			t.Fatalf("Failed to seed setting %v: %v", k, err)
		}
	}

	return db, func() {
		db.Close()
		_ = os.RemoveAll("storage")
	}
}

func createTestPNG(t *testing.T, w, h int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.RGBA{uint8(x * 255 / w), uint8(y * 255 / h), 0, 255})
		}
	}

	buf := new(bytes.Buffer)
	if err := png.Encode(buf, img); err != nil {
		t.Fatalf("Failed to encode test PNG: %v", err)
	}
	return buf.Bytes()
}

func TestUploadFileLocalNonImage(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()

	content := []byte("Hello, this is a plain text file content.")
	filename := "test_document.txt"
	contentType := "text/plain"

	info, err := UploadFile(context.Background(), db, content, filename, contentType)
	if err != nil {
		t.Fatalf("UploadFile failed: %v", err)
	}

	if info.Filename != filename {
		t.Errorf("Expected filename %q, got %q", filename, info.Filename)
	}

	if !strings.HasPrefix(info.URL, "/storage/") {
		t.Errorf("Expected local URL starting with /storage/, got %q", info.URL)
	}

	if info.ThumbHash != "" {
		t.Errorf("Expected empty thumbhash for text file, got %q", info.ThumbHash)
	}

	if len(info.Thumbs) > 0 {
		t.Errorf("Expected zero thumbnails for text file, got %v", info.Thumbs)
	}

	// Verify file exists locally
	localPath := filepath.Join(".", info.URL)
	if _, err := os.Stat(localPath); os.IsNotExist(err) {
		t.Errorf("File was not saved locally to path: %s", localPath)
	}
}

func TestUploadFileLocalImage(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()

	w, h := 500, 500
	content := createTestPNG(t, w, h)
	filename := "photo.png"
	contentType := "image/png"

	info, err := UploadFile(context.Background(), db, content, filename, contentType)
	if err != nil {
		t.Fatalf("UploadFile failed: %v", err)
	}

	if info.Filename != filename {
		t.Errorf("Expected filename %q, got %q", filename, info.Filename)
	}

	if info.ThumbHash == "" {
		t.Errorf("Expected non-empty thumbhash for image")
	}

	if _, ok := info.Thumbs["256x256"]; ok {
		t.Errorf("Expected thumbs map to not contain old key '256x256'")
	}

	smURL, hasSm := info.Thumbs["sm"]
	if !hasSm || smURL == "" {
		t.Fatalf("Expected 'sm' thumbnail URL in thumbs map, got: %v", info.Thumbs)
	}

	mdURL, hasMd := info.Thumbs["md"]
	if !hasMd || mdURL != info.URL {
		t.Errorf("Expected 'md' URL to point to original URL (%q), got %q", info.URL, mdURL)
	}

	lgURL, hasLg := info.Thumbs["lg"]
	if !hasLg || lgURL != info.URL {
		t.Errorf("Expected 'lg' URL to point to original URL (%q), got %q", info.URL, lgURL)
	}

	// Verify both original and sm thumbnail exist locally
	origPath := filepath.Join(".", info.URL)
	if _, err := os.Stat(origPath); os.IsNotExist(err) {
		t.Errorf("Original image not found locally at: %s", origPath)
	}

	smPath := filepath.Join(".", smURL)
	if _, err := os.Stat(smPath); os.IsNotExist(err) {
		t.Errorf("sm image not found locally at: %s", smPath)
	}
}
