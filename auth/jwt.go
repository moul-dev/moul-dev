package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Static secret key for development as decided in the design phase
var jwtSecretKey = []byte("super-secret-development-key-12345678")

// Claims represents the JWT claims payload.
type Claims struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	MoulName string `json:"moul"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT token for an authenticated user.
func GenerateToken(id, email, username, moulName string) (string, error) {
	claims := Claims{
		ID:       id,
		Email:    email,
		Username: username,
		MoulName: moulName,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
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
