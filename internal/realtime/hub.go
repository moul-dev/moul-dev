package realtime

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/pocketbase/dbx"
)

type Event struct {
	Action    string                 `json:"action"` // "create", "update", "delete"
	Moul      string                 `json:"moul"`   // collection name
	Record    map[string]interface{} `json:"record"` // record map
	OldRecord map[string]interface{} `json:"old_record,omitempty"`
	Timestamp string                 `json:"timestamp"`
}

type Client struct {
	ID         string
	MoulName   string                 // target collection name or "*"
	Events     []string               // filter event actions e.g. ["create", "update"] or ["*"]
	RecordID   string                 // optional filter for single record ID
	AuthUser   map[string]interface{} // auth context map
	IsAdmin    bool                   // root user or admin key flag
	Rule       string                 // SubscribeRule or fallback rule
	Send       chan *Event            // buffered channel for SSE output
	cancelOnce sync.Once
	closed     chan struct{}
}

func generateID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func NewClient(moulName string, authUser map[string]interface{}, isAdmin bool, rule string, eventFilter string, recordID string) *Client {
	var events []string
	if strings.TrimSpace(eventFilter) != "" && eventFilter != "*" {
		for _, e := range strings.Split(eventFilter, ",") {
			e = strings.TrimSpace(strings.ToLower(e))
			if e != "" {
				events = append(events, e)
			}
		}
	}
	if len(events) == 0 {
		events = []string{"*"}
	}

	return &Client{
		ID:       generateID(),
		MoulName: moulName,
		Events:   events,
		RecordID: strings.TrimSpace(recordID),
		AuthUser: authUser,
		IsAdmin:  isAdmin,
		Rule:     rule,
		Send:     make(chan *Event, 128),
		closed:   make(chan struct{}),
	}
}

func (c *Client) Close() {
	c.cancelOnce.Do(func() {
		close(c.closed)
		close(c.Send)
	})
}

func (c *Client) MatchesEvent(action string) bool {
	action = strings.ToLower(action)
	for _, e := range c.Events {
		if e == "*" || e == "all" || e == action {
			return true
		}
	}
	return false
}

type Hub struct {
	mu          sync.RWMutex
	subscribers map[string]map[*Client]struct{}
}

func NewHub() *Hub {
	return &Hub{
		subscribers: make(map[string]map[*Client]struct{}),
	}
}

var DefaultHub = NewHub()

func (h *Hub) Subscribe(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	moul := c.MoulName
	if h.subscribers[moul] == nil {
		h.subscribers[moul] = make(map[*Client]struct{})
	}
	h.subscribers[moul][c] = struct{}{}
}

func (h *Hub) Unsubscribe(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	moul := c.MoulName
	if clients, ok := h.subscribers[moul]; ok {
		delete(clients, c)
		if len(clients) == 0 {
			delete(h.subscribers, moul)
		}
	}
	c.Close()
}

func (h *Hub) SubscriberCount(moulName string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	total := 0
	if clients, ok := h.subscribers[moulName]; ok {
		total += len(clients)
	}
	if moulName != "*" {
		if globalClients, ok := h.subscribers["*"]; ok {
			total += len(globalClients)
		}
	}
	return total
}

func (h *Hub) Publish(event Event, dbConn *dbx.DB) {
	if event.Moul == "" {
		return
	}

	h.mu.RLock()
	var targetClients []*Client
	if clients, ok := h.subscribers[event.Moul]; ok {
		for c := range clients {
			targetClients = append(targetClients, c)
		}
	}
	if globalClients, ok := h.subscribers["*"]; ok {
		for c := range globalClients {
			targetClients = append(targetClients, c)
		}
	}
	h.mu.RUnlock()

	if len(targetClients) == 0 {
		return
	}

	if event.Timestamp == "" {
		event.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	for _, client := range targetClients {
		if !client.MatchesEvent(event.Action) {
			continue
		}

		if client.RecordID != "" {
			recID, _ := event.Record["id"].(string)
			if recID != client.RecordID {
				continue
			}
		}

		// Security rule check
		if !client.IsAdmin && client.Rule != "" && dbConn != nil {
			allowed, err := rules.EvaluateRule(dbConn, client.Rule, client.AuthUser, event.Record)
			if err != nil || !allowed {
				continue
			}
		}

		// Non-blocking send
		eventCopy := event
		select {
		case <-client.closed:
		case client.Send <- &eventCopy:
		default:
			// Buffer full, skip frame to prevent blocking
		}
	}
}
