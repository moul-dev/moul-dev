package rules

import (
	"testing"

	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestBuildSortSQL(t *testing.T) {
	moul := &schema.Moul{
		Name: "posts",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "number"},
		},
	}

	tests := []struct {
		input    string
		expected []string
		wantErr  bool
	}{
		{"", nil, false},
		{"-created,title", []string{"created DESC", "title ASC"}, false},
		{"+price,-id", []string{"price ASC", "id DESC"}, false},
		{"@random", []string{"RANDOM()"}, false},
		{"invalid_col", nil, true},
	}

	for _, tt := range tests {
		got, err := BuildSortSQL(tt.input, moul)
		if (err != nil) != tt.wantErr {
			t.Errorf("BuildSortSQL(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
			continue
		}
		if !tt.wantErr {
			if len(got) != len(tt.expected) {
				t.Errorf("BuildSortSQL(%q) = %v; want %v", tt.input, got, tt.expected)
				continue
			}
			for i := range got {
				if got[i] != tt.expected[i] {
					t.Errorf("BuildSortSQL(%q)[%d] = %q; want %q", tt.input, i, got[i], tt.expected[i])
				}
			}
		}
	}
}

func TestBuildFilterSQL(t *testing.T) {
	moul := &schema.Moul{
		Name: "posts",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "price", Type: "number"},
			{Name: "author_id", Type: "text"},
			{Name: "active", Type: "bool"},
		},
	}

	authRecord := map[string]interface{}{
		"id":    "user123",
		"email": "user@test.com",
	}

	tests := []struct {
		name       string
		filter     string
		auth       map[string]interface{}
		wantSub    string
		wantParams map[string]interface{}
		wantErr    bool
	}{
		{
			name:       "empty filter",
			filter:     "",
			wantSub:    "",
			wantParams: nil,
		},
		{
			name:    "simple equality",
			filter:  "title = 'Hello'",
			wantSub: "title = {:p1}",
			wantParams: map[string]interface{}{
				"p1": "Hello",
			},
		},
		{
			name:    "number comparison and logical and",
			filter:  "price > 50 && active = true",
			wantSub: "(price > {:p1} AND active = {:p2})",
			wantParams: map[string]interface{}{
				"p1": int64(50),
				"p2": true,
			},
		},
		{
			name:    "contains like operator",
			filter:  "title ~ 'test'",
			wantSub: "title LIKE {:p1}",
			wantParams: map[string]interface{}{
				"p1": "%test%",
			},
		},
		{
			name:    "auth substitution",
			filter:  "author_id = @request.auth.id",
			auth:    authRecord,
			wantSub: "author_id = {:p1}",
			wantParams: map[string]interface{}{
				"p1": "user123",
			},
		},
		{
			name:    "invalid column name",
			filter:  "unknown_column = 123",
			wantErr: true,
		},
		{
			name:    "subquery collection filter",
			filter:  "@collection.posts.author_id = id",
			wantSub: "EXISTS (SELECT 1 FROM posts WHERE posts.author_id = id)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotSQL, params, err := BuildFilterSQL(tt.filter, moul, tt.auth)
			if (err != nil) != tt.wantErr {
				t.Fatalf("BuildFilterSQL(%q) error = %v, wantErr %v", tt.filter, err, tt.wantErr)
			}
			if tt.wantErr {
				return
			}

			if tt.wantSub != "" && gotSQL != tt.wantSub {
				t.Errorf("BuildFilterSQL(%q) SQL = %q; want %q", tt.filter, gotSQL, tt.wantSub)
			}

			if tt.wantParams != nil {
				for k, v := range tt.wantParams {
					if params[k] != v {
						t.Errorf("BuildFilterSQL(%q) param[%s] = %v; want %v", tt.filter, k, params[k], v)
					}
				}
			}
		})
	}
}
