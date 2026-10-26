package handlers

import (
	"fmt"
	"net/http"
	"sync"
	"testing"
	"time"

	"github.com/pocketbase/dbx"
)

func TestOTPThrottle_Limits(t *testing.T) {
	now := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	th := newOTPThrottle()
	th.now = func() time.Time { return now }

	for i := 0; i < otpMaxCodeAttempts; i++ {
		if ok, _ := th.reserve("users|a@x", "1.2.3.4"); !ok {
			t.Fatalf("attempt %d refused", i)
		}
		if exhausted := th.codeExhausted("users|a@x"); exhausted != (i == otpMaxCodeAttempts-1) {
			t.Fatalf("attempt %d: exhausted = %v", i, exhausted)
		}
	}
	if ok, _ := th.reserve("users|a@x", "1.2.3.4"); ok {
		t.Fatal("sixth guess on one code allowed")
	}

	// A refunded attempt (no code was compared) is given back.
	th.newCode("users|b@x")
	th.reserve("users|b@x", "1.2.3.5")
	th.refund("users|b@x", "1.2.3.5")
	if th.codeExhausted("users|b@x") || th.accounts["users|b@x"].dayFailures != 0 {
		t.Fatal("refund did not give the attempt back")
	}

	// A new code restores per-code attempts, but the daily budget keeps counting.
	for code := 1; code < otpMaxDailyFailures/otpMaxCodeAttempts; code++ {
		th.newCode("users|a@x")
		for i := 0; i < otpMaxCodeAttempts; i++ {
			th.reserve("users|a@x", fmt.Sprintf("10.0.%d.%d", code, i))
		}
	}
	th.newCode("users|a@x")
	if ok, _ := th.reserve("users|a@x", "9.9.9.9"); ok {
		t.Fatal("daily failure budget not enforced")
	}
	now = now.Add(otpDay)
	if ok, _ := th.reserve("users|a@x", "9.9.9.9"); !ok {
		t.Fatal("daily budget did not reset")
	}

	// One network spraying many accounts.
	for i := 0; i < otpMaxNetworkFailures; i++ {
		th.reserve(fmt.Sprintf("users|victim%d@x", i), "5.5.5.5")
	}
	if ok, _ := th.reserve("users|fresh@x", "5.5.5.5"); ok {
		t.Fatal("network budget not enforced")
	}
	if otpNetworkKey("2001:db8:1:2:3:4:5:6") != otpNetworkKey("2001:db8:1:2:ffff::1") {
		t.Fatal("IPv6 addresses of one /64 must share a budget")
	}
}

func TestOTPThrottle_ConcurrentGuessesStayBounded(t *testing.T) {
	th := newOTPThrottle()
	var wg sync.WaitGroup
	var mu sync.Mutex
	allowed := 0
	for i := 0; i < 400; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			if ok, _ := th.reserve("users|a@x", fmt.Sprintf("198.51.%d.%d", i/250, i%250)); ok {
				mu.Lock()
				allowed++
				mu.Unlock()
			}
		}(i)
	}
	wg.Wait()
	if allowed != otpMaxCodeAttempts {
		t.Fatalf("%d concurrent guesses allowed, want %d", allowed, otpMaxCodeAttempts)
	}
}

func TestAuthWithOTP_GuessesAreBounded(t *testing.T) {
	otpLimiter = newOTPThrottle()
	env := newSecurityEnv(t)
	env.insertUser("alice", "alice@example.com")
	if _, err := env.db.Update("users", dbx.Params{
		"otpCode":      "123456",
		"otpExpiresAt": time.Now().Add(10 * time.Minute).UTC().Format(time.RFC3339),
	}, dbx.HashExp{"id": "alice"}).Execute(); err != nil {
		t.Fatal(err)
	}

	// Rotating X-Forwarded-For does not buy more guesses.
	for i := 0; i < otpMaxCodeAttempts; i++ {
		who := caller{headers: map[string]string{"X-Forwarded-For": fmt.Sprintf("198.51.100.%d", i)}}
		rec := env.do(http.MethodPost, "/api/moul/users/auth-with-otp", map[string]string{"email": "alice@example.com", "code": fmt.Sprintf("00000%d", i)}, who)
		expectStatus(t, rec, http.StatusBadRequest)
	}
	rec := env.do(http.MethodPost, "/api/moul/users/auth-with-otp", map[string]string{"email": "alice@example.com", "code": "123456"}, guest)
	expectStatus(t, rec, http.StatusTooManyRequests)
	if rec.Header().Get("Retry-After") == "" {
		t.Fatal("missing Retry-After")
	}

	// The exhausted code was voided, so even the right code no longer works after a new budget.
	var code *string
	if err := env.db.NewQuery("SELECT otpCode FROM users WHERE id = 'alice'").Row(&code); err != nil {
		t.Fatal(err)
	}
	if code != nil {
		t.Fatalf("exhausted code still stored: %v", *code)
	}
}
