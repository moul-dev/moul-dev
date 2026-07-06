package util

import (
	"testing"
)

func TestIsIPAllowed(t *testing.T) {
	tests := []struct {
		name       string
		ipStr      string
		allowedStr string
		expected   bool
	}{
		{
			name:       "empty allowed setting means allow all",
			ipStr:      "192.168.1.5",
			allowedStr: "",
			expected:   true,
		},
		{
			name:       "single exact IP matches",
			ipStr:      "192.168.1.5",
			allowedStr: "192.168.1.5",
			expected:   true,
		},
		{
			name:       "single exact IP doesn't match",
			ipStr:      "192.168.1.6",
			allowedStr: "192.168.1.5",
			expected:   false,
		},
		{
			name:       "comma separated list match",
			ipStr:      "10.0.0.1",
			allowedStr: "192.168.1.5, 10.0.0.1, 172.16.0.2",
			expected:   true,
		},
		{
			name:       "CIDR range match",
			ipStr:      "192.168.1.50",
			allowedStr: "192.168.1.0/24",
			expected:   true,
		},
		{
			name:       "CIDR range no match",
			ipStr:      "192.168.2.50",
			allowedStr: "192.168.1.0/24",
			expected:   false,
		},
		{
			name:       "mixed IPs and CIDR ranges",
			ipStr:      "172.16.5.5",
			allowedStr: "192.168.1.0/24, 172.16.0.0/16, 10.0.0.1",
			expected:   true,
		},
		{
			name:       "IPv6 exact match",
			ipStr:      "2001:db8::1",
			allowedStr: "2001:db8::1, 2001:db8::2",
			expected:   true,
		},
		{
			name:       "IPv6 CIDR match",
			ipStr:      "2001:db8::abcd",
			allowedStr: "2001:db8::/64",
			expected:   true,
		},
		{
			name:       "IPv4-mapped IPv6 match",
			ipStr:      "::ffff:192.168.1.5",
			allowedStr: "192.168.1.5",
			expected:   true,
		},
		{
			name:       "IPv4-mapped IPv6 CIDR match",
			ipStr:      "::ffff:192.168.1.50",
			allowedStr: "192.168.1.0/24",
			expected:   true,
		},
		{
			name:       "invalid client IP returns false",
			ipStr:      "invalid-ip",
			allowedStr: "127.0.0.1",
			expected:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsIPAllowed(tt.ipStr, tt.allowedStr)
			if result != tt.expected {
				t.Errorf("IsIPAllowed(%q, %q) = %v; expected %v", tt.ipStr, tt.allowedStr, result, tt.expected)
			}
		})
	}
}
