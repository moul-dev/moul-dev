package analytics

import (
	"fmt"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/pocketbase/dbx"
)

func newRequestLogTestEngine(t *testing.T) (*Engine, *dbx.DB) {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})
	engine, err := NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("NewEngine: %v", err)
	}
	return engine, dbConn
}

func setSetting(t *testing.T, dbConn *dbx.DB, key, value string) {
	t.Helper()
	if _, err := dbConn.Update("_settings", dbx.Params{"value": value}, dbx.HashExp{"key": key}).Execute(); err != nil {
		t.Fatalf("set %s: %v", key, err)
	}
}

func TestRequestLogSettingsDefaultsAreSeeded(t *testing.T) {
	engine, _ := newRequestLogTestEngine(t)
	s := engine.RequestLogSettings()
	if !s.Enabled || s.SampleRate != 1 || len(s.ExcludePaths) != 0 || s.RetentionDays != 30 || s.VisitRetentionDays != 30 {
		t.Fatalf("unexpected defaults: %+v", s)
	}
}

func TestLoadRequestLogSettingsParsesAndReportsInvalid(t *testing.T) {
	_, dbConn := newRequestLogTestEngine(t)
	setSetting(t, dbConn, SettingRequestLogEnabled, "false")
	setSetting(t, dbConn, SettingRequestLogSampleRate, "0.25")
	setSetting(t, dbConn, SettingRequestLogExcludePaths, " /api/health , /custom/poll ,")
	setSetting(t, dbConn, SettingRequestLogRetentionDays, "7")
	setSetting(t, dbConn, SettingVisitRetentionDays, "zero")

	s, err := LoadRequestLogSettings(dbConn)
	if err == nil {
		t.Fatal("expected an error naming the invalid visit retention")
	}
	if s.Enabled || s.SampleRate != 0.25 || s.RetentionDays != 7 {
		t.Fatalf("valid settings must still apply: %+v", s)
	}
	if s.VisitRetentionDays != 30 {
		t.Fatalf("an invalid value must keep its default, got %d", s.VisitRetentionDays)
	}
	if len(s.ExcludePaths) != 2 || s.ExcludePaths[0] != "/api/health" || s.ExcludePaths[1] != "/custom/poll" {
		t.Fatalf("unexpected exclude paths: %#v", s.ExcludePaths)
	}
}

func TestValidateRequestLogSetting(t *testing.T) {
	valid := map[string]string{
		SettingRequestLogEnabled:       "false",
		SettingRequestLogSampleRate:    "0.1",
		SettingRequestLogRetentionDays: "90",
		SettingVisitRetentionDays:      "1",
		SettingRequestLogExcludePaths:  "/a,/b",
		"app_name":                     "anything",
	}
	for k, v := range valid {
		if err := ValidateRequestLogSetting(k, v); err != nil {
			t.Errorf("%s=%q: unexpected error %v", k, v, err)
		}
	}
	invalid := map[string]string{
		SettingRequestLogEnabled:       "maybe",
		SettingRequestLogSampleRate:    "1.5",
		SettingRequestLogRetentionDays: "0",
		SettingVisitRetentionDays:      "-3",
	}
	for k, v := range invalid {
		if err := ValidateRequestLogSetting(k, v); err == nil {
			t.Errorf("%s=%q: expected an error", k, v)
		}
	}
}

func TestShouldLogRequest(t *testing.T) {
	engine, dbConn := newRequestLogTestEngine(t)

	if !engine.shouldLogRequest("/api/moul/posts/records") {
		t.Fatal("requests are logged by default")
	}

	setSetting(t, dbConn, SettingRequestLogExcludePaths, "/custom/poll")
	if err := engine.ReloadSettings(); err != nil {
		t.Fatalf("reload: %v", err)
	}
	if engine.shouldLogRequest("/custom/poll/unread") {
		t.Fatal("an excluded prefix must not be logged")
	}
	if !engine.shouldLogRequest("/custom/me") {
		t.Fatal("other paths are still logged")
	}

	setSetting(t, dbConn, SettingRequestLogSampleRate, "0.5")
	if err := engine.ReloadSettings(); err != nil {
		t.Fatalf("reload: %v", err)
	}
	logged := 0
	const trials = 4000
	for i := 0; i < trials; i++ {
		if engine.shouldLogRequest("/custom/me") {
			logged++
		}
	}
	if logged < trials*35/100 || logged > trials*65/100 {
		t.Fatalf("sample rate 0.5 logged %d of %d requests", logged, trials)
	}

	setSetting(t, dbConn, SettingRequestLogEnabled, "false")
	if err := engine.ReloadSettings(); err != nil {
		t.Fatalf("reload: %v", err)
	}
	if engine.shouldLogRequest("/custom/me") {
		t.Fatal("a disabled request log logs nothing")
	}
}

func TestTrackRequestRespectsDisabledLog(t *testing.T) {
	engine, dbConn := newRequestLogTestEngine(t)
	setSetting(t, dbConn, SettingRequestLogEnabled, "false")
	if err := engine.ReloadSettings(); err != nil {
		t.Fatalf("reload: %v", err)
	}
	engine.TrackRequest(RequestData{VisitID: "v", Method: "GET", Path: "/x", StatusCode: 200, CreatedAt: time.Now().UTC().Format(time.RFC3339)})
	if n := len(engine.requestCh); n != 0 {
		t.Fatalf("expected nothing queued while the log is disabled, got %d", n)
	}
}

func TestFlushRequestsWritesWholeBatch(t *testing.T) {
	engine, dbConn := newRequestLogTestEngine(t)
	now := time.Now().UTC().Format(time.RFC3339)

	const n = 250 // more than one multi-row INSERT chunk
	batch := make([]RequestData, n)
	for i := range batch {
		batch[i] = RequestData{
			VisitID: "visit-1", Method: "GET", Path: fmt.Sprintf("/p/%d", i),
			StatusCode: 200, ResponseTimeMs: int64(i), CreatedAt: now,
		}
	}
	engine.flushRequests(batch)

	var count int
	if err := dbConn.Select("COUNT(*)").From("_requests").Row(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != n {
		t.Fatalf("expected %d rows, got %d", n, count)
	}
	var path string
	var ms int64
	if err := dbConn.NewQuery("SELECT path, response_time_ms FROM _requests WHERE path = '/p/249'").Row(&path, &ms); err != nil {
		t.Fatalf("read back: %v", err)
	}
	if ms != 249 {
		t.Fatalf("expected response_time_ms 249, got %d", ms)
	}
}
