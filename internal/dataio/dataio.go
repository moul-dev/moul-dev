package dataio

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

// ExportOptions specifies configuration for exporting a collection.
type ExportOptions struct {
	Format        string   // "csv" or "json" (default: "json")
	IncludeSchema bool     // If true, JSON export will include schema envelope
	Filter        string   // Optional filter SQL or rule expression
	Sort          string   // Optional ORDER BY clause (e.g. "created_at DESC")
	Fields        []string // Optional column subset to export
}

// ImportOptions specifies configuration for importing into a collection.
type ImportOptions struct {
	Format  string // "csv" or "json" (auto-detected if empty)
	Mode    string // "upsert" (default), "insert", "replace"
	OnError string // "atomic" (default), "continue"
}

// RowError captures an error encountered on a specific record/row.
type RowError struct {
	Row     int    `json:"row"`
	ID      string `json:"id,omitempty"`
	Message string `json:"message"`
}

// ImportResult summarizes the outcome of an import execution.
type ImportResult struct {
	Success  bool       `json:"success"`
	Mode     string     `json:"mode"`
	Total    int        `json:"total"`
	Inserted int        `json:"inserted"`
	Updated  int        `json:"updated"`
	Skipped  int        `json:"skipped"`
	Errors   []RowError `json:"errors,omitempty"`
}

// JSONExportEnvelope wraps collection schema and records for full-fidelity migrations.
type JSONExportEnvelope struct {
	Schema     *schema.Moul             `json:"schema,omitempty"`
	ExportedAt string                   `json:"exported_at"`
	Total      int                      `json:"total"`
	Records    []map[string]interface{} `json:"records"`
}

// ExportCollection queries records from the given collection and streams them in the requested format.
func ExportCollection(dbConn *dbx.DB, moul *schema.Moul, opts ExportOptions, w io.Writer) error {
	if moul == nil {
		return fmt.Errorf("collection definition cannot be nil")
	}
	if err := db.ValidateTableName(moul.Name); err != nil {
		return fmt.Errorf("invalid collection name %q: %w", moul.Name, err)
	}

	format := strings.ToLower(strings.TrimSpace(opts.Format))
	if format == "" {
		format = "json"
	}
	if format != "json" && format != "csv" {
		return fmt.Errorf("unsupported export format %q: only 'csv' and 'json' are supported", format)
	}

	// Build query
	query := dbConn.Select("*").From(moul.Name)
	if strings.TrimSpace(opts.Sort) != "" {
		query.OrderBy(opts.Sort)
	} else {
		query.OrderBy("created_at DESC")
	}

	var rawRecords []dbx.NullStringMap
	if err := query.All(&rawRecords); err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to fetch records for %s: %w", moul.Name, err)
	}

	records := make([]map[string]interface{}, 0, len(rawRecords))
	for _, raw := range rawRecords {
		m := nullStringMapToMap(raw)
		norm := NormalizeRecord(moul, m)
		records = append(records, norm)
	}

	switch format {
	case "csv":
		headers := GetCollectionColumnNames(moul)
		if len(opts.Fields) > 0 {
			headers = opts.Fields
		}
		if err := ExportCSV(records, headers, w); err != nil {
			return fmt.Errorf("csv export failed: %w", err)
		}
	case "json":
		if err := ExportJSON(records, moul, opts.IncludeSchema, w); err != nil {
			return fmt.Errorf("json export failed: %w", err)
		}
	}

	return nil
}

