package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestDynamicRateLimiter(t *testing.T) {
	e := echo.New()

	// 1. Setup globalState rules manually for unit testing to avoid SQLite dependency
	globalState.Lock()
	globalState.enabled = true
	globalState.rules = []schema.RateLimitRule{
		{
			Label:         "*:auth",
			MaxRequests:   2,
			Interval:      10,
			TargetedUsers: "all",
		},
		{
			Label:         "users:list",
			MaxRequests:   1,
			Interval:      10,
			TargetedUsers: "authenticated",
		},
		{
			Label:         "/api/batch",
			MaxRequests:   1,
			Interval:      5,
			TargetedUsers: "all",
		},
		{
			Label:         "/",
			MaxRequests:   5,
			Interval:      10,
			TargetedUsers: "all",
		},
	}
	globalState.limiters = make(map[string]*tokenBucket)
	globalState.Unlock()

	// Middleware handler helper
	runMiddleware := func(method, path, pathTemplate, pathParamName, pathParamValue string, headers map[string]string, authRecord map[string]interface{}) (int, string) {
		req := httptest.NewRequest(method, path, nil)
		for k, v := range headers {
			req.Header.Set(k, v)
		}
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		if pathTemplate != "" {
			c.SetPath(pathTemplate)
		} else {
			c.SetPath(path)
		}
		if pathParamName != "" {
			c.SetPathValues(echo.PathValues{
				{Name: pathParamName, Value: pathParamValue},
			})
		}
		if authRecord != nil {
			c.Set(AuthContextKey, authRecord)
		}

		handler := DynamicRateLimiter("admin123")(func(ctx *echo.Context) error {
			return ctx.String(http.StatusOK, "OK")
		})

		err := handler(c)
		if err != nil {
			if he, ok := err.(*echo.HTTPError); ok {
				return he.Code, he.Message
			}
			return http.StatusInternalServerError, err.Error()
		}
		return rec.Code, rec.Body.String()
	}

	// Test case 1: Normal request under limits
	code, body := runMiddleware(http.MethodGet, "/index.html", "", "", "", nil, nil)
	if code != http.StatusOK || body != "OK" {
		t.Errorf("Expected 200 OK, got status %d, body %s", code, body)
	}

	// Test case 2: Action matching (*:auth)
	// First request - OK (limit is 2 per 10s)
	code, _ = runMiddleware(http.MethodPost, "/api/moul/users/auth-with-password", "/api/moul/:name/auth-with-password", "name", "users", nil, nil)
	if code != http.StatusOK {
		t.Errorf("First auth request failed: status %d", code)
	}
	// Second request - OK
	code, _ = runMiddleware(http.MethodPost, "/api/moul/users/auth-with-password", "/api/moul/:name/auth-with-password", "name", "users", nil, nil)
	if code != http.StatusOK {
		t.Errorf("Second auth request failed: status %d", code)
	}
	// Third request - Blocked (exceeded 2 requests)
	code, body = runMiddleware(http.MethodPost, "/api/moul/users/auth-with-password", "/api/moul/:name/auth-with-password", "name", "users", nil, nil)
	if code != http.StatusTooManyRequests {
		t.Errorf("Expected 429 Too Many Requests, got %d (body: %s)", code, body)
	}

	// Test case 3: targetedUsers (authenticated rule)
	// Request on users:list (GET /api/moul/users/records) without auth -> matches fallback "/" rule (limit 5) instead of "users:list"
	for i := 0; i < 3; i++ {
		code, _ = runMiddleware(http.MethodGet, "/api/moul/users/records", "/api/moul/:name/records", "name", "users", nil, nil)
		if code != http.StatusOK {
			t.Errorf("Guest request on users:list should pass under fallback rule (request %d failed)", i)
		}
	}
	// Request with auth -> matches "users:list" (limit 1 per 10s)
	userAuth := map[string]interface{}{"id": "u1", "username": "usera"}
	// First request - OK
	code, _ = runMiddleware(http.MethodGet, "/api/moul/users/records", "/api/moul/:name/records", "name", "users", nil, userAuth)
	if code != http.StatusOK {
		t.Errorf("Authenticated request on users:list failed: status %d", code)
	}
	// Second request - Blocked (exceeds limit 1)
	code, _ = runMiddleware(http.MethodGet, "/api/moul/users/records", "/api/moul/:name/records", "name", "users", nil, userAuth)
	if code != http.StatusTooManyRequests {
		t.Errorf("Expected 429 for authenticated user on users:list, got %d", code)
	}

	// Test case 4: Admin key bypasses rate limiting
	headers := map[string]string{"X-Admin-Key": "admin123"}
	// The auth endpoint which was blocked before should now pass with admin key
	code, body = runMiddleware(http.MethodPost, "/api/moul/users/auth-with-password", "/api/moul/:name/auth-with-password", "name", "users", headers, nil)
	if code != http.StatusOK || body != "OK" {
		t.Errorf("Admin request was blocked: status %d, body %s", code, body)
	}
}

