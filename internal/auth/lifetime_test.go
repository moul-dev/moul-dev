package auth

import (
	"testing"
	"time"
)

func TestTokenLifetime(t *testing.T) {
	InitJWT("lifetime-test-secret")
	t.Cleanup(func() {
		SetTokenTTL(0)
		SetCollectionTokenTTL("members", 0)
		SetCollectionTokenTTL("_rootUsers", 0)
		SetRefreshGrace(-1)
	})

	if TokenTTL("members") != DefaultTokenTTL || RefreshGrace() != DefaultRefreshGrace {
		t.Fatal("unexpected defaults")
	}
	SetTokenTTL(30 * 24 * time.Hour)
	SetCollectionTokenTTL("_rootUsers", time.Hour)
	if TokenTTL("members") != 30*24*time.Hour || TokenTTL("_rootUsers") != time.Hour {
		t.Fatalf("TokenTTL: members=%v root=%v", TokenTTL("members"), TokenTTL("_rootUsers"))
	}

	token, err := GenerateToken("u1", "u1@example.com", "u1", "members")
	if err != nil {
		t.Fatal(err)
	}
	claims, err := VerifyToken(token)
	if err != nil {
		t.Fatal(err)
	}
	if got := time.Until(claims.ExpiresAt.Time); got < 29*24*time.Hour || got > 30*24*time.Hour {
		t.Fatalf("token lives %v, want ~30 days", got)
	}

	other, err := GenerateToken("u1", "u1@example.com", "u1", "members")
	if err != nil {
		t.Fatal(err)
	}
	if other == token {
		t.Fatal("two tokens issued in the same second are identical")
	}

	t.Setenv(EnvTokenTTL, "2h")
	t.Setenv(EnvRootTokenTTL, "15m")
	t.Setenv(EnvRefreshGrace, "0s")
	ConfigureLifetimeFromEnv()
	if TokenTTL("members") != 2*time.Hour || TokenTTL("_rootUsers") != 15*time.Minute || RefreshGrace() != 0 {
		t.Fatalf("env: members=%v root=%v grace=%v", TokenTTL("members"), TokenTTL("_rootUsers"), RefreshGrace())
	}
	t.Setenv(EnvTokenTTL, "bogus")
	ConfigureLifetimeFromEnv()
	if TokenTTL("members") != 2*time.Hour {
		t.Fatal("invalid env value was applied")
	}
}
