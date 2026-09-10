package app

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/pocketbase/dbx"

	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/dataio"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/moul-dev/moul-dev/internal/seed"
	"github.com/moul-dev/moul-dev/internal/typegen"
	"github.com/moul-dev/moul-dev/internal/updater"
	"github.com/moul-dev/moul-dev/pkg/worker"
)

// PrintUsage prints the available CLI commands and options.
func PrintUsage(w io.Writer) {
	fmt.Fprintln(w, "Usage: moul [command] [options]")
	fmt.Fprintln(w)
	fmt.Fprintln(w, "Commands:")
	fmt.Fprintln(w, "  start       Start the moul engine server (default)")
	fmt.Fprintln(w, "  ctl         Launch the moul-ctl management TUI")
	fmt.Fprintln(w, "  seed        Seed database with realistic collections, demo records, and feature flags")
	fmt.Fprintln(w, "  typegen     Generate TypeScript type definitions from collection schemas")
	fmt.Fprintln(w, "  test-rule   Test and validate a rule expression against mock record/auth context")
	fmt.Fprintln(w, "  worker      Manage background worker jobs (retry failed jobs, list DLQ)")
	fmt.Fprintln(w, "  mcp         Start built-in MCP server in stdio transport mode")
	fmt.Fprintln(w, "  export      Export collection records to CSV or JSON file")
	fmt.Fprintln(w, "  import      Import records into collection from CSV or JSON file")
	fmt.Fprintln(w, "  restore     Restore database from Litestream S3 backup")
	fmt.Fprintln(w, "  update      Update moul binary to the latest release")
	fmt.Fprintln(w)
	fmt.Fprintln(w, "Options:")
	fmt.Fprintln(w, "  --db [path]                    Specify SQLite database path (default: MOUL_DB_PATH or moul-local.db)")
	fmt.Fprintln(w, "  --out [file]                   Output file path for export or typegen (default: stdout)")
	fmt.Fprintln(w, "  --format [csv|json]            Format for export or import (default: auto or json)")
	fmt.Fprintln(w, "  --mode [upsert|insert|replace] Conflict resolution strategy for import (default: upsert)")
	fmt.Fprintln(w, "  --on-error [atomic|continue]   Error handling strategy for import (default: atomic)")
	fmt.Fprintln(w, "  --schema                       Include schema definition envelope in JSON export")
	fmt.Fprintln(w, "  --server [url]                 Remote moul server URL (optional)")
	fmt.Fprintln(w, "  --admin-key [key]              Admin key for remote server authentication")
	fmt.Fprintln(w, "  --filter [expr]                Filter query for export records")
	fmt.Fprintln(w, "  --sort [expr]                  Sort order for export records")
	fmt.Fprintln(w, "  --rule [expr]                  Rule expression string to test (for test-rule)")
	fmt.Fprintln(w, "  --record [json]                Record payload JSON (for test-rule)")
	fmt.Fprintln(w, "  --auth [json]                  Auth payload JSON (for test-rule)")
	fmt.Fprintln(w, "  -f, --force                    Force update even if already at latest version")
	fmt.Fprintln(w, "  -s, --service, --systemd [name] Restart systemd service after update (default: moul)")
	fmt.Fprintln(w, "  -v, --version, version         Print version information and exit")
	fmt.Fprintln(w, "  -h, --help, help               Show help and usage instructions")
}

