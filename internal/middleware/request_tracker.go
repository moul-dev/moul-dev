package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
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
		return func(c echo.Context) error {
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

			// Ensure a visit session exists
			result, err := engine.EnsureVisit(
				visitToken,
				visitorToken,
				userID,
				c.RealIP(),
				req.UserAgent(),
				req.Referer(),
				req.URL.String(),
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
				c.Error(err)
			}

			// Capture response data and enqueue for async tracking
			latency := time.Since(start)
			engine.TrackRequest(analytics.RequestData{
				VisitID:        result.VisitID,
				Method:         req.Method,
				Path:           path,
				StatusCode:     c.Response().Status,
				ResponseTimeMs: latency.Milliseconds(),
				CreatedAt:      time.Now().UTC().Format(time.RFC3339),
			})

			return err
		}
	}
}
