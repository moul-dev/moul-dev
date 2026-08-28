package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"

	"github.com/labstack/echo/v5"
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
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)
	e.POST("/api/moul/:name/auth-with-password", authHandler.AuthWithPassword)

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
			ViewRule:   "id = @request.auth.id",
			CreateRule: "",
			UpdateRule: "id = @request.auth.id",
			DeleteRule: "id = @request.auth.id",
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createUsersPayload, "")
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
			CreateRule: "@request.auth.id != ''",
			UpdateRule: "author_id = @request.auth.id",
			DeleteRule: "author_id = @request.auth.id",
		},
	}
	resp = postJSON(t, client, server.URL+"/api/moul", createPostsPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for posts moul creation, got %d", resp.StatusCode)
	}

	// --- STEP 3: Register a User (User A) ---
	userAPayload := map[string]interface{}{
		"username":        "usera",
		"email":           "usera@example.com",
		"password":        "Password1",
		"passwordConfirm": "Password1",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", userAPayload, "")
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
		"password": "Password1",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", loginAPayload, "")
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
	resp = postJSON(t, client, server.URL+"/api/moul/posts/records", postPayload, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized for unauthenticated post creation, got %d", resp.StatusCode)
	}

	// --- STEP 6: Create Post (Authenticated as User A) -> Should Succeed ---
	resp = postJSON(t, client, server.URL+"/api/moul/posts/records", postPayload, userAToken)
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
		"password":        "Password2",
		"passwordConfirm": "Password2",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", userBPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for user B registration, got %d", resp.StatusCode)
	}
	var userBRecord map[string]interface{}
	parseJSON(t, resp, &userBRecord)

	loginBPayload := map[string]interface{}{
		"identity": "userb",
		"password": "Password2",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", loginBPayload, "")
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
	resp = patchJSON(t, client, server.URL+"/api/moul/posts/records/"+postID, updatePayload, userBToken)
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("Expected 403 Forbidden when User B tries to update User A's post, got %d", resp.StatusCode)
	}

	// --- STEP 9: User A edits their own Post -> Should Succeed ---
	updatePayloadSelf := map[string]interface{}{
		"title": "Updated Title",
	}
	resp = patchJSON(t, client, server.URL+"/api/moul/posts/records/"+postID, updatePayloadSelf, userAToken)
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
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.GET("/api/moul", moulHandler.ListMoul)
	e.DELETE("/api/moul/:name", moulHandler.DeleteMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.GET("/api/moul/:name/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/moul/:name/records/:id", recordHandler.DeleteRecord)
	e.POST("/api/moul/:name/auth-with-password", authHandler.AuthWithPassword)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// --- 1. CreateMoul Edge Cases ---
	// Empty name
	resp := postJSON(t, client, server.URL+"/api/moul", map[string]interface{}{"name": ""}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for empty moul name, got %d", resp.StatusCode)
	}
	// Name starts with underscore
	resp = postJSON(t, client, server.URL+"/api/moul", map[string]interface{}{"name": "_test"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for name starting with underscore, got %d", resp.StatusCode)
	}
	// Invalid request body (bad JSON)
	req, _ := http.NewRequest("POST", server.URL+"/api/moul", bytes.NewReader([]byte("{invalid-json}")))
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
			ViewRule:   "id = @request.auth.id",
			CreateRule: "",
			UpdateRule: "id = @request.auth.id",
			DeleteRule: "id = @request.auth.id",
		},
	}
	postJSON(t, client, server.URL+"/api/moul", usersMoul, "")

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
			CreateRule: "@request.auth.id != ''",
			UpdateRule: "author_id = @request.auth.id",
			DeleteRule: "author_id = @request.auth.id",
		},
	}
	postJSON(t, client, server.URL+"/api/moul", postsMoul, "")

	// --- 2. ListMoul ---
	resp = getJSON(t, client, server.URL+"/api/moul", "")
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for ListMoul, got %d", resp.StatusCode)
	}
	var moulsList []interface{}
	parseJSON(t, resp, &moulsList)
	if len(moulsList) != 2 {
		t.Errorf("Expected 2 mouls in list, got %d", len(moulsList))
	}

	// --- 3. DeleteMoul Edge Cases ---
	// Delete nonexistent
	resp = deleteJSON(t, client, server.URL+"/api/moul/nonexistent", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for deleting nonexistent moul, got %d", resp.StatusCode)
	}
	// Success path: Create and delete dummy
	dummyMoul := schema.Moul{Name: "dummy"}
	postJSON(t, client, server.URL+"/api/moul", dummyMoul, "")
	resp = deleteJSON(t, client, server.URL+"/api/moul/dummy", "")
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("Expected 204 for successful moul deletion, got %d", resp.StatusCode)
	}

	// --- 4. AuthWithPassword Edge Cases ---
	// Not found
	resp = postJSON(t, client, server.URL+"/api/moul/nonexistent/auth-with-password", map[string]interface{}{"identity": "admin", "password": "123"}, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for auth-with-password on nonexistent moul, got %d", resp.StatusCode)
	}
	// Not auth moul
	resp = postJSON(t, client, server.URL+"/api/moul/posts/auth-with-password", map[string]interface{}{"identity": "admin", "password": "123"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for auth-with-password on non-auth moul, got %d", resp.StatusCode)
	}
	// Empty fields
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", map[string]interface{}{"identity": "", "password": ""}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for empty auth fields, got %d", resp.StatusCode)
	}
	// Invalid request body (bad JSON)
	req, _ = http.NewRequest("POST", server.URL+"/api/moul/users/auth-with-password", bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for bad JSON body on auth, got %d", resp.StatusCode)
	}

	// Register test user
	userPayload := map[string]interface{}{
		"username":        "testuser",
		"email":           "test@example.com",
		"password":        "CorrectPass1",
		"passwordConfirm": "CorrectPass1",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", userPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for test user registration, got %d", resp.StatusCode)
	}
	var userRec map[string]interface{}
	parseJSON(t, resp, &userRec)
	userID := userRec["id"].(string)

	// Auth with wrong credentials
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", map[string]interface{}{"identity": "nonexistent@example.com", "password": "CorrectPass1"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for wrong identity, got %d", resp.StatusCode)
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", map[string]interface{}{"identity": "testuser", "password": "wrong_pass"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for wrong password, got %d", resp.StatusCode)
	}

	// Auth success
	resp = postJSON(t, client, server.URL+"/api/moul/users/auth-with-password", map[string]interface{}{"identity": "testuser", "password": "CorrectPass1"}, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 for correct auth, got %d", resp.StatusCode)
	}
	var loginRes map[string]interface{}
	parseJSON(t, resp, &loginRes)
	token := loginRes["token"].(string)

	// Register another test user to test uniqueness constraints
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", userPayload, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for duplicate user registration, got %d", resp.StatusCode)
	}

	// --- 5. CreateRecord Edge Cases ---
	// Not found
	resp = postJSON(t, client, server.URL+"/api/moul/nonexistent/records", map[string]interface{}{}, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for CreateRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Invalid JSON
	req, _ = http.NewRequest("POST", server.URL+"/api/moul/posts/records", bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid JSON body on CreateRecord, got %d", resp.StatusCode)
	}
	// Auth collection: incomplete fields
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", map[string]interface{}{"username": "onlyname"}, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for incomplete auth record creation, got %d", resp.StatusCode)
	}
	// Auth collection: password mismatch
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", map[string]interface{}{
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
	resp = postJSON(t, client, server.URL+"/api/moul/posts/records", postPayload, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthenticated CreateRecord, got %d", resp.StatusCode)
	}

	// Create posts (authenticated)
	resp = postJSON(t, client, server.URL+"/api/moul/posts/records", postPayload, token)
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
	resp = postJSON(t, client, server.URL+"/api/moul/posts/records", expensivePayload, token)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for authenticated CreateRecord (Expensive Post), got %d", resp.StatusCode)
	}
	var expensivePost map[string]interface{}
	parseJSON(t, resp, &expensivePost)
	expensivePostID := expensivePost["id"].(string)

	// --- 6. ListRecords ---
	// Nonexistent moul
	resp = getJSON(t, client, server.URL+"/api/moul/nonexistent/records", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for ListRecords on nonexistent moul, got %d", resp.StatusCode)
	}

	// Get posts list (list rule is `price > 50`)
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for ListRecords, got %d", resp.StatusCode)
	}
	var postsResult struct {
		Page       int                      `json:"page"`
		PerPage    int                      `json:"perPage"`
		TotalItems int                      `json:"totalItems"`
		TotalPages int                      `json:"totalPages"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &postsResult)
	// Cheap Post (price 10) should be filtered out by list rule `price > 50`.
	// Expensive Post (price 100) should be included.
	if postsResult.TotalItems != 1 || len(postsResult.Items) != 1 {
		t.Errorf("Expected 1 post in list, got totalItems=%d, items len=%d", postsResult.TotalItems, len(postsResult.Items))
	} else if postsResult.Items[0]["id"] != expensivePostID {
		t.Errorf("Expected post ID %s, got %v", expensivePostID, postsResult.Items[0]["id"])
	}

	// --- 6b. Server-side Filtering, Sorting, and Pagination ---
	// Create another post matching ListRule (price > 50)
	midPostPayload := map[string]interface{}{
		"title":     "Mid Post",
		"price":     75,
		"active":    true,
		"tags":      []string{"mid"},
		"author_id": userID,
	}
	resp = postJSON(t, client, server.URL+"/api/moul/posts/records", midPostPayload, token)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for Mid Post creation, got %d", resp.StatusCode)
	}

	// Filter query param: filter="price >= 80"
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records?filter=price>=80", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for filtered ListRecords, got %d", resp.StatusCode)
	}
	var filteredRes struct {
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &filteredRes)
	if filteredRes.TotalItems != 1 || len(filteredRes.Items) != 1 || filteredRes.Items[0]["id"] != expensivePostID {
		t.Errorf("Expected expensive post only, got totalItems=%d", filteredRes.TotalItems)
	}

	// Sorting query param: sort="-price"
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records?sort=-price", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for sorted ListRecords, got %d", resp.StatusCode)
	}
	var sortedRes struct {
		Items []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &sortedRes)
	if len(sortedRes.Items) != 2 || sortedRes.Items[0]["id"] != expensivePostID {
		t.Errorf("Expected expensive post first when sorting by -price, got %v", sortedRes.Items)
	}

	// Pagination query param: page=1&perPage=1
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records?sort=-price&page=1&perPage=1", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for page 1, got %d", resp.StatusCode)
	}
	var page1Res struct {
		Page       int                      `json:"page"`
		PerPage    int                      `json:"perPage"`
		TotalItems int                      `json:"totalItems"`
		TotalPages int                      `json:"totalPages"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &page1Res)
	if page1Res.Page != 1 || page1Res.PerPage != 1 || page1Res.TotalItems != 2 || page1Res.TotalPages != 2 || len(page1Res.Items) != 1 {
		t.Errorf("Unexpected page 1 result: %+v", page1Res)
	}

	// Cursor-based pagination query param: after=<id>
	firstRecordID := page1Res.Items[0]["id"].(string)
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records?sort=-price&perPage=1&after="+firstRecordID, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for cursor pagination, got %d", resp.StatusCode)
	}
	var cursorRes struct {
		PerPage    int                      `json:"perPage"`
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &cursorRes)
	if len(cursorRes.Items) != 1 {
		t.Fatalf("Expected 1 item for cursor pagination, got %d", len(cursorRes.Items))
	}
	if cursorRes.Items[0]["id"] == firstRecordID {
		t.Errorf("Expected cursor pagination to return item after %s, but got the same item", firstRecordID)
	}
	if cursorRes.TotalItems != 2 {
		t.Errorf("Expected totalItems=2 for cursor query, got %d", cursorRes.TotalItems)
	}

	// Invalid filter field -> 400 Bad Request
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records?filter=nonexistent_col=1", "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for invalid filter field, got %d", resp.StatusCode)
	}

	// Invalid sort field -> 400 Bad Request
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records?sort=nonexistent_col", "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for invalid sort field, got %d", resp.StatusCode)
	}

	// --- 7. GetRecord Edge Cases ---
	// Not found
	resp = getJSON(t, client, server.URL+"/api/moul/nonexistent/records/1", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for GetRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Record not found
	resp = getJSON(t, client, server.URL+"/api/moul/posts/records/nonexistent", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent record, got %d", resp.StatusCode)
	}
	// Unauthorized: view other user's record (view rule `id = @request.auth.id`)
	resp = getJSON(t, client, server.URL+"/api/moul/users/records/"+userID, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthorized GetRecord, got %d", resp.StatusCode)
	}
	// Success (users record with auth token)
	resp = getJSON(t, client, server.URL+"/api/moul/users/records/"+userID, token)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 for authorized GetRecord, got %d", resp.StatusCode)
	}

	// --- 8. UpdateRecord Edge Cases ---
	// Not found
	resp = patchJSON(t, client, server.URL+"/api/moul/nonexistent/records/1", map[string]interface{}{}, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for UpdateRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Record not found
	resp = patchJSON(t, client, server.URL+"/api/moul/posts/records/nonexistent", map[string]interface{}{}, token)
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent record update, got %d", resp.StatusCode)
	}
	// Invalid request body (bad JSON)
	req, _ = http.NewRequest("PATCH", server.URL+"/api/moul/posts/records/"+cheapPostID, bytes.NewReader([]byte("{invalid-json}")))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ = client.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for bad JSON body on UpdateRecord, got %d", resp.StatusCode)
	}
	// Empty update parameters -> Success
	resp = patchJSON(t, client, server.URL+"/api/moul/posts/records/"+cheapPostID, map[string]interface{}{}, token)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for empty UpdateRecord, got %d", resp.StatusCode)
	}
	// Auth collection: password mismatch
	resp = patchJSON(t, client, server.URL+"/api/moul/users/records/"+userID, map[string]interface{}{
		"password":        "NewPass99",
		"passwordConfirm": "mismatchpass",
	}, token)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for password mismatch on user update, got %d", resp.StatusCode)
	}
	// Auth collection: valid password update
	resp = patchJSON(t, client, server.URL+"/api/moul/users/records/"+userID, map[string]interface{}{
		"password":        "NewPass99",
		"passwordConfirm": "NewPass99",
	}, token)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 for user password update, got %d", resp.StatusCode)
	}

	// --- 9. DeleteRecord Edge Cases ---
	// Not found
	resp = deleteJSON(t, client, server.URL+"/api/moul/nonexistent/records/1", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for DeleteRecord on nonexistent moul, got %d", resp.StatusCode)
	}
	// Record not found
	resp = deleteJSON(t, client, server.URL+"/api/moul/posts/records/nonexistent", token)
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 for nonexistent record delete, got %d", resp.StatusCode)
	}
	// Unauthorized: delete post without token (delete rule is `author_id = @request.auth.id`)
	resp = deleteJSON(t, client, server.URL+"/api/moul/posts/records/"+cheapPostID, "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthorized DeleteRecord, got %d", resp.StatusCode)
	}
	// Success delete
	resp = deleteJSON(t, client, server.URL+"/api/moul/posts/records/"+cheapPostID, token)
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

