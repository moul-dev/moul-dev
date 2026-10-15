package sse

import (
	"fmt"
	"io"
	"os"
	"strings"
)

const (
	colorReset  = "\033[0m"
	colorBold   = "\033[1m"
	colorDim    = "\033[2m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
	colorCyan   = "\033[36m"
)

// PrintTerminalReport renders the benchmark report in clean, formatted ANSI terminal tables.
func PrintTerminalReport(w io.Writer, report *BenchmarkReport) {
	if w == nil {
		w = os.Stdout
	}

	fmt.Fprintln(w)
	fmt.Fprintf(w, "%s%s================================================================================%s\n", colorBold, colorCyan, colorReset)
	fmt.Fprintf(w, "%s%s                       MOUL SSE BENCHMARK REPORT (%s)%s\n", colorBold, colorCyan, strings.ToUpper(report.Mode), colorReset)
	fmt.Fprintf(w, "%s%s================================================================================%s\n", colorBold, colorCyan, colorReset)
	fmt.Fprintf(w, "  Timestamp: %s  |  Go: %s  |  CPUs: %d  |  OS/Arch: %s/%s\n",
		report.Timestamp, report.GoVersion, report.NumCPU, report.OS, report.Arch)
	fmt.Fprintln(w)

	// Scenario 1: Idle Connection Scaling
	if report.Scenarios.Idle != nil {
		fmt.Fprintf(w, "%s%s[1/4] Idle Connection Scaling%s\n", colorBold, colorBlue, colorReset)
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		fmt.Fprintf(w, " %-8s | %-11s | %-10s | %-10s | %-10s | %-8s | %-6s\n",
			"Target", "Established", "Setup Time", "RAM / Conn", "Goroutines", "Ping Lat", "Status")
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		for _, t := range report.Scenarios.Idle.Tiers {
			status := formatStatus(t.Passed)
			fmt.Fprintf(w, " %-8d | %-11d | %8.1fms | %8.1f KB | %10d | %6.2fms | %s\n",
				t.Target, t.Established, t.DurationMs, t.BytesPerConn/1024.0, t.Goroutines, t.HeartbeatLatencyMs, status)
		}
		fmt.Fprintln(w)
	}

	// Scenario 2: 1-to-N Fan-Out Broadcast & Rule Evaluation
	if report.Scenarios.FanOut != nil {
		fmt.Fprintf(w, "%s%s[2/4] 1-to-N Fan-Out Broadcast & Rule Evaluation%s\n", colorBold, colorBlue, colorReset)
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		fmt.Fprintf(w, " %-12s | %-6s | %-9s | %-8s | %-8s | %-8s | %-9s | %-6s\n",
			"Rule Tier", "Conns", "Throughput", "p50 (µs)", "p90 (µs)", "p95 (µs)", "p99 (µs)", "Status")
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		for _, t := range report.Scenarios.FanOut.Tiers {
			status := formatStatus(t.Passed)
			fmt.Fprintf(w, " %-12s | %-6d | %7.0f/s | %8.1f | %8.1f | %8.1f | %9.1f | %s\n",
				t.RuleName, t.Subscribers, t.EventsPerSec, t.P50LatencyUs, t.P90LatencyUs, t.P95LatencyUs, t.P99LatencyUs, status)
		}
		fmt.Fprintln(w)
	}

	// Scenario 3: Connection Churn & Leak Detection
	if report.Scenarios.Churn != nil {
		c := report.Scenarios.Churn
		fmt.Fprintf(w, "%s%s[3/4] Connection Churn & Leak Detection%s\n", colorBold, colorBlue, colorReset)
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		fmt.Fprintf(w, "  Total Cycles: %d | Target Rate: %d/s | Actual Rate: %.1f/s | Duration: %.1fms\n",
			c.TotalCycles, c.TargetRate, c.ActualRate, c.DurationMs)
		fmt.Fprintf(w, "  Goroutines: Before=%d, Peak=%d, After=%d (Δ %d)\n",
			c.GoroutinesBefore, c.GoroutinesPeak, c.GoroutinesAfter, c.GoroutinesDelta)
		fmt.Fprintf(w, "  Heap Alloc: Before=%.2f MB, Peak=%.2f MB, After=%.2f MB\n",
			float64(c.HeapAllocBefore)/(1024*1024), float64(c.HeapAllocPeak)/(1024*1024), float64(c.HeapAllocAfter)/(1024*1024))
		fmt.Fprintf(w, "  Lingering Registrations: Subscribers=%d, Connections=%d\n",
			c.LingeringSubscribers, c.LingeringConnections)
		fmt.Fprintf(w, "  Verdict: %s\n", formatStatus(c.Passed))
		if c.FailReason != "" {
			fmt.Fprintf(w, "  Failure Reason: %s%s%s\n", colorRed, c.FailReason, colorReset)
		}
		fmt.Fprintln(w)
	}

	// Scenario 4: Slow-Consumer / Backpressure Torture Test
	if report.Scenarios.SlowConsumer != nil {
		s := report.Scenarios.SlowConsumer
		fmt.Fprintf(w, "%s%s[4/4] Slow-Consumer / Backpressure Torture Test%s\n", colorBold, colorBlue, colorReset)
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		fmt.Fprintf(w, "  Subscribers: %d Total (Fast=%d, Stalled=%d) | Flood Events Published: %d\n",
			s.TotalSubscribers, s.FastSubscribers, s.StalledSubscribers, s.EventsPublished)
		fmt.Fprintf(w, "  Fast Consumer Delivery: %d events received (p99 latency: %.1f µs)\n",
			s.FastDelivered, s.FastP99LatencyUs)
		fmt.Fprintf(w, "  Slow Consumer Evictions: %d / %d stalled clients evicted\n",
			s.EvictedCount, s.StalledSubscribers)
		fmt.Fprintf(w, "  Head-of-Line Blocking Detected: %v\n", s.HeadOfLineBlocked)
		fmt.Fprintf(w, "  Verdict: %s\n", formatStatus(s.Passed))
		if s.FailReason != "" {
			fmt.Fprintf(w, "  Failure Reason: %s%s%s\n", colorRed, s.FailReason, colorReset)
		}
		fmt.Fprintln(w)
	}

	// Baseline Regression Comparison
	if report.Comparison != nil {
		fmt.Fprintf(w, "%s%s[Baseline Comparison] vs %s%s\n", colorBold, colorYellow, report.Comparison.BaselineFile, colorReset)
		fmt.Fprintf(w, "--------------------------------------------------------------------------------\n")
		if len(report.Comparison.Regressions) == 0 {
			fmt.Fprintf(w, "  %sPASS: Zero performance regressions detected against baseline (<20%% variance).%s\n", colorGreen, colorReset)
		} else {
			for _, r := range report.Comparison.Regressions {
				fmt.Fprintf(w, "  %s[REGRESSION]%s %-30s | Base: %8.1f | Curr: %8.1f | Δ %+.1f%% (%s)\n",
					colorRed, colorReset, r.Metric, r.Baseline, r.Current, r.DeltaPct, r.Warning)
			}
		}
		fmt.Fprintln(w)
	}

	// Overall Outcome
	fmt.Fprintf(w, "%s================================================================================%s\n", colorBold, colorReset)
	if report.Passed {
		fmt.Fprintf(w, "  %s%sOVERALL RESULT: [PASS] ALL SSE BENCHMARK SCENARIOS MET PERFORMANCE THRESHOLDS%s\n",
			colorBold, colorGreen, colorReset)
	} else {
		fmt.Fprintf(w, "  %s%sOVERALL RESULT: [FAIL] ONE OR MORE BENCHMARK CRITERIA FAILED%s\n",
			colorBold, colorRed, colorReset)
	}
	fmt.Fprintf(w, "%s================================================================================%s\n\n", colorBold, colorReset)
}

func formatStatus(passed bool) string {
	if passed {
		return fmt.Sprintf("%s%sPASS%s", colorBold, colorGreen, colorReset)
	}
	return fmt.Sprintf("%s%sFAIL%s", colorBold, colorRed, colorReset)
}
