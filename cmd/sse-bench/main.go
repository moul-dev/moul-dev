package main

import (
	"flag"
	"fmt"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/bench/sse"
)

func main() {
	modeFlag := flag.String("mode", "engine", "Benchmark execution mode: 'engine' (in-process) or 'network' (HTTP/TCP)")
	scenarioFlag := flag.String("scenario", "all", "Scenario to run: 'all', 'idle', 'fanout', 'churn', 'slow-consumer'")
	targetsFlag := flag.String("targets", "100,1000,10000", "Comma-separated target subscriber connection counts")
	fanOutEventsFlag := flag.Int("fanout-events", 50, "Number of broadcast events to publish per tier in fanout benchmark")
	churnCyclesFlag := flag.Int("churn-cycles", 2000, "Number of connection churn cycles to execute")
	churnRateFlag := flag.Int("churn-rate", 400, "Target connection churn rate (ops/second)")
	slowRatioFlag := flag.Float64("slow-ratio", 0.20, "Ratio of stalled slow-consumers (e.g. 0.20 for 20%)")
	urlFlag := flag.String("url", "", "Target external server URL for network mode (leave empty for embedded server)")
	adminKeyFlag := flag.String("admin-key", "", "Admin secret key for authorization in network mode")
	exportJSONFlag := flag.String("export-json", "", "Path to export raw benchmark metrics in JSON format")
	exportMDFlag := flag.String("export-md", "", "Path to export GitHub-flavored Markdown summary report")
	exportHTMLFlag := flag.String("export-html", "", "Path to export interactive HTML visualizer dashboard")
	compareWithFlag := flag.String("compare-with", "", "Path to baseline JSON report for regression comparison")
	quietFlag := flag.Bool("quiet", false, "Suppress terminal table output")

	flag.Parse()

	// Parse target scales
	var targetScales []int
	for _, s := range strings.Split(*targetsFlag, ",") {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		val, err := strconv.Atoi(s)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: invalid target scale %q: %v\n", s, err)
			os.Exit(1)
		}
		targetScales = append(targetScales, val)
	}
	if len(targetScales) == 0 {
		targetScales = []int{100, 1000, 10000}
	}

	cfg := sse.BenchmarkConfig{
		Mode:           strings.ToLower(strings.TrimSpace(*modeFlag)),
		TargetScales:   targetScales,
		IdleDuration:   2 * time.Second,
		FanOutEvents:   *fanOutEventsFlag,
		ChurnCycles:    *churnCyclesFlag,
		ChurnRate:      *churnRateFlag,
		SlowRatio:      *slowRatioFlag,
		ServerURL:      *urlFlag,
		AdminKey:       *adminKeyFlag,
		Quiet:          *quietFlag,
		ComparePath:    *compareWithFlag,
		ExportJSONPath: *exportJSONFlag,
		ExportMDPath:   *exportMDFlag,
		ExportHTMLPath: *exportHTMLFlag,
	}

	if cfg.Mode != "engine" && cfg.Mode != "network" {
		fmt.Fprintf(os.Stderr, "Error: unknown mode %q. Must be 'engine' or 'network'.\n", cfg.Mode)
		os.Exit(1)
	}

	scenario := strings.ToLower(strings.TrimSpace(*scenarioFlag))
	var report *sse.BenchmarkReport
	var err error

	if !cfg.Quiet {
		fmt.Printf("Starting Moul SSE Benchmark [mode=%s, scenario=%s, targets=%v]...\n",
			cfg.Mode, scenario, cfg.TargetScales)
	}

	makeReport := func(scenarios sse.ScenarioResults, passed bool) *sse.BenchmarkReport {
		return &sse.BenchmarkReport{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Mode:      cfg.Mode,
			GoVersion: runtime.Version(),
			NumCPU:    runtime.NumCPU(),
			OS:        runtime.GOOS,
			Arch:      runtime.GOARCH,
			Scenarios: scenarios,
			Passed:    passed,
		}
	}

	switch scenario {
	case "all":
		if cfg.Mode == "engine" {
			report, err = sse.RunAllEngine(cfg)
		} else {
			report, err = sse.RunAllNetwork(cfg)
		}
	case "idle":
		var res *sse.IdleResult
		if cfg.Mode == "engine" {
			res, err = sse.RunIdleScalingEngine(cfg)
		} else {
			res, err = sse.RunIdleScalingNetwork(cfg)
		}
		if err == nil {
			report = makeReport(sse.ScenarioResults{Idle: res}, res.Passed)
		}
	case "fanout":
		var res *sse.FanOutResult
		if cfg.Mode == "engine" {
			res, err = sse.RunFanOutEngine(cfg)
		} else {
			res, err = sse.RunFanOutNetwork(cfg)
		}
		if err == nil {
			report = makeReport(sse.ScenarioResults{FanOut: res}, res.Passed)
		}
	case "churn":
		var res *sse.ChurnResult
		if cfg.Mode == "engine" {
			res, err = sse.RunChurnEngine(cfg)
		} else {
			res, err = sse.RunChurnNetwork(cfg)
		}
		if err == nil {
			report = makeReport(sse.ScenarioResults{Churn: res}, res.Passed)
		}
	case "slow-consumer":
		var res *sse.SlowConsumerResult
		if cfg.Mode == "engine" {
			res, err = sse.RunSlowConsumerEngine(cfg)
		} else {
			res, err = sse.RunSlowConsumerNetwork(cfg)
		}
		if err == nil {
			report = makeReport(sse.ScenarioResults{SlowConsumer: res}, res.Passed)
		}
	default:
		fmt.Fprintf(os.Stderr, "Error: unknown scenario %q\n", scenario)
		os.Exit(1)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "Benchmark execution failed: %v\n", err)
		os.Exit(1)
	}

	// Baseline comparison
	if cfg.ComparePath != "" {
		baseline, loadErr := sse.LoadJSONReport(cfg.ComparePath)
		if loadErr != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to load baseline report: %v\n", loadErr)
		} else {
			report.Comparison = sse.CompareWithBaseline(report, baseline, cfg.ComparePath)
			if report.Comparison.HasRegression {
				report.Passed = false
			}
		}
	}

	// Print terminal tables
	if !cfg.Quiet {
		sse.PrintTerminalReport(os.Stdout, report)
	}

	// File exports
	if cfg.ExportJSONPath != "" {
		if err := sse.SaveJSONReport(report, cfg.ExportJSONPath); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to export JSON report: %v\n", err)
		} else if !cfg.Quiet {
			fmt.Printf("✓ JSON report saved to: %s\n", cfg.ExportJSONPath)
		}
	}

	if cfg.ExportMDPath != "" {
		if err := sse.SaveMarkdownReport(report, cfg.ExportMDPath); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to export Markdown report: %v\n", err)
		} else if !cfg.Quiet {
			fmt.Printf("✓ Markdown report saved to: %s\n", cfg.ExportMDPath)
		}
	}

	if cfg.ExportHTMLPath != "" {
		if err := sse.SaveHTMLReport(report, cfg.ExportHTMLPath); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to export HTML report: %v\n", err)
		} else if !cfg.Quiet {
			fmt.Printf("✓ Interactive HTML report saved to: %s\n", cfg.ExportHTMLPath)
		}
	}

	if !report.Passed {
		os.Exit(2)
	}
}
