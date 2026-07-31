package webhooks_test

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/webhooks"
)

func TestEventMatching(t *testing.T) {
	tests := []struct {
		events   []string
		target   string
		expected bool
	}{
		{[]string{"create:before"}, "create:before", true},
		{[]string{"create:before"}, "create:after", false},
		{[]string{"create"}, "create:before", true},
		{[]string{"create"}, "create:after", true},
		{[]string{"*"}, "anything:before", true},
		{[]string{"all"}, "delete:after", true},
		{[]string{"update", "delete"}, "update:before", true},
		{[]string{"update", "delete"}, "create:before", false},
	}

	for _, tt := range tests {
		result := webhooks.MatchesEvent(tt.events, tt.target)
		if result != tt.expected {
			t.Errorf("MatchesEvent(%v, %q) = %v, want %v", tt.events, tt.target, result, tt.expected)
		}
	}
}

func TestComputeSignature(t *testing.T) {
	secret := "mysecret"
	body := []byte(`{"test":true}`)
	sig := webhooks.ComputeSignature(secret, body)
	if sig == "" {
		t.Fatal("Expected non-empty signature")
	}

	// Signature should change if body changes
	sig2 := webhooks.ComputeSignature(secret, []byte(`{"test":false}`))
	if sig == sig2 {
		t.Fatal("Expected signature to be different for different bodies")
	}
}

func TestDispatchBeforeSuccess(t *testing.T) {
	receivedHeader := ""
	receivedSig := ""
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedHeader = r.Header.Get("X-Moul-Event")
		receivedSig = r.Header.Get("X-Moul-Signature")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	}))
	defer server.Close()

	hook := schema.Webhook{
		ID:      "hook1",
		URL:     server.URL,
		Events:  []string{"create:before"},
		Secret:  "secret123",
		Enabled: true,
	}

	payload := webhooks.Payload{
		Event:     "create:before",
		Moul:      "posts",
		Record:    map[string]interface{}{"title": "Hello"},
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	err := webhooks.DispatchBefore(context.Background(), []schema.Webhook{hook}, payload)
	if err != nil {
		t.Fatalf("Expected DispatchBefore to succeed, got: %v", err)
	}

	if receivedHeader != "create:before" {
		t.Errorf("Expected X-Moul-Event header 'create:before', got %q", receivedHeader)
	}
	if receivedSig == "" {
		t.Error("Expected X-Moul-Signature header to be set when secret is present")
	}
}

func TestDispatchBeforeRejection(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error":"validation failed"}`))
	}))
	defer server.Close()

	hook := schema.Webhook{
		ID:      "hook2",
		URL:     server.URL,
		Events:  []string{"update:before"},
		Enabled: true,
	}

	payload := webhooks.Payload{
		Event:     "update:before",
		Moul:      "posts",
		Record:    map[string]interface{}{"title": "Invalid"},
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	err := webhooks.DispatchBefore(context.Background(), []schema.Webhook{hook}, payload)
	if err == nil {
		t.Fatal("Expected DispatchBefore to return error on non-2xx status, got nil")
	}
}

func TestTestWebhook(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		var p webhooks.Payload
		_ = json.Unmarshal(body, &p)

		if p.Event != "ping" {
			t.Errorf("Expected event 'ping', got %q", p.Event)
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`pong`))
	}))
	defer server.Close()

	hook := schema.Webhook{
		ID:      "hook_test",
		URL:     server.URL,
		Events:  []string{"*"},
		Enabled: true,
	}

	status, duration, body, err := webhooks.TestWebhook(context.Background(), hook, "posts")
	if err != nil {
		t.Fatalf("TestWebhook failed: %v", err)
	}

	if status != http.StatusOK {
		t.Errorf("Expected status 200, got %d", status)
	}
	if duration < 0 {
		t.Errorf("Expected duration >= 0, got %d", duration)
	}
	if body != "pong" {
		t.Errorf("Expected body 'pong', got %q", body)
	}
}
