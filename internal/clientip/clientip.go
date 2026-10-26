// Package clientip resolves the client address of a request that may have passed through reverse
// proxies. Forwarding headers (X-Forwarded-For, or a single-value header such as CF-Connecting-IP)
// are honored only when they were added by a trusted proxy, so a client cannot choose the address
// that rate limits, IP allowlists, the request log and visits are keyed by.
package clientip

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"strings"
)

// Environment variables read by FromEnv.
const (
	EnvTrustedProxies = "MOUL_TRUSTED_PROXIES"
	EnvClientIPHeader = "MOUL_CLIENT_IP_HEADER"
)

// Keywords accepted in a trusted proxy list in addition to IPs and CIDRs.
const (
	// KeywordPrivate expands to loopback, link-local and private-use ranges (the default).
	KeywordPrivate = "private"
	// KeywordNone trusts no proxy: the TCP peer address is always the client address.
	KeywordNone = "none"
)

// Config selects which peers may forward a client address and how they forward it.
type Config struct {
	// TrustedProxies lists IPs, CIDRs and keywords ("private", "none"). Nil means the default,
	// "private": a proxy on the same host or private network (Caddy, nginx, a tunnel agent).
	TrustedProxies []string
	// Header is an optional single-value header the trusted edge proxy sets to the client address
	// (for example "CF-Connecting-IP" or "X-Real-IP"). When empty, X-Forwarded-For is used.
	Header string
}

// FromEnv reads MOUL_TRUSTED_PROXIES (comma-separated) and MOUL_CLIENT_IP_HEADER. An unset
// MOUL_TRUSTED_PROXIES keeps the default; an empty one trusts no proxy.
func FromEnv() Config {
	var cfg Config
	if raw, ok := os.LookupEnv(EnvTrustedProxies); ok {
		cfg.TrustedProxies = splitList(raw)
		if len(cfg.TrustedProxies) == 0 {
			cfg.TrustedProxies = []string{KeywordNone}
		}
	}
	cfg.Header = strings.TrimSpace(os.Getenv(EnvClientIPHeader))
	return cfg
}

func splitList(raw string) []string {
	var out []string
	for _, part := range strings.Split(raw, ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// Resolver extracts the client IP of a request according to a Config.
type Resolver struct {
	trustPrivate bool
	ranges       []*net.IPNet
	header       string
}

// New builds a Resolver, rejecting entries that are neither an IP, a CIDR nor a keyword.
func New(cfg Config) (*Resolver, error) {
	r := &Resolver{header: http.CanonicalHeaderKey(strings.TrimSpace(cfg.Header))}
	entries := cfg.TrustedProxies
	if entries == nil {
		entries = []string{KeywordPrivate}
	}
	for _, entry := range entries {
		entry = strings.TrimSpace(entry)
		switch strings.ToLower(entry) {
		case "":
			continue
		case KeywordPrivate:
			r.trustPrivate = true
			continue
		case KeywordNone:
			continue
		}
		if strings.Contains(entry, "/") {
			_, ipNet, err := net.ParseCIDR(entry)
			if err != nil {
				return nil, fmt.Errorf("invalid trusted proxy range %q: %w", entry, err)
			}
			r.ranges = append(r.ranges, ipNet)
			continue
		}
		ip := net.ParseIP(entry)
		if ip == nil {
			return nil, fmt.Errorf("invalid trusted proxy address %q", entry)
		}
		bits := 128
		if ip.To4() != nil {
			ip = ip.To4()
			bits = 32
		}
		r.ranges = append(r.ranges, &net.IPNet{IP: ip, Mask: net.CIDRMask(bits, bits)})
	}
	return r, nil
}

// Trusts reports whether ip belongs to a trusted proxy.
func (r *Resolver) Trusts(ip net.IP) bool {
	if ip == nil {
		return false
	}
	if r.trustPrivate && (ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsPrivate()) {
		return true
	}
	for _, ipNet := range r.ranges {
		if ipNet.Contains(ip) {
			return true
		}
	}
	return false
}

// ClientIP returns the client address of req. The TCP peer is the client unless it is a trusted
// proxy; then the configured header, or else the nearest untrusted X-Forwarded-For entry, names it.
func (r *Resolver) ClientIP(req *http.Request) string {
	direct := peerIP(req)
	directIP := net.ParseIP(direct)
	if !r.Trusts(directIP) {
		return direct
	}

	if r.header != "" {
		if ip := parseIP(req.Header.Get(r.header)); ip != nil {
			return ip.String()
		}
		return direct
	}

	values := req.Header.Values("X-Forwarded-For")
	if len(values) == 0 {
		return direct
	}
	hops := strings.Split(strings.Join(values, ","), ",")
	for i := len(hops) - 1; i >= 0; i-- {
		ip := parseIP(hops[i])
		if ip == nil {
			// A hop we cannot parse may hide anything to its left: stop at the last trusted hop.
			return direct
		}
		if !r.Trusts(ip) {
			return ip.String()
		}
	}
	// Every hop is trusted (a request from inside the private network): the furthest one is the client.
	if ip := parseIP(hops[0]); ip != nil {
		return ip.String()
	}
	return direct
}

func peerIP(req *http.Request) string {
	host, _, err := net.SplitHostPort(req.RemoteAddr)
	if err != nil {
		return req.RemoteAddr
	}
	return host
}

func parseIP(raw string) net.IP {
	s := strings.TrimSpace(raw)
	s = strings.TrimPrefix(s, "[")
	s = strings.TrimSuffix(s, "]")
	if host, _, err := net.SplitHostPort(s); err == nil {
		s = host
	}
	return net.ParseIP(s)
}
