package handlers_test

import (
	"bytes"
	"encoding/json"
	"image"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestSettingsAndUploadFlow(t *testing.T) {
	// Initialize test secrets
	adminKey := "test-admin-secret-key"
	jwtSecret := "test-jwt-secret-key"
	auth.InitJWT(jwtSecret)

	// Setup memory db
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()
	defer os.RemoveAll("storage")

	// Setup Echo router
	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	settingsHandler := handlers.NewSettingsHandler(dbConn)
	uploadHandler := handlers.NewUploadHandler(dbConn)

	// Register Routes
	adminSettingsGroup := e.Group("/api/settings", middleware.RequireAdminKey(adminKey))
	adminSettingsGroup.GET("", settingsHandler.GetSettings)
	adminSettingsGroup.PATCH("", settingsHandler.UpdateSettings)

	e.POST("/api/upload", uploadHandler.UploadFile, middleware.RequireAuthOrAdmin(adminKey))
	e.POST("/api/moul", moulHandler.CreateMoul, middleware.RequireAdminKey(adminKey))
	e.POST("/api/moul/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:moulName/records/:id", recordHandler.GetRecord)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// --- 1. Test settings GET without admin key (Should fail) ---
	req, _ := http.NewRequest("GET", server.URL+"/api/settings", nil)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Settings GET failed: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthorized settings GET, got %d", resp.StatusCode)
	}

	// --- 2. Test settings GET with admin key (Should succeed) ---
	req, _ = http.NewRequest("GET", server.URL+"/api/settings", nil)
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Settings GET failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 for authorized settings GET, got %d", resp.StatusCode)
	}
	var settings map[string]string
	json.NewDecoder(resp.Body).Decode(&settings)
	resp.Body.Close()

	if settings["file_s3_enabled"] != "false" {
		t.Errorf("Expected default file_s3_enabled to be 'false', got %q", settings["file_s3_enabled"])
	}

	// --- 3. Test settings PATCH (Update settings) ---
	patchData, _ := json.Marshal(map[string]string{
		"file_s3_enabled": "true",
		"file_s3_bucket":  "my-bucket-name",
	})
	req, _ = http.NewRequest("PATCH", server.URL+"/api/settings", bytes.NewReader(patchData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Settings PATCH failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 for settings PATCH, got %d", resp.StatusCode)
	}
	json.NewDecoder(resp.Body).Decode(&settings)
	resp.Body.Close()

	if settings["file_s3_enabled"] != "true" || settings["file_s3_bucket"] != "my-bucket-name" {
		t.Errorf("Settings were not updated: %+v", settings)
	}

	// Revert file_s3_enabled to false for subsequent local storage tests
	patchData, _ = json.Marshal(map[string]string{"file_s3_enabled": "false"})
	req, _ = http.NewRequest("PATCH", server.URL+"/api/settings", bytes.NewReader(patchData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, _ = client.Do(req)
	resp.Body.Close()

	// --- 4. Test File Upload Auth Validation ---
	// A. Unauthorized (No header) -> Should fail 401
	req, _ = http.NewRequest("POST", server.URL+"/api/upload", nil)
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected upload without credentials to return 401, got %d", resp.StatusCode)
	}

	// B. Authorized via Admin Key -> Should succeed
	bodyBuf := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(bodyBuf)
	fileWriter, _ := bodyWriter.CreateFormFile("file", "test_doc.txt")
	fileWriter.Write([]byte("Some test text file data"))
	bodyWriter.Close()

	req, _ = http.NewRequest("POST", server.URL+"/api/upload", bodyBuf)
	req.Header.Set("Content-Type", bodyWriter.FormDataContentType())
	req.Header.Set("X-Admin-Key", adminKey)
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Upload request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected upload with admin key to return 200, got %d", resp.StatusCode)
	}
	var fileList []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&fileList)
	resp.Body.Close()

	if len(fileList) != 1 || fileList[0]["filename"] != "test_doc.txt" {
		t.Errorf("Unexpected upload response: %+v", fileList)
	}

	// C. Authorized via JWT User Token -> Should succeed
	token, err := auth.GenerateToken("user-123", "tester@test.com", "tester", "users")
	if err != nil {
		t.Fatalf("Failed to create JWT token: %v", err)
	}

	bodyBuf = &bytes.Buffer{}
	bodyWriter = multipart.NewWriter(bodyBuf)
	fileWriter, _ = bodyWriter.CreateFormFile("file", "image.png")
	// Make a valid 10x10 png image
	testImg := image.NewRGBA(image.Rect(0, 0, 10, 10))
	_ = png.Encode(fileWriter, testImg)
	bodyWriter.Close()

	req, _ = http.NewRequest("POST", server.URL+"/api/upload", bodyBuf)
	req.Header.Set("Content-Type", bodyWriter.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Upload request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected upload with JWT token to return 200, got %d", resp.StatusCode)
	}
	var imageList []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&imageList)
	resp.Body.Close()

	if len(imageList) != 1 || imageList[0]["filename"] != "image.png" {
		t.Fatalf("Unexpected upload response: %+v", imageList)
	}

	imageInfo := imageList[0]
	if _, ok := imageInfo["thumbhash"].(string); !ok {
		t.Errorf("Expected thumbhash to be returned for image file upload")
	}
	thumbs, ok := imageInfo["thumbs"].(map[string]interface{})
	if !ok || thumbs["sm"] == nil || thumbs["md"] == nil || thumbs["lg"] == nil {
		t.Errorf("Expected semantic sizes (sm, md, lg) in thumbs map, got: %v", thumbs)
	}

	// --- 5. Test File Type Field Schema Support & Serialization ---
	// Create a schema that contains a 'file' type field
	createMoulPayload := schema.Moul{
		Name: "attachments",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "files", Type: "file"},
		},
	}
	moulPayloadBytes, _ := json.Marshal(createMoulPayload)
	req, _ = http.NewRequest("POST", server.URL+"/api/moul", bytes.NewReader(moulPayloadBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", adminKey)
	resp, _ = client.Do(req)
	resp.Body.Close()

	// Insert a record into attachments containing the file list JSON
	recordPayload := map[string]interface{}{
		"title": "My Uploaded Images",
		"files": imageList, // Use the uploaded image list directly as field value
	}
	recordPayloadBytes, _ := json.Marshal(recordPayload)
	req, _ = http.NewRequest("POST", server.URL+"/api/moul/attachments/records", bytes.NewReader(recordPayloadBytes))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Record POST failed: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for record creation, got %d", resp.StatusCode)
	}
	var createdRecord map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&createdRecord)
	resp.Body.Close()

	// Verify field is correctly returned as a JSON structure, not a raw string
	filesVal, exists := createdRecord["files"]
	if !exists {
		t.Fatalf("Expected 'files' field in created record, got: %+v", createdRecord)
	}
	filesArray, ok := filesVal.([]interface{})
	if !ok || len(filesArray) != 1 {
		t.Fatalf("Expected 'files' field to be serialized back as a JSON array of length 1, got type %T: %v", filesVal, filesVal)
	}
	fileMeta := filesArray[0].(map[string]interface{})
	if fileMeta["filename"] != "image.png" || fileMeta["thumbhash"] == nil {
		t.Errorf("Unexpected file metadata in record: %v", fileMeta)
	}

	// Verify GET also returns correct JSON
	recordID := createdRecord["id"].(string)
	req, _ = http.NewRequest("GET", server.URL+"/api/moul/attachments/records/"+recordID, nil)
	resp, _ = client.Do(req)
	var retrievedRecord map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&retrievedRecord)
	resp.Body.Close()

	retrievedFilesArray, ok := retrievedRecord["files"].([]interface{})
	if !ok || len(retrievedFilesArray) != 1 {
		t.Fatalf("Expected retrieved 'files' field to be a JSON array, got: %v", retrievedRecord["files"])
	}
}
