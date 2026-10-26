package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/filegate"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/moul-dev/moul-dev/internal/storage"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

type UploadHandler struct {
	DB       *dbx.DB
	AdminKey string
	// Files tracks uploads and their references; nil serves every stored file (no access control).
	Files *filegate.Gate
}

func NewUploadHandler(dbConn *dbx.DB) *UploadHandler {
	return &UploadHandler{DB: dbConn}
}

// storageCSP keeps a served file from running script or reaching anything, even if a browser
// renders it as a document: it gets an opaque origin (no cookies, no storage of the API's origin).
const storageCSP = "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox"

// presignTTL is how long an S3 redirect issued by ServeStorage stays valid.
const presignTTL = 5 * time.Minute

// inlineExts are the stored extensions a browser may display inline; anything else is served as
// an attachment.
var inlineExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true, ".avif": true,
	".mp4": true, ".webm": true, ".mov": true, ".mp3": true, ".ogg": true, ".wav": true, ".m4a": true,
}

// activeExts are extensions browsers treat as documents or scripts; members may not upload them.
var activeExts = map[string]bool{
	".html": true, ".htm": true, ".xhtml": true, ".xht": true, ".shtml": true, ".mht": true, ".mhtml": true,
	".svg": true, ".svgz": true, ".xml": true, ".xsl": true, ".xslt": true,
	".js": true, ".mjs": true, ".css": true, ".swf": true,
}

// isActiveType reports whether a MIME type is a document or script type.
func isActiveType(contentType string) bool {
	base := strings.ToLower(strings.TrimSpace(strings.Split(contentType, ";")[0]))
	return strings.Contains(base, "html") || strings.Contains(base, "xml") || strings.Contains(base, "svg") ||
		strings.Contains(base, "javascript") || strings.Contains(base, "ecmascript") || base == "text/css"
}

// allowedUploadTypes reads the file_allowed_types setting: comma-separated MIME types or
// wildcards such as "image/*". Empty allows every type that is not active content.
func allowedUploadTypes(settings map[string]string) []string {
	var out []string
	for _, t := range strings.Split(settings["file_allowed_types"], ",") {
		if t = strings.ToLower(strings.TrimSpace(t)); t != "" {
			out = append(out, t)
		}
	}
	return out
}

func typeAllowed(sniffed string, allowed []string) bool {
	if len(allowed) == 0 {
		return true
	}
	base := strings.ToLower(strings.Split(sniffed, ";")[0])
	for _, a := range allowed {
		if a == "*" || a == base {
			return true
		}
		if prefix, ok := strings.CutSuffix(a, "/*"); ok && strings.HasPrefix(base, prefix+"/") {
			return true
		}
	}
	return false
}

// checkUploadType refuses a member upload whose stored extension, declared type or sniffed type
// is active content, or whose sniffed type is outside file_allowed_types.
func checkUploadType(filename, declared, sniffed string, allowed []string) error {
	ext := strings.ToLower(filepath.Ext(util.SlugifyFilename(filename)))
	if activeExts[ext] || isActiveType(declared) || isActiveType(sniffed) {
		return fmt.Errorf("this file type is not allowed")
	}
	if !typeAllowed(sniffed, allowed) {
		return fmt.Errorf("files of type %s are not allowed", strings.Split(sniffed, ";")[0])
	}
	return nil
}

