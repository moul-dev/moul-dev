package handlers

import (
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
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
func (h *UploadHandler) UploadFile(c echo.Context) error {
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

	// Respond with a JSON array as requested: [{"filename": "...", "url": "...", "thumbhash": "...", "thumbs": {"256x256": "..."}}]
	return c.JSON(http.StatusOK, []*storage.FileInfo{info})
}
