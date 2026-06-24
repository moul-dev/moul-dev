package util

import (
	"crypto/rand"
	"math/big"
	"strings"
)

const idChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// RandomID generates a secure random alphanumeric ID of length 15 (matching PocketBase ID format).
func RandomID() string {
	b := make([]byte, 15)
	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(idChars))))
		if err != nil {
			panic(err) // Cryptographic source read error
		}
		b[i] = idChars[n.Int64()]
	}
	return string(b)
}

// Singularize converts a plural table name to its singular form.
func Singularize(name string) string {
	name = strings.ToLower(name)
	if strings.HasSuffix(name, "ies") {
		return name[:len(name)-3] + "y"
	}
	if strings.HasSuffix(name, "es") {
		if strings.HasSuffix(name, "sses") {
			return name[:len(name)-2] // e.g. classes -> class
		}
		return name[:len(name)-2]
	}
	if strings.HasSuffix(name, "s") {
		if strings.HasSuffix(name, "ss") {
			return name
		}
		return name[:len(name)-1]
	}
	return name
}
