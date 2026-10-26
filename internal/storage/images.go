package storage

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/draw"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/disintegration/imaging"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/pocketbase/dbx"
	"go.n16f.net/thumbhash"
)

// ErrImageTooLarge is returned for an image whose dimensions exceed MaxImagePixels. It is
// detected from the image header, before any pixel is decoded.
var ErrImageTooLarge = errors.New("image is too large to process")

// MaxImagePixels is the largest image (width × height) decoded for renditions. A decoded image
// takes about 4 bytes per pixel, so this bounds one decode at about 160 MB and refuses
// decompression bombs (a small file that declares huge dimensions).
const MaxImagePixels = 40_000_000

// resizeFilter is the filter used for renditions. Linear (with imaging's support scaled to the
// downscale factor) is visually indistinguishable from Lanczos at these sizes and, with each
// rendition cut from the next larger one, halves the resize and encode CPU of a 12 MP photo
// (BenchmarkResizeFilters).
var resizeFilter = imaging.Linear

// renditionSizes are the semantic sizes, largest first so each is cut from the previous one.
var renditionSizes = []struct {
	name string
	size int
}{
	{"lg", 2048},
	{"md", 1024},
	{"sm", 256},
}

var (
	imageSlotsOnce sync.Once
	imageSlots     chan struct{}
)

// imageConcurrency is how many images may be decoded and resized at once: MOUL_IMAGE_CONCURRENCY
// when set to a positive integer, otherwise max(1, NumCPU/2), so uploads cannot take every core
// and a burst cannot hold one decoded image per request in memory.
func imageConcurrency() int {
	if v := os.Getenv("MOUL_IMAGE_CONCURRENCY"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return n
		}
	}
	n := runtime.NumCPU() / 2
	if n < 1 {
		n = 1
	}
	return n
}

// acquireImageSlot waits for one of the image processing slots or for ctx to end.
func acquireImageSlot(ctx context.Context) (func(), error) {
	imageSlotsOnce.Do(func() {
		imageSlots = make(chan struct{}, imageConcurrency())
	})
	select {
	case imageSlots <- struct{}{}:
		return func() { <-imageSlots }, nil
	case <-ctx.Done():
		return nil, fmt.Errorf("waiting to process image: %w", ctx.Err())
	}
}

// imageDimensions reads an image's size from its header. ok is false when data is not an image
// format Moul can decode; ErrImageTooLarge is returned above MaxImagePixels.
func imageDimensions(data []byte) (width, height int, ok bool, err error) {
	cfg, _, decodeErr := image.DecodeConfig(bytes.NewReader(data))
	if decodeErr != nil {
		return 0, 0, false, nil
	}
	if cfg.Width <= 0 || cfg.Height <= 0 {
		return 0, 0, false, nil
	}
	if int64(cfg.Width)*int64(cfg.Height) > MaxImagePixels {
		return cfg.Width, cfg.Height, true, fmt.Errorf("%w: %dx%d exceeds %d pixels", ErrImageTooLarge, cfg.Width, cfg.Height, MaxImagePixels)
	}
	return cfg.Width, cfg.Height, true, nil
}

// rendition is one resized copy of an uploaded image.
type rendition struct {
	name        string // "sm", "md" or "lg"
	ext         string
	contentType string
	data        []byte
}

// renderedImage is the outcome of processing an uploaded image.
type renderedImage struct {
	thumbHash  string
	renditions []rendition // only sizes smaller than the original; the others use the original
}

// renditionFormat is the format renditions of an original with extension ext are written in.
func renditionFormat(ext string) (string, string, imaging.Format) {
	switch strings.ToLower(ext) {
	case ".png":
		return ".png", "image/png", imaging.PNG
	case ".gif":
		return ".gif", "image/gif", imaging.GIF
	default:
		return ".jpg", "image/jpeg", imaging.JPEG
	}
}

