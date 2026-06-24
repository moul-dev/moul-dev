package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateAndVerifyToken(t *testing.T) {
	id := "user-123"
	email := "user@example.com"
	username := "testuser"
	moulName := "users"

	// 1. Test GenerateToken
	tokenString, err := GenerateToken(id, email, username, moulName)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	if tokenString == "" {
		t.Fatal("Expected non-empty token string")
	}

	// 2. Test VerifyToken (Success)
	claims, err := VerifyToken(tokenString)
	if err != nil {
		t.Fatalf("VerifyToken failed: %v", err)
	}

	if claims.ID != id {
		t.Errorf("Expected ID %q, got %q", id, claims.ID)
	}
	if claims.Email != email {
		t.Errorf("Expected Email %q, got %q", email, claims.Email)
	}
	if claims.Username != username {
		t.Errorf("Expected Username %q, got %q", username, claims.Username)
	}
	if claims.MoulName != moulName {
		t.Errorf("Expected MoulName %q, got %q", moulName, claims.MoulName)
	}

	// 3. Test VerifyToken with invalid/malformed token
	_, err = VerifyToken("invalid.token.string")
	if err == nil {
		t.Error("Expected error when verifying malformed token, got nil")
	}

	// 4. Test VerifyToken with unexpected signing method (e.g. RS256/None)
	// We can construct a token signed with RS256 or another method or key
	badToken := jwt.NewWithClaims(jwt.SigningMethodHS384, claims)
	badTokenString, err := badToken.SignedString([]byte("wrong-key-12345678901234567890"))
	if err == nil {
		_, err = VerifyToken(badTokenString)
		if err == nil {
			t.Error("Expected error when verifying token with wrong signature key/method, got nil")
		}
	}

	// 5. Test expired token
	expiredClaims := Claims{
		ID:       id,
		Email:    email,
		Username: username,
		MoulName: moulName,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredTokenString, err := expiredToken.SignedString(jwtSecretKey)
	if err != nil {
		t.Fatalf("Failed to sign expired token: %v", err)
	}
	_, err = VerifyToken(expiredTokenString)
	if err == nil {
		t.Error("Expected error when verifying expired token, got nil")
	}
}
