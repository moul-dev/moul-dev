package util

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
	"strings"

	pluralize "github.com/gertd/go-pluralize"
	"github.com/gobuffalo/envy"
)

const idChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var pluralClient = pluralize.NewClient()

func init() {
	// Add domain-specific uncountables so database words remain intact
	pluralClient.AddUncountableRule("data")
	pluralClient.AddUncountableRule("metadata")
	pluralClient.AddUncountableRule("analytics")
	pluralClient.AddUncountableRule("media")
}

// GetPublicURL returns the configured public base URL via MOUL_PUBLIC_URL environment variable,
// defaulting to http://localhost:<MOUL_PORT> (or http://localhost:8090).
func GetPublicURL() string {
	publicURL := os.Getenv("MOUL_PUBLIC_URL")
	if publicURL == "" {
		publicURL = envy.Get("MOUL_PUBLIC_URL", "")
	}
	if publicURL != "" {
		return strings.TrimSuffix(publicURL, "/")
	}
	port := os.Getenv("MOUL_PORT")
	if port == "" {
		port = envy.Get("MOUL_PORT", "8090")
	}
	return fmt.Sprintf("http://localhost:%s", port)
}

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

// Singularize converts a collection or table name to its lowercase singular form.
// If the collection name is plural, it is singularized using an English language dictionary
// and irregular noun inflection rules (e.g. "Users" -> "user", "people" -> "person", "posts" -> "post").
// If the collection name is already singular, it is returned in lowercase without modification.
func Singularize(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return ""
	}
	s := pluralClient.Singular(name)
	return strings.ToLower(s)
}

// RecordID generates a record ID formatted as <singular_collection>-<randomID>.
// If collectionName is empty, it returns a random alphanumeric ID.
func RecordID(collectionName string) string {
	prefix := Singularize(collectionName)
	if prefix == "" {
		return RandomID()
	}
	return fmt.Sprintf("%s-%s", prefix, RandomID())
}

// SlugifyFilename converts a filename into a clean, URL- and filesystem-friendly slug.
// E.g., "My Profile Photo (2026) & Info!.PNG" -> "my-profile-photo-2026-info.png"
func SlugifyFilename(filename string) string {
	if filename == "" {
		return "file"
	}

	ext := filepath.Ext(filename)
	base := strings.TrimSuffix(filename, ext)

	// Clean extension: lowercase and keep only alphanumeric chars after leading dot
	ext = strings.ToLower(ext)
	var cleanExt strings.Builder
	if len(ext) > 1 && ext[0] == '.' {
		cleanExt.WriteByte('.')
		for i := 1; i < len(ext); i++ {
			c := ext[i]
			if (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') {
				cleanExt.WriteByte(c)
			}
		}
	}

	// Clean base: lowercase, replace spaces and non-alphanumeric chars (except '_' and '-') with hyphens
	base = strings.ToLower(base)
	var sb strings.Builder
	inHyphen := false

	for _, r := range base {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' {
			sb.WriteRune(r)
			inHyphen = false
		} else if r == '-' {
			if !inHyphen {
				sb.WriteRune('-')
				inHyphen = true
			}
		} else {
			// Space, dots, or special symbols -> single hyphen
			if !inHyphen && sb.Len() > 0 {
				sb.WriteRune('-')
				inHyphen = true
			}
		}
	}

	cleanBase := strings.Trim(sb.String(), "-")
	if cleanBase == "" {
		cleanBase = "file"
	}

	return cleanBase + cleanExt.String()
}
