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
