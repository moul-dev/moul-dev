package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/testutil"
)

func patchSettings(t *testing.T, ts *testutil.TestServer, body map[string]string) *http.Response {
	t.Helper()
	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	req, err := http.NewRequest(http.MethodPatch, ts.URL+"/api/settings", bytes.NewReader(payload))
	if err != nil {
		t.Fatalf("request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Key", ts.AdminKey)
	resp, err := ts.Client.Do(req)
	if err != nil {
		t.Fatalf("PATCH /api/settings: %v", err)
	}
	return resp
}

func TestRequestLogSettingsUpdateReloadsEngine(t *testing.T) {
	dbConn := testutil.NewTestDB(t)
	engine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("NewEngine: %v", err)
	}
	ts := testutil.NewTestServer(t, testutil.WithDB(dbConn), testutil.WithAnalyticsEngine(engine))

	resp := patchSettings(t, ts, map[string]string{
		"request_log_enabled":        "false",
		"request_log_sample_rate":    "0.5",
		"request_log_exclude_paths":  "/custom/poll",
		"request_log_retention_days": "14",
		"visit_retention_days":       "7",
	})
	if err := resp.Body.Close(); err != nil {
		t.Fatalf("close body: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	s := engine.RequestLogSettings()
	if s.Enabled || s.SampleRate != 0.5 || len(s.ExcludePaths) != 1 || s.ExcludePaths[0] != "/custom/poll" ||
		s.RetentionDays != 14 || s.VisitRetentionDays != 7 {
		t.Fatalf("engine did not pick up the new settings: %+v", s)
	}
}

func TestRequestLogSettingsRejectInvalidValues(t *testing.T) {
	ts := testutil.NewTestServer(t)
	for key, value := range map[string]string{
		"request_log_enabled":        "sometimes",
		"request_log_sample_rate":    "2",
		"request_log_retention_days": "0",
		"visit_retention_days":       "a week",
	} {
		resp := patchSettings(t, ts, map[string]string{key: value})
		if err := resp.Body.Close(); err != nil {
			t.Fatalf("close body: %v", err)
		}
		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("%s=%q: expected 400, got %d", key, value, resp.StatusCode)
		}
	}
}
