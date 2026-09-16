package cloak

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"strings"
	"sync"

	"golang.org/x/crypto/hkdf"
)

const (
	// Version1 is the 1-byte version identifier for AES-256-GCM encrypted payloads.
	Version1 = byte(0x01)

	// NonceSize is the standard 12-byte (96-bit) nonce size for AES-GCM.
	NonceSize = 12

	// Salt string used for HKDF key derivation.
	hkdfSalt = "moul-cloak-kdf-salt-v1"

	// Info strings for deriving cryptographically separate subkeys.
	hkdfAESInfo  = "moul-cloak-aes256gcm-v1"
	hkdfHMACInfo = "moul-cloak-blindindex-v1"
)

var (
	mu          sync.RWMutex
	aesGCM      cipher.AEAD
	hmacKey     []byte
	initialized bool
)

// Init initializes the cloak cryptography engine using the provided master key.
// It derives an AES-256-GCM cipher and an HMAC-SHA256 blind-index key using HKDF-SHA256.
func Init(masterKey string) error {
	trimmed := strings.TrimSpace(masterKey)
	if trimmed == "" {
		return errors.New("master encryption key cannot be empty")
	}

	// Derive 32-byte AES key
	aesReader := hkdf.New(sha256.New, []byte(trimmed), []byte(hkdfSalt), []byte(hkdfAESInfo))
	derivedAESKey := make([]byte, 32)
	if _, err := io.ReadFull(aesReader, derivedAESKey); err != nil {
		return fmt.Errorf("failed to derive AES key: %w", err)
	}

	block, err := aes.NewCipher(derivedAESKey)
	if err != nil {
		return fmt.Errorf("failed to create AES cipher block: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return fmt.Errorf("failed to create GCM AEAD: %w", err)
	}

	// Derive 32-byte HMAC key
	hmacReader := hkdf.New(sha256.New, []byte(trimmed), []byte(hkdfSalt), []byte(hkdfHMACInfo))
	derivedHMACKey := make([]byte, 32)
	if _, err := io.ReadFull(hmacReader, derivedHMACKey); err != nil {
		return fmt.Errorf("failed to derive HMAC key: %w", err)
	}

	mu.Lock()
	defer mu.Unlock()
	aesGCM = gcm
	hmacKey = derivedHMACKey
	initialized = true

	return nil
}

// IsInitialized returns true if the cloak cryptography engine has been initialized with a master key.
func IsInitialized() bool {
	mu.RLock()
	defer mu.RUnlock()
	return initialized
}

// Reset clears the loaded keys and resets initialized status. Intended primarily for testing.
func Reset() {
	mu.Lock()
	defer mu.Unlock()
	aesGCM = nil
	hmacKey = nil
	initialized = false
}

// Encrypt encrypts plaintext bytes using AES-256-GCM with a fresh 12-byte random nonce.
// Returns a binary payload: [0x01 (version)][12-byte nonce][ciphertext + 16-byte tag].
func Encrypt(plaintext []byte) ([]byte, error) {
	mu.RLock()
	defer mu.RUnlock()

	if !initialized || aesGCM == nil {
		return nil, errors.New("cloak is not initialized: missing MOUL_ENCRYPTION_KEY")
	}

	nonce := make([]byte, NonceSize)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate random nonce: %w", err)
	}

	ciphertext := aesGCM.Seal(nil, nonce, plaintext, nil)

	payload := make([]byte, 1+NonceSize+len(ciphertext))
	payload[0] = Version1
	copy(payload[1:1+NonceSize], nonce)
	copy(payload[1+NonceSize:], ciphertext)

	return payload, nil
}

// Decrypt verifies and decrypts a versioned binary payload.
func Decrypt(payload []byte) ([]byte, error) {
	mu.RLock()
	defer mu.RUnlock()

	if !initialized || aesGCM == nil {
		return nil, errors.New("cloak is not initialized: missing MOUL_ENCRYPTION_KEY")
	}

	minLen := 1 + NonceSize + aesGCM.Overhead()
	if len(payload) < minLen {
		return nil, fmt.Errorf("invalid cloak payload length %d (minimum %d)", len(payload), minLen)
	}

	if payload[0] != Version1 {
		return nil, fmt.Errorf("unsupported cloak payload version: 0x%02x", payload[0])
	}

	nonce := payload[1 : 1+NonceSize]
	ciphertext := payload[1+NonceSize:]

	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("decryption failed (invalid ciphertext or authentication tag): %w", err)
	}

	return plaintext, nil
}

// ComputeHash calculates an HMAC-SHA256 hex digest for searchable blind index columns.
func ComputeHash(plaintext string) string {
	mu.RLock()
	defer mu.RUnlock()

	if !initialized || len(hmacKey) == 0 {
		return ""
	}

	mac := hmac.New(sha256.New, hmacKey)
	mac.Write([]byte(plaintext))
	return hex.EncodeToString(mac.Sum(nil))
}

// Mask returns a redacted representation of sensitive text:
// - If empty: returns ""
// - If 4 characters or fewer: returns "••••"
// - If longer than 4 characters: returns "••••" + last 4 characters (e.g. "••••6789")
func Mask(plaintext string) string {
	if plaintext == "" {
		return ""
	}
	runes := []rune(plaintext)
	if len(runes) <= 4 {
		return "••••"
	}
	return "••••" + string(runes[len(runes)-4:])
}
