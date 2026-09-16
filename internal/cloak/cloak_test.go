package cloak_test

import (
	"bytes"
	"testing"

	"github.com/moul-dev/moul-dev/internal/cloak"
)

func TestCloak_InitAndLifecycle(t *testing.T) {
	cloak.Reset()
	if cloak.IsInitialized() {
		t.Fatal("expected IsInitialized to be false after Reset")
	}

	// Encrypt before Init
	_, err := cloak.Encrypt([]byte("secret"))
	if err == nil {
		t.Fatal("expected error when encrypting before Init")
	}

	// Init with empty key
	if err := cloak.Init(""); err == nil {
		t.Fatal("expected error when initializing with empty key")
	}

	// Init with valid key
	if err := cloak.Init("test-secret-master-key-1234567890"); err != nil {
		t.Fatalf("unexpected error initializing cloak: %v", err)
	}

	if !cloak.IsInitialized() {
		t.Fatal("expected IsInitialized to be true after valid Init")
	}
}

func TestCloak_EncryptDecrypt(t *testing.T) {
	cloak.Reset()
	if err := cloak.Init("my-super-secret-key-for-unit-testing"); err != nil {
		t.Fatalf("failed to init: %v", err)
	}

	original := []byte("top-secret-ssn-123-45-6789")

	payload1, err := cloak.Encrypt(original)
	if err != nil {
		t.Fatalf("encryption failed: %v", err)
	}

	// Should start with Version1
	if payload1[0] != cloak.Version1 {
		t.Fatalf("expected version byte 0x01, got 0x%02x", payload1[0])
	}

	// Two consecutive encryptions of same plaintext should yield different ciphertexts (random nonce)
	payload2, err := cloak.Encrypt(original)
	if err != nil {
		t.Fatalf("second encryption failed: %v", err)
	}
	if bytes.Equal(payload1, payload2) {
		t.Fatal("expected nonces/ciphertexts to be different between encryptions")
	}

	// Decrypt payload1
	decrypted1, err := cloak.Decrypt(payload1)
	if err != nil {
		t.Fatalf("decryption of payload1 failed: %v", err)
	}
	if !bytes.Equal(decrypted1, original) {
		t.Fatalf("decrypted text mismatch: got %q, want %q", decrypted1, original)
	}

	// Decrypt payload2
	decrypted2, err := cloak.Decrypt(payload2)
	if err != nil {
		t.Fatalf("decryption of payload2 failed: %v", err)
	}
	if !bytes.Equal(decrypted2, original) {
		t.Fatalf("decrypted text mismatch: got %q, want %q", decrypted2, original)
	}
}

func TestCloak_DecryptTamperedPayload(t *testing.T) {
	cloak.Reset()
	if err := cloak.Init("test-tamper-key-abcdef123456"); err != nil {
		t.Fatalf("failed to init: %v", err)
	}

	original := []byte("confidential medical record")
	payload, err := cloak.Encrypt(original)
	if err != nil {
		t.Fatalf("encrypt failed: %v", err)
	}

	// Test unsupported version byte
	corruptedVersion := make([]byte, len(payload))
	copy(corruptedVersion, payload)
	corruptedVersion[0] = 0x02
	if _, err := cloak.Decrypt(corruptedVersion); err == nil {
		t.Fatal("expected error for unsupported version byte")
	}

	// Test truncated payload
	if _, err := cloak.Decrypt(payload[:15]); err == nil {
		t.Fatal("expected error for truncated payload")
	}

	// Test modified ciphertext byte (AEAD auth tag mismatch)
	tampered := make([]byte, len(payload))
	copy(tampered, payload)
	tampered[len(tampered)-1] ^= 0x01
	if _, err := cloak.Decrypt(tampered); err == nil {
		t.Fatal("expected decryption to fail with authentication tag error")
	}
}

func TestCloak_ComputeHash(t *testing.T) {
	cloak.Reset()
	if err := cloak.Init("test-hash-key-1234"); err != nil {
		t.Fatalf("failed to init: %v", err)
	}

	val := "user@example.com"
	hash1 := cloak.ComputeHash(val)
	hash2 := cloak.ComputeHash(val)

	if hash1 == "" {
		t.Fatal("expected non-empty hash")
	}
	if hash1 != hash2 {
		t.Fatalf("expected deterministic hash: got %q and %q", hash1, hash2)
	}

	// Different plaintext must have different hash
	hash3 := cloak.ComputeHash("other@example.com")
	if hash1 == hash3 {
		t.Fatal("expected different hashes for different plaintexts")
	}

	// Different master key must produce different blind index
	cloak.Reset()
	if err := cloak.Init("different-master-key-5678"); err != nil {
		t.Fatalf("failed to init: %v", err)
	}
	hashWithNewKey := cloak.ComputeHash(val)
	if hash1 == hashWithNewKey {
		t.Fatal("expected different blind index hash when master key changes")
	}
}

func TestCloak_Mask(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"", ""},
		{"a", "••••"},
		{"12", "••••"},
		{"123", "••••"},
		{"1234", "••••"},
		{"12345", "••••2345"},
		{"123-45-6789", "••••6789"},
		{"secret_api_key_abc123", "••••c123"},
	}

	for _, tc := range tests {
		got := cloak.Mask(tc.input)
		if got != tc.expected {
			t.Errorf("Mask(%q) = %q; want %q", tc.input, got, tc.expected)
		}
	}
}
