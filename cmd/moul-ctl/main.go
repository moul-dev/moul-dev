package main

import (
	"flag"
	"fmt"
	"os"
	"strings"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/tui"
	"github.com/moul-dev/moul-dev/internal/updater"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func printUsage() {
	fmt.Println("Usage: moul-ctl [command] [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  update                          Update moul-ctl binary to the latest release")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -server <url>                   moul server URL")
	fmt.Println("  -admin-key <key>                moul admin key")
	fmt.Println("  -u, --update                    Update moul-ctl binary to the latest release")
	fmt.Println("  -f, --force                     Force update even if already at latest version")
	fmt.Println("  -s, --service, --systemd [name] Restart systemd service after update (default: moul)")
	fmt.Println("  -v, --version, version          Print version and exit")
	fmt.Println("  -h, --help, help                Show help and usage instructions")
}

func main() {
	// Check positional subcommands first
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "update":
			runUpdate(os.Args[2:])
			return
		case "version":
			fmt.Printf("moul-ctl version %s\n", Version)
			return
		case "help":
			printUsage()
			return
		}
	}

	serverFlag := flag.String("server", "", "moul server URL")
	adminKeyFlag := flag.String("admin-key", "", "moul admin key")
	versionFlag := flag.Bool("version", false, "Print version and exit")
	versionShortFlag := flag.Bool("v", false, "Print version and exit")
	updateFlag := flag.Bool("update", false, "Update moul-ctl binary to the latest release")
	updateShortFlag := flag.Bool("u", false, "Update moul-ctl binary to the latest release")
	forceFlag := flag.Bool("force", false, "Force update even if already at latest version")
	forceShortFlag := flag.Bool("f", false, "Force update even if already at latest version")
	serviceFlag := flag.String("service", "", "Restart systemd service after update")
	systemdFlag := flag.String("systemd", "", "Restart systemd service after update")
	helpFlag := flag.Bool("help", false, "Show help and usage instructions")
	helpShortFlag := flag.Bool("h", false, "Show help and usage instructions")

	flag.CommandLine.Usage = printUsage
	flag.Parse()

	if *helpFlag || *helpShortFlag {
		printUsage()
		return
	}

	if *versionFlag || *versionShortFlag {
		fmt.Printf("moul-ctl version %s\n", Version)
		return
	}

	if *updateFlag || *updateShortFlag || (len(flag.Args()) > 0 && flag.Args()[0] == "update") {
		allArgs := os.Args[1:]
		force, systemdService := parseUpdateArgs(allArgs)
		if *forceFlag || *forceShortFlag {
			force = true
		}
		if systemdService == "" {
			if *serviceFlag != "" {
				systemdService = *serviceFlag
			} else if *systemdFlag != "" {
				systemdService = *systemdFlag
			}
		}
		runUpdateWithOpts(force, systemdService)
		return
	}

	tui.Version = Version

	m := tui.NewModel(*serverFlag, *adminKeyFlag)

	p := tea.NewProgram(m)
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running TUI: %v\n", err)
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

func runUpdate(args []string) {
	if len(args) > 0 && (args[0] == "update" || args[0] == "-u" || args[0] == "-update" || args[0] == "--update") {
		args = args[1:]
	}
	force, systemdService := parseUpdateArgs(args)
	runUpdateWithOpts(force, systemdService)
}

func runUpdateWithOpts(force bool, systemdService string) {
	opts := updater.Options{
		AppName:        "moul-ctl",
		CurrentVer:     Version,
		Force:          force,
		SystemdService: systemdService,
	}

	if err := updater.Update(opts); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating moul-ctl: %v\n", err)
		os.Exit(1)
	}
}
