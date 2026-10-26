package realtime

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"strings"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/cloak"
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
	RevealFields   map[string]bool
}

type Client struct {
	mu             sync.RWMutex
	isClosed       bool
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
	RevealFields   map[string]bool        // permitted unmasked cloak fields (admins only)
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

// DefaultClientBufferSize is the bounded buffer size for client SSE event streams.
// Provides headroom for database batch operations while bounding server memory.
const DefaultClientBufferSize = 128

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
	var revealFields map[string]bool
	if len(opts) > 0 {
		tokenHash = opts[0].TokenHash
		tokenExpiresAt = opts[0].TokenExpiresAt
		revealFields = opts[0].RevealFields
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
		RevealFields:   revealFields,
		Send:           make(chan *Event, DefaultClientBufferSize),
		Disconnect:     make(chan string, 1),
		closed:         make(chan struct{}),
	}
}

func (c *Client) Close() {
	c.cancelOnce.Do(func() {
		c.mu.Lock()
		c.isClosed = true
		close(c.closed)
		close(c.Send)
		c.mu.Unlock()
	})
}

func (c *Client) DisconnectClient(reason string) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	if c.isClosed {
		return
	}
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
	recordHook  RecordHook
}

// RecordHook adjusts an event record after it has been sanitized for a subscriber (for example,
// signing the URLs of files that are not public).
type RecordHook func(m *schema.Moul, record map[string]interface{})

// SetRecordHook installs fn to run on every record sent to subscribers.
func (h *Hub) SetRecordHook(fn RecordHook) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.recordHook = fn
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

func (h *Hub) getMoul(dbConn *dbx.DB, moulName string) (*schema.Moul, bool) {
	if moulName == "" || moulName == "*" || dbConn == nil {
		return nil, false
	}

	if h.schemaCache != nil {
		if cached, ok := h.schemaCache.Get(moulName); ok {
			return cached, true
		}
	}

	loaded, err := db.LoadMoulByName(dbConn, moulName)
	if err != nil || loaded == nil {
		return nil, false
	}
	if h.schemaCache != nil {
		h.schemaCache.Set(moulName, loaded)
	}
	return loaded, true
}

