package sse

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// SaveJSONReport serializes the benchmark report to a JSON file.
func SaveJSONReport(report *BenchmarkReport, targetPath string) error {
	dir := filepath.Dir(targetPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("create json output dir: %w", err)
	}

	bytes, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal json benchmark report: %w", err)
	}

	if err := os.WriteFile(targetPath, bytes, 0644); err != nil {
		return fmt.Errorf("write json report file: %w", err)
	}
	return nil
}

// LoadJSONReport reads and deserializes a previously saved benchmark report from disk.
func LoadJSONReport(sourcePath string) (*BenchmarkReport, error) {
	bytes, err := os.ReadFile(sourcePath)
	if err != nil {
		return nil, fmt.Errorf("read json report file: %w", err)
	}

	var report BenchmarkReport
	if err := json.Unmarshal(bytes, &report); err != nil {
		return nil, fmt.Errorf("unmarshal json report: %w", err)
	}
	return &report, nil
}

// CompareWithBaseline computes performance regressions between current run and a baseline report.
func CompareWithBaseline(current, baseline *BenchmarkReport, baselineName string) *ComparisonReport {
	report := &ComparisonReport{
		BaselineFile: baselineName,
	}

	// 1. Check Idle RAM / Conn regression (> 20% increase)
	if current.Scenarios.Idle != nil && baseline.Scenarios.Idle != nil {
		for i, currTier := range current.Scenarios.Idle.Tiers {
			if i < len(baseline.Scenarios.Idle.Tiers) {
				baseTier := baseline.Scenarios.Idle.Tiers[i]
				if baseTier.BytesPerConn > 0 && currTier.BytesPerConn > 0 {
					delta := ((currTier.BytesPerConn - baseTier.BytesPerConn) / baseTier.BytesPerConn) * 100.0
					if delta > 20.0 {
						report.HasRegression = true
						report.Regressions = append(report.Regressions, RegressionItem{
							Metric:   fmt.Sprintf("Idle RAM/Conn (%d subs)", currTier.Target),
							Baseline: baseTier.BytesPerConn / 1024.0,
							Current:  currTier.BytesPerConn / 1024.0,
							DeltaPct: delta,
							Warning:  "RAM per connection worsened by > 20%",
						})
					}
				}
			}
		}
	}

	// 2. Check Fan-Out p95 Latency regression (> 20% increase)
	if current.Scenarios.FanOut != nil && baseline.Scenarios.FanOut != nil {
		for i, currTier := range current.Scenarios.FanOut.Tiers {
			if i < len(baseline.Scenarios.FanOut.Tiers) {
				baseTier := baseline.Scenarios.FanOut.Tiers[i]
				if baseTier.P95LatencyUs > 0 && currTier.P95LatencyUs > 0 {
					delta := ((currTier.P95LatencyUs - baseTier.P95LatencyUs) / baseTier.P95LatencyUs) * 100.0
					if delta > 20.0 {
						report.HasRegression = true
						report.Regressions = append(report.Regressions, RegressionItem{
							Metric:   fmt.Sprintf("Fan-Out p95 (%s, %d subs)", currTier.RuleName, currTier.Subscribers),
							Baseline: baseTier.P95LatencyUs,
							Current:  currTier.P95LatencyUs,
							DeltaPct: delta,
							Warning:  "p95 latency degraded by > 20%",
						})
					}
				}
			}
		}
	}

	// 3. Check Churn Goroutine Leaks
	if current.Scenarios.Churn != nil && current.Scenarios.Churn.GoroutinesDelta > 5 {
		report.HasRegression = true
		report.Regressions = append(report.Regressions, RegressionItem{
			Metric:   "Churn Goroutine Leak",
			Baseline: 0,
			Current:  float64(current.Scenarios.Churn.GoroutinesDelta),
			DeltaPct: 100.0,
			Warning:  "Goroutines lingering after GC cooldown",
		})
	}

	return report
}

