package ui

import (
	"embed"
	"io/fs"
	"net/http"
)

// distFS holds the embedded static assets compiled by Vite into internal/ui/dist.
//
//go:embed all:dist
var distFS embed.FS

// DistDirFS returns the embedded dist filesystem stripped of the 'dist' prefix.
func DistDirFS() http.FileSystem {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}
	return http.FS(sub)
}

// HasCustomUI checks whether real UI build assets exist in dist/ (beyond just .gitkeep).
func HasCustomUI() bool {
	entries, err := distFS.ReadDir("dist")
	if err != nil {
		return false
	}
	for _, entry := range entries {
		if entry.Name() != ".gitkeep" {
			return true
		}
	}
	return false
}
