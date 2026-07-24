package handlers

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/docs"
)

// DocsHandler handles API documentation endpoints.
type DocsHandler struct{}

// NewDocsHandler creates a new instance of DocsHandler.
func NewDocsHandler() *DocsHandler {
	return &DocsHandler{}
}

// ServeOpenAPISpec serves the raw openapi.yml spec file.
func (h *DocsHandler) ServeOpenAPISpec(c *echo.Context) error {
	return c.Blob(http.StatusOK, "text/yaml; charset=utf-8", docs.Spec)
}

// ServeAPIDocs serves the interactive HTML API documentation viewer.
func (h *DocsHandler) ServeAPIDocs(c *echo.Context) error {
	ui := c.QueryParam("ui")
	if ui == "swagger" {
		return c.HTML(http.StatusOK, swaggerUIHTML)
	}
	return c.HTML(http.StatusOK, scalarUIHTML)
}

const scalarUIHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moul API Reference</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
    }
    .docs-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background-color: #1e293b;
      border-bottom: 1px solid #334155;
      font-size: 0.875rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .docs-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      color: #f8fafc;
      text-decoration: none;
    }
    .docs-brand svg {
      width: 24px;
      height: 24px;
      fill: #38bdf8;
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background-color: #0284c7;
      color: #ffffff;
      font-weight: 500;
    }
    .docs-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.15s ease, color 0.15s ease;
      cursor: pointer;
      border: 1px solid #475569;
      background-color: #334155;
      color: #e2e8f0;
    }
    .btn:hover {
      background-color: #475569;
      color: #ffffff;
    }
    .ui-switch {
      display: flex;
      background-color: #0f172a;
      padding: 2px;
      border-radius: 0.375rem;
      border: 1px solid #334155;
    }
    .ui-switch a {
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
      border-radius: 0.25rem;
      color: #94a3b8;
      text-decoration: none;
    }
    .ui-switch a.active {
      background-color: #334155;
      color: #ffffff;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <header class="docs-topbar">
    <a href="/docs" class="docs-brand">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      Moul
      <span class="badge">v1.0.0</span>
    </a>
    <div class="docs-actions">
      <div class="ui-switch">
        <a href="/docs" class="active">Scalar UI</a>
        <a href="/docs?ui=swagger">Swagger UI</a>
      </div>
      <a href="/openapi.yml" download="openapi.yml" class="btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        OpenAPI Spec (.yml)
      </a>
    </div>
  </header>
  <script
    id="api-reference"
    data-url="/openapi.yml"
    data-configuration='{"theme":"purple","layout":"modern"}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`

const swaggerUIHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moul API Reference - Swagger UI</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
    }
    .docs-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background-color: #1e293b;
      border-bottom: 1px solid #334155;
      font-size: 0.875rem;
    }
    .docs-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      color: #f8fafc;
      text-decoration: none;
    }
    .docs-brand svg {
      width: 24px;
      height: 24px;
      fill: #38bdf8;
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background-color: #0284c7;
      color: #ffffff;
      font-weight: 500;
    }
    .docs-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.15s ease;
      border: 1px solid #475569;
      background-color: #334155;
      color: #e2e8f0;
    }
    .btn:hover { background-color: #475569; color: #ffffff; }
    .ui-switch {
      display: flex;
      background-color: #0f172a;
      padding: 2px;
      border-radius: 0.375rem;
      border: 1px solid #334155;
    }
    .ui-switch a {
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
      border-radius: 0.25rem;
      color: #94a3b8;
      text-decoration: none;
    }
    .ui-switch a.active {
      background-color: #334155;
      color: #ffffff;
      font-weight: 600;
    }
    .swagger-ui .topbar { display: none; }
    #swagger-ui {
      background-color: #ffffff;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  </style>
</head>
<body>
  <header class="docs-topbar">
    <a href="/docs" class="docs-brand">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      Moul
      <span class="badge">v1.0.0</span>
    </a>
    <div class="docs-actions">
      <div class="ui-switch">
        <a href="/docs">Scalar UI</a>
        <a href="/docs?ui=swagger" class="active">Swagger UI</a>
      </div>
      <a href="/openapi.yml" download="openapi.yml" class="btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        OpenAPI Spec (.yml)
      </a>
    </div>
  </header>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" charset="UTF-8"> </script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.yml",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`
