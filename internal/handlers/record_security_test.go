package handlers

import (
	"net/http"
	"net/url"
	"testing"

	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// garagesAndBuilds: garages are visible to their owner only; builds are public and point at a
// garage and an author.
func garagesAndBuilds() []*schema.Moul {
	return []*schema.Moul{
		{
			ID: "moul_garages", Name: "garages", Type: "base",
			Fields: []schema.MoulField{
				{Name: "vin", Type: "text"},
				{Name: "odometer", Type: "number"},
				{Name: "owner", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
			},
			Rules: schema.MoulRules{
				ListRule:   "owner = @request.auth.id",
				ViewRule:   "owner = @request.auth.id",
				CreateRule: "owner = @request.auth.id",
				UpdateRule: "owner = @request.auth.id",
				DeleteRule: "owner = @request.auth.id",
			},
		},
		{
			ID: "moul_builds", Name: "builds", Type: "base",
			Fields: []schema.MoulField{
				{Name: "title", Type: "text"},
				{Name: "garage", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "garages", Cardinality: "1:N"}},
				{Name: "author", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
			},
			Rules: schema.MoulRules{CreateRule: "@request.auth.id != ''", UpdateRule: "author = @request.auth.id"},
		},
	}
}

func seedGarages(env *securityEnv) {
	env.insertUser("alice", "alice@example.com")
	env.insertUser("bob", "bob@example.com")
	env.insert("garages", dbx.Params{"id": "g_alice", "vin": "VIN-ALICE", "odometer": 100, "owner": "alice"})
	env.insert("garages", dbx.Params{"id": "g_bob", "vin": "VIN-BOB", "odometer": 200, "owner": "bob"})
	env.insert("builds", dbx.Params{"id": "b_alice", "title": "Alice build", "garage": "g_alice", "author": "alice"})
}

func listItems(t *testing.T, env *securityEnv, path string, who caller) []map[string]interface{} {
	t.Helper()
	rec := env.do(http.MethodGet, path, nil, who)
	expectStatus(t, rec, http.StatusOK)
	res := decode[struct {
		Items []map[string]interface{} `json:"items"`
	}](t, rec)
	return res.Items
}

func TestListRecords_FilterCannotOverwriteListRule(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)
	alice := bearer(env.memberToken("alice"))

	for _, filter := range []string{"owner = 'bob'", "vin = 'VIN-BOB'", "id = 'g_bob'"} {
		items := listItems(t, env, "/api/moul/garages/records?filter="+url.QueryEscape(filter), alice)
		if len(items) != 0 {
			t.Fatalf("filter %q listed bob's garage for alice: %v", filter, items)
		}
	}
	items := listItems(t, env, "/api/moul/garages/records?filter="+url.QueryEscape("vin = 'VIN-ALICE'"), alice)
	if len(items) != 1 {
		t.Fatalf("alice's own filter: %v", items)
	}
}

func TestListRecords_RejectsProbingQueries(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)
	alice := bearer(env.memberToken("alice"))

	bad := []string{
		"/api/moul/builds/records?sort=" + url.QueryEscape("author.username) DESC, (SELECT 1"),
		"/api/moul/builds/records?sort=" + url.QueryEscape("garage.vin"),
		"/api/moul/builds/records?filter=" + url.QueryEscape("@collection._rootUsers.passwordHash ~ '$2a'"),
		"/api/moul/builds/records?filter=" + url.QueryEscape("@collection.garages.vin = 'VIN-BOB'"),
		"/api/moul/users/records?filter=" + url.QueryEscape("passwordHash ~ '$2a'"),
		"/api/moul/users/records?filter=" + url.QueryEscape("email ~ 'bob'"),
		"/api/moul/users/records?sort=email",
		"/api/moul/builds/records?filter=" + url.QueryEscape("author.email ~ 'alice'"),
	}
	for _, path := range bad {
		if rec := env.do(http.MethodGet, path, nil, alice); rec.Code != http.StatusBadRequest {
			t.Fatalf("%s: status = %d, want 400; body: %s", path, rec.Code, rec.Body.String())
		}
	}

	// A filter through a private relation target only matches rows the caller may list.
	bob := bearer(env.memberToken("bob"))
	items := listItems(t, env, "/api/moul/builds/records?filter="+url.QueryEscape("garage.vin = 'VIN-ALICE'"), bob)
	if len(items) != 0 {
		t.Fatalf("bob matched alice's private garage through her build: %v", items)
	}
	items = listItems(t, env, "/api/moul/builds/records?filter="+url.QueryEscape("garage.vin = 'VIN-ALICE'"), alice)
	if len(items) != 1 {
		t.Fatalf("alice filtering through her own garage: %v", items)
	}

	// Search does not scan emails for non-admins.
	items = listItems(t, env, "/api/moul/users/records?search=bob%40example", alice)
	if len(items) != 0 {
		t.Fatalf("search matched an email: %v", items)
	}
	// Admins keep every query form.
	expectStatus(t, env.do(http.MethodGet, "/api/moul/users/records?sort=email&filter="+url.QueryEscape("email ~ 'bob'"), nil, withAdminKey()), http.StatusOK)
}

