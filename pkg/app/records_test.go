package app_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/pkg/app"
	"github.com/pocketbase/dbx"
)

// recordsTestApp boots an app with a users auth collection and a posts collection whose create
// rule pins the author to the caller.
func recordsTestApp(t *testing.T) *app.App {
	t.Helper()
	a := newTestApp(t)
	t.Cleanup(func() {
		if a.DB() != nil {
			if err := a.DB().Close(); err != nil {
				t.Errorf("close: %v", err)
			}
		}
	})
	return a
}

func seedRecordsSchema(t *testing.T, a *app.App) {
	t.Helper()
	users := &schema.Moul{ID: "m_users", Name: "users", Type: "auth",
		Rules: schema.MoulRules{ViewRule: "", ListRule: ""}}
	posts := &schema.Moul{ID: "m_posts", Name: "posts", Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "author", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
		},
		Rules: schema.MoulRules{CreateRule: "author = @request.auth.id", UpdateRule: "author = @request.auth.id", DeleteRule: "author = @request.auth.id"},
	}
	for _, m := range []*schema.Moul{users, posts} {
		if err := db.SaveMoulMetadata(a.DB(), m); err != nil {
			t.Fatal(err)
		}
		if err := db.CreateMoulTable(a.DB(), m); err != nil {
			t.Fatal(err)
		}
	}
	for _, id := range []string{"alice", "bob"} {
		if _, err := a.DB().Insert("users", dbx.Params{"id": id, "username": id, "email": id + "@example.com", "createdAt": "x", "updatedAt": "x"}).Execute(); err != nil {
			t.Fatal(err)
		}
	}
}

type hookLog struct {
	mu     sync.Mutex
	events []string
}

func (l *hookLog) add(s string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.events = append(l.events, s)
}

func (l *hookLog) has(s string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	for _, e := range l.events {
		if e == s {
			return true
		}
	}
	return false
}

// subscribe registers a realtime client for collection and returns its event channel.
func subscribe(t *testing.T, collection string) chan *realtime.Event {
	t.Helper()
	client := realtime.NewClient(collection, nil, true, "", "*", "")
	realtime.DefaultHub.Subscribe(client)
	t.Cleanup(func() { realtime.DefaultHub.Unsubscribe(client) })
	return client.Send
}

func expectEvent(t *testing.T, ch chan *realtime.Event, action, id string) {
	t.Helper()
	select {
	case ev := <-ch:
		if ev.Action != action || ev.Record["id"] != id {
			t.Fatalf("realtime event = %s %v, want %s %s", ev.Action, ev.Record["id"], action, id)
		}
	case <-time.After(2 * time.Second):
		t.Fatalf("no realtime %s event for %s", action, id)
	}
}

