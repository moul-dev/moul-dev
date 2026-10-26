package app

import (
	"testing"

	"github.com/gobuffalo/envy"
	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/storage"
)

func TestBuiltinGenerateImageSizesWorker(t *testing.T) {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")
	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})
	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}
	t.Cleanup(func() { storage.SetImageSizesEnqueuer(nil) })

	if _, ok := a.WorkerEngine().GetHandler("GenerateImageSizes"); !ok {
		t.Fatal("expected the GenerateImageSizes worker to be registered")
	}

	// file_thumbs_async is seeded off.
	var async string
	if err := a.DB().Select("value").From("_settings").Where(dbx.HashExp{"key": "file_thumbs_async"}).Row(&async); err != nil {
		t.Fatalf("read file_thumbs_async: %v", err)
	}
	if async != "false" {
		t.Fatalf("expected file_thumbs_async to default to false, got %q", async)
	}
}