func TestLimiterCleanup(t *testing.T) {
	state := &limiterState{
		limiters: make(map[string]*tokenBucket),
	}

	state.Lock()
	state.limiters["ip1:rule1"] = &tokenBucket{tokens: 1.0, lastSeen: time.Now().Add(-11 * time.Minute)}
	state.limiters["ip2:rule2"] = &tokenBucket{tokens: 2.0, lastSeen: time.Now().Add(-5 * time.Minute)}
	state.Unlock()

	state.startCleanup(10 * time.Millisecond)
	time.Sleep(25 * time.Millisecond)

	state.RLock()
	defer state.RUnlock()
	if _, ok := state.limiters["ip1:rule1"]; ok {
		t.Error("stale ip1:rule1 was not cleaned up")
	}
	if _, ok := state.limiters["ip2:rule2"]; !ok {
		t.Error("recent ip2:rule2 was incorrectly cleaned up")
	}
}

func TestJsonRulesValidation(t *testing.T) {
	rulesStr := `[{"label":"*:auth","maxRequests":10,"interval":3,"targetedUsers":"all"}]`
	var rules []schema.RateLimitRule
	err := json.Unmarshal([]byte(rulesStr), &rules)
	if err != nil {
		t.Fatalf("Failed to parse valid rules JSON: %v", err)
	}
	if len(rules) != 1 || rules[0].Label != "*:auth" || rules[0].MaxRequests != 10 {
		t.Errorf("Parsed rules structural mismatch: %+v", rules)
	}
}

