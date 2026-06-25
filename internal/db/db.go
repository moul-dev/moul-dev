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

	// Create indexes on _visits
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_visits_visitor ON _visits (visitor_token);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_visits_visitor index: %w", err)
	}
	_, err = db.NewQuery("CREATE INDEX IF NOT EXISTS idx_visits_user ON _visits (user_id);").Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to create idx_visits_user index: %w", err)
	}

	return db, nil
}

// CreateMoulTable dynamically creates the physical SQLite table for a moul.
func CreateMoulTable(db *dbx.DB, m *schema.Moul) error {
	var columns []string

	// Map dynamic fields
	for _, field := range m.Fields {
		// Avoid overriding system fields
		lowerName := strings.ToLower(field.Name)
		if lowerName == "id" || lowerName == "created_at" || lowerName == "updated_at" ||
			lowerName == "username" || lowerName == "email" || lowerName == "passwordhash" {
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
		case "json":
			sqliteType = "TEXT"
		}
		columns = append(columns, fmt.Sprintf("`%s` %s", field.Name, sqliteType))
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
				passwordHash TEXT NOT NULL
				%s
			);
		`, m.Name, columnsSQL)
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
		`, m.Name, columnsSQL)
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
		`, m.Name, columnsSQL)
	} else {
		createSQL = fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL
				%s
			);
		`, m.Name, columnsSQL)
	}

	_, err := db.NewQuery(createSQL).Execute()
	if err != nil {
		return fmt.Errorf("failed to create table %s: %w", m.Name, err)
	}

	if m.Type == "worker" {
		indexSQL := fmt.Sprintf("CREATE INDEX IF NOT EXISTS idx_%s_job_processing ON %s (state, queue, priority, scheduled_at, id);", m.Name, m.Name)
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

	now := time.Now().UTC().Format(time.RFC3339)
	m.CreatedAt = now
	m.UpdatedAt = now

	_, err = db.Insert("_mouls", dbx.Params{
		"id":         m.ID,
		"name":       m.Name,
		"type":       m.Type,
		"fields":     fieldsJSON,
		"rules":      rulesJSON,
		"created_at": m.CreatedAt,
		"updated_at": m.UpdatedAt,
	}).Execute()

	if err != nil {
		return fmt.Errorf("failed to insert metadata for moul %s: %w", m.Name, err)
	}

	return nil
}

// LoadAllMouls retrieves all defined mouls from the meta-table.
func LoadAllMouls(db *dbx.DB) ([]*schema.Moul, error) {
	var rows []struct {
		ID        string `db:"id"`
		Name      string `db:"name"`
		Type      string `db:"type"`
		Fields    string `db:"fields"`
		Rules     string `db:"rules"`
		CreatedAt string `db:"created_at"`
		UpdatedAt string `db:"updated_at"`
	}

	err := db.Select("id", "name", "type", "fields", "rules", "created_at", "updated_at").
		From("_mouls").
		All(&rows)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to fetch mouls: %w", err)
	}

	var mouls []*schema.Moul
	for _, row := range rows {
		var fields []schema.MoulField
		var rules schema.MoulRules

		if err := json.Unmarshal([]byte(row.Fields), &fields); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(row.Rules), &rules); err != nil {
			return nil, err
		}

		mouls = append(mouls, &schema.Moul{
			ID:        row.ID,
			Name:      row.Name,
			Type:      row.Type,
			Fields:    fields,
			Rules:     rules,
			CreatedAt: row.CreatedAt,
			UpdatedAt: row.UpdatedAt,
		})
	}

	return mouls, nil
}

// LoadMoulByName retrieves a single moul by name.
func LoadMoulByName(db *dbx.DB, name string) (*schema.Moul, error) {
	var row struct {
		ID        string `db:"id"`
		Name      string `db:"name"`
		Type      string `db:"type"`
		Fields    string `db:"fields"`
		Rules     string `db:"rules"`
		CreatedAt string `db:"created_at"`
		UpdatedAt string `db:"updated_at"`
	}

	err := db.Select("id", "name", "type", "fields", "rules", "created_at", "updated_at").
		From("_mouls").
		Where(dbx.HashExp{"name": name}).
		One(&row)
	if err != nil {
		return nil, err
	}

	var fields []schema.MoulField
	var rules schema.MoulRules

	if err := json.Unmarshal([]byte(row.Fields), &fields); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(row.Rules), &rules); err != nil {
		return nil, err
	}

	return &schema.Moul{
		ID:        row.ID,
		Name:      row.Name,
		Type:      row.Type,
		Fields:    fields,
		Rules:     rules,
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
	}, nil
}