func TestMoulAssociations(t *testing.T) {
	// Initialize test db
	dbFile := filepath.Join(t.TempDir(), "moul-test-assoc.db")
	dbConn, err := db.InitDB(dbFile)
	if err != nil {
		t.Fatalf("Failed to init DB: %v", err)
	}
	defer dbConn.Close()

	// Handler setup
	recordHandler := handlers.NewRecordHandler(dbConn)
	moulHandler := &handlers.MoulHandler{DB: dbConn}

	e := echo.New()
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.GET("/api/moul/:name/records/:id", recordHandler.GetRecord)
	e.DELETE("/api/moul/:name/records/:id", recordHandler.DeleteRecord)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// 1. Create target collections: 'categories' and 'users'
	createCategoriesPayload := schema.Moul{
		Name: "categories",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createCategoriesPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for categories moul, got %d", resp.StatusCode)
	}

	createUsersPayload := schema.Moul{
		Name: "users",
		Type: "auth",
		Rules: schema.MoulRules{
			DeleteRule: "true",
		},
	}
	resp = postJSON(t, client, server.URL+"/api/moul", createUsersPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for users moul, got %d", resp.StatusCode)
	}

	// Create user record
	userPayload := map[string]interface{}{
		"username":        "john_assoc",
		"email":           "john@assoc.com",
		"password":        "Password1",
		"passwordConfirm": "Password1",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/users/records", userPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for user, got %d", resp.StatusCode)
	}
	var userRecord map[string]interface{}
	parseJSON(t, resp, &userRecord)
	userID := userRecord["id"].(string)

	// Create category record
	categoryPayload := map[string]interface{}{
		"name": "Electronics",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/categories/records", categoryPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for category, got %d", resp.StatusCode)
	}
	var categoryRecord map[string]interface{}
	parseJSON(t, resp, &categoryRecord)
	categoryID := categoryRecord["id"].(string)

	// 2. Create collection 'products' referencing 'categories' (1:N) and 'users' (M:N)
	createProductsPayload := schema.Moul{
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{
				Name: "category",
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  "categories",
					Cardinality: "1:N",
				},
			},
			{
				Name: "buyers",
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  "users",
					Cardinality: "M:N",
				},
			},
		},
	}
	resp = postJSON(t, client, server.URL+"/api/moul", createProductsPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for products moul, got %d", resp.StatusCode)
	}

	// 3. Test Creation Validation
	// Invalid category ID
	invalidProdPayload := map[string]interface{}{
		"title":    "Phone",
		"category": "nonexistent-id",
		"buyers":   []string{userID},
	}
	resp = postJSON(t, client, server.URL+"/api/moul/products/records", invalidProdPayload, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for invalid category ID, got %d", resp.StatusCode)
	}

	// Invalid buyer ID in array
	invalidProdPayload2 := map[string]interface{}{
		"title":    "Phone",
		"category": categoryID,
		"buyers":   []string{userID, "nonexistent-user"},
	}
	resp = postJSON(t, client, server.URL+"/api/moul/products/records", invalidProdPayload2, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for invalid buyer ID, got %d", resp.StatusCode)
	}

	// Valid payload
	validProdPayload := map[string]interface{}{
		"title":    "Phone",
		"category": categoryID,
		"buyers":   []string{userID},
	}
	resp = postJSON(t, client, server.URL+"/api/moul/products/records", validProdPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for valid product, got %d", resp.StatusCode)
	}
	var productRecord map[string]interface{}
	parseJSON(t, resp, &productRecord)
	productID := productRecord["id"].(string)

	// 4. Test Expansion
	// Retrieve product without expansion
	resp = getJSON(t, client, server.URL+"/api/moul/products/records/"+productID, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", resp.StatusCode)
	}
	var prod1 map[string]interface{}
	parseJSON(t, resp, &prod1)
	if _, expanded := prod1["expand"]; expanded {
		t.Fatal("Expected no 'expand' key when expand param is empty")
	}

	// Retrieve product with expansion
	resp = getJSON(t, client, server.URL+"/api/moul/products/records/"+productID+"?expand=category,buyers", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", resp.StatusCode)
	}
	var prodExpanded map[string]interface{}
	parseJSON(t, resp, &prodExpanded)

	expandMap, ok := prodExpanded["expand"].(map[string]interface{})
	if !ok {
		t.Fatal("Expected 'expand' key to be map[string]interface{}")
	}

	expandedCat, ok := expandMap["category"].(map[string]interface{})
	if !ok || expandedCat["name"] != "Electronics" {
		t.Fatalf("Expected expanded category with name 'Electronics', got %v", expandMap["category"])
	}

	expandedBuyers, ok := expandMap["buyers"].([]interface{})
	if !ok || len(expandedBuyers) != 1 {
		t.Fatalf("Expected expanded buyers list with 1 buyer, got %v", expandMap["buyers"])
	}
	firstBuyer := expandedBuyers[0].(map[string]interface{})
	if firstBuyer["username"] != "john_assoc" {
		t.Fatalf("Expected buyer username john_assoc, got %v", firstBuyer["username"])
	}

	// 5. Test automatic deletion cleanup (nullify / remove reference)
	// Delete category
	resp = deleteJSON(t, client, server.URL+"/api/moul/categories/records/"+categoryID, "")
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("Expected 204 No Content, got %d", resp.StatusCode)
	}

	// Verify category field in product is cleared
	resp = getJSON(t, client, server.URL+"/api/moul/products/records/"+productID, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", resp.StatusCode)
	}
	var prodCleared map[string]interface{}
	parseJSON(t, resp, &prodCleared)
	if catVal, _ := prodCleared["category"].(string); catVal != "" {
		t.Fatalf("Expected category to be cleared, got %q", catVal)
	}

	// Delete user
	resp = deleteJSON(t, client, server.URL+"/api/moul/users/records/"+userID, "")
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("Expected 204 No Content, got %d", resp.StatusCode)
	}

	// Verify buyers array in product is cleared (empty)
	resp = getJSON(t, client, server.URL+"/api/moul/products/records/"+productID, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", resp.StatusCode)
	}
	var prodBuyersCleared map[string]interface{}
	parseJSON(t, resp, &prodBuyersCleared)
	buyersSlice, ok := prodBuyersCleared["buyers"].([]interface{})
	if !ok || len(buyersSlice) != 0 {
		t.Fatalf("Expected buyers list to be empty, got %v", prodBuyersCleared["buyers"])
	}
}

