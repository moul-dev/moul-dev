package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"

	"github.com/pocketbase/dbx"
	_ "modernc.org/sqlite"
)

// InitDB initializes the SQLite database and creates the _mouls meta-table.
func InitDB(dbPath string) (*dbx.DB, error) {
	db, err := dbx.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	// Create meta-table _mouls
	_, err = db.NewQuery(`
		CREATE TABLE IF NOT EXISTS _mouls (
			id TEXT PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			type TEXT NOT NULL,
			fields TEXT NOT NULL,
			rules TEXT NOT NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
	`).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create _mouls meta table: %w", err)
	}

	// Ensure email_templates column exists in _mouls for backwards compatibility
	_, _ = db.NewQuery("ALTER TABLE _mouls ADD COLUMN email_templates TEXT;").Execute()

	// Create meta-table _visits
	_, err = db.NewQuery(`
		CREATE TABLE IF NOT EXISTS _visits (
			id TEXT PRIMARY KEY,
			visitor_token TEXT NOT NULL,
			user_id TEXT,
			ip TEXT,
			user_agent TEXT,
			referrer TEXT,
			referring_domain TEXT,
			landing_page TEXT,
			browser TEXT,
			os TEXT,
			device_type TEXT,
			country TEXT,
			region TEXT,
			city TEXT,
			utm_source TEXT,
			utm_medium TEXT,
			utm_term TEXT,
			utm_content TEXT,
			utm_campaign TEXT,
			started_at TEXT NOT NULL
		);
	`).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create _visits table: %w", err)
	}

	// Create meta-table _settings
	_, err = db.NewQuery(`
		CREATE TABLE IF NOT EXISTS _settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
	`).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create _settings table: %w", err)
	}

	// Create meta-table _rootUsers
	_, err = db.NewQuery(`
		CREATE TABLE IF NOT EXISTS _rootUsers (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			passwordHash TEXT NOT NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
	`).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create _rootUsers table: %w", err)
	}

	// Seed default settings if they don't exist
	defaultSettings := map[string]string{
		"file_s3_enabled":                "false",
		"file_s3_bucket":                 "",
		"file_s3_endpoint":               "",
		"file_s3_region":                 "",
		"file_s3_access_key":             "",
		"file_s3_secret_key":             "",
		"file_s3_force_path_style":       "false",
		"litestream_enabled":             "false",
		"litestream_s3_bucket":           "",
		"litestream_s3_endpoint":         "",
		"litestream_s3_region":           "",
		"litestream_access_key_id":       "",
		"litestream_secret_access_key":   "",
		"litestream_s3_force_path_style": "false",
		"litestream_replica_path":        "",
	}
	for k, v := range defaultSettings {
		var exists int
		err = db.Select("COUNT(*)").From("_settings").Where(dbx.HashExp{"key": k}).Row(&exists)
		if err != nil {
			return nil, fmt.Errorf("failed to check setting %s: %w", k, err)
		}
		if exists == 0 {
			_, err = db.Insert("_settings", dbx.Params{
				"key":   k,
				"value": v,
			}).Execute()
			if err != nil {
				return nil, fmt.Errorf("failed to seed setting %s: %w", k, err)
			}
		}
	}

	// Create indexes on _visits
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_visits_visitor ON _visits (visitor_token);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_visits_visitor index: %w", err)
	}
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_visits_user ON _visits (user_id);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_visits_user index: %w", err)
	}

	// Create meta-table _requests
	_, err = db.NewQuery(`
		CREATE TABLE IF NOT EXISTS _requests (
			id TEXT PRIMARY KEY,
			visit_id TEXT NOT NULL,
			method TEXT NOT NULL,
			path TEXT NOT NULL,
			status_code INTEGER NOT NULL,
			response_time_ms INTEGER NOT NULL,
			created_at TEXT NOT NULL
		);
	`).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create _requests table: %w", err)
	}

	// Create indexes on _requests
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_requests_visit_id ON _requests (visit_id);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_requests_visit_id index: %w", err)
	}
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_requests_created_at ON _requests (created_at);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_requests_created_at index: %w", err)
	}
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_requests_path ON _requests (path);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_requests_path index: %w", err)
	}

	return db, nil
}

