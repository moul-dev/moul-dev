package handlers

import (
	"net"
	"sync"
	"time"
)

// OTP sign-in guess limits. A 6-digit code has a million values, so without a bound it can be
// guessed within its lifetime. Each account gets otpMaxCodeAttempts guesses per issued code (the
// code is then voided) and otpMaxDailyFailures failures per day across codes; each client
// network gets otpMaxNetworkFailures failures per otpNetworkWindow across accounts.
const (
	otpMaxCodeAttempts    = 5
	otpMaxDailyFailures   = 20
	otpMaxNetworkFailures = 30
	otpNetworkWindow      = 10 * time.Minute
	otpDay                = 24 * time.Hour
	otpThrottlePruneSize  = 10000
)

type otpAccountState struct {
	codeFailures int
	dayStart     time.Time
	dayFailures  int
}

type otpNetworkState struct {
	windowStart time.Time
	failures    int
}

// otpThrottle tracks OTP verification failures in memory (one process; a restart forgives).
type otpThrottle struct {
	mu       sync.Mutex
	accounts map[string]*otpAccountState
	networks map[string]*otpNetworkState
	now      func() time.Time
}

func newOTPThrottle() *otpThrottle {
	return &otpThrottle{
		accounts: map[string]*otpAccountState{},
		networks: map[string]*otpNetworkState{},
		now:      time.Now,
	}
}

// otpLimiter is shared by every auth handler of the process.
var otpLimiter = newOTPThrottle()

// otpNetworkKey groups a client address by network: the IPv4 address, or the /64 of an IPv6 one.
func otpNetworkKey(ip string) string {
	parsed := net.ParseIP(ip)
	if parsed == nil {
		return ip
	}
	if v4 := parsed.To4(); v4 != nil {
		return v4.String()
	}
	return parsed.Mask(net.CIDRMask(64, 128)).String() + "/64"
}

func (t *otpThrottle) account(key string) *otpAccountState {
	state, ok := t.accounts[key]
	now := t.now()
	if !ok {
		state = &otpAccountState{dayStart: now}
		t.accounts[key] = state
	}
	if now.Sub(state.dayStart) >= otpDay {
		state.dayStart, state.dayFailures = now, 0
	}
	return state
}

func (t *otpThrottle) network(key string) *otpNetworkState {
	state, ok := t.networks[key]
	now := t.now()
	if !ok {
		state = &otpNetworkState{windowStart: now}
		t.networks[key] = state
	}
	if now.Sub(state.windowStart) >= otpNetworkWindow {
		state.windowStart, state.failures = now, 0
	}
	return state
}

// allow reports whether a verification attempt may proceed, and when to retry if not.
func (t *otpThrottle) allow(account, network string) (bool, time.Duration) {
	t.mu.Lock()
	defer t.mu.Unlock()
	acc := t.account(account)
	if acc.dayFailures >= otpMaxDailyFailures {
		return false, otpDay - t.now().Sub(acc.dayStart)
	}
	if acc.codeFailures >= otpMaxCodeAttempts {
		// Only a new code helps; it is requested, not waited for.
		return false, time.Minute
	}
	if net := t.network(network); net.failures >= otpMaxNetworkFailures {
		return false, otpNetworkWindow - t.now().Sub(net.windowStart)
	}
	return true, 0
}

// failed records a wrong code and reports whether the current code has used up its attempts.
func (t *otpThrottle) failed(account, network string) bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.prune()
	acc := t.account(account)
	acc.codeFailures++
	acc.dayFailures++
	t.network(network).failures++
	return acc.codeFailures >= otpMaxCodeAttempts
}

// newCode gives the account fresh per-code attempts (the daily budget is kept).
func (t *otpThrottle) newCode(account string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.account(account).codeFailures = 0
}

// succeeded forgets the account's failures.
func (t *otpThrottle) succeeded(account string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.accounts, account)
}

// prune drops idle state once many keys are tracked. Called with t.mu held.
func (t *otpThrottle) prune() {
	if len(t.accounts)+len(t.networks) < otpThrottlePruneSize {
		return
	}
	now := t.now()
	for k, s := range t.accounts {
		if now.Sub(s.dayStart) >= otpDay {
			delete(t.accounts, k)
		}
	}
	for k, s := range t.networks {
		if now.Sub(s.windowStart) >= otpNetworkWindow {
			delete(t.networks, k)
		}
	}
}