func TestUpdateMoul(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init in-memory database: %v", err)
	}

	moulHandler := handlers.NewMoulHandler(dbConn)
	e := echo.New()
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.GET("/api/moul", moulHandler.ListMoul)
	e.PATCH("/api/moul/:name", moulHandler.UpdateMoul)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// 1. Create 'items' base collection
	createPayload := schema.Moul{
		Name: "items",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule: "",
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for CreateMoul, got %d", resp.StatusCode)
	}

	// 2. Update collection rules and add a new field 'price'
	updatePayload := schema.Moul{
		Name: "items",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "number"},
		},
		Rules: schema.MoulRules{
			ListRule: "price > 0",
		},
	}
	resp = patchJSON(t, client, server.URL+"/api/moul/items", updatePayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for UpdateMoul, got %d", resp.StatusCode)
	}
	var updated schema.Moul
	parseJSON(t, resp, &updated)
	if len(updated.Fields) != 2 || updated.Rules.ListRule != "price > 0" {
		t.Fatalf("Unexpected updated schema: %+v", updated)
	}

	// 3. Rename collection from 'items' to 'products'
	renamePayload := schema.Moul{
		Name:   "products",
		Type:   "base",
		Fields: updated.Fields,
		Rules:  updated.Rules,
	}
	resp = patchJSON(t, client, server.URL+"/api/moul/items", renamePayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for rename UpdateMoul, got %d", resp.StatusCode)
	}

	// Verify 'products' exists and 'items' is gone
	resp = getJSON(t, client, server.URL+"/api/moul", "")
	var moulsList []schema.Moul
	parseJSON(t, resp, &moulsList)
	foundProducts := false
	foundItems := false
	for _, m := range moulsList {
		if m.Name == "products" {
			foundProducts = true
		}
		if m.Name == "items" {
			foundItems = true
		}
	}
	if !foundProducts || foundItems {
		t.Fatalf("Expected products collection to exist and items to be renamed, got mouls: %+v", moulsList)
	}

	// 4. Update non-existent collection -> 404
	resp = patchJSON(t, client, server.URL+"/api/moul/nonexistent", updatePayload, "")
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("Expected 404 for updating non-existent moul, got %d", resp.StatusCode)
	}

	// 5. Update with invalid name -> 400
	invalidPayload := schema.Moul{Name: "_invalid"}
	resp = patchJSON(t, client, server.URL+"/api/moul/products", invalidPayload, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 for updating moul with invalid name, got %d", resp.StatusCode)
	}
}

