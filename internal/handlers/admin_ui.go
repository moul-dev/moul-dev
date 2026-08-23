package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/ui"
)

const fallbackHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mould — Web Admin Console</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      box-sizing: border-box;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1rem;
      padding: 2.5rem;
      max-width: 540px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 { margin-top: 0; font-size: 1.5rem; color: #38bdf8; display: flex; align-items: center; gap: 0.75rem; }
    p { color: #94a3b8; line-height: 1.6; }
    code { background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.9em; color: #f1f5f9; border: 1px solid #334155; }
    .btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.6rem 1.2rem;
      background: #0284c7;
      color: #ffffff;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>mould Web Admin Console</h1>
    <p>The Web Admin Console UI bundle is currently not built into this binary.</p>
    <p>To compile the full console with TanStack Router and StyleX, run:</p>
    <pre><code>make ui-build && make build</code></pre>
    <p>For development with live reloading and proxying, run:</p>
    <pre><code>make ui-dev</code></pre>
    <a href="/docs" class="btn">View API Docs</a>
  </div>
</body>
</html>`

// RegisterAdminUIRoutes mounts the embedded Web Admin Console onto the Echo router.
func RegisterAdminUIRoutes(e *echo.Echo, prefix string) {
	if prefix == "" {
		prefix = "/_moul_"
	}

	distFS := ui.DistDirFS()

	// Redirect /admin and /admin/* to prefix/
	e.GET("/admin", func(c *echo.Context) error {
		return c.Redirect(http.StatusMovedPermanently, prefix+"/")
	})
	e.GET("/admin/*", func(c *echo.Context) error {
		path := c.Param("*")
		return c.Redirect(http.StatusMovedPermanently, prefix+"/"+path)
	})

	// Redirect prefix (without trailing slash) to prefix + "/"
	e.GET(prefix, func(c *echo.Context) error {
		return c.Redirect(http.StatusMovedPermanently, prefix+"/")
	})

	// Helper to serve index.html with fallback
	serveIndexHTML := func(c *echo.Context) error {
		indexFile, err := distFS.Open("index.html")
		if err != nil {
			if !ui.HasCustomUI() {
				c.Response().Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				return c.HTML(http.StatusOK, fallbackHTML)
			}
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("index.html not found: %v", err))
		}
		defer indexFile.Close()

		stat, err := indexFile.Stat()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read index.html")
		}

		c.Response().Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		if seeker, ok := indexFile.(io.ReadSeeker); ok {
			http.ServeContent(c.Response(), c.Request(), "index.html", stat.ModTime(), seeker)
			return nil
		}
		data, err := io.ReadAll(indexFile)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read index.html")
		}
		return c.Blob(http.StatusOK, "text/html; charset=utf-8", data)
	}

	// Exact prefix + "/"
	e.GET(prefix+"/", serveIndexHTML)

	// Handle all routes under prefix/*
	e.GET(prefix+"/*", func(c *echo.Context) error {
		relPath := strings.TrimPrefix(c.Request().URL.Path, prefix)
		relPath = strings.TrimPrefix(relPath, "/")

		// If path is empty, serve index.html
		if relPath == "" || relPath == "index.html" {
			return serveIndexHTML(c)
		}

		// Try opening the requested file in distFS
		f, err := distFS.Open(relPath)
		if err == nil {
			defer f.Close()
			stat, err := f.Stat()
			if err == nil && !stat.IsDir() {
				// Cache control: Immutable for versioned/hashed assets; no-cache for other files
				if strings.HasPrefix(relPath, "assets/") {
					c.Response().Header().Set("Cache-Control", "public, max-age=31536000, immutable")
				} else {
					c.Response().Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				}

				if seeker, ok := f.(io.ReadSeeker); ok {
					http.ServeContent(c.Response(), c.Request(), stat.Name(), stat.ModTime(), seeker)
					return nil
				}
				data, err := io.ReadAll(f)
				if err == nil {
					return c.Blob(http.StatusOK, "", data)
				}
			}
		}

		// If an asset in assets/ was specifically requested and not found, return 404 (do not return HTML)
		if strings.HasPrefix(relPath, "assets/") {
			return echo.NewHTTPError(http.StatusNotFound, "Asset not found")
		}

		// Fallback for client-side HTML5 SPA routing: Serve index.html
		return serveIndexHTML(c)
	})
}
