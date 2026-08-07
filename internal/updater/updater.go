package updater

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// Options defines configuration parameters for the self-updater.
type Options struct {
	RepoOwner      string                           // GitHub owner/org, defaults to "moul-dev"
	RepoName       string                           // GitHub repo name, defaults to "moul-dev"
	AppName        string                           // Executable name: "moul-dev" or "moul"
	CurrentVer     string                           // Current version string (e.g. "v2026.07" or "dev")
	Force          bool                             // Force update even if version matches
	SystemdService string                           // Optional systemd service name to restart after binary update
	ExecPath       string                           // Optional override for target executable path (used in tests)
	HTTPClient     *http.Client                     // Optional custom HTTP client
	SystemctlExec  func(serviceName string) error   // Optional custom systemctl executor (used in tests)
}

// ReleaseInfo models the GitHub release API payload.
type ReleaseInfo struct {
	TagName string  `json:"tag_name"`
	HTMLURL string  `json:"html_url"`
	Assets  []Asset `json:"assets"`
}

// Asset models individual GitHub release asset metadata.
type Asset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
}

// Update checks GitHub releases and updates the running binary if a newer version is available.
func Update(opts Options) error {
	if opts.RepoOwner == "" {
		opts.RepoOwner = "moul-dev"
	}
	if opts.RepoName == "" {
		opts.RepoName = "moul-dev"
	}
	if opts.AppName == "" {
		return fmt.Errorf("AppName is required for updater")
	}
	client := opts.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: 60 * time.Second}
	}

	// 1. Fetch latest release info from GitHub API
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", opts.RepoOwner, opts.RepoName)
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "moul-updater")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to check latest release: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to check latest release (HTTP %d)", resp.StatusCode)
	}

	var release ReleaseInfo
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return fmt.Errorf("failed to parse release info: %w", err)
	}

	latestTag := release.TagName
	if latestTag == "" {
		return fmt.Errorf("latest release has no tag_name")
	}

	// 2. Check if update is needed
	if !opts.Force && opts.CurrentVer != "dev" &&
		(opts.CurrentVer == latestTag || strings.TrimPrefix(opts.CurrentVer, "v") == strings.TrimPrefix(latestTag, "v")) {
		fmt.Printf("%s is already up to date (%s)\n", opts.AppName, opts.CurrentVer)
		return nil
	}

	if opts.CurrentVer == "dev" {
		fmt.Printf("Current %s version is 'dev'. Updating to latest release %s...\n", opts.AppName, latestTag)
	} else {
		fmt.Printf("Updating %s from %s to %s...\n", opts.AppName, opts.CurrentVer, latestTag)
	}

	// 3. Locate release asset URL
	targetAssetName := fmt.Sprintf("%s_%s_%s_%s.tar.gz", opts.AppName, latestTag, runtime.GOOS, runtime.GOARCH)
	var downloadURL string
	for _, asset := range release.Assets {
		if asset.Name == targetAssetName {
			downloadURL = asset.BrowserDownloadURL
			break
		}
	}
	if downloadURL == "" {
		downloadURL = fmt.Sprintf("https://github.com/%s/%s/releases/download/%s/%s",
			opts.RepoOwner, opts.RepoName, latestTag, targetAssetName)
	}

	// 4. Download release asset tarball
	fmt.Printf("Downloading %s...\n", targetAssetName)
	dlReq, err := http.NewRequest("GET", downloadURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create download request: %w", err)
	}
	dlReq.Header.Set("User-Agent", "moul-updater")

	dlResp, err := client.Do(dlReq)
	if err != nil {
		return fmt.Errorf("failed to download release asset: %w", err)
	}
	defer dlResp.Body.Close()

	if dlResp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download release asset %s (HTTP %d)", targetAssetName, dlResp.StatusCode)
	}

	// 5. Extract binary from .tar.gz
	gzr, err := gzip.NewReader(dlResp.Body)
	if err != nil {
		return fmt.Errorf("failed to decompress gzip archive: %w", err)
	}
	defer gzr.Close()

	tr := tar.NewReader(gzr)
	var binaryBytes []byte
	expectedBinary := opts.AppName
	expectedBinaryWin := opts.AppName + ".exe"

	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("error reading archive tar header: %w", err)
		}

		baseName := filepath.Base(hdr.Name)
		if baseName == expectedBinary || baseName == expectedBinaryWin {
			content, err := io.ReadAll(tr)
			if err != nil {
				return fmt.Errorf("failed to extract binary contents: %w", err)
			}
			binaryBytes = content
			break
		}
	}

	if len(binaryBytes) == 0 {
		return fmt.Errorf("binary '%s' not found inside archive '%s'", opts.AppName, targetAssetName)
	}

	// 6. Determine target executable path
	targetPath := opts.ExecPath
	if targetPath == "" {
		execPath, err := os.Executable()
		if err != nil {
			return fmt.Errorf("failed to determine executable path: %w", err)
		}
		realPath, err := filepath.EvalSymlinks(execPath)
		if err != nil {
			targetPath = execPath
		} else {
			targetPath = realPath
		}
	}

	// 7. Atomically replace target executable
	dir := filepath.Dir(targetPath)
	tmpFile, err := os.CreateTemp(dir, opts.AppName+"-update-*.tmp")
	if err != nil {
		return fmt.Errorf("failed to create temp file in %s: %w", dir, err)
	}
	tmpName := tmpFile.Name()

	if _, err := tmpFile.Write(binaryBytes); err != nil {
		tmpFile.Close()
		os.Remove(tmpName)
		return fmt.Errorf("failed to write binary update to temp file: %w", err)
	}

	if err := tmpFile.Chmod(0755); err != nil {
		tmpFile.Close()
		os.Remove(tmpName)
		return fmt.Errorf("failed to set execution permissions on temp file: %w", err)
	}
	tmpFile.Close()

	if err := os.Rename(tmpName, targetPath); err != nil {
		os.Remove(tmpName)
		if os.IsPermission(err) || strings.Contains(strings.ToLower(err.Error()), "permission denied") {
			return fmt.Errorf("permission denied updating %s (try running with sudo)", targetPath)
		}
		return fmt.Errorf("failed to replace binary %s: %w", targetPath, err)
	}

	fmt.Printf("Successfully updated %s to %s!\n", opts.AppName, latestTag)

	if opts.SystemdService != "" {
		serviceName := opts.SystemdService
		if serviceName == "true" {
			serviceName = "moul"
		}
		fmt.Printf("Restarting systemd service '%s'...\n", serviceName)
		var err error
		if opts.SystemctlExec != nil {
			err = opts.SystemctlExec(serviceName)
		} else {
			err = restartSystemdService(serviceName)
		}
		if err != nil {
			return fmt.Errorf("failed to restart systemd service '%s': %w", serviceName, err)
		}
		fmt.Printf("Successfully restarted systemd service '%s'.\n", serviceName)
	}

	return nil
}

func restartSystemdService(serviceName string) error {
	path, err := exec.LookPath("systemctl")
	if err != nil {
		return fmt.Errorf("systemctl command not found: %w", err)
	}
	cmd := exec.Command(path, "restart", serviceName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		outStr := strings.TrimSpace(string(output))
		if outStr != "" {
			return fmt.Errorf("systemctl restart %s failed: %s (%w)", serviceName, outStr, err)
		}
		return fmt.Errorf("systemctl restart %s failed: %w", serviceName, err)
	}
	return nil
}

