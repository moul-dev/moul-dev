package analytics

import (
	"fmt"
	"math/rand/v2"
	"strconv"
	"strings"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
)

// Settings keys (in _settings) that control the _requests log and log retention.
const (
	SettingRequestLogEnabled       = "request_log_enabled"
	SettingRequestLogSampleRate    = "request_log_sample_rate"
	SettingRequestLogExcludePaths  = "request_log_exclude_paths"
	SettingRequestLogRetentionDays = "request_log_retention_days"
	SettingVisitRetentionDays      = "visit_retention_days"
)

// defaultRetentionDays is how long _requests and _visits rows are kept unless configured.
const defaultRetentionDays = 30

// requestInsertChunk is how many rows one multi-row INSERT carries (7 parameters per row).
const requestInsertChunk = 100

// RequestLogSettings controls which requests are written to _requests and how long request and
// visit rows are kept.
type RequestLogSettings struct {
	// Enabled turns the _requests log on or off.
	Enabled bool
	// SampleRate is the fraction of eligible requests that are logged, from 0 to 1.
	SampleRate float64
	// ExcludePaths are path prefixes never logged, in addition to the router's built-in ones.
	ExcludePaths []string
	// RetentionDays is how long _requests rows are kept.
	RetentionDays int
	// VisitRetentionDays is how long _visits rows are kept.
	VisitRetentionDays int
}

// DefaultRequestLogSettings returns the settings used when _settings has no (valid) value.
func DefaultRequestLogSettings() RequestLogSettings {
	return RequestLogSettings{
		Enabled:            true,
		SampleRate:         1,
		RetentionDays:      defaultRetentionDays,
		VisitRetentionDays: defaultRetentionDays,
	}
}

// LoadRequestLogSettings reads the request log settings from _settings. A missing key keeps its
// default; a value that does not parse is reported in the returned error and also keeps its
// default, so the caller can log it and still use the result.
func LoadRequestLogSettings(dbConn *dbx.DB) (RequestLogSettings, error) {
	s := DefaultRequestLogSettings()
	if dbConn == nil {
		return s, nil
	}

	var rows []struct {
		Key   string `db:"key"`
		Value string `db:"value"`
	}
	keys := []interface{}{
		SettingRequestLogEnabled, SettingRequestLogSampleRate, SettingRequestLogExcludePaths,
		SettingRequestLogRetentionDays, SettingVisitRetentionDays,
	}
	if err := dbConn.Select("key", "value").From("_settings").Where(dbx.In("key", keys...)).All(&rows); err != nil {
		return s, fmt.Errorf("failed to load request log settings: %w", err)
	}

	var invalid []string
	for _, row := range rows {
		v := strings.TrimSpace(row.Value)
		switch row.Key {
		case SettingRequestLogEnabled:
			b, err := strconv.ParseBool(v)
			if err != nil {
				invalid = append(invalid, row.Key)
				continue
			}
			s.Enabled = b
		case SettingRequestLogSampleRate:
			f, err := strconv.ParseFloat(v, 64)
			if err != nil || f < 0 || f > 1 {
				invalid = append(invalid, row.Key)
				continue
			}
			s.SampleRate = f
		case SettingRequestLogExcludePaths:
			s.ExcludePaths = nil
			for _, p := range strings.Split(v, ",") {
				if p = strings.TrimSpace(p); p != "" {
					s.ExcludePaths = append(s.ExcludePaths, p)
				}
			}
		case SettingRequestLogRetentionDays, SettingVisitRetentionDays:
			n, err := strconv.Atoi(v)
			if err != nil || n < 1 {
				invalid = append(invalid, row.Key)
				continue
			}
			if row.Key == SettingRequestLogRetentionDays {
				s.RetentionDays = n
			} else {
				s.VisitRetentionDays = n
			}
		}
	}
	if len(invalid) > 0 {
		return s, fmt.Errorf("invalid request log settings %s; using defaults for them", strings.Join(invalid, ", "))
	}
	return s, nil
}

