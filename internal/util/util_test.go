package util

import (
	"os"
	"testing"
)

func TestGetPublicURL(t *testing.T) {
	os.Unsetenv("MOUL_PUBLIC_URL")
	os.Unsetenv("MOUL_PORT")
	if url := GetPublicURL(); url != "http://localhost:8090" {
		t.Errorf("expected default http://localhost:8090, got %q", url)
	}

	os.Setenv("MOUL_PORT", "9090")
	if url := GetPublicURL(); url != "http://localhost:9090" {
		t.Errorf("expected http://localhost:9090, got %q", url)
	}

	os.Setenv("MOUL_PUBLIC_URL", "https://api.example.com/")
	if url := GetPublicURL(); url != "https://api.example.com" {
		t.Errorf("expected trimmed https://api.example.com, got %q", url)
	}

	os.Unsetenv("MOUL_PUBLIC_URL")
	os.Unsetenv("MOUL_PORT")
}

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
		{"articles", "article"},
		{"pages", "page"},
		{"rules", "rule"},
		{"profiles", "profile"},
		{"messages", "message"},
		{"devices", "device"},
		{"addresses", "address"},
		{"dishes", "dish"},
		{"matches", "match"},
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
