package worker_test

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"
)

func TestExternalModuleCompilation(t *testing.T) {
	// Find absolute repository root
	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	// wd is <repo>/pkg/worker, so repoRoot is ../..
	repoRoot, err := filepath.Abs(filepath.Join(wd, "..", ".."))
	if err != nil {
		t.Fatalf("Failed to determine repo root: %v", err)
	}

	tempDir := t.TempDir()

	// 1. Write go.mod for external mock module
	goModContent := fmt.Sprintf(`module example.com/mockworkerapp

go 1.24

require github.com/moul-dev/moul-dev v0.0.0

replace github.com/moul-dev/moul-dev => %s
`, repoRoot)

	if err := os.WriteFile(filepath.Join(tempDir, "go.mod"), []byte(goModContent), 0644); err != nil {
		t.Fatalf("Failed to write mock go.mod: %v", err)
	}

	// 2. Write mock main.go using only public packages and aliases
	mainGoContent := `package main

import (
	"context"
	"log/slog"

	"github.com/moul-dev/moul-dev/pkg/app"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

func main() {
	moulApp := app.New(app.Config{
		Version: "1.0.0-test",
	})

	// Register with pkg/worker.Job
	moulApp.RegisterWorker("WorkerOne", func(ctx context.Context, job *worker.Job) error {
		slog.Info("Executed worker one", "id", job.ID)
		return nil
	})

	// Register with app.Job type alias
	moulApp.RegisterWorker("WorkerTwo", func(ctx context.Context, job *app.Job) error {
		slog.Info("Executed worker two", "id", job.ID)
		return nil
	})

	// Register via OnWorkerInit hook
	moulApp.OnWorkerInit(func(engine *worker.Engine) error {
		engine.Register("WorkerThree", func(ctx context.Context, job *worker.Job) error {
			return nil
		})
		return nil
	})

	_ = moulApp
}
`

	if err := os.WriteFile(filepath.Join(tempDir, "main.go"), []byte(mainGoContent), 0644); err != nil {
		t.Fatalf("Failed to write mock main.go: %v", err)
	}

	// 3. Run go mod tidy in mock module
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	tidyCmd := exec.CommandContext(ctx, "go", "mod", "tidy")
	tidyCmd.Dir = tempDir
	tidyCmd.Env = append(os.Environ(), "CGO_ENABLED=1")
	if tidyOut, err := tidyCmd.CombinedOutput(); err != nil {
		t.Fatalf("go mod tidy failed:\n%s\nError: %v", string(tidyOut), err)
	}

	// 4. Compile mock external application
	cmd := exec.CommandContext(ctx, "go", "build", "-o", filepath.Join(tempDir, "mockworkerapp"))
	cmd.Dir = tempDir
	cmd.Env = append(os.Environ(), "CGO_ENABLED=1")

	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("External module compilation failed (internal package constraint violated?):\n%s\nError: %v", string(output), err)
	}
}
