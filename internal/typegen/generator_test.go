package typegen

import (
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestGenerateTypeScript(t *testing.T) {
	mouls := []*schema.Moul{
		{
			ID:   "moul_posts",
			Name: "posts",
			Type: "base",
			Fields: []schema.MoulField{
				{Name: "title", Type: "text", Required: true},
				{Name: "status", Type: "select", Options: []string{"draft", "published"}},
				{Name: "views", Type: "number"},
				{Name: "author_id", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users"}},
				{Name: "is_active", Type: "bool"},
			},
		},
		{
			ID:   "moul_users",
			Name: "users",
			Type: "auth",
			Fields: []schema.MoulField{
				{Name: "bio", Type: "text"},
			},
		},
	}

	tsCode := GenerateTypeScript(mouls)

	if !strings.Contains(tsCode, "export interface PostsRecord extends BaseSystemFields") {
		t.Errorf("Expected PostsRecord interface, got:\n%s", tsCode)
	}
	if !strings.Contains(tsCode, "title: string;") {
		t.Errorf("Expected required title field, got:\n%s", tsCode)
	}
	if !strings.Contains(tsCode, `status?: "draft" | "published";`) {
		t.Errorf("Expected select status union type, got:\n%s", tsCode)
	}
	if !strings.Contains(tsCode, "author_id_expand?: UsersRecord;") {
		t.Errorf("Expected relation expand helper, got:\n%s", tsCode)
	}
	if !strings.Contains(tsCode, "export interface MoulSchema") {
		t.Errorf("Expected MoulSchema interface, got:\n%s", tsCode)
	}
	if !strings.Contains(tsCode, `"posts": PostsRecord;`) {
		t.Errorf("Expected posts in MoulSchema, got:\n%s", tsCode)
	}
}

func TestGenerateFromDB(t *testing.T) {
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init in-memory database: %v", err)
	}
	defer dbConn.Close()

	m := &schema.Moul{
		ID:   "moul_tasks",
		Name: "tasks",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "task_name", Type: "text", Required: true},
		},
	}
	_ = db.CreateMoulTable(dbConn, m)
	_ = db.SaveMoulMetadata(dbConn, m)

	out, err := GenerateFromDB(dbConn)
	if err != nil {
		t.Fatalf("GenerateFromDB failed: %v", err)
	}
	if !strings.Contains(out, "TasksRecord") {
		t.Errorf("Expected TasksRecord in output, got:\n%s", out)
	}
}
