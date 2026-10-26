package storage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pocketbase/dbx"
)

// S3Enabled reports whether uploads are stored in S3 according to settings.
func S3Enabled(settings map[string]string) bool {
	return settings["file_s3_enabled"] == "true"
}

// PublicURLPrefix returns the URL prefix (ending in "/") that UploadFile puts in front of an
// object key when S3 is enabled, or "" when it is not.
func PublicURLPrefix(settings map[string]string) string {
	if !S3Enabled(settings) {
		return ""
	}
	bucket := settings["file_s3_bucket"]
	if endpoint := settings["file_s3_endpoint"]; endpoint != "" {
		return fmt.Sprintf("%s/%s/", strings.TrimSuffix(endpoint, "/"), bucket)
	}
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/", bucket, settings["file_s3_region"])
}

// PresignGetURL returns a URL that reads key from the configured S3 bucket until ttl elapses, so
// files can be served from a private bucket.
func PresignGetURL(ctx context.Context, db *dbx.DB, key string, ttl time.Duration) (string, error) {
	settings, err := GetSettings(db)
	if err != nil {
		return "", fmt.Errorf("failed to load settings: %w", err)
	}
	client, bucket, err := getS3Client(ctx, settings)
	if err != nil {
		return "", err
	}
	if client == nil {
		return "", fmt.Errorf("S3 storage is not enabled")
	}
	req, err := s3.NewPresignClient(client).PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("failed to presign S3 object %q: %w", key, err)
	}
	return req.URL, nil
}
