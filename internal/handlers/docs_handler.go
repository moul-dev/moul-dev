package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/docs"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
	"gopkg.in/yaml.v3"
)

// DocsHandler handles API documentation endpoints.
type DocsHandler struct {
	version string
	spec    []byte
	DB      *dbx.DB
}

// NewDocsHandler creates a new instance of DocsHandler.
func NewDocsHandler(dbConn *dbx.DB, version ...string) *DocsHandler {
	v := "dev"
	if len(version) > 0 && version[0] != "" {
		v = version[0]
	}
	return &DocsHandler{
		version: v,
		spec:    docs.GetSpec(v),
		DB:      dbConn,
	}
}

// ServeOpenAPISpec serves the dynamic live openapi.yml spec file.
func (h *DocsHandler) ServeOpenAPISpec(c *echo.Context) error {
	specMap, err := h.BuildLiveSpec()
	if err != nil {
		return c.Blob(http.StatusOK, "text/yaml; charset=utf-8", h.spec)
	}

	bytes, err := yaml.Marshal(specMap)
	if err != nil {
		logger.Error("Failed to marshal dynamic openapi spec to YAML", "err", err)
		return c.Blob(http.StatusOK, "text/yaml; charset=utf-8", h.spec)
	}

	return c.Blob(http.StatusOK, "text/yaml; charset=utf-8", bytes)
}

// ServeOpenAPISpecJSON serves the dynamic live openapi.json spec file.
func (h *DocsHandler) ServeOpenAPISpecJSON(c *echo.Context) error {
	specMap, err := h.BuildLiveSpec()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate openapi JSON spec")
	}

	bytes, err := json.MarshalIndent(specMap, "", "  ")
	if err != nil {
		logger.Error("Failed to marshal dynamic openapi spec to JSON", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate openapi JSON spec")
	}

	return c.Blob(http.StatusOK, "application/json; charset=utf-8", bytes)
}

