package docs

import _ "embed"

// Spec holds the raw content of openapi.yml embedded into the Go binary at compile time.
//go:embed openapi.yml
var Spec []byte
