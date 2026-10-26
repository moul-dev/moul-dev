package hooks

import (
	"errors"
	"strings"
	"testing"
)

func TestRegistry(t *testing.T) {
	r := NewRegistry()
	var order []string
	r.OnBefore(Create, func(e *Event) error { order = append(order, "all"); return nil })
	r.OnBefore(Create, func(e *Event) error { order = append(order, "posts"); return nil }, "posts")
	r.OnBefore(Update, func(e *Event) error { order = append(order, "update"); return nil })
	r.OnBefore(Create, func(e *Event) error { return errors.New("stop") }, "locked")
	r.OnBefore(Create, func(e *Event) error { order = append(order, "after-stop"); return nil }, "locked")

	if err := r.RunBefore(&Event{Action: Create, Collection: "posts"}); err != nil {
		t.Fatal(err)
	}
	if strings.Join(order, ",") != "all,posts" {
		t.Fatalf("order = %v", order)
	}

	order = nil
	if err := r.RunBefore(&Event{Action: Create, Collection: "locked"}); err == nil || err.Error() != "stop" {
		t.Fatalf("RunBefore = %v", err)
	}
	if strings.Join(order, ",") != "all" {
		t.Fatalf("hooks after a refusal ran: %v", order)
	}

	r.OnAfter(Delete, func(e *Event) error { return errors.New("a") })
	r.OnAfter(Delete, func(e *Event) error { panic("boom") })
	err := r.RunAfter(&Event{Action: Delete, Collection: "posts"})
	if err == nil || !strings.Contains(err.Error(), "a") || !strings.Contains(err.Error(), "panicked: boom") {
		t.Fatalf("RunAfter = %v", err)
	}

	var nilRegistry *Registry
	if nilRegistry.RunBefore(&Event{Action: Create}) != nil || nilRegistry.RunAfter(&Event{Action: Create}) != nil {
		t.Fatal("nil registry should run nothing")
	}
}
