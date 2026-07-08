package middleware

import (
	"crypto/subtle"
	"net/http"

	"github.com/labstack/echo/v5"
)

// RequireAuthOrAdmin returns middleware that allows access only if a valid admin key is
// provided in the X-Admin-Key header, or if a valid authenticated JWT user is present.
func RequireAuthOrAdmin(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			// 1. Check admin authorization
			providedKey := c.Request().Header.Get("X-Admin-Key")
			if providedKey != "" && subtle.ConstantTimeCompare([]byte(providedKey), []byte(adminKey)) == 1 {
				return next(c)
			}

			// 2. Check JWT user authorization
			if authRecord := GetAuthRecord(c); authRecord != nil {
				return next(c)
			}

			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required (either valid JWT user or admin key)")
		}
	}
}
