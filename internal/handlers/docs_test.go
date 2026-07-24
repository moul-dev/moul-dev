package handlers_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/handlers"
)

func TestDocsEndpoints(t *testing.T) {
	e := echo.New()
	docsHandler := handlers.NewDocsHandler()

	e.GET("/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/docs/openapi.yml", docsHandler.ServeOpenAPISpec)
	e.GET("/docs", docsHandler.ServeAPIDocs)
	e.GET("/docs/", docsHandler.ServeAPIDocs)

	server := httptest.NewServer(e)
	defer server.Close()

	client := server.Client()

	t.Run("GET /openapi.yml serves spec", func(t *testing.T) {
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
	})
}
