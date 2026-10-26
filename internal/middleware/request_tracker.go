package middleware

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/analytics"
)

// TrackerOption is a functional option for configuring the request tracker middleware.
type TrackerOption func(*trackerConfig)

type trackerConfig struct {
	excludePaths []string
}

// WithExcludePaths sets path prefixes that should be excluded from tracking.
func WithExcludePaths(paths []string) TrackerOption {
	return func(cfg *trackerConfig) {
		cfg.excludePaths = paths
	}
}

// RequestTracker returns a middleware that tracks all HTTP requests using the
// analytics engine. It creates/retrieves visitor sessions via the _visits table
// and enqueues per-request data for async batch insertion into _requests.
func RequestTracker(engine *analytics.Engine, secureCookies bool, opts ...TrackerOption) echo.MiddlewareFunc {
	cfg := &trackerConfig{}
	for _, opt := range opts {
		opt(cfg)
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if engine == nil {
				return next(c)
			}
			req := c.Request()
			path := req.URL.Path

			// Check if this path should be excluded from tracking
			for _, prefix := range cfg.excludePaths {
				if strings.HasPrefix(path, prefix) {
					return next(c)
				}
			}

			start := time.Now()

			// Read visit/visitor tokens from cookies or headers
			visitToken := ""
			visitorToken := ""

			if cookie, err := c.Cookie("moul_visit"); err == nil {
				visitToken = cookie.Value
			}
			if visitToken == "" {
				visitToken = req.Header.Get("X-Visit-Token")
			}

			if cookie, err := c.Cookie("moul_visitor"); err == nil {
				visitorToken = cookie.Value
			}
			if visitorToken == "" {
				visitorToken = req.Header.Get("X-Visitor-Token")
			}

			// Get user ID from auth context if present
			var userID string
			if authRec := GetAuthRecord(c); authRec != nil {
				if id, ok := authRec["id"].(string); ok {
					userID = id
				}
			}

			// A request that brings no visit and cannot keep the visit cookie (an API client, SSR, a
			// cross-origin fetch without credentials, a probe) would create a new _visits row on every
			// call. It is logged without a visit instead.
			if visitToken == "" && visitorToken == "" && !canHoldVisitCookie(req) {
				err := next(c)
				if err != nil {
					c.Echo().HTTPErrorHandler(c, err)
				}
				trackRequest(engine, c, "", req.Method, path, start)
				return err
			}

			cleanLandingPage := sanitizeSensitiveURL(req.URL.String())
			cleanReferer := sanitizeSensitiveURL(req.Referer())

			// Ensure a visit session exists
			result, err := engine.EnsureVisit(
				visitToken,
				visitorToken,
				userID,
				c.RealIP(),
				req.UserAgent(),
				cleanReferer,
				cleanLandingPage,
			)
			if err != nil {
				// Log but don't fail the request — tracking is best-effort
				// Proceed without tracking
				return next(c)
			}

			// Set cookies if this is a new visit
			if result.IsNew {
				c.SetCookie(&http.Cookie{
					Name:     "moul_visit",
					Value:    result.VisitID,
					Path:     "/",
					MaxAge:   60 * 30, // 30 minutes
					HttpOnly: true,
					Secure:   secureCookies,
					SameSite: http.SameSiteLaxMode,
				})
				c.SetCookie(&http.Cookie{
					Name:     "moul_visitor",
					Value:    result.VisitorToken,
					Path:     "/",
					MaxAge:   60 * 60 * 24 * 365 * 2, // 2 years
					HttpOnly: true,
					Secure:   secureCookies,
					SameSite: http.SameSiteLaxMode,
				})
			}

			// Store visit ID in context for downstream handlers
			c.Set("visit_id", result.VisitID)

			// Process the request
			err = next(c)
			if err != nil {
				c.Echo().HTTPErrorHandler(c, err)
			}

			// Capture response data and enqueue for async tracking
			trackRequest(engine, c, result.VisitID, req.Method, path, start)

			return err
		}
	}
}

// trackRequest enqueues the request's method, path, status and latency for the _requests log.
func trackRequest(engine *analytics.Engine, c *echo.Context, visitID, method, path string, start time.Time) {
	statusCode := 200
	if resp, err := echo.UnwrapResponse(c.Response()); err == nil {
		statusCode = resp.Status
	}
	engine.TrackRequest(analytics.RequestData{
		VisitID:        visitID,
		Method:         method,
		Path:           path,
		StatusCode:     statusCode,
		ResponseTimeMs: time.Since(start).Milliseconds(),
		CreatedAt:      time.Now().UTC().Format(time.RFC3339),
	})
}

// canHoldVisitCookie reports whether the client will store the moul_visit cookie and send it back:
// a browser request from a page on this origin or a direct navigation (Sec-Fetch-Site
// "same-origin" or "none", e.g. the admin console or a link opened in the browser). Cross-site
// fetches, server-to-server calls and probes cannot, and would otherwise start a new visit on
// every request. Requests that already carry a moul cookie are handled before this check.
func canHoldVisitCookie(req *http.Request) bool {
	switch strings.ToLower(req.Header.Get("Sec-Fetch-Site")) {
	case "same-origin", "none":
		return true
	}
	return false
}

// sanitizeSensitiveURL parses a URL and replaces values of sensitive query parameters with [REDACTED].
func sanitizeSensitiveURL(rawURL string) string {
	if rawURL == "" {
		return ""
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	if u.RawQuery == "" {
		return rawURL
	}

	q := u.Query()
	modified := false
	for k := range q {
		lowerK := strings.ToLower(k)
		if isSensitiveParam(lowerK) {
			q.Set(k, "[REDACTED]")
			modified = true
		}
	}
	if modified {
		u.RawQuery = q.Encode()
	}
	return u.String()
}

func isSensitiveParam(name string) bool {
	switch name {
	case "token", "admin_key", "adminkey", "ticket", "secret", "password", "api_key", "apikey", "auth", "authorization", "code", "access_token", "refresh_token":
		return true
	}
	return false
}
