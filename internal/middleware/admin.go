package middleware

import (
	"crypto/subtle"
	"net/http"

	"github.com/labstack/echo/v5"
)

// RequireAdminKey returns middleware that validates the X-Admin-Key header
// against the configured admin key using constant-time comparison.
func RequireAdminKey(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			provided := c.Request().Header.Get("X-Admin-Key")
			if provided == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Admin authentication required")
			}

			if subtle.ConstantTimeCompare([]byte(provided), []byte(adminKey)) != 1 {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid admin key")
			}

			return next(c)
		}
	}
}
