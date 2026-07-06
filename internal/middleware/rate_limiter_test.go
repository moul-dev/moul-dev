package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
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
			c.SetParamNames(pathParamName)
			c.SetParamValues(pathParamValue)
		}
		if authRecord != nil {
			c.Set(AuthContextKey, authRecord)
		}

		handler := DynamicRateLimiter("admin123")(func(ctx echo.Context) error {
			return ctx.String(http.StatusOK, "OK")
		})

		err := handler(c)
		if err != nil {
			if he, ok := err.(*echo.HTTPError); ok {
				var msg string
				if m, ok := he.Message.(map[string]string); ok {
					msg = m["message"]
				} else if s, ok := he.Message.(string); ok {
					msg = s
				}
				return he.Code, msg
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
	code, body = runMiddleware(http.MethodPost, "/api/mouls/users/auth-with-password", "/api/mouls/:moulName/auth-with-password", "moulName", "users", nil, nil)
	if code != http.StatusOK {
		t.Errorf("First auth request failed: status %d", code)
	}
	// Second request - OK
	code, body = runMiddleware(http.MethodPost, "/api/mouls/users/auth-with-password", "/api/mouls/:moulName/auth-with-password", "moulName", "users", nil, nil)
	if code != http.StatusOK {
		t.Errorf("Second auth request failed: status %d", code)
	}
	// Third request - Blocked (exceeded 2 requests)
	code, body = runMiddleware(http.MethodPost, "/api/mouls/users/auth-with-password", "/api/mouls/:moulName/auth-with-password", "moulName", "users", nil, nil)
	if code != http.StatusTooManyRequests {
		t.Errorf("Expected 429 Too Many Requests, got %d (body: %s)", code, body)
	}

	// Test case 3: targeted_users (authenticated rule)
	// Request on users:list (GET /api/mouls/users/records) without auth -> matches fallback "/" rule (limit 5) instead of "users:list"
	for i := 0; i < 3; i++ {
		code, body = runMiddleware(http.MethodGet, "/api/mouls/users/records", "/api/mouls/:moulName/records", "moulName", "users", nil, nil)
		if code != http.StatusOK {
			t.Errorf("Guest request on users:list should pass under fallback rule (request %d failed)", i)
		}
	}
	// Request with auth -> matches "users:list" (limit 1 per 10s)
	userAuth := map[string]interface{}{"id": "u1", "username": "usera"}
	// First request - OK
	code, body = runMiddleware(http.MethodGet, "/api/mouls/users/records", "/api/mouls/:moulName/records", "moulName", "users", nil, userAuth)
	if code != http.StatusOK {
		t.Errorf("Authenticated request on users:list failed: status %d", code)
	}
	// Second request - Blocked (exceeds limit 1)
	code, body = runMiddleware(http.MethodGet, "/api/mouls/users/records", "/api/mouls/:moulName/records", "moulName", "users", nil, userAuth)
	if code != http.StatusTooManyRequests {
		t.Errorf("Expected 429 for authenticated user on users:list, got %d", code)
	}

	// Test case 4: Admin key bypasses rate limiting
	headers := map[string]string{"X-Admin-Key": "admin123"}
	// The auth endpoint which was blocked before should now pass with admin key
	code, body = runMiddleware(http.MethodPost, "/api/mouls/users/auth-with-password", "/api/mouls/:moulName/auth-with-password", "moulName", "users", headers, nil)
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
	rulesStr := `[{"label":"*:auth","max_requests":10,"interval":3,"targeted_users":"all"}]`
	var rules []schema.RateLimitRule
	err := json.Unmarshal([]byte(rulesStr), &rules)
	if err != nil {
		t.Fatalf("Failed to parse valid rules JSON: %v", err)
	}
	if len(rules) != 1 || rules[0].Label != "*:auth" || rules[0].MaxRequests != 10 {
		t.Errorf("Parsed rules structural mismatch: %+v", rules)
	}
}
