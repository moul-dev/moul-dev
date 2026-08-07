package schema

import (
	"encoding/json"
	"testing"
)

func TestSerializeFieldsAndRules(t *testing.T) {
	m := &Moul{
		ID:   "moul-1",
		Name: "test_moul",
		Type: "base",
		Fields: []MoulField{
			{Name: "title", Type: "text"},
			{Name: "is_active", Type: "bool"},
			{Name: "status", Type: "select", Options: []string{"draft", "published"}},
		},
		Rules: MoulRules{
			ListRule:   "@request.auth.id != ''",
			CreateRule: "@request.auth.id != ''",
		},
	}

	// Test SerializeFields
	fieldsJSON, err := m.SerializeFields()
	if err != nil {
		t.Fatalf("SerializeFields failed: %v", err)
	}

	var fields []MoulField
	if err := json.Unmarshal([]byte(fieldsJSON), &fields); err != nil {
		t.Fatalf("Failed to unmarshal fields JSON: %v", err)
	}

	if len(fields) != 3 || fields[0].Name != "title" || fields[1].Type != "bool" || fields[2].Type != "select" {
		t.Errorf("Unexpected unmarshaled fields: %+v", fields)
	}
	if len(fields[2].Options) != 2 || fields[2].Options[0] != "draft" || fields[2].Options[1] != "published" {
		t.Errorf("Unexpected select options: %+v", fields[2].Options)
	}

	// Test SerializeRules
	rulesJSON, err := m.SerializeRules()
	if err != nil {
		t.Fatalf("SerializeRules failed: %v", err)
	}

	var rules MoulRules
	if err := json.Unmarshal([]byte(rulesJSON), &rules); err != nil {
		t.Fatalf("Failed to unmarshal rules JSON: %v", err)
	}

	if rules.ListRule != "@request.auth.id != ''" || rules.CreateRule != "@request.auth.id != ''" || rules.UpdateRule != "" {
		t.Errorf("Unexpected unmarshaled rules: %+v", rules)
	}
}