// ImportCollection parses input data and executes the import against the collection.
func ImportCollection(dbConn *dbx.DB, moul *schema.Moul, opts ImportOptions, r io.Reader) (*ImportResult, error) {
	if moul == nil {
		return nil, fmt.Errorf("collection definition cannot be nil")
	}
	if err := db.ValidateTableName(moul.Name); err != nil {
		return nil, fmt.Errorf("invalid collection name %q: %w", moul.Name, err)
	}

	mode := strings.ToLower(strings.TrimSpace(opts.Mode))
	if mode == "" {
		mode = "upsert"
	}
	if mode != "upsert" && mode != "insert" && mode != "replace" {
		return nil, fmt.Errorf("invalid import mode %q: must be 'upsert', 'insert', or 'replace'", mode)
	}

	onError := strings.ToLower(strings.TrimSpace(opts.OnError))
	if onError == "" {
		onError = "atomic"
	}
	if onError != "atomic" && onError != "continue" {
		return nil, fmt.Errorf("invalid on-error behavior %q: must be 'atomic' or 'continue'", onError)
	}

	// Read all content to allow format sniffing if not provided
	content, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("failed to read import payload: %w", err)
	}

	trimmed := bytes.TrimSpace(content)
	if len(trimmed) == 0 {
		return &ImportResult{
			Success: true,
			Mode:    mode,
			Total:   0,
		}, nil
	}

	format := strings.ToLower(strings.TrimSpace(opts.Format))
	if format == "" {
		// Sniff format: if starts with '[' or '{', treat as JSON; otherwise CSV
		if trimmed[0] == '[' || trimmed[0] == '{' {
			format = "json"
		} else {
			format = "csv"
		}
	}

	var rawItems []map[string]interface{}
	switch format {
	case "json":
		_, items, parseErr := ParseJSON(bytes.NewReader(trimmed))
		if parseErr != nil {
			return nil, fmt.Errorf("json parsing error: %w", parseErr)
		}
		rawItems = items
	case "csv":
		items, parseErr := ParseCSV(bytes.NewReader(trimmed), moul)
		if parseErr != nil {
			return nil, fmt.Errorf("csv parsing error: %w", parseErr)
		}
		rawItems = items
	default:
		return nil, fmt.Errorf("unsupported import format %q: only 'csv' and 'json' are supported", format)
	}

	res := &ImportResult{
		Mode:   mode,
		Total:  len(rawItems),
		Errors: make([]RowError, 0),
	}

	if onError == "atomic" {
		err := dbConn.Transactional(func(tx *dbx.Tx) error {
			return executeImport(tx, moul, rawItems, mode, onError, res)
		})
		if err != nil {
			res.Success = false
			return res, err
		}
		res.Success = true
		return res, nil
	}

	// Continue mode: execute directly without rollback on row errors
	err = executeImport(dbConn, moul, rawItems, mode, onError, res)
	if err != nil {
		res.Success = false
		return res, err
	}
	res.Success = len(res.Errors) == 0 || res.Inserted > 0 || res.Updated > 0
	return res, nil
}

// dbExecutor defines the subset of *dbx.DB and *dbx.Tx needed for import operations.
type dbExecutor interface {
	Select(cols ...string) *dbx.SelectQuery
	Insert(table string, data dbx.Params) *dbx.Query
	Update(table string, data dbx.Params, expr dbx.Expression) *dbx.Query
	NewQuery(sql string) *dbx.Query
}

func executeImport(dbExec dbExecutor, moul *schema.Moul, items []map[string]interface{}, mode, onError string, res *ImportResult) error {
	// If replace mode, truncate collection table first
	if mode == "replace" {
		quotedTable := db.QuoteIdentifier(moul.Name)
		truncateSQL := fmt.Sprintf("DELETE FROM %s", quotedTable)
		if _, err := dbExec.NewQuery(truncateSQL).Execute(); err != nil {
			return fmt.Errorf("failed to truncate collection %s: %w", moul.Name, err)
		}
	}

	now := time.Now().UTC().Format(time.RFC3339)

	for i, item := range items {
		rowNum := i + 1

		// Normalize incoming fields & validate constraints
		recordData, valErr := PrepareRecordForInsert(moul, item, now)
		if valErr != nil {
			rowErr := RowError{
				Row:     rowNum,
				Message: valErr.Error(),
			}
			if id, ok := item["id"].(string); ok {
				rowErr.ID = id
			}
			res.Errors = append(res.Errors, rowErr)
			if onError == "atomic" {
				return fmt.Errorf("row %d validation failed: %w", rowNum, valErr)
			}
			res.Skipped++
			continue
		}

		recordID, _ := recordData["id"].(string)

		// Check if record exists
		var existingCount int
		err := dbExec.Select("COUNT(1)").
			From(moul.Name).
			Where(dbx.HashExp{"id": recordID}).
			Row(&existingCount)
		if err != nil {
			rowErr := RowError{
				Row:     rowNum,
				ID:      recordID,
				Message: fmt.Sprintf("failed to check record existence: %v", err),
			}
			res.Errors = append(res.Errors, rowErr)
			if onError == "atomic" {
				return fmt.Errorf("row %d database error: %w", rowNum, err)
			}
			res.Skipped++
			continue
		}

		recordExists := existingCount > 0

		if recordExists {
			if mode == "insert" {
				errMsg := fmt.Sprintf("record with ID %q already exists", recordID)
				res.Errors = append(res.Errors, RowError{Row: rowNum, ID: recordID, Message: errMsg})
				if onError == "atomic" {
					return fmt.Errorf("row %d error: %s", rowNum, errMsg)
				}
				res.Skipped++
				continue
			}

			// Update record (upsert or replace)
			// Do not overwrite created_at on update unless explicitly provided
			delete(recordData, "created_at")
			recordData["updated_at"] = now

			_, updateErr := dbExec.Update(moul.Name, dbx.Params(recordData), dbx.HashExp{"id": recordID}).Execute()
			if updateErr != nil {
				res.Errors = append(res.Errors, RowError{Row: rowNum, ID: recordID, Message: updateErr.Error()})
				if onError == "atomic" {
					return fmt.Errorf("row %d update failed: %w", rowNum, updateErr)
				}
				res.Skipped++
				continue
			}
			res.Updated++
		} else {
			// Insert new record
			_, insertErr := dbExec.Insert(moul.Name, dbx.Params(recordData)).Execute()
			if insertErr != nil {
				res.Errors = append(res.Errors, RowError{Row: rowNum, ID: recordID, Message: insertErr.Error()})
				if onError == "atomic" {
					return fmt.Errorf("row %d insert failed: %w", rowNum, insertErr)
				}
				res.Skipped++
				continue
			}
			res.Inserted++
		}
	}

	return nil
}