// CreateMoulTable dynamically creates the physical SQLite table for a moul.
func CreateMoulTable(db *dbx.DB, m *schema.Moul) error {
	if err := ValidateTableName(m.Name); err != nil {
		return fmt.Errorf("unsafe moul name: %w", err)
	}

	quotedName := QuoteIdentifier(m.Name)
	var columns []string

	// Map dynamic fields
	for _, field := range m.Fields {
		// Avoid overriding system fields
		lowerName := strings.ToLower(field.Name)
		if lowerName == "id" || lowerName == "created_at" || lowerName == "updated_at" ||
			lowerName == "username" || lowerName == "email" || lowerName == "passwordhash" ||
			lowerName == "otpcode" || lowerName == "otpexpiresat" || lowerName == "passkeys" {
			continue
		}
		if m.Type == "worker" {
			if lowerName == "state" || lowerName == "queue" || lowerName == "worker" ||
				lowerName == "args" || lowerName == "meta" || lowerName == "tags" ||
				lowerName == "errors" || lowerName == "attempt" || lowerName == "max_attempts" ||
				lowerName == "priority" || lowerName == "inserted_at" || lowerName == "scheduled_at" ||
				lowerName == "attempted_at" || lowerName == "attempted_by" ||
				lowerName == "cancelled_at" || lowerName == "completed_at" || lowerName == "discarded_at" {
				continue
			}
		}
		if m.Type == "analytic" {
			if lowerName == "visit_token" || lowerName == "visitor_token" ||
				lowerName == "user_id" || lowerName == "name" ||
				lowerName == "properties" || lowerName == "time" {
				continue
			}
		}

		sqliteType := "TEXT"
		switch field.Type {
		case "number":
			sqliteType = "NUMERIC"
		case "bool":
			sqliteType = "INTEGER"
		case "json", "file", "relation":
			sqliteType = "TEXT"
		}
		columns = append(columns, fmt.Sprintf("%s %s", QuoteIdentifier(field.Name), sqliteType))
	}

	var createSQL string
	columnsSQL := ""
	if len(columns) > 0 {
		columnsSQL = ", " + strings.Join(columns, ", ")
	}

	if m.Type == "auth" {
		createSQL = fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				username TEXT UNIQUE NOT NULL,
				email TEXT UNIQUE NOT NULL,
				passwordHash TEXT,
				otpCode TEXT,
				otpExpiresAt TEXT,
				passkeys TEXT
				%s
			);
		`, quotedName, columnsSQL)
	} else if m.Type == "worker" {
		createSQL = fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				state TEXT NOT NULL DEFAULT 'available',
				queue TEXT NOT NULL DEFAULT 'default',
				worker TEXT NOT NULL,
				args TEXT NOT NULL DEFAULT '{}',
				meta TEXT NOT NULL DEFAULT '{}',
				tags TEXT NOT NULL DEFAULT '[]',
				errors TEXT NOT NULL DEFAULT '[]',
				attempt INTEGER NOT NULL DEFAULT 0,
				max_attempts INTEGER NOT NULL DEFAULT 20,
				priority INTEGER NOT NULL DEFAULT 0,
				inserted_at TEXT NOT NULL,
				scheduled_at TEXT NOT NULL,
				attempted_at TEXT,
				attempted_by TEXT,
				cancelled_at TEXT,
				completed_at TEXT,
				discarded_at TEXT
				%s
			);
		`, quotedName, columnsSQL)
	} else if m.Type == "analytic" {
		createSQL = fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				visit_token TEXT NOT NULL,
				visitor_token TEXT NOT NULL,
				user_id TEXT,
				name TEXT NOT NULL,
				properties TEXT NOT NULL DEFAULT '{}',
				time TEXT NOT NULL
				%s
			);
		`, quotedName, columnsSQL)
	} else {
		createSQL = fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL
				%s
			);
		`, quotedName, columnsSQL)
	}

	_, err := db.NewQuery(createSQL).Execute()
	if err != nil {
		return fmt.Errorf("failed to create table %s: %w", m.Name, err)
	}

	if m.Type == "worker" {
		indexSQL := fmt.Sprintf("CREATE INDEX IF NOT EXISTS idx_%s_job_processing ON %s (state, queue, priority, scheduled_at, id);", m.Name, quotedName)
		_, err = db.NewQuery(indexSQL).Execute()
		if err != nil {
			return fmt.Errorf("failed to create job index for table %s: %w", m.Name, err)
		}
	}

	return nil
}

