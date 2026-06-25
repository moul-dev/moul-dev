package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"

	"github.com/labstack/echo/v4"
)

func TestAnalyticsHTTPFlow(t *testing.T) {
	// 1. Setup in-memory SQLite DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	// 2. Setup Analytics Engine
	analyticsEngine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("Failed to initialize analytics engine: %v", err)
	}
	defer analyticsEngine.Close()

	// 3. Setup Echo router
	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)
	recordHandler.AnalyticsEngine = analyticsEngine
	authHandler := handlers.NewAuthHandler(dbConn)
	visitsHandler := handlers.NewVisitsHandler(dbConn)

	// Register Routes
	e.POST("/api/mouls", moulHandler.CreateMoul)
	e.POST("/api/mouls/:moulName/records", recordHandler.CreateRecord)
	e.GET("/api/visits", visitsHandler.ListVisits)
	e.GET("/api/visits/:id", visitsHandler.GetVisit)
	e.POST("/api/mouls/:moulName/auth-with-password", authHandler.AuthWithPassword)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	// --- STEP 1: Create 'users' Auth Moul ---
	createUsersPayload := schema.Moul{
		Name: "users",
		Type: "auth",
	}
	resp := postJSON(t, client, server.URL+"/api/mouls", createUsersPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for users moul creation, got %d", resp.StatusCode)
	}

	// --- STEP 2: Create 'clicks' Analytic Moul ---
	createClicksPayload := schema.Moul{
		Name: "clicks",
		Type: "analytic",
		Fields: []schema.MoulField{
			{Name: "color", Type: "text"},
		},
	}
	resp = postJSON(t, client, server.URL+"/api/mouls", createClicksPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for clicks moul creation, got %d", resp.StatusCode)
	}

	// --- STEP 3: Register and Authenticate a User ---
	userPayload := map[string]interface{}{
		"username":        "adminuser",
		"email":           "admin@example.com",
		"password":        "password123",
		"passwordConfirm": "password123",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/records", userPayload, "")
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for user registration, got %d", resp.StatusCode)
	}

	authPayload := map[string]interface{}{
		"identity": "admin@example.com",
		"password": "password123",
	}
	resp = postJSON(t, client, server.URL+"/api/mouls/users/auth-with-password", authPayload, "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for authentication, got %d", resp.StatusCode)
	}

	var authResult map[string]interface{}
	parseJSON(t, resp, &authResult)
	token, _ := authResult["token"].(string)

	// --- STEP 4: Track Event (Unauthenticated, creates visit) ---
	eventPayload := map[string]interface{}{
		"name": "btn_click",
		"properties": map[string]interface{}{
			"color": "blue",
		},
		"landing_page": "https://moul.dev/landing?utm_source=facebook",
	}

	req, _ := http.NewRequest("POST", server.URL+"/api/mouls/clicks/records", jsonReader(t, eventPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "TestBrowser/1.0 (Windows NT)")
	req.Header.Set("X-Forwarded-For", "8.8.8.8")

	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to post event: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Expected 201 Created for event tracking, got %d. Body: %s", resp.StatusCode, string(body))
	}

	// Verify headers and cookies
	visitTokenHeader := resp.Header.Get("X-Visit-Token")
	visitorTokenHeader := resp.Header.Get("X-Visitor-Token")
	if visitTokenHeader == "" || visitorTokenHeader == "" {
		t.Errorf("Expected token headers to be returned, got visit=%q, visitor=%q", visitTokenHeader, visitorTokenHeader)
	}

	var cookies []string
	for _, cookie := range resp.Cookies() {
		cookies = append(cookies, cookie.Name)
	}
	hasVisitCookie := containsString(cookies, "moul_visit")
	hasVisitorCookie := containsString(cookies, "moul_visitor")
	if !hasVisitCookie || !hasVisitorCookie {
		t.Errorf("Expected cookies 'moul_visit' and 'moul_visitor' in response, got cookies=%v", cookies)
	}

	// --- STEP 5: Query Visits (Should fail without auth, succeed with auth) ---
	resp = getJSON(t, client, server.URL+"/api/visits", "")
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for anonymous visits access, got %d", resp.StatusCode)
	}

	resp = getJSON(t, client, server.URL+"/api/visits", token)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for authorized visits access, got %d", resp.StatusCode)
	}

	var visits []map[string]interface{}
	parseJSON(t, resp, &visits)
	if len(visits) != 1 {
		t.Fatalf("Expected 1 visit, got %d", len(visits))
	}

	vRecord := visits[0]
	if vRecord["id"] != visitTokenHeader || vRecord["browser"] != "Unknown" || vRecord["utm_source"] != "facebook" {
		t.Errorf("Incorrect visit data: %+v", vRecord)
	}

	// --- STEP 6: Query Specific Visit ---
	resp = getJSON(t, client, server.URL+"/api/visits/"+visitTokenHeader, token)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for specific visit access, got %d", resp.StatusCode)
	}

	var singleVisit map[string]interface{}
	parseJSON(t, resp, &singleVisit)
	if singleVisit["id"] != visitTokenHeader {
		t.Errorf("Expected visit ID %q, got %q", visitTokenHeader, singleVisit["id"])
	}
}

func jsonReader(t *testing.T, data interface{}) io.Reader {
	t.Helper()
	b, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("Failed to marshal JSON: %v", err)
	}
	return bytes.NewReader(b)
}

func containsString(arr []string, s string) bool {
	for _, v := range arr {
		if v == s {
			return true
		}
	}
	return false
}
