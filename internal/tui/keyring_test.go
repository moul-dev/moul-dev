package tui

import (
	"testing"
)

func TestKeyringWrapper(t *testing.T) {
	// Enable fallback mode for isolated unit testing
	useFallback = true
	defer func() { useFallback = false }()

	serverURL := "http://localhost:8090"

	// 1. Test Admin Key
	adminKeyVal := "test-admin-key"
	err := SetSecret(serverURL, "admin_key", adminKeyVal)
	if err != nil {
		t.Fatalf("SetSecret failed: %v", err)
	}

	gotAdminKey, err := GetSecret(serverURL, "admin_key")
	if err != nil {
		t.Fatalf("GetSecret failed: %v", err)
	}
	if gotAdminKey != adminKeyVal {
		t.Errorf("Expected admin key %q, got %q", adminKeyVal, gotAdminKey)
	}

	// 2. Test JWT Token
	jwtTokenVal := "test-jwt-token"
	err = SetSecret(serverURL, "jwt_token", jwtTokenVal)
	if err != nil {
		t.Fatalf("SetSecret failed: %v", err)
	}

	gotJWTToken, err := GetSecret(serverURL, "jwt_token")
	if err != nil {
		t.Fatalf("GetSecret failed: %v", err)
	}
	if gotJWTToken != jwtTokenVal {
		t.Errorf("Expected JWT token %q, got %q", jwtTokenVal, gotJWTToken)
	}

	// 3. Test Delete
	err = DeleteSecret(serverURL, "admin_key")
	if err != nil {
		t.Fatalf("DeleteSecret failed: %v", err)
	}

	deletedAdminKey, err := GetSecret(serverURL, "admin_key")
	if err != nil {
		t.Fatalf("GetSecret failed: %v", err)
	}
	if deletedAdminKey != "" {
		t.Errorf("Expected deleted admin key to be empty, got %q", deletedAdminKey)
	}

	// Token should still exist
	stillExistsToken, _ := GetSecret(serverURL, "jwt_token")
	if stillExistsToken != jwtTokenVal {
		t.Errorf("Expected token to still exist: %q", stillExistsToken)
	}
}
