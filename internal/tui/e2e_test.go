package tui

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"charm.land/huh/v2"
	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/worker"
)

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}

func TestTUIE2E(t *testing.T) {
	// Set test environment variable to bypass persistent file/keychain writes
	os.Setenv("MOUL_TEST_ENV", "true")
	defer os.Unsetenv("MOUL_TEST_ENV")

	artifactDir := os.Getenv("MOUL_TEST_ARTIFACT_DIR")
	if artifactDir != "" {
		_ = os.MkdirAll(artifactDir, 0755)
		logFilePath := filepath.Join(artifactDir, "test-server.log")
		logFile, err := os.Create(logFilePath)
		if err == nil {
			mw := io.MultiWriter(os.Stderr, logFile)
			logger.Default.SetOutput(mw)
			defer func() {
				logger.Default.SetOutput(os.Stderr)
				logFile.Close()
			}()
		}
	}

	dbPath := "moul-test.db"
	// Clean up any old database files
	os.Remove(dbPath)
	os.Remove(dbPath + "-shm")
	os.Remove(dbPath + "-wal")

	// 1. Initialize SQLite Database
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}

	defer func() {
		// Close DB connection before copying
		dbConn.Close()

		if artifactDir != "" {
			_ = copyFile(dbPath, filepath.Join(artifactDir, "moul-test.db"))
			if _, err := os.Stat(dbPath + "-shm"); err == nil {
				_ = copyFile(dbPath+"-shm", filepath.Join(artifactDir, "moul-test.db-shm"))
			}
			if _, err := os.Stat(dbPath + "-wal"); err == nil {
				_ = copyFile(dbPath+"-wal", filepath.Join(artifactDir, "moul-test.db-wal"))
			}
		}

		os.Remove(dbPath)
		os.Remove(dbPath + "-shm")
		os.Remove(dbPath + "-wal")
	}()

	// 2. Initialize Engines
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	workerEngine := worker.NewEngine(dbConn)
	workerEngine.Start(ctx)
	defer workerEngine.Stop()

	analyticsEngine, err := analytics.NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("Failed to initialize analytics engine: %v", err)
	}
	defer analyticsEngine.Close()
	analyticsEngine.StartFlusher(ctx)

	// 3. Initialize Router and httptest server
	adminKey := "e2e-test-admin-key"
	auth.InitJWT("e2e-test-jwt-secret-key-123456789")

	e := handlers.NewRouter(dbConn, workerEngine, analyticsEngine, adminKey, true)
	ts := httptest.NewServer(e)
	defer ts.Close()

	// 4. Start TUI Model E2E Flow
	m := NewModel("", "")
	if m.State != StateConnect {
		t.Fatalf("Expected initial state StateConnect, got %d", m.State)
	}

	// ── STEP 1: Connect Form ─────────────────────────────────────────
	m.serverURL = ts.URL
	m.adminKey = adminKey
	m.ConnForm.State = huh.StateCompleted

	// Send keypress message to trigger update handler
	mModel, cmd := m.Update(tea.KeyPressMsg{})
	m = mModel.(*Model)

	if cmd == nil {
		t.Fatal("Expected checkSetupStatusCmd command, got nil")
	}

	// Execute checkSetupStatusCmd synchronously
	msg := cmd()
	if _, ok := msg.(setupStatusMsg); !ok {
		t.Fatalf("Expected setupStatusMsg, got %T", msg)
	}

	// Pass message to update
	mModel, cmd = m.Update(msg)
	m = mModel.(*Model)

	// TUI should verify setup status and transition to StateRootSetup
	if m.State != StateRootSetup {
		t.Fatalf("Expected state StateRootSetup, got %d", m.State)
	}

	// ── STEP 2: Root Setup Form ──────────────────────────────────────
	m.rootUsername = "admin"
	m.rootEmail = "admin@example.com"
	m.rootPassword = "password123"
	m.rootConfirmPass = "password123"
	m.RootSetupForm.State = huh.StateCompleted

	mModel, cmd = m.Update(tea.KeyPressMsg{})
	m = mModel.(*Model)

	if cmd == nil {
		t.Fatal("Expected setupRootUserCmd command, got nil")
	}

	// Execute setupRootUserCmd synchronously
	msg = cmd()
	if _, ok := msg.(setupRootUserResultMsg); !ok {
		t.Fatalf("Expected setupRootUserResultMsg, got %T", msg)
	}

	// Pass message to update
	mModel, cmd = m.Update(msg)
	m = mModel.(*Model)

	if cmd == nil {
		t.Fatal("Expected startDeviceFlowCmd command, got nil")
	}

	// Execute startDeviceFlowCmd synchronously
	msg = cmd()
	if _, ok := msg.(deviceFlowStartMsg); !ok {
		t.Fatalf("Expected deviceFlowStartMsg, got %T", msg)
	}

	// Pass message to update
	mModel, cmd = m.Update(msg)
	m = mModel.(*Model)

	// TUI should now be in StateDeviceAuth waiting for browser approval
	if m.State != StateDeviceAuth {
		t.Fatalf("Expected state StateDeviceAuth, got %d", m.State)
	}
	if m.userCode == "" {
		t.Fatal("Expected non-empty userCode in device flow")
	}

	// ── STEP 3: Out-of-band Device Approval ──────────────────────────
	resp, err := http.PostForm(ts.URL+"/device/verify", url.Values{
		"user_code": {m.userCode},
		"identity":  {"admin"},
		"password":  {"password123"},
	})
	if err != nil {
		t.Fatalf("Failed to verify/approve device flow: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK approving device, got %d", resp.StatusCode)
	}

	// ── STEP 4: Device Flow Polling ──────────────────────────────────
	// Send tick to poll the token
	mModel, cmd = m.Update(devicePollTickMsg{})
	m = mModel.(*Model)

	if cmd == nil {
		t.Fatal("Expected poll command, got nil")
	}

	// Execute poll command
	msg = cmd()
	if _, ok := msg.(devicePollResultMsg); !ok {
		t.Fatalf("Expected devicePollResultMsg, got %T", msg)
	}

	// Pass token result to update
	mModel, cmd = m.Update(msg)
	m = mModel.(*Model)

	if cmd == nil {
		t.Fatal("Expected connectCmd command, got nil")
	}

	// Execute connectCmd to fetch dashboard collections
	msg = cmd()
	if _, ok := msg.(connectResultMsg); !ok {
		t.Fatalf("Expected connectResultMsg, got %T", msg)
	}

	// Pass connectResultMsg to update
	mModel, cmd = m.Update(msg)
	m = mModel.(*Model)

	// TUI should now transition to StateDashboard
	if m.State != StateDashboard {
		t.Fatalf("Expected StateDashboard, got %d", m.State)
	}

	// Verify we are initialized (we start with 0 user collections on a fresh database)
	if len(m.Mouls) != 0 {
		t.Fatalf("Expected 0 collections initially, got %d", len(m.Mouls))
	}

	// ── STEP 5: Create Auth Collection via Wizard ────────────────────
	// Press 'n' to open collection wizard
	mModel, cmd = m.Update(tea.KeyPressMsg{Text: "n"})
	m = mModel.(*Model)

	if m.State != StateMoulCreate {
		t.Fatalf("Expected StateMoulCreate, got %d", m.State)
	}
	if m.moulWizardState != "metadata" {
		t.Fatalf("Expected wizard state 'metadata', got %s", m.moulWizardState)
	}

	// Fill collection name and type
	m.newMoulName = "members"
	m.newMoulType = "auth"
	m.MoulForm.State = huh.StateCompleted

	// Send keypress to submit metadata
	mModel, cmd = m.Update(tea.KeyPressMsg{})
	m = mModel.(*Model)

	if m.moulWizardState != "fields" {
		t.Fatalf("Expected wizard state 'fields', got %s", m.moulWizardState)
	}

	// Choose 'save' action to finalize the collection
	m.newMoulAction = "save"
	m.MoulActionForm.State = huh.StateCompleted

	// Send keypress to submit action
	mModel, cmd = m.Update(tea.KeyPressMsg{})
	m = mModel.(*Model)

	if cmd == nil {
		t.Fatal("Expected saveMoulForm command, got nil")
	}

	// Execute saveMoulForm command
	msg = cmd()
	if _, ok := msg.(createMoulResultMsg); !ok {
		t.Fatalf("Expected createMoulResultMsg, got %T", msg)
	}

	// Pass result to update
	mModel, cmd = m.Update(msg)
	m = mModel.(*Model)

	// Verify TUI went back to dashboard and success message is displayed
	if m.State != StateDashboard {
		t.Fatalf("Expected to return to StateDashboard after saving, got %d", m.State)
	}
	if !strings.Contains(m.SuccessMsg, "successfully") {
		t.Fatalf("Expected success message, got %q", m.SuccessMsg)
	}

	// Verify that the new collection "members" exists in the models slice
	found := false
	for _, moul := range m.Mouls {
		if moul.Name == "members" && moul.Type == "auth" {
			found = true
			break
		}
	}
	if !found {
		t.Fatal("Created collection 'members' was not found in TUI model slice")
	}
}
