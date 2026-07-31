package storage

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/draw"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/disintegration/imaging"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
	"go.n16f.net/thumbhash"
	_ "golang.org/x/image/webp"
)

type FileInfo struct {
	ID        string            `json:"id,omitempty"`
	Filename  string            `json:"filename"`
	URL       string            `json:"url"`
	ThumbHash string            `json:"thumbhash,omitempty"`
	Thumbs    map[string]string `json:"thumbs,omitempty"`
	Size      int64             `json:"size,omitempty"`
	CreatedAt string            `json:"created_at,omitempty"`
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

func getS3Client(ctx context.Context, settings map[string]string) (*s3.Client, string, error) {
	s3Enabled := settings["file_s3_enabled"] == "true"
	if !s3Enabled {
		return nil, "", nil
	}

	bucket := settings["file_s3_bucket"]
	accessKey := settings["file_s3_access_key"]
	secretKey := settings["file_s3_secret_key"]
	region := settings["file_s3_region"]
	endpoint := settings["file_s3_endpoint"]
	forcePathStyle := settings["file_s3_force_path_style"] == "true"

	if bucket == "" || accessKey == "" || secretKey == "" || region == "" {
		return nil, "", fmt.Errorf("S3 is enabled but configuration is incomplete (bucket, region, keys are required)")
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
		return nil, "", fmt.Errorf("failed to load S3 configuration: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = forcePathStyle
	})

	return client, bucket, nil
}

// UploadFile handles saving the uploaded file either locally or on S3,
// and automatically processes images to generate semantic sizes (sm, md, lg) and thumbhashes.
func UploadFile(ctx context.Context, db *dbx.DB, fileData []byte, originalFilename string, contentType string) (*FileInfo, error) {
	settings, err := GetSettings(db)
	if err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}

	sanitizedFilename := util.SlugifyFilename(originalFilename)
	ext := filepath.Ext(sanitizedFilename)
	if ext == "" {
		// Try to guess from content type
		if exts, err := mime.ExtensionsByType(contentType); err == nil && len(exts) > 0 {
			ext = exts[0]
			sanitizedFilename = sanitizedFilename + ext
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

	s3Enabled := settings["file_s3_enabled"] == "true"
	s3Client, bucket, err := getS3Client(ctx, settings)
	if err != nil {
		return nil, err
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

	createdAt := time.Now().UTC().Format(time.RFC3339)
	info := &FileInfo{
		ID:        uniqueID,
		Filename:  sanitizedFilename,
		URL:       originalURL,
		Size:      int64(len(fileData)),
		CreatedAt: createdAt,
	}

	// 2. Process image files (thumbnails & thumbhashes)
	if isImage {
		info.Thumbs = make(map[string]string)
		img, _, err := image.Decode(bytes.NewReader(fileData))
		if err == nil {
			// A. Generate ThumbHash
			smallImg := imaging.Fit(img, 100, 100, imaging.Linear)
			bounds := smallImg.Bounds()

			rgba := image.NewRGBA(bounds)
			draw.Draw(rgba, bounds, smallImg, bounds.Min, draw.Src)

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

	// 3. Save metadata JSON for list/delete retrieval
	metaBytes, _ := json.Marshal(info)
	metaKey := fmt.Sprintf("%s/meta.json", uniqueID)
	if s3Enabled {
		_, _ = s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(bucket),
			Key:         aws.String(metaKey),
			Body:        bytes.NewReader(metaBytes),
			ContentType: aws.String("application/json"),
		})
	} else {
		metaPath := filepath.Join("storage", metaKey)
		_ = os.WriteFile(metaPath, metaBytes, 0644)
	}

	return info, nil
}

// ExtractFileID extracts the unique file ID prefix from a file ID, path, or URL.
func ExtractFileID(fileIDOrPath string) string {
	s := strings.TrimSpace(fileIDOrPath)
	if idx := strings.Index(s, "://"); idx != -1 {
		s = s[idx+3:]
		if idxSlash := strings.Index(s, "/"); idxSlash != -1 {
			s = s[idxSlash+1:]
		}
	}
	s = strings.TrimPrefix(s, "/")
	s = strings.TrimPrefix(s, "storage/")
	s = strings.TrimPrefix(s, "/")

	parts := strings.Split(s, "/")
	for _, p := range parts {
		if len(p) == 15 {
			return p
		}
	}
	if len(parts) > 0 && parts[0] != "" {
		return parts[0]
	}
	return s
}

// ListFiles returns all uploaded files and their metadata.
func ListFiles(ctx context.Context, db *dbx.DB) ([]*FileInfo, error) {
	settings, err := GetSettings(db)
	if err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}

	s3Client, bucket, err := getS3Client(ctx, settings)
	if err != nil {
		return nil, err
	}

	if s3Client != nil {
		endpoint := settings["file_s3_endpoint"]
		region := settings["file_s3_region"]
		return listFilesS3(ctx, s3Client, bucket, endpoint, region)
	}

	return listFilesLocal()
}

func listFilesLocal() ([]*FileInfo, error) {
	entries, err := os.ReadDir("storage")
	if err != nil {
		if os.IsNotExist(err) {
			return []*FileInfo{}, nil
		}
		return nil, fmt.Errorf("failed to read storage directory: %w", err)
	}

	var files []*FileInfo
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		uniqueID := entry.Name()
		dirPath := filepath.Join("storage", uniqueID)

		// Try reading meta.json
		metaPath := filepath.Join(dirPath, "meta.json")
		if metaData, err := os.ReadFile(metaPath); err == nil {
			var info FileInfo
			if err := json.Unmarshal(metaData, &info); err == nil {
				if info.ID == "" {
					info.ID = uniqueID
				}
				files = append(files, &info)
				continue
			}
		}

		// Fallback for legacy uploads without meta.json
		subEntries, err := os.ReadDir(dirPath)
		if err != nil {
			continue
		}

		var origFile string
		var origSize int64
		var modTime time.Time
		thumbs := make(map[string]string)

		for _, sub := range subEntries {
			if sub.IsDir() {
				continue
			}
			name := sub.Name()
			if strings.HasPrefix(name, "original") {
				origFile = name
				if info, err := sub.Info(); err == nil {
					origSize = info.Size()
					modTime = info.ModTime()
				}
			} else if strings.HasPrefix(name, "sm.") {
				thumbs["sm"] = fmt.Sprintf("/storage/%s/%s", uniqueID, name)
			} else if strings.HasPrefix(name, "md.") {
				thumbs["md"] = fmt.Sprintf("/storage/%s/%s", uniqueID, name)
			} else if strings.HasPrefix(name, "lg.") {
				thumbs["lg"] = fmt.Sprintf("/storage/%s/%s", uniqueID, name)
			}
		}

		if origFile != "" {
			info := &FileInfo{
				ID:        uniqueID,
				Filename:  origFile,
				URL:       fmt.Sprintf("/storage/%s/%s", uniqueID, origFile),
				Thumbs:    thumbs,
				Size:      origSize,
				CreatedAt: modTime.UTC().Format(time.RFC3339),
			}
			files = append(files, info)
		}
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].CreatedAt > files[j].CreatedAt
	})

	return files, nil
}