func TestAcquireRealtimeConnection_BaselineCaps(t *testing.T) {
	e := echo.New()
	ResetActiveConnections()

	globalState.Lock()
	globalState.enabled = true
	globalState.rules = nil
	globalState.Unlock()

	// 1. Test Per-User Quota (Max 15)
	user := map[string]interface{}{"id": "user_cap_test", "moul": "users"}
	var releases []func()

	for i := 0; i < DefaultMaxConcurrentPerUser; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/moul/posts/subscribe", nil)
		req.Header.Set("X-Real-IP", "10.0.0."+string(rune('1'+i)))
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		rel, err := AcquireRealtimeConnection(c, "posts", user, false)
		if err != nil {
			t.Fatalf("Connection %d should have been acquired, got err: %v", i+1, err)
		}
		releases = append(releases, rel)
	}

	// 16th connection for same user must be rejected
	req16 := httptest.NewRequest(http.MethodGet, "/api/moul/posts/subscribe", nil)
	req16.Header.Set("X-Real-IP", "10.0.0.99")
	rec16 := httptest.NewRecorder()
	c16 := e.NewContext(req16, rec16)

	_, err := AcquireRealtimeConnection(c16, "posts", user, false)
	if err == nil {
		t.Fatal("16th user connection should have exceeded quota")
	}
	httpErr, ok := err.(*echo.HTTPError)
	if !ok || httpErr.Code != http.StatusTooManyRequests {
		t.Fatalf("Expected HTTP 429, got %v", err)
	}

	// Release one connection and verify slot is freed
	releases[0]()
	relRetry, errRetry := AcquireRealtimeConnection(c16, "posts", user, false)
	if errRetry != nil {
		t.Fatalf("Acquiring connection after slot release should succeed, got err: %v", errRetry)
	}
	releases[0] = relRetry

	// Clean up all user connections
	for _, rel := range releases {
		rel()
	}

	// 2. Test Per-IP Quota (Max 30)
	ResetActiveConnections()
	var ipReleases []func()
	targetIP := "192.168.1.100"

	for i := 0; i < DefaultMaxConcurrentPerIP; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/moul/posts/subscribe", nil)
		req.Header.Set("X-Real-IP", targetIP)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		rel, err := AcquireRealtimeConnection(c, "posts", nil, false)
		if err != nil {
			t.Fatalf("IP connection %d should have been acquired, got err: %v", i+1, err)
		}
		ipReleases = append(ipReleases, rel)
	}

	// 31st connection for same IP must be rejected
	req31 := httptest.NewRequest(http.MethodGet, "/api/moul/posts/subscribe", nil)
	req31.Header.Set("X-Real-IP", targetIP)
	rec31 := httptest.NewRecorder()
	c31 := e.NewContext(req31, rec31)

	_, err = AcquireRealtimeConnection(c31, "posts", nil, false)
	if err == nil {
		t.Fatal("31st IP connection should have exceeded quota")
	}

	// Clean up all IP connections
	for _, rel := range ipReleases {
		rel()
	}
}

func TestAcquireRealtimeConnection_CustomRuleAndAdminBypass(t *testing.T) {
	e := echo.New()
	ResetActiveConnections()

	globalState.Lock()
	globalState.enabled = true
	globalState.rules = []schema.RateLimitRule{
		{
			Label:         "chat:subscribe",
			MaxRequests:   100,
			Interval:      60,
			TargetedUsers: "all",
			MaxConcurrent: 2,
		},
	}
	globalState.Unlock()

	user := map[string]interface{}{"id": "chat_user_1", "moul": "users"}

	// Open 2 connections to chat
	req1 := httptest.NewRequest(http.MethodGet, "/api/moul/chat/subscribe", nil)
	rec1 := httptest.NewRecorder()
	c1 := e.NewContext(req1, rec1)
	rel1, err1 := AcquireRealtimeConnection(c1, "chat", user, false)
	if err1 != nil {
		t.Fatalf("Connection 1 should succeed: %v", err1)
	}
	defer rel1()

	req2 := httptest.NewRequest(http.MethodGet, "/api/moul/chat/subscribe", nil)
	rec2 := httptest.NewRecorder()
	c2 := e.NewContext(req2, rec2)
	rel2, err2 := AcquireRealtimeConnection(c2, "chat", user, false)
	if err2 != nil {
		t.Fatalf("Connection 2 should succeed: %v", err2)
	}
	defer rel2()

	// 3rd connection should be rejected by rule MaxConcurrent: 2
	req3 := httptest.NewRequest(http.MethodGet, "/api/moul/chat/subscribe", nil)
	rec3 := httptest.NewRecorder()
	c3 := e.NewContext(req3, rec3)
	_, err3 := AcquireRealtimeConnection(c3, "chat", user, false)
	if err3 == nil {
		t.Fatal("3rd connection should have been rejected by MaxConcurrent rule")
	}

	// Admin bypass: admin connecting to chat should bypass all limits
	reqAdmin := httptest.NewRequest(http.MethodGet, "/api/moul/chat/subscribe", nil)
	recAdmin := httptest.NewRecorder()
	cAdmin := e.NewContext(reqAdmin, recAdmin)
	relAdmin, errAdmin := AcquireRealtimeConnection(cAdmin, "chat", user, true)
	if errAdmin != nil {
		t.Fatalf("Admin connection should always bypass quotas, got err: %v", errAdmin)
	}
	relAdmin()
}