// BuildLiveSpec parses base spec and dynamically appends schema definitions and endpoints for all DB collections.
func (h *DocsHandler) BuildLiveSpec() (map[string]interface{}, error) {
	var root map[string]interface{}
	if err := yaml.Unmarshal(h.spec, &root); err != nil {
		return nil, fmt.Errorf("failed to unmarshal base openapi spec: %w", err)
	}

	if h.DB == nil {
		return root, nil
	}

	mouls, err := db.LoadAllMoul(h.DB)
	if err != nil {
		logger.Error("Failed to load collections for live docs spec", "err", err)
		return root, nil
	}

	components, ok := root["components"].(map[string]interface{})
	if !ok || components == nil {
		components = make(map[string]interface{})
		root["components"] = components
	}

	schemas, ok := components["schemas"].(map[string]interface{})
	if !ok || schemas == nil {
		schemas = make(map[string]interface{})
		components["schemas"] = schemas
	}

	paths, ok := root["paths"].(map[string]interface{})
	if !ok || paths == nil {
		paths = make(map[string]interface{})
		root["paths"] = paths
	}

	tags, ok := root["tags"].([]interface{})
	if !ok {
		tags = []interface{}{}
	}

	for _, moul := range mouls {
		tagName := "Collection: " + moul.Name
		tagDesc := fmt.Sprintf("Dynamic %s collection. Rules: listRule=%q, createRule=%q, viewRule=%q, updateRule=%q, deleteRule=%q.",
			moul.Type, moul.Rules.ListRule, moul.Rules.CreateRule, moul.Rules.ViewRule, moul.Rules.UpdateRule, moul.Rules.DeleteRule)

		tags = append(tags, map[string]interface{}{
			"name":        tagName,
			"description": tagDesc,
		})

		// 1. Build schema definition for this collection
		recordProps := map[string]interface{}{
			"id": map[string]interface{}{
				"type":        "string",
				"description": "Unique record identifier",
				"example":     fmt.Sprintf("%s-abc123xyz", moul.Name),
			},
			"created_at": map[string]interface{}{
				"type":        "string",
				"format":      "date-time",
				"description": "RFC3339 timestamp when record was created",
			},
			"updated_at": map[string]interface{}{
				"type":        "string",
				"format":      "date-time",
				"description": "RFC3339 timestamp when record was last updated",
			},
		}

		inputProps := map[string]interface{}{}
		var requiredInputFields []string
		examplePayload := map[string]interface{}{}

		if moul.Type == "auth" {
			recordProps["username"] = map[string]interface{}{
				"type":        "string",
				"description": "Unique username",
				"example":     "johndoe",
			}
			recordProps["email"] = map[string]interface{}{
				"type":        "string",
				"format":      "email",
				"description": "User email address",
				"example":     "john@example.com",
			}

			inputProps["username"] = recordProps["username"]
			inputProps["email"] = recordProps["email"]
			inputProps["password"] = map[string]interface{}{
				"type":        "string",
				"description": "Account password (plain text; securely hashed with bcrypt)",
				"example":     "Password123",
			}
			inputProps["passwordConfirm"] = map[string]interface{}{
				"type":        "string",
				"description": "Password confirmation (must match password)",
				"example":     "Password123",
			}

			requiredInputFields = append(requiredInputFields, "username", "email", "password", "passwordConfirm")
			examplePayload["username"] = "johndoe"
			examplePayload["email"] = "john@example.com"
			examplePayload["password"] = "Password123"
			examplePayload["passwordConfirm"] = "Password123"
		}

		for _, field := range moul.Fields {
			fSchema, fExample := mapFieldToOpenAPISchema(field)
			recordProps[field.Name] = fSchema
			inputProps[field.Name] = fSchema
			if fExample != nil {
				examplePayload[field.Name] = fExample
			}
		}

		schemas[moul.Name] = map[string]interface{}{
			"type":        "object",
			"description": fmt.Sprintf("%s record schema (%s collection)", moul.Name, moul.Type),
			"properties":  recordProps,
		}

		inputSchema := map[string]interface{}{
			"type":        "object",
			"description": fmt.Sprintf("Input payload schema for %s collection", moul.Name),
			"properties":  inputProps,
			"example":     examplePayload,
		}
		if len(requiredInputFields) > 0 {
			inputSchema["required"] = requiredInputFields
		}
		schemas[moul.Name+"Input"] = inputSchema

		// 2. Add Endpoints for Collection

		recordsPath := fmt.Sprintf("/api/moul/%s/records", moul.Name)
		paths[recordsPath] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     fmt.Sprintf("List Records (%s)", moul.Name),
				"description": fmt.Sprintf("Queries records in `%s` collection. Governed by listRule: `%s`.", moul.Name, moul.Rules.ListRule),
				"tags":        []string{tagName},
				"parameters": []map[string]interface{}{
					{"name": "page", "in": "query", "description": "Page number (1-indexed)", "schema": map[string]interface{}{"type": "integer", "default": 1}},
					{"name": "perPage", "in": "query", "description": "Items per page (max 1000)", "schema": map[string]interface{}{"type": "integer", "default": 30}},
					{"name": "after", "in": "query", "description": "Cursor record ID to fetch items after", "schema": map[string]interface{}{"type": "string"}},
					{"name": "sort", "in": "query", "description": "Sort expression (e.g. -created_at,name)", "schema": map[string]interface{}{"type": "string"}},
					{"name": "filter", "in": "query", "description": "Filter condition expression", "schema": map[string]interface{}{"type": "string"}},
					{"name": "expand", "in": "query", "description": "Comma-separated relation fields to inline expand", "schema": map[string]interface{}{"type": "string"}},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "List of matching records",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type":  "array",
									"items": map[string]interface{}{"$ref": "#/components/schemas/" + moul.Name},
								},
							},
						},
					},
				},
			},
			"post": map[string]interface{}{
				"summary":     fmt.Sprintf("Create Record (%s)", moul.Name),
				"description": fmt.Sprintf("Inserts a new record into `%s` collection. Governed by createRule: `%s`.", moul.Name, moul.Rules.CreateRule),
				"tags":        []string{tagName},
				"requestBody": map[string]interface{}{
					"required": true,
					"content": map[string]interface{}{
						"application/json": map[string]interface{}{
							"schema": map[string]interface{}{"$ref": "#/components/schemas/" + moul.Name + "Input"},
						},
					},
				},
				"responses": map[string]interface{}{
					"201": map[string]interface{}{
						"description": "Record created successfully",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{"$ref": "#/components/schemas/" + moul.Name},
							},
						},
					},
				},
			},
		}

		recordIDPath := fmt.Sprintf("/api/moul/%s/records/{id}", moul.Name)
		paths[recordIDPath] = map[string]interface{}{
			"get": map[string]interface{}{
				"summary":     fmt.Sprintf("Get Record (%s)", moul.Name),
				"description": fmt.Sprintf("Fetches record by ID from `%s` collection. Governed by viewRule: `%s`.", moul.Name, moul.Rules.ViewRule),
				"tags":        []string{tagName},
				"parameters": []map[string]interface{}{
					{"name": "id", "in": "path", "required": true, "description": "Record ID", "schema": map[string]interface{}{"type": "string"}},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Record found",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{"$ref": "#/components/schemas/" + moul.Name},
							},
						},
					},
				},
			},
			"patch": map[string]interface{}{
				"summary":     fmt.Sprintf("Update Record (%s)", moul.Name),
				"description": fmt.Sprintf("Updates record by ID in `%s` collection. Governed by updateRule: `%s`.", moul.Name, moul.Rules.UpdateRule),
				"tags":        []string{tagName},
				"parameters": []map[string]interface{}{
					{"name": "id", "in": "path", "required": true, "description": "Record ID", "schema": map[string]interface{}{"type": "string"}},
				},
				"requestBody": map[string]interface{}{
					"required": true,
					"content": map[string]interface{}{
						"application/json": map[string]interface{}{
							"schema": map[string]interface{}{"$ref": "#/components/schemas/" + moul.Name + "Input"},
						},
					},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Record updated successfully",
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{"$ref": "#/components/schemas/" + moul.Name},
							},
						},
					},
				},
			},
			"delete": map[string]interface{}{
				"summary":     fmt.Sprintf("Delete Record (%s)", moul.Name),
				"description": fmt.Sprintf("Deletes record by ID from `%s` collection. Governed by deleteRule: `%s`.", moul.Name, moul.Rules.DeleteRule),
				"tags":        []string{tagName},
				"parameters": []map[string]interface{}{
					{"name": "id", "in": "path", "required": true, "description": "Record ID", "schema": map[string]interface{}{"type": "string"}},
				},
				"responses": map[string]interface{}{
					"200": map[string]interface{}{
						"description": "Record deleted successfully",
					},
				},
			},
		}

		if moul.Type == "auth" {
			pwdPath := fmt.Sprintf("/api/moul/%s/auth-with-password", moul.Name)
			paths[pwdPath] = map[string]interface{}{
				"post": map[string]interface{}{
					"summary":     fmt.Sprintf("Password Authentication (%s)", moul.Name),
					"description": fmt.Sprintf("Authenticates credentials against `%s` collection and returns JWT token.", moul.Name),
					"tags":        []string{tagName},
					"requestBody": map[string]interface{}{
						"required": true,
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type":     "object",
									"required": []string{"identity", "password"},
									"properties": map[string]interface{}{
										"identity": map[string]interface{}{"type": "string", "example": "user@example.com"},
										"password": map[string]interface{}{"type": "string", "example": "Password123"},
									},
								},
								"example": map[string]interface{}{
									"identity": "user@example.com",
									"password": "Password123",
								},
							},
						},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Authentication successful",
							"content": map[string]interface{}{
								"application/json": map[string]interface{}{
									"schema": map[string]interface{}{"$ref": "#/components/schemas/AuthResponse"},
								},
							},
						},
					},
				},
			}
		}
	}

	root["tags"] = tags
	return root, nil
}

