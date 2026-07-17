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
// and automatically processes images to generate semantic sizes (sm, md, lg) and thumbhashes.
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
	key := fmt.Sprintf("%s/original%s", uniqueID, ext)

	// Detect if it is an image
	lowerExt := strings.ToLower(ext)
	isImage := strings.HasPrefix(contentType, "image/") ||
		lowerExt == ".png" || lowerExt == ".jpg" || lowerExt == ".jpeg" || lowerExt == ".gif" || lowerExt == ".webp"

	var originalURL string
	var thumbHashStr string

	// Prepare S3 configuration if active
	s3Enabled := settings["file_s3_enabled"] == "true"

	var s3Client *s3.Client
	var bucket string
	if s3Enabled {
		bucket = settings["file_s3_bucket"]
		accessKey := settings["file_s3_access_key"]
		secretKey := settings["file_s3_secret_key"]
		region := settings["file_s3_region"]
		endpoint := settings["file_s3_endpoint"]
		forcePathStyle := settings["file_s3_force_path_style"] == "true"

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

		endpoint := settings["file_s3_endpoint"]
		region := settings["file_s3_region"]
		if endpoint != "" {
			originalURL = fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, key)
		} else {
			originalURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key)
		}
	} else {
		filePath := filepath.Join("storage", key)
		// Ensure local directory exists
		if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
			return nil, fmt.Errorf("failed to create local storage directory: %w", err)
		}

		if err := os.WriteFile(filePath, fileData, 0644); err != nil {
			return nil, fmt.Errorf("failed to save original file locally: %w", err)
		}
		originalURL = fmt.Sprintf("/storage/%s", key)
	}

	info := &FileInfo{
		Filename: originalFilename,
		URL:      originalURL,
	}

	// 2. Process image files (thumbnails & thumbhashes)
	if isImage {
		info.Thumbs = make(map[string]string)
		img, _, err := image.Decode(bytes.NewReader(fileData))
		if err == nil {
			// A. Generate ThumbHash
			// ThumbHash works best on very small images (e.g. Fit to 100x100 pixels)
			smallImg := imaging.Fit(img, 100, 100, imaging.Linear)
			bounds := smallImg.Bounds()

			// Convert to RGBA
			rgba := image.NewRGBA(bounds)
			draw.Draw(rgba, bounds, smallImg, bounds.Min, draw.Src)

			// Call EncodeImage using RGBA image
			hash := thumbhash.EncodeImage(rgba)
			thumbHashStr = base64.StdEncoding.EncodeToString(hash)
			info.ThumbHash = thumbHashStr

			// B. Create semantic sizes
			origBounds := img.Bounds()
			origW := origBounds.Dx()
			origH := origBounds.Dy()

			targets := map[string]int{
				"sm": 256,
				"md": 1024,
				"lg": 2048,
			}

			// Determine image format for encoding
			var targetExt string
			var targetContentType string
			var format imaging.Format

			lowerExt := strings.ToLower(ext)
			if lowerExt == ".png" {
				targetExt = ".png"
				targetContentType = "image/png"
				format = imaging.PNG
			} else if lowerExt == ".gif" {
				targetExt = ".gif"
				targetContentType = "image/gif"
				format = imaging.GIF
			} else {
				targetExt = ".jpg"
				targetContentType = "image/jpeg"
				format = imaging.JPEG
			}

			for name, targetSize := range targets {
				if origW <= targetSize && origH <= targetSize {
					// Use original image's URL for target sizes larger than or equal to original dimensions
					info.Thumbs[name] = originalURL
				} else {
					resizedImg := imaging.Fit(img, targetSize, targetSize, imaging.Lanczos)
					sizeBuf := new(bytes.Buffer)
					if err := imaging.Encode(sizeBuf, resizedImg, format); err != nil {
						return nil, fmt.Errorf("failed to encode %s image: %w", name, err)
					}
					sizeBytes := sizeBuf.Bytes()
					sizeKey := fmt.Sprintf("%s/%s%s", uniqueID, name, targetExt)

					var sizeURL string
					if s3Enabled {
						_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
							Bucket:      aws.String(bucket),
							Key:         aws.String(sizeKey),
							Body:        bytes.NewReader(sizeBytes),
							ContentType: aws.String(targetContentType),
						})
						if err != nil {
							return nil, fmt.Errorf("failed to upload %s file to S3: %w", name, err)
						}

						endpoint := settings["file_s3_endpoint"]
						region := settings["file_s3_region"]
						if endpoint != "" {
							sizeURL = fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, sizeKey)
						} else {
							sizeURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, sizeKey)
						}
					} else {
						sizePath := filepath.Join("storage", sizeKey)
						if err := os.MkdirAll(filepath.Dir(sizePath), 0755); err != nil {
							return nil, fmt.Errorf("failed to create local storage directory for %s: %w", name, err)
						}
						if err := os.WriteFile(sizePath, sizeBytes, 0644); err != nil {
							return nil, fmt.Errorf("failed to save %s locally: %w", name, err)
						}
						sizeURL = fmt.Sprintf("/storage/%s", sizeKey)
					}
					info.Thumbs[name] = sizeURL
				}
			}
		}
	}

	return info, nil
}
