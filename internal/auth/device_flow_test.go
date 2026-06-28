package auth

import (
	"testing"
	"time"
)

func TestDeviceFlowStore(t *testing.T) {
	store := NewDeviceFlowStore()

	// 1. Create a request
	clientID := "test-tui"
	expiry := 2 * time.Second
	req, err := store.CreateDeviceRequest(clientID, expiry)
	if err != nil {
		t.Fatalf("Failed to create device request: %v", err)
	}

	if req.ClientID != clientID {
		t.Errorf("Expected ClientID %q, got %q", clientID, req.ClientID)
	}
	if req.DeviceCode == "" || req.UserCode == "" {
		t.Errorf("Expected codes to be generated, got device=%q, user=%q", req.DeviceCode, req.UserCode)
	}
	if req.Approved {
		t.Error("Expected request to not be approved initially")
	}

	// 2. Lookup by Device Code
	req2, ok := store.GetRequestByDeviceCode(req.DeviceCode)
	if !ok {
		t.Fatal("Failed to lookup request by device code")
	}
	if req2.UserCode != req.UserCode {
		t.Errorf("Expected UserCode %q, got %q", req.UserCode, req2.UserCode)
	}

	// 3. Lookup by User Code (case-insensitive and hyphen-insensitive)
	req3, ok := store.GetRequestByUserCode(req.UserCode)
	if !ok {
		t.Fatal("Failed to lookup request by user code")
	}
	if req3.DeviceCode != req.DeviceCode {
		t.Errorf("Expected DeviceCode %q, got %q", req.DeviceCode, req3.DeviceCode)
	}

	// Test user code formatting robustness (lowercase, spacing, no hyphen)
	rawUserCode := req.UserCode
	variations := []string{
		rawUserCode,
		stringsToLower(rawUserCode),
		stringsReplaceAll(rawUserCode, "-", ""),
		stringsReplaceAll(stringsToLower(rawUserCode), "-", " "),
	}

	for _, v := range variations {
		_, ok := store.GetRequestByUserCode(v)
		if !ok {
			t.Errorf("Failed to lookup by user code variation: %q", v)
		}
	}

	// 4. Approve request
	authMoul := "users"
	userID := "user-123"
	jwtToken := "test-jwt-token"
	err = store.ApproveDeviceRequest(req.UserCode, authMoul, userID, jwtToken)
	if err != nil {
		t.Fatalf("Failed to approve device request: %v", err)
	}

	req4, ok := store.GetRequestByDeviceCode(req.DeviceCode)
	if !ok {
		t.Fatal("Failed to lookup request after approval")
	}
	if !req4.Approved {
		t.Error("Expected request to be approved")
	}
	if req4.JWTToken != jwtToken || req4.UserID != userID || req4.AuthMoul != authMoul {
		t.Errorf("Expected approved info to match: token=%q, user=%q, moul=%q", req4.JWTToken, req4.UserID, req4.AuthMoul)
	}

	// 5. Test Expiration
	reqExpired, err := store.CreateDeviceRequest("expired-client", 10*time.Millisecond)
	if err != nil {
		t.Fatalf("Failed to create short-lived request: %v", err)
	}

	time.Sleep(15 * time.Millisecond)

	_, ok = store.GetRequestByDeviceCode(reqExpired.DeviceCode)
	if ok {
		t.Error("Expected request to be expired and unavailable by device code")
	}

	_, ok = store.GetRequestByUserCode(reqExpired.UserCode)
	if ok {
		t.Error("Expected request to be expired and unavailable by user code")
	}
}

// Minimal helpers to avoid extra dependencies in testing package
func stringsToLower(s string) string {
	b := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			c += 'a' - 'A'
		}
		b[i] = c
	}
	return string(b)
}

func stringsReplaceAll(s, old, new string) string {
	if old == "" {
		return s
	}
	n := 0
	for i := 0; i < len(s); {
		if i+len(old) <= len(s) && s[i:i+len(old)] == old {
			n++
			i += len(old)
		} else {
			i++
		}
	}
	if n == 0 {
		return s
	}
	b := make([]byte, 0, len(s)+n*(len(new)-len(old)))
	for i := 0; i < len(s); {
		if i+len(old) <= len(s) && s[i:i+len(old)] == old {
			b = append(b, new...)
			i += len(old)
		} else {
			b = append(b, s[i])
			i++
		}
	}
	return string(b)
}
