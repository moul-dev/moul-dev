package tui

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestViewWorkerMonitor(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.Mouls = []schema.Moul{
		{Name: "background_tasks", Type: "worker"},
	}
	m.Width = 100
	m.Height = 30
	m.Jobs = []map[string]interface{}{
		{
			"id":           "job-123",
			"worker":       "SendEmail",
			"queue":        "default",
			"state":        "available",
			"attempt":      float64(0),
			"max_attempts": float64(5),
			"scheduled_at": "2026-08-07T12:00:00Z",
		},
	}

	out := m.viewWorkerMonitor()
	if !strings.Contains(out, "Background Jobs Monitor") {
		t.Errorf("Expected output to contain header, got: %s", out)
	}
	if !strings.Contains(out, "job-123") {
		t.Errorf("Expected output to contain job-123, got: %s", out)
	}

	// Test key nav
	m.updateWorkerMonitor(tea.KeyPressMsg{Code: 'j'})
	m.updateWorkerMonitor(tea.KeyPressMsg{Code: 'k'})
	m.updateWorkerMonitor(tea.KeyPressMsg{Code: tea.KeyEsc})
	if m.State != StateDashboard {
		t.Errorf("Expected state to be StateDashboard after Esc, got %v", m.State)
	}
}

func TestWorkerPollingTick(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.State = StateWorkerMonitor
	m.SelectedJobIndex = 0

	// Send worker tick message
	newM, cmd := m.Update(workerPollTickMsg{})
	if cmd == nil {
		t.Fatal("Expected batch cmd from workerPollTickMsg, got nil")
	}
	updatedM := newM.(*Model)
	if updatedM.State != StateWorkerMonitor {
		t.Fatalf("Expected StateWorkerMonitor, got %d", updatedM.State)
	}
}
