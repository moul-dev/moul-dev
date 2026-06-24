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

func TestHandlersEdgeCases(t *testing.T) {
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

	// Register all routes
	e.POST("/api/mouls", moulHandler.CreateMoul)
	e.GET("/api/mouls", moulHandler.ListMouls)
	e.DELETE("/api/mouls/:name", moulHandler.DeleteMoul)
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/mouls/:moulName/records", recordHandler.ListRecords)
	e.GET("/api/mouls/:moulName/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/mouls/:moulName/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/mouls/:moulName/records/:id", recordHandler.DeleteRecord)
	e.POST("/api/mouls/:moulName/auth-with-password", authHandler.AuthWithPassword)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// --- 1. CreateMoul Edge Cases ---
	// Empty name
	resp := postJSON(t, client, server.URL+"/api/mouls", map[string]interface{}{"name": ""}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for empty moul name, got %d", resp.StatusCode)
	}
	// Name starts with underscore
	resp = postJSON(t, client, server.URL+"/api/mouls", map[string]interface{}{"name": "_test"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for name starting with underscore, got %d", resp.StatusCode)
	}
	// Invalid request body (bad JSON)
	req, _ := http.NewRequest("POST", server.URL+"/api/mouls", bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid JSON body, got %d", resp.StatusCode)
	}

	// Create valid base & auth mouls for subsequent tests
	usersMoul := schema.Moul{
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
	postJSON(t, client, server.URL+"/api/mouls", usersMoul, "")

	postsMoul := schema.Moul{
		Name: "posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "number"},
			{Name: "active", Type: "bool"},
			{Name: "tags", Type: "json"},
			{Name: "author_id", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule:   "price > 50",
			ViewRule:   "",
			CreateRule: "auth.id != nil",
			UpdateRule: "auth.id == author_id",
			DeleteRule: "auth.id == author_id",
		},
	}
	postJSON(t, client, server.URL+"/api/mouls", postsMoul, "")

	// --- 2. ListMouls ---
	resp = getJSON(t, client, server.URL+"/api/mouls", "")
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for ListMouls, got %d", resp.StatusCode)
	}
	var moulsList []interface{}
	parseJSON(t, resp, &moulsList)
	if len(moulsList) != 2 {
		t.Errorf("Expected 2 mouls in list, got %d", len(moulsList))
	}

	// --- 3. DeleteMoul Edge Cases ---
	// Delete nonexistent
	resp = deleteJSON(t, client, server.URL+"/api/mouls/nonexistent", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for deleting nonexistent moul, got %d", resp.StatusCode)
	}
	// Success path: Create and delete dummy
	dummyMoul := schema.Moul{Name: "dummy"}
	postJSON(t, client, server.URL+"/api/mouls", dummyMoul, "")
	resp = deleteJSON(t, client, server.URL+"/api/mouls/dummy", "")
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("Expected 204 for successful moul deletion, got %d", resp.StatusCode)
	}

	// --- 4. AuthWithPassword Edge Cases ---
	// Moul not found
	resp = postJSON(t, client, server.URL+"/api/mouls/nonexistent/auth-with-password", map[string]interface{}{"identity": "admin", "password": "123"}, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for auth-with-password on nonexistent moul, got %d", resp.StatusCode)
	}
	// Not auth moul
	resp = postJSON(t, client, server.URL+"/api/mouls/posts/auth-with-password", map[string]interface{}{"identity": "admin", "password": "123"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for auth-with-password on non-auth moul, got %d", resp.StatusCode)
	}
	// Empty fields
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", map[string]interface{}{"identity": "", "password": ""}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for empty auth fields, got %d", resp.StatusCode)
	}
	// Invalid request body (bad JSON)
	req, _ = http.NewRequest("POST", server.URL+"/api/mouls/users/auth-with-password", bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for bad JSON body on auth, got %d", resp.StatusCode)
	}

	// Register test user
	userPayload := map[string]interface{}{
		"username":        "testuser",
		"email":           "test@example.com",
		"password":        "correct_pass",
		"passwordConfirm": "correct_pass",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", userPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for test user registration, got %d", resp.StatusCode)
	}
	var userRec map[string]interface{}
	parseJSON(t, resp, &userRec)
	userID := userRec["id"].(string)

	// Auth with wrong credentials
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", map[string]interface{}{"identity": "nonexistent@example.com", "password": "correct_pass"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for wrong identity, got %d", resp.StatusCode)
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", map[string]interface{}{"identity": "testuser", "password": "wrong_pass"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for wrong password, got %d", resp.StatusCode)
	}

	// Auth success
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", map[string]interface{}{"identity": "testuser", "password": "correct_pass"}, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 for correct auth, got %d", resp.StatusCode)
	}
	var loginRes map[string]interface{}
	parseJSON(t, resp, &loginRes)
	token := loginRes["token"].(string)

	// Register another test user to test uniqueness constraints
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", userPayload, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for duplicate user registration, got %d", resp.StatusCode)
	}

	// --- 5. CreateRecord Edge Cases ---
	// Moul not found
	resp = postJSON(t, client, server.URL+"/api/mouls/nonexistent/records", map[string]interface{}{}, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for CreateRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Invalid JSON
	req, _ = http.NewRequest("POST", server.URL+"/api/mouls/posts/records", bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid JSON body on CreateRecord, got %d", resp.StatusCode)
	}
	// Auth collection: incomplete fields
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", map[string]interface{}{"username": "onlyname"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for incomplete auth record creation, got %d", resp.StatusCode)
	}
	// Auth collection: password mismatch
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", map[string]interface{}{
		"username":        "user2",
		"email":           "user2@e.com",
		"password":        "pass1",
		"passwordConfirm": "pass2",
	}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for password mismatch on auth record creation, got %d", resp.StatusCode)
	}

	// Create post (no auth) -> 401
	postPayload := map[string]interface{}{
		"title":     "Cheap Post",
		"price":     10,
		"active":    true,
		"tags":      []string{"low", "price"},
		"author_id": userID,
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/posts/records", postPayload, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthenticated CreateRecord, got %d", resp.StatusCode)
	}

	// Create posts (authenticated)
	resp = postJSON(t, client, server.URL+"/api/mouls/posts/records", postPayload, token)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for authenticated CreateRecord (Cheap Post), got %d", resp.StatusCode)
	}
	var cheapPost map[string]interface{}
	parseJSON(t, resp, &cheapPost)
	cheapPostID := cheapPost["id"].(string)

	expensivePayload := map[string]interface{}{
		"title":     "Expensive Post",
		"price":     100,
		"active":    false,
		"tags":      []string{"high", "value"},
		"author_id": userID,
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/posts/records", expensivePayload, token)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for authenticated CreateRecord (Expensive Post), got %d", resp.StatusCode)
	}
	var expensivePost map[string]interface{}
	parseJSON(t, resp, &expensivePost)
	expensivePostID := expensivePost["id"].(string)

	// --- 6. ListRecords ---
	// Nonexistent moul
	resp = getJSON(t, client, server.URL+"/api/mouls/nonexistent/records", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for ListRecords on nonexistent moul, got %d", resp.StatusCode)
	}

	// Get posts list (list rule is `price > 50`)
	resp = getJSON(t, client, server.URL+"/api/mouls/posts/records", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for ListRecords, got %d", resp.StatusCode)
	}
	var postsList []map[string]interface{}
	parseJSON(t, resp, &postsList)
	// Cheap Post (price 10) should be filtered out by list rule `price > 50`.
	// Expensive Post (price 100) should be included.
	if len(postsList) != 1 {
		t.Errorf("Expected 1 post in list, got %d. List: %v", len(postsList), postsList)
	} else if postsList[0]["id"] != expensivePostID {
		t.Errorf("Expected post ID %s, got %v", expensivePostID, postsList[0]["id"])
	}

	// --- 7. GetRecord Edge Cases ---
	// Moul not found
	resp = getJSON(t, client, server.URL+"/api/mouls/nonexistent/records/1", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for GetRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Record not found
	resp = getJSON(t, client, server.URL+"/api/mouls/posts/records/nonexistent", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent record, got %d", resp.StatusCode)
	}
	// Unauthorized: view other user's record (view rule `auth.id == id`)
	resp = getJSON(t, client, server.URL+"/api/mouls/users/records/"+userID, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthorized GetRecord, got %d", resp.StatusCode)
	}
	// Success (users record with auth token)
	resp = getJSON(t, client, server.URL+"/api/mouls/users/records/"+userID, token)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 for authorized GetRecord, got %d", resp.StatusCode)
	}

	// --- 8. UpdateRecord Edge Cases ---
	// Moul not found
	resp = patchJSON(t, client, server.URL+"/api/mouls/nonexistent/records/1", map[string]interface{}{}, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for UpdateRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Record not found
	resp = patchJSON(t, client, server.URL+"/api/mouls/posts/records/nonexistent", map[string]interface{}{}, token)
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent record update, got %d", resp.StatusCode)
	}
	// Invalid request body (bad JSON)
	req, _ = http.NewRequest("PATCH", server.URL+"/api/mouls/posts/records/"+cheapPostID, bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for bad JSON body on UpdateRecord, got %d", resp.StatusCode)
	}
	// Empty update parameters -> Success
	resp = patchJSON(t, client, server.URL+"/api/mouls/posts/records/"+cheapPostID, map[string]interface{}{}, token)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for empty UpdateRecord, got %d", resp.StatusCode)
	}
	// Auth collection: password mismatch
	resp = patchJSON(t, client, server.URL+"/api/mouls/users/records/"+userID, map[string]interface{}{
		"password":        "newpass",
		"passwordConfirm": "mismatchpass",
	}, token)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for password mismatch on user update, got %d", resp.StatusCode)
	}
	// Auth collection: valid password update
	resp = patchJSON(t, client, server.URL+"/api/mouls/users/records/"+userID, map[string]interface{}{
		"password":        "newpass",
		"passwordConfirm": "newpass",
	}, token)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 for user password update, got %d", resp.StatusCode)
	}

	// --- 9. DeleteRecord Edge Cases ---
	// Moul not found
	resp = deleteJSON(t, client, server.URL+"/api/mouls/nonexistent/records/1", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for DeleteRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Record not found
	resp = deleteJSON(t, client, server.URL+"/api/mouls/posts/records/nonexistent", token)
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent record delete, got %d", resp.StatusCode)
	}
	// Unauthorized: delete post without token (delete rule is `auth.id == author_id`)
	resp = deleteJSON(t, client, server.URL+"/api/mouls/posts/records/"+cheapPostID, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthorized DeleteRecord, got %d", resp.StatusCode)
	}
	// Success delete
	resp = deleteJSON(t, client, server.URL+"/api/mouls/posts/records/"+cheapPostID, token)
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("Expected 204 for successful DeleteRecord, got %d", resp.StatusCode)
	}
}

// Helpers for issuing JSON test requests

func getJSON(t *testing.T, client *http.Client, url string, token string) *http.Response {
	t.Helper()
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		t.Fatalf("Failed to create GET request: %v", err)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("GET request failed: %v", err)
	}
	return resp
}

func deleteJSON(t *testing.T, client *http.Client, url string, token string) *http.Response {
	t.Helper()
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		t.Fatalf("Failed to create DELETE request: %v", err)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("DELETE request failed: %v", err)
	}
	return resp
}

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
