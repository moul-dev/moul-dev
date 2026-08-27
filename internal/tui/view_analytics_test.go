package tui

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
)

func TestViewAnalytics(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.Client = NewClient("http://localhost:8090", "testkey")
	m.Width = 100
	m.Height = 30
	m.Client.Token = "fake-jwt-token"
	m.Visits = []map[string]interface{}{
		{
			"id":               "visit-123",
			"ip":               "127.0.0.1",
			"browser":          "Chrome",
			"os":               "macOS",
			"device_type":      "desktop",
			"country":          "US",
			"referring_domain": "google.com",
			"landing_page":     "https://moul.dev",
			"started_at":       "2026-08-07T12:00:00Z",
		},
	}

	out := m.viewAnalytics()
	if !strings.Contains(out, "Visitor Analytics Console") {
		t.Errorf("Expected output to contain analytics header, got: %s", out)
	}
	if !strings.Contains(out, "visit-123") {
		t.Errorf("Expected output to contain visit-123, got: %s", out)
	}

	// Test key input
	m.updateAnalytics(tea.KeyPressMsg{Code: 'j'})
	m.updateAnalytics(tea.KeyPressMsg{Code: 'k'})
	m.updateAnalytics(tea.KeyPressMsg{Code: tea.KeyEsc})
	if m.State != StateDashboard {
		t.Errorf("Expected state to be StateDashboard after Esc, got %v", m.State)
	}
}

func TestAnalyticsDateFilterToggle(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.Client = NewClient("http://localhost:8090", "testkey")
	m.Client.Token = "fake-jwt-token"
	m.State = StateAnalytics
	m.analyticsDateFilterIdx = 0

	// 1. Toggle to 24 Hours
	m.updateAnalytics(tea.KeyPressMsg{Text: "t"})
	if m.analyticsDateFilterIdx != 1 {
		t.Fatalf("Expected analyticsDateFilterIdx to be 1 (24h), got %d", m.analyticsDateFilterIdx)
	}
	if from := m.getAnalyticsDateFilterFrom(); from == "" {
		t.Fatal("Expected non-empty from timestamp for 24h filter")
	}

	// 2. Toggle to 7 Days
	m.updateAnalytics(tea.KeyPressMsg{Text: "t"})
	if m.analyticsDateFilterIdx != 2 {
		t.Fatalf("Expected analyticsDateFilterIdx to be 2 (7d), got %d", m.analyticsDateFilterIdx)
	}

	// 3. Toggle to 30 Days
	m.updateAnalytics(tea.KeyPressMsg{Text: "t"})
	if m.analyticsDateFilterIdx != 3 {
		t.Fatalf("Expected analyticsDateFilterIdx to be 3 (30d), got %d", m.analyticsDateFilterIdx)
	}

	// 4. Toggle back to All Time
	m.updateAnalytics(tea.KeyPressMsg{Text: "t"})
	if m.analyticsDateFilterIdx != 0 {
		t.Fatalf("Expected analyticsDateFilterIdx to be 0 (All Time), got %d", m.analyticsDateFilterIdx)
	}
	if from := m.getAnalyticsDateFilterFrom(); from != "" {
		t.Fatalf("Expected empty from timestamp for All Time filter, got %q", from)
	}
}
