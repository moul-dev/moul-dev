package realtime

import (
	"testing"
	"time"
)

func TestHubSubscribeUnsubscribe(t *testing.T) {
	hub := NewHub()
	client := NewClient("posts", nil, true, "", "*", "")

	if count := hub.SubscriberCount("posts"); count != 0 {
		t.Fatalf("Expected 0 subscribers, got %d", count)
	}

	hub.Subscribe(client)

	if count := hub.SubscriberCount("posts"); count != 1 {
		t.Fatalf("Expected 1 subscriber, got %d", count)
	}

	hub.Unsubscribe(client)

	if count := hub.SubscriberCount("posts"); count != 0 {
		t.Fatalf("Expected 0 subscribers after unsubscribe, got %d", count)
	}
}

func TestHubPublishEventFiltering(t *testing.T) {
	hub := NewHub()

	clientCreateOnly := NewClient("posts", nil, true, "", "create", "")
	clientUpdateOnly := NewClient("posts", nil, true, "", "update", "")
	clientSpecificRecord := NewClient("posts", nil, true, "", "*", "rec_123")

	hub.Subscribe(clientCreateOnly)
	hub.Subscribe(clientUpdateOnly)
	hub.Subscribe(clientSpecificRecord)

	// Publish create event for rec_999
	event1 := Event{
		Action: "create",
		Moul:   "posts",
		Record: map[string]interface{}{"id": "rec_999", "title": "Hello"},
	}
	hub.Publish(event1, nil)

	select {
	case msg := <-clientCreateOnly.Send:
		if msg.Record["id"] != "rec_999" {
			t.Errorf("Unexpected message ID: %v", msg.Record["id"])
		}
	case <-time.After(100 * time.Millisecond):
		t.Error("clientCreateOnly should have received create event")
	}

	select {
	case <-clientUpdateOnly.Send:
		t.Error("clientUpdateOnly should NOT have received create event")
	default:
	}

	select {
	case <-clientSpecificRecord.Send:
		t.Error("clientSpecificRecord should NOT have received event for rec_999")
	default:
	}

	// Publish update event for rec_123
	event2 := Event{
		Action: "update",
		Moul:   "posts",
		Record: map[string]interface{}{"id": "rec_123", "title": "Updated"},
	}
	hub.Publish(event2, nil)

	select {
	case msg := <-clientUpdateOnly.Send:
		if msg.Record["id"] != "rec_123" {
			t.Errorf("Unexpected message ID: %v", msg.Record["id"])
		}
	case <-time.After(100 * time.Millisecond):
		t.Error("clientUpdateOnly should have received update event")
	}

	select {
	case msg := <-clientSpecificRecord.Send:
		if msg.Record["id"] != "rec_123" {
			t.Errorf("Unexpected message ID: %v", msg.Record["id"])
		}
	case <-time.After(100 * time.Millisecond):
		t.Error("clientSpecificRecord should have received event for rec_123")
	}

	hub.Unsubscribe(clientCreateOnly)
	hub.Unsubscribe(clientUpdateOnly)
	hub.Unsubscribe(clientSpecificRecord)
}
