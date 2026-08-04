package main

import (
	"flag"
	"fmt"
	"os"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/tui"
	"github.com/moul-dev/moul-dev/internal/updater"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func printUsage() {
	fmt.Println("Usage: moul [command] [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  update                  Update moul binary to the latest release")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -server <url>           moul-dev server URL")
	fmt.Println("  -admin-key <key>        moul-dev admin key")
	fmt.Println("  -u, --update            Update moul binary to the latest release")
	fmt.Println("  -f, --force             Force update even if already at latest version")
	fmt.Println("  -v, --version, version  Print version and exit")
	fmt.Println("  -h, --help, help        Show help and usage instructions")
}

func main() {
	// Check positional subcommands first
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "update":
			runUpdate(os.Args[2:])
			return
		case "version":
			fmt.Printf("moul version %s\n", Version)
			return
		case "help":
			printUsage()
			return
		}
	}

	serverFlag := flag.String("server", "", "moul-dev server URL")
	adminKeyFlag := flag.String("admin-key", "", "moul-dev admin key")
	versionFlag := flag.Bool("version", false, "Print version and exit")
	versionShortFlag := flag.Bool("v", false, "Print version and exit")
	updateFlag := flag.Bool("update", false, "Update moul binary to the latest release")
	updateShortFlag := flag.Bool("u", false, "Update moul binary to the latest release")
	forceFlag := flag.Bool("force", false, "Force update even if already at latest version")
	forceShortFlag := flag.Bool("f", false, "Force update even if already at latest version")
	helpFlag := flag.Bool("help", false, "Show help and usage instructions")
	helpShortFlag := flag.Bool("h", false, "Show help and usage instructions")

	flag.CommandLine.Usage = printUsage
	flag.Parse()

	if *helpFlag || *helpShortFlag {
		printUsage()
		return
	}

	if *versionFlag || *versionShortFlag {
		fmt.Printf("moul version %s\n", Version)
		return
	}

	if *updateFlag || *updateShortFlag || (len(flag.Args()) > 0 && flag.Args()[0] == "update") {
		force := *forceFlag || *forceShortFlag
		for _, arg := range flag.Args() {
			if arg == "-f" || arg == "--force" {
				force = true
			}
		}
		runUpdateWithForce(force)
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

func runUpdate(args []string) {
	force := false
	for _, arg := range args {
		if arg == "-f" || arg == "--force" {
			force = true
		}
	}
	runUpdateWithForce(force)
}

func runUpdateWithForce(force bool) {
	opts := updater.Options{
		AppName:    "moul",
		CurrentVer: Version,
		Force:      force,
	}

	if err := updater.Update(opts); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating moul: %v\n", err)
		os.Exit(1)
	}
}
