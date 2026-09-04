package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/gobuffalo/envy"

	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/dataio"
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
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func printUsage() {
	fmt.Println("Usage: moul [command] [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  start       Start the moul engine server (default)")
	fmt.Println("  ctl         Launch the moul-ctl management TUI")
	fmt.Println("  seed        Seed database with realistic collections, demo records, and feature flags")
	fmt.Println("  typegen     Generate TypeScript type definitions from collection schemas")
	fmt.Println("  test-rule   Test and validate a rule expression against mock record/auth context")
	fmt.Println("  worker      Manage background worker jobs (retry failed jobs, list DLQ)")
	fmt.Println("  mcp         Start built-in MCP server in stdio transport mode")
	fmt.Println("  export      Export collection records to CSV or JSON file")
	fmt.Println("  import      Import records into collection from CSV or JSON file")
	fmt.Println("  restore     Restore database from Litestream S3 backup")
	fmt.Println("  update      Update moul binary to the latest release")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  --db [path]                    Specify SQLite database path (default: MOUL_DB_PATH or moul-local.db)")
	fmt.Println("  --out [file]                   Output file path for export or typegen (default: stdout)")
	fmt.Println("  --format [csv|json]            Format for export or import (default: auto or json)")
	fmt.Println("  --mode [upsert|insert|replace] Conflict resolution strategy for import (default: upsert)")
	fmt.Println("  --on-error [atomic|continue]   Error handling strategy for import (default: atomic)")
	fmt.Println("  --schema                       Include schema definition envelope in JSON export")
	fmt.Println("  --server [url]                 Remote moul server URL (optional)")
	fmt.Println("  --admin-key [key]              Admin key for remote server authentication")
	fmt.Println("  --filter [expr]                Filter query for export records")
	fmt.Println("  --sort [expr]                  Sort order for export records")
	fmt.Println("  --rule [expr]                  Rule expression string to test (for test-rule)")
	fmt.Println("  --record [json]                Record payload JSON (for test-rule)")
	fmt.Println("  --auth [json]                  Auth payload JSON (for test-rule)")
	fmt.Println("  -f, --force                    Force update even if already at latest version")
	fmt.Println("  -s, --service, --systemd [name] Restart systemd service after update (default: moul)")
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
	case "ctl", "tui":
		runCtl()
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
	case "export":
		runExport()
	case "import":
		runImport()
	case "restore":
		runRestore()
	case "update", "-u", "-update", "--update":
		runUpdate()
	case "-v", "-version", "--version", "version":
		fmt.Printf("moul version %s\n", Version)
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
		fmt.Println("Example: moul test-rule --rule=\"author_id = @request.auth.id\" --record='{\"author_id\": \"u1\"}' --auth='{\"id\": \"u1\"}'")
		os.Exit(1)
	}

	var recordData map[string]interface{}
	if recordJSON != "" {
		if err := json.Unmarshal([]byte(recordJSON), &recordData); err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing --record JSON: %v\n", err)
			os.Exit(1)
		}
	}

	var authData map[string]interface{}
	if authJSON != "" {
		if err := json.Unmarshal([]byte(authJSON), &authData); err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing --auth JSON: %v\n", err)
			os.Exit(1)
		}
	}

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
		fmt.Println("Usage: moul worker [retry|list-failed] [table_name] [optional: job_id]")
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
				systemdService = "moul"
			}
		case strings.HasPrefix(arg, "--service=") || strings.HasPrefix(arg, "--systemd=") || strings.HasPrefix(arg, "--systemd-service=") || strings.HasPrefix(arg, "-s="):
			parts := strings.SplitN(arg, "=", 2)
			if len(parts) == 2 && parts[1] != "" {
				systemdService = parts[1]
			} else {
				systemdService = "moul"
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
		AppName:        "moul",
		CurrentVer:     Version,
		Force:          force,
		SystemdService: systemdService,
	}

	if err := updater.Update(opts); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating moul: %v\n", err)
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
	moulApp := app.New(app.Config{
		Version: Version,
	})

	if err := moulApp.Start(context.Background()); err != nil {
		logger.Fatal("Server failed to run", "err", err)
	}
}

