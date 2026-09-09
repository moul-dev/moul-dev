package tui

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestValidateFieldsString(t *testing.T) {
	tests := []struct {
		input   string
		wantErr bool
	}{
		{"", false},
		{"   ", false},
		{"title:text", false},
		{"title:text,views:number,published:bool", false},
		{"created_date:date,updated_at:datetime,link:url,extra:json", false},
		{"  title:text , views:number , published:bool  ", false},
		{"status:select:draft|published", false},
		{"status:select:", true},
		{"status:select", true},
		{"title", true},
		{"title:", true},
		{":text", true},
		{"title:text,views", true},
		{"title:invalid_type", true},
		{"1title:text", true},
		{"title-name:text", true},
	}

	for _, tt := range tests {
		err := validateFieldsString(tt.input)
		if (err != nil) != tt.wantErr {
			t.Errorf("validateFieldsString(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
		}
	}
}

func TestParseFieldsString(t *testing.T) {
	input := "title:text, views:number, published:bool, status:select:draft|published"
	fields := parseFieldsString(input)

	if len(fields) != 4 {
		t.Fatalf("Expected 4 fields, got %d", len(fields))
	}

	expected := []struct {
		name  string
		fType string
	}{
		{"title", "text"},
		{"views", "number"},
		{"published", "bool"},
		{"status", "select"},
	}

	for i, exp := range expected {
		if fields[i].Name != exp.name {
			t.Errorf("Expected fields[%d].Name = %q, got %q", i, exp.name, fields[i].Name)
		}
		if fields[i].Type != exp.fType {
			t.Errorf("Expected fields[%d].Type = %q, got %q", i, exp.fType, fields[i].Type)
		}
	}
	if len(fields[3].Options) != 2 || fields[3].Options[0] != "draft" || fields[3].Options[1] != "published" {
		t.Errorf("Unexpected select options: %+v", fields[3].Options)
	}
}

func TestAuthCollectionDefaultAccessRules(t *testing.T) {
	m := NewModel("http://localhost:8090", "test-key")
	m.State = StateMoulCreate
	m.initMoulForm()

	if m.newMoulType != "base" {
		t.Fatalf("Expected default collection type 'base', got %q", m.newMoulType)
	}

	// Change type to auth and simulate completion
	m.newMoulName = "users"
	m.newMoulType = "auth"
	m.MoulForm.State = huh.StateCompleted

	// Send an empty keypress msg to model.Update to trigger metadata completion logic
	newModel, _ := m.Update(tea.KeyPressMsg{})
	m = newModel.(*Model)

	if m.newMoulListRule != "id = @request.auth.id" {
		t.Errorf("Expected newMoulListRule 'id = @request.auth.id', got %q", m.newMoulListRule)
	}
	if m.newMoulViewRule != "id = @request.auth.id" {
		t.Errorf("Expected newMoulViewRule 'id = @request.auth.id', got %q", m.newMoulViewRule)
	}
	if m.newMoulCreateRule != "" {
		t.Errorf("Expected newMoulCreateRule '', got %q", m.newMoulCreateRule)
	}
	if m.newMoulUpdateRule != "id = @request.auth.id" {
		t.Errorf("Expected newMoulUpdateRule 'id = @request.auth.id', got %q", m.newMoulUpdateRule)
	}
	if m.newMoulDeleteRule != "id = @request.auth.id" {
		t.Errorf("Expected newMoulDeleteRule 'id = @request.auth.id', got %q", m.newMoulDeleteRule)
	}

	// Verify view rendering includes the access rules
	rendered := m.viewMoulCreate()
	if !strings.Contains(rendered, "Access Rules:") {
		t.Errorf("Expected view to contain 'Access Rules:', got %s", rendered)
	}
	if !strings.Contains(rendered, "id = @request.auth.id") {
		t.Errorf("Expected view to contain 'id = @request.auth.id', got %s", rendered)
	}
	if !strings.Contains(rendered, "(public sign-up)") {
		t.Errorf("Expected view to contain '(public sign-up)', got %s", rendered)
	}

	// Verify initMoulRulesForm sets auth-specific titles and placeholders
	m.initMoulRulesForm()
	if m.MoulRulesForm == nil {
		t.Fatal("Expected MoulRulesForm to be initialized")
	}

	// Now simulate switching back to base
	m.moulWizardState = "metadata"
	m.newMoulType = "base"
	m.MoulForm.State = huh.StateCompleted
	newModel, _ = m.Update(tea.KeyPressMsg{})
	m = newModel.(*Model)

	if m.newMoulListRule != "" || m.newMoulViewRule != "" || m.newMoulUpdateRule != "" || m.newMoulDeleteRule != "" {
		t.Errorf("Expected rules to be cleared when switching to base, got list: %q, view: %q, update: %q, delete: %q",
			m.newMoulListRule, m.newMoulViewRule, m.newMoulUpdateRule, m.newMoulDeleteRule)
	}
}

func TestSaveMoulFormAuthDefaults(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" && r.URL.Path == "/api/moul" {
			var created schema.Moul
			if err := json.NewDecoder(r.Body).Decode(&created); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			// Verify default access rules were sent
			if created.Rules.ListRule != "id = @request.auth.id" {
				t.Errorf("Expected ListRule 'id = @request.auth.id', got %q", created.Rules.ListRule)
			}
			if created.Rules.ViewRule != "id = @request.auth.id" {
				t.Errorf("Expected ViewRule 'id = @request.auth.id', got %q", created.Rules.ViewRule)
			}
			if created.Rules.CreateRule != "" {
				t.Errorf("Expected CreateRule '', got %q", created.Rules.CreateRule)
			}
			if created.Rules.UpdateRule != "id = @request.auth.id" {
				t.Errorf("Expected UpdateRule 'id = @request.auth.id', got %q", created.Rules.UpdateRule)
			}
			if created.Rules.DeleteRule != "id = @request.auth.id" {
				t.Errorf("Expected DeleteRule 'id = @request.auth.id', got %q", created.Rules.DeleteRule)
			}
			w.WriteHeader(http.StatusCreated)
			_ = json.NewEncoder(w).Encode(created)
			return
		}
		if r.Method == "GET" && r.URL.Path == "/api/moul" {
			_ = json.NewEncoder(w).Encode([]schema.Moul{})
			return
		}
		http.NotFound(w, r)
	}))
	defer server.Close()

	m := NewModel(server.URL, "test-key")
	m.Client = NewClient(server.URL, "test-key")
	m.State = StateMoulCreate
	m.initMoulForm()
	m.newMoulName = "accounts"
	m.newMoulType = "auth"
	// Rules left intentionally blank before save
	m.newMoulListRule = ""
	m.newMoulViewRule = ""
	m.newMoulCreateRule = ""
	m.newMoulUpdateRule = ""
	m.newMoulDeleteRule = ""

	cmd := m.saveMoulForm()
	if cmd == nil {
		t.Fatal("Expected saveMoulForm cmd to not be nil")
	}
	msg := cmd()
	res, ok := msg.(createMoulResultMsg)
	if !ok {
		t.Fatalf("Expected createMoulResultMsg, got %T", msg)
	}
	if res.err != nil {
		t.Fatalf("saveMoulForm returned error: %v", res.err)
	}
}
