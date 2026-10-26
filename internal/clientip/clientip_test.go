package clientip

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func request(remote string, headers map[string]string) *http.Request {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = remote
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	return req
}

func mustNew(t *testing.T, cfg Config) *Resolver {
	t.Helper()
	r, err := New(cfg)
	if err != nil {
		t.Fatalf("New(%+v): %v", cfg, err)
	}
	return r
}

func TestClientIP_DefaultTrustsOnlyLoopback(t *testing.T) {
	r := mustNew(t, Config{})

	cases := []struct {
		name    string
		remote  string
		headers map[string]string
		want    string
	}{
		{"direct client, spoofed XFF ignored", "203.0.113.7:5000", map[string]string{"X-Forwarded-For": "1.2.3.4"}, "203.0.113.7"},
		{"local proxy appends client", "127.0.0.1:4000", map[string]string{"X-Forwarded-For": "1.2.3.4, 198.51.100.9"}, "198.51.100.9"},
		{"local proxy, single hop", "127.0.0.1:4000", map[string]string{"X-Forwarded-For": "198.51.100.9"}, "198.51.100.9"},
		{"NATed client on a private address cannot spoof", "172.17.0.1:1", map[string]string{"X-Forwarded-For": "1.2.3.4"}, "172.17.0.1"},
		{"local proxy, no header", "127.0.0.1:4000", nil, "127.0.0.1"},
		{"unparsable hop stops the walk", "127.0.0.1:4000", map[string]string{"X-Forwarded-For": "1.2.3.4, garbage"}, "127.0.0.1"},
		{"ipv6 peer", "[2001:db8::1]:443", map[string]string{"X-Forwarded-For": "1.2.3.4"}, "2001:db8::1"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := r.ClientIP(request(tc.remote, tc.headers)); got != tc.want {
				t.Fatalf("ClientIP = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestClientIP_PrivateKeyword(t *testing.T) {
	r := mustNew(t, Config{TrustedProxies: []string{KeywordPrivate}})
	if got := r.ClientIP(request("10.0.0.2:1", map[string]string{"X-Forwarded-For": "198.51.100.9, 10.0.0.5"})); got != "198.51.100.9" {
		t.Fatalf("private chain then client: ClientIP = %q", got)
	}
	if got := r.ClientIP(request("127.0.0.1:1", map[string]string{"X-Forwarded-For": "192.168.1.20"})); got != "192.168.1.20" {
		t.Fatalf("all hops private: ClientIP = %q", got)
	}
}

func TestClientIP_NoneTrustsNobody(t *testing.T) {
	r := mustNew(t, Config{TrustedProxies: []string{KeywordNone}})
	got := r.ClientIP(request("127.0.0.1:4000", map[string]string{"X-Forwarded-For": "198.51.100.9"}))
	if got != "127.0.0.1" {
		t.Fatalf("ClientIP = %q, want the peer address", got)
	}
}

func TestClientIP_ExplicitRangesReplaceDefault(t *testing.T) {
	r := mustNew(t, Config{TrustedProxies: []string{"100.64.0.0/10", "203.0.113.1"}})

	if got := r.ClientIP(request("100.100.1.1:1", map[string]string{"X-Forwarded-For": "198.51.100.9"})); got != "198.51.100.9" {
		t.Fatalf("tailscale proxy: ClientIP = %q", got)
	}
	if got := r.ClientIP(request("203.0.113.1:1", map[string]string{"X-Forwarded-For": "198.51.100.9"})); got != "198.51.100.9" {
		t.Fatalf("single trusted address: ClientIP = %q", got)
	}
	// Loopback is no longer trusted once the list is explicit.
	if got := r.ClientIP(request("127.0.0.1:1", map[string]string{"X-Forwarded-For": "198.51.100.9"})); got != "127.0.0.1" {
		t.Fatalf("loopback after explicit list: ClientIP = %q", got)
	}
}

func TestClientIP_Header(t *testing.T) {
	r := mustNew(t, Config{Header: "cf-connecting-ip"})

	if got := r.ClientIP(request("127.0.0.1:1", map[string]string{"CF-Connecting-IP": "198.51.100.9", "X-Forwarded-For": "1.2.3.4"})); got != "198.51.100.9" {
		t.Fatalf("trusted peer with header: ClientIP = %q", got)
	}
	if got := r.ClientIP(request("203.0.113.7:1", map[string]string{"CF-Connecting-IP": "198.51.100.9"})); got != "203.0.113.7" {
		t.Fatalf("untrusted peer with header: ClientIP = %q", got)
	}
	if got := r.ClientIP(request("127.0.0.1:1", map[string]string{"CF-Connecting-IP": "not-an-ip"})); got != "127.0.0.1" {
		t.Fatalf("invalid header value: ClientIP = %q", got)
	}
}

func TestNew_RejectsInvalidEntries(t *testing.T) {
	for _, entry := range []string{"10.0.0.0/33", "not-an-ip"} {
		if _, err := New(Config{TrustedProxies: []string{entry}}); err == nil {
			t.Fatalf("New accepted %q", entry)
		}
	}
}

func TestFromEnv(t *testing.T) {
	t.Setenv(EnvTrustedProxies, "private, 100.64.0.0/10")
	t.Setenv(EnvClientIPHeader, "X-Real-IP")
	cfg := FromEnv()
	if len(cfg.TrustedProxies) != 2 || cfg.TrustedProxies[1] != "100.64.0.0/10" || cfg.Header != "X-Real-IP" {
		t.Fatalf("FromEnv = %+v", cfg)
	}

	t.Setenv(EnvTrustedProxies, "")
	if cfg := FromEnv(); len(cfg.TrustedProxies) != 1 || cfg.TrustedProxies[0] != KeywordNone {
		t.Fatalf("empty env should trust nobody, got %+v", cfg)
	}
}
