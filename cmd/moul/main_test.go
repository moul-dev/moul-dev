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
	newBinaryContent := []byte("updated-moul-server-binary")
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
	if err := os.WriteFile(dummyExecPath, []byte("old-moul-binary"), 0755); err != nil {
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

func TestParseUpdateArgs(t *testing.T) {
	tests := []struct {
		name            string
		args            []string
		expectedForce   bool
		expectedService string
	}{
		{
			name:            "default flags",
			args:            []string{},
			expectedForce:   false,
			expectedService: "",
		},
		{
			name:            "force flag",
			args:            []string{"-f"},
			expectedForce:   true,
			expectedService: "",
		},
		{
			name:            "service flag default name",
			args:            []string{"--service"},
			expectedForce:   false,
			expectedService: "moul",
		},
		{
			name:            "service flag explicit name",
			args:            []string{"--service", "moul.service"},
			expectedForce:   false,
			expectedService: "moul.service",
		},
		{
			name:            "systemd flag equals",
			args:            []string{"--systemd=custom-moul"},
			expectedForce:   false,
			expectedService: "custom-moul",
		},
		{
			name:            "combined force and service",
			args:            []string{"-f", "-s", "moul-server"},
			expectedForce:   true,
			expectedService: "moul-server",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			force, service := parseUpdateArgs(tt.args)
			if force != tt.expectedForce {
				t.Errorf("Expected force %v, got %v", tt.expectedForce, force)
			}
			if service != tt.expectedService {
				t.Errorf("Expected service %q, got %q", tt.expectedService, service)
			}
		})
	}
}

func TestGetDBPath(t *testing.T) {
	origArgs := os.Args
	defer func() { os.Args = origArgs }()

	os.Args = []string{"moul", "seed", "--db", "custom-test.db"}
	if p := getDBPath(); p != "custom-test.db" {
		t.Errorf("Expected custom-test.db, got %s", p)
	}

	os.Args = []string{"moul", "seed", "--db=equal-test.db"}
	if p := getDBPath(); p != "equal-test.db" {
		t.Errorf("Expected equal-test.db, got %s", p)
	}
}

func TestParseFlagStringAndHasFlag(t *testing.T) {
	origArgs := os.Args
	defer func() { os.Args = origArgs }()

	os.Args = []string{"moul", "export", "posts", "--format", "csv", "--schema", "--out=data.csv"}

	if fmtVal := parseFlagString("--format"); fmtVal != "csv" {
		t.Errorf("expected format to be csv, got %s", fmtVal)
	}
	if outVal := parseFlagString("--out"); outVal != "data.csv" {
		t.Errorf("expected out to be data.csv, got %s", outVal)
	}
	if !hasFlag("--schema") {
		t.Errorf("expected hasFlag(--schema) to be true")
	}
	if hasFlag("--missing") {
		t.Errorf("expected hasFlag(--missing) to be false")
	}
}