// ServeStorage serves an uploaded file (or redirects to S3) when the caller may read it: a signed
// URL, the admin key or a root user, a file referenced by a record anyone may view, or a caller
// who uploaded the file or may view a record referencing it. Everything else, and every path that
// does not name an upload, answers like a missing file.
func (h *UploadHandler) ServeStorage(c *echo.Context) error {
	header := c.Response().Header()
	header.Set("X-Content-Type-Options", "nosniff")
	header.Set("Content-Security-Policy", storageCSP)

	notFound := echo.NewHTTPError(http.StatusNotFound, "File not found")
	path := filepath.ToSlash(filepath.Clean("/" + c.Param("*")))
	id, name, ok := strings.Cut(strings.TrimPrefix(path, "/"), "/")
	if !ok || !filegate.ValidID(id) || name == "" || strings.Contains(name, "/") {
		return notFound
	}

	allowed, public, err := h.fileAccess(c, id)
	if err != nil {
		logger.Error("Failed to resolve file access", "file", id, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	if !allowed {
		return notFound
	}
	if public {
		header.Set("Cache-Control", "public, max-age=300")
	} else {
		header.Set("Cache-Control", "private, max-age=3600")
	}

	ext := strings.ToLower(filepath.Ext(name))
	if !inlineExts[ext] {
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", name))
	}

	key := id + "/" + name
	settings, err := storage.GetSettings(h.DB)
	if err != nil {
		logger.Error("Failed to load storage settings", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	if storage.S3Enabled(settings) {
		location, err := storage.PresignGetURL(c.Request().Context(), h.DB, key, presignTTL)
		if err != nil {
			logger.Error("Failed to presign stored file", "file", key, "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}
		return c.Redirect(http.StatusFound, location)
	}

	localPath := filepath.Join("storage", id, name)
	if _, err := os.Stat(localPath); err != nil {
		return notFound
	}
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	header.Set(echo.HeaderContentType, contentType)
	return c.File(localPath)
}

// fileAccess decides whether the caller may read upload id, and whether the file is public.
func (h *UploadHandler) fileAccess(c *echo.Context, id string) (allowed bool, public bool, err error) {
	if h.Files == nil {
		return true, true, nil
	}
	if sig := c.QueryParam(filegate.SigParam); sig != "" && h.Files.Verify(id, sig) {
		return true, false, nil
	}
	if middleware.IsRootOrAdmin(c, h.AdminKey) {
		return true, false, nil
	}
	if h.Files.CachedPublic(id) {
		return true, true, nil
	}

	authUser := middleware.GetAuthRecord(c)
	ownerMoul, ownerID, found, err := h.Files.Uploader(id)
	if err != nil {
		return false, false, err
	}
	if !found {
		return false, false, nil
	}
	callerIsUploader := authUser != nil && ownerID != "" && authUser["id"] == ownerID && authUser["moul"] == ownerMoul

	refs, err := h.Files.Refs(id)
	if err != nil {
		return false, false, err
	}
	reqCtx := buildRequestContext(c, nil)
	callerMayView := false
	for _, ref := range refs {
		m, err := db.LoadMoulByName(h.DB, ref.Moul)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return false, false, err
		}
		var raw dbx.NullStringMap
		if err := h.DB.Select("*").From(m.Name).Where(dbx.HashExp{"id": ref.RecordID}).One(&raw); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return false, false, err
		}
		record := normalizeRecord(m, nullStringMapToMap(raw))
		if ok, err := rules.EvaluateRule(h.DB, m.Rules.ViewRule, nil, record, reqCtx); err == nil && ok {
			h.Files.RememberPublic(id)
			return true, true, nil
		}
		if authUser != nil && !callerMayView {
			if ok, err := rules.EvaluateRule(h.DB, m.Rules.ViewRule, authUser, record, reqCtx); err == nil && ok {
				callerMayView = true
			}
		}
	}
	return callerIsUploader || callerMayView, false, nil
}

// UploadFile handles receiving a file via multipart form and storing it. Members may not upload
// active content (HTML, SVG, XML, scripts) and are limited to file_allowed_types when it is set.
// The response URLs are signed so the uploader can preview the file before attaching it.
func (h *UploadHandler) UploadFile(c *echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing file in request body (form-data key: 'file')")
	}

	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to open uploaded file: "+err.Error())
	}
	defer src.Close()

	fileData, err := io.ReadAll(src)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read uploaded file: "+err.Error())
	}

	settings, err := storage.GetSettings(h.DB)
	if err != nil {
		logger.Error("Failed to load storage settings", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	// The stored type is what the bytes are, never what the client declared.
	sniffed := http.DetectContentType(fileData)
	isAdmin := middleware.IsRootOrAdmin(c, h.AdminKey)
	if !isAdmin {
		if err := checkUploadType(file.Filename, file.Header.Get("Content-Type"), sniffed, allowedUploadTypes(settings)); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
	}
	contentType := strings.TrimSpace(strings.Split(sniffed, ";")[0])

	info, err := storage.UploadFile(c.Request().Context(), h.DB, fileData, file.Filename, contentType)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Storage upload failed: "+err.Error())
	}

	// Every URL handed out goes through /storage, which enforces access (and presigns for S3).
	s3Prefix := storage.PublicURLPrefix(settings)
	info.URL = canonicalStorageURL(info.URL, s3Prefix)
	for size, u := range info.Thumbs {
		info.Thumbs[size] = canonicalStorageURL(u, s3Prefix)
	}

	if h.Files != nil {
		var ownerMoul, ownerID string
		if !middleware.CheckAdminKey(c, h.AdminKey) {
			if authUser := middleware.GetAuthRecord(c); authUser != nil {
				ownerMoul, _ = authUser["moul"].(string)
				ownerID, _ = authUser["id"].(string)
			}
		}
		if err := h.Files.RecordUpload(info.ID, ownerMoul, ownerID); err != nil {
			logger.Error("Failed to record upload owner", "file", info.ID, "err", err)
			if delErr := storage.DeleteFile(c.Request().Context(), h.DB, info.ID); delErr != nil {
				logger.Error("Failed to remove unrecorded upload", "file", info.ID, "err", delErr)
			}
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}
		sig := h.Files.Sign(info.ID)
		info.URL = withSignature(info.URL, sig)
		for size, u := range info.Thumbs {
			info.Thumbs[size] = withSignature(u, sig)
		}
	}

	// Respond with a JSON array as requested: [{"filename": "...", "url": "...", "thumbhash": "...", "thumbs": {"sm": "...", "md": "...", "lg": "..."}}]
	return c.JSON(http.StatusOK, []*storage.FileInfo{info})
}

// canonicalStorageURL rewrites an S3 object URL to its /storage path.
func canonicalStorageURL(u, s3Prefix string) string {
	if s3Prefix != "" && strings.HasPrefix(u, s3Prefix) {
		return "/storage/" + strings.TrimPrefix(u, s3Prefix)
	}
	return u
}

func withSignature(u, sig string) string {
	if sig == "" || !strings.HasPrefix(u, "/storage/") {
		return u
	}
	return u + "?" + filegate.SigParam + "=" + sig
}

// ListFiles handles retrieving all uploaded files.
func (h *UploadHandler) ListFiles(c *echo.Context) error {
	files, err := storage.ListFiles(c.Request().Context(), h.DB)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to list stored files: "+err.Error())
	}
	if files == nil {
		files = []*storage.FileInfo{}
	}

	// Admin previews load files through /storage like everyone else, so hand out signed URLs.
	settings, err := storage.GetSettings(h.DB)
	if err != nil {
		logger.Error("Failed to load storage settings", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	s3Prefix := storage.PublicURLPrefix(settings)
	for _, f := range files {
		sig := ""
		if h.Files != nil && filegate.ValidID(f.ID) {
			sig = h.Files.Sign(f.ID)
		}
		f.URL = withSignature(canonicalStorageURL(f.URL, s3Prefix), sig)
		for size, u := range f.Thumbs {
			f.Thumbs[size] = withSignature(canonicalStorageURL(u, s3Prefix), sig)
		}
	}
	return c.JSON(http.StatusOK, files)
}

// DeleteFile handles deleting an uploaded file and all its thumbnails/metadata by file ID or path.
func (h *UploadHandler) DeleteFile(c *echo.Context) error {
	target := c.Param("*")
	if target == "" {
		target = c.Param("file")
	}
	if target == "" {
		target = c.Param("key")
	}
	if target == "" {
		target = c.QueryParam("file")
	}
	if target == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing file identifier or key parameter")
	}

	err := storage.DeleteFile(c.Request().Context(), h.DB, target)
	if err != nil {
		if os.IsNotExist(err) {
			return echo.NewHTTPError(http.StatusNotFound, "File not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete file: "+err.Error())
	}

	fileID := storage.ExtractFileID(target)
	if h.Files != nil {
		if err := h.Files.ForgetUpload(fileID); err != nil {
			logger.Error("Failed to forget deleted upload", "file", fileID, "err", err)
		}
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "File deleted successfully",
		"id":      fileID,
	})
}
