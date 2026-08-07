package updater

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
	"strings"
	"testing"
	"time"
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

func TestUpdate_AlreadyUpToDate(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/repos/moul-dev/moul-dev/releases/latest" {
			info := ReleaseInfo{
				TagName: "v2026.07",
			}
			json.NewEncoder(w).Encode(info)
			return
		}
		http.NotFound(w, r)
	}))
	defer server.Close()

	opts := Options{
		AppName:    "moul-dev",
		CurrentVer: "v2026.07",
		Force:      false,
		HTTPClient: server.Client(),
	}

	// Override URL routing by replacing host handling logic via custom transport
	opts.HTTPClient.Transport = &rewriteTransport{
		targetHost: server.URL,
	}

	err := Update(opts)
	if err != nil {
		t.Fatalf("Expected no error when already up to date, got: %v", err)
	}
}

func TestUpdate_DevVersion_UpdatesSuccessfully(t *testing.T) {
	newBinaryContent := []byte("updated-binary-content-v2026.07")
	appName := "moul"
	targetAssetName := fmt.Sprintf("%s_v2026.07_%s_%s.tar.gz", appName, runtime.GOOS, runtime.GOARCH)

	tarGzBytes, err := createMockTarGz(appName, newBinaryContent)
	if err != nil {
		t.Fatalf("Failed to create mock tar.gz: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/repos/moul-dev/moul-dev/releases/latest":
			info := ReleaseInfo{
				TagName: "v2026.07",
				Assets: []Asset{
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

	// Create temporary dummy executable file
	tempDir := t.TempDir()
	dummyExecPath := filepath.Join(tempDir, appName)
	if err := os.WriteFile(dummyExecPath, []byte("old-binary-content"), 0755); err != nil {
		t.Fatalf("Failed to create dummy exec: %v", err)
	}

	opts := Options{
		AppName:    appName,
		CurrentVer: "dev",
		Force:      false,
		ExecPath:   dummyExecPath,
		HTTPClient: &http.Client{
			Transport: &rewriteTransport{targetHost: server.URL},
		},
	}

	if err := Update(opts); err != nil {
		t.Fatalf("Update failed: %v", err)
	}

	// Verify target executable file content was replaced
	updatedContent, err := os.ReadFile(dummyExecPath)
	if err != nil {
		t.Fatalf("Failed to read updated executable: %v", err)
	}
	if string(updatedContent) != string(newBinaryContent) {
		t.Errorf("Expected updated content %q, got %q", string(newBinaryContent), string(updatedContent))
	}
}

func TestUpdate_ForceUpdate(t *testing.T) {
	newBinaryContent := []byte("forced-update-content")
	appName := "moul-dev"
	targetAssetName := fmt.Sprintf("%s_v2026.07_%s_%s.tar.gz", appName, runtime.GOOS, runtime.GOARCH)

	tarGzBytes, err := createMockTarGz(appName, newBinaryContent)
	if err != nil {
		t.Fatalf("Failed to create mock tar.gz: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/repos/moul-dev/moul-dev/releases/latest":
			info := ReleaseInfo{
				TagName: "v2026.07",
				Assets: []Asset{
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
	if err := os.WriteFile(dummyExecPath, []byte("old-content"), 0755); err != nil {
		t.Fatalf("Failed to write initial dummy binary: %v", err)
	}

	opts := Options{
		AppName:    appName,
		CurrentVer: "v2026.07",
		Force:      true, // Force update even though version matches
		ExecPath:   dummyExecPath,
		HTTPClient: &http.Client{
			Transport: &rewriteTransport{targetHost: server.URL},
		},
	}

	if err := Update(opts); err != nil {
		t.Fatalf("Force update failed: %v", err)
	}

	content, err := os.ReadFile(dummyExecPath)
	if err != nil {
		t.Fatalf("Failed to read updated executable: %v", err)
	}
	if string(content) != string(newBinaryContent) {
		t.Errorf("Expected content %q, got %q", string(newBinaryContent), string(content))
	}
}

func TestUpdate_MissingBinaryInTar(t *testing.T) {
	appName := "moul"
	targetAssetName := fmt.Sprintf("%s_v2026.07_%s_%s.tar.gz", appName, runtime.GOOS, runtime.GOARCH)

	// Create tar.gz with wrong binary name inside
	tarGzBytes, err := createMockTarGz("wrong-binary-name", []byte("some-data"))
	if err != nil {
		t.Fatalf("Failed to create tar.gz: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/repos/moul-dev/moul-dev/releases/latest":
			info := ReleaseInfo{
				TagName: "v2026.07",
				Assets: []Asset{
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
	os.WriteFile(dummyExecPath, []byte("old"), 0755)

	opts := Options{
		AppName:    appName,
		CurrentVer: "v2026.06",
		ExecPath:   dummyExecPath,
		HTTPClient: &http.Client{
			Transport: &rewriteTransport{targetHost: server.URL},
		},
	}

	err = Update(opts)
	if err == nil {
		t.Fatal("Expected error due to missing binary in tar archive, got nil")
	}
	if !strings.Contains(err.Error(), "not found inside archive") {
		t.Errorf("Unexpected error message: %v", err)
	}
}

func TestUpdate_HTTPError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}))
	defer server.Close()

	opts := Options{
		AppName:    "moul-dev",
		CurrentVer: "v2026.06",
		HTTPClient: &http.Client{
			Transport: &rewriteTransport{targetHost: server.URL},
		},
	}

	err := Update(opts)
	if err == nil {
		t.Fatal("Expected error on HTTP 500, got nil")
	}
}

// rewriteTransport redirects all requests to the httptest server host
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

func TestUpdate_SystemdService_RestartsService(t *testing.T) {
	newBinaryContent := []byte("systemd-restarted-binary")
	appName := "moul-dev"
	targetAssetName := fmt.Sprintf("%s_v2026.07_%s_%s.tar.gz", appName, runtime.GOOS, runtime.GOARCH)

	tarGzBytes, err := createMockTarGz(appName, newBinaryContent)
	if err != nil {
		t.Fatalf("Failed to create mock tar.gz: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/repos/moul-dev/moul-dev/releases/latest":
			info := ReleaseInfo{
				TagName: "v2026.07",
				Assets: []Asset{
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
	if err := os.WriteFile(dummyExecPath, []byte("old-binary-content"), 0755); err != nil {
		t.Fatalf("Failed to create dummy exec: %v", err)
	}

	restartedService := ""
	opts := Options{
		AppName:        appName,
		CurrentVer:     "dev",
		SystemdService: "moul.service",
		ExecPath:       dummyExecPath,
		HTTPClient: &http.Client{
			Transport: &rewriteTransport{targetHost: server.URL},
		},
		SystemctlExec: func(serviceName string) error {
			restartedService = serviceName
			return nil
		},
	}

	if err := Update(opts); err != nil {
		t.Fatalf("Update with systemd service failed: %v", err)
	}

	if restartedService != "moul.service" {
		t.Errorf("Expected systemd service 'moul.service' to be restarted, got %q", restartedService)
	}
}