// ParseFlagString extracts a string value for a named command-line flag.
func ParseFlagString(flagName string) string {
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

var parseFlagString = ParseFlagString

// HasFlag reports whether a command-line flag is set.
func HasFlag(flagName string) bool {
	for _, arg := range os.Args {
		if arg == flagName || strings.HasPrefix(arg, flagName+"=") {
			return true
		}
	}
	return false
}

var hasFlag = HasFlag

// GetDBPath resolves the database path from CLI flags, environment, or default.
func GetDBPath() string {
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

func parseCLICommand(args []string) (cmd string, cmdArgs []string) {
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if arg == "--" {
			if i+1 < len(args) {
				return args[i+1], args[i+2:]
			}
			break
		}
		if strings.HasPrefix(arg, "-") {
			// Skip flags taking values
			if (arg == "--db" || arg == "--out" || arg == "--format" || arg == "--mode" ||
				arg == "--on-error" || arg == "--server" || arg == "--admin-key" ||
				arg == "--filter" || arg == "--sort" || arg == "--rule" ||
				arg == "--record" || arg == "--auth" || arg == "-s" ||
				arg == "--service" || arg == "--systemd" || arg == "--systemd-service") && i+1 < len(args) {
				i++
			}
			continue
		}
		return arg, args[i+1:]
	}
	return "", nil
}

func (a *App) getOrInitDB() (*dbx.DB, bool, error) {
	if a.dbConn != nil {
		return a.dbConn, false, nil
	}
	dbPath := a.config.DBPath
	if dbPath == "" {
		dbPath = GetDBPath()
		a.config.DBPath = dbPath
	}
	conn, err := db.InitDB(dbPath)
	if err != nil {
		return nil, false, fmt.Errorf("database initialization failed: %w", err)
	}
	return conn, true, nil
}

// dispatchCLI checks CLI arguments and executes matching commands.
// Returns (command, handled, error).
func (a *App) dispatchCLI(ctx context.Context) (string, bool, error) {
	if len(os.Args) <= 1 {
		return "", false, nil
	}

	// Check top-level help and version flags
	if hasFlag("-v") || hasFlag("-version") || hasFlag("--version") {
		fmt.Printf("moul version %s\n", a.config.Version)
		return "-v", true, nil
	}
	if hasFlag("-h") || hasFlag("-help") || hasFlag("--help") {
		PrintUsage(os.Stdout)
		return "--help", true, nil
	}

	cmd, _ := parseCLICommand(os.Args[1:])
	if cmd == "" {
		if IsMCP() {
			cmd = "mcp"
		} else {
			return "", false, nil
		}
	}

	switch cmd {
	case "start":
		return "start", false, nil

	case "mcp":
		return "mcp", true, a.ServeMCP(ctx)

	case "ctl", "tui":
		ctlArgs := []string{}
		if len(os.Args) > 2 {
			ctlArgs = os.Args[2:]
		}
		return cmd, true, a.runCtl(ctlArgs)

	case "seed":
		return cmd, true, a.runSeed()

	case "typegen", "gen-types":
		return cmd, true, a.runTypegen()

	case "test-rule", "rule-test":
		return cmd, true, a.runTestRule()

	case "worker":
		return cmd, true, a.runWorkerCmd()

	case "export":
		return cmd, true, a.runExport()

	case "import":
		return cmd, true, a.runImport()

	case "restore":
		return cmd, true, a.runRestore(ctx)

	case "update", "-u", "-update", "--update":
		return cmd, true, a.runUpdate()

	case "-v", "-version", "--version", "version":
		fmt.Printf("moul version %s\n", a.config.Version)
		return cmd, true, nil

	case "-h", "-help", "--help", "help":
		PrintUsage(os.Stdout)
		return cmd, true, nil

	default:
		fmt.Printf("Unknown command: %s\n\n", cmd)
		PrintUsage(os.Stdout)
		return cmd, true, fmt.Errorf("unknown command: %s", cmd)
	}
}

func (a *App) runSeed() error {
	dbConn, shouldClose, err := a.getOrInitDB()
	if err != nil {
		return err
	}
	if shouldClose {
		defer dbConn.Close()
	}

	fmt.Printf("Seeding database at: %s...\n", a.config.DBPath)
	if err := seed.Seed(dbConn); err != nil {
		return fmt.Errorf("seeding failed: %w", err)
	}

	fmt.Println("Successfully seeded database with demo collections, records, and feature flags!")
	return nil
}

func (a *App) runTypegen() error {
	outFile := parseFlagString("--out")

	dbConn, shouldClose, err := a.getOrInitDB()
	if err != nil {
		return err
	}
	if shouldClose {
		defer dbConn.Close()
	}

	tsCode, err := typegen.GenerateFromDB(dbConn)
	if err != nil {
		return fmt.Errorf("type generation failed: %w", err)
	}

	if outFile != "" {
		if err := os.WriteFile(outFile, []byte(tsCode), 0644); err != nil {
			return fmt.Errorf("failed to write output to %s: %w", outFile, err)
		}
		fmt.Printf("Successfully generated TypeScript types to %s\n", outFile)
	} else {
		fmt.Print(tsCode)
	}
	return nil
}

func (a *App) runTestRule() error {
	ruleStr := parseFlagString("--rule")
	recordJSON := parseFlagString("--record")
	if recordJSON == "" {
		recordJSON = "{}"
	}
	authJSON := parseFlagString("--auth")
	if authJSON == "" {
		authJSON = "{}"
	}

	if ruleStr == "" {
		fmt.Println("Error: --rule expression is required.")
		fmt.Println("Example: moul test-rule --rule=\"author_id = @request.auth.id\" --record='{\"author_id\": \"u1\"}' --auth='{\"id\": \"u1\"}'")
		return fmt.Errorf("--rule expression is required")
	}

	var recordData map[string]interface{}
	if err := json.Unmarshal([]byte(recordJSON), &recordData); err != nil {
		return fmt.Errorf("error parsing --record JSON: %w", err)
	}

	var authData map[string]interface{}
	if err := json.Unmarshal([]byte(authJSON), &authData); err != nil {
		return fmt.Errorf("error parsing --auth JSON: %w", err)
	}

	dbConn, shouldClose, _ := a.getOrInitDB()
	if dbConn != nil && shouldClose {
		defer dbConn.Close()
	}

	start := time.Now()
	translated, _, err := rules.Translate(ruleStr)
	if err != nil {
		fmt.Printf("Translation Syntax Error: %v\n", err)
		return fmt.Errorf("translation syntax error: %w", err)
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
		return fmt.Errorf("rule evaluation error: %w", evalErr)
	}
	fmt.Printf("Status:       SUCCESS\n")
	fmt.Printf("Matched:      %t\n", matched)
	return nil
}

func (a *App) runWorkerCmd() error {
	if len(os.Args) < 3 {
		fmt.Println("Usage: moul worker [retry|list-failed] [table_name] [optional: job_id]")
		return fmt.Errorf("missing worker sub-command")
	}

	subCmd := os.Args[2]
	tableName := "tasks_queue"
	if len(os.Args) > 3 && !strings.HasPrefix(os.Args[3], "-") {
		tableName = os.Args[3]
	}

	dbConn, shouldClose, err := a.getOrInitDB()
	if err != nil {
		return err
	}
	if shouldClose {
		defer dbConn.Close()
	}

	engine := worker.NewEngine(dbConn)

	switch subCmd {
	case "retry":
		var jobIDs []string
		if len(os.Args) > 4 {
			jobIDs = append(jobIDs, os.Args[4])
		}
		affected, err := engine.RetryFailedJobs(tableName, jobIDs...)
		if err != nil {
			return fmt.Errorf("failed to retry jobs in %s: %w", tableName, err)
		}
		fmt.Printf("Successfully retried %d failed/discarded jobs in %s.\n", affected, tableName)

	case "list-failed", "dlq":
		jobs, err := engine.ListDiscardedJobs(tableName, 50)
		if err != nil {
			return fmt.Errorf("failed to list discarded jobs: %w", err)
		}
		fmt.Printf("Found %d discarded jobs in %s:\n\n", len(jobs), tableName)
		for _, j := range jobs {
			fmt.Printf("• ID: %s | Worker: %s | Attempts: %d/%d | Inserted: %s\n", j.ID, j.Worker, j.Attempt, j.MaxAttempts, j.InsertedAt)
			if len(j.Errors) > 0 {
				fmt.Printf("  Last Error: %s\n", j.Errors[len(j.Errors)-1])
			}
		}
	default:
		return fmt.Errorf("unknown worker sub-command: %s", subCmd)
	}
	return nil
}

func (a *App) runExport() error {
	if len(os.Args) < 3 || strings.HasPrefix(os.Args[2], "-") {
		fmt.Println("Usage: moul export <collection> [options]")
		fmt.Println("Example: moul export posts --format=csv --out=posts.csv")
		return fmt.Errorf("collection name is required")
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
			return fmt.Errorf("failed to create remote request: %w", err)
		}
		if adminKey != "" {
			req.Header.Set("X-Admin-Key", adminKey)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return fmt.Errorf("remote request failed: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("remote export error (%d): %s", resp.StatusCode, string(body))
		}

		if outFile != "" {
			f, err := os.Create(outFile)
			if err != nil {
				return fmt.Errorf("failed to create output file: %w", err)
			}
			defer f.Close()
			if _, err := io.Copy(f, resp.Body); err != nil {
				return fmt.Errorf("failed to write output file: %w", err)
			}
			fmt.Printf("Successfully exported %s to %s\n", collection, outFile)
		} else {
			if _, err := io.Copy(os.Stdout, resp.Body); err != nil {
				return fmt.Errorf("failed to write to stdout: %w", err)
			}
		}
		return nil
	}

	dbConn, shouldClose, err := a.getOrInitDB()
	if err != nil {
		return err
	}
	if shouldClose {
		defer dbConn.Close()
	}

	moul, err := db.LoadMoulByName(dbConn, collection)
	if err != nil {
		return fmt.Errorf("collection %q not found in database: %w", collection, err)
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
			return fmt.Errorf("failed to create output file %s: %w", outFile, err)
		}
		defer f.Close()

		if err := dataio.ExportCollection(dbConn, moul, opts, f); err != nil {
			return fmt.Errorf("export failed: %w", err)
		}
		fmt.Printf("Successfully exported %s to %s\n", collection, outFile)
	} else {
		if err := dataio.ExportCollection(dbConn, moul, opts, os.Stdout); err != nil {
			return fmt.Errorf("export failed: %w", err)
		}
	}
	return nil
}

