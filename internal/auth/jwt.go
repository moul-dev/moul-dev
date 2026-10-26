package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtSecretKey []byte
	jwtOnce      sync.Once
	jwtReady     bool
)

// InitJWT sets the JWT secret key. Must be called once at startup before
// any token operations. Panics if called more than once with a different key.
func InitJWT(secret string) {
	if secret == "" {
		panic("JWT secret must not be empty")
	}
	jwtOnce.Do(func() {
		jwtSecretKey = []byte(secret)
		jwtReady = true
	})
}

func mustBeReady() {
	if !jwtReady {
		panic("auth.InitJWT() must be called before using JWT functions")
	}
}

// Claims represents the JWT claims payload.
type Claims struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	MoulName string `json:"moul"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT token for an authenticated user, valid for the lifetime
// configured for moulName (TokenTTL).
func GenerateToken(id, email, username, moulName string) (string, error) {
	return GenerateTokenWithTTL(id, email, username, moulName, TokenTTL(moulName))
}

// GenerateTokenWithTTL creates a signed JWT token for an authenticated user valid for ttl.
func GenerateTokenWithTTL(id, email, username, moulName string, ttl time.Duration) (string, error) {
	mustBeReady()

	claims := Claims{
		ID:       id,
		Email:    email,
		Username: username,
		MoulName: moulName,
		RegisteredClaims: jwt.RegisteredClaims{
			// A unique token id keeps two tokens issued in the same second distinct, so revoking
			// one (logout, refresh) never revokes the other.
			ID:        newTokenID(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT token: %w", err)
	}

	return tokenString, nil
}

// VerifyToken parses and validates a JWT token string.
func VerifyToken(tokenString string) (*Claims, error) {
	mustBeReady()

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// VerifyTokenAllowExpired parses and validates token signature without failing on expired token claims.
func VerifyTokenAllowExpired(tokenString string) (*Claims, error) {
	mustBeReady()

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecretKey, nil
	}, jwt.WithoutClaimsValidation())

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// DeriveKey returns a key for purpose derived from the JWT secret, so other signed values (such
// as file URLs) never share a key with tokens.
func DeriveKey(purpose string) []byte {
	mustBeReady()
	mac := hmac.New(sha256.New, jwtSecretKey)
	mac.Write([]byte("moul:" + purpose))
	return mac.Sum(nil)
}

// Ready reports whether InitJWT has been called.
func Ready() bool {
	return jwtReady
}

// newTokenID returns a random JWT id.
func newTokenID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(fmt.Sprintf("failed to generate token id: %v", err))
	}
	return hex.EncodeToString(b)
}
