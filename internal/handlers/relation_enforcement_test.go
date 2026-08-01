package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func setupRelationTestServer(t *testing.T) (*httptest.Server, *http.Client, func()) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}

	e := echo.New()
	e.Use(middleware.LoadAuthContextMiddleware())

	moulHandler := handlers.NewMoulHandler(dbConn)
	recordHandler := handlers.NewRecordHandler(dbConn)

	e.POST("/api/moul", moulHandler.CreateMoul)
	e.POST("/api/moul/:name/records", recordHandler.CreateRecord)
	e.GET("/api/moul/:name/records", recordHandler.ListRecords)
	e.GET("/api/moul/:name/records/:id", recordHandler.GetRecord)
	e.PATCH("/api/moul/:name/records/:id", recordHandler.UpdateRecord)
	e.DELETE("/api/moul/:name/records/:id", recordHandler.DeleteRecord)

	server := httptest.NewServer(e)
	cleanup := func() {
		server.Close()
		dbConn.Close()
	}

	return server, server.Client(), cleanup
}

func postJSONReq(t *testing.T, client *http.Client, url string, payload interface{}) *http.Response {
	data, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP POST error: %v", err)
	}
	return resp
}

func getJSONReq(t *testing.T, client *http.Client, url string) *http.Response {
	req, _ := http.NewRequest("GET", url, nil)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP GET error: %v", err)
	}
	return resp
}

func deleteReq(t *testing.T, client *http.Client, url string) *http.Response {
	req, _ := http.NewRequest("DELETE", url, nil)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP DELETE error: %v", err)
	}
	return resp
}

func parseJSONBody(t *testing.T, resp *http.Response, target interface{}) {
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read body: %v", err)
	}
	if err := json.Unmarshal(bodyBytes, target); err != nil {
		t.Fatalf("Failed to unmarshal JSON body (%s): %v", string(bodyBytes), err)
	}
}

func TestRelationOnDeleteRestrict(t *testing.T) {
	server, client, cleanup := setupRelationTestServer(t)
	defer cleanup()

	// 1. Create target collection 'authors'
	createAuthorsPayload := schema.Moul{
		Name: "authors",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	}
	resp := postJSONReq(t, client, server.URL+"/api/moul", createAuthorsPayload)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for authors, got %d", resp.StatusCode)
	}

	// 2. Create collection 'books' referencing 'authors' with RESTRICT
	createBooksPayload := schema.Moul{
		Name: "books",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{
				Name: "author",
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  "authors",
					Cardinality: "1:N",
					OnDelete:    "RESTRICT",
				},
			},
		},
	}
	resp = postJSONReq(t, client, server.URL+"/api/moul", createBooksPayload)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for books, got %d", resp.StatusCode)
	}

	// 3. Create an author record
	resp = postJSONReq(t, client, server.URL+"/api/moul/authors/records", map[string]interface{}{"name": "J.K. Rowling"})
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for author record, got %d", resp.StatusCode)
	}
	var authorRec map[string]interface{}
	parseJSONBody(t, resp, &authorRec)
	authorID := authorRec["id"].(string)

	// 4. Create a book record referencing the author
	resp = postJSONReq(t, client, server.URL+"/api/moul/books/records", map[string]interface{}{"title": "Harry Potter", "author": authorID})
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for book record, got %d", resp.StatusCode)
	}

	// 5. Attempt to delete author record -> should fail with HTTP 400 Bad Request (RESTRICT)
	resp = deleteReq(t, client, server.URL+"/api/moul/authors/records/"+authorID)
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request when deleting author with RESTRICT constraint, got %d", resp.StatusCode)
	}
}

func TestRelationOnDeleteCascade(t *testing.T) {
	server, client, cleanup := setupRelationTestServer(t)
	defer cleanup()

	// 1. Create target collection 'categories'
	createCatPayload := schema.Moul{
		Name: "categories",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	}
	resp := postJSONReq(t, client, server.URL+"/api/moul", createCatPayload)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for categories, got %d", resp.StatusCode)
	}

	// 2. Create collection 'articles' referencing 'categories' with CASCADE
	createArticlesPayload := schema.Moul{
		Name: "articles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "headline", Type: "text"},
			{
				Name: "category",
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  "categories",
					Cardinality: "1:N",
					OnDelete:    "CASCADE",
				},
			},
		},
	}
	resp = postJSONReq(t, client, server.URL+"/api/moul", createArticlesPayload)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for articles, got %d", resp.StatusCode)
	}

	// 3. Create category record
	resp = postJSONReq(t, client, server.URL+"/api/moul/categories/records", map[string]interface{}{"name": "Tech"})
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for category, got %d", resp.StatusCode)
	}
	var catRec map[string]interface{}
	parseJSONBody(t, resp, &catRec)
	catID := catRec["id"].(string)

	// 4. Create two articles in this category
	resp = postJSONReq(t, client, server.URL+"/api/moul/articles/records", map[string]interface{}{"headline": "Go 1.26 Released", "category": catID})
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for article 1, got %d", resp.StatusCode)
	}
	var art1 map[string]interface{}
	parseJSONBody(t, resp, &art1)
	art1ID := art1["id"].(string)

	// 5. Delete category -> articles should be CASCADE deleted
	resp = deleteReq(t, client, server.URL+"/api/moul/categories/records/"+catID)
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("Expected 204 No Content for category deletion, got %d", resp.StatusCode)
	}

	// 6. Check article 1 is deleted
	resp = getJSONReq(t, client, server.URL+"/api/moul/articles/records/"+art1ID)
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("Expected 404 Not Found for cascaded article, got %d", resp.StatusCode)
	}
}

