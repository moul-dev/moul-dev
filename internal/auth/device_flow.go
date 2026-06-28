package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
	"sync"
	"time"
)

// DeviceAuthRequest holds the state of a device authorization request.
type DeviceAuthRequest struct {
	DeviceCode string    `json:"device_code"`
	UserCode   string    `json:"user_code"`
	ClientID   string    `json:"client_id"`
	ExpiresAt  time.Time `json:"expires_at"`
	Approved   bool      `json:"approved"`
	AuthMoul   string    `json:"auth_moul,omitempty"`
	UserID     string    `json:"user_id,omitempty"`
	JWTToken   string    `json:"jwt_token,omitempty"`
}

// DeviceFlowStore manages the active device flow requests.
type DeviceFlowStore struct {
	mu          sync.RWMutex
	byDevice    map[string]*DeviceAuthRequest
	byUserCode  map[string]*DeviceAuthRequest
}

// Global Device Flow Store
var DefaultDeviceFlowStore = NewDeviceFlowStore()

// NewDeviceFlowStore creates a new empty DeviceFlowStore.
func NewDeviceFlowStore() *DeviceFlowStore {
	return &DeviceFlowStore{
		byDevice:   make(map[string]*DeviceAuthRequest),
		byUserCode: make(map[string]*DeviceAuthRequest),
	}
}

// CreateDeviceRequest generates a new device flow request.
func (s *DeviceFlowStore) CreateDeviceRequest(clientID string, expiry time.Duration) (*DeviceAuthRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Clean up expired entries first to keep map sizes small
	s.cleanupExpiredLocked()

	// Generate secure unique device code
	deviceCode, err := generateRandomString(32)
	if err != nil {
		return nil, fmt.Errorf("failed to generate device code: %w", err)
	}

	// Generate user-friendly user code (e.g. BCDF-GHJK)
	var userCode string
	for {
		userCode = generateUserCode()
		// Make sure it doesn't collide
		if _, exists := s.byUserCode[userCode]; !exists {
			break
		}
	}

	req := &DeviceAuthRequest{
		DeviceCode: deviceCode,
		UserCode:   userCode,
		ClientID:   clientID,
		ExpiresAt:  time.Now().Add(expiry),
		Approved:   false,
	}

	s.byDevice[deviceCode] = req
	
	// Normalize for store lookup key
	normalizedUserCode := strings.ToUpper(strings.ReplaceAll(userCode, "-", ""))
	s.byUserCode[normalizedUserCode] = req

	return req, nil
}

// GetRequestByDeviceCode looks up a request by device code.
func (s *DeviceFlowStore) GetRequestByDeviceCode(deviceCode string) (*DeviceAuthRequest, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	req, ok := s.byDevice[deviceCode]
	if !ok || time.Now().After(req.ExpiresAt) {
		return nil, false
	}
	return req, true
}

// GetRequestByUserCode looks up a request by user code.
func (s *DeviceFlowStore) GetRequestByUserCode(userCode string) (*DeviceAuthRequest, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Normalise spacing/casing
	normalised := strings.ToUpper(strings.ReplaceAll(userCode, " ", ""))
	normalised = strings.ReplaceAll(normalised, "-", "")

	req, ok := s.byUserCode[normalised]
	if !ok || time.Now().After(req.ExpiresAt) {
		return nil, false
	}
	return req, true
}

// ApproveDeviceRequest marks a request as approved and binds user details and token.
func (s *DeviceFlowStore) ApproveDeviceRequest(userCode string, authMoul string, userID string, jwtToken string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	normalised := strings.ToUpper(strings.ReplaceAll(userCode, " ", ""))
	normalised = strings.ReplaceAll(normalised, "-", "")

	req, ok := s.byUserCode[normalised]
	if !ok {
		return fmt.Errorf("invalid or expired user code")
	}

	if time.Now().After(req.ExpiresAt) {
		return fmt.Errorf("user code has expired")
	}

	req.Approved = true
	req.AuthMoul = authMoul
	req.UserID = userID
	req.JWTToken = jwtToken

	return nil
}

// cleanupExpiredLocked removes expired entries (caller must hold Lock).
func (s *DeviceFlowStore) cleanupExpiredLocked() {
	now := time.Now()
	for devCode, req := range s.byDevice {
		if now.After(req.ExpiresAt) {
			delete(s.byDevice, devCode)
			normalizedUserCode := strings.ToUpper(strings.ReplaceAll(req.UserCode, "-", ""))
			delete(s.byUserCode, normalizedUserCode)
		}
	}
}

// generateUserCode generates an uppercase, alphanumeric, 8-character code formatted as XXXX-XXXX.
// Omit confusing characters like I, O, 0, 1, 5, S, etc.
func generateUserCode() string {
	const charset = "BCDFGHJKLMNPQRSTVWXYZ23456789"
	b := make([]byte, 8)
	for i := range b {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[n.Int64()]
	}
	return string(b[:4]) + "-" + string(b[4:])
}

// generateRandomString generates a secure random hexadecimal string of given length.
func generateRandomString(n int) (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		b[i] = letters[num.Int64()]
	}
	return string(b), nil
}
