package tui

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestViewDashboard(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.Width = 120
	m.Height = 35
	m.Mouls = []schema.Moul{
		{
			Name: "users",
			Type: "auth",
			Fields: []schema.MoulField{
				{Name: "username", Type: "text"},
			},
		},
		{
			Name: "posts",
			Type: "base",
			Fields: []schema.MoulField{
				{Name: "title", Type: "text"},
			},
		},
	}
	m.ActiveSidebarIndex = 0

	out := m.viewDashboard()
	if !strings.Contains(out, "COLLECTIONS") {
		t.Errorf("Expected output to contain COLLECTIONS header, got: %s", out)
	}
	if !strings.Contains(out, "users") {
		t.Errorf("Expected output to contain users collection, got: %s", out)
	}

	// Test navigation keys
	m.updateDashboard(tea.KeyPressMsg{Code: 'j'})
	m.updateDashboard(tea.KeyPressMsg{Code: 'k'})
	m.updateDashboard(tea.KeyPressMsg{Code: 'n'})
	if m.State != StateMoulCreate {
		t.Errorf("Expected state to be StateMoulCreate after pressing 'n', got %v", m.State)
	}
}