// renderImage decodes data once (inside an image processing slot) and produces its thumbhash and
// the renditions smaller than the original, each cut from the next larger one.
func renderImage(ctx context.Context, data []byte, ext string) (*renderedImage, error) {
	release, err := acquireImageSlot(ctx)
	if err != nil {
		return nil, err
	}
	defer release()

	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}
	bounds := img.Bounds()
	origW, origH := bounds.Dx(), bounds.Dy()
	targetExt, contentType, format := renditionFormat(ext)

	out := &renderedImage{}
	src := img
	for _, target := range renditionSizes {
		if origW <= target.size && origH <= target.size {
			continue
		}
		resized := imaging.Fit(src, target.size, target.size, resizeFilter)
		src = resized
		var buf bytes.Buffer
		if err := imaging.Encode(&buf, resized, format); err != nil {
			return nil, fmt.Errorf("failed to encode %s image: %w", target.name, err)
		}
		out.renditions = append(out.renditions, rendition{name: target.name, ext: targetExt, contentType: contentType, data: buf.Bytes()})
	}

	// The thumbhash is computed from the smallest image at hand rather than the original.
	small := imaging.Fit(src, 100, 100, resizeFilter)
	rgba := image.NewRGBA(small.Bounds())
	draw.Draw(rgba, rgba.Bounds(), small, small.Bounds().Min, draw.Src)
	out.thumbHash = base64.StdEncoding.EncodeToString(thumbhash.EncodeImage(rgba))
	return out, nil
}

// storeObject writes data under key, to S3 when s3Client is set or under ./storage otherwise,
// and returns its public URL.
func storeObject(ctx context.Context, settings map[string]string, s3Client *s3.Client, bucket, key string, data []byte, contentType string) (string, error) {
	if s3Client != nil {
		_, err := s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(bucket),
			Key:         aws.String(key),
			Body:        bytes.NewReader(data),
			ContentType: aws.String(contentType),
		})
		if err != nil {
			return "", fmt.Errorf("failed to upload %s to S3: %w", key, err)
		}
		return s3ObjectURL(settings, bucket, key), nil
	}
	path := filepath.Join("storage", key)
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return "", fmt.Errorf("failed to create local storage directory for %s: %w", key, err)
	}
	if err := os.WriteFile(path, data, 0644); err != nil {
		return "", fmt.Errorf("failed to save %s locally: %w", key, err)
	}
	return "/storage/" + key, nil
}

// readObject reads key from S3 when s3Client is set or from ./storage otherwise.
func readObject(ctx context.Context, s3Client *s3.Client, bucket, key string) ([]byte, error) {
	if s3Client != nil {
		out, err := s3Client.GetObject(ctx, &s3.GetObjectInput{Bucket: aws.String(bucket), Key: aws.String(key)})
		if err != nil {
			return nil, fmt.Errorf("failed to read %s from S3: %w", key, err)
		}
		defer out.Body.Close()
		data, err := io.ReadAll(out.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read %s from S3: %w", key, err)
		}
		return data, nil
	}
	data, err := os.ReadFile(filepath.Join("storage", key))
	if err != nil {
		return nil, fmt.Errorf("failed to read %s: %w", key, err)
	}
	return data, nil
}

// s3ObjectURL is the public URL of key in bucket, as UploadFile builds it.
func s3ObjectURL(settings map[string]string, bucket, key string) string {
	if endpoint := settings["file_s3_endpoint"]; endpoint != "" {
		return fmt.Sprintf("%s/%s/%s", strings.TrimSuffix(endpoint, "/"), bucket, key)
	}
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, settings["file_s3_region"], key)
}

// processImageUpload fills info's width, height, thumbhash and thumbs for an uploaded image whose
// original is stored at originalURL. With file_thumbs_async enabled and an enqueuer registered it
// returns pending=true and leaves every thumb pointing at the original: the caller queues the
// GenerateImageSizes job once meta.json is written (queueImageSizes). Otherwise the renditions are
// made now. Data that is not a decodable image gets no thumbs.
func processImageUpload(ctx context.Context, settings map[string]string, s3Client *s3.Client, bucket string, info *FileInfo, data []byte, ext, originalURL string) (pending bool, err error) {
	w, h, ok, err := imageDimensions(data)
	if err != nil {
		return false, err
	}
	if !ok {
		return false, nil
	}
	info.Width, info.Height = w, h
	info.Thumbs = map[string]string{"sm": originalURL, "md": originalURL, "lg": originalURL}

	if settings["file_thumbs_async"] == "true" && imageSizesEnqueuer() != nil {
		return true, nil
	}

	rendered, err := renderImage(ctx, data, ext)
	if err != nil {
		logger.Warn("Image renditions skipped", "file", info.ID, "err", err)
		return false, nil
	}
	return false, applyRenditions(ctx, settings, s3Client, bucket, info, rendered)
}

