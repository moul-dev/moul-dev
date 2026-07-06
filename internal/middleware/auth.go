package middleware

import (
	"net/http"
	"strings"
	"sync"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"

	"github.com/labstack/echo/v4"
)

var (
	rootIPsMutex   sync.RWMutex
	rootIPsEnabled bool
	rootIPsValue   string
)

// InitRootIPs loads initial root user IP restriction settings from the database.
func InitRootIPs(db *dbx.DB) error {
	return ReloadRootIPs(db)
}

// ReloadRootIPs refreshes root user IP settings from the database.
func ReloadRootIPs(db *dbx.DB) error {
	rootIPsMutex.Lock()
	defer rootIPsMutex.Unlock()

	var enabledVal string
	err := db.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_ip_enabled"}).Row(&enabledVal)
	if err != nil {
		rootIPsEnabled = false
	} else {
		rootIPsEnabled = (enabledVal == "true")
	}

	var val string
	err = db.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_allowed_ips"}).Row(&val)
	if err != nil {
		rootIPsValue = ""
	} else {
		rootIPsValue = val
	}

	return nil
}

func getRootIPsConfig() (bool, string) {
	rootIPsMutex.RLock()
	defer rootIPsMutex.RUnlock()
	return rootIPsEnabled, rootIPsValue
}

// AuthContextKey is the context key for storing the auth record map.
const AuthContextKey = "auth"

// LoadAuthContextMiddleware reads the Authorization header, validates the JWT,
// and maps the verified user details into the Echo context.
func LoadAuthContextMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return next(c)
			}

			// Expect "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return next(c)
			}

			tokenString := parts[1]
			claims, err := auth.VerifyToken(tokenString)
			if err != nil {
				// Invalid token is ignored or left as unauthenticated.
				// Alternatively, you could return an error, but PocketBase
				// falls back to unauthenticated if token is invalid or expired.
				return next(c)
			}

			// Map auth context fields
			authRecord := map[string]interface{}{
				"id":       claims.ID,
				"email":    claims.Email,
				"username": claims.Username,
				"moul":     claims.MoulName,
			}

			if claims.MoulName == "_rootUsers" {
				enabled, allowed := getRootIPsConfig()
				if enabled && !util.IsIPAllowed(c.RealIP(), allowed) {
					return echo.NewHTTPError(http.StatusForbidden, map[string]string{"message": "IP address not authorized"})
				}
			}

			c.Set(AuthContextKey, authRecord)
			return next(c)
		}
	}
}

// GetAuthRecord retrieves the auth record map from Echo context.
func GetAuthRecord(c echo.Context) map[string]interface{} {
	val := c.Get(AuthContextKey)
	if val == nil {
		return nil
	}
	if record, ok := val.(map[string]interface{}); ok {
		return record
	}
	return nil
}
