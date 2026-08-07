package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/gobuffalo/envy"

	"github.com/moul-dev/moul-dev/internal/backup"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/updater"
	"github.com/moul-dev/moul-dev/pkg/app"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func printUsage() {
	fmt.Println("Usage: mould [command] [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  start    Start the mould engine server (default)")
	fmt.Println("  mcp      Start built-in MCP server in stdio transport mode")
	fmt.Println("  restore  Restore database from Litestream S3 backup")
	fmt.Println("  update   Update mould binary to the latest release")
	fmt.Println()
	fmt.Println("Options:")
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

func runMCP() {
	dbPath := envy.Get("MOUL_DB_PATH", "moul-local.db")
	dbConn, err := db.InitDB(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	socketPath := envy.Get("MOUL_TELEGRAF_SOCKET_PATH", "/tmp/moul-telegraf.sock")
	sysmonCollector := sysmon.NewCollector(socketPath)

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
	dbPath := envy.Get("MOUL_DB_PATH", "moul-local.db")
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
