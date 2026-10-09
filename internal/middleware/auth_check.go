package middleware

import (
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
)

// CheckAdminKey validates if the request presents a valid admin key via:
// 1. X-Admin-Key header
// 2. Authorization header ("Bearer <adminKey>" or "<adminKey>")
// 3. Query parameter (?adminKey=..., ?admin_key=..., ?x-admin-key=..., ?api_key=..., ?token=...)
func CheckAdminKey(c *echo.Context, expectedKey string) bool {
	if expectedKey == "" {
		return false
	}

	// 1. Check X-Admin-Key header
	if key := c.Request().Header.Get("X-Admin-Key"); key != "" {
		if subtle.ConstantTimeCompare([]byte(key), []byte(expectedKey)) == 1 {
			return true
		}
	}

	// 2. Check Authorization header ("Bearer <key>", "Basic <base64>", or "<key>")
	if authHeader := c.Request().Header.Get("Authorization"); authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		token := authHeader
		if len(parts) == 2 {
			scheme := strings.ToLower(parts[0])
			if scheme == "bearer" {
				token = parts[1]
			} else if scheme == "basic" {
				// Parse Basic Auth (Gemini uses this via Client ID and Client Secret)
				payload, err := base64.StdEncoding.DecodeString(parts[1])
				if err == nil {
					pair := strings.SplitN(string(payload), ":", 2)
					if len(pair) == 2 {
						// pair[0] is Client ID (ignored/username)
						// pair[1] is Client Secret (password / adminKey)
						if subtle.ConstantTimeCompare([]byte(pair[1]), []byte(expectedKey)) == 1 {
							return true
						}
					}
				}
			}
		}

		// Fallback to direct token comparison (if it was Bearer or just raw token)
		if subtle.ConstantTimeCompare([]byte(token), []byte(expectedKey)) == 1 {
			return true
		}
	}

	// 3. Check query parameters
	for _, param := range []string{"adminKey", "admin_key", "x-admin-key", "api_key", "token"} {
		if key := c.QueryParam(param); key != "" {
			if subtle.ConstantTimeCompare([]byte(key), []byte(expectedKey)) == 1 {
				return true
			}
		}
	}

	return false
}

// RequireAuthOrAdmin returns middleware that allows access only if a valid admin key is
// provided (via X-Admin-Key header, Authorization header, or query param), or if a valid authenticated JWT user is present.
func RequireAuthOrAdmin(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			// 1. Check admin authorization
			if CheckAdminKey(c, adminKey) {
				return next(c)
			}

			// 2. Check JWT user authorization
			if authRecord := GetAuthRecord(c); authRecord != nil {
				return next(c)
			}

			scheme := "http"
			if c.Request().TLS != nil {
				scheme = "https"
			}
			host := c.Request().Host
			if forwardedHost := c.Request().Header.Get("X-Forwarded-Host"); forwardedHost != "" {
				host = forwardedHost
			}
			if forwardedProto := c.Request().Header.Get("X-Forwarded-Proto"); forwardedProto != "" {
				scheme = forwardedProto
			}

			resourceMetadataURL := fmt.Sprintf("%s://%s/.well-known/oauth-protected-resource", scheme, host)
			c.Response().Header().Set("WWW-Authenticate", fmt.Sprintf(`Bearer realm="%s", error="unauthorized", resource_metadata="%s"`, host, resourceMetadataURL))

			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required (either valid JWT user or admin key)")
		}
	}
}
