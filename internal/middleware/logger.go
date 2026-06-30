package middleware

import (
	"log/slog"
	"time"

	"github.com/labstack/echo/v4"
)

// RequestLogger returns a middleware that logs HTTP requests using slog.
func RequestLogger() echo.MiddlewareFunc {
	logger := slog.Default()
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

			// Construct basic log attributes
			attrs := []slog.Attr{
				slog.String("method", method),
				slog.String("path", path),
				slog.Int("status", status),
				slog.Duration("latency", latency),
				slog.String("ip", ip),
				slog.Int64("bytes_sent", bytesSent),
			}

			// Include auth info if present in the context
			if authRec := GetAuthRecord(c); authRec != nil {
				if id, ok := authRec["id"].(string); ok {
					attrs = append(attrs, slog.String("user_id", id))
				}
				if email, ok := authRec["email"].(string); ok {
					attrs = append(attrs, slog.String("email", email))
				}
			}

			msg := "HTTP request"
			if err != nil {
				attrs = append(attrs, slog.String("error", err.Error()))
			}

			if status >= 500 {
				logger.LogAttrs(req.Context(), slog.LevelError, msg, attrs...)
			} else if status >= 400 {
				logger.LogAttrs(req.Context(), slog.LevelWarn, msg, attrs...)
			} else {
				logger.LogAttrs(req.Context(), slog.LevelInfo, msg, attrs...)
			}

			return err
		}
	}
}