func TestRecords_SecretsAndEmailRedaction(t *testing.T) {
	env := newSecurityEnv(t)
	env.insertUser("alice", "alice@example.com")
	env.insertUser("bob", "bob@example.com")
	alice := bearer(env.memberToken("alice"))

	for _, item := range listItems(t, env, "/api/moul/users/records", alice) {
		for _, secret := range []string{"resetToken", "resetTokenExpiresAt", "oauthProviders", "passwordHash"} {
			if _, ok := item[secret]; ok {
				t.Fatalf("list exposes %s: %v", secret, item)
			}
		}
		_, hasEmail := item["email"]
		if item["id"] == "alice" && !hasEmail {
			t.Fatalf("alice cannot see her own email: %v", item)
		}
		if item["id"] == "bob" && hasEmail {
			t.Fatalf("alice sees bob's email: %v", item)
		}
	}

	bobRec := decode[map[string]interface{}](t, env.do(http.MethodGet, "/api/moul/users/records/bob", nil, withAdminKey()))
	if bobRec["email"] != "bob@example.com" {
		t.Fatalf("admin should see emails: %v", bobRec)
	}
	if _, ok := bobRec["resetToken"]; ok {
		t.Fatalf("reset token leaves the server even for admins: %v", bobRec)
	}
}

func TestRecords_EmailVisibilityOptIn(t *testing.T) {
	users := &schema.Moul{ID: "moul_people", Name: "people", Type: "auth",
		Fields: []schema.MoulField{{Name: schema.EmailVisibilityField, Type: "bool"}}}
	env := newSecurityEnv(t, users)
	env.insert("people", dbx.Params{"id": "pub", "username": "pub", "email": "pub@example.com", "emailVisibility": 1})
	env.insert("people", dbx.Params{"id": "priv", "username": "priv", "email": "priv@example.com", "emailVisibility": 0})

	items := listItems(t, env, "/api/moul/people/records", guest)
	for _, item := range items {
		_, hasEmail := item["email"]
		if (item["id"] == "pub") != hasEmail {
			t.Fatalf("emailVisibility not honored: %v", item)
		}
	}
}

func TestRecords_ExpandHonorsTargetViewRule(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)

	build := decode[map[string]interface{}](t, env.do(http.MethodGet, "/api/moul/builds/records/b_alice?expand=garage,author", nil, bearer(env.memberToken("bob"))))
	expand := build["expand"].(map[string]interface{})
	if expand["garage"] != nil {
		t.Fatalf("bob expanded alice's private garage: %v", expand["garage"])
	}
	if author, ok := expand["author"].(map[string]interface{}); ok {
		if _, hasEmail := author["email"]; hasEmail {
			t.Fatalf("expanded author leaks email: %v", author)
		}
	}

	build = decode[map[string]interface{}](t, env.do(http.MethodGet, "/api/moul/builds/records/b_alice?expand=garage", nil, bearer(env.memberToken("alice"))))
	garage, ok := build["expand"].(map[string]interface{})["garage"].(map[string]interface{})
	if !ok || garage["vin"] != "VIN-ALICE" {
		t.Fatalf("owner expand: %v", build["expand"])
	}
}

func TestRecords_HiddenAnswersLikeMissing(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)
	bob := bearer(env.memberToken("bob"))

	for _, who := range []caller{guest, bob} {
		for _, method := range []string{http.MethodGet, http.MethodPatch, http.MethodDelete} {
			var body interface{}
			if method == http.MethodPatch {
				body = map[string]interface{}{"vin": "X"}
			}
			hidden := env.do(method, "/api/moul/garages/records/g_alice", body, who)
			missing := env.do(method, "/api/moul/garages/records/nope", body, who)
			if hidden.Code != http.StatusNotFound || hidden.Code != missing.Code || hidden.Body.String() != missing.Body.String() {
				t.Fatalf("%s hidden=%d %s missing=%d %s", method, hidden.Code, hidden.Body.String(), missing.Code, missing.Body.String())
			}
		}
	}

	// A rejected token answers 401 for hidden and missing alike, so clients notice expiry.
	expired := caller{token: "not.a.valid-token"}
	hidden := env.do(http.MethodGet, "/api/moul/garages/records/g_alice", nil, expired)
	missing := env.do(http.MethodGet, "/api/moul/garages/records/nope", nil, expired)
	if hidden.Code != http.StatusUnauthorized || missing.Code != http.StatusUnauthorized || hidden.Body.String() != missing.Body.String() {
		t.Fatalf("rejected token: hidden=%d missing=%d", hidden.Code, missing.Code)
	}

	// A guest who may not create learns nothing about relation targets.
	rec := env.do(http.MethodPost, "/api/moul/builds/records", map[string]interface{}{"title": "x", "garage": "g_alice"}, guest)
	other := env.do(http.MethodPost, "/api/moul/builds/records", map[string]interface{}{"title": "x", "garage": "nope"}, guest)
	if rec.Code != http.StatusUnauthorized || other.Code != http.StatusUnauthorized {
		t.Fatalf("guest create: existing=%d missing=%d, want 401 for both", rec.Code, other.Code)
	}
}

