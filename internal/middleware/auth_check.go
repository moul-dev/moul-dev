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
// 2. Authorization header ("Bearer <adminKey>", "Basic <base64>", or "<adminKey>")
// Query parameters are strictly disallowed for security reasons.
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

	return false
}

// RootMoul is the system auth collection of root (admin console) users.
const RootMoul = "_rootUsers"

// IsRoot reports whether the request is authenticated with a root user token.
func IsRoot(c *echo.Context) bool {
	authRecord := GetAuthRecord(c)
	return authRecord != nil && authRecord["moul"] == RootMoul
}

// IsRootOrAdmin reports whether the request carries the admin key or a root user token.
func IsRootOrAdmin(c *echo.Context, adminKey string) bool {
	return IsRoot(c) || CheckAdminKey(c, adminKey)
}

// unauthorized answers 401 with the WWW-Authenticate challenge MCP clients use for OAuth discovery.
func unauthorized(c *echo.Context, message string) error {
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

	return echo.NewHTTPError(http.StatusUnauthorized, message)
}

// RequireAuthOrAdmin returns middleware that allows access only if a valid admin key is
// provided (via X-Admin-Key or Authorization header), or if a valid authenticated JWT user is present.
func RequireAuthOrAdmin(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if CheckAdminKey(c, adminKey) || GetAuthRecord(c) != nil {
				return next(c)
			}
			return unauthorized(c, "Authentication required (either valid JWT user or admin key)")
		}
	}
}

// RequireAdmin returns middleware for the admin surface (schemas, settings, files, workers, logs,
// metrics, MCP): only the admin key or a root user token passes. Guests get 401 with the OAuth
// discovery challenge; signed-in members of other collections get 403.
func RequireAdmin(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if IsRootOrAdmin(c, adminKey) {
				return next(c)
			}
			if GetAuthRecord(c) != nil {
				return echo.NewHTTPError(http.StatusForbidden, "Root or admin access required")
			}
			return unauthorized(c, "Admin authentication required (root user token or admin key)")
		}
	}
}
