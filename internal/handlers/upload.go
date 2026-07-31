package handlers

import (
	"io"
	"net/http"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/storage"
	"github.com/pocketbase/dbx"
)

type UploadHandler struct {
	DB *dbx.DB
}

func NewUploadHandler(dbConn *dbx.DB) *UploadHandler {
	return &UploadHandler{DB: dbConn}
}

// UploadFile handles receiving a file via multipart form and storing it.
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

	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	info, err := storage.UploadFile(c.Request().Context(), h.DB, fileData, file.Filename, contentType)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Storage upload failed: "+err.Error())
	}

	// Respond with a JSON array as requested: [{"filename": "...", "url": "...", "thumbhash": "...", "thumbs": {"sm": "...", "md": "...", "lg": "..."}}]
	return c.JSON(http.StatusOK, []*storage.FileInfo{info})
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

	return c.JSON(http.StatusOK, map[string]string{
		"message": "File deleted successfully",
		"id":      storage.ExtractFileID(target),
	})
}