func listFilesS3(ctx context.Context, s3Client *s3.Client, bucket, endpoint, region string) ([]*FileInfo, error) {
	out, err := s3Client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list S3 objects: %w", err)
	}

	prefixes := make(map[string][]s3types.Object)
	for _, obj := range out.Contents {
		key := aws.ToString(obj.Key)
		parts := strings.Split(key, "/")
		if len(parts) >= 2 {
			prefix := parts[0]
			prefixes[prefix] = append(prefixes[prefix], obj)
		}
	}

	var files []*FileInfo
	for prefix, objs := range prefixes {
		metaKey := prefix + "/meta.json"
		var metaObj *s3types.Object
		for i, o := range objs {
			if aws.ToString(o.Key) == metaKey {
				metaObj = &objs[i]
				break
			}
		}

		if metaObj != nil {
			getOut, err := s3Client.GetObject(ctx, &s3.GetObjectInput{
				Bucket: aws.String(bucket),
				Key:    aws.String(metaKey),
			})
			if err == nil {
				data, err := io.ReadAll(getOut.Body)
				getOut.Body.Close()
				if err == nil {
					var info FileInfo
					if err := json.Unmarshal(data, &info); err == nil {
						if info.ID == "" {
							info.ID = prefix
						}
						files = append(files, &info)
						continue
					}
				}
			}
		}

		// Fallback for S3 legacy objects without meta.json
		var origKey string
		var origSize int64
		var modTime time.Time
		thumbs := make(map[string]string)

		for _, o := range objs {
			k := aws.ToString(o.Key)
			parts := strings.Split(k, "/")
			filename := parts[len(parts)-1]
			var sizeURL string
			if endpoint != "" {
				sizeURL = fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, k)
			} else {
				sizeURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, k)
			}

			if strings.HasPrefix(filename, "original") {
				origKey = k
				origSize = aws.ToInt64(o.Size)
				if o.LastModified != nil {
					modTime = *o.LastModified
				}
			} else if strings.HasPrefix(filename, "sm.") {
				thumbs["sm"] = sizeURL
			} else if strings.HasPrefix(filename, "md.") {
				thumbs["md"] = sizeURL
			} else if strings.HasPrefix(filename, "lg.") {
				thumbs["lg"] = sizeURL
			}
		}

		if origKey != "" {
			var origURL string
			if endpoint != "" {
				origURL = fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, origKey)
			} else {
				origURL = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, origKey)
			}
			info := &FileInfo{
				ID:        prefix,
				Filename:  filepath.Base(origKey),
				URL:       origURL,
				Thumbs:    thumbs,
				Size:      origSize,
				CreatedAt: modTime.UTC().Format(time.RFC3339),
			}
			files = append(files, info)
		}
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].CreatedAt > files[j].CreatedAt
	})

	return files, nil
}

