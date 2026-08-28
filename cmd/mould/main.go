package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gobuffalo/envy"

	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/moul-dev/moul-dev/internal/seed"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/typegen"
	"github.com/moul-dev/moul-dev/internal/updater"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/moul-dev/moul-dev/pkg/app"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func printUsage() {
	fmt.Println("Usage: mould [command] [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  start       Start the mould engine server (default)")
	fmt.Println("  seed        Seed database with realistic collections, demo records, and feature flags")
	fmt.Println("  typegen     Generate TypeScript type definitions from collection schemas")
	fmt.Println("  test-rule   Test and validate a rule expression against mock record/auth context")
	fmt.Println("  worker      Manage background worker jobs (retry failed jobs, list DLQ)")
	fmt.Println("  mcp         Start built-in MCP server in stdio transport mode")
	fmt.Println("  restore     Restore database from Litestream S3 backup")
	fmt.Println("  update      Update mould binary to the latest release")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  --db [path]                    Specify SQLite database path (default: MOUL_DB_PATH or moul-local.db)")
	fmt.Println("  --out [file]                   Output file path for typegen (default: stdout)")
	fmt.Println("  --rule [expr]                  Rule expression string to test (for test-rule)")
	fmt.Println("  --record [json]                Record payload JSON (for test-rule)")
	fmt.Println("  --auth [json]                  Auth payload JSON (for test-rule)")
	fmt.Println("  -f, --force                    Force update even if already at latest version")
	fmt.Println("  -s, --service, --systemd [name] Restart systemd service after update (default: mould)")
	fmt.Println("  -v, --version, version         Print version information and exit")
	fmt.Println("  -h, --help, help               Show help and usage instructions")
}

func main() {
	cmd := "start"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}

	switch cmd {
	case "start":
		runStart()
	case "seed":
		runSeed()
	case "typegen", "gen-types":
		runTypegen()
	case "test-rule", "rule-test":
		runTestRule()
	case "worker":
		runWorkerCmd()
	case "mcp":
		runMCP()
	case "restore":
		runRestore()
	case "update", "-u", "-update", "--update":
		runUpdate()
	case "-v", "-version", "--version", "version":
		fmt.Printf("mould version %s\n", Version)
	case "-h", "-help", "--help", "help":
		printUsage()
	default:
		fmt.Printf("Unknown command: %s\n\n", cmd)
		printUsage()
		os.Exit(1)
	}
}

func getDBPath() string {
	for i, arg := range os.Args {
		if arg == "--db" && i+1 < len(os.Args) {
			return os.Args[i+1]
		}
		if strings.HasPrefix(arg, "--db=") {
			return strings.TrimPrefix(arg, "--db=")
		}
	}
	return envy.Get("MOUL_DB_PATH", "moul-local.db")
}

func runSeed() {
	dbPath := getDBPath()
	fmt.Printf("Seeding database at: %s...\n", dbPath)

	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	if err := seed.Seed(dbConn); err != nil {
		fmt.Fprintf(os.Stderr, "Seeding failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Successfully seeded database with demo collections, records, and feature flags!")
}

func runTypegen() {
	dbPath := getDBPath()
	outFile := ""

	for i, arg := range os.Args {
		if arg == "--out" && i+1 < len(os.Args) {
			outFile = os.Args[i+1]
		}
		if strings.HasPrefix(arg, "--out=") {
			outFile = strings.TrimPrefix(arg, "--out=")
		}
	}

	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	tsCode, err := typegen.GenerateFromDB(dbConn)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Type generation failed: %v\n", err)
		os.Exit(1)
	}

	if outFile != "" {
		if err := os.WriteFile(outFile, []byte(tsCode), 0644); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to write output to %s: %v\n", outFile, err)
			os.Exit(1)
		}
		fmt.Printf("Successfully generated TypeScript types to %s\n", outFile)
	} else {
		fmt.Print(tsCode)
	}
}

