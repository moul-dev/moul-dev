package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/moul-dev/moul-dev/db"
	"github.com/moul-dev/moul-dev/handlers"
	"github.com/moul-dev/moul-dev/middleware"
	"github.com/moul-dev/moul-dev/schema"

	"github.com/labstack/echo/v4"
)

func TestMoulAuthAndRecordCRUD(t *testing.T) {
	// 1. Setup in-memory SQLite DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// 2. Setup Echo router
	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	authHandler := handlers.NewAuthHandler(dbConn)

	// Register Routes
	e.POST("/api/mouls", moulHandler.CreateMoul)
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/mouls/:moulName/records", recordHandler.ListRecords)
	e.PATCH("/api/mouls/:moulName/records/:id", recordHandler.UpdateRecord)
	e.POST("/api/mouls/:moulName/auth-with-password", authHandler.AuthWithPassword)

	// Start test HTTP server
	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// --- STEP 1: Create 'users' Auth Moul ---
	createUsersPayload := schema.Moul{
		Name: "users",
		Type: "auth",
		Rules: schema.MoulRules{
			ListRule:   "",
			ViewRule:   "auth.id == id",
			CreateRule: "",
			UpdateRule: "auth.id == id",
			DeleteRule: "auth.id == id",
		},
	}
	resp := postJSON(t, client, server.URL+"/api/mouls", createUsersPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for users moul creation, got %d", resp.StatusCode)
	}

	// --- STEP 2: Create 'posts' Base Moul ---
	createPostsPayload := schema.Moul{
		Name: "posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "body", Type: "text"},
			{Name: "author_id", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule:   "",
			ViewRule:   "",
			CreateRule: "auth.id != nil",
			UpdateRule: "auth.id == author_id",
			DeleteRule: "auth.id == author_id",
		},
	}
	resp = postJSON(t, client, server.URL+"/api/mouls", createPostsPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for posts moul creation, got %d", resp.StatusCode)
	}

	// --- STEP 3: Register a User (User A) ---
	userAPayload := map[string]interface{}{
		"username":        "usera",
		"email":           "usera@example.com",
		"password":        "password123",
		"passwordConfirm": "password123",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", userAPayload, "")
	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Expected 201 Created for user registration, got %d. Body: %s", resp.StatusCode, string(body))
	}
	var userARecord map[string]interface{}
	parseJSON(t, resp, &userARecord)
	userAID := userARecord["id"].(string)

	// --- STEP 4: Authenticate User A ---
	loginAPayload := map[string]interface{}{
		"identity": "usera@example.com",
		"password": "password123",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", loginAPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for user login, got %d", resp.StatusCode)
	}
	var loginAResponse map[string]interface{}
	parseJSON(t, resp, &loginAResponse)
	userAToken := loginAResponse["token"].(string)

	// --- STEP 5: Create Post (No Authentication) -> Should Fail ---
	postPayload := map[string]interface{}{
		"title":     "My First Post",
		"body":      "Hello World!",
		"author_id": userAID,
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/posts/records", postPayload, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized for unauthenticated post creation, got %d", resp.StatusCode)
	}

	// --- STEP 6: Create Post (Authenticated as User A) -> Should Succeed ---
	resp = postJSON(t, client, server.URL+"/api/mouls/posts/records", postPayload, userAToken)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for authenticated post creation, got %d", resp.StatusCode)
	}
	var postRecord map[string]interface{}
	parseJSON(t, resp, &postRecord)
	postID := postRecord["id"].(string)

	// --- STEP 7: Register User B and Login ---
	userBPayload := map[string]interface{}{
		"username":        "userb",
		"email":           "userb@example.com",
		"password":        "password456",
		"passwordConfirm": "password456",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", userBPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for user B registration, got %d", resp.StatusCode)
	}
	var userBRecord map[string]interface{}
	parseJSON(t, resp, &userBRecord)

	loginBPayload := map[string]interface{}{
		"identity": "userb",
		"password": "password456",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", loginBPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for user B login, got %d", resp.StatusCode)
	}
	var loginBResponse map[string]interface{}
	parseJSON(t, resp, &loginBResponse)
	userBToken := loginBResponse["token"].(string)

	// --- STEP 8: User B attempts to edit User A's Post -> Should Fail (Forbidden) ---
	updatePayload := map[string]interface{}{
		"title": "Hacked Title",
	}
	resp = patchJSON(t, client, server.URL+"/api/mouls/posts/records/"+postID, updatePayload, userBToken)
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("Expected 403 Forbidden when User B tries to update User A's post, got %d", resp.StatusCode)
	}

	// --- STEP 9: User A edits their own Post -> Should Succeed ---
	updatePayloadSelf := map[string]interface{}{
		"title": "Updated Title",
	}
	resp = patchJSON(t, client, server.URL+"/api/mouls/posts/records/"+postID, updatePayloadSelf, userAToken)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK when User A updates their own post, got %d", resp.StatusCode)
	}
	var updatedPostRecord map[string]interface{}
	parseJSON(t, resp, &updatedPostRecord)
	if updatedPostRecord["title"] != "Updated Title" {
		t.Errorf("Expected updated title 'Updated Title', got %v", updatedPostRecord["title"])
	}
}

// Helpers for issuing JSON test requests

func postJSON(t *testing.T, client *http.Client, url string, data interface{}, token string) *http.Response {
	t.Helper()
	bodyBytes, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP request failed: %v", err)
	}
	return resp
}

func patchJSON(t *testing.T, client *http.Client, url string, data interface{}, token string) *http.Response {
	t.Helper()
	bodyBytes, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("Failed to marshal JSON payload: %v", err)
	}

	req, err := http.NewRequest("PATCH", url, bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP request failed: %v", err)
	}
	return resp
}

func parseJSON(t *testing.T, resp *http.Response, target interface{}) {
	t.Helper()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}
	resp.Body.Close()

	if err := json.Unmarshal(bodyBytes, target); err != nil {
		t.Fatalf("Failed to parse JSON response (body: %s): %v", string(bodyBytes), err)
	}
}

func TestMain(m *testing.M) {
	// Quiet logging for tests if needed
	code := m.Run()
	os.Exit(code)
}
