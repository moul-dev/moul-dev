package main

import (
	"flag"
	"fmt"
	"os"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/tui"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func main() {
	serverFlag := flag.String("server", "", "moul-dev server URL")
	adminKeyFlag := flag.String("admin-key", "", "moul-dev admin key")
	versionFlag := flag.Bool("version", false, "Print version and exit")
	flag.Parse()

	if *versionFlag {
		fmt.Printf("moul version %s\n", Version)
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