// CloneAndSanitizeRecord creates an isolated, sanitized copy of a record for a specific client.
// It unconditionally strips companion blind-index hash columns (<fieldName>Hash) and auth secrets,
// and enforces cloak masking (••••1234) unless the client is an authorized admin with explicit reveal permissions.
func CloneAndSanitizeRecord(m *schema.Moul, rawRecord map[string]interface{}, client *Client) map[string]interface{} {
	if rawRecord == nil {
		return nil
	}

	clean := make(map[string]interface{}, len(rawRecord))
	for k, v := range rawRecord {
		clean[k] = v
	}

	// Always delete credentials, reset tokens and linked identities, and never forward an expand
	// block: it was built for the writer, not for this subscriber.
	schema.StripSecrets(m, clean)
	delete(clean, "expand")

	if m != nil {
		// 1. Strip companion hash columns for all cloak fields unconditionally
		for _, field := range m.Fields {
			if field.Type == "cloak" {
				delete(clean, field.Name+"Hash")
			}
		}

		// 2. Process each cloak field
		for _, field := range m.Fields {
			if field.Type != "cloak" {
				continue
			}

			val, ok := clean[field.Name]
			if !ok || val == nil {
				continue
			}

			var payload []byte
			switch v := val.(type) {
			case []byte:
				payload = v
			case string:
				if strings.HasPrefix(v, "••••") {
					// Already masked
					continue
				}
				payload = []byte(v)
			}

			if len(payload) == 0 {
				clean[field.Name] = ""
				continue
			}

			shouldReveal := client != nil && client.IsAdmin && client.RevealFields != nil &&
				(client.RevealFields[field.Name] || client.RevealFields["*"] || client.RevealFields["all"])

			var plainStr string
			// Check if payload starts with Version1 (0x01) and has minimum length for AES-GCM
			if len(payload) >= 1+cloak.NonceSize+16 && payload[0] == cloak.Version1 {
				decrypted, err := cloak.Decrypt(payload)
				if err != nil {
					clean[field.Name] = "••••"
					continue
				}
				plainStr = string(decrypted)
			} else {
				// Raw string or plaintext payload passed into event
				plainStr = string(payload)
			}

			if shouldReveal {
				var jsonDecoded interface{}
				if err := json.Unmarshal([]byte(plainStr), &jsonDecoded); err == nil {
					clean[field.Name] = jsonDecoded
				} else {
					clean[field.Name] = plainStr
				}
			} else {
				clean[field.Name] = cloak.Mask(plainStr)
			}
		}
	} else {
		// Schema-less fallback: defensively delete any companion *Hash columns (except tokenHash)
		for k := range clean {
			if strings.HasSuffix(k, "Hash") && k != "tokenHash" {
				delete(clean, k)
			}
		}
	}

	// The email of an auth record reaches only admins, that user, or everyone when published.
	if m != nil {
		var viewer map[string]interface{}
		isAdmin := false
		if client != nil {
			viewer = client.AuthUser
			isAdmin = client.IsAdmin
		}
		schema.RedactForViewer(m, clean, viewer, isAdmin)
	}

	return clean
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

	// Resolve the target collection moul & rule dynamically
	var m *schema.Moul
	rule := ""
	if dbConn != nil {
		loadedMoul, found := h.getMoul(dbConn, event.Moul)
		if !found || loadedMoul == nil {
			return
		}
		m = loadedMoul
		rule = m.Rules.SubscribeRule
		if rule == "" {
			rule = m.Rules.ViewRule
		}
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
				h.sendEvent(client, event, m)

			case "delete":
				recordToCheck := event.Record
				if len(recordToCheck) == 0 && len(event.OldRecord) > 0 {
					recordToCheck = event.OldRecord
				}
				allowed, err := rules.EvaluateRule(dbConn, evalRule, authUser, recordToCheck)
				if err != nil || !allowed {
					continue
				}
				h.sendEvent(client, event, m)

			case "update":
				newAllowed, errNew := rules.EvaluateRule(dbConn, evalRule, authUser, event.Record)
				if errNew == nil && newAllowed {
					h.sendEvent(client, event, m)
					continue
				}

				// If new state is NOT visible, check if old state was visible (transition-aware)
				if len(event.OldRecord) > 0 {
					oldAllowed, errOld := rules.EvaluateRule(dbConn, evalRule, authUser, event.OldRecord)
					if errOld == nil && oldAllowed {
						// Emit synthetic delete action so client drops the record. It carries the
						// last version the client could see, never the new, now hidden, one.
						syntheticDelete := event
						syntheticDelete.Action = "delete"
						syntheticDelete.Record = event.OldRecord
						syntheticDelete.OldRecord = nil
						h.sendEvent(client, syntheticDelete, m)
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
				h.sendEvent(client, event, m)
			}
		} else {
			// Admin client or no dbConn: send directly with sanitization
			h.sendEvent(client, event, m)
		}
	}
}

func (h *Hub) sendEvent(client *Client, event Event, m *schema.Moul) {
	eventCopy := event
	eventCopy.Record = CloneAndSanitizeRecord(m, event.Record, client)
	if len(event.OldRecord) > 0 {
		eventCopy.OldRecord = CloneAndSanitizeRecord(m, event.OldRecord, client)
	}
	h.mu.RLock()
	hook := h.recordHook
	h.mu.RUnlock()
	if hook != nil && m != nil {
		hook(m, eventCopy.Record)
		if eventCopy.OldRecord != nil {
			hook(m, eventCopy.OldRecord)
		}
	}

	client.mu.RLock()
	if client.isClosed {
		client.mu.RUnlock()
		return
	}

	select {
	case <-client.closed:
		client.mu.RUnlock()
		return
	case client.Send <- &eventCopy:
		client.mu.RUnlock()
	default:
		client.mu.RUnlock()
		// Buffer full: evict slow consumer to protect server memory and prevent backpressure
		client.DisconnectClient("slow_consumer")
	}
}
