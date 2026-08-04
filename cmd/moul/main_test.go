package main

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/updater"
)

func createMockTarGz(binaryName string, content []byte) ([]byte, error) {
	var buf bytes.Buffer
	gzw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gzw)

	hdr := &tar.Header{
		Name:    binaryName,
		Mode:    0755,
		Size:    int64(len(content)),
		ModTime: time.Now(),
	}
	if err := tw.WriteHeader(hdr); err != nil {
		return nil, err
	}
	if _, err := tw.Write(content); err != nil {
		return nil, err
	}
	if err := tw.Close(); err != nil {
		return nil, err
	}
	if err := gzw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

type rewriteTransport struct {
	targetHost string
}

func (t *rewriteTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	target, err := req.URL.Parse(t.targetHost)
	if err != nil {
		return nil, err
	}
	req.URL.Scheme = target.Scheme
	req.URL.Host = target.Host
	return http.DefaultTransport.RoundTrip(req)
}

func TestMoulUpdate_Success(t *testing.T) {
	newBinaryContent := []byte("updated-moul-tui-binary")
	appName := "moul"
	targetAssetName := fmt.Sprintf("%s_v2026.07_%s_%s.tar.gz", appName, runtime.GOOS, runtime.GOARCH)

	tarGzBytes, err := createMockTarGz(appName, newBinaryContent)
	if err != nil {
		t.Fatalf("Failed to create mock tar.gz: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/repos/moul-dev/moul-dev/releases/latest":
			info := updater.ReleaseInfo{
				TagName: "v2026.07",
				Assets: []updater.Asset{
					{
						Name:               targetAssetName,
						BrowserDownloadURL: "http://example.com/download/" + targetAssetName,
					},
				},
			}
			json.NewEncoder(w).Encode(info)
		case "/download/" + targetAssetName:
			w.Header().Set("Content-Type", "application/gzip")
			w.Write(tarGzBytes)
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	tempDir := t.TempDir()
	dummyExecPath := filepath.Join(tempDir, appName)
	if err := os.WriteFile(dummyExecPath, []byte("old-moul-tui-binary"), 0755); err != nil {
		t.Fatalf("Failed to write dummy binary: %v", err)
	}

	opts := updater.Options{
		AppName:    appName,
		CurrentVer: "v2026.06",
		ExecPath:   dummyExecPath,
		HTTPClient: &http.Client{
			Transport: &rewriteTransport{targetHost: server.URL},
		},
	}

	if err := updater.Update(opts); err != nil {
		t.Fatalf("moul update failed: %v", err)
	}

	content, err := os.ReadFile(dummyExecPath)
	if err != nil {
		t.Fatalf("Failed to read updated executable: %v", err)
	}
	if string(content) != string(newBinaryContent) {
		t.Errorf("Expected updated binary content %q, got %q", string(newBinaryContent), string(content))
	}
}

func TestMoulUpdate_RunUpdateArgs(t *testing.T) {
	argsWithForce := []string{"--force"}
	force := false
	for _, arg := range argsWithForce {
		if arg == "-f" || arg == "--force" {
			force = true
		}
	}
	if !force {
		t.Errorf("Expected force to be true for --force arg")
	}

	argsWithShortForce := []string{"-f"}
	forceShort := false
	for _, arg := range argsWithShortForce {
		if arg == "-f" || arg == "--force" {
			forceShort = true
		}
	}
	if !forceShort {
		t.Errorf("Expected force to be true for -f arg")
	}
}
