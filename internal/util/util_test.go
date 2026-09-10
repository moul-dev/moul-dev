package util

import (
	"os"
	"strings"
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
		// Regular plural transformations
		{"users", "user"},
		{"Users", "user"},
		{"posts", "post"},
		{"Posts", "post"},
		{"comments", "comment"},
		{"Comments", "comment"},
		{"categories", "category"},
		{"Categories", "category"},
		{"queries", "query"},
		{"classes", "class"},
		{"passes", "pass"},
		{"boxes", "box"},
		{"heroes", "hero"},
		{"articles", "article"},
		{"pages", "page"},
		{"rules", "rule"},
		{"profiles", "profile"},
		{"messages", "message"},
		{"devices", "device"},
		{"addresses", "address"},
		{"dishes", "dish"},
		{"matches", "match"},
		{"glasses", "glass"},
		{"statuses", "status"},
		{"logs", "log"},
		{"events", "event"},
		{"metrics", "metric"},
		{"webhooks", "webhook"},
		{"files", "file"},
		{"tokens", "token"},

		// Irregular plural transformations (dictionary-backed)
		{"people", "person"},
		{"People", "person"},
		{"children", "child"},
		{"Children", "child"},
		{"men", "man"},
		{"women", "woman"},
		{"teeth", "tooth"},
		{"feet", "foot"},
		{"mice", "mouse"},
		{"quizzes", "quiz"},
		{"analyses", "analysis"},

		// Compound / multi-word nouns
		{"sales_people", "sales_person"},
		{"salesPeople", "salesperson"},
		{"blog_posts", "blog_post"},
		{"blogPosts", "blogpost"},
		{"chat_messages", "chat_message"},
		{"chatMessages", "chatmessage"},

		// Already singular nouns (should not be altered)
		{"person", "person"},
		{"Person", "person"},
		{"user", "user"},
		{"post", "post"},
		{"comment", "comment"},
		{"child", "child"},
		{"man", "man"},
		{"woman", "woman"},
		{"glass", "glass"},
		{"status", "status"},
		{"quiz", "quiz"},
		{"moul", "moul"},
		{"auth", "auth"},

		// Domain uncountables
		{"data", "data"},
		{"metadata", "metadata"},
		{"analytics", "analytics"},
		{"media", "media"},
		{"news", "news"},
		{"equipment", "equipment"},
		{"information", "information"},

		// Edge cases
		{"", ""},
		{"   ", ""},
		{"  Users  ", "user"},
		{"  people  ", "person"},
	}

	for _, test := range tests {
		actual := Singularize(test.input)
		if actual != test.expected {
			t.Errorf("Singularize(%q) = %q; expected %q", test.input, actual, test.expected)
		}
	}
}

func TestRecordID(t *testing.T) {
	tests := []struct {
		collection     string
		expectedPrefix string
	}{
		{"Users", "user-"},
		{"users", "user-"},
		{"Posts", "post-"},
		{"Comments", "comment-"},
		{"people", "person-"},
		{"People", "person-"},
		{"person", "person-"},
		{"classes", "class-"},
		{"data", "data-"},
		{"", ""},
	}

	for _, tc := range tests {
		id := RecordID(tc.collection)
		if tc.expectedPrefix == "" {
			if strings.Contains(id, "-") {
				t.Errorf("RecordID(%q) = %q, expected raw ID without hyphen", tc.collection, id)
			}
			if len(id) != 15 {
				t.Errorf("RecordID(%q) length = %d, expected 15", tc.collection, len(id))
			}
		} else {
			if !strings.HasPrefix(id, tc.expectedPrefix) {
				t.Errorf("RecordID(%q) = %q, expected prefix %q", tc.collection, id, tc.expectedPrefix)
			}
			randomPart := strings.TrimPrefix(id, tc.expectedPrefix)
			if len(randomPart) != 15 {
				t.Errorf("RecordID(%q) random part length = %d, expected 15 (id=%q)", tc.collection, len(randomPart), id)
			}
			for _, c := range randomPart {
				if !isValidChar(c) {
					t.Errorf("RecordID(%q) contains invalid random character %c in id %q", tc.collection, c, id)
				}
			}
		}
	}

	// Verify uniqueness
	id1 := RecordID("people")
	id2 := RecordID("people")
	if id1 == id2 {
		t.Errorf("expected unique IDs, got identical: %s", id1)
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


