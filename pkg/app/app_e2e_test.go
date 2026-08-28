package app

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gobuffalo/envy"
	"github.com/moul-dev/moul-dev/internal/worker"
)

func TestAppE2EFlow(t *testing.T) {
	jwtSecret := "test-jwt-secret-key-32-bytes-minimum!!"
	adminKey := "test-admin-key-1234"
	envy.Set("MOUL_JWT_SECRET", jwtSecret)
	envy.Set("MOUL_ADMIN_KEY", adminKey)

	mouldApp := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "test-e2e-1.0",
		JWTSecret: jwtSecret,
		AdminKey:  adminKey,
	})

	workerExecuted := false
	mouldApp.RegisterWorker("SendWelcomeEmail", func(ctx context.Context, job *worker.Job) error {
		workerExecuted = true
		return nil
	})

	if err := mouldApp.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	ts := httptest.NewServer(mouldApp.Router())
	defer ts.Close()

	client := ts.Client()

	// 1. Create 'users' auth moul
	usersMoulPayload := map[string]interface{}{
		"name": "users",
		"type": "auth",
		"rules": map[string]string{
			"listRule":   "",
			"viewRule":   "id = @request.auth.id",
			"createRule": "",
			"updateRule": "id = @request.auth.id",
			"deleteRule": "id = @request.auth.id",
		},
	}
	res := doJSON(t, client, "POST", ts.URL+"/api/moul", usersMoulPayload, map[string]string{
		"X-Admin-Key": adminKey,
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create users moul: status %d, body: %s", res.StatusCode, res.body)
	}

	// 2. Create 'posts' base moul
	postsMoulPayload := map[string]interface{}{
		"name": "posts",
		"type": "base",
		"fields": []map[string]interface{}{
			{"name": "title", "type": "text"},
			{"name": "body", "type": "text"},
			{"name": "author_id", "type": "text"},
		},
		"rules": map[string]string{
			"listRule":   "",
			"viewRule":   "",
			"createRule": "@request.auth.id != ''",
			"updateRule": "author_id = @request.auth.id",
			"deleteRule": "author_id = @request.auth.id",
		},
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul", postsMoulPayload, map[string]string{
		"X-Admin-Key": adminKey,
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create posts moul: status %d, body: %s", res.StatusCode, res.body)
	}

	// 3. Create 'bg_tasks' worker moul
	workerMoulPayload := map[string]interface{}{
		"name": "bg_tasks",
		"type": "worker",
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul", workerMoulPayload, map[string]string{
		"X-Admin-Key": adminKey,
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create bg_tasks worker moul: status %d, body: %s", res.StatusCode, res.body)
	}

	// 4. Create 'app_events' analytic moul
	analyticMoulPayload := map[string]interface{}{
		"name": "app_events",
		"type": "analytic",
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul", analyticMoulPayload, map[string]string{
		"X-Admin-Key": adminKey,
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create app_events analytic moul: status %d, body: %s", res.StatusCode, res.body)
	}

	// 5. Register new user
	userPayload := map[string]interface{}{
		"username":        "alice",
		"email":           "alice@example.com",
		"password":        "Password123!",
		"passwordConfirm": "Password123!",
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul/users/records", userPayload, nil)
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to register user: status %d, body: %s", res.StatusCode, res.body)
	}
	var userRecord map[string]interface{}
	_ = json.Unmarshal([]byte(res.body), &userRecord)
	userID, _ := userRecord["id"].(string)
	if userID == "" {
		t.Fatalf("Expected non-empty user ID in response: %s", res.body)
	}

	// 6. Login user to get JWT
	authPayload := map[string]interface{}{
		"identity": "alice@example.com",
		"password": "Password123!",
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul/users/auth-with-password", authPayload, nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Failed to authenticate user: status %d, body: %s", res.StatusCode, res.body)
	}
	var authResponse map[string]interface{}
	_ = json.Unmarshal([]byte(res.body), &authResponse)
	token, _ := authResponse["token"].(string)
	if token == "" {
		t.Fatalf("Expected non-empty JWT token in response: %s", res.body)
	}

	// 7. Unauthenticated post creation (must fail with 401/403)
	unauthPost := map[string]interface{}{
		"title":     "Unauthorized Post",
		"body":      "This should fail",
		"author_id": userID,
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul/posts/records", unauthPost, nil)
	if res.StatusCode != http.StatusUnauthorized && res.StatusCode != http.StatusForbidden {
		t.Errorf("Expected 401/403 for unauthenticated post creation, got %d", res.StatusCode)
	}

	// 8. Authenticated post creation (should succeed)
	authPost := map[string]interface{}{
		"title":     "Hello E2E Moul World",
		"body":      "End-to-end testing with in-process server is awesome.",
		"author_id": userID,
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul/posts/records", authPost, map[string]string{
		"Authorization": "Bearer " + token,
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to create post with auth: status %d, body: %s", res.StatusCode, res.body)
	}
	var postRecord map[string]interface{}
	_ = json.Unmarshal([]byte(res.body), &postRecord)
	postID, _ := postRecord["id"].(string)
	if postID == "" {
		t.Fatalf("Expected non-empty post ID in response: %s", res.body)
	}

	// 9. Update post with owner JWT (should succeed)
	updatePayload := map[string]interface{}{
		"title": "Updated Title By Owner",
	}
	res = doJSON(t, client, "PATCH", ts.URL+"/api/moul/posts/records/"+postID, updatePayload, map[string]string{
		"Authorization": "Bearer " + token,
	})
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Failed to update post as owner: status %d, body: %s", res.StatusCode, res.body)
	}

	// 10. List posts (public access allowed)
	res = doJSON(t, client, "GET", ts.URL+"/api/moul/posts/records", nil, nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Failed to list posts: status %d, body: %s", res.StatusCode, res.body)
	}

	// 11. Enqueue background worker job
	jobPayload := map[string]interface{}{
		"worker":   "SendWelcomeEmail",
		"args":     map[string]interface{}{"to": "alice@example.com", "name": "Alice"},
		"priority": 1,
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul/bg_tasks/records", jobPayload, nil)
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to enqueue worker job: status %d, body: %s", res.StatusCode, res.body)
	}

	// 12. Track analytic event
	eventPayload := map[string]interface{}{
		"name":         "test_event",
		"path":         "/dashboard",
		"landing_page": "https://moul.dev/dashboard",
	}
	res = doJSON(t, client, "POST", ts.URL+"/api/moul/app_events/records", eventPayload, map[string]string{
		"User-Agent": "Moul-E2E-Tester/1.0",
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		t.Fatalf("Failed to track event: status %d, body: %s", res.StatusCode, res.body)
	}

	// 13. Delete post as owner
	res = doJSON(t, client, "DELETE", ts.URL+"/api/moul/posts/records/"+postID, nil, map[string]string{
		"Authorization": "Bearer " + token,
	})
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusNoContent {
		t.Fatalf("Failed to delete post as owner: status %d, body: %s", res.StatusCode, res.body)
	}

	// Verify worker handler registration check
	h, ok := mouldApp.WorkerEngine().GetHandler("SendWelcomeEmail")
	if !ok {
		t.Errorf("Expected SendWelcomeEmail handler to be registered")
	} else {
		_ = h(context.Background(), &worker.Job{ID: "test-job", Worker: "SendWelcomeEmail"})
		if !workerExecuted {
			t.Errorf("Expected worker handler to execute")
		}
	}
}

type httpResponse struct {
	StatusCode int
	body       string
}

func doJSON(t *testing.T, client *http.Client, method, url string, body interface{}, headers map[string]string) httpResponse {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("Failed to marshal JSON payload: %v", err)
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		t.Fatalf("Failed to create HTTP request: %v", err)
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	res, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP request failed (%s %s): %v", method, url, err)
	}
	defer res.Body.Close()

	respBytes, _ := io.ReadAll(res.Body)
	return httpResponse{
		StatusCode: res.StatusCode,
		body:       string(respBytes),
	}
}
