package ui

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"
)

// distFS holds the embedded static assets compiled by Vite into pkg/ui/dist.
//
//go:embed all:dist
var distFS embed.FS

// DistFS returns an io/fs.FS rooted inside the embedded dist directory.
func DistFS() fs.FS {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(fmt.Errorf("failed to create sub filesystem from embedded dist: %w", err))
	}
	return sub
}

// DistDirFS returns the embedded dist filesystem as an http.FileSystem.
func DistDirFS() http.FileSystem {
	return http.FS(DistFS())
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
