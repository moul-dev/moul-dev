package realtime_test

import (
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/testutil"
)

func TestTicketStore_IssueAndConsume(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	store := realtime.NewTicketStore(dbConn)

	authRecord := map[string]interface{}{
		"id":       "usr_123",
		"email":    "user@example.com",
		"username": "user123",
		"moul":     "users",
	}

	ticket, err := store.IssueTicket(authRecord, false, 30*time.Second)
	if err != nil {
		t.Fatalf("Failed to issue ticket: %v", err)
	}
	if !strings.HasPrefix(ticket.ID, "tkt_") {
		t.Errorf("Expected ticket ID prefix 'tkt_', got %q", ticket.ID)
	}
	if ticket.IsAdmin {
		t.Errorf("Expected ticket.IsAdmin to be false, got true")
	}

	// 1. Consume once - must succeed
	consumed, err := store.ConsumeTicket(ticket.ID)
	if err != nil {
		t.Fatalf("Failed to consume ticket: %v", err)
	}
	if consumed.ID != ticket.ID {
		t.Errorf("Expected consumed ticket ID %q, got %q", ticket.ID, consumed.ID)
	}
	if consumed.AuthRecord == nil || consumed.AuthRecord["id"] != "usr_123" {
		t.Errorf("Expected consumed auth record with id 'usr_123', got %+v", consumed.AuthRecord)
	}
	if consumed.IsAdmin {
		t.Errorf("Expected consumed.IsAdmin to be false, got true")
	}

	// 2. Consume twice - must fail (single-use enforced)
	_, err = store.ConsumeTicket(ticket.ID)
	if err == nil {
		t.Fatalf("Expected second consumption to fail with ErrInvalidTicket, got nil error")
	}
	if !errors.Is(err, realtime.ErrInvalidTicket) {
		t.Errorf("Expected ErrInvalidTicket, got %v", err)
	}
}

func TestTicketStore_AdminTicket(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	store := realtime.NewTicketStore(dbConn)

	ticket, err := store.IssueTicket(nil, true, 30*time.Second)
	if err != nil {
		t.Fatalf("Failed to issue admin ticket: %v", err)
	}
	if !ticket.IsAdmin {
		t.Errorf("Expected ticket.IsAdmin to be true")
	}

	consumed, err := store.ConsumeTicket(ticket.ID)
	if err != nil {
		t.Fatalf("Failed to consume admin ticket: %v", err)
	}
	if !consumed.IsAdmin {
		t.Errorf("Expected consumed.IsAdmin to be true")
	}
}

func TestTicketStore_ExpiredTicket(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	store := realtime.NewTicketStore(dbConn)

	// Issue with negative TTL so it is already expired
	ticket, err := store.IssueTicket(nil, false, -1*time.Second)
	if err != nil {
		t.Fatalf("Failed to issue expired ticket: %v", err)
	}

	_, err = store.ConsumeTicket(ticket.ID)
	if err == nil {
		t.Fatalf("Expected consumption of expired ticket to fail, got nil error")
	}
	if !errors.Is(err, realtime.ErrInvalidTicket) {
		t.Errorf("Expected ErrInvalidTicket, got %v", err)
	}
}

func TestTicketStore_CleanupExpired(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	store := realtime.NewTicketStore(dbConn)

	// Issue 2 expired tickets and 1 active ticket
	_, err := store.IssueTicket(nil, false, -5*time.Second)
	if err != nil {
		t.Fatalf("Failed to issue expired ticket 1: %v", err)
	}
	_, err = store.IssueTicket(nil, false, -10*time.Second)
	if err != nil {
		t.Fatalf("Failed to issue expired ticket 2: %v", err)
	}
	activeTicket, err := store.IssueTicket(nil, false, 60*time.Second)
	if err != nil {
		t.Fatalf("Failed to issue active ticket: %v", err)
	}

	cleaned, err := store.CleanupExpired()
	if err != nil {
		t.Fatalf("Failed to cleanup expired tickets: %v", err)
	}
	if cleaned != 2 {
		t.Errorf("Expected 2 cleaned tickets, got %d", cleaned)
	}

	// Active ticket should still be consumable
	consumed, err := store.ConsumeTicket(activeTicket.ID)
	if err != nil {
		t.Fatalf("Failed to consume active ticket after cleanup: %v", err)
	}
	if consumed.ID != activeTicket.ID {
		t.Errorf("Expected ticket ID %q, got %q", activeTicket.ID, consumed.ID)
	}
}

func TestTicketStore_RevealFields(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	store := realtime.NewTicketStore(dbConn)

	ticket, err := store.IssueTicket(nil, true, 30*time.Second, "token_hash_123", "2099-01-01T00:00:00Z", "all")
	if err != nil {
		t.Fatalf("Failed to issue ticket with reveal fields: %v", err)
	}
	if ticket.RevealFields != "all" {
		t.Errorf("Expected RevealFields 'all', got %q", ticket.RevealFields)
	}

	consumed, err := store.ConsumeTicket(ticket.ID)
	if err != nil {
		t.Fatalf("Failed to consume ticket: %v", err)
	}
	if consumed.RevealFields != "all" {
		t.Errorf("Expected consumed RevealFields 'all', got %q", consumed.RevealFields)
	}
}
