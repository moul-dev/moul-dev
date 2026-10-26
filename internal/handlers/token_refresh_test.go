package handlers

import (
	"net/http"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/auth"
)

func TestRefreshToken_BoundedAndSingleUse(t *testing.T) {
	env := newSecurityEnv(t)
	env.insertUser("alice", "alice@example.com")
	refresh := func(token string) int {
		return env.do(http.MethodPost, "/api/moul/users/refresh", nil, bearer(token)).Code
	}
	sign := func(ttl time.Duration) string {
		token, err := auth.GenerateTokenWithTTL("alice", "alice@example.com", "alice", "users", ttl)
		if err != nil {
			t.Fatal(err)
		}
		return token
	}

	// Expired within the grace period: refreshable once.
	recent := sign(-time.Hour)
	if code := refresh(recent); code != http.StatusOK {
		t.Fatalf("recently expired token: %d", code)
	}
	if code := refresh(recent); code != http.StatusUnauthorized {
		t.Fatalf("refreshed token reused: %d", code)
	}

	// Expired longer ago than the grace period: sign in again.
	old := sign(-auth.RefreshGrace() - time.Hour)
	if code := refresh(old); code != http.StatusUnauthorized {
		t.Fatalf("long-expired token refreshed: %d", code)
	}

	// A logged-out token stays dead after it expires (here: it already has, within the grace).
	live := sign(-time.Minute)
	expectStatus(t, env.do(http.MethodPost, "/api/moul/users/logout", nil, bearer(live)), http.StatusOK)
	expectStatus(t, env.do(http.MethodPost, "/api/moul/users/logout", nil, bearer(live)), http.StatusOK)
	if code := refresh(live); code != http.StatusUnauthorized {
		t.Fatalf("logged-out token refreshed: %d", code)
	}
}
