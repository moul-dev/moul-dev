package storage

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"image/draw"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"mime"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/disintegration/imaging"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
	"go.n16f.net/thumbhash"
	_ "golang.org/x/image/webp"
)

type FileInfo struct {
	Filename  string            `json:"filename"`
	URL       string            `json:"url"`
	ThumbHash string            `json:"thumbhash,omitempty"`
	Thumbs    map[string]string `json:"thumbs,omitempty"`
}

// GetSettings loads settings from the dbx database connection.
func GetSettings(db *dbx.DB) (map[string]string, error) {
	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}
	err := db.Select("key", "value").From("_settings").All(&rows)
	if err != nil {
		return nil, err
	}
	settings := make(map[string]string)
	for _, row := range rows {
		settings[row.Key] = row.Value
	}
	return settings, nil
}

// UploadFile handles saving the uploaded file either locally or on S3,
// and automatically processes images to generate 256x256 thumbnails and thumbhashes.
func UploadFile(ctx context.Context, db *dbx.DB, fileData []byte, originalFilename string, contentType string) (*FileInfo, error) {
	settings, err := GetSettings(db)
	if err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}

	ext := filepath.Ext(originalFilename)
	if ext == "" {
		// Try to guess from content type
		if exts, err := mime.ExtensionsByType(contentType); err == nil && len(exts) > 0 {
			ext = exts[0]
		}
	}

	uniqueID := util.RandomID()
	key := fmt.Sprintf("%s%s", uniqueID, ext)

	// Detect if it is an image
	lowerExt := strings.ToLower(ext)
	isImage := strings.HasPrefix(contentType, "image/") ||
		lowerExt == ".png" || lowerExt == ".jpg" || lowerExt == ".jpeg" || lowerExt == ".gif" || lowerExt == ".webp"

	var originalURL string
	var thumbURL string
	var thumbHashStr string

	// Prepare S3 configuration if active
	s3Enabled := settings["s3_enabled"] == "true"

	var s3Client *s3.Client
	var bucket string
	if s3Enabled {
		bucket = settings["s3_bucket"]
		accessKey := settings["s3_access_key"]
		secretKey := settings["s3_secret_key"]
		region := settings["s3_region"]
		endpoint := settings["s3_endpoint"]
		forcePathStyle := settings["s3_force_path_style"] == "true"

		if bucket == "" || accessKey == "" || secretKey == "" || region == "" {
			return nil, fmt.Errorf("S3 is enabled but configuration is incomplete (bucket, region, keys are required)")
		}

		customResolver := aws.EndpointResolverWithOptionsFunc(func(service, reg string, options ...interface{}) (aws.Endpoint, error) {
			if endpoint != "" {
				return aws.Endpoint{
					URL:           endpoint,
					SigningRegion: region,
				}, nil
			}
			return aws.Endpoint{}, &aws.EndpointNotFoundError{}
		})

		cfg, err := config.LoadDefaultConfig(ctx,
			config.WithRegion(region),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
			config.WithEndpointResolverWithOptions(customResolver),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load S3 configuration: %w", err)
		}

		s3Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.UsePathStyle = forcePathStyle
		})
	}

	// 1. Process original file
	if s3Enabled {
		_, err := s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(bucket),
			Key:         aws.String(key),
			Body:        bytes.NewReader(fileData),
			ContentType: aws.String(contentType),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to upload original file to S3: %w", err)
		}

		endpoint := settings["s3_endpoint"]
		region := settings["s3_region"]
		if endpoint != "" {
			originalURL = fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, key)
		} else {
			originalURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key)
		}
	} else {
		// Ensure local directory exists
		if err := os.MkdirAll("storage", 0755); err != nil {
			return nil, fmt.Errorf("failed to create local storage directory: %w", err)
		}

		filePath := filepath.Join("storage", key)
		if err := os.WriteFile(filePath, fileData, 0644); err != nil {
			return nil, fmt.Errorf("failed to save original file locally: %w", err)
		}
		originalURL = fmt.Sprintf("/storage/%s", key)
	}

	// 2. Process image files (thumbnails & thumbhashes)
	if isImage {
		img, _, err := image.Decode(bytes.NewReader(fileData))
		if err == nil {
			// A. Create 256x256 thumbnail
			thumbImg := imaging.Thumbnail(img, 256, 256, imaging.Lanczos)
			thumbBuf := new(bytes.Buffer)

			// Encode thumb to PNG or JPEG depending on extension
			var thumbExt string
			var thumbContentType string
			if strings.ToLower(ext) == ".png" {
				thumbExt = ".png"
				thumbContentType = "image/png"
				_ = imaging.Encode(thumbBuf, thumbImg, imaging.PNG)
			} else {
				thumbExt = ".jpg"
				thumbContentType = "image/jpeg"
				_ = imaging.Encode(thumbBuf, thumbImg, imaging.JPEG)
			}

			thumbKey := fmt.Sprintf("%s_256x256%s", uniqueID, thumbExt)
			thumbBytes := thumbBuf.Bytes()

			if s3Enabled {
				_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
					Bucket:      aws.String(bucket),
					Key:         aws.String(thumbKey),
					Body:        bytes.NewReader(thumbBytes),
					ContentType: aws.String(thumbContentType),
				})
				if err != nil {
					return nil, fmt.Errorf("failed to upload thumbnail file to S3: %w", err)
				}

				endpoint := settings["s3_endpoint"]
				region := settings["s3_region"]
				if endpoint != "" {
					thumbURL = fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, thumbKey)
				} else {
					thumbURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, thumbKey)
				}
			} else {
				thumbPath := filepath.Join("storage", thumbKey)
				if err := os.WriteFile(thumbPath, thumbBytes, 0644); err != nil {
					return nil, fmt.Errorf("failed to save thumbnail locally: %w", err)
				}
				thumbURL = fmt.Sprintf("/storage/%s", thumbKey)
			}

			// B. Generate ThumbHash
			// ThumbHash works best on very small images (e.g. Fit to 100x100 pixels)
			smallImg := imaging.Fit(img, 100, 100, imaging.Linear)
			bounds := smallImg.Bounds()

			// Convert to RGBA
			rgba := image.NewRGBA(bounds)
			draw.Draw(rgba, bounds, smallImg, bounds.Min, draw.Src)

			// Call EncodeImage using RGBA image
			hash := thumbhash.EncodeImage(rgba)
			thumbHashStr = base64.StdEncoding.EncodeToString(hash)
		}
	}

	info := &FileInfo{
		Filename: originalFilename,
		URL:      originalURL,
	}

	if isImage && thumbURL != "" {
		info.ThumbHash = thumbHashStr
		info.Thumbs = map[string]string{
			"256x256": thumbURL,
		}
	}

	return info, nil
}
