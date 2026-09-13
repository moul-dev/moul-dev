package main

import (
	"context"
	"fmt"
	"os"

	"github.com/moul-dev/moul-dev/pkg/app"
)

// Version is set at build time using:
// -ldflags="-X main.Version=..."
var Version = "dev"

func main() {
	moulApp := app.New(app.Config{
		Version: Version,
	})

	if err := moulApp.Start(context.Background()); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

// Expose CLI helpers for main_test.go compatibility
var (
	parseUpdateArgs = app.ParseUpdateArgs
	getDBPath       = app.GetDBPath
	parseFlagString = app.ParseFlagString
	hasFlag         = app.HasFlag
)