func (a *App) runImport() error {
	if len(os.Args) < 4 || strings.HasPrefix(os.Args[2], "-") {
		fmt.Println("Usage: moul import <collection> <file> [options]")
		fmt.Println("Example: moul import posts data.csv --mode=upsert")
		return fmt.Errorf("collection name and file path required")
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
		importURL := fmt.Sprintf("%s/api/moul/%s/import?mode=%s&onError=%s", strings.TrimSuffix(serverURL, "/"), url.PathEscape(collection), url.QueryEscape(mode), url.QueryEscape(onError))

		fileContent, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read input file: %w", err)
		}

		var body bytes.Buffer
		writer := multipart.NewWriter(&body)
		part, err := writer.CreateFormFile("file", filepath.Base(filePath))
		if err != nil {
			return fmt.Errorf("failed to create multipart form: %w", err)
		}
		if _, err := part.Write(fileContent); err != nil {
			return fmt.Errorf("failed to write multipart payload: %w", err)
		}
		_ = writer.Close()

		req, err := http.NewRequest(http.MethodPost, importURL, &body)
		if err != nil {
			return fmt.Errorf("failed to create remote request: %w", err)
		}
		req.Header.Set("Content-Type", writer.FormDataContentType())
		if adminKey != "" {
			req.Header.Set("X-Admin-Key", adminKey)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return fmt.Errorf("remote request failed: %w", err)
		}
		defer resp.Body.Close()

		respBytes, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("remote import failed (%d): %s", resp.StatusCode, string(respBytes))
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
		return nil
	}

	dbConn, shouldClose, err := a.getOrInitDB()
	if err != nil {
		return err
	}
	if shouldClose {
		defer dbConn.Close()
	}

	moul, err := db.LoadMoulByName(dbConn, collection)
	if err != nil {
		return fmt.Errorf("collection %q not found in database: %w", collection, err)
	}

	var input io.Reader
	if filePath == "-" {
		input = os.Stdin
	} else {
		f, err := os.Open(filePath)
		if err != nil {
			return fmt.Errorf("failed to open input file %s: %w", filePath, err)
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
		if res != nil && len(res.Errors) > 0 {
			fmt.Fprintf(os.Stderr, "\nRow Errors (%d):\n", len(res.Errors))
			for _, re := range res.Errors {
				fmt.Fprintf(os.Stderr, "  • Row %d: %s\n", re.Row, re.Message)
			}
		}
		return fmt.Errorf("import failed: %w", err)
	}

	fmt.Printf("Import completed successfully! Total: %d, Inserted: %d, Updated: %d, Skipped: %d\n", res.Total, res.Inserted, res.Updated, res.Skipped)
	if len(res.Errors) > 0 {
		fmt.Printf("Warnings / Row Errors (%d):\n", len(res.Errors))
		for _, re := range res.Errors {
			fmt.Printf("  • Row %d: %s\n", re.Row, re.Message)
		}
	}
	return nil
}