// PrepareRecordForInsert validates fields according to the moul schema and prepares data params.
func PrepareRecordForInsert(moul *schema.Moul, raw map[string]interface{}, timestamp string) (map[string]interface{}, error) {
	out := make(map[string]interface{})

	// ID
	id, _ := raw["id"].(string)
	id = strings.TrimSpace(id)
	if id == "" {
		id = util.RandomID()
	}
	out["id"] = id

	// Timestamps
	if ca, ok := raw["created_at"].(string); ok && strings.TrimSpace(ca) != "" {
		out["created_at"] = ca
	} else {
		out["created_at"] = timestamp
	}

	if ua, ok := raw["updated_at"].(string); ok && strings.TrimSpace(ua) != "" {
		out["updated_at"] = ua
	} else {
		out["updated_at"] = timestamp
	}

	// Auth collection specific fields
	if moul.Type == "auth" {
		if username, ok := raw["username"].(string); ok {
			out["username"] = strings.TrimSpace(username)
		}
		if email, ok := raw["email"].(string); ok {
			out["email"] = strings.TrimSpace(email)
		}
		if pwHash, ok := raw["passwordHash"].(string); ok {
			out["passwordHash"] = pwHash
		} else if pwHash, ok := raw["password_hash"].(string); ok {
			out["passwordHash"] = pwHash
		}
		if otpCode, ok := raw["otpCode"].(string); ok {
			out["otpCode"] = otpCode
		}
		if otpExp, ok := raw["otpExpiresAt"].(string); ok {
			out["otpExpiresAt"] = otpExp
		}
		if passkeys, ok := raw["passkeys"].(string); ok {
			out["passkeys"] = passkeys
		}
		if resetTok, ok := raw["resetToken"].(string); ok {
			out["resetToken"] = resetTok
		}
		if oauthProv, ok := raw["oauthProviders"].(string); ok {
			out["oauthProviders"] = oauthProv
		}
	}

	// Worker collection specific fields
	if moul.Type == "worker" {
		for _, wField := range []string{"worker", "state", "queue", "args", "meta", "tags", "errors", "scheduled_at", "locked_at", "locked_by", "inserted_at", "attempted_at", "attempted_by", "cancelled_at", "completed_at", "discarded_at"} {
			if val, ok := raw[wField]; ok && val != nil {
				if strVal, isStr := val.(string); isStr {
					out[wField] = strVal
				} else {
					bytes, _ := json.Marshal(val)
					out[wField] = string(bytes)
				}
			}
		}
		// support payload alias for args
		if payload, ok := raw["payload"]; ok && payload != nil && out["args"] == nil {
			if strVal, isStr := payload.(string); isStr {
				out["args"] = strVal
			} else {
				bytes, _ := json.Marshal(payload)
				out["args"] = string(bytes)
			}
		}
		if out["args"] == nil {
			out["args"] = "{}"
		}
		if out["inserted_at"] == nil {
			out["inserted_at"] = timestamp
		}
		if out["scheduled_at"] == nil {
			out["scheduled_at"] = timestamp
		}
		for _, numField := range []string{"priority", "attempt", "max_attempts"} {
			if val, ok := raw[numField]; ok && val != nil {
				num, _ := toFloat(val)
				out[numField] = int(num)
			}
		}
	}

	// Analytic collection specific fields
	if moul.Type == "analytic" {
		for _, aField := range []string{"name", "properties", "visit_token", "visitor_token", "user_id", "time"} {
			if val, ok := raw[aField]; ok && val != nil {
				if strVal, isStr := val.(string); isStr {
					out[aField] = strVal
				} else {
					bytes, _ := json.Marshal(val)
					out[aField] = string(bytes)
				}
			}
		}
		if out["time"] == nil {
			out["time"] = timestamp
		}
		if out["visit_token"] == nil {
			out["visit_token"] = util.RandomID()
		}
		if out["visitor_token"] == nil {
			out["visitor_token"] = util.RandomID()
		}
	}

	// Custom fields defined in schema
	for _, field := range moul.Fields {
		val, exists := raw[field.Name]
		if !exists || val == nil {
			if field.Required {
				return nil, fmt.Errorf("field %q is required", field.Name)
			}
			continue
		}

		switch field.Type {
		case "text", "email", "url":
			strVal, ok := val.(string)
			if !ok {
				strVal = fmt.Sprintf("%v", val)
			}
			if field.Required && strings.TrimSpace(strVal) == "" {
				return nil, fmt.Errorf("field %q is required and cannot be empty", field.Name)
			}
			out[field.Name] = strVal

		case "number":
			num, ok := toFloat(val)
			if !ok {
				return nil, fmt.Errorf("field %q must be a valid number", field.Name)
			}
			if field.Min != nil && num < *field.Min {
				return nil, fmt.Errorf("field %q must be >= %v", field.Name, *field.Min)
			}
			if field.Max != nil && num > *field.Max {
				return nil, fmt.Errorf("field %q must be <= %v", field.Name, *field.Max)
			}
			out[field.Name] = num

		case "bool":
			switch b := val.(type) {
			case bool:
				if b {
					out[field.Name] = 1
				} else {
					out[field.Name] = 0
				}
			case string:
				s := strings.ToLower(strings.TrimSpace(b))
				if s == "true" || s == "1" || s == "yes" {
					out[field.Name] = 1
				} else {
					out[field.Name] = 0
				}
			case int, int64, float64:
				num, _ := toFloat(b)
				if num != 0 {
					out[field.Name] = 1
				} else {
					out[field.Name] = 0
				}
			default:
				out[field.Name] = 0
			}

		case "date":
			strVal, ok := val.(string)
			if !ok {
				return nil, fmt.Errorf("field %q must be a date string (YYYY-MM-DD)", field.Name)
			}
			strVal = strings.TrimSpace(strVal)
			if strVal != "" {
				if _, err := time.Parse("2006-01-02", strVal); err != nil {
					return nil, fmt.Errorf("field %q must be a valid date in YYYY-MM-DD format", field.Name)
				}
			}
			out[field.Name] = strVal

		case "datetime":
			strVal, ok := val.(string)
			if !ok {
				return nil, fmt.Errorf("field %q must be an ISO 8601 date-time string", field.Name)
			}
			strVal = strings.TrimSpace(strVal)
			if strVal != "" {
				if !isValidDateTime(strVal) {
					return nil, fmt.Errorf("field %q must be a valid ISO 8601 date-time string", field.Name)
				}
			}
			out[field.Name] = strVal

		case "select":
			strVal, ok := val.(string)
			if !ok {
				strVal = fmt.Sprintf("%v", val)
			}
			if field.Required && strings.TrimSpace(strVal) == "" {
				return nil, fmt.Errorf("field %q is required", field.Name)
			}
			if strVal != "" && len(field.Options) > 0 {
				found := false
				for _, opt := range field.Options {
					if opt == strVal {
						found = true
						break
					}
				}
				if !found {
					return nil, fmt.Errorf("invalid value %q for select field %q (allowed: %s)", strVal, field.Name, strings.Join(field.Options, ", "))
				}
			}
			out[field.Name] = strVal

		case "json":
			if strVal, isStr := val.(string); isStr {
				if strVal != "" && !json.Valid([]byte(strVal)) {
					return nil, fmt.Errorf("field %q must be valid JSON", field.Name)
				}
				out[field.Name] = strVal
			} else {
				bytes, err := json.Marshal(val)
				if err != nil {
					return nil, fmt.Errorf("failed to serialize json field %q: %w", field.Name, err)
				}
				out[field.Name] = string(bytes)
			}

		case "file":
			if strVal, isStr := val.(string); isStr {
				if strVal != "" && !json.Valid([]byte(strVal)) {
					metaBytes, _ := json.Marshal(map[string]interface{}{"name": strVal})
					out[field.Name] = string(metaBytes)
				} else {
					out[field.Name] = strVal
				}
			} else {
				bytes, err := json.Marshal(val)
				if err != nil {
					return nil, fmt.Errorf("failed to serialize file field %q: %w", field.Name, err)
				}
				out[field.Name] = string(bytes)
			}

		case "relation":
			if field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
				if sliceVal, ok := val.([]interface{}); ok {
					var ids []string
					for _, item := range sliceVal {
						ids = append(ids, fmt.Sprintf("%v", item))
					}
					bytes, _ := json.Marshal(ids)
					out[field.Name] = string(bytes)
				} else if strVal, ok := val.(string); ok {
					out[field.Name] = strVal
				} else {
					out[field.Name] = "[]"
				}
			} else {
				out[field.Name] = fmt.Sprintf("%v", val)
			}

		default:
			out[field.Name] = val
		}
	}

	return out, nil
}

