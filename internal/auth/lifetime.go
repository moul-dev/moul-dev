package auth

import (
	"os"
	"strings"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
)

const (
	// DefaultTokenTTL is how long an auth token is valid unless configured otherwise.
	DefaultTokenTTL = 24 * time.Hour
	// DefaultRefreshGrace is how long after its expiry a token may still be exchanged for a new
	// one through the refresh endpoint.
	DefaultRefreshGrace = 7 * 24 * time.Hour

	rootCollection = "_rootUsers"
)

// Environment variables read by ConfigureLifetimeFromEnv.
const (
	EnvTokenTTL     = "MOUL_TOKEN_TTL"
	EnvRootTokenTTL = "MOUL_ROOT_TOKEN_TTL"
	EnvRefreshGrace = "MOUL_TOKEN_REFRESH_GRACE"
)

var (
	lifetimeMu    sync.RWMutex
	tokenTTL      = DefaultTokenTTL
	collectionTTL = map[string]time.Duration{}
	refreshGrace  = DefaultRefreshGrace
)

// SetTokenTTL sets the lifetime of tokens issued for every collection without its own lifetime.
// A non-positive d restores DefaultTokenTTL.
func SetTokenTTL(d time.Duration) {
	if d <= 0 {
		d = DefaultTokenTTL
	}
	lifetimeMu.Lock()
	defer lifetimeMu.Unlock()
	tokenTTL = d
}

// SetCollectionTokenTTL sets the lifetime of tokens issued for one auth collection ("_rootUsers"
// for root users). A non-positive d removes the override.
func SetCollectionTokenTTL(collection string, d time.Duration) {
	lifetimeMu.Lock()
	defer lifetimeMu.Unlock()
	if d <= 0 {
		delete(collectionTTL, collection)
		return
	}
	collectionTTL[collection] = d
}

// TokenTTL returns the lifetime of a token issued for collection.
func TokenTTL(collection string) time.Duration {
	lifetimeMu.RLock()
	defer lifetimeMu.RUnlock()
	if d, ok := collectionTTL[collection]; ok {
		return d
	}
	return tokenTTL
}

// SetRefreshGrace sets how long after expiry a token may still be refreshed (0 disables refreshing
// expired tokens). A negative d restores DefaultRefreshGrace.
func SetRefreshGrace(d time.Duration) {
	if d < 0 {
		d = DefaultRefreshGrace
	}
	lifetimeMu.Lock()
	defer lifetimeMu.Unlock()
	refreshGrace = d
}

// RefreshGrace returns how long after expiry a token may still be refreshed.
func RefreshGrace() time.Duration {
	lifetimeMu.RLock()
	defer lifetimeMu.RUnlock()
	return refreshGrace
}

// ConfigureLifetimeFromEnv applies MOUL_TOKEN_TTL, MOUL_ROOT_TOKEN_TTL and
// MOUL_TOKEN_REFRESH_GRACE (Go durations such as "720h"). Invalid values are logged and ignored.
func ConfigureLifetimeFromEnv() {
	if d, ok := envDuration(EnvTokenTTL); ok {
		SetTokenTTL(d)
	}
	if d, ok := envDuration(EnvRootTokenTTL); ok {
		SetCollectionTokenTTL(rootCollection, d)
	}
	if d, ok := envDuration(EnvRefreshGrace); ok {
		SetRefreshGrace(d)
	}
}

func envDuration(name string) (time.Duration, bool) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return 0, false
	}
	d, err := time.ParseDuration(raw)
	if err != nil || d < 0 {
		logger.Error("Ignoring invalid duration", "variable", name, "value", raw)
		return 0, false
	}
	return d, true
}
