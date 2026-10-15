package realtime

import (
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
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

func TestHubPerEventRuleEvaluation_DynamicAndTransitionAware(t *testing.T) {
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	t.Cleanup(func() {
		if err := testDB.Close(); err != nil {
			t.Errorf("testDB.Close failed: %v", err)
		}
	})
	hub := NewHub()

	// 1. Create collection with SubscribeRule: authorId = @request.auth.id
	moul := &schema.Moul{
		ID:   "moul_articles",
		Name: "articles",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "authorId", Type: "text"},
			{Name: "status", Type: "text"},
		},
		Rules: schema.MoulRules{
			SubscribeRule: "authorId = @request.auth.id",
		},
	}
	if err := db.SaveMoulMetadata(testDB, moul); err != nil {
		t.Fatalf("Failed to save moul metadata: %v", err)
	}
	if err := db.CreateMoulTable(testDB, moul); err != nil {
		t.Fatalf("Failed to create moul table: %v", err)
	}

	authUser := map[string]interface{}{
		"id":    "usr_alice",
		"email": "alice@moul.dev",
	}
	client := NewClient("articles", authUser, false, "", "*", "")
	hub.Subscribe(client)
	defer hub.Unsubscribe(client)

	// 2. Publish create for Alice's article -> Should receive
	hub.Publish(Event{
		Action: "create",
		Moul:   "articles",
		Record: map[string]interface{}{"id": "art_1", "authorId": "usr_alice", "title": "Alice Post"},
	}, testDB)

	select {
	case msg := <-client.Send:
		if msg.Record["id"] != "art_1" || msg.Action != "create" {
			t.Fatalf("Expected create event for art_1, got %+v", msg)
		}
	case <-time.After(200 * time.Millisecond):
		t.Fatal("Expected Alice to receive create event for her article")
	}

	// 3. Publish create for Bob's article -> Alice should NOT receive
	hub.Publish(Event{
		Action: "create",
		Moul:   "articles",
		Record: map[string]interface{}{"id": "art_2", "authorId": "usr_bob", "title": "Bob Post"},
	}, testDB)

	select {
	case msg := <-client.Send:
		t.Fatalf("Alice should not receive Bob's article, got %+v", msg)
	case <-time.After(50 * time.Millisecond):
		// Expected: no message
	}

	// 4. Transition-aware update: Alice's article author is reassigned to Bob
	// Old: authorId = usr_alice (matched)
	// New: authorId = usr_bob (does not match)
	// Result: synthetic "delete" event emitted to Alice
	hub.Publish(Event{
		Action:    "update",
		Moul:      "articles",
		Record:    map[string]interface{}{"id": "art_1", "authorId": "usr_bob", "title": "Reassigned Post"},
		OldRecord: map[string]interface{}{"id": "art_1", "authorId": "usr_alice", "title": "Alice Post"},
	}, testDB)

	select {
	case msg := <-client.Send:
		if msg.Action != "delete" {
			t.Fatalf("Expected synthetic delete action when record transitions out of view, got %q", msg.Action)
		}
		if msg.Record["id"] != "art_1" {
			t.Fatalf("Expected record ID art_1, got %v", msg.Record["id"])
		}
	case <-time.After(200 * time.Millisecond):
		t.Fatal("Expected transition-aware delete event for art_1")
	}

	// 5. Dynamic collection rule update mid-stream: Change rule to status = 'published'
	moul.Rules.SubscribeRule = "status = 'published'"
	if err := db.UpdateMoulMetadata(testDB, "articles", moul); err != nil {
		t.Fatalf("Failed to update moul metadata: %v", err)
	}
	hub.InvalidateCache("articles")

	// Publish draft article for Alice -> now should NOT be received
	hub.Publish(Event{
		Action: "create",
		Moul:   "articles",
		Record: map[string]interface{}{"id": "art_3", "authorId": "usr_alice", "status": "draft"},
	}, testDB)

	select {
	case msg := <-client.Send:
		t.Fatalf("Alice should NOT receive draft under new rule, got %+v", msg)
	case <-time.After(50 * time.Millisecond):
		// Expected: no message
	}

	// Publish published article for Bob -> Alice SHOULD now receive it!
	hub.Publish(Event{
		Action: "create",
		Moul:   "articles",
		Record: map[string]interface{}{"id": "art_4", "authorId": "usr_bob", "status": "published"},
	}, testDB)

	select {
	case msg := <-client.Send:
		if msg.Record["id"] != "art_4" {
			t.Fatalf("Expected art_4, got %v", msg.Record["id"])
		}
	case <-time.After(200 * time.Millisecond):
		t.Fatal("Expected Alice to receive published article art_4 under updated rule")
	}
}

func TestHubImmediateDisconnectOnTokenRevocation(t *testing.T) {
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	t.Cleanup(func() {
		if err := testDB.Close(); err != nil {
			t.Errorf("testDB.Close failed: %v", err)
		}
	})

	tokenStr := "test_token_secret_revoke_xyz"
	tokenHash := db.HashToken(tokenStr)

	client := NewClient("articles", nil, false, "", "*", "", ClientOptions{
		TokenHash:      tokenHash,
		TokenExpiresAt: time.Now().Add(1 * time.Hour),
	})
	DefaultHub.Subscribe(client)
	defer DefaultHub.Unsubscribe(client)

	// Revoke token via database
	if err := db.RevokeToken(testDB, tokenStr, time.Now().Add(1*time.Hour)); err != nil {
		t.Fatalf("RevokeToken failed: %v", err)
	}

	// Client should immediately receive disconnect signal on c.Disconnect
	select {
	case reason := <-client.Disconnect:
		if reason != "auth_expired" {
			t.Fatalf("Expected disconnect reason 'auth_expired', got %q", reason)
		}
	case <-time.After(300 * time.Millisecond):
		t.Fatal("Expected client to be immediately disconnected upon token revocation")
	}
}