// GetCollectionColumnNames returns all column names for the collection in a standardized order.
func GetCollectionColumnNames(moul *schema.Moul) []string {
	cols := []string{"id"}

	if moul.Type == "auth" {
		cols = append(cols, "username", "email")
	} else if moul.Type == "worker" {
		cols = append(cols, "worker", "state", "queue", "priority", "attempt", "max_attempts")
	} else if moul.Type == "analytic" {
		cols = append(cols, "name", "properties", "visit_token", "visitor_token", "user_id")
	}

	for _, field := range moul.Fields {
		cols = append(cols, field.Name)
	}

	if moul.Type == "auth" {
		cols = append(cols, "passwordHash")
	}

	cols = append(cols, "created_at", "updated_at")
	return cols
}

// NormalizeRecord converts database string values to typed Go values according to schema.
func NormalizeRecord(moul *schema.Moul, record map[string]interface{}) map[string]interface{} {
	out := make(map[string]interface{})
	for k, v := range record {
		out[k] = v
	}

	// Schema-based type conversions
	for _, field := range moul.Fields {
		val, ok := out[field.Name]
		if !ok || val == nil {
			if field.Type == "relation" && field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
				out[field.Name] = []string{}
			}
			continue
		}

		strVal, isStr := val.(string)
		if !isStr {
			continue
		}

		switch field.Type {
		case "number":
			if f, err := strconv.ParseFloat(strVal, 64); err == nil {
				out[field.Name] = f
			}
		case "bool":
			out[field.Name] = (strVal == "1" || strings.EqualFold(strVal, "true"))
		case "json", "file":
			if strVal != "" {
				var decoded interface{}
				if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
					out[field.Name] = decoded
				}
			}
		case "relation":
			if field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
				var decoded []string
				if strVal != "" && strVal != "null" {
					if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
						out[field.Name] = decoded
					} else {
						out[field.Name] = []string{}
					}
				} else {
					out[field.Name] = []string{}
				}
			}
		}
	}

	// Auth collection type conversions
	if moul.Type == "auth" {
		if v, ok := out["verified"].(string); ok {
			out["verified"] = (v == "1" || strings.EqualFold(v, "true"))
		}
	}

	return out
}

func nullStringMapToMap(m dbx.NullStringMap) map[string]interface{} {
	res := make(map[string]interface{})
	for k, v := range m {
		if v.Valid {
			res[k] = v.String
		} else {
			res[k] = nil
		}
	}
	return res
}

func toFloat(v interface{}) (float64, bool) {
	switch num := v.(type) {
	case float64:
		return num, true
	case float32:
		return float64(num), true
	case int:
		return float64(num), true
	case int64:
		return float64(num), true
	case int32:
		return float64(num), true
	case string:
		f, err := strconv.ParseFloat(strings.TrimSpace(num), 64)
		return f, err == nil
	default:
		return 0, false
	}
}

func isValidDateTime(s string) bool {
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
	}
	for _, layout := range formats {
		if _, err := time.Parse(layout, s); err == nil {
			return true
		}
	}
	return false
}
