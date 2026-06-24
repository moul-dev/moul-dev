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
		},
		Rules: MoulRules{
			ListRule:   "auth.id != nil",
			CreateRule: "auth.id != nil",
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

	if len(fields) != 2 || fields[0].Name != "title" || fields[1].Type != "bool" {
		t.Errorf("Unexpected unmarshaled fields: %+v", fields)
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

	if rules.ListRule != "auth.id != nil" || rules.CreateRule != "auth.id != nil" || rules.UpdateRule != "" {
		t.Errorf("Unexpected unmarshaled rules: %+v", rules)
	}
}
