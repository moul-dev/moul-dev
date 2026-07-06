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

	// Send WindowSizeMsg to initialize width, height and viewport
	mModel, _ := m.Update(tea.WindowSizeMsg{Width: 100, Height: 40})
	m = mModel.(*Model)

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

	// ── STEP 6: Sidebar Navigation ───────────────────────────────────
	update := func(msg tea.Msg) tea.Cmd {
		mModel, cmd = m.Update(msg)
		m = mModel.(*Model)
		_ = m.View()
		return cmd
	}

	m.ActiveSidebarIndex = 0
	_ = update(tea.KeyPressMsg{Text: "down"})
	if m.ActiveSidebarIndex != 1 {
		t.Fatalf("Expected ActiveSidebarIndex 1, got %d", m.ActiveSidebarIndex)
	}

	_ = update(tea.KeyPressMsg{Text: "down"})
	if m.ActiveSidebarIndex != 2 {
		t.Fatalf("Expected ActiveSidebarIndex 2, got %d", m.ActiveSidebarIndex)
	}

	_ = update(tea.KeyPressMsg{Text: "down"})
	if m.ActiveSidebarIndex != 3 {
		t.Fatalf("Expected ActiveSidebarIndex 3, got %d", m.ActiveSidebarIndex)
	}

	_ = update(tea.KeyPressMsg{Text: "down"})
	if m.ActiveSidebarIndex != 0 {
		t.Fatalf("Expected ActiveSidebarIndex to wrap to 0, got %d", m.ActiveSidebarIndex)
	}

	_ = update(tea.KeyPressMsg{Text: "up"})
	if m.ActiveSidebarIndex != 3 {
		t.Fatalf("Expected ActiveSidebarIndex to wrap to 3, got %d", m.ActiveSidebarIndex)
	}

	// ── STEP 7: Settings Configuration ───────────────────────────────
	// Currently at index 3 (Settings)
	cmd = update(tea.KeyPressMsg{Text: "enter"})
	if cmd == nil {
		t.Fatal("Expected fetchSettings command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(SettingsMsg); !ok {
		t.Fatalf("Expected SettingsMsg, got %T", msg)
	}
	_ = update(msg)

	if m.State != StateSettings {
		t.Fatalf("Expected state StateSettings, got %d", m.State)
	}

	// Toggle S3 storage enabled
	_ = update(tea.KeyPressMsg{Text: "down"}) // focus S3 Enabled (index 1)
	_ = update(tea.KeyPressMsg{Text: "enter"}) // toggle S3 Enabled to true

	// Set inputs
	m.settingFileS3Bucket = "e2e-bucket"
	m.settingFileS3Endpoint = "http://localhost:9000"
	m.settingFileS3Region = "us-east-1"
	m.settingFileS3AccessKey = "access"
	m.settingFileS3SecretKey = "secret"
	m.settingFileS3ForcePath = "true"
	m.initSettingsInputs()

	// Focus the Save button
	fields := m.getSettingsFields()
	m.settingsFocusIndex = len(fields) + 1 // Save button index

	// Save settings
	_ = update(tea.KeyPressMsg{Text: "enter"})

	if m.Err != nil {
		t.Fatalf("Failed to save settings: %v", m.Err)
	}
	if m.State != StateDashboard {
		t.Fatalf("Expected StateDashboard after saving settings, got %d", m.State)
	}

	// ── STEP 8: Records CRUD - Create ────────────────────────────────
	m.ActiveSidebarIndex = 0 // members collection
	cmd = update(tea.KeyPressMsg{Text: "enter"})
	if cmd == nil {
		t.Fatal("Expected fetchRecords command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(RecordsMsg); !ok {
		t.Fatalf("Expected RecordsMsg, got %T", msg)
	}
	_ = update(msg)
	if m.State != StateRecordList {
		t.Fatalf("Expected StateRecordList, got %d", m.State)
	}
	if len(m.Records) != 0 {
		t.Fatalf("Expected 0 records, got %d", len(m.Records))
	}

	// Press 'n' to create record
	_ = update(tea.KeyPressMsg{Text: "n"})
	if m.State != StateRecordEdit {
		t.Fatalf("Expected StateRecordEdit, got %d", m.State)
	}

	// Fill record form data
	usernameVal := "testuser"
	emailVal := "testuser@example.com"
	pwdVal := "Password123"
	pwdConfirmVal := "Password123"
	m.recordFormData["username"] = &usernameVal
	m.recordFormData["email"] = &emailVal
	m.recordFormData["password"] = &pwdVal
	m.recordFormData["passwordConfirm"] = &pwdConfirmVal

	m.RecordForm.State = huh.StateCompleted
	_ = update(tea.KeyPressMsg{})

	if m.Err != nil {
		t.Fatalf("Failed to save record: %v", m.Err)
	}
	if m.State != StateRecordList {
		t.Fatalf("Expected StateRecordList, got %d", m.State)
	}
	if len(m.Records) != 1 {
		t.Fatalf("Expected 1 record after save, got %d", len(m.Records))
	}

	// ── STEP 9: Records CRUD - Edit & View & Delete ──────────────────
	// Edit record
	_ = update(tea.KeyPressMsg{Text: "e"})
	if m.State != StateRecordEdit {
		t.Fatalf("Expected StateRecordEdit, got %d", m.State)
	}
	if m.editRecordID == "" {
		t.Fatal("Expected non-empty editRecordID")
	}

	*m.recordFormData["email"] = "updated@example.com"
	m.RecordForm.State = huh.StateCompleted
	_ = update(tea.KeyPressMsg{})

	if m.Err != nil {
		t.Fatalf("Failed to update record: %v", m.Err)
	}
	if m.State != StateRecordList {
		t.Fatalf("Expected StateRecordList, got %d", m.State)
	}
	if len(m.Records) != 1 {
		t.Fatalf("Expected 1 record, got %d", len(m.Records))
	}
	emailGot, _ := m.Records[0]["email"].(string)
	if emailGot != "updated@example.com" {
		t.Fatalf("Expected updated email 'updated@example.com', got %q", emailGot)
	}

	// View record details
	_ = update(tea.KeyPressMsg{Text: "v"})
	if m.State != StateRecordDetail {
		t.Fatalf("Expected StateRecordDetail, got %d", m.State)
	}
	if !strings.Contains(m.Viewport.View(), "updated@example.com") {
		t.Fatalf("Expected details viewport to contain email, got: %q", m.Viewport.View())
	}

	// Press esc to go back to list
	_ = update(tea.KeyPressMsg{Text: "esc"})
	if m.State != StateRecordList {
		t.Fatalf("Expected to return to StateRecordList, got %d", m.State)
	}

	// Delete record
	cmd = update(tea.KeyPressMsg{Text: "d"})
	if cmd == nil {
		t.Fatal("Expected delete record command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(recordDeletedMsg); !ok {
		t.Fatalf("Expected recordDeletedMsg, got %T", msg)
	}
	_ = update(msg)

	if m.State != StateRecordList {
		t.Fatalf("Expected StateRecordList, got %d", m.State)
	}
	if len(m.Records) != 0 {
		t.Fatalf("Expected 0 records after deletion, got %d", len(m.Records))
	}

	// Go back to Dashboard
	_ = update(tea.KeyPressMsg{Text: "esc"})
	if m.State != StateDashboard {
		t.Fatalf("Expected StateDashboard, got %d", m.State)
	}

	// ── STEP 10: System Background Worker Monitor ────────────────────
	m.ActiveSidebarIndex = 1 // Background Jobs
	cmd = update(tea.KeyPressMsg{Text: "enter"})
	if cmd == nil {
		t.Fatal("Expected fetchJobs command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(JobsMsg); !ok {
		t.Fatalf("Expected JobsMsg, got %T", msg)
	}
	_ = update(msg)
	if m.State != StateWorkerMonitor {
		t.Fatalf("Expected StateWorkerMonitor, got %d", m.State)
	}

	// Go back to Dashboard
	_ = update(tea.KeyPressMsg{Text: "esc"})
	if m.State != StateDashboard {
		t.Fatalf("Expected StateDashboard, got %d", m.State)
	}

	// ── STEP 11: Visitor Analytics ───────────────────────────────────
	m.ActiveSidebarIndex = 2 // Visitor Analytics
	cmd = update(tea.KeyPressMsg{Text: "enter"})
	if cmd == nil {
		t.Fatal("Expected fetchVisits command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(VisitsMsg); !ok {
		t.Fatalf("Expected VisitsMsg, got %T", msg)
	}
	_ = update(msg)
	if m.State != StateAnalytics {
		t.Fatalf("Expected StateAnalytics, got %d", m.State)
	}

	// Go back to Dashboard
	_ = update(tea.KeyPressMsg{Text: "esc"})
	if m.State != StateDashboard {
		t.Fatalf("Expected StateDashboard, got %d", m.State)
	}

	// ── STEP 12: Email Templates ─────────────────────────────────────
	m.ActiveSidebarIndex = 0 // members collection
	cmd = update(tea.KeyPressMsg{Text: "enter"})
	msg = cmd() // fetchRecords
	_ = update(msg)

	// Press tab to switch to templates
	cmd = update(tea.KeyPressMsg{Text: "tab"})
	if cmd == nil {
		t.Fatal("Expected fetchEmailTemplatesCmd command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(EmailTemplatesMsg); !ok {
		t.Fatalf("Expected EmailTemplatesMsg, got %T", msg)
	}
	_ = update(msg)
	if m.collectionActiveTab != 1 {
		t.Fatalf("Expected collectionActiveTab to be 1, got %d", m.collectionActiveTab)
	}

	// Move template selection down and up
	_ = update(tea.KeyPressMsg{Text: "down"})
	if m.selectedTemplateIndex != 1 {
		t.Fatalf("Expected selectedTemplateIndex 1, got %d", m.selectedTemplateIndex)
	}
	_ = update(tea.KeyPressMsg{Text: "up"})
	if m.selectedTemplateIndex != 0 {
		t.Fatalf("Expected selectedTemplateIndex 0, got %d", m.selectedTemplateIndex)
	}

	// Press 'e' to edit template
	_ = update(tea.KeyPressMsg{Text: "e"})
	if m.State != StateEmailTemplateEdit {
		t.Fatalf("Expected StateEmailTemplateEdit, got %d", m.State)
	}

	// Edit template values and submit
	m.tempSubject = "New Verify Subject"
	m.tempBody = "New Verify Body"
	m.EmailTemplateForm.State = huh.StateCompleted
	_ = update(tea.KeyPressMsg{})
	if cmd == nil {
		t.Fatal("Expected saveEmailTemplateForm command, got nil")
	}
	msg = cmd()
	if _, ok := msg.(emailTemplatesSavedMsg); !ok {
		t.Fatalf("Expected emailTemplatesSavedMsg, got %T", msg)
	}
	_ = update(msg)
	if m.State != StateRecordList {
		t.Fatalf("Expected to return to StateRecordList, got %d", m.State)
	}
	if !strings.Contains(m.SuccessMsg, "updated successfully") {
		t.Fatalf("Expected success message, got %q", m.SuccessMsg)
	}
}