// queueImageSizes queues the GenerateImageSizes job of an upload whose meta.json is written. When
// queueing fails the renditions are made now instead, updating info and meta.json.
func queueImageSizes(ctx context.Context, settings map[string]string, s3Client *s3.Client, bucket string, info *FileInfo, data []byte, key string) {
	enqueue := imageSizesEnqueuer()
	if enqueue != nil {
		err := enqueue(ctx, info.ID, key)
		if err == nil {
			return
		}
		logger.Warn("Failed to queue GenerateImageSizes; generating sizes now", "file", info.ID, "err", err)
	}
	if err := generateImageSizes(ctx, settings, s3Client, bucket, info, data, key); err != nil {
		logger.Error("Failed to generate image sizes", "file", info.ID, "err", err)
	}
}

// applyRenditions stores the renditions and records them, and the thumbhash, on info.
func applyRenditions(ctx context.Context, settings map[string]string, s3Client *s3.Client, bucket string, info *FileInfo, rendered *renderedImage) error {
	info.ThumbHash = rendered.thumbHash
	for _, r := range rendered.renditions {
		url, err := storeObject(ctx, settings, s3Client, bucket, info.ID+"/"+r.name+r.ext, r.data, r.contentType)
		if err != nil {
			return fmt.Errorf("failed to store %s image: %w", r.name, err)
		}
		info.Thumbs[r.name] = url
	}
	return nil
}

var (
	imageSizesEnqueuerMu sync.RWMutex
	imageSizesEnqueuerFn func(ctx context.Context, fileID, key string) error
)

// SetImageSizesEnqueuer registers how UploadFile queues a GenerateImageSizes job when the
// file_thumbs_async setting is "true". Without one, renditions are always made during the upload.
func SetImageSizesEnqueuer(fn func(ctx context.Context, fileID, key string) error) {
	imageSizesEnqueuerMu.Lock()
	defer imageSizesEnqueuerMu.Unlock()
	imageSizesEnqueuerFn = fn
}

func imageSizesEnqueuer() func(ctx context.Context, fileID, key string) error {
	imageSizesEnqueuerMu.RLock()
	defer imageSizesEnqueuerMu.RUnlock()
	return imageSizesEnqueuerFn
}

// GenerateImageSizes makes the renditions and thumbhash of an uploaded image stored at key (the
// GenerateImageSizes job) and records them in the upload's meta.json.
func GenerateImageSizes(ctx context.Context, db *dbx.DB, fileID, key string) error {
	if fileID == "" || key == "" || !strings.HasPrefix(key, fileID+"/") || strings.Contains(key, "..") {
		return fmt.Errorf("invalid image key %q for file %q", key, fileID)
	}
	settings, err := GetSettings(db)
	if err != nil {
		return fmt.Errorf("failed to load settings: %w", err)
	}
	s3Client, bucket, err := getS3Client(ctx, settings)
	if err != nil {
		return err
	}

	data, err := readObject(ctx, s3Client, bucket, key)
	if err != nil {
		return err
	}
	metaKey := fileID + "/meta.json"
	metaData, err := readObject(ctx, s3Client, bucket, metaKey)
	if err != nil {
		return err
	}
	var info FileInfo
	if err := json.Unmarshal(metaData, &info); err != nil {
		return fmt.Errorf("failed to parse %s: %w", metaKey, err)
	}
	if info.ID == "" {
		info.ID = fileID
	}
	return generateImageSizes(ctx, settings, s3Client, bucket, &info, data, key)
}

// generateImageSizes renders the image data stored at key, stores its renditions, records them
// and the thumbhash on info and rewrites the upload's meta.json.
func generateImageSizes(ctx context.Context, settings map[string]string, s3Client *s3.Client, bucket string, info *FileInfo, data []byte, key string) error {
	w, h, ok, err := imageDimensions(data)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("%s is not a decodable image", key)
	}
	info.Width, info.Height = w, h
	if info.Thumbs == nil {
		info.Thumbs = map[string]string{}
	}
	rendered, err := renderImage(ctx, data, filepath.Ext(key))
	if err != nil {
		return err
	}
	if err := applyRenditions(ctx, settings, s3Client, bucket, info, rendered); err != nil {
		return err
	}

	metaKey := info.ID + "/meta.json"
	updated, err := json.Marshal(info)
	if err != nil {
		return fmt.Errorf("failed to encode %s: %w", metaKey, err)
	}
	if _, err := storeObject(ctx, settings, s3Client, bucket, metaKey, updated, "application/json"); err != nil {
		return err
	}
	return nil
}