func runCtl() {
	ctlArgs := []string{}
	if len(os.Args) > 2 {
		ctlArgs = os.Args[2:]
	}

	// 1. Check adjacent directory (same folder as moul executable)
	if execPath, err := os.Executable(); err == nil {
		dir := filepath.Dir(execPath)
		candidate := filepath.Join(dir, "moul-ctl")
		if runtime.GOOS == "windows" {
			candidate += ".exe"
		}
		if fi, err := os.Stat(candidate); err == nil && !fi.IsDir() {
			executeCtl(candidate, ctlArgs)
			return
		}
	}

	// 2. Check PATH
	if ctlPath, err := exec.LookPath("moul-ctl"); err == nil {
		executeCtl(ctlPath, ctlArgs)
		return
	}

	// 3. Inform user how to get moul-ctl
	fmt.Fprintf(os.Stderr, "Error: 'moul-ctl' executable not found in PATH or adjacent directory.\n")
	fmt.Fprintf(os.Stderr, "Please install 'moul-ctl' using:\n")
	fmt.Fprintf(os.Stderr, "  curl -fsSL https://moul.dev/install.sh | sh\n")
	fmt.Fprintf(os.Stderr, "Or build it locally:\n")
	fmt.Fprintf(os.Stderr, "  make ctl\n")
	os.Exit(1)
}

func executeCtl(path string, args []string) {
	cmd := exec.Command(path, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		fmt.Fprintf(os.Stderr, "Error executing %s: %v\n", path, err)
		os.Exit(1)
	}
}

func parseFlagString(flagName string) string {
	for i, arg := range os.Args {
		if arg == flagName && i+1 < len(os.Args) {
			return os.Args[i+1]
		}
		if strings.HasPrefix(arg, flagName+"=") {
			return strings.TrimPrefix(arg, flagName+"=")
		}
	}
	return ""
}

func hasFlag(flagName string) bool {
	for _, arg := range os.Args {
		if arg == flagName || strings.HasPrefix(arg, flagName+"=") {
			return true
		}
	}
	return false
}

func runExport() {
	if len(os.Args) < 3 || strings.HasPrefix(os.Args[2], "-") {
		fmt.Println("Usage: moul export <collection> [options]")
		fmt.Println("Example: moul export posts --format=csv --out=posts.csv")
		os.Exit(1)
	}

	collection := os.Args[2]
	outFile := parseFlagString("--out")
	format := parseFlagString("--format")
	if format == "" && outFile != "" {
		ext := strings.ToLower(filepath.Ext(outFile))
		if ext == ".csv" {
			format = "csv"
		} else if ext == ".json" {
			format = "json"
		}
	}
	if format == "" {
		format = "json"
	}

	includeSchema := hasFlag("--schema")
	filter := parseFlagString("--filter")
	sort := parseFlagString("--sort")
	serverURL := parseFlagString("--server")
	adminKey := parseFlagString("--admin-key")

	if serverURL != "" {
		// Remote server execution
		exportURL := fmt.Sprintf("%s/api/moul/%s/export?format=%s", strings.TrimSuffix(serverURL, "/"), url.PathEscape(collection), url.QueryEscape(format))
		if includeSchema {
			exportURL += "&includeSchema=true"
		}
		if filter != "" {
			exportURL += "&filter=" + url.QueryEscape(filter)
		}
		if sort != "" {
			exportURL += "&sort=" + url.QueryEscape(sort)
		}

		req, err := http.NewRequest(http.MethodGet, exportURL, nil)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to create remote request: %v\n", err)
			os.Exit(1)
		}
		if adminKey != "" {
			req.Header.Set("X-Admin-Key", adminKey)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Remote request failed: %v\n", err)
			os.Exit(1)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			fmt.Fprintf(os.Stderr, "Remote export error (%d): %s\n", resp.StatusCode, string(body))
			os.Exit(1)
		}

		if outFile != "" {
			f, err := os.Create(outFile)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Failed to create output file: %v\n", err)
				os.Exit(1)
			}
			defer f.Close()
			if _, err := io.Copy(f, resp.Body); err != nil {
				fmt.Fprintf(os.Stderr, "Failed to write output file: %v\n", err)
				os.Exit(1)
			}
			fmt.Printf("Successfully exported %s to %s\n", collection, outFile)
		} else {
			if _, err := io.Copy(os.Stdout, resp.Body); err != nil {
				fmt.Fprintf(os.Stderr, "Failed to write to stdout: %v\n", err)
				os.Exit(1)
			}
		}
		return
	}

	// Local SQLite execution
	dbPath := getDBPath()
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	moul, err := db.LoadMoulByName(dbConn, collection)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Collection %q not found in database: %v\n", collection, err)
		os.Exit(1)
	}

	opts := dataio.ExportOptions{
		Format:        format,
		IncludeSchema: includeSchema,
		Filter:        filter,
		Sort:          sort,
	}

	if outFile != "" {
		f, err := os.Create(outFile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to create output file %s: %v\n", outFile, err)
			os.Exit(1)
		}
		defer f.Close()

		if err := dataio.ExportCollection(dbConn, moul, opts, f); err != nil {
			fmt.Fprintf(os.Stderr, "Export failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Successfully exported %s to %s\n", collection, outFile)
	} else {
		if err := dataio.ExportCollection(dbConn, moul, opts, os.Stdout); err != nil {
			fmt.Fprintf(os.Stderr, "Export failed: %v\n", err)
			os.Exit(1)
		}
	}
}

