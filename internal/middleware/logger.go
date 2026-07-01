package middleware

import (
	"time"

	"github.com/labstack/echo/v4"

	"github.com/moul-dev/moul-dev/internal/logger"
)

// RequestLogger returns a middleware that logs HTTP requests using charmbracelet/log.
func RequestLogger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			req := c.Request()
			res := c.Response()

			// Process the next handler in the chain
			err := next(c)
			if err != nil {
				c.Error(err)
			}

			latency := time.Since(start)

			status := res.Status
			method := req.Method
			path := req.URL.Path
			if path == "" {
				path = "/"
			}
			ip := c.RealIP()
			bytesSent := res.Size

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