// DeleteFile deletes an uploaded file and all its thumbnails/metadata by file ID or path.
func DeleteFile(ctx context.Context, db *dbx.DB, fileIDOrPath string) error {
	settings, err := GetSettings(db)
	if err != nil {
		return fmt.Errorf("failed to load settings: %w", err)
	}

	fileID := ExtractFileID(fileIDOrPath)
	if fileID == "" {
		return fmt.Errorf("invalid file identifier")
	}

	s3Client, bucket, err := getS3Client(ctx, settings)
	if err != nil {
		return err
	}

	if s3Client != nil {
		prefix := fileID + "/"
		listOut, err := s3Client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
			Bucket: aws.String(bucket),
			Prefix: aws.String(prefix),
		})
		if err != nil {
			return fmt.Errorf("failed to list S3 objects for deletion: %w", err)
		}

		if len(listOut.Contents) == 0 {
			return os.ErrNotExist
		}

		var objectIDs []s3types.ObjectIdentifier
		for _, item := range listOut.Contents {
			objectIDs = append(objectIDs, s3types.ObjectIdentifier{Key: item.Key})
		}

		_, err = s3Client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
			Bucket: aws.String(bucket),
			Delete: &s3types.Delete{
				Objects: objectIDs,
				Quiet:   aws.Bool(true),
			},
		})
		if err != nil {
			return fmt.Errorf("failed to delete S3 objects: %w", err)
		}
		return nil
	}

	// Local storage deletion
	targetDir := filepath.Join("storage", fileID)
	if _, err := os.Stat(targetDir); os.IsNotExist(err) {
		return os.ErrNotExist
	}

	if err := os.RemoveAll(targetDir); err != nil {
		return fmt.Errorf("failed to delete local storage directory: %w", err)
	}

	return nil
}
