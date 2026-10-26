package app

import (
	"errors"
	"testing"

	"github.com/gobuffalo/envy"
	"github.com/pocketbase/dbx"
)

func TestAppWriteTx(t *testing.T) {
	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})
	if err := a.WriteTx(func(tx *dbx.Tx) error { return nil }); err == nil {
		t.Fatal("expected WriteTx to fail before Bootstrap")
	}

	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")
	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	err := a.WriteTx(func(tx *dbx.Tx) error {
		var name string
		if err := tx.Select("value").From("_settings").Where(dbx.HashExp{"key": "app_name"}).Row(&name); err != nil {
			return err
		}
		_, err := tx.Update("_settings", dbx.Params{"value": name + "-renamed"}, dbx.HashExp{"key": "app_name"}).Execute()
		return err
	})
	if err != nil {
		t.Fatalf("WriteTx: %v", err)
	}
	var got string
	if err := a.DB().Select("value").From("_settings").Where(dbx.HashExp{"key": "app_name"}).Row(&got); err != nil {
		t.Fatalf("read back: %v", err)
	}
	if got != "moul-dev-renamed" {
		t.Fatalf("expected the committed value, got %q", got)
	}

	sentinel := errors.New("abort")
	if err := a.WriteTx(func(tx *dbx.Tx) error { return sentinel }); !errors.Is(err, sentinel) {
		t.Fatalf("expected fn's error to be returned, got %v", err)
	}
}
