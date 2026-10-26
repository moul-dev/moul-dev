// Package hooks runs Go callbacks around record changes. The record handlers call them for every
// write, whether it came over HTTP or from Go code through pkg/app's Records API, so application
// logic (notifications, counters, extra validation) lives in one place.
package hooks

import (
	"context"
	"errors"
	"fmt"
	"sync"
)

// Action is the kind of record change.
type Action string

// Record change actions.
const (
	Create Action = "create"
	Update Action = "update"
	Delete Action = "delete"
)

// Event describes one record change.
type Event struct {
	Context    context.Context
	Action     Action
	Collection string
	// Record holds, for before hooks, the column values about to be stored (all of them on
	// create, the changed ones on update, the stored record on delete); a before hook may modify
	// them. For after hooks it is the stored record as an admin would read it.
	Record map[string]interface{}
	// OldRecord is the record before an update or delete.
	OldRecord map[string]interface{}
	// Auth is the caller's auth record (id, email, username, moul), nil for guests, the admin key
	// and Go code acting without a user.
	Auth map[string]interface{}
	// Admin reports whether the change was made with admin rights.
	Admin bool
}

// Handler is a record hook. An error returned by a before hook aborts the change; return an
// *echo.HTTPError to choose the status code (400 otherwise).
type Handler func(e *Event) error

type entry struct {
	action      Action
	collections map[string]bool // empty: every collection
	fn          Handler
}

func (en entry) matches(e *Event) bool {
	if en.action != e.Action {
		return false
	}
	return len(en.collections) == 0 || en.collections[e.Collection]
}

// Registry holds record hooks. The zero value is not usable; use NewRegistry.
type Registry struct {
	mu     sync.RWMutex
	before []entry
	after  []entry
}

// NewRegistry returns an empty Registry.
func NewRegistry() *Registry {
	return &Registry{}
}

func newEntry(action Action, fn Handler, collections []string) entry {
	en := entry{action: action, fn: fn, collections: map[string]bool{}}
	for _, c := range collections {
		if c != "" && c != "*" {
			en.collections[c] = true
		}
	}
	return en
}

// OnBefore registers fn to run before action on collections (all collections when none is given).
func (r *Registry) OnBefore(action Action, fn Handler, collections ...string) {
	if r == nil || fn == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.before = append(r.before, newEntry(action, fn, collections))
}

// OnAfter registers fn to run after action on collections (all collections when none is given).
func (r *Registry) OnAfter(action Action, fn Handler, collections ...string) {
	if r == nil || fn == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.after = append(r.after, newEntry(action, fn, collections))
}

func (r *Registry) matching(list []entry, e *Event) []Handler {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var out []Handler
	for _, en := range list {
		if en.matches(e) {
			out = append(out, en.fn)
		}
	}
	return out
}

// RunBefore runs the before hooks matching e in registration order and returns the first error.
func (r *Registry) RunBefore(e *Event) error {
	if r == nil {
		return nil
	}
	for _, fn := range r.matching(r.before, e) {
		if err := call(fn, e); err != nil {
			return err
		}
	}
	return nil
}

// RunAfter runs every after hook matching e and returns their errors joined. The change has
// already happened, so callers log these errors.
func (r *Registry) RunAfter(e *Event) error {
	if r == nil {
		return nil
	}
	var errs []error
	for _, fn := range r.matching(r.after, e) {
		if err := call(fn, e); err != nil {
			errs = append(errs, err)
		}
	}
	return errors.Join(errs...)
}

// call runs fn, turning a panic into an error so one hook cannot take the server down.
func call(fn Handler, e *Event) (err error) {
	defer func() {
		if p := recover(); p != nil {
			err = fmt.Errorf("record hook panicked: %v", p)
		}
	}()
	return fn(e)
}
