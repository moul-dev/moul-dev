package realtime

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func init() {
	db.RegisterOnTokenRevoked(func(tokenHash string) {
		DefaultHub.DisconnectToken(tokenHash)
	})
}

type Event struct {
	Action    string                 `json:"action"` // "create", "update", "delete"
	Moul      string                 `json:"moul"`   // collection name
	Record    map[string]interface{} `json:"record"` // record map
	OldRecord map[string]interface{} `json:"old_record,omitempty"`
	Timestamp string                 `json:"timestamp"`
}

type ClientOptions struct {
	TokenHash      string
	TokenExpiresAt time.Time
}

type Client struct {
	ID             string
	MoulName       string                 // target collection name or "*"
	Events         []string               // filter event actions e.g. ["create", "update"] or ["*"]
	RecordID       string                 // optional filter for single record ID
	AuthUser       map[string]interface{} // auth context map
	AuthUserTime   time.Time              // timestamp when AuthUser was last verified
	IsAdmin        bool                   // root user or admin key flag
	Rule           string                 // SubscribeRule or fallback rule
	TokenHash      string                 // sha256 hash of JWT for mid-stream revocation tracking
	TokenExpiresAt time.Time              // JWT exp claim for heartbeat validation
	Send           chan *Event            // buffered channel for SSE output
	Disconnect     chan string            // signal channel for mid-stream disconnect with reason
	cancelOnce     sync.Once
	closed         chan struct{}
}

func generateID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func NewClient(moulName string, authUser map[string]interface{}, isAdmin bool, rule string, eventFilter string, recordID string, opts ...ClientOptions) *Client {
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

	var tokenHash string
	var tokenExpiresAt time.Time
	if len(opts) > 0 {
		tokenHash = opts[0].TokenHash
		tokenExpiresAt = opts[0].TokenExpiresAt
	}

	return &Client{
		ID:             generateID(),
		MoulName:       moulName,
		Events:         events,
		RecordID:       strings.TrimSpace(recordID),
		AuthUser:       authUser,
		AuthUserTime:   time.Now(),
		IsAdmin:        isAdmin,
		Rule:           rule,
		TokenHash:      tokenHash,
		TokenExpiresAt: tokenExpiresAt,
		Send:           make(chan *Event, 128),
		Disconnect:     make(chan string, 1),
		closed:         make(chan struct{}),
	}
}

func (c *Client) Close() {
	c.cancelOnce.Do(func() {
		close(c.closed)
		close(c.Send)
	})
}

func (c *Client) DisconnectClient(reason string) {
	select {
	case <-c.closed:
	case c.Disconnect <- reason:
	default:
	}
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

// GetFreshAuthUser refreshes custom auth attributes from SQLite if the cache window (15s) has expired.
func (c *Client) GetFreshAuthUser(dbConn *dbx.DB) map[string]interface{} {
	if c.AuthUser == nil || dbConn == nil {
		return c.AuthUser
	}
	moulName, _ := c.AuthUser["moul"].(string)
	id, _ := c.AuthUser["id"].(string)
	if moulName == "" || id == "" || moulName == "_rootUsers" {
		return c.AuthUser
	}

	// Throttle database re-verification
	if time.Since(c.AuthUserTime) < 15*time.Second {
		return c.AuthUser
	}

	var row dbx.NullStringMap
	err := dbConn.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&row)
	if err != nil {
		c.AuthUser = nil
		c.AuthUserTime = time.Now()
		c.DisconnectClient("auth_expired")
		return nil
	}

	newAuth := make(map[string]interface{})
	for k, v := range c.AuthUser {
		newAuth[k] = v
	}
	for k, v := range row {
		if v.Valid && k != "password" && k != "tokenKey" {
			newAuth[k] = v.String
		}
	}
	c.AuthUser = newAuth
	c.AuthUserTime = time.Now()
	return c.AuthUser
}

// SchemaCache stores collection definitions in memory to eliminate repeated disk reads during realtime broadcasts.
type SchemaCache struct {
	mu    sync.RWMutex
	mouls map[string]*cachedMoul
}

type cachedMoul struct {
	moul     *schema.Moul
	cachedAt time.Time
}

func NewSchemaCache() *SchemaCache {
	return &SchemaCache{
		mouls: make(map[string]*cachedMoul),
	}
}

func (sc *SchemaCache) Get(name string) (*schema.Moul, bool) {
	sc.mu.RLock()
	defer sc.mu.RUnlock()
	entry, ok := sc.mouls[name]
	if !ok || entry == nil {
		return nil, false
	}
	if time.Since(entry.cachedAt) > 2*time.Minute {
		return nil, false
	}
	return entry.moul, true
}