func mapFieldToOpenAPISchema(field schema.MoulField) (map[string]interface{}, interface{}) {
	s := map[string]interface{}{}
	var ex interface{}

	switch field.Type {
	case "text", "editor":
		s["type"] = "string"
		ex = "sample text"
	case "email":
		s["type"] = "string"
		s["format"] = "email"
		ex = "user@example.com"
	case "url":
		s["type"] = "string"
		s["format"] = "uri"
		ex = "https://example.com"
	case "file":
		s["type"] = "string"
		s["description"] = "File path or URL"
		ex = "/storage/uploads/file.png"
	case "number":
		s["type"] = "number"
		ex = 42
	case "bool":
		s["type"] = "boolean"
		ex = true
	case "date":
		s["type"] = "string"
		s["format"] = "date-time"
		ex = "2026-01-01T00:00:00Z"
	case "json":
		s["type"] = "object"
		ex = map[string]interface{}{"key": "value"}
	case "select":
		s["type"] = "string"
		s["enum"] = field.Options
		if len(field.Options) > 0 {
			ex = field.Options[0]
		} else {
			ex = "option1"
		}
	case "relation":
		if field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
			s["type"] = "array"
			s["items"] = map[string]interface{}{"type": "string"}
			ex = []string{fmt.Sprintf("%s-123", field.RelationConfig.TargetMoul)}
		} else {
			s["type"] = "string"
			target := "record"
			if field.RelationConfig != nil {
				target = field.RelationConfig.TargetMoul
			}
			ex = fmt.Sprintf("%s-123", target)
		}
	default:
		s["type"] = "string"
		ex = "value"
	}

	s["example"] = ex
	return s, ex
}

// ServeAPIDocs serves the interactive HTML API documentation viewer.
func (h *DocsHandler) ServeAPIDocs(c *echo.Context) error {
	ui := c.QueryParam("ui")
	html := scalarUIHTML
	if ui == "swagger" {
		html = swaggerUIHTML
	}
	rendered := strings.ReplaceAll(html, "{{VERSION}}", h.version)
	return c.HTML(http.StatusOK, rendered)
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
      <span class="badge">{{VERSION}}</span>
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
      <span class="badge">{{VERSION}}</span>
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
