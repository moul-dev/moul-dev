package main

import (
	"flag"
	"fmt"
	"os"

	tea "charm.land/bubbletea/v2"
	"github.com/moul-dev/moul-dev/internal/tui"
)

func main() {
	serverFlag := flag.String("server", "", "moul-dev server URL")
	adminKeyFlag := flag.String("admin-key", "", "moul-dev admin key")
	flag.Parse()

	m := tui.NewModel(*serverFlag, *adminKeyFlag)

	p := tea.NewProgram(m)
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running TUI: %v\n", err)
		os.Exit(1)
	}
}
