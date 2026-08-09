package middleware

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

// RequireAdminKey returns middleware that validates the admin key
// against the configured admin key using constant-time comparison.
func RequireAdminKey(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if !CheckAdminKey(c, adminKey) {
				return echo.NewHTTPError(http.StatusUnauthorized, "Admin authentication required")
			}

			return next(c)
		}
	}
}