func TestRecords_HooksFireForHTTPAndGoWrites(t *testing.T) {
	a := recordsTestApp(t)
	var log hookLog
	a.OnRecordBeforeCreate(func(e *app.RecordEvent) error {
		if e.Record["title"] == "forbidden" {
			return errors.New("title is not allowed")
		}
		e.Record["title"] = e.Record["title"].(string) + "!"
		return nil
	}, "posts")
	a.OnRecordAfterCreate(func(e *app.RecordEvent) error {
		log.add("created:" + e.Record["title"].(string))
		return nil
	}, "posts")
	a.OnRecordAfterUpdate(func(e *app.RecordEvent) error {
		log.add("updated:" + e.OldRecord["title"].(string) + "->" + e.Record["title"].(string))
		return nil
	})
	a.OnRecordBeforeDelete(func(e *app.RecordEvent) error {
		if e.Record["title"] == "keep!" {
			return echo.NewHTTPError(http.StatusConflict, "this post is kept")
		}
		return nil
	}, "posts")
	a.OnRecordAfterDelete(func(e *app.RecordEvent) error {
		log.add("deleted:" + e.Record["id"].(string))
		return nil
	}, "posts")
	if err := a.Bootstrap(); err != nil {
		t.Fatal(err)
	}
	seedRecordsSchema(t, a)
	events := subscribe(t, "posts")
	ctx := context.Background()

	// Go write as admin: before hook rewrites the value, after hook and realtime fire.
	post, err := a.Records().Create(ctx, "posts", map[string]interface{}{"title": "hello", "author": "alice"})
	if err != nil {
		t.Fatal(err)
	}
	if post["title"] != "hello!" || !log.has("created:hello!") {
		t.Fatalf("create hooks: post=%v log=%v", post, log.events)
	}
	expectEvent(t, events, "create", post["id"].(string))

	// The same hooks run for HTTP writes.
	req := httptest.NewRequest(http.MethodPost, "/api/moul/posts/records", bytes.NewBufferString(`{"title":"web","author":"bob"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", "test-admin-key")
	rec := httptest.NewRecorder()
	a.Router().ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated || !log.has("created:web!") {
		t.Fatalf("HTTP create: %d %s log=%v", rec.Code, rec.Body.String(), log.events)
	}
	httpPost := map[string]interface{}{}
	if err := json.Unmarshal(rec.Body.Bytes(), &httpPost); err != nil {
		t.Fatal(err)
	}
	expectEvent(t, events, "create", httpPost["id"].(string))

	// A before hook refuses with 400 by default.
	_, err = a.Records().Create(ctx, "posts", map[string]interface{}{"title": "forbidden", "author": "alice"})
	var he *echo.HTTPError
	if !errors.As(err, &he) || he.Code != http.StatusBadRequest {
		t.Fatalf("refused create: %v", err)
	}

	id := post["id"].(string)
	if _, err := a.Records().Update(ctx, "posts", id, map[string]interface{}{"title": "keep!"}); err != nil {
		t.Fatal(err)
	}
	if !log.has("updated:hello!->keep!") {
		t.Fatalf("update hook: %v", log.events)
	}
	expectEvent(t, events, "update", id)

	// A before hook may choose the status.
	err = a.Records().Delete(ctx, "posts", id)
	if !errors.As(err, &he) || he.Code != http.StatusConflict {
		t.Fatalf("vetoed delete: %v", err)
	}
	if _, err := a.Records().Update(ctx, "posts", id, map[string]interface{}{"title": "bye"}); err != nil {
		t.Fatal(err)
	}
	expectEvent(t, events, "update", id)
	if err := a.Records().Delete(ctx, "posts", id); err != nil {
		t.Fatal(err)
	}
	if !log.has("deleted:" + id) {
		t.Fatalf("delete hook: %v", log.events)
	}
	expectEvent(t, events, "delete", id)
}

func TestRecords_AsUserAppliesRules(t *testing.T) {
	a := recordsTestApp(t)
	if err := a.Bootstrap(); err != nil {
		t.Fatal(err)
	}
	seedRecordsSchema(t, a)
	ctx := context.Background()

	alice, err := a.Records().AsUser("users", "alice")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := alice.Create(ctx, "posts", map[string]interface{}{"title": "mine", "author": "alice"}); err != nil {
		t.Fatalf("own post: %v", err)
	}
	_, err = alice.Create(ctx, "posts", map[string]interface{}{"title": "forged", "author": "bob"})
	var he *echo.HTTPError
	if !errors.As(err, &he) || he.Code != http.StatusForbidden {
		t.Fatalf("forged author: %v", err)
	}

	page, err := alice.List(ctx, "posts", nil)
	if err != nil || page.TotalItems != 1 {
		t.Fatalf("list: %+v %v", page, err)
	}
	if _, err := a.Records().AsUser("posts", "x"); err == nil {
		t.Fatal("AsUser accepted a non-auth collection")
	}
}

func TestRecords_NotifyRawWrites(t *testing.T) {
	a := recordsTestApp(t)
	var log hookLog
	a.OnRecordAfterCreate(func(e *app.RecordEvent) error {
		log.add("created:" + e.Record["id"].(string))
		return nil
	}, "posts")
	a.OnRecordAfterDelete(func(e *app.RecordEvent) error {
		log.add("deleted:" + e.Record["id"].(string))
		return nil
	}, "posts")
	if err := a.Bootstrap(); err != nil {
		t.Fatal(err)
	}
	seedRecordsSchema(t, a)
	events := subscribe(t, "posts")
	ctx := context.Background()

	// A custom transaction writes the row directly, then announces it.
	err := a.DB().Transactional(func(tx *dbx.Tx) error {
		_, err := tx.Insert("posts", dbx.Params{"id": "raw1", "title": "raw", "author": "alice", "createdAt": "x", "updatedAt": "x"}).Execute()
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := a.Records().Notify(ctx, app.RecordCreate, "posts", "raw1", nil); err != nil {
		t.Fatal(err)
	}
	if !log.has("created:raw1") {
		t.Fatalf("notify create: %v", log.events)
	}
	expectEvent(t, events, "create", "raw1")

	old, err := a.Records().Get(ctx, "posts", "raw1", nil)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := a.DB().Delete("posts", dbx.HashExp{"id": "raw1"}).Execute(); err != nil {
		t.Fatal(err)
	}
	if err := a.Records().Notify(ctx, app.RecordDelete, "posts", "raw1", old); err != nil {
		t.Fatal(err)
	}
	if !log.has("deleted:raw1") {
		t.Fatalf("notify delete: %v", log.events)
	}
	expectEvent(t, events, "delete", "raw1")

	if err := a.Records().Notify(ctx, app.RecordDelete, "posts", "raw1", nil); err == nil {
		t.Fatal("delete notification without the old record accepted")
	}
}

func TestRecords_RequiresBootstrap(t *testing.T) {
	a := newTestApp(t)
	if _, err := a.Records().Create(context.Background(), "posts", nil); err == nil {
		t.Fatal("Records worked before Bootstrap")
	}
}
