package middleware

import (
	"time"

	"github.com/labstack/echo/v5"

	"github.com/moul-dev/moul-dev/internal/logger"
)

// RequestLogger returns a middleware that logs HTTP requests using charmbracelet/log.
func RequestLogger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			start := time.Now()

			req := c.Request()

			// Process the next handler in the chain
			err := next(c)
			if err != nil {
				c.Echo().HTTPErrorHandler(c, err)
			}

			latency := time.Since(start)

			status := 200
			var bytesSent int64
			if resp, err := echo.UnwrapResponse(c.Response()); err == nil {
				status = resp.Status
				bytesSent = resp.Size
			}

			method := req.Method
			path := req.URL.Path
			if path == "" {
				path = "/"
			}
			ip := c.RealIP()

			// Construct key-value pairs
			keyvals := []interface{}{
				"method", method,
				"path", path,
				"status", status,
				"latency", latency,
				"ip", ip,
				"bytes_sent", bytesSent,
			}

			// Include auth info if present in the context
			if authRec := GetAuthRecord(c); authRec != nil {
				if id, ok := authRec["id"].(string); ok {
					keyvals = append(keyvals, "user_id", id)
				}
				if email, ok := authRec["email"].(string); ok {
					keyvals = append(keyvals, "email", email)
				}
			}

			msg := "HTTP request"
			if err != nil {
				keyvals = append(keyvals, "error", err.Error())
			}

			if status >= 500 {
				logger.Error(msg, keyvals...)
			} else if status >= 400 {
				logger.Warn(msg, keyvals...)
			} else {
				logger.Info(msg, keyvals...)
			}

			return err
		}
	}
}