func (a *App) runRestore(ctx context.Context) error {
	dbPath := a.config.DBPath
	if dbPath == "" {
		dbPath = GetDBPath()
	}
	logger.Info("Attempting Litestream S3 database restore", "path", dbPath)
	if err := backup.RestoreFromS3(ctx, dbPath); err != nil {
		return fmt.Errorf("litestream restore failed: %w", err)
	}
	logger.Info("Restore operation completed successfully")
	return nil
}

func (a *App) runCtl(ctlArgs []string) error {
	// 1. Check adjacent directory (same folder as executable)
	if execPath, err := os.Executable(); err == nil {
		dir := filepath.Dir(execPath)
		candidate := filepath.Join(dir, "moul-ctl")
		if runtime.GOOS == "windows" {
			candidate += ".exe"
		}
		if fi, err := os.Stat(candidate); err == nil && !fi.IsDir() {
			return executeCtl(candidate, ctlArgs)
		}
	}

	// 2. Check PATH
	if ctlPath, err := exec.LookPath("moul-ctl"); err == nil {
		return executeCtl(ctlPath, ctlArgs)
	}

	// 3. Inform user how to get moul-ctl
	fmt.Fprintf(os.Stderr, "Error: 'moul-ctl' executable not found in PATH or adjacent directory.\n")
	fmt.Fprintf(os.Stderr, "Please install 'moul-ctl' using:\n")
	fmt.Fprintf(os.Stderr, "  curl -fsSL https://moul.dev/install.sh | sh\n")
	fmt.Fprintf(os.Stderr, "Or build it locally:\n")
	fmt.Fprintf(os.Stderr, "  make ctl\n")
	return fmt.Errorf("'moul-ctl' executable not found in PATH or adjacent directory")
}

func executeCtl(path string, args []string) error {
	cmd := exec.Command(path, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		return fmt.Errorf("error executing %s: %w", path, err)
	}
	return nil
}

func (a *App) runUpdate() error {
	args := os.Args[1:]
	if len(args) > 0 && (args[0] == "update" || args[0] == "-u" || args[0] == "-update" || args[0] == "--update") {
		args = args[1:]
	}
	force, systemdService := parseUpdateArgs(args)

	opts := updater.Options{
		AppName:        "moul",
		CurrentVer:     a.config.Version,
		Force:          force,
		SystemdService: systemdService,
	}

	if err := updater.Update(opts); err != nil {
		return fmt.Errorf("error updating moul: %w", err)
	}
	return nil
}

// ParseUpdateArgs parses CLI flags for the update command.
func ParseUpdateArgs(args []string) (force bool, systemdService string) {
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

var parseUpdateArgs = ParseUpdateArgs