func runImport() {
	if len(os.Args) < 4 || strings.HasPrefix(os.Args[2], "-") {
		fmt.Println("Usage: moul import <collection> <file> [options]")
		fmt.Println("Example: moul import posts data.csv --mode=upsert")
		os.Exit(1)
	}

	collection := os.Args[2]
	filePath := os.Args[3]

	format := parseFlagString("--format")
	if format == "" && filePath != "-" {
		ext := strings.ToLower(filepath.Ext(filePath))
		if ext == ".csv" {
			format = "csv"
		} else if ext == ".json" {
			format = "json"
		}
	}

	mode := parseFlagString("--mode")
	if mode == "" {
		mode = "upsert"
	}

	onError := parseFlagString("--on-error")
	if onError == "" {
		onError = "atomic"
	}

	serverURL := parseFlagString("--server")
	adminKey := parseFlagString("--admin-key")

	if serverURL != "" {
		// Remote server execution via multipart upload
		importURL := fmt.Sprintf("%s/api/moul/%s/import?mode=%s&onError=%s", strings.TrimSuffix(serverURL, "/"), url.PathEscape(collection), url.QueryEscape(mode), url.QueryEscape(onError))

		fileContent, err := os.ReadFile(filePath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to read input file: %v\n", err)
			os.Exit(1)
		}

		var body bytes.Buffer
		writer := multipart.NewWriter(&body)
		part, err := writer.CreateFormFile("file", filepath.Base(filePath))
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to create multipart form: %v\n", err)
			os.Exit(1)
		}
		if _, err := part.Write(fileContent); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to write multipart payload: %v\n", err)
			os.Exit(1)
		}
		_ = writer.Close()

		req, err := http.NewRequest(http.MethodPost, importURL, &body)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to create remote request: %v\n", err)
			os.Exit(1)
		}
		req.Header.Set("Content-Type", writer.FormDataContentType())
		if adminKey != "" {
			req.Header.Set("X-Admin-Key", adminKey)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Remote request failed: %v\n", err)
			os.Exit(1)
		}
		defer resp.Body.Close()

		respBytes, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != http.StatusOK {
			fmt.Fprintf(os.Stderr, "Remote import failed (%d): %s\n", resp.StatusCode, string(respBytes))
			os.Exit(1)
		}

		var res dataio.ImportResult
		if err := json.Unmarshal(respBytes, &res); err == nil {
			fmt.Printf("Import completed! Total: %d, Inserted: %d, Updated: %d, Skipped: %d\n", res.Total, res.Inserted, res.Updated, res.Skipped)
			if len(res.Errors) > 0 {
				fmt.Printf("Encountered %d row error(s):\n", len(res.Errors))
				for _, re := range res.Errors {
					fmt.Printf("  • Row %d: %s\n", re.Row, re.Message)
				}
			}
		} else {
			fmt.Println("Import completed successfully!")
		}
		return
	}

	// Local SQLite execution
	dbPath := getDBPath()
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	moul, err := db.LoadMoulByName(dbConn, collection)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Collection %q not found in database: %v\n", collection, err)
		os.Exit(1)
	}

	var input io.Reader
	if filePath == "-" {
		input = os.Stdin
	} else {
		f, err := os.Open(filePath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to open input file %s: %v\n", filePath, err)
			os.Exit(1)
		}
		defer f.Close()
		input = f
	}

	opts := dataio.ImportOptions{
		Format:  format,
		Mode:    mode,
		OnError: onError,
	}

	res, err := dataio.ImportCollection(dbConn, moul, opts, input)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Import failed: %v\n", err)
		if res != nil && len(res.Errors) > 0 {
			fmt.Fprintf(os.Stderr, "\nRow Errors (%d):\n", len(res.Errors))
			for _, re := range res.Errors {
				fmt.Fprintf(os.Stderr, "  • Row %d: %s\n", re.Row, re.Message)
			}
		}
		os.Exit(1)
	}

	fmt.Printf("Import completed successfully! Total: %d, Inserted: %d, Updated: %d, Skipped: %d\n", res.Total, res.Inserted, res.Updated, res.Skipped)
	if len(res.Errors) > 0 {
		fmt.Printf("Warnings / Row Errors (%d):\n", len(res.Errors))
		for _, re := range res.Errors {
			fmt.Printf("  • Row %d: %s\n", re.Row, re.Message)
		}
	}
}
