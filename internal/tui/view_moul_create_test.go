package tui

import (
	"testing"
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
		{"  title:text , views:number , published:bool  ", false},
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
	input := "title:text, views:number, published:bool"
	fields := parseFieldsString(input)

	if len(fields) != 3 {
		t.Fatalf("Expected 3 fields, got %d", len(fields))
	}

	expected := []struct {
		name  string
		fType string
	}{
		{"title", "text"},
		{"views", "number"},
		{"published", "bool"},
	}

	for i, exp := range expected {
		if fields[i].Name != exp.name {
			t.Errorf("Expected fields[%d].Name = %q, got %q", i, exp.name, fields[i].Name)
		}
		if fields[i].Type != exp.fType {
			t.Errorf("Expected fields[%d].Type = %q, got %q", i, exp.fType, fields[i].Type)
		}
	}
}
