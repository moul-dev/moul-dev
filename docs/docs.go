package docs

import (
	_ "embed"
	"regexp"
)

// Spec holds the raw content of openapi.yml embedded into the Go binary at compile time.
//go:embed openapi.yml
var Spec []byte

var versionRegexp = regexp.MustCompile(`(?m)^(\s*version:\s*)[^\r\n]+`)

// GetSpec returns the raw openapi.yml with the version field updated to version.
// If version is empty, it defaults to "dev".
func GetSpec(version string) []byte {
	if version == "" {
		version = "dev"
	}
	return versionRegexp.ReplaceAll(Spec, []byte("${1}"+version))
}