func TestSelectFieldValidationAndCRUD(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// 1. Create collection with invalid select field (empty options) -> 400
	invalidMoul := schema.Moul{
		Name: "tasks",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "status", Type: "select", Options: []string{}},
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", invalidMoul, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 for select field with no options, got %d", resp.StatusCode)
	}

	// 2. Create collection with valid select field
	validMoul := schema.Moul{
		Name: "tasks",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "status", Type: "select", Options: []string{"todo", "in_progress", "done"}},
		},
	}
	resp = postJSON(t, client, server.URL+"/api/moul", validMoul, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for tasks moul creation, got %d", resp.StatusCode)
	}

	// 3. Create record with invalid select option -> 400
	invalidRec := map[string]interface{}{
		"title":  "Task 1",
		"status": "archived",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/tasks/records", invalidRec, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 for invalid select option, got %d", resp.StatusCode)
	}

	// 4. Create record with valid select option -> 201
	validRec := map[string]interface{}{
		"title":  "Task 1",
		"status": "in_progress",
	}
	resp = postJSON(t, client, server.URL+"/api/moul/tasks/records", validRec, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for valid select record creation, got %d", resp.StatusCode)
	}

	var created map[string]interface{}
	parseJSON(t, resp, &created)
	recID, ok := created["id"].(string)
	if !ok || recID == "" {
		t.Fatalf("Expected record ID string, got %+v", created["id"])
	}
	if created["status"] != "in_progress" {
		t.Fatalf("Expected status 'in_progress', got %v", created["status"])
	}

	// 5. Update record with invalid option -> 400
	invalidUpdate := map[string]interface{}{
		"status": "invalid_status",
	}
	resp = patchJSON(t, client, server.URL+"/api/moul/tasks/records/"+recID, invalidUpdate, "")
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 for invalid status update, got %d", resp.StatusCode)
	}

	// 6. Update record with valid option -> 200
	validUpdate := map[string]interface{}{
		"status": "done",
	}
	resp = patchJSON(t, client, server.URL+"/api/moul/tasks/records/"+recID, validUpdate, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 for valid status update, got %d", resp.StatusCode)
	}
	var updated map[string]interface{}
	parseJSON(t, resp, &updated)
	if updated["status"] != "done" {
		t.Fatalf("Expected status 'done', got %v", updated["status"])
	}
}