// SaveMarkdownReport writes a GitHub-flavored Markdown document summarizing benchmark metrics.
func SaveMarkdownReport(report *BenchmarkReport, targetPath string) error {
	dir := filepath.Dir(targetPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("create markdown output dir: %w", err)
	}

	var sb strings.Builder
	sb.WriteString("# Moul SSE Benchmark Report\n\n")
	sb.WriteString(fmt.Sprintf("- **Timestamp**: %s\n", report.Timestamp))
	sb.WriteString(fmt.Sprintf("- **Mode**: `%s`\n", report.Mode))
	sb.WriteString(fmt.Sprintf("- **Go Version**: `%s` (%s/%s)\n", report.GoVersion, report.OS, report.Arch))
	sb.WriteString(fmt.Sprintf("- **CPUs**: %d\n", report.NumCPU))
	if report.Passed {
		sb.WriteString("- **Overall Status**: `PASS` :white_check_mark:\n\n")
	} else {
		sb.WriteString("- **Overall Status**: `FAIL` :x:\n\n")
	}

	// Idle Scenario
	if report.Scenarios.Idle != nil {
		sb.WriteString("## 1. Idle Connection Scaling\n\n")
		sb.WriteString("| Target | Established | Setup Duration | RAM / Connection | Goroutines | Heartbeat Latency | Status |\n")
		sb.WriteString("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n")
		for _, t := range report.Scenarios.Idle.Tiers {
			status := "PASS"
			if !t.Passed {
				status = "FAIL"
			}
			sb.WriteString(fmt.Sprintf("| %d | %d | %.1f ms | %.2f KB | %d | %.2f ms | %s |\n",
				t.Target, t.Established, t.DurationMs, t.BytesPerConn/1024.0, t.Goroutines, t.HeartbeatLatencyMs, status))
		}
		sb.WriteString("\n")
	}

	// Fan-Out Scenario
	if report.Scenarios.FanOut != nil {
		sb.WriteString("## 2. 1-to-N Fan-Out Broadcast & Rule Evaluation\n\n")
		sb.WriteString("| Rule Tier | Subscribers | Throughput | p50 (µs) | p90 (µs) | p95 (µs) | p99 (µs) | Status |\n")
		sb.WriteString("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n")
		for _, t := range report.Scenarios.FanOut.Tiers {
			status := "PASS"
			if !t.Passed {
				status = "FAIL"
			}
			sb.WriteString(fmt.Sprintf("| `%s` | %d | %.0f ev/s | %.1f | %.1f | %.1f | %.1f | %s |\n",
				t.RuleName, t.Subscribers, t.EventsPerSec, t.P50LatencyUs, t.P90LatencyUs, t.P95LatencyUs, t.P99LatencyUs, status))
		}
		sb.WriteString("\n")
	}

	// Churn Scenario
	if report.Scenarios.Churn != nil {
		c := report.Scenarios.Churn
		sb.WriteString("## 3. Connection Churn & Leak Detection\n\n")
		sb.WriteString(fmt.Sprintf("- **Total Cycles**: %d (Target: %d/s, Actual: %.1f/s)\n", c.TotalCycles, c.TargetRate, c.ActualRate))
		sb.WriteString(fmt.Sprintf("- **Goroutines**: Before: %d, Peak: %d, After: %d (Delta: %d)\n", c.GoroutinesBefore, c.GoroutinesPeak, c.GoroutinesAfter, c.GoroutinesDelta))
		sb.WriteString(fmt.Sprintf("- **Heap Alloc**: Before: %.2f MB, Peak: %.2f MB, After: %.2f MB\n", float64(c.HeapAllocBefore)/(1024*1024), float64(c.HeapAllocPeak)/(1024*1024), float64(c.HeapAllocAfter)/(1024*1024)))
		sb.WriteString(fmt.Sprintf("- **Lingering Clients**: %d\n", c.LingeringSubscribers))
		sb.WriteString(fmt.Sprintf("- **Result**: %v\n\n", c.Passed))
	}

	// Slow Consumer Scenario
	if report.Scenarios.SlowConsumer != nil {
		s := report.Scenarios.SlowConsumer
		sb.WriteString("## 4. Slow-Consumer / Backpressure Torture Test\n\n")
		sb.WriteString(fmt.Sprintf("- **Subscribers**: %d Total (%d Fast, %d Stalled)\n", s.TotalSubscribers, s.FastSubscribers, s.StalledSubscribers))
		sb.WriteString(fmt.Sprintf("- **Fast Consumer Delivery**: %d events (p99 latency: %.1f µs)\n", s.FastDelivered, s.FastP99LatencyUs))
		sb.WriteString(fmt.Sprintf("- **Slow Consumer Evictions**: %d / %d evicted\n", s.EvictedCount, s.StalledSubscribers))
		sb.WriteString(fmt.Sprintf("- **Result**: %v\n\n", s.Passed))
	}

	return os.WriteFile(targetPath, []byte(sb.String()), 0644)
}
