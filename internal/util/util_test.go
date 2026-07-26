package util

import (
	"testing"
)

func TestRandomID(t *testing.T) {
	id1 := RandomID()
	if len(id1) != 15 {
		t.Errorf("expected RandomID length of 15, got %d", len(id1))
	}

	// Verify all characters are within idChars
	for _, char := range id1 {
		if !isValidChar(char) {
			t.Errorf("invalid character in generated ID: %c", char)
		}
	}

	id2 := RandomID()
	if id1 == id2 {
		t.Errorf("expected generated IDs to be unique, got two identical IDs: %s", id1)
	}
}

func isValidChar(r rune) bool {
	for _, c := range idChars {
		if r == c {
			return true
		}
	}
	return false
}

func TestSingularize(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"categories", "category"},
		{"queries", "query"},
		{"classes", "class"},
		{"passes", "pass"},
		{"boxes", "box"},
		{"heroes", "hero"},
		{"users", "user"},
		{"posts", "post"},
		{"glass", "glass"},
		{"moul", "moul"},
		{"Categories", "category"}, // input case conversion test
	}

	for _, test := range tests {
		actual := Singularize(test.input)
		if actual != test.expected {
			t.Errorf("Singularize(%q) = %q; expected %q", test.input, actual, test.expected)
		}
	}
}

func TestSlugifyFilename(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"My Profile Photo (2026) & Info!.PNG", "my-profile-photo-2026-info.png"},
		{"hello_world.png", "hello_world.png"},
		{"Space File (1).jpeg", "space-file-1.jpeg"},
		{"TEST---MULTIPLE---HYPHENS.pdf", "test-multiple-hyphens.pdf"},
		{"!!!.png", "file.png"},
		{"", "file"},
		{"noext", "noext"},
		{"My-Document-v1.0.docx", "my-document-v1-0.docx"},
	}

	for _, test := range tests {
		actual := SlugifyFilename(test.input)
		if actual != test.expected {
			t.Errorf("SlugifyFilename(%q) = %q; expected %q", test.input, actual, test.expected)
		}
	}
}

