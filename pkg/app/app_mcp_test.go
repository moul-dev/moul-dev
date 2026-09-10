package app

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

func TestAppMCPServerInitialization(t *testing.T) {
	jwtSecret := "test-jwt-secret-key-32-bytes-minimum!!"
	adminKey := "test-admin-key-1234"
	envy.Set("MOUL_JWT_SECRET", jwtSecret)
	envy.Set("MOUL_ADMIN_KEY", adminKey)

	a := New(Config{
		DBPath:    ":memory:",
		Env:       "test",
		Version:   "1.2.3-test",
		JWTSecret: jwtSecret,
		AdminKey:  adminKey,
	})

	a.RegisterWorker("CustomTestWorker", func(ctx context.Context, job *worker.Job) error {
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	mcpSrv := a.MCPServer()
	if mcpSrv == nil {
		t.Fatal("Expected MCPServer() to be non-nil after Bootstrap")
	}

	if mcpSrv.MCPServer() == nil {
		t.Fatal("Expected underlying mcp-go server to be non-nil")
	}

	// Verify worker engine in App has custom worker
	if a.WorkerEngine() == nil {
		t.Fatal("Expected WorkerEngine to be non-nil")
	}
	if _, ok := a.WorkerEngine().GetHandler("CustomTestWorker"); !ok {
		t.Fatal("Expected CustomTestWorker to be registered in worker engine")
	}
}

func TestAppIsMCPDetection(t *testing.T) {
	// 1. Default (no env or args)
	origArgs := os.Args
	defer func() {
		os.Args = origArgs
		envy.Set("MOUL_MCP", "")
		envy.Set("MCP", "")
	}()

	os.Args = []string{"myapp"}
	envy.Set("MOUL_MCP", "")
	envy.Set("MCP", "")
	if IsMCP() {
		t.Error("Expected IsMCP() to be false by default")
	}

	// 2. Arg "mcp"
	os.Args = []string{"myapp", "mcp"}
	if !IsMCP() {
		t.Error("Expected IsMCP() to be true when 'mcp' argument is provided")
	}

	// 3. Arg "--mcp"
	os.Args = []string{"myapp", "--mcp"}
	if !IsMCP() {
		t.Error("Expected IsMCP() to be true when '--mcp' flag is provided")
	}

	// 4. Arg with options
	os.Args = []string{"myapp", "--db=:memory:", "mcp"}
	if !IsMCP() {
		t.Error("Expected IsMCP() to be true when 'mcp' is passed after flags")
	}

	// 5. Env var MOUL_MCP
	os.Args = []string{"myapp"}
	envy.Set("MOUL_MCP", "true")
	if !IsMCP() {
		t.Error("Expected IsMCP() to be true when MOUL_MCP=true")
	}

	// 6. Instance method
	a := New(Config{})
	if !a.IsMCP() {
		t.Error("Expected a.IsMCP() to match IsMCP()")
	}
}

func TestAppServeMCPStdio(t *testing.T) {
	// Create pipe to simulate stdin and stdout
	inR, inW, err := os.Pipe()
	if err != nil {
		t.Fatalf("Failed to create stdin pipe: %v", err)
	}
	outR, outW, err := os.Pipe()
	if err != nil {
		t.Fatalf("Failed to create stdout pipe: %v", err)
	}

	origStdin := os.Stdin
	origStdout := os.Stdout
	os.Stdin = inR
	os.Stdout = outW

	defer func() {
		os.Stdin = origStdin
		os.Stdout = origStdout
		_ = inR.Close()
		_ = outR.Close()
	}()

	a := New(Config{
		DBPath:  ":memory:",
		Version: "test-mcp-v1",
	})

	a.RegisterWorker("CustomTestWorker", func(ctx context.Context, job *worker.Job) error {
		return nil
	})

	serveErrChan := make(chan error, 1)
	go func() {
		serveErrChan <- a.ServeMCP(context.Background())
	}()

	// Send initialize JSON-RPC request
	initReq := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}` + "\n"
	if _, err := inW.Write([]byte(initReq)); err != nil {
		t.Fatalf("Failed to write to stdin pipe: %v", err)
	}

	// Read response
	buf := make([]byte, 2048)
	doneChan := make(chan int, 1)
	go func() {
		n, _ := outR.Read(buf)
		doneChan <- n
	}()

	select {
	case n := <-doneChan:
		respStr := string(buf[:n])
		if !strings.Contains(respStr, `"result"`) || !strings.Contains(respStr, `"test-mcp-v1"`) {
			t.Fatalf("Expected valid JSON-RPC initialization response, got: %s", respStr)
		}
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(strings.TrimSpace(respStr)), &parsed); err != nil {
			t.Fatalf("Expected response to be valid JSON, got error: %v, raw: %s", err, respStr)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("Timed out waiting for MCP stdio response")
	}

	// Close stdin pipe to trigger clean shutdown of ServeStdio
	_ = inW.Close()

	select {
	case err := <-serveErrChan:
		if err != nil && err != io.EOF {
			t.Logf("ServeMCP finished with: %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Log("ServeMCP did not terminate immediately after stdin close")
	}
}

func TestAppCLIDispatch(t *testing.T) {
	origArgs := os.Args
	defer func() {
		os.Args = origArgs
	}()

	a := New(Config{
		DBPath:  ":memory:",
		Version: "test-version-cli",
	})

	// 1. Version flag
	os.Args = []string{"myapp", "-v"}
	cmd, handled, err := a.dispatchCLI(context.Background())
	if err != nil {
		t.Fatalf("dispatchCLI failed for -v: %v", err)
	}
	if !handled || cmd != "-v" {
		t.Errorf("Expected -v to be handled, got cmd=%s, handled=%v", cmd, handled)
	}

	// 2. Help flag
	os.Args = []string{"myapp", "--help"}
	cmd, handled, err = a.dispatchCLI(context.Background())
	if err != nil {
		t.Fatalf("dispatchCLI failed for --help: %v", err)
	}
	if !handled || cmd != "--help" {
		t.Errorf("Expected --help to be handled, got cmd=%s, handled=%v", cmd, handled)
	}

	// 3. Start command (not handled by dispatchCLI so StartServer can run)
	os.Args = []string{"myapp", "start"}
	cmd, handled, err = a.dispatchCLI(context.Background())
	if err != nil {
		t.Fatalf("dispatchCLI failed for start: %v", err)
	}
	if handled || cmd != "start" {
		t.Errorf("Expected start to be unhandled (deferred to server), got cmd=%s, handled=%v", cmd, handled)
	}
}

func TestPrintUsageOutput(t *testing.T) {
	var buf bytes.Buffer
	PrintUsage(&buf)
	out := buf.String()
	if !strings.Contains(out, "mcp") {
		t.Errorf("Expected usage to mention 'mcp'")
	}
	if !strings.Contains(out, "worker") {
		t.Errorf("Expected usage to mention 'worker'")
	}
	if !strings.Contains(out, "typegen") {
		t.Errorf("Expected usage to mention 'typegen'")
	}
}
