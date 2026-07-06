package util

import (
	"net"
	"strings"
)

// IsIPAllowed checks if a given IP matches any of the allowed IPs or CIDR ranges.
// The allowedStr is a comma-separated list of IPs or CIDR blocks.
// If allowedStr is empty, it returns true (no restriction).
func IsIPAllowed(ipStr string, allowedStr string) bool {
	allowedStr = strings.TrimSpace(allowedStr)
	if allowedStr == "" {
		return true
	}

	clientIP := net.ParseIP(strings.TrimSpace(ipStr))
	if clientIP == nil {
		return false
	}

	// Normalize client IP to 4-byte representation if it is IPv4 (handles IPv4-mapped IPv6)
	if ip4 := clientIP.To4(); ip4 != nil {
		clientIP = ip4
	}

	parts := strings.Split(allowedStr, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		// Try parsing as CIDR
		_, subnet, err := net.ParseCIDR(part)
		if err == nil {
			if subnet.Contains(clientIP) {
				return true
			}
		} else {
			// Try parsing as single IP
			allowedIP := net.ParseIP(part)
			if allowedIP != nil {
				if ip4 := allowedIP.To4(); ip4 != nil {
					allowedIP = ip4
				}
				if allowedIP.Equal(clientIP) {
					return true
				}
			}
		}
	}

	return false
}
