package handlers_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestDocsEndpoints(t *testing.T) {
	e := echo.New()
	docsHandler := handlers.NewDocsHandler(nil)

	e.GET("/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/openapi.json", docsHandler.ServeOpenAPISpecJSON)
	e.GET("/docs/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/docs/openapi.json", docsHandler.ServeOpenAPISpecJSON)
	e.GET("/docs", docsHandler.ServeAPIDocs)
	e.GET("/docs/", docsHandler.ServeAPIDocs)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	t.Run("GET /openapi.yml serves spec with default dev version", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/openapi.yml")
		if err != nil {
			t.Fatalf("GET /openapi.yml failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200 OK, got %d", resp.StatusCode)
		}
		contentType := resp.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "text/yaml") {
			t.Errorf("Expected Content-Type starting with text/yaml, got %s", contentType)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "Moul API Reference") {
			t.Errorf("Expected body to contain 'Moul API Reference', got snippet: %s", string(body[:100]))
		}
		if !strings.Contains(string(body), "version: dev") {
			t.Errorf("Expected spec to contain 'version: dev'")
		}
	})

	t.Run("GET /openapi.json serves JSON spec with default dev version", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/openapi.json")
		if err != nil {
			t.Fatalf("GET /openapi.json failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200 OK, got %d", resp.StatusCode)
		}
		contentType := resp.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "application/json") {
			t.Errorf("Expected Content-Type starting with application/json, got %s", contentType)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "\"title\": \"Moul API Reference\"") {
			t.Errorf("Expected body to contain '\"title\": \"Moul API Reference\"'")
		}
	})

	t.Run("GET /docs/openapi.yml serves spec alias", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/docs/openapi.yml")
		if err != nil {
			t.Fatalf("GET /docs/openapi.yml failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200 OK, got %d", resp.StatusCode)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "openapi: 3.0.3") {
			t.Errorf("Expected body to contain 'openapi: 3.0.3'")
		}
	})

	t.Run("GET /docs serves Scalar UI by default", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/docs")
		if err != nil {
			t.Fatalf("GET /docs failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200 OK, got %d", resp.StatusCode)
		}
		contentType := resp.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "text/html") {
			t.Errorf("Expected Content-Type text/html, got %s", contentType)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "Scalar UI") || !strings.Contains(string(body), "@scalar/api-reference") {
			t.Errorf("Expected body to contain Scalar API Reference UI setup")
		}
		if !strings.Contains(string(body), "<span class=\"badge\">dev</span>") {
			t.Errorf("Expected badge to display dev version")
		}
	})

	t.Run("GET /docs?ui=swagger serves Swagger UI", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/docs?ui=swagger")
		if err != nil {
			t.Fatalf("GET /docs?ui=swagger failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200 OK, got %d", resp.StatusCode)
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "SwaggerUIBundle") {
			t.Errorf("Expected body to contain SwaggerUIBundle setup")
		}
		if !strings.Contains(string(body), "<span class=\"badge\">dev</span>") {
			t.Errorf("Expected badge to display dev version")
		}
	})
}

func TestDocsEndpointsCustomVersion(t *testing.T) {
	e := echo.New()
	releaseVersion := "v2026.7"
	docsHandler := handlers.NewDocsHandler(nil, releaseVersion)

	e.GET("/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/docs", docsHandler.ServeAPIDocs)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	t.Run("GET /openapi.yml serves spec with release version", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/openapi.yml")
		if err != nil {
			t.Fatalf("GET /openapi.yml failed: %v", err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "version: v2026.7") {
			t.Errorf("Expected spec to contain 'version: v2026.7', got body snippet:\n%s", string(body[:200]))
		}
	})

	t.Run("GET /docs displays release version badge", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/docs")
		if err != nil {
			t.Fatalf("GET /docs failed: %v", err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		if !strings.Contains(string(body), "<span class=\"badge\">v2026.7</span>") {
			t.Errorf("Expected badge to display 'v2026.7'")
		}
	})
}

func TestDynamicLiveDocsSpec(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer dbConn.Close()

	testMoul := &schema.Moul{
		ID:   "moul-products",
		Name: "products",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "number"},
			{Name: "description", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule:   "",
			CreateRule: "@request.auth.id != ''",
			ViewRule:   "",
			UpdateRule: "@request.auth.id != ''",
			DeleteRule: "@request.auth.id != ''",
		},
	}
	if err := db.CreateMoulTable(dbConn, testMoul); err != nil {
		t.Fatalf("Failed to create test moul table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, testMoul); err != nil {
		t.Fatalf("Failed to save test moul metadata: %v", err)
	}

	e := echo.New()
	docsHandler := handlers.NewDocsHandler(dbConn, "v2026.7")
	e.GET("/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/openapi.json", docsHandler.ServeOpenAPISpecJSON)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	t.Run("Live OpenAPI spec dynamically includes created collection and endpoints", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/openapi.yml")
		if err != nil {
			t.Fatalf("GET /openapi.yml failed: %v", err)
		}
		defer resp.Body.Close()

		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		bodyStr := string(bodyBytes)

		if !strings.Contains(bodyStr, "Collection: products") {
			t.Errorf("Expected live spec to contain 'Collection: products'")
		}
		if !strings.Contains(bodyStr, "/api/moul/products/records") {
			t.Errorf("Expected live spec to contain '/api/moul/products/records'")
		}
		if !strings.Contains(bodyStr, "productsInput:") || !strings.Contains(bodyStr, "price:") {
			t.Errorf("Expected live spec to contain products schema and fields")
		}
	})

	t.Run("Live OpenAPI JSON spec dynamically includes created collection", func(t *testing.T) {
		resp, err := client.Get(server.URL + "/openapi.json")
		if err != nil {
			t.Fatalf("GET /openapi.json failed: %v", err)
		}
		defer resp.Body.Close()

		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		bodyStr := string(bodyBytes)

		if !strings.Contains(bodyStr, "\"/api/moul/products/records\"") {
			t.Errorf("Expected live JSON spec to contain '/api/moul/products/records'")
		}
		if !strings.Contains(bodyStr, "\"products\"") {
			t.Errorf("Expected live JSON spec to contain products schema")
		}
	})

	t.Run("OpenAPI spec includes enum for select field", func(t *testing.T) {
		moulWithSelect := schema.Moul{
			Name: "orders",
			Type: "base",
			Fields: []schema.MoulField{
				{Name: "status", Type: "select", Options: []string{"pending", "shipped", "delivered"}},
			},
		}
		if err := db.SaveMoulMetadata(dbConn, &moulWithSelect); err != nil {
			t.Fatalf("Failed to save moul metadata: %v", err)
		}

		resp, err := client.Get(server.URL + "/openapi.json")
		if err != nil {
			t.Fatalf("GET /openapi.json failed: %v", err)
		}
		defer resp.Body.Close()

		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("Failed to read body: %v", err)
		}
		bodyStr := string(bodyBytes)

		if !strings.Contains(bodyStr, "\"enum\":[\"pending\",\"shipped\",\"delivered\"]") &&
			!strings.Contains(bodyStr, "\"enum\": [\"pending\", \"shipped\", \"delivered\"]") &&
			!strings.Contains(bodyStr, "\"pending\"") {
			t.Errorf("Expected live JSON spec to contain select field enum values, got snippet: %s", bodyStr)
		}
	})
}
