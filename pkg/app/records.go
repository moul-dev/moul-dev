package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/hooks"
	"github.com/pocketbase/dbx"
)

// RecordEvent describes a record change passed to record hooks.
type RecordEvent = hooks.Event

// RecordHook is called around record changes. An error returned by a before hook aborts the
// change (return an *echo.HTTPError to choose the HTTP status; 400 otherwise). Errors of after
// hooks are logged.
type RecordHook = hooks.Handler

// RecordAction is the kind of record change.
type RecordAction = hooks.Action

// Record change actions.
const (
	RecordCreate = hooks.Create
	RecordUpdate = hooks.Update
	RecordDelete = hooks.Delete
)

// RecordList is one page of records returned by Records.List.
type RecordList = handlers.ListResult

func (a *App) recordHooks() *hooks.Registry {
	if a.hooks == nil {
		a.hooks = hooks.NewRegistry()
	}
	return a.hooks
}

// OnRecordBeforeCreate runs fn before a record of collections (all when none is given) is
// inserted, over HTTP or through Records. fn may change e.Record (the values to store) or return an
// error to refuse the change. Register hooks before Bootstrap.
func (a *App) OnRecordBeforeCreate(fn RecordHook, collections ...string) {
	a.recordHooks().OnBefore(hooks.Create, fn, collections...)
}

// OnRecordAfterCreate runs fn after a record of collections was inserted.
func (a *App) OnRecordAfterCreate(fn RecordHook, collections ...string) {
	a.recordHooks().OnAfter(hooks.Create, fn, collections...)
}

// OnRecordBeforeUpdate runs fn before a record of collections is updated; e.Record holds the
// changed values and e.OldRecord the stored record.
func (a *App) OnRecordBeforeUpdate(fn RecordHook, collections ...string) {
	a.recordHooks().OnBefore(hooks.Update, fn, collections...)
}

// OnRecordAfterUpdate runs fn after a record of collections was updated.
func (a *App) OnRecordAfterUpdate(fn RecordHook, collections ...string) {
	a.recordHooks().OnAfter(hooks.Update, fn, collections...)
}

// OnRecordBeforeDelete runs fn before a record of collections is deleted (cascaded deletes
// included).
func (a *App) OnRecordBeforeDelete(fn RecordHook, collections ...string) {
	a.recordHooks().OnBefore(hooks.Delete, fn, collections...)
}

// OnRecordAfterDelete runs fn after a record of collections was deleted.
func (a *App) OnRecordAfterDelete(fn RecordHook, collections ...string) {
	a.recordHooks().OnAfter(hooks.Delete, fn, collections...)
}

// Records is the Go API for collection records. Every operation runs the same pipeline as the
// HTTP API (field validation, rules, webhooks, realtime events, file tracking and record hooks),
// so programmatic writes reach subscribers and hooks like any other write.
type Records struct {
	app    *App
	caller handlers.Caller
}

// Records returns the record API acting with admin rights (rules are not evaluated). Use AsUser to
// act as a user under the collection rules. Available after Bootstrap.
func (a *App) Records() *Records {
	return &Records{app: a, caller: handlers.Caller{Admin: true}}
}

// AsUser returns the record API acting as record id of auth collection (or of "_rootUsers"):
// collection rules apply exactly as for that user's HTTP requests.
func (r *Records) AsUser(collection, id string) (*Records, error) {
	if r.app.dbConn == nil {
		return nil, errors.New("records: call Bootstrap first")
	}
	if collection != "_rootUsers" {
		m, err := db.LoadMoulByName(r.app.dbConn, collection)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, fmt.Errorf("records: collection %q not found", collection)
			}
			return nil, fmt.Errorf("records: %w", err)
		}
		if m.Type != "auth" {
			return nil, fmt.Errorf("records: %q is not an auth collection", collection)
		}
	}
	var user struct {
		ID       string `db:"id"`
		Email    string `db:"email"`
		Username string `db:"username"`
	}
	if err := r.app.dbConn.Select("id", "email", "username").From(collection).Where(dbx.HashExp{"id": id}).One(&user); err != nil {
		return nil, fmt.Errorf("records: user %s/%s: %w", collection, id, err)
	}
	return &Records{app: r.app, caller: handlers.Caller{Auth: map[string]interface{}{
		"id":       user.ID,
		"email":    user.Email,
		"username": user.Username,
		"moul":     collection,
	}}}, nil
}

func (r *Records) dispatcher() (*handlers.RecordDispatcher, error) {
	if r.app.recordDispatcher == nil {
		return nil, errors.New("records: call Bootstrap first")
	}
	return r.app.recordDispatcher, nil
}

// Create inserts a record into collection and returns it as the caller may see it.
func (r *Records) Create(ctx context.Context, collection string, data map[string]interface{}) (map[string]interface{}, error) {
	d, err := r.dispatcher()
	if err != nil {
		return nil, err
	}
	return d.Create(ctx, r.caller, collection, data)
}

// Update changes the fields in data of record id.
func (r *Records) Update(ctx context.Context, collection, id string, data map[string]interface{}) (map[string]interface{}, error) {
	d, err := r.dispatcher()
	if err != nil {
		return nil, err
	}
	return d.Update(ctx, r.caller, collection, id, data)
}

// Delete removes record id, cascading like the HTTP API.
func (r *Records) Delete(ctx context.Context, collection, id string) error {
	d, err := r.dispatcher()
	if err != nil {
		return err
	}
	return d.Delete(ctx, r.caller, collection, id)
}

// Get reads record id; query may carry "expand" and "reveal".
func (r *Records) Get(ctx context.Context, collection, id string, query url.Values) (map[string]interface{}, error) {
	d, err := r.dispatcher()
	if err != nil {
		return nil, err
	}
	return d.Get(ctx, r.caller, collection, id, query)
}

// List reads a page of records; query takes the HTTP API's parameters (filter, sort, page, perPage,
// search, expand, after).
func (r *Records) List(ctx context.Context, collection string, query url.Values) (*RecordList, error) {
	d, err := r.dispatcher()
	if err != nil {
		return nil, err
	}
	return d.List(ctx, r.caller, collection, query)
}

// Notify announces a change your code made outside Records (raw SQL or a custom transaction), after
// it committed: after hooks, after webhooks and realtime subscribers see it as an API write, and
// file references are updated. For RecordDelete pass the deleted record as old.
func (r *Records) Notify(ctx context.Context, action RecordAction, collection, id string, old map[string]interface{}) error {
	d, err := r.dispatcher()
	if err != nil {
		return err
	}
	return d.Notify(ctx, r.caller, action, collection, id, old)
}
