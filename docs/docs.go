package docs

import (
	_ "embed"
	"regexp"
)

// Spec holds the raw content of openapi.yml embedded into the Go binary at compile time.
//go:embed openapi.yml
var Spec []byte

// AgentsMD holds the raw content of AGENTS.md embedded into the Go binary at compile time.
//go:embed AGENTS.md
var AgentsMD []byte

// LLMSTxt holds the raw content of llms.txt embedded into the Go binary at compile time.
//go:embed llms.txt
var LLMSTxt []byte

// LLMSFullTxt holds the raw content of llms-full.txt embedded into the Go binary at compile time.
//go:embed llms-full.txt
var LLMSFullTxt []byte

var versionRegexp = regexp.MustCompile(`(?m)^(\s*version:\s*)[^\r\n]+`)

// GetSpec returns the raw openapi.yml with the version field updated to version.
// If version is empty, it defaults to "dev".
func GetSpec(version string) []byte {
	if version == "" {
		version = "dev"
	}
	return versionRegexp.ReplaceAll(Spec, []byte("${1}"+version))
}