// SaveMoulMetadata inserts or updates a moul's meta definition in the _mouls table.
func SaveMoulMetadata(db *dbx.DB, m *schema.Moul) error {
	fieldsJSON, err := m.SerializeFields()
	if err != nil {
		return err
	}
	rulesJSON, err := m.SerializeRules()
	if err != nil {
		return err
	}

	templatesJSON := "{}"
	if m.Type == "auth" {
		if m.EmailTemplates == nil {
			defaults := schema.GetDefaultEmailTemplates()
			m.EmailTemplates = &defaults
		}
		bytes, err := json.Marshal(m.EmailTemplates)
		if err != nil {
			return err
		}
		templatesJSON = string(bytes)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	m.CreatedAt = now
	m.UpdatedAt = now

	_, err = db.Insert("_mouls", dbx.Params{
		"id":              m.ID,
		"name":            m.Name,
		"type":            m.Type,
		"fields":          fieldsJSON,
		"rules":           rulesJSON,
		"email_templates": templatesJSON,
		"created_at":      m.CreatedAt,
		"updated_at":      m.UpdatedAt,
	}).Execute()

	if err != nil {
		return fmt.Errorf("failed to insert metadata for moul %s: %w", m.Name, err)
	}

	return nil
}

// LoadAllMouls retrieves all defined mouls from the meta-table.
func LoadAllMouls(db *dbx.DB) ([]*schema.Moul, error) {
	var rows []struct {
		ID             string         `db:"id"`
		Name           string         `db:"name"`
		Type           string         `db:"type"`
		Fields         string         `db:"fields"`
		Rules          string         `db:"rules"`
		EmailTemplates sql.NullString `db:"email_templates"`
		CreatedAt      string         `db:"created_at"`
		UpdatedAt      string         `db:"updated_at"`
	}

	err := db.Select("id", "name", "type", "fields", "rules", "email_templates", "created_at", "updated_at").
		From("_mouls").
		All(&rows)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to fetch mouls: %w", err)
	}

	var mouls []*schema.Moul
	for _, row := range rows {
		var fields []schema.MoulField
		var rules schema.MoulRules
		var templates *schema.EmailTemplates

		if err := json.Unmarshal([]byte(row.Fields), &fields); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(row.Rules), &rules); err != nil {
			return nil, err
		}
		if row.EmailTemplates.Valid && row.EmailTemplates.String != "" && row.EmailTemplates.String != "{}" {
			var t schema.EmailTemplates
			if err := json.Unmarshal([]byte(row.EmailTemplates.String), &t); err == nil {
				templates = &t
			}
		}

		if templates == nil && row.Type == "auth" {
			defaults := schema.GetDefaultEmailTemplates()
			templates = &defaults
		}

		mouls = append(mouls, &schema.Moul{
			ID:             row.ID,
			Name:           row.Name,
			Type:           row.Type,
			Fields:         fields,
			Rules:          rules,
			EmailTemplates: templates,
			CreatedAt:      row.CreatedAt,
			UpdatedAt:      row.UpdatedAt,
		})
	}

	return mouls, nil
}

// LoadMoulByName retrieves a single moul by name.
func LoadMoulByName(db *dbx.DB, name string) (*schema.Moul, error) {
	var row struct {
		ID             string         `db:"id"`
		Name           string         `db:"name"`
		Type           string         `db:"type"`
		Fields         string         `db:"fields"`
		Rules          string         `db:"rules"`
		EmailTemplates sql.NullString `db:"email_templates"`
		CreatedAt      string         `db:"created_at"`
		UpdatedAt      string         `db:"updated_at"`
	}

	err := db.Select("id", "name", "type", "fields", "rules", "email_templates", "created_at", "updated_at").
		From("_mouls").
		Where(dbx.HashExp{"name": name}).
		One(&row)
	if err != nil {
		return nil, err
	}

	var fields []schema.MoulField
	var rules schema.MoulRules
	var templates *schema.EmailTemplates

	if err := json.Unmarshal([]byte(row.Fields), &fields); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(row.Rules), &rules); err != nil {
		return nil, err
	}
	if row.EmailTemplates.Valid && row.EmailTemplates.String != "" && row.EmailTemplates.String != "{}" {
		var t schema.EmailTemplates
		if err := json.Unmarshal([]byte(row.EmailTemplates.String), &t); err == nil {
			templates = &t
		}
	}

	if templates == nil && row.Type == "auth" {
		defaults := schema.GetDefaultEmailTemplates()
		templates = &defaults
	}

	return &schema.Moul{
		ID:             row.ID,
		Name:           row.Name,
		Type:           row.Type,
		Fields:         fields,
		Rules:          rules,
		EmailTemplates: templates,
		CreatedAt:      row.CreatedAt,
		UpdatedAt:      row.UpdatedAt,
	}, nil
}

// UpdateMoulEmailTemplates updates the email templates in the _mouls metadata table.
func UpdateMoulEmailTemplates(db *dbx.DB, moulID string, templates *schema.EmailTemplates) error {
	bytes, err := json.Marshal(templates)
	if err != nil {
		return fmt.Errorf("failed to marshal email templates: %w", err)
	}

	_, err = db.Update("_mouls", dbx.Params{
		"email_templates": string(bytes),
		"updated_at":      time.Now().UTC().Format(time.RFC3339),
	}, dbx.HashExp{"id": moulID}).Execute()

	if err != nil {
		return fmt.Errorf("failed to update email templates: %w", err)
	}
	return nil
}
