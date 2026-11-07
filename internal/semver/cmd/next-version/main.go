// Command next-version prints the next release tag from the tags listed on stdin, one per line:
//
//	git tag --list 'v*' | go run ./internal/semver/cmd/next-version -bump=prerelease
//
// `make next-version` and `make release-tag` wrap it; see package semver for the rules.
package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"

	"github.com/moul-dev/moul-dev/internal/semver"
)

func main() {
	bump := flag.String("bump", "", "kind of release: major, minor, patch or prerelease")
	preid := flag.String("preid", "", "prerelease channel to open or switch to: alpha, beta, rc")
	flag.Parse()

	var tags []string
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		tags = append(tags, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "next-version: reading tags:", err)
		os.Exit(1)
	}

	next, err := semver.Next(tags, *bump, *preid)
	if err != nil {
		fmt.Fprintln(os.Stderr, "next-version:", err)
		os.Exit(1)
	}
	fmt.Println(next.Tag())
}
