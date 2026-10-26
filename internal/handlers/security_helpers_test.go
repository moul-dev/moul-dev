package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

const securityTestAdminKey = "security-test-admin-key"

// securityEnv is a router over an in-memory database with a "users" auth collection, used by the
// access-control tests.
type securityEnv struct {
	t      *testing.T
	db     *dbx.DB
	router *echo.Echo
}

func newSecurityEnv(t *testing.T, mouls ...*schema.Moul) *securityEnv {
	t.Helper()
	auth.InitJWT("test-secret-key-for-unit-tests-1234")
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close db: %v", err)
		}
	})

	users := &schema.Moul{
		ID:     "moul_users",
		Name:   "users",
		Type:   "auth",
		Fields: []schema.MoulField{{Name: "displayName", Type: "text"}},
		Rules: schema.MoulRules{
			ListRule:   "",
			ViewRule:   "",
			CreateRule: "",
			UpdateRule: "id = @request.auth.id",
			DeleteRule: "id = @request.auth.id",
		},
	}
	for _, m := range append([]*schema.Moul{users}, mouls...) {
		if err := db.SaveMoulMetadata(dbConn, m); err != nil {
			t.Fatalf("SaveMoulMetadata(%s): %v", m.Name, err)
		}
		if err := db.CreateMoulTable(dbConn, m); err != nil {
			t.Fatalf("CreateMoulTable(%s): %v", m.Name, err)
		}
	}

	router := NewRouter(dbConn, nil, nil, nil, nil, nil, securityTestAdminKey, true, "test")
	return &securityEnv{t: t, db: dbConn, router: router}
}

// insertUser adds a row to the users collection and returns its id.
func (e *securityEnv) insertUser(id, email string) string {
	e.t.Helper()
	_, err := e.db.Insert("users", dbx.Params{
		"id":                  id,
		"username":            id,
		"email":               email,
		"resetToken":          "reset-" + id,
		"resetTokenExpiresAt": "2099-01-01T00:00:00Z",
		"oauthProviders":      `{"github":"gh-` + id + `"}`,
		"createdAt":           "2026-01-01T00:00:00Z",
		"updatedAt":           "2026-01-01T00:00:00Z",
	}).Execute()
	if err != nil {
		e.t.Fatalf("insert user %s: %v", id, err)
	}
	return id
}

// insert adds a raw row to a collection.
func (e *securityEnv) insert(table string, params dbx.Params) {
	e.t.Helper()
	if _, ok := params["createdAt"]; !ok {
		params["createdAt"] = "2026-01-01T00:00:00Z"
	}
	if _, ok := params["updatedAt"]; !ok {
		params["updatedAt"] = "2026-01-01T00:00:00Z"
	}
	if _, err := e.db.Insert(table, params).Execute(); err != nil {
		e.t.Fatalf("insert into %s: %v", table, err)
	}
}

// memberToken signs a token for a member of the users collection.
func (e *securityEnv) memberToken(id string) string {
	e.t.Helper()
	token, err := auth.GenerateToken(id, id+"@example.com", id, "users")
	if err != nil {
		e.t.Fatalf("GenerateToken: %v", err)
	}
	return token
}

// rootToken signs a token for a root user.
func (e *securityEnv) rootToken() string {
	e.t.Helper()
	token, err := auth.GenerateToken("root1", "root@example.com", "root", "_rootUsers")
	if err != nil {
		e.t.Fatalf("GenerateToken: %v", err)
	}
	return token
}

type caller struct {
	token    string
	adminKey string
	headers  map[string]string
}

var guest = caller{}

func bearer(token string) caller { return caller{token: token} }

func withAdminKey() caller { return caller{adminKey: securityTestAdminKey} }

// do sends a request through the router and returns the recorder.
func (e *securityEnv) do(method, target string, body interface{}, who caller) *httptest.ResponseRecorder {
	e.t.Helper()
	var reader io.Reader
	if body != nil {
		switch b := body.(type) {
		case string:
			reader = bytes.NewBufferString(b)
		default:
			raw, err := json.Marshal(b)
			if err != nil {
				e.t.Fatalf("marshal body: %v", err)
			}
			reader = bytes.NewReader(raw)
		}
	}
	req := httptest.NewRequest(method, target, reader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if who.token != "" {
		req.Header.Set("Authorization", "Bearer "+who.token)
	}
	if who.adminKey != "" {
		req.Header.Set("X-Admin-Key", who.adminKey)
	}
	for k, v := range who.headers {
		req.Header.Set(k, v)
	}
	rec := httptest.NewRecorder()
	e.router.ServeHTTP(rec, req)
	return rec
}

// decode unmarshals a JSON response body.
func decode[T any](t *testing.T, rec *httptest.ResponseRecorder) T {
	t.Helper()
	var out T
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode %q: %v", rec.Body.String(), err)
	}
	return out
}

func expectStatus(t *testing.T, rec *httptest.ResponseRecorder, want int) {
	t.Helper()
	if rec.Code != want {
		t.Fatalf("status = %d, want %d; body: %s", rec.Code, want, rec.Body.String())
	}
}

var _ = http.MethodGet
