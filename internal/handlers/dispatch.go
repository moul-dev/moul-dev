package handlers

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/hooks"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/webhooks"
	"github.com/pocketbase/dbx"
)

// Caller is who a dispatched record operation acts as: the admin (Auth nil, Admin true), or an
// auth record whose collection rules then apply (Admin false).
type Caller struct {
	Auth  map[string]interface{}
	Admin bool
}

// RecordDispatcher runs the record handlers in process for Go code, so programmatic writes get
// the same validation, rules, webhooks, realtime events, file tracking and hooks as HTTP writes.
type RecordDispatcher struct {
	handler *RecordHandler
	echo    *echo.Echo
}

// NewRecordDispatcher returns a dispatcher over h.
func NewRecordDispatcher(h *RecordHandler) *RecordDispatcher {
	return &RecordDispatcher{handler: h, echo: echo.New()}
}

// ListResult is one page of records.
type ListResult struct {
	Page       int                      `json:"page"`
	PerPage    int                      `json:"perPage"`
	TotalItems int                      `json:"totalItems"`
	TotalPages int                      `json:"totalPages"`
	Items      []map[string]interface{} `json:"items"`
}

// dispatch runs fn with a request built from method, body and query, as caller, and returns the
// status and body. Handler errors come back as *echo.HTTPError.
func (d *RecordDispatcher) dispatch(ctx context.Context, caller Caller, method string, params echo.PathValues, body interface{}, query url.Values, fn echo.HandlerFunc) (int, []byte, error) {
	var reader *bytes.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to encode record body: %w", err)
		}
		reader = bytes.NewReader(raw)
	} else {
		reader = bytes.NewReader(nil)
	}
	target := "/"
	if len(query) > 0 {
		target += "?" + query.Encode()
	}
	req := httptest.NewRequest(method, target, reader).WithContext(ctx)
	if body != nil {
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	}
	rec := httptest.NewRecorder()
	c := d.echo.NewContext(req, rec)
	c.SetPathValues(params)
	if caller.Auth != nil {
		c.Set(middleware.AuthContextKey, caller.Auth)
	}
	if caller.Admin {
		c.Set(internalAdminKey, true)
	}
	if err := fn(c); err != nil {
		return 0, nil, err
	}
	return rec.Code, rec.Body.Bytes(), nil
}

func decodeRecord(raw []byte) (map[string]interface{}, error) {
	var out map[string]interface{}
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("failed to decode record: %w", err)
	}
	return out, nil
}

// Create inserts a record into collection.
func (d *RecordDispatcher) Create(ctx context.Context, caller Caller, collection string, data map[string]interface{}) (map[string]interface{}, error) {
	_, raw, err := d.dispatch(ctx, caller, http.MethodPost, echo.PathValues{{Name: "name", Value: collection}}, data, nil, d.handler.CreateRecord)
	if err != nil {
		return nil, err
	}
	return decodeRecord(raw)
}

// Update changes the fields in data of record id.
func (d *RecordDispatcher) Update(ctx context.Context, caller Caller, collection, id string, data map[string]interface{}) (map[string]interface{}, error) {
	params := echo.PathValues{{Name: "name", Value: collection}, {Name: "id", Value: id}}
	_, raw, err := d.dispatch(ctx, caller, http.MethodPatch, params, data, nil, d.handler.UpdateRecord)
	if err != nil {
		return nil, err
	}
	return decodeRecord(raw)
}

// Delete removes record id (and cascades like the HTTP API).
func (d *RecordDispatcher) Delete(ctx context.Context, caller Caller, collection, id string) error {
	params := echo.PathValues{{Name: "name", Value: collection}, {Name: "id", Value: id}}
	_, _, err := d.dispatch(ctx, caller, http.MethodDelete, params, nil, nil, d.handler.DeleteRecord)
	return err
}

// Get reads record id. query may carry expand and reveal.
func (d *RecordDispatcher) Get(ctx context.Context, caller Caller, collection, id string, query url.Values) (map[string]interface{}, error) {
	params := echo.PathValues{{Name: "name", Value: collection}, {Name: "id", Value: id}}
	_, raw, err := d.dispatch(ctx, caller, http.MethodGet, params, nil, query, d.handler.GetRecord)
	if err != nil {
		return nil, err
	}
	return decodeRecord(raw)
}

// List reads a page of records. query takes the HTTP API's parameters (filter, sort, page,
// perPage, search, expand, after).
func (d *RecordDispatcher) List(ctx context.Context, caller Caller, collection string, query url.Values) (*ListResult, error) {
	_, raw, err := d.dispatch(ctx, caller, http.MethodGet, echo.PathValues{{Name: "name", Value: collection}}, nil, query, d.handler.ListRecords)
	if err != nil {
		return nil, err
	}
	var out ListResult
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("failed to decode record list: %w", err)
	}
	return &out, nil
}

// Notify announces a change made outside the record handlers (raw SQL, a custom transaction):
// file references are updated, and after hooks, after webhooks and realtime subscribers see it
// as if it had been made through the API. For create and update the record is read back by id;
// for delete, old must be the record as it was (it no longer exists). For update, old may be nil.
func (d *RecordDispatcher) Notify(ctx context.Context, caller Caller, action hooks.Action, collection, id string, old map[string]interface{}) error {
	h := d.handler
	moul, err := db.LoadMoulByName(h.DB, collection)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("collection %q not found", collection)
		}
		return fmt.Errorf("failed to load collection %q: %w", collection, err)
	}

	var record map[string]interface{}
	switch action {
	case hooks.Create, hooks.Update:
		var raw dbx.NullStringMap
		if err := h.DB.Select("*").From(collection).Where(dbx.HashExp{"id": id}).One(&raw); err != nil {
			return fmt.Errorf("failed to read %s/%s: %w", collection, id, err)
		}
		record = normalizeRecord(moul, nullStringMapToMap(raw), NormalizeOptions{IsAdmin: true})
		h.syncFileRefs(moul, record)
	case hooks.Delete:
		if old == nil {
			return fmt.Errorf("notifying a delete requires the deleted record")
		}
		record = copyRecord(old)
		if h.Files != nil {
			if err := h.Files.DeleteRecordRefs(collection, id); err != nil {
				return fmt.Errorf("failed to drop file references of %s/%s: %w", collection, id, err)
			}
		}
	default:
		return fmt.Errorf("unknown record action %q", action)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	webhooks.DispatchAfter(ctx, moul.Webhooks, webhooks.Payload{
		Event:     string(action) + ":after",
		Moul:      collection,
		Record:    record,
		OldRecord: old,
		Timestamp: now,
	})
	event := realtime.Event{Action: string(action), Moul: collection, Record: copyRecord(record), Timestamp: now}
	if old != nil {
		event.OldRecord = copyRecord(old)
	}
	realtime.DefaultHub.Publish(event, h.DB)
	return h.Hooks.RunAfter(hookActor{auth: caller.Auth, admin: caller.Admin}.event(ctx, action, collection, copyRecord(record), old))
}