func runTestRule() {
	ruleStr := ""
	recordJSON := "{}"
	authJSON := "{}"

	for i, arg := range os.Args {
		if arg == "--rule" && i+1 < len(os.Args) {
			ruleStr = os.Args[i+1]
		} else if strings.HasPrefix(arg, "--rule=") {
			ruleStr = strings.TrimPrefix(arg, "--rule=")
		} else if arg == "--record" && i+1 < len(os.Args) {
			recordJSON = os.Args[i+1]
		} else if strings.HasPrefix(arg, "--record=") {
			recordJSON = strings.TrimPrefix(arg, "--record=")
		} else if arg == "--auth" && i+1 < len(os.Args) {
			authJSON = os.Args[i+1]
		} else if strings.HasPrefix(arg, "--auth=") {
			authJSON = strings.TrimPrefix(arg, "--auth=")
		}
	}

	if ruleStr == "" {
		fmt.Println("Error: --rule expression is required.")
		fmt.Println("Example: mould test-rule --rule=\"author_id = @request.auth.id\" --record='{\"author_id\": \"u1\"}' --auth='{\"id\": \"u1\"}'")
		os.Exit(1)
	}

	var recordData map[string]interface{}
	_ = json.Unmarshal([]byte(recordJSON), &recordData)

	var authData map[string]interface{}
	_ = json.Unmarshal([]byte(authJSON), &authData)

	dbPath := getDBPath()
	dbConn, _ := db.InitDB(dbPath)
	if dbConn != nil {
		defer dbConn.Close()
	}

	start := time.Now()
	translated, _, err := rules.Translate(ruleStr)
	if err != nil {
		fmt.Printf("Translation Syntax Error: %v\n", err)
		os.Exit(1)
	}

	matched, evalErr := rules.EvaluateRule(dbConn, ruleStr, authData, recordData)
	dur := time.Since(start)

	fmt.Println("=== Rule Evaluation Result ===")
	fmt.Printf("Input Rule:   %s\n", ruleStr)
	fmt.Printf("Translated:   %s\n", translated)
	fmt.Printf("Duration:     %v\n", dur)
	if evalErr != nil {
		fmt.Printf("Status:       FAILED\n")
		fmt.Printf("Error:        %v\n", evalErr)
		os.Exit(1)
	} else {
		fmt.Printf("Status:       SUCCESS\n")
		fmt.Printf("Matched:      %t\n", matched)
	}
}

func runWorkerCmd() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: mould worker [retry|list-failed] [table_name] [optional: job_id]")
		os.Exit(1)
	}

	subCmd := os.Args[2]
	tableName := "tasks_queue"
	if len(os.Args) > 3 && !strings.HasPrefix(os.Args[3], "-") {
		tableName = os.Args[3]
	}

	dbPath := getDBPath()
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	engine := worker.NewEngine(dbConn)

	switch subCmd {
	case "retry":
		var jobIDs []string
		if len(os.Args) > 4 {
			jobIDs = append(jobIDs, os.Args[4])
		}
		affected, err := engine.RetryFailedJobs(tableName, jobIDs...)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to retry jobs in %s: %v\n", tableName, err)
			os.Exit(1)
		}
		fmt.Printf("Successfully retried %d failed/discarded jobs in %s.\n", affected, tableName)

	case "list-failed", "dlq":
		jobs, err := engine.ListDiscardedJobs(tableName, 50)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to list discarded jobs: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Found %d discarded jobs in %s:\n\n", len(jobs), tableName)
		for _, j := range jobs {
			fmt.Printf("• ID: %s | Worker: %s | Attempts: %d/%d | Inserted: %s\n", j.ID, j.Worker, j.Attempt, j.MaxAttempts, j.InsertedAt)
			if len(j.Errors) > 0 {
				fmt.Printf("  Last Error: %s\n", j.Errors[len(j.Errors)-1])
			}
		}
	default:
		fmt.Printf("Unknown worker sub-command: %s\n", subCmd)
		os.Exit(1)
	}
}

func runMCP() {
	dbPath := getDBPath()
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	sysmonCollector := sysmon.NewCollector()

	srv := moulmcp.NewServer(dbConn, nil, nil, sysmonCollector, Version)
	if err := srv.ServeStdio(); err != nil {
		fmt.Fprintf(os.Stderr, "MCP server error: %v\n", err)
		os.Exit(1)
	}
}

func parseUpdateArgs(args []string) (force bool, systemdService string) {
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "-f" || arg == "--force":
			force = true
		case arg == "-s" || arg == "--service" || arg == "--systemd" || arg == "--systemd-service":
			if i+1 < len(args) && !strings.HasPrefix(args[i+1], "-") {
				systemdService = args[i+1]
				i++
			} else {
				systemdService = "mould"
			}
		case strings.HasPrefix(arg, "--service=") || strings.HasPrefix(arg, "--systemd=") || strings.HasPrefix(arg, "--systemd-service=") || strings.HasPrefix(arg, "-s="):
			parts := strings.SplitN(arg, "=", 2)
			if len(parts) == 2 && parts[1] != "" {
				systemdService = parts[1]
			} else {
				systemdService = "mould"
			}
		}
	}
	return
}

func runUpdate() {
	args := os.Args[1:]
	if len(args) > 0 && (args[0] == "update" || args[0] == "-u" || args[0] == "-update" || args[0] == "--update") {
		args = args[1:]
	}
	force, systemdService := parseUpdateArgs(args)

	opts := updater.Options{
		AppName:        "mould",
		CurrentVer:     Version,
		Force:          force,
		SystemdService: systemdService,
	}

	if err := updater.Update(opts); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating mould: %v\n", err)
		os.Exit(1)
	}
}

func runRestore() {
	dbPath := getDBPath()
	logger.Info("Attempting Litestream S3 database restore", "path", dbPath)
	if err := backup.RestoreFromS3(context.Background(), dbPath); err != nil {
		logger.Fatal("Litestream restore failed", "err", err)
	}
	logger.Info("Restore operation completed successfully")
}

func runStart() {
	mouldApp := app.New(app.Config{
		Version: Version,
	})

	if err := mouldApp.Start(context.Background()); err != nil {
		logger.Fatal("Server failed to run", "err", err)
	}
}
