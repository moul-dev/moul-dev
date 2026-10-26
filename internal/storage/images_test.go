package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"image"
	"image/color"
	"image/gif"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/pocketbase/dbx"
)

func imageSize(t *testing.T, url string) (int, int) {
	t.Helper()
	data, err := os.ReadFile(filepath.Join(".", url))
	if err != nil {
		t.Fatalf("read %s: %v", url, err)
	}
	cfg, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		t.Fatalf("decode %s: %v", url, err)
	}
	return cfg.Width, cfg.Height
}

func TestUploadImageRenditionsAndDimensions(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()

	info, err := UploadFile(context.Background(), db, photoLikeJPEG(t, 2600, 1300), "garage.jpg", "image/jpeg")
	if err != nil {
		t.Fatalf("UploadFile: %v", err)
	}
	if info.Width != 2600 || info.Height != 1300 {
		t.Fatalf("expected width/height 2600x1300, got %dx%d", info.Width, info.Height)
	}
	if info.ThumbHash == "" {
		t.Fatal("expected a thumbhash")
	}
	want := map[string][2]int{"lg": {2048, 1024}, "md": {1024, 512}, "sm": {256, 128}}
	for name, dims := range want {
		url := info.Thumbs[name]
		if url == "" || url == info.URL {
			t.Fatalf("expected a %s rendition, got %q", name, url)
		}
		if w, h := imageSize(t, url); w != dims[0] || h != dims[1] {
			t.Errorf("%s rendition is %dx%d, want %dx%d", name, w, h, dims[0], dims[1])
		}
	}

	raw, err := json.Marshal(info)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(raw, []byte(`"width":2600`)) || !bytes.Contains(raw, []byte(`"height":1300`)) {
		t.Fatalf("expected camelCase width/height in JSON, got %s", raw)
	}
}

// hugeGIF returns a valid tiny GIF whose logical screen claims 10000×10000 pixels (100 MP).
func hugeGIF(t *testing.T) []byte {
	t.Helper()
	img := image.NewPaletted(image.Rect(0, 0, 1, 1), []color.Color{color.Black, color.White})
	var buf bytes.Buffer
	if err := gif.Encode(&buf, img, nil); err != nil {
		t.Fatalf("encode gif: %v", err)
	}
	data := buf.Bytes()
	// Logical screen width and height follow the 6-byte "GIF89a" signature, little endian.
	data[6], data[7] = 0x10, 0x27 // 10000
	data[8], data[9] = 0x10, 0x27 // 10000
	return data
}

func TestUploadRejectsOversizedImageBeforeStoring(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()

	_, err := UploadFile(context.Background(), db, hugeGIF(t), "bomb.gif", "image/gif")
	if !errors.Is(err, ErrImageTooLarge) {
		t.Fatalf("expected ErrImageTooLarge, got %v", err)
	}
	entries, err := os.ReadDir("storage")
	if err != nil && !os.IsNotExist(err) {
		t.Fatalf("read storage: %v", err)
	}
	if len(entries) != 0 {
		t.Fatalf("nothing may be stored for a refused image, found %d entries", len(entries))
	}
}

func TestAcquireImageSlotHonoursContext(t *testing.T) {
	var releases []func()
	defer func() {
		for _, r := range releases {
			r()
		}
	}()
	// Take every slot.
	for {
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
		release, err := acquireImageSlot(ctx)
		cancel()
		if err != nil {
			break
		}
		releases = append(releases, release)
		if len(releases) > 1024 {
			t.Fatal("image slots are not bounded")
		}
	}
	if len(releases) != cap(imageSlots) || len(releases) != imageConcurrency() {
		t.Fatalf("expected %d slots, took %d", imageConcurrency(), len(releases))
	}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := acquireImageSlot(ctx); !errors.Is(err, context.Canceled) {
		t.Fatalf("expected a cancelled wait to fail with context.Canceled, got %v", err)
	}
}

func enableAsyncThumbs(t *testing.T, db *dbx.DB) {
	t.Helper()
	if _, err := db.Insert("_settings", dbx.Params{"key": "file_thumbs_async", "value": "true"}).Execute(); err != nil {
		t.Fatalf("enable async thumbs: %v", err)
	}
}

func TestUploadImageAsyncSizes(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()
	enableAsyncThumbs(t, db)

	type call struct{ id, key string }
	var calls []call
	SetImageSizesEnqueuer(func(ctx context.Context, fileID, key string) error {
		calls = append(calls, call{fileID, key})
		return nil
	})
	defer SetImageSizesEnqueuer(nil)

	info, err := UploadFile(context.Background(), db, photoLikeJPEG(t, 1200, 600), "build.jpg", "image/jpeg")
	if err != nil {
		t.Fatalf("UploadFile: %v", err)
	}
	if info.Width != 1200 || info.Height != 600 {
		t.Fatalf("expected dimensions right away, got %dx%d", info.Width, info.Height)
	}
	for name, url := range info.Thumbs {
		if url != info.URL {
			t.Fatalf("thumb %s must point at the original until the job runs, got %q", name, url)
		}
	}
	if len(calls) != 1 || calls[0].id != info.ID || calls[0].key != info.ID+"/original.jpg" {
		t.Fatalf("expected one GenerateImageSizes job for the upload, got %+v", calls)
	}

	if err := GenerateImageSizes(context.Background(), db, calls[0].id, calls[0].key); err != nil {
		t.Fatalf("GenerateImageSizes: %v", err)
	}
	metaData, err := os.ReadFile(filepath.Join("storage", info.ID, "meta.json"))
	if err != nil {
		t.Fatalf("read meta.json: %v", err)
	}
	var meta FileInfo
	if err := json.Unmarshal(metaData, &meta); err != nil {
		t.Fatalf("parse meta.json: %v", err)
	}
	if meta.ThumbHash == "" || meta.Thumbs["md"] == info.URL || meta.Thumbs["sm"] == info.URL {
		t.Fatalf("expected the job to record md and sm renditions and a thumbhash, got %+v", meta)
	}
	if meta.Thumbs["lg"] != info.URL {
		t.Fatalf("an image smaller than lg keeps the original as lg, got %q", meta.Thumbs["lg"])
	}
	if w, _ := imageSize(t, meta.Thumbs["md"]); w != 1024 {
		t.Fatalf("expected md to be 1024 wide, got %d", w)
	}
}

func TestUploadImageAsyncFallsBackWhenQueueFails(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()
	enableAsyncThumbs(t, db)

	SetImageSizesEnqueuer(func(context.Context, string, string) error { return errors.New("database is locked") })
	defer SetImageSizesEnqueuer(nil)

	info, err := UploadFile(context.Background(), db, photoLikeJPEG(t, 600, 300), "post.jpg", "image/jpeg")
	if err != nil {
		t.Fatalf("UploadFile: %v", err)
	}
	if info.Thumbs["sm"] == info.URL || info.ThumbHash == "" {
		t.Fatalf("expected the sizes to be made during the upload when queueing fails, got %+v", info)
	}
}

func TestGenerateImageSizesRejectsForeignKeys(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()
	for _, tc := range []struct{ id, key string }{
		{"abc", "other/original.jpg"},
		{"abc", "abc/../../etc/passwd"},
		{"", "original.jpg"},
	} {
		if err := GenerateImageSizes(context.Background(), db, tc.id, tc.key); err == nil {
			t.Errorf("expected key %q of file %q to be refused", tc.key, tc.id)
		}
	}
}
