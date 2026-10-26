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

// reserve takes one attempt from every budget, atomically with the check, so concurrent guesses
// cannot overrun a budget. It returns false and when to retry if a budget is spent. The attempt
// counts as a failure until succeeded or refund gives it back.
func (t *otpThrottle) reserve(account, network string) (bool, time.Duration) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.prune()
	acc := t.account(account)
	netState := t.network(network)
	if acc.dayFailures >= otpMaxDailyFailures {
		return false, otpDay - t.now().Sub(acc.dayStart)
	}
	if acc.codeFailures >= otpMaxCodeAttempts {
		// Only a new code helps; it is requested, not waited for.
		return false, time.Minute
	}
	if netState.failures >= otpMaxNetworkFailures {
		return false, otpNetworkWindow - t.now().Sub(netState.windowStart)
	}
	acc.codeFailures++
	acc.dayFailures++
	netState.failures++
	return true, 0
}

// codeExhausted reports whether the account's current code has used up its attempts.
func (t *otpThrottle) codeExhausted(account string) bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.account(account).codeFailures >= otpMaxCodeAttempts
}

// refund gives back an attempt that compared no code (an internal error).
func (t *otpThrottle) refund(account, network string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	if acc, ok := t.accounts[account]; ok {
		acc.codeFailures = max(0, acc.codeFailures-1)
		acc.dayFailures = max(0, acc.dayFailures-1)
	}
	if netState, ok := t.networks[network]; ok {
		netState.failures = max(0, netState.failures-1)
	}
}

// newCode gives the account fresh per-code attempts (the daily budget is kept).
func (t *otpThrottle) newCode(account string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.account(account).codeFailures = 0
}

// succeeded forgets the account's failures and returns the network's attempt.
func (t *otpThrottle) succeeded(account, network string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.accounts, account)
	if netState, ok := t.networks[network]; ok {
		netState.failures = max(0, netState.failures-1)
	}
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
