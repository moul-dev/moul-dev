package db

import (
	"database/sql"
	"errors"
	"path/filepath"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func saveTestMoul(t *testing.T, dbConn *dbx.DB, name string) *schema.Moul {
	t.Helper()
	m := &schema.Moul{
		ID:     "moul_" + name,
		Name:   name,
		Type:   "base",
		Fields: []schema.MoulField{{Name: "title", Type: "text", Options: []string{"a"}}},
		Rules:  schema.MoulRules{ListRule: "@request.auth.id != ''"},
	}
	if err := CreateMoulTable(dbConn, m); err != nil {
		t.Fatalf("CreateMoulTable: %v", err)
	}
	if err := SaveMoulMetadata(dbConn, m); err != nil {
		t.Fatalf("SaveMoulMetadata: %v", err)
	}
	return m
}

func TestMoulCacheHitRunsNoSQL(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()
	saveTestMoul(t, dbConn, "posts")

	if _, err := LoadMoulByName(dbConn, "posts"); err != nil {
		t.Fatalf("LoadMoulByName: %v", err)
	}
	statements := countStatements(dbConn)
	for i := 0; i < 100; i++ {
		if _, err := LoadMoulByName(dbConn, "posts"); err != nil {
			t.Fatalf("LoadMoulByName: %v", err)
		}
		if _, err := LoadAllMoul(dbConn); err != nil {
			t.Fatalf("LoadAllMoul: %v", err)
		}
	}
	if n := statements(); n != 0 {
		t.Fatalf("expected cached schema lookups to run no SQL, ran %d statements", n)
	}
}

func TestMoulCacheUnknownNameIsErrNoRows(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()
	if _, err := LoadMoulByName(dbConn, "missing"); err != sql.ErrNoRows {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
}

func TestMoulCacheReturnsCopies(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()
	saveTestMoul(t, dbConn, "posts")

	m, err := LoadMoulByName(dbConn, "posts")
	if err != nil {
		t.Fatalf("LoadMoulByName: %v", err)
	}
	m.Fields[0].Name = "mutated"
	m.Fields[0].Options[0] = "mutated"
	m.Rules.ListRule = "mutated"
	all, err := LoadAllMoul(dbConn)
	if err != nil {
		t.Fatalf("LoadAllMoul: %v", err)
	}
	all[0].Fields = nil

	again, err := LoadMoulByName(dbConn, "posts")
	if err != nil {
		t.Fatalf("LoadMoulByName: %v", err)
	}
	if again.Fields[0].Name != "title" || again.Fields[0].Options[0] != "a" || again.Rules.ListRule != "@request.auth.id != ''" {
		t.Fatalf("a caller's changes leaked into the cache: %+v", again)
	}
}

func TestMoulCacheInvalidatedByWrites(t *testing.T) {
	dbConn, err := InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer dbConn.Close()

	// Prime the cache with no collections, then create one: it must be visible at once.
	if all, err := LoadAllMoul(dbConn); err != nil || len(all) != 0 {
		t.Fatalf("expected no collections, got %d (%v)", len(all), err)
	}
	m := saveTestMoul(t, dbConn, "posts")
	if _, err := LoadMoulByName(dbConn, "posts"); err != nil {
		t.Fatalf("created collection not visible: %v", err)
	}

	// Update.
	m.Rules.ListRule = ""
	if err := UpdateMoulMetadata(dbConn, "posts", m); err != nil {
		t.Fatalf("UpdateMoulMetadata: %v", err)
	}
	got, err := LoadMoulByName(dbConn, "posts")
	if err != nil || got.Rules.ListRule != "" {
		t.Fatalf("updated rule not visible: %+v (%v)", got, err)
	}

	// Rename.
	m.Name = "articles"
	if err := UpdateMoulMetadata(dbConn, "posts", m); err != nil {
		t.Fatalf("rename: %v", err)
	}
	if _, err := LoadMoulByName(dbConn, "posts"); err != sql.ErrNoRows {
		t.Fatalf("old name must be gone, got %v", err)
	}
	if _, err := LoadMoulByName(dbConn, "articles"); err != nil {
		t.Fatalf("new name not visible: %v", err)
	}

	// Email templates.
	tpl := schema.GetDefaultEmailTemplates()
	tpl.OTP.Subject = "Your sign-in code"
	if err := UpdateMoulEmailTemplates(dbConn, m.ID, &tpl); err != nil {
		t.Fatalf("UpdateMoulEmailTemplates: %v", err)
	}
	got, err = LoadMoulByName(dbConn, "articles")
	if err != nil || got.EmailTemplates == nil || got.EmailTemplates.OTP.Subject != "Your sign-in code" {
		t.Fatalf("updated templates not visible: %+v (%v)", got, err)
	}

	// Delete.
	if err := DeleteMoulMetadata(dbConn, "articles"); err != nil {
		t.Fatalf("DeleteMoulMetadata: %v", err)
	}
	if _, err := LoadMoulByName(dbConn, "articles"); err != sql.ErrNoRows {
		t.Fatalf("deleted collection still visible: %v", err)
	}
}

// TestMoulCacheSeesOtherProcesses changes _moul through a second handle (another process) and
// through raw SQL, and checks the cache notices within the check interval.
func TestMoulCacheSeesOtherProcesses(t *testing.T) {
	prev := moulCacheCheckInterval
	moulCacheCheckInterval = 20 * time.Millisecond
	defer func() { moulCacheCheckInterval = prev }()

	path := filepath.Join(t.TempDir(), "schemas.db")
	server, err := InitDB(path)
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	defer server.Close()
	other, err := InitDB(path)
	if err != nil {
		t.Fatalf("InitDB (other): %v", err)
	}
	defer other.Close()

	if _, err := LoadMoulByName(server, "posts"); err != sql.ErrNoRows {
		t.Fatalf("expected no collection yet, got %v", err)
	}
	saveTestMoul(t, other, "posts")
	waitFor(t, func() bool {
		_, err := LoadMoulByName(server, "posts")
		return err == nil
	})

	if _, err := other.NewQuery(`UPDATE _moul SET rules = '{"listRule":"raw"}' WHERE name = 'posts'`).Execute(); err != nil {
		t.Fatalf("raw update: %v", err)
	}
	waitFor(t, func() bool {
		m, err := LoadMoulByName(server, "posts")
		return err == nil && m.Rules.ListRule == "raw"
	})
}

func TestMoulCacheWithoutVersionTableIsNotCached(t *testing.T) {
	rawDB, err := dbx.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	defer rawDB.Close()
	rawDB.DB().SetMaxOpenConns(1)
	if _, err := rawDB.NewQuery(`CREATE TABLE _moul (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, type TEXT NOT NULL,
		fields TEXT NOT NULL, rules TEXT NOT NULL, email_templates TEXT, webhooks TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`).Execute(); err != nil {
		t.Fatalf("create: %v", err)
	}
	if _, err := LoadMoulByName(rawDB, "posts"); !errors.Is(err, sql.ErrNoRows) {
		t.Fatalf("expected sql.ErrNoRows, got %v", err)
	}
	if _, err := rawDB.NewQuery(`INSERT INTO _moul VALUES ('1', 'posts', 'base', '[]', '{}', NULL, NULL, 'now', 'now')`).Execute(); err != nil {
		t.Fatalf("insert: %v", err)
	}
	if _, err := LoadMoulByName(rawDB, "posts"); err != nil {
		t.Fatalf("without _moul_version every lookup must read _moul, got %v", err)
	}
}

func waitFor(t *testing.T, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatal("condition not met before the deadline")
		}
		time.Sleep(5 * time.Millisecond)
	}
}
