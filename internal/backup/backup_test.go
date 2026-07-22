package backup

import (
	"context"
	"os"
	"testing"

	"github.com/gobuffalo/envy"
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

	return db, func() {
		db.Close()
	}
}

func seedSettings(t *testing.T, db *dbx.DB, settings map[string]string) {
	for k, v := range settings {
		_, err := db.Insert("_settings", dbx.Params{"key": k, "value": v}).Execute()
		if err != nil {
			t.Fatalf("Failed to seed setting %s: %v", k, err)
		}
	}
}

func TestRestoreFromS3_Disabled(t *testing.T) {
	// Ensure Litestream is disabled
	envy.Set("LITESTREAM_ENABLED", "false")
	defer envy.Set("LITESTREAM_ENABLED", "")

	err := RestoreFromS3(context.Background(), "test-restore.db")
	if err == nil {
		t.Fatal("Expected error when litestream is disabled, got nil")
	}
}

func TestStartReplication_Disabled(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()

	// Seed with disabled
	seedSettings(t, db, map[string]string{
		"litestream_enabled": "false",
	})

	store, err := StartReplication(context.Background(), db, "test-replicate.db")
	if err != nil {
		t.Fatalf("Expected no error when replication is disabled, got: %v", err)
	}
	if store != nil {
		t.Fatal("Expected nil store when replication is disabled")
	}
}

func TestStartReplication_IncompleteConfig(t *testing.T) {
	db, cleanup := prepareTestDB(t)
	defer cleanup()

	// Seed enabled but missing credentials
	seedSettings(t, db, map[string]string{
		"litestream_enabled": "true",
		"s3_bucket":          "",
	})

	_, err := StartReplication(context.Background(), db, "test-replicate.db")
	if err == nil {
		t.Fatal("Expected error due to incomplete S3 configuration")
	}
}

func TestRestoreFromS3_MissingCredentials(t *testing.T) {
	envy.Set("LITESTREAM_ENABLED", "true")
	envy.Set("LITESTREAM_S3_BUCKET", "")
	defer func() {
		envy.Set("LITESTREAM_ENABLED", "")
		envy.Set("LITESTREAM_S3_BUCKET", "")
	}()

	// If credentials are empty, it should return an error
	err := RestoreFromS3(context.Background(), "test-restore.db")
	if err == nil {
		t.Fatal("Expected error when env credentials are missing, got nil")
	}
	// Verify no file was created
	if _, err := os.Stat("test-restore.db"); !os.IsNotExist(err) {
		t.Fatal("Expected no DB file to be created")
	}
}
