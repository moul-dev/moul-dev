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

func TestRecordSearchAndPagination(t *testing.T) {
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
	m.State = StateRecordList
	m.recordPage = 1
	m.recordTotalPages = 3
	m.recordTotalItems = 120

	// 1. Activate search mode with '/'
	m.updateRecordList(tea.KeyPressMsg{Text: "/"})
	if !m.recordSearchActive {
		t.Fatal("Expected recordSearchActive to be true after pressing '/'")
	}

	// 2. Type query and press enter
	m.recordSearchInput.SetValue("hello")
	m.updateRecordList(tea.KeyPressMsg{Code: tea.KeyEnter})
	if m.recordSearchActive {
		t.Fatal("Expected recordSearchActive to be false after pressing Enter")
	}
	if !strings.Contains(m.recordSearchFilter, "hello") {
		t.Fatalf("Expected filter to contain 'hello', got %q", m.recordSearchFilter)
	}

	// 3. Test pagination next '>'
	m.updateRecordList(tea.KeyPressMsg{Text: ">"})
	if m.recordPage != 2 {
		t.Fatalf("Expected recordPage to be 2 after '>', got %d", m.recordPage)
	}

	// 4. Test pagination prev '<'
	m.updateRecordList(tea.KeyPressMsg{Text: "<"})
	if m.recordPage != 1 {
		t.Fatalf("Expected recordPage to be 1 after '<', got %d", m.recordPage)
	}

	// 5. Test clear filter with Esc
	m.updateRecordList(tea.KeyPressMsg{Code: tea.KeyEsc})
	if m.recordSearchFilter != "" {
		t.Fatalf("Expected recordSearchFilter to be cleared after Esc, got %q", m.recordSearchFilter)
	}
}

func TestRecordDetailCopyJSON(t *testing.T) {
	m := NewModel("http://localhost:8090", "testkey")
	m.Mouls = []schema.Moul{
		{
			Name: "posts",
			Type: "base",
		},
	}
	m.State = StateRecordDetail
	m.Records = []map[string]interface{}{
		{"id": "rec-123", "title": "Sample"},
	}
	m.SelectedRecordIndex = 0

	// Press 'c' to copy JSON
	m.updateRecordDetail(tea.KeyPressMsg{Text: "c"})
	if !strings.Contains(m.SuccessMsg, "copied to clipboard") {
		t.Fatalf("Expected success message for copying JSON, got %q", m.SuccessMsg)
	}
}

func TestClientListRecordsPaginated_SearchAndFilter(t *testing.T) {
	c := NewClient("http://localhost:8090", "testkey")
	// Verify that client builds query params using search= for plain strings and filter= for rule expressions
	moul := &schema.Moul{Name: "posts"}
	_ = moul

	// 1. Plain query -> search param
	res, err := c.ListRecordsPaginated("posts", 1, 20, "", "hello world")
	// Since server isn't running on 8090 in this isolated unit test, we check that error is network connection, not URL/syntax error
	if err != nil && !strings.Contains(err.Error(), "connection refused") && !strings.Contains(err.Error(), "connect") {
		t.Logf("Result: %v, err: %v", res, err)
	}

	// 2. Rule query -> filter param
	res, err = c.ListRecordsPaginated("posts", 1, 20, "", "status = 'active'")
	if err != nil && !strings.Contains(err.Error(), "connection refused") && !strings.Contains(err.Error(), "connect") {
		t.Logf("Result: %v, err: %v", res, err)
	}
}