// ValidateRequestLogSetting reports whether value is valid for key when key is one of the request
// log settings; other keys are not checked.
func ValidateRequestLogSetting(key, value string) error {
	v := strings.TrimSpace(value)
	switch key {
	case SettingRequestLogEnabled:
		if _, err := strconv.ParseBool(v); err != nil {
			return fmt.Errorf("%s must be true or false", key)
		}
	case SettingRequestLogSampleRate:
		if f, err := strconv.ParseFloat(v, 64); err != nil || f < 0 || f > 1 {
			return fmt.Errorf("%s must be a number from 0 to 1", key)
		}
	case SettingRequestLogRetentionDays, SettingVisitRetentionDays:
		if n, err := strconv.Atoi(v); err != nil || n < 1 {
			return fmt.Errorf("%s must be a whole number of days, at least 1", key)
		}
	}
	return nil
}

// ReloadSettings re-reads the request log settings from _settings. On an invalid value the
// remaining settings still apply and the error is returned for logging.
func (e *Engine) ReloadSettings() error {
	s, err := LoadRequestLogSettings(e.db)
	e.settingsMu.Lock()
	e.logSettings = s
	e.settingsMu.Unlock()
	return err
}

// RequestLogSettings returns the request log settings in force.
func (e *Engine) RequestLogSettings() RequestLogSettings {
	e.settingsMu.RLock()
	defer e.settingsMu.RUnlock()
	s := e.logSettings
	s.ExcludePaths = append([]string(nil), e.logSettings.ExcludePaths...)
	return s
}

// shouldLogRequest reports whether a request to path is written to _requests: the log is enabled,
// the path is not excluded, and the request falls within the sample rate.
func (e *Engine) shouldLogRequest(path string) bool {
	e.settingsMu.RLock()
	enabled, rate, excludes := e.logSettings.Enabled, e.logSettings.SampleRate, e.logSettings.ExcludePaths
	e.settingsMu.RUnlock()

	if !enabled || rate <= 0 {
		return false
	}
	for _, prefix := range excludes {
		if strings.HasPrefix(path, prefix) {
			return false
		}
	}
	return rate >= 1 || rand.Float64() < rate
}

// insertRequests writes batch to _requests in one transaction, with multi-row INSERTs of up to
// requestInsertChunk rows each.
func insertRequests(dbConn *dbx.DB, batch []RequestData) error {
	return db.WriteTx(dbConn, func(tx *dbx.Tx) error {
		for start := 0; start < len(batch); start += requestInsertChunk {
			end := start + requestInsertChunk
			if end > len(batch) {
				end = len(batch)
			}
			chunk := batch[start:end]

			var sb strings.Builder
			sb.WriteString("INSERT INTO _requests (id, visit_id, method, path, status_code, response_time_ms, createdAt) VALUES ")
			params := make(dbx.Params, len(chunk)*7)
			for i, req := range chunk {
				if i > 0 {
					sb.WriteString(", ")
				}
				fmt.Fprintf(&sb, "({:id%[1]d}, {:visit%[1]d}, {:method%[1]d}, {:path%[1]d}, {:status%[1]d}, {:ms%[1]d}, {:at%[1]d})", i)
				params[fmt.Sprintf("id%d", i)] = "req-" + util.RandomID()
				var visitID interface{}
				if req.VisitID != "" {
					visitID = req.VisitID // requests that cannot hold a visit are logged without one (NULL)
				}
				params[fmt.Sprintf("visit%d", i)] = visitID
				params[fmt.Sprintf("method%d", i)] = req.Method
				params[fmt.Sprintf("path%d", i)] = req.Path
				params[fmt.Sprintf("status%d", i)] = req.StatusCode
				params[fmt.Sprintf("ms%d", i)] = req.ResponseTimeMs
				params[fmt.Sprintf("at%d", i)] = req.CreatedAt
			}
			if _, err := tx.NewQuery(sb.String()).Bind(params).Execute(); err != nil {
				return fmt.Errorf("failed to insert %d request records: %w", len(chunk), err)
			}
		}
		return nil
	})
}