func (sc *SchemaCache) Set(name string, m *schema.Moul) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	sc.mouls[name] = &cachedMoul{
		moul:     m,
		cachedAt: time.Now(),
	}
}

func (sc *SchemaCache) Invalidate(name string) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	delete(sc.mouls, name)
}

func (sc *SchemaCache) InvalidateAll() {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	sc.mouls = make(map[string]*cachedMoul)
}

type Hub struct {
	mu          sync.RWMutex
	subscribers map[string]map[*Client]struct{}
	schemaCache *SchemaCache
}

func NewHub() *Hub {
	return &Hub{
		subscribers: make(map[string]map[*Client]struct{}),
		schemaCache: NewSchemaCache(),
	}
}

var DefaultHub = NewHub()

func (h *Hub) InvalidateCache(moulName string) {
	if h.schemaCache != nil {
		if moulName == "" || moulName == "*" {
			h.schemaCache.InvalidateAll()
		} else {
			h.schemaCache.Invalidate(moulName)
		}
	}
}

func (h *Hub) DisconnectToken(tokenHash string) {
	if tokenHash == "" {
		return
	}
	h.mu.RLock()
	var targets []*Client
	for _, clients := range h.subscribers {
		for c := range clients {
			if c.TokenHash == tokenHash {
				targets = append(targets, c)
			}
		}
	}
	h.mu.RUnlock()

	for _, c := range targets {
		c.DisconnectClient("auth_expired")
	}
}

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

func (h *Hub) getCollectionRule(dbConn *dbx.DB, moulName string) (string, bool) {
	if moulName == "" || moulName == "*" || dbConn == nil {
		return "", true
	}

	var m *schema.Moul
	if h.schemaCache != nil {
		if cached, ok := h.schemaCache.Get(moulName); ok {
			m = cached
		}
	}

	if m == nil {
		loaded, err := db.LoadMoulByName(dbConn, moulName)
		if err != nil || loaded == nil {
			return "", false
		}
		m = loaded
		if h.schemaCache != nil {
			h.schemaCache.Set(moulName, m)
		}
	}

	rule := m.Rules.SubscribeRule
	if rule == "" {
		rule = m.Rules.ViewRule
	}
	return rule, true
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

	// Resolve the target collection rule dynamically
	rule := ""
	if dbConn != nil {
		resolvedRule, found := h.getCollectionRule(dbConn, event.Moul)
		if !found {
			return
		}
		rule = resolvedRule
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
		if !client.IsAdmin && dbConn != nil {
			evalRule := rule
			if evalRule == "" && client.Rule != "" {
				evalRule = client.Rule
			}

			authUser := client.GetFreshAuthUser(dbConn)

			switch event.Action {
			case "create":
				allowed, err := rules.EvaluateRule(dbConn, evalRule, authUser, event.Record)
				if err != nil || !allowed {
					continue
				}
				h.sendEvent(client, event)

			case "delete":
				recordToCheck := event.Record
				if len(recordToCheck) == 0 && len(event.OldRecord) > 0 {
					recordToCheck = event.OldRecord
				}
				allowed, err := rules.EvaluateRule(dbConn, evalRule, authUser, recordToCheck)
				if err != nil || !allowed {
					continue
				}
				h.sendEvent(client, event)

			case "update":
				newAllowed, errNew := rules.EvaluateRule(dbConn, evalRule, authUser, event.Record)
				if errNew == nil && newAllowed {
					h.sendEvent(client, event)
					continue
				}

				// If new state is NOT visible, check if old state was visible (transition-aware)
				if len(event.OldRecord) > 0 {
					oldAllowed, errOld := rules.EvaluateRule(dbConn, evalRule, authUser, event.OldRecord)
					if errOld == nil && oldAllowed {
						// Emit synthetic delete action so client drops the record
						syntheticDelete := event
						syntheticDelete.Action = "delete"
						h.sendEvent(client, syntheticDelete)
						continue
					}
				}
				// Neither old nor new was allowed, omit event
				continue

			default:
				allowed, err := rules.EvaluateRule(dbConn, evalRule, authUser, event.Record)
				if err != nil || !allowed {
					continue
				}
				h.sendEvent(client, event)
			}
		} else {
			// Admin client or no dbConn: send directly
			h.sendEvent(client, event)
		}
	}
}

func (h *Hub) sendEvent(client *Client, event Event) {
	eventCopy := event
	select {
	case <-client.closed:
	case client.Send <- &eventCopy:
	default:
		// Buffer full, skip frame to prevent blocking
	}
}
