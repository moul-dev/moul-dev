package seed

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/flags"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"
)

// SeedOptions provides configuration options for database seeding.
type SeedOptions struct {
	Reset       bool
	AdminEmail  string
	AdminPass   string
	CreateFlags bool
}

// DefaultOptions returns standard seeding configuration options.
func DefaultOptions() SeedOptions {
	return SeedOptions{
		Reset:       false,
		AdminEmail:  "admin@example.com",
		AdminPass:   "Password123!",
		CreateFlags: true,
	}
}

// Seed populates the database with realistic demonstration collections, records, and feature flags.
func Seed(dbConn *dbx.DB, opts ...SeedOptions) error {
	opt := DefaultOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}

	now := time.Now().UTC()
	nowStr := now.Format(time.RFC3339)

	// 1. Seed Root Admin User in _rootUsers
	adminHash, err := bcrypt.GenerateFromPassword([]byte(opt.AdminPass), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash admin password: %w", err)
	}

	if _, err := dbConn.NewQuery(`
		INSERT OR REPLACE INTO _rootUsers (id, username, email, name, passwordHash, created_at, updated_at)
		VALUES ({:id}, {:username}, {:email}, {:name}, {:passwordHash}, {:created_at}, {:updated_at})
	`).Bind(dbx.Params{
		"id":           "root_admin_01",
		"username":     "admin",
		"email":        opt.AdminEmail,
		"name":         "Super Administrator",
		"passwordHash": string(adminHash),
		"created_at":   nowStr,
		"updated_at":   nowStr,
	}).Execute(); err != nil {
		return fmt.Errorf("failed to seed root admin user: %w", err)
	}

	// 2. Seed 'users' Auth Collection
	existingUsers, _ := db.LoadMoulByName(dbConn, "users")
	if existingUsers == nil {
		usersMoul := &schema.Moul{
			ID:   "moul_users_auth",
			Name: "users",
			Type: "auth",
			Fields: []schema.MoulField{
				{Name: "name", Type: "text"},
				{Name: "avatar", Type: "url"},
				{Name: "role", Type: "select", Options: []string{"admin", "editor", "member"}},
				{Name: "bio", Type: "text"},
			},
			Rules: schema.MoulRules{
				ListRule:   "",
				ViewRule:   "",
				CreateRule: "",
				UpdateRule: "id = @request.auth.id",
				DeleteRule: "id = @request.auth.id",
			},
			CreatedAt: nowStr,
			UpdatedAt: nowStr,
		}
		if err := db.CreateMoulTable(dbConn, usersMoul); err != nil {
			return fmt.Errorf("failed to create users table: %w", err)
		}
		if err := db.SaveMoulMetadata(dbConn, usersMoul); err != nil {
			return fmt.Errorf("failed to save users metadata: %w", err)
		}

		userHash, err := bcrypt.GenerateFromPassword([]byte("Password123!"), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash demo user password: %w", err)
		}
		demoUsers := []map[string]interface{}{
			{
				"id":           "usr_admin_001",
				"username":     "admin",
				"email":        "admin@example.com",
				"passwordHash": string(userHash),
				"name":         "Alex Administrator",
				"role":         "admin",
				"bio":          "Platform administrator and lead engineer.",
				"created_at":   now.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
			{
				"id":           "usr_jane_002",
				"username":     "janedoe",
				"email":        "jane.doe@example.com",
				"passwordHash": string(userHash),
				"name":         "Jane Doe",
				"role":         "editor",
				"bio":          "Content strategist and technical writer.",
				"created_at":   now.Add(-20 * 24 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
			{
				"id":           "usr_john_003",
				"username":     "johnsmith",
				"email":        "john.smith@example.com",
				"passwordHash": string(userHash),
				"name":         "John Smith",
				"role":         "member",
				"bio":          "Open source contributor and community builder.",
				"created_at":   now.Add(-10 * 24 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
		}

		for _, u := range demoUsers {
			if _, err := dbConn.Insert("users", dbx.Params(u)).Execute(); err != nil {
				return fmt.Errorf("failed to seed demo user %v: %w", u["username"], err)
			}
		}
	}

	// 3. Seed 'categories' Base Collection
	existingCats, _ := db.LoadMoulByName(dbConn, "categories")
	if existingCats == nil {
		catsMoul := &schema.Moul{
			ID:   "moul_categories_base",
			Name: "categories",
			Type: "base",
			Fields: []schema.MoulField{
				{Name: "name", Type: "text", Required: true},
				{Name: "slug", Type: "text", Required: true},
				{Name: "description", Type: "text"},
				{Name: "color", Type: "text"},
			},
			Rules: schema.MoulRules{
				ListRule:   "",
				ViewRule:   "",
				CreateRule: "@request.auth.id != ''",
				UpdateRule: "@request.auth.id != ''",
				DeleteRule: "@request.auth.id != ''",
			},
			CreatedAt: nowStr,
			UpdatedAt: nowStr,
		}
		if err := db.CreateMoulTable(dbConn, catsMoul); err != nil {
			return fmt.Errorf("failed to create categories table: %w", err)
		}
		if err := db.SaveMoulMetadata(dbConn, catsMoul); err != nil {
			return fmt.Errorf("failed to save categories metadata: %w", err)
		}

		demoCats := []map[string]interface{}{
			{"id": "cat_eng_001", "name": "Engineering", "slug": "engineering", "description": "Architecture, performance, and distributed systems", "color": "#3B82F6", "created_at": nowStr, "updated_at": nowStr},
			{"id": "cat_prod_002", "name": "Product Updates", "slug": "product", "description": "Latest feature releases and roadmap highlights", "color": "#10B981", "created_at": nowStr, "updated_at": nowStr},
			{"id": "cat_des_003", "name": "Design & UX", "slug": "design", "description": "Design tokens, accessibility, and micro-interactions", "color": "#8B5CF6", "created_at": nowStr, "updated_at": nowStr},
			{"id": "cat_tut_004", "name": "Tutorials & Guides", "slug": "tutorials", "description": "Step-by-step developer walkthroughs", "color": "#F59E0B", "created_at": nowStr, "updated_at": nowStr},
		}
		for _, c := range demoCats {
			if _, err := dbConn.Insert("categories", dbx.Params(c)).Execute(); err != nil {
				return fmt.Errorf("failed to seed demo category %v: %w", c["slug"], err)
			}
		}
	}

	// 4. Seed 'posts' Base Collection with Relations
	existingPosts, _ := db.LoadMoulByName(dbConn, "posts")
	if existingPosts == nil {
		postsMoul := &schema.Moul{
			ID:   "moul_posts_base",
			Name: "posts",
			Type: "base",
			Fields: []schema.MoulField{
				{Name: "title", Type: "text", Required: true},
				{Name: "slug", Type: "text", Required: true},
				{Name: "content", Type: "text"},
				{Name: "author_id", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:1", OnDelete: schema.OnDeleteSetNull}},
				{Name: "category_id", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "categories", Cardinality: "1:1", OnDelete: schema.OnDeleteSetNull}},
				{Name: "status", Type: "select", Options: []string{"draft", "published", "archived"}},
				{Name: "views_count", Type: "number"},
				{Name: "is_featured", Type: "bool"},
				{Name: "tags", Type: "json"},
				{Name: "published_at", Type: "datetime"},
			},
			Rules: schema.MoulRules{
				ListRule:   "",
				ViewRule:   "",
				CreateRule: "@request.auth.id != ''",
				UpdateRule: "author_id = @request.auth.id",
				DeleteRule: "author_id = @request.auth.id",
			},
			CreatedAt: nowStr,
			UpdatedAt: nowStr,
		}
		if err := db.CreateMoulTable(dbConn, postsMoul); err != nil {
			return fmt.Errorf("failed to create posts table: %w", err)
		}
		if err := db.SaveMoulMetadata(dbConn, postsMoul); err != nil {
			return fmt.Errorf("failed to save posts metadata: %w", err)
		}

		demoPosts := []map[string]interface{}{
			{
				"id":           "pst_001",
				"title":        "Building High-Performance SQLite Backends with Go",
				"slug":         "building-high-performance-sqlite-backends-with-go",
				"content":      "Exploring WAL mode, busy timeouts, and in-memory caches to handle thousands of requests per second.",
				"author_id":    "usr_admin_001",
				"category_id":  "cat_eng_001",
				"status":       "published",
				"views_count":  1420,
				"is_featured":  true,
				"tags":         `["sqlite", "golang", "database", "performance"]`,
				"published_at": now.Add(-12 * 24 * time.Hour).Format(time.RFC3339),
				"created_at":   now.Add(-12 * 24 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
			{
				"id":           "pst_002",
				"title":        "Zero-Runtime Styling with StyleX and React Aria",
				"slug":         "zero-runtime-styling-with-stylex-and-react-aria",
				"content":      "How to achieve deterministic, accessible, and fast design systems in modern React applications.",
				"author_id":    "usr_jane_002",
				"category_id":  "cat_des_003",
				"status":       "published",
				"views_count":  985,
				"is_featured":  false,
				"tags":         `["react", "stylex", "a11y", "design-systems"]`,
				"published_at": now.Add(-6 * 24 * time.Hour).Format(time.RFC3339),
				"created_at":   now.Add(-6 * 24 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
			{
				"id":           "pst_003",
				"title":        "Announcing Moul 2026.08: Realtime Subscriptions & MCP Engine",
				"slug":         "announcing-moul-2026-08",
				"content":      "Introducing native Server-Sent Events, Model Context Protocol integration, and multi-actor feature flags.",
				"author_id":    "usr_admin_001",
				"category_id":  "cat_prod_002",
				"status":       "published",
				"views_count":  2840,
				"is_featured":  true,
				"tags":         `["release", "mcp", "realtime", "openfeature"]`,
				"published_at": now.Add(-2 * 24 * time.Hour).Format(time.RFC3339),
				"created_at":   now.Add(-2 * 24 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
		}
		for _, p := range demoPosts {
			if _, err := dbConn.Insert("posts", dbx.Params(p)).Execute(); err != nil {
				return fmt.Errorf("failed to seed demo post %v: %w", p["slug"], err)
			}
		}
	}

	// 5. Seed 'tasks_queue' Worker Collection
	existingWorker, _ := db.LoadMoulByName(dbConn, "tasks_queue")
	if existingWorker == nil {
		workerMoul := &schema.Moul{
			ID:        "moul_tasks_queue_worker",
			Name:      "tasks_queue",
			Type:      "worker",
			CreatedAt: nowStr,
			UpdatedAt: nowStr,
		}
		if err := db.CreateMoulTable(dbConn, workerMoul); err != nil {
			return fmt.Errorf("failed to create tasks_queue table: %w", err)
		}
		if err := db.SaveMoulMetadata(dbConn, workerMoul); err != nil {
			return fmt.Errorf("failed to save tasks_queue metadata: %w", err)
		}

		demoJobs := []map[string]interface{}{
			{
				"id":           "job_email_001",
				"state":        "completed",
				"queue":        "default",
				"worker":       "SendEmail",
				"args":         `{"to": "jane.doe@example.com", "subject": "Welcome to Moul!"}`,
				"meta":         `{"initiator": "signup_flow"}`,
				"tags":         `["email", "transactional"]`,
				"errors":       `[]`,
				"attempt":      1,
				"max_attempts": 5,
				"priority":     1,
				"inserted_at":  now.Add(-5 * time.Hour).Format(time.RFC3339),
				"scheduled_at": now.Add(-5 * time.Hour).Format(time.RFC3339),
				"completed_at": now.Add(-5 * time.Hour).Add(120 * time.Millisecond).Format(time.RFC3339),
				"created_at":   now.Add(-5 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
			{
				"id":           "job_cleanup_002",
				"state":        "available",
				"queue":        "maintenance",
				"worker":       "CleanupOldRequests",
				"args":         `{"retention_days": 30}`,
				"meta":         `{"scheduled_by": "cron"}`,
				"tags":         `["maintenance", "db"]`,
				"errors":       `[]`,
				"attempt":      0,
				"max_attempts": 3,
				"priority":     2,
				"inserted_at":  nowStr,
				"scheduled_at": nowStr,
				"created_at":   nowStr,
				"updated_at":   nowStr,
			},
			{
				"id":           "job_webhook_003",
				"state":        "discarded",
				"queue":        "webhooks",
				"worker":       "DispatchWebhook",
				"args":         `{"target_url": "https://api.external.com/hook", "event": "record.created"}`,
				"meta":         `{"retry_count": 5}`,
				"tags":         `["webhook", "external"]`,
				"errors":       `["[2026-08-28T09:00:00Z] HTTP 503 Service Unavailable", "[2026-08-28T09:05:00Z] Connection timeout (max attempts reached)"]`,
				"attempt":      5,
				"max_attempts": 5,
				"priority":     3,
				"inserted_at":  now.Add(-2 * time.Hour).Format(time.RFC3339),
				"scheduled_at": now.Add(-2 * time.Hour).Format(time.RFC3339),
				"discarded_at": now.Add(-1 * time.Hour).Format(time.RFC3339),
				"created_at":   now.Add(-2 * time.Hour).Format(time.RFC3339),
				"updated_at":   nowStr,
			},
		}
		for _, j := range demoJobs {
			if _, err := dbConn.Insert("tasks_queue", dbx.Params(j)).Execute(); err != nil {
				return fmt.Errorf("failed to seed demo job %v: %w", j["id"], err)
			}
		}
	}

	// 6. Seed 'events' Analytic Collection & Visits
	existingAnalytic, _ := db.LoadMoulByName(dbConn, "events")
	if existingAnalytic == nil {
		eventsMoul := &schema.Moul{
			ID:        "moul_events_analytic",
			Name:      "events",
			Type:      "analytic",
			CreatedAt: nowStr,
			UpdatedAt: nowStr,
		}
		if err := db.CreateMoulTable(dbConn, eventsMoul); err != nil {
			return fmt.Errorf("failed to create events table: %w", err)
		}
		if err := db.SaveMoulMetadata(dbConn, eventsMoul); err != nil {
			return fmt.Errorf("failed to save events metadata: %w", err)
		}

		demoVisits := []map[string]interface{}{
			{
				"id":               "vst_001",
				"visitor_token":    "tok_visitor_alpha",
				"user_id":          "usr_admin_001",
				"ip":               "127.0.0.1",
				"user_agent":       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
				"referrer":         "https://github.com/moul-dev/moul-dev",
				"referring_domain": "github.com",
				"landing_page":     "http://localhost:8090/_moul_/",
				"browser":          "Chrome",
				"os":               "Mac OS",
				"device_type":      "Desktop",
				"country":          "United States",
				"started_at":       now.Add(-2 * time.Hour).Format(time.RFC3339),
			},
			{
				"id":               "vst_002",
				"visitor_token":    "tok_visitor_beta",
				"user_id":          "usr_jane_002",
				"ip":               "192.168.1.50",
				"user_agent":       "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
				"referrer":         "https://x.com/mouldev/status/123",
				"referring_domain": "x.com",
				"landing_page":     "http://localhost:8090/posts/announcing-moul-2026-08?utm_source=twitter&utm_medium=social",
				"browser":          "Mobile Safari",
				"os":               "iOS",
				"device_type":      "Mobile",
				"country":          "United Kingdom",
				"utm_source":       "twitter",
				"utm_medium":       "social",
				"started_at":       now.Add(-1 * time.Hour).Format(time.RFC3339),
			},
		}
		for _, v := range demoVisits {
			if _, err := dbConn.Insert("_visits", dbx.Params(v)).Execute(); err != nil {
				return fmt.Errorf("failed to seed demo visit %v: %w", v["id"], err)
			}
		}

		demoEvents := []map[string]interface{}{
			{
				"id":            "evt_001",
				"created_at":    now.Add(-2 * time.Hour).Format(time.RFC3339),
				"updated_at":    now.Add(-2 * time.Hour).Format(time.RFC3339),
				"visit_token":   "vst_001",
				"visitor_token": "tok_visitor_alpha",
				"user_id":       "usr_admin_001",
				"name":          "page_view",
				"properties":    `{"path": "/_moul_/", "title": "Admin Console"}`,
				"time":          now.Add(-2 * time.Hour).Format(time.RFC3339),
			},
			{
				"id":            "evt_002",
				"created_at":    now.Add(-1 * time.Hour).Format(time.RFC3339),
				"updated_at":    now.Add(-1 * time.Hour).Format(time.RFC3339),
				"visit_token":   "vst_002",
				"visitor_token": "tok_visitor_beta",
				"user_id":       "usr_jane_002",
				"name":          "post_read",
				"properties":    `{"slug": "announcing-moul-2026-08", "read_percentage": 100}`,
				"time":          now.Add(-1 * time.Hour).Format(time.RFC3339),
			},
		}
		for _, e := range demoEvents {
			if _, err := dbConn.Insert("events", dbx.Params(e)).Execute(); err != nil {
				return fmt.Errorf("failed to seed demo event %v: %w", e["id"], err)
			}
		}
	}

	// 7. Seed Feature Flags in _feature_flags
	if opt.CreateFlags {
		demoFlags := []*flags.Flag{
			flags.NewFlag("ff_beta_dash", "beta_dashboard", "Enable new unified analytics dashboard layout", true, "true", flags.GatesConfig{
				Groups: map[string]bool{"admin": true, "beta-testers": true},
			}),
			flags.NewFlag("ff_dark_v2", "dark_mode_v2", "High contrast dark mode theme token set", true, "false", flags.GatesConfig{
				Percentage: &flags.Percentage{Percentage: 50.0, Attribute: "user_id"},
			}),
			flags.NewFlag("ff_ai_assist", "ai_completions", "AI-assisted schema migration suggestions", true, "true", flags.GatesConfig{
				Actors: map[string]bool{"usr_admin_001": true},
			}),
			flags.NewFlag("ff_legacy_checkout", "legacy_checkout", "Legacy checkout fallback route", false, "false", flags.GatesConfig{}),
		}

		for _, f := range demoFlags {
			gatesJSON, err := json.Marshal(f.Gates)
			if err != nil {
				return fmt.Errorf("failed to marshal feature flag gates for %s: %w", f.Key, err)
			}
			if _, err := dbConn.NewQuery(`
				INSERT OR REPLACE INTO _feature_flags (id, key, description, enabled, default_value, gates, created_at, updated_at)
				VALUES ({:id}, {:key}, {:description}, {:enabled}, {:default_value}, {:gates}, {:created_at}, {:updated_at})
			`).Bind(dbx.Params{
				"id":            f.ID,
				"key":           f.Key,
				"description":   f.Description,
				"enabled":       f.Enabled,
				"default_value": f.DefaultValue,
				"gates":         string(gatesJSON),
				"created_at":    nowStr,
				"updated_at":    nowStr,
			}).Execute(); err != nil {
				return fmt.Errorf("failed to seed feature flag %s: %w", f.Key, err)
			}
		}
	}

	return nil
}