func TestMoulCreatedAtAndUpdateAt(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	analyticsEngine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("Failed to initialize analytics engine: %v", err)
	}
	defer analyticsEngine.Close()

	e := echo.New()
	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	recordHandler.AnalyticsEngine = analyticsEngine

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.PUT("/api/moul/:name", moulHandler.UpdateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// 1. Create a base collection
	m := schema.Moul{
		Name: "articles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
		},
	}
	bodyBytes, _ := json.Marshal(m)
	resp, err := client.Post(server.URL+"/api/moul", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create collection: %v, status: %d", err, resp.StatusCode)
	}
	var createdMoul schema.Moul
	parseJSON(t, resp, &createdMoul)
	if createdMoul.CreatedAt == "" || createdMoul.UpdatedAt == "" {
		t.Fatalf("Expected created_at and updated_at to be populated, got created_at=%q, updated_at=%q", createdMoul.CreatedAt, createdMoul.UpdatedAt)
	}

	// 2. Update collection schema
	m.Fields = append(m.Fields, schema.MoulField{Name: "summary", Type: "text"})
	bodyBytes, _ = json.Marshal(m)
	req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/moul/articles", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("Failed to update collection: %v, status: %d", err, resp.StatusCode)
	}
	var updatedMoul schema.Moul
	parseJSON(t, resp, &updatedMoul)
	if updatedMoul.CreatedAt != createdMoul.CreatedAt {
		t.Fatalf("Expected created_at to be preserved (%q), got %q", createdMoul.CreatedAt, updatedMoul.CreatedAt)
	}
	if updatedMoul.UpdatedAt == "" {
		t.Fatalf("Expected updated_at to be set on update")
	}

	// 3. Create a record in worker and analytic collections to ensure created_at/updated_at columns work
	workerMoul := schema.Moul{Name: "jobs", Type: "worker"}
	bodyBytes, _ = json.Marshal(workerMoul)
	resp, err = client.Post(server.URL+"/api/moul", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create worker collection: %v, status: %d", err, resp.StatusCode)
	}

	jobRecord := map[string]interface{}{"worker": "email_worker"}
	bodyBytes, _ = json.Marshal(jobRecord)
	resp, err = client.Post(server.URL+"/api/moul/jobs/records", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create record in worker collection: %v, status: %d", err, resp.StatusCode)
	}
	var createdJob map[string]interface{}
	parseJSON(t, resp, &createdJob)
	if createdJob["created_at"] == nil || createdJob["updated_at"] == nil {
		t.Fatalf("Expected created_at and updated_at on worker record, got %+v", createdJob)
	}

	analyticMoul := schema.Moul{Name: "page_views", Type: "analytic"}
	bodyBytes, _ = json.Marshal(analyticMoul)
	resp, err = client.Post(server.URL+"/api/moul", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create analytic collection: %v, status: %d", err, resp.StatusCode)
	}

	eventRecord := map[string]interface{}{
		"visit_token":   "vt-123",
		"visitor_token": "vtr-123",
		"name":          "pageview",
		"time":          "2026-08-03T12:00:00Z",
	}
	bodyBytes, _ = json.Marshal(eventRecord)
	resp, err = client.Post(server.URL+"/api/moul/page_views/records", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || resp.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create record in analytic collection: %v, status: %d", err, resp.StatusCode)
	}
	var createdEvent map[string]interface{}
	parseJSON(t, resp, &createdEvent)
	if createdEvent["created_at"] == nil || createdEvent["updated_at"] == nil {
		t.Fatalf("Expected created_at and updated_at on analytic record, got %+v", createdEvent)
	}
}

