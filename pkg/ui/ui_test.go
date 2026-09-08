package ui

import (
	"io"
	"strings"
	"testing"
)

func TestDistFS(t *testing.T) {
	dfs := DistFS()
	if dfs == nil {
		t.Fatal("expected DistFS() to return a non-nil fs.FS")
	}

	f, err := dfs.Open("index.html")
	if err != nil {
		t.Fatalf("failed to open index.html from DistFS: %v", err)
	}
	defer f.Close()

	content, err := io.ReadAll(f)
	if err != nil {
		t.Fatalf("failed to read index.html: %v", err)
	}

	if !strings.Contains(string(content), "moul — Web Admin Console") {
		t.Fatalf("index.html did not contain expected title: %s", string(content))
	}

	if !strings.Contains(string(content), `<div id="root"></div>`) {
		t.Fatalf("index.html did not contain #root container: %s", string(content))
	}
}

func TestDistDirFS(t *testing.T) {
	httpFS := DistDirFS()
	if httpFS == nil {
		t.Fatal("expected DistDirFS() to return a non-nil http.FileSystem")
	}

	f, err := httpFS.Open("/index.html")
	if err != nil {
		t.Fatalf("failed to open /index.html from DistDirFS: %v", err)
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		t.Fatalf("failed to stat /index.html: %v", err)
	}

	if stat.Size() == 0 {
		t.Fatal("expected non-empty index.html")
	}
}

func TestHasCustomUI(t *testing.T) {
	if !HasCustomUI() {
		t.Fatal("expected HasCustomUI() to return true when dist files are embedded")
	}
}
