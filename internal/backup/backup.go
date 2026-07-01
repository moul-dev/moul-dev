package backup

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"github.com/benbjohnson/litestream"
	"github.com/benbjohnson/litestream/s3"
	"github.com/gobuffalo/envy"
	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/logger"
)

// LitestreamStore wraps the active litestream.Store to manage its lifecycle.
type LitestreamStore struct {
	store *litestream.Store
}

// Close gracefully closes the Litestream replication store.
func (ls *LitestreamStore) Close(ctx context.Context) error {
	if ls.store != nil {
		return ls.store.Close(ctx)
	}
	return nil
}

// RestoreFromS3 attempts to restore the SQLite database file from S3 at startup.
// It is called ONLY when the local database file is missing.
func RestoreFromS3(ctx context.Context, dbPath string) error {
	enabled := envy.Get("LITESTREAM_ENABLED", "false")
	if enabled != "true" {
		return nil
	}

	bucket := envy.Get("LITESTREAM_S3_BUCKET", "")
	accessKey := envy.Get("LITESTREAM_ACCESS_KEY_ID", "")
	secretKey := envy.Get("LITESTREAM_SECRET_ACCESS_KEY", "")
	region := envy.Get("LITESTREAM_REGION", "")
	endpoint := envy.Get("LITESTREAM_S3_ENDPOINT", "")
	forcePathStyleStr := envy.Get("LITESTREAM_S3_FORCE_PATH_STYLE", "false")
	replicaPath := envy.Get("LITESTREAM_REPLICA_PATH", "")

	if bucket == "" || accessKey == "" || secretKey == "" {
		logger.Info("S3 restore fallback skipped: bucket, access key, or secret key is missing")
		return nil
	}

	if replicaPath == "" {
		replicaPath = filepath.Base(dbPath)
	}

	forcePathStyle := forcePathStyleStr == "true"

	logger.Info("Attempting to restore database from S3", "bucket", bucket, "path", replicaPath)

	db := litestream.NewDB(dbPath)

	client := s3.NewReplicaClient()
	client.AccessKeyID = accessKey
	client.SecretAccessKey = secretKey
	client.Bucket = bucket
	client.Region = region
	client.Endpoint = endpoint
	client.ForcePathStyle = forcePathStyle
	client.Path = replicaPath

	replica := litestream.NewReplica(db)
	replica.Client = client
	db.Replica = replica

	opt := litestream.RestoreOptions{
		OutputPath: dbPath,
	}

	if err := replica.Restore(ctx, opt); err != nil {
		// If it's a new database and replica doesn't exist yet on S3, Restore might return an error like "no snapshots found".
		// We should log it and proceed so that a fresh local db is initialized.
		logger.Warn("S3 restore not completed, proceeding with fresh database", "err", err)
		return nil
	}

	logger.Info("Database successfully restored from S3", "path", dbPath)
	return nil
}

// StartReplication initializes and starts the Litestream replication store.
// It loads connection details from the DB settings table first, but falls back to environment variables.
func StartReplication(ctx context.Context, dbConn *dbx.DB, dbPath string) (*LitestreamStore, error) {
	// 1. Load settings from the database
	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}
	err := dbConn.Select("key", "value").From("_settings").All(&rows)
	if err != nil {
		return nil, fmt.Errorf("failed to load settings from db: %w", err)
	}

	settings := make(map[string]string)
	for _, row := range rows {
		settings[row.Key] = row.Value
	}

	// 2. Resolve settings with environment variables override
	enabledVal := getSettingOrEnv(settings, "litestream_enabled", "LITESTREAM_ENABLED", "false")
	if enabledVal != "true" {
		logger.Info("Litestream replication is disabled")
		return nil, nil
	}

	bucket := getSettingOrEnv(settings, "litestream_s3_bucket", "LITESTREAM_S3_BUCKET", "")
	accessKey := getSettingOrEnv(settings, "litestream_access_key_id", "LITESTREAM_ACCESS_KEY_ID", "")
	secretKey := getSettingOrEnv(settings, "litestream_secret_access_key", "LITESTREAM_SECRET_ACCESS_KEY", "")
	region := getSettingOrEnv(settings, "litestream_region", "LITESTREAM_REGION", "")
	endpoint := getSettingOrEnv(settings, "litestream_s3_endpoint", "LITESTREAM_S3_ENDPOINT", "")
	forcePathStyleVal := getSettingOrEnv(settings, "litestream_s3_force_path_style", "LITESTREAM_S3_FORCE_PATH_STYLE", "false")
	replicaPath := getSettingOrEnv(settings, "litestream_replica_path", "LITESTREAM_REPLICA_PATH", "")

	if bucket == "" || accessKey == "" || secretKey == "" {
		return nil, fmt.Errorf("S3 replication configuration is incomplete: bucket, access key, or secret key is missing")
	}

	if replicaPath == "" {
		replicaPath = filepath.Base(dbPath)
	}

	forcePathStyle := forcePathStyleVal == "true"

	logger.Info("Starting Litestream replication to S3", "bucket", bucket, "region", region, "path", replicaPath)

	// 3. Initialize Litestream DB
	db := litestream.NewDB(dbPath)

	client := s3.NewReplicaClient()
	client.AccessKeyID = accessKey
	client.SecretAccessKey = secretKey
	client.Bucket = bucket
	client.Region = region
	client.Endpoint = endpoint
	client.ForcePathStyle = forcePathStyle
	client.Path = replicaPath

	replica := litestream.NewReplica(db)
	replica.Client = client
	db.Replica = replica

	// 4. Configure compaction levels (Level 0 and Level 1 at 10-second sync intervals)
	levels := litestream.CompactionLevels{
		{Level: 0},
		{Level: 1, Interval: 10 * time.Second},
	}

	// 5. Create store and add DB
	store := litestream.NewStore([]*litestream.DB{db}, levels)

	// 6. Open the store to begin replication background tasks
	if err := store.Open(ctx); err != nil {
		return nil, fmt.Errorf("failed to open litestream store: %w", err)
	}

	return &LitestreamStore{store: store}, nil
}

func getSettingOrEnv(settings map[string]string, settingKey string, envKey string, defaultVal string) string {
	if val, ok := settings[settingKey]; ok && val != "" {
		return val
	}
	return envy.Get(envKey, defaultVal)
}
