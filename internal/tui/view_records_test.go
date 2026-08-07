package tui

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestViewRecords(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.Mouls = []schema.Moul{
		{
			Name: "posts",
			Type: "base",
			Fields: []schema.MoulField{
				{Name: "title", Type: "text"},
			},
		},
	}
	m.ActiveSidebarIndex = 0
	m.Width = 100
	m.Height = 30
	m.Records = []map[string]interface{}{
		{
			"id":         "rec-123",
			"title":      "Hello World",
			"created_at": "2026-08-07T12:00:00Z",
			"updated_at": "2026-08-07T12:00:00Z",
		},
	}

	out := m.viewRecordList()
	if !strings.Contains(out, "RECORDS") {
		t.Errorf("Expected output to contain collection header, got: %s", out)
	}
	if !strings.Contains(out, "rec-123") {
		t.Errorf("Expected output to contain rec-123, got: %s", out)
	}

	// Test key input
	m.updateRecordList(tea.KeyPressMsg{Code: 'j'})
	m.updateRecordList(tea.KeyPressMsg{Code: 'k'})
	m.updateRecordList(tea.KeyPressMsg{Code: tea.KeyEsc})
	if m.State != StateDashboard {
		t.Errorf("Expected state to be StateDashboard after Esc, got %v", m.State)
	}
}
