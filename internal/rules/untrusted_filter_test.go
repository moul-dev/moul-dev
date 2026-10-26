package rules

import (
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// untrustedFixture creates users (auth), garages (owner-only list rule) and builds (public, with
// a relation to garages and one to users) and returns a loader over them.
func untrustedFixture(t *testing.T) (*dbx.DB, map[string]*schema.Moul) {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})

	mouls := map[string]*schema.Moul{
		"users": {ID: "m1", Name: "users", Type: "auth", Fields: []schema.MoulField{{Name: "displayName", Type: "text"}}},
		"garages": {ID: "m2", Name: "garages", Type: "base",
			Fields: []schema.MoulField{
				{Name: "vin", Type: "text"},
				{Name: "owner", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
			},
			Rules: schema.MoulRules{ListRule: "owner = @request.auth.id"},
		},
		"builds": {ID: "m3", Name: "builds", Type: "base",
			Fields: []schema.MoulField{
				{Name: "title", Type: "text"},
				{Name: "garage", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "garages", Cardinality: "1:N"}},
				{Name: "author", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
			},
		},
	}
	for _, name := range []string{"users", "garages", "builds"} {
		if err := db.CreateMoulTable(dbConn, mouls[name]); err != nil {
			t.Fatalf("CreateMoulTable(%s): %v", name, err)
		}
	}
	exec := func(table string, p dbx.Params) {
		p["createdAt"], p["updatedAt"] = "2026-01-01", "2026-01-01"
		if _, err := dbConn.Insert(table, p).Execute(); err != nil {
			t.Fatalf("insert %s: %v", table, err)
		}
	}
	exec("users", dbx.Params{"id": "alice", "username": "alice", "email": "alice@example.com"})
	exec("users", dbx.Params{"id": "bob", "username": "bob", "email": "bob@example.com"})
	exec("garages", dbx.Params{"id": "g_alice", "vin": "VIN-ALICE", "owner": "alice"})
	exec("garages", dbx.Params{"id": "g_bob", "vin": "VIN-BOB", "owner": "bob"})
	exec("builds", dbx.Params{"id": "b1", "title": "Alice build", "garage": "g_alice", "author": "alice"})
	exec("builds", dbx.Params{"id": "b2", "title": "Bob build", "garage": "g_bob", "author": "bob"})
	return dbConn, mouls
}

func loaderFor(mouls map[string]*schema.Moul) func(string) (*schema.Moul, error) {
	return func(name string) (*schema.Moul, error) {
		if m, ok := mouls[name]; ok {
			return m, nil
		}
		return nil, errNotFound
	}
}

type notFound struct{}

func (notFound) Error() string { return "not found" }

var errNotFound = notFound{}

// listIDs runs SELECT id FROM table WHERE <filter> the way ListRecords does.
func listIDs(t *testing.T, dbConn *dbx.DB, table, where string, params dbx.Params) []string {
	t.Helper()
	q := dbConn.Select("id").From(table).OrderBy("id")
	if where != "" {
		q.Where(dbx.NewExp(where, params))
	}
	var rows []struct {
		ID string `db:"id"`
	}
	if err := q.All(&rows); err != nil {
		t.Fatalf("query %q: %v", where, err)
	}
	ids := make([]string, 0, len(rows))
	for _, r := range rows {
		ids = append(ids, r.ID)
	}
	return ids
}

func TestUntrustedFilter_ParamPrefixKeepsRuleValues(t *testing.T) {
	dbConn, mouls := untrustedFixture(t)
	garages := mouls["garages"]
	auth := map[string]interface{}{"id": "alice"}

	ruleSQL, ruleParams, err := BuildFilterSQLWithOptions(garages.Rules.ListRule, garages, auth, nil, FilterOptions{ParamPrefix: "rule_"})
	if err != nil {
		t.Fatal(err)
	}
	filterSQL, filterParams, err := BuildFilterSQLWithOptions("owner = 'bob'", garages, auth, nil, FilterOptions{ParamPrefix: "filter_", Untrusted: true, LoadMoul: loaderFor(mouls)})
	if err != nil {
		t.Fatal(err)
	}
	params := dbx.Params{}
	for k, v := range ruleParams {
		params[k] = v
	}
	for k, v := range filterParams {
		params[k] = v
	}
	got := listIDs(t, dbConn, "garages", "("+ruleSQL+") AND ("+filterSQL+")", params)
	if len(got) != 0 {
		t.Fatalf("filter overwrote the list rule: alice listed %v", got)
	}
}