func TestRelationOneToOneUniqueness(t *testing.T) {
	server, client, cleanup := setupRelationTestServer(t)
	defer cleanup()

	// 1. Create target collection 'users'
	postJSONReq(t, client, server.URL+"/api/moul", schema.Moul{
		Name: "users",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	})

	// 2. Create collection 'profiles' with 1:1 relation to 'users'
	postJSONReq(t, client, server.URL+"/api/moul", schema.Moul{
		Name: "profiles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "bio", Type: "text"},
			{
				Name: "user",
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  "users",
					Cardinality: "1:1",
					OnDelete:    "CASCADE",
				},
			},
		},
	})

	// 3. Create a user record
	resp := postJSONReq(t, client, server.URL+"/api/moul/users/records", map[string]interface{}{"name": "alice"})
	var uRec map[string]interface{}
	parseJSONBody(t, resp, &uRec)
	userID := uRec["id"].(string)

	// 4. Create first profile referencing user -> should succeed
	resp = postJSONReq(t, client, server.URL+"/api/moul/profiles/records", map[string]interface{}{"bio": "Alice Bio", "user": userID})
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 for first profile, got %d", resp.StatusCode)
	}

	// 5. Create second profile referencing same user -> should fail with 400 Bad Request
	resp = postJSONReq(t, client, server.URL+"/api/moul/profiles/records", map[string]interface{}{"bio": "Duplicate Bio", "user": userID})
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for duplicate 1:1 relation reference, got %d", resp.StatusCode)
	}
}

func TestRelationalPathFilteringAndSorting(t *testing.T) {
	server, client, cleanup := setupRelationTestServer(t)
	defer cleanup()

	// 1. Create collections 'writers' and 'posts'
	postJSONReq(t, client, server.URL+"/api/moul", schema.Moul{
		Name: "writers",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "name", Type: "text"},
		},
	})

	postJSONReq(t, client, server.URL+"/api/moul", schema.Moul{
		Name: "posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{
				Name: "writer",
				Type: "relation",
				RelationConfig: &schema.RelationConfig{
					TargetMoul:  "writers",
					Cardinality: "1:N",
				},
			},
		},
	})

	// 2. Create writer Alice and writer Bob
	respAlice := postJSONReq(t, client, server.URL+"/api/moul/writers/records", map[string]interface{}{"name": "Alice"})
	var alice map[string]interface{}
	parseJSONBody(t, respAlice, &alice)
	aliceID := alice["id"].(string)

	respBob := postJSONReq(t, client, server.URL+"/api/moul/writers/records", map[string]interface{}{"name": "Bob"})
	var bob map[string]interface{}
	parseJSONBody(t, respBob, &bob)
	bobID := bob["id"].(string)

	// 3. Create posts
	postJSONReq(t, client, server.URL+"/api/moul/posts/records", map[string]interface{}{"title": "Post by Alice", "writer": aliceID})
	postJSONReq(t, client, server.URL+"/api/moul/posts/records", map[string]interface{}{"title": "Post by Bob", "writer": bobID})

	// 4. Query posts filtered by writer.name = "Alice"
	resp := getJSONReq(t, client, server.URL+"/api/moul/posts/records?filter=writer.name='Alice'")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for relational filter query, got %d", resp.StatusCode)
	}
	var filterResult map[string]interface{}
	parseJSONBody(t, resp, &filterResult)

	items := filterResult["items"].([]interface{})
	if len(items) != 1 {
		t.Fatalf("Expected 1 post matching writer.name='Alice', got %d", len(items))
	}
	pMap := items[0].(map[string]interface{})
	if pMap["title"] != "Post by Alice" {
		t.Fatalf("Expected 'Post by Alice', got %v", pMap["title"])
	}

	// 5. Query posts sorted by -writer.name
	resp = getJSONReq(t, client, server.URL+"/api/moul/posts/records?sort=-writer.name")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for relational sort query, got %d", resp.StatusCode)
	}
	var sortResult map[string]interface{}
	parseJSONBody(t, resp, &sortResult)

	sortItems := sortResult["items"].([]interface{})
	if len(sortItems) != 2 {
		t.Fatalf("Expected 2 posts, got %d", len(sortItems))
	}
	firstPost := sortItems[0].(map[string]interface{})
	// "Bob" > "Alice", so DESC sort should return Bob first
	if firstPost["title"] != "Post by Bob" {
		t.Fatalf("Expected first post in DESC sort to be 'Post by Bob', got %v", firstPost["title"])
	}
}
