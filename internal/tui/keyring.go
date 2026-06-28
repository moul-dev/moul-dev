package tui

import (
	"log"
	"sync"

	"github.com/zalando/go-keyring"
)

const keyringService = "moul-dev"

var (
	fallbackStore = make(map[string]string)
	fallbackMu    sync.RWMutex
	useFallback   bool
)

// SetSecret saves a credential (keyType: "admin_key" or "jwt_token") for a given server URL.
func SetSecret(serverURL, keyType, value string) error {
	key := serverURL + ":" + keyType
	if useFallback {
		fallbackMu.Lock()
		fallbackStore[key] = value
		fallbackMu.Unlock()
		return nil
	}

	err := keyring.Set(keyringService, key, value)
	if err != nil {
		log.Printf("[WARNING] OS Keychain set failed, falling back to in-memory store: %v", err)
		useFallback = true
		fallbackMu.Lock()
		fallbackStore[key] = value
		fallbackMu.Unlock()
	}
	return nil
}

// GetSecret retrieves a credential for a given server URL and keyType.
// Returns an empty string and no error if the credential is not found.
func GetSecret(serverURL, keyType string) (string, error) {
	key := serverURL + ":" + keyType
	if useFallback {
		fallbackMu.RLock()
		val := fallbackStore[key]
		fallbackMu.RUnlock()
		return val, nil
	}

	val, err := keyring.Get(keyringService, key)
	if err != nil {
		if err == keyring.ErrNotFound {
			return "", nil
		}
		// If keyring fails with other error (e.g. D-Bus connection error), fall back
		log.Printf("[WARNING] OS Keychain get failed, checking in-memory store: %v", err)
		fallbackMu.RLock()
		val = fallbackStore[key]
		fallbackMu.RUnlock()
		return val, nil
	}
	return val, nil
}

// DeleteSecret removes a credential for a given server URL and keyType.
func DeleteSecret(serverURL, keyType string) error {
	key := serverURL + ":" + keyType
	fallbackMu.Lock()
	delete(fallbackStore, key)
	fallbackMu.Unlock()

	if useFallback {
		return nil
	}

	err := keyring.Delete(keyringService, key)
	if err != nil && err != keyring.ErrNotFound {
		return err
	}
	return nil
}