func TestUntrustedFilter_RejectsCollectionAndSecrets(t *testing.T) {
	_, mouls := untrustedFixture(t)
	opts := FilterOptions{Untrusted: true, LoadMoul: loaderFor(mouls)}

	cases := map[string]struct {
		moul   string
		filter string
	}{
		"collection subquery": {"builds", "@collection._rootUsers.passwordHash ~ '$2a'"},
		"settings oracle":     {"builds", "@collection._settings.value ~ 'AKIA'"},
		"password hash":       {"users", "passwordHash ~ '$2a'"},
		"password modifier":   {"users", "passwordHash:length > 10"},
		"auth email":          {"users", "email ~ 'alice'"},
		"email via relation":  {"builds", "author.email ~ 'alice'"},
		"token key":           {"users", "tokenKey != ''"},
		"nested path":         {"builds", "garage.owner.email ~ 'a'"},
	}
	for name, tc := range cases {
		t.Run(name, func(t *testing.T) {
			if _, _, err := BuildFilterSQLWithOptions(tc.filter, mouls[tc.moul], nil, nil, opts); err == nil {
				t.Fatalf("filter %q was accepted", tc.filter)
			}
		})
	}

	// Trusted (admin-defined) rules keep @collection, now quoted and limited to user collections.
	if _, _, err := BuildFilterSQL("@collection.garages.owner = id", mouls["builds"], nil); err != nil {
		t.Fatalf("trusted @collection rejected: %v", err)
	}
	if _, _, err := BuildFilterSQL("@collection._rootUsers.passwordHash ~ 'x'", mouls["builds"], nil); err == nil {
		t.Fatal("trusted @collection may not reach system tables")
	}
}

func TestUntrustedFilter_RelationPathHonorsTargetListRule(t *testing.T) {
	dbConn, mouls := untrustedFixture(t)
	builds := mouls["builds"]
	opts := FilterOptions{ParamPrefix: "f_", Untrusted: true, LoadMoul: loaderFor(mouls)}

	// Bob probes the VIN of Alice's private garage through her public build.
	where, params, err := BuildFilterSQLWithOptions("garage.vin = 'VIN-ALICE'", builds, map[string]interface{}{"id": "bob"}, nil, opts)
	if err != nil {
		t.Fatal(err)
	}
	if got := listIDs(t, dbConn, "builds", where, params); len(got) != 0 {
		t.Fatalf("bob matched alice's private garage: %v", got)
	}

	// Alice may filter through her own garage.
	where, params, err = BuildFilterSQLWithOptions("garage.vin = 'VIN-ALICE'", builds, map[string]interface{}{"id": "alice"}, nil, opts)
	if err != nil {
		t.Fatal(err)
	}
	if got := listIDs(t, dbConn, "builds", where, params); len(got) != 1 || got[0] != "b1" {
		t.Fatalf("alice filtering her own garage: got %v", got)
	}

	// Public targets (users has no list rule) are filterable on non-secret columns.
	where, params, err = BuildFilterSQLWithOptions("author.username = 'bob'", builds, nil, nil, opts)
	if err != nil {
		t.Fatal(err)
	}
	if got := listIDs(t, dbConn, "builds", where, params); len(got) != 1 || got[0] != "b2" {
		t.Fatalf("public relation filter: got %v", got)
	}
}

func TestSort_RelationInjectionAndVisibility(t *testing.T) {
	dbConn, mouls := untrustedFixture(t)
	builds := mouls["builds"]
	untrusted := SortOptions{Untrusted: true, LoadMoul: loaderFor(mouls)}

	injections := []string{
		"author.username) DESC, (SELECT passwordHash FROM _rootUsers",
		"author.username FROM users) --",
		"-author.x;DROP TABLE builds",
		"title DESC; DROP TABLE builds",
	}
	for _, sort := range injections {
		for _, opts := range []SortOptions{{LoadMoul: loaderFor(mouls)}, untrusted} {
			if _, err := BuildSortSQLWithOptions(sort, builds, opts); err == nil {
				t.Fatalf("sort %q accepted (untrusted=%v)", sort, opts.Untrusted)
			}
		}
	}

	if _, err := BuildSortSQLWithOptions("garage.vin", builds, untrusted); err == nil {
		t.Fatal("sort through a private target accepted")
	}
	if _, err := BuildSortSQLWithOptions("author.email", builds, untrusted); err == nil {
		t.Fatal("sort by a secret column of the target accepted")
	}

	exprs, err := BuildSortSQLWithOptions("-author.username", builds, untrusted)
	if err != nil {
		t.Fatal(err)
	}
	var rows []struct {
		ID string `db:"id"`
	}
	if err := dbConn.Select("id").From("builds").OrderBy(exprs...).All(&rows); err != nil {
		t.Fatalf("relation sort SQL %v failed: %v", exprs, err)
	}
	if len(rows) != 2 || rows[0].ID != "b2" {
		t.Fatalf("relation sort order = %+v", rows)
	}
	if !strings.Contains(exprs[0], "`users` AS _sub") {
		t.Fatalf("relation sort is not quoted/aliased: %v", exprs)
	}
}