func TestUpdateRecord_OwnerCannotBeReassigned(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)
	alice := bearer(env.memberToken("alice"))

	expectStatus(t, env.do(http.MethodPatch, "/api/moul/garages/records/g_alice", map[string]interface{}{"owner": "bob"}, alice), http.StatusForbidden)
	expectStatus(t, env.do(http.MethodPatch, "/api/moul/builds/records/b_alice", map[string]interface{}{"author": "bob"}, alice), http.StatusForbidden)
	expectStatus(t, env.do(http.MethodPatch, "/api/moul/garages/records/g_alice", map[string]interface{}{"owner": "alice", "vin": "NEW"}, alice), http.StatusOK)
	expectStatus(t, env.do(http.MethodPatch, "/api/moul/garages/records/g_alice", map[string]interface{}{"owner": "bob"}, withAdminKey()), http.StatusOK)
}

func TestUpdateRecord_UnchangedOwnerIsAllowed(t *testing.T) {
	shared := &schema.Moul{ID: "moul_docs", Name: "docs", Type: "base",
		Fields: []schema.MoulField{{Name: "title", Type: "text"}, {Name: "owner", Type: "text"}, {Name: "coowner", Type: "text"}},
		Rules:  schema.MoulRules{ViewRule: "", UpdateRule: "owner = @request.auth.id || coowner = @request.auth.id"}}
	env := newSecurityEnv(t, shared)
	env.insertUser("alice", "alice@example.com")
	env.insertUser("bob", "bob@example.com")
	env.insert("docs", dbx.Params{"id": "d1", "title": "t", "owner": "alice", "coowner": "bob"})
	bob := bearer(env.memberToken("bob"))

	// The co-owner PATCHes the whole record, owner unchanged.
	expectStatus(t, env.do(http.MethodPatch, "/api/moul/docs/records/d1", map[string]interface{}{"title": "x", "owner": "alice", "coowner": "bob"}, bob), http.StatusOK)
	// Changing the owner to someone else is still refused.
	expectStatus(t, env.do(http.MethodPatch, "/api/moul/docs/records/d1", map[string]interface{}{"owner": "mallory"}, bob), http.StatusForbidden)
}

func TestRecords_NumberFieldsAreCanonical(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)
	alice := bearer(env.memberToken("alice"))

	for _, bad := range []interface{}{"0x1p0", "1_000", "Inf", "NaN", "123456789012345678901234567890123", "12abc"} {
		rec := env.do(http.MethodPatch, "/api/moul/garages/records/g_alice", map[string]interface{}{"odometer": bad}, alice)
		expectStatus(t, rec, http.StatusBadRequest)
	}
	rec := env.do(http.MethodPatch, "/api/moul/garages/records/g_alice", map[string]interface{}{"odometer": "12.5"}, alice)
	expectStatus(t, rec, http.StatusOK)
	if got := decode[map[string]interface{}](t, rec)["odometer"]; got != 12.5 {
		t.Fatalf("odometer = %v (%T), want 12.5", got, got)
	}
}

func TestListRecords_CursorIgnoresHiddenRecords(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	seedGarages(env)
	env.insert("garages", dbx.Params{"id": "g_alice2", "vin": "AAA", "odometer": 150, "owner": "alice"})
	alice := bearer(env.memberToken("alice"))

	// With bob's hidden garage as the cursor, alice's page must not be shaped by its odometer.
	withHidden := listItems(t, env, "/api/moul/garages/records?sort=odometer&after=g_bob", alice)
	withMissing := listItems(t, env, "/api/moul/garages/records?sort=odometer&after=zzz_missing", alice)
	if len(withHidden) != len(withMissing) {
		t.Fatalf("hidden cursor shaped the page: hidden=%v missing=%v", withHidden, withMissing)
	}
}

func TestRecords_AdminKeyAsBearerGets404(t *testing.T) {
	env := newSecurityEnv(t, garagesAndBuilds()...)
	rec := env.do(http.MethodGet, "/api/moul/garages/records/missing", nil, bearer(securityTestAdminKey))
	expectStatus(t, rec, http.StatusNotFound)
}