func TestGetMoulHandler(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	e := echo.New()
	moulHandler := handlers.NewMoulHandler(dbConn)
	e.POST("/api/moul", moulHandler.CreateMoul)
	e.GET("/api/moul/:name", moulHandler.GetMoul)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// 1. Create a moul
	createPayload := schema.Moul{
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", createPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for moul creation, got %d", resp.StatusCode)
	}

	// 2. GET /api/moul/products
	resp = getJSON(t, client, server.URL+"/api/moul/products", "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for GetMoul, got %d", resp.StatusCode)
	}

	var fetched schema.Moul
	parseJSON(t, resp, &fetched)
	if fetched.Name != "products" || fetched.Type != "base" {
		t.Errorf("Unexpected moul retrieved: %+v", fetched)
	}

	// 3. GET non-existent moul
	resp = getJSON(t, client, server.URL+"/api/moul/non_existent", "")
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected 404 Not Found for missing moul, got %d", resp.StatusCode)
	}
}

func TestListRecordsAdminKeyBypassAndSearch(t *testing.T) {
	testAdminKey := "master-admin-key-123"
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn, testAdminKey)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.GET("/api/moul/:name/records/:id", recordHandler.GetRecord)

	server := httptest.NewServer(e)
	defer server.Close()
	client := server.Client()

	// 1. Create auth collection 'users' with default list rule 'id = @request.auth.id'
	usersPayload := schema.Moul{
		Name: "users",
		Type: "auth",
		Rules: schema.MoulRules{
			ListRule: "id = @request.auth.id",
			ViewRule: "id = @request.auth.id",
		},
	}
	resp := postJSON(t, client, server.URL+"/api/moul", usersPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for users moul, got %d", resp.StatusCode)
	}

	// 2. Insert 3 user records
	users := []map[string]interface{}{
		{"username": "alice", "email": "alice@moul.dev", "password": "Password123!", "passwordConfirm": "Password123!"},
		{"username": "bob", "email": "bob@moul.dev", "password": "Password123!", "passwordConfirm": "Password123!"},
		{"username": "charlie", "email": "charlie@moul.dev", "password": "Password123!", "passwordConfirm": "Password123!"},
	}
	var createdIDs []string
	for _, u := range users {
		r := postJSON(t, client, server.URL+"/api/moul/users/records", u, "")
		if r.StatusCode != http.StatusCreated {
			t.Fatalf("Expected 201 for user %v, got %d", u["username"], r.StatusCode)
		}
		var rec map[string]interface{}
		parseJSON(t, r, &rec)
		createdIDs = append(createdIDs, rec["id"].(string))
	}

	// 3. Public GET /api/moul/users/records (no admin key or auth) -> matches listRule 'id = @request.auth.id' against empty auth -> returns 0 items
	req, _ := http.NewRequest("GET", server.URL+"/api/moul/users/records", nil)
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	var unauthResult struct {
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &unauthResult)
	if unauthResult.TotalItems != 0 || len(unauthResult.Items) != 0 {
		t.Errorf("Expected 0 items for unauthenticated request on auth moul, got totalItems=%d, items len=%d", unauthResult.TotalItems, len(unauthResult.Items))
	}

	// 4. Admin GET /api/moul/users/records with X-Admin-Key -> bypasses listRule -> returns all 3 records
	adminReq, _ := http.NewRequest("GET", server.URL+"/api/moul/users/records", nil)
	adminReq.Header.Set("X-Admin-Key", testAdminKey)
	resp, err = client.Do(adminReq)
	if err != nil {
		t.Fatalf("Admin request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for admin records list, got %d", resp.StatusCode)
	}
	var adminResult struct {
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &adminResult)
	if adminResult.TotalItems != 3 || len(adminResult.Items) != 3 {
		t.Errorf("Expected 3 items for admin request on auth moul, got totalItems=%d, items len=%d", adminResult.TotalItems, len(adminResult.Items))
	}

	// 5. Admin search query ?search=alice with X-Admin-Key -> returns 1 record
	searchReq, _ := http.NewRequest("GET", server.URL+"/api/moul/users/records?search=alice", nil)
	searchReq.Header.Set("X-Admin-Key", testAdminKey)
	resp, err = client.Do(searchReq)
	if err != nil {
		t.Fatalf("Search request failed: %v", err)
	}
	var searchResult struct {
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	parseJSON(t, resp, &searchResult)
	if searchResult.TotalItems != 1 || len(searchResult.Items) != 1 || searchResult.Items[0]["username"] != "alice" {
		t.Errorf("Expected alice record for search, got totalItems=%d, items=%v", searchResult.TotalItems, searchResult.Items)
	}

	// 6. Admin GET /api/moul/users/records/:id with X-Admin-Key -> returns the record
	getReq, _ := http.NewRequest("GET", server.URL+"/api/moul/users/records/"+createdIDs[0], nil)
	getReq.Header.Set("X-Admin-Key", testAdminKey)
	resp, err = client.Do(getReq)
	if err != nil {
		t.Fatalf("Admin GetRecord request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for admin GetRecord, got %d", resp.StatusCode)
	}
	var singleRec map[string]interface{}
	parseJSON(t, resp, &singleRec)
	if singleRec["id"] != createdIDs[0] || singleRec["username"] != "alice" {
		t.Errorf("Unexpected single record: %v", singleRec)
	}
}

func TestMain(m *testing.M) {
	// Initialize JWT for all handler tests
	auth.InitJWT("test-secret-key-for-unit-tests-1234")

	// Quiet logging for tests if needed
	code := m.Run()
	os.Exit(code)
}
