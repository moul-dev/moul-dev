package handlers

import (
	"net/http"
	"testing"
)

func TestAdminSurface_RootOrAdminKeyOnly(t *testing.T) {
	env := newSecurityEnv(t)
	env.insertUser("member1", "member1@example.com")
	member := bearer(env.memberToken("member1"))
	root := bearer(env.rootToken())

	routes := []struct {
		method string
		path   string
		body   interface{}
	}{
		{http.MethodGet, "/api/moul", nil},
		{http.MethodPost, "/api/moul", map[string]interface{}{"name": "evil", "type": "base"}},
		{http.MethodGet, "/api/moul/users", nil},
		{http.MethodPatch, "/api/moul/users", map[string]interface{}{"rules": map[string]string{"listRule": ""}}},
		{http.MethodDelete, "/api/moul/users", nil},
		{http.MethodGet, "/api/moul/users/export", nil},
		{http.MethodGet, "/api/moul/users/webhooks", nil},
		{http.MethodGet, "/api/moul/users/email-templates", nil},
		{http.MethodGet, "/api/settings", nil},
		{http.MethodPatch, "/api/settings", map[string]interface{}{"app_name": "pwned"}},
		{http.MethodGet, "/api/upload", nil},
		{http.MethodGet, "/api/files", nil},
		{http.MethodDelete, "/api/files/abc", nil},
		{http.MethodGet, "/api/workers", nil},
		{http.MethodGet, "/api/system/metrics", nil},
		{http.MethodGet, "/api/visits", nil},
		{http.MethodGet, "/api/requests", nil},
		{http.MethodGet, "/api/feature-flags", nil},
		{http.MethodPost, "/api/feature-flags", map[string]interface{}{"key": "f1"}},
		{http.MethodPost, "/api/rules/test", map[string]interface{}{"rule": "true"}},
		{http.MethodPost, "/api/mcp", map[string]interface{}{"jsonrpc": "2.0", "id": 1, "method": "ping"}},
	}

	for _, rt := range routes {
		t.Run(rt.method+" "+rt.path, func(t *testing.T) {
			if rec := env.do(rt.method, rt.path, rt.body, guest); rec.Code != http.StatusUnauthorized {
				t.Fatalf("guest: status = %d, want 401; body: %s", rec.Code, rec.Body.String())
			}
			if rec := env.do(rt.method, rt.path, rt.body, member); rec.Code != http.StatusForbidden {
				t.Fatalf("member: status = %d, want 403; body: %s", rec.Code, rec.Body.String())
			}
			for name, who := range map[string]caller{"root": root, "admin key": withAdminKey()} {
				if rec := env.do(rt.method, rt.path, rt.body, who); rec.Code == http.StatusUnauthorized || rec.Code == http.StatusForbidden {
					t.Fatalf("%s: status = %d, want access; body: %s", name, rec.Code, rec.Body.String())
				}
			}
		})
	}
}

func TestAdminSurface_GuestChallengeForOAuthDiscovery(t *testing.T) {
	env := newSecurityEnv(t)
	rec := env.do(http.MethodPost, "/api/mcp", map[string]interface{}{}, guest)
	expectStatus(t, rec, http.StatusUnauthorized)
	if rec.Header().Get("WWW-Authenticate") == "" {
		t.Fatal("missing WWW-Authenticate challenge on 401")
	}
}

func TestAdminSurface_ForgedAdminKeyIsNotAdmin(t *testing.T) {
	env := newSecurityEnv(t)
	forged := caller{adminKey: "not-the-admin-key"}

	expectStatus(t, env.do(http.MethodGet, "/api/settings", nil, forged), http.StatusUnauthorized)
	// The realtime ticket endpoint used to treat any non-empty X-Admin-Key as admin.
	expectStatus(t, env.do(http.MethodPost, "/api/realtime/ticket", nil, forged), http.StatusUnauthorized)
	// Keys in the query string are refused outright.
	expectStatus(t, env.do(http.MethodGet, "/api/settings?adminKey="+securityTestAdminKey, nil, guest), http.StatusBadRequest)
	expectStatus(t, env.do(http.MethodGet, "/api/settings?admin_key="+securityTestAdminKey, nil, guest), http.StatusBadRequest)
}

func TestFeatureFlagEval_MemberIdentityIsPinned(t *testing.T) {
	env := newSecurityEnv(t)
	env.insertUser("member1", "member1@example.com")

	flag := map[string]interface{}{
		"key":           "beta",
		"enabled":       true,
		"default_value": "false",
		"gates":         map[string]interface{}{"actors": map[string]bool{"vip": true}},
	}
	expectStatus(t, env.do(http.MethodPost, "/api/feature-flags", flag, withAdminKey()), http.StatusCreated)

	probe := map[string]interface{}{"context": map[string]interface{}{"user_id": "vip"}}
	adminRes := decode[map[string]interface{}](t, env.do(http.MethodPost, "/api/feature-flags/beta/eval", probe, withAdminKey()))
	memberRec := env.do(http.MethodPost, "/api/feature-flags/beta/eval", probe, bearer(env.memberToken("member1")))
	expectStatus(t, memberRec, http.StatusOK)
	memberRes := decode[map[string]interface{}](t, memberRec)

	if adminRes["value"] == memberRes["value"] {
		t.Fatalf("member evaluated the flag as user_id=vip: admin=%v member=%v", adminRes, memberRes)
	}
	// org_id is an actor key the token cannot vouch for.
	orgProbe := map[string]interface{}{"context": map[string]interface{}{"org_id": "vip"}}
	orgRes := decode[map[string]interface{}](t, env.do(http.MethodPost, "/api/feature-flags/beta/eval", orgProbe, bearer(env.memberToken("member1"))))
	if orgRes["value"] == true {
		t.Fatalf("member matched an actor gate through org_id: %v", orgRes)
	}
}
