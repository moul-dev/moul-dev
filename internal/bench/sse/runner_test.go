package sse

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestLatencyRecorder(t *testing.T) {
	rec := NewLatencyRecorder(10)
	for i := 1; i <= 100; i++ {
		rec.Record(float64(i * 10))
	}

	minL, p50, p90, p95, p99, maxL := rec.Stats()
	if minL != 10 {
		t.Errorf("Expected min 10, got %f", minL)
	}
	if maxL != 1000 {
		t.Errorf("Expected max 1000, got %f", maxL)
	}
	if p50 < 450 || p50 > 550 {
		t.Errorf("Expected p50 around 500, got %f", p50)
	}
	if p90 < 850 || p90 > 950 {
		t.Errorf("Expected p90 around 900, got %f", p90)
	}
	if p95 < 900 || p95 > 980 {
		t.Errorf("Expected p95 around 950, got %f", p95)
	}
	if p99 < 980 || p99 > 1000 {
		t.Errorf("Expected p99 around 990, got %f", p99)
	}
}

func TestEngineBenchmark_Smoke(t *testing.T) {
	cfg := BenchmarkConfig{
		Mode:         "engine",
		TargetScales: []int{10, 50},
		IdleDuration: 50 * time.Millisecond,
		FanOutEvents: 10,
		ChurnCycles:  50,
		ChurnRate:    200,
		SlowRatio:    0.20,
	}

	// 1. Idle Scaling Engine
	idleRes, err := RunIdleScalingEngine(cfg)
	if err != nil {
		t.Fatalf("RunIdleScalingEngine failed: %v", err)
	}
	if len(idleRes.Tiers) != 2 {
		t.Fatalf("Expected 2 tiers, got %d", len(idleRes.Tiers))
	}

	// 2. FanOut Engine
	fanOutRes, err := RunFanOutEngine(cfg)
	if err != nil {
		t.Fatalf("RunFanOutEngine failed: %v", err)
	}
	if len(fanOutRes.Tiers) == 0 {
		t.Fatal("Expected fanout tiers, got 0")
	}

	// 3. Churn Engine
	churnRes, err := RunChurnEngine(cfg)
	if err != nil {
		t.Fatalf("RunChurnEngine failed: %v", err)
	}
	if churnRes.TotalCycles != 50 {
		t.Errorf("Expected 50 cycles, got %d", churnRes.TotalCycles)
	}

	// 4. Slow Consumer Engine
	slowRes, err := RunSlowConsumerEngine(cfg)
	if err != nil {
		t.Fatalf("RunSlowConsumerEngine failed: %v", err)
	}
	if slowRes.FastDelivered == 0 {
		t.Error("Expected fast consumers to receive events")
	}
}

func TestReportersAndBaselineComparison(t *testing.T) {
	tmpDir := t.TempDir()
	jsonPath := filepath.Join(tmpDir, "report.json")
	mdPath := filepath.Join(tmpDir, "report.md")
	htmlPath := filepath.Join(tmpDir, "report.html")

	report := &BenchmarkReport{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Mode:      "engine",
		GoVersion: "go1.26.5",
		NumCPU:    8,
		OS:        "darwin",
		Arch:      "arm64",
		Passed:    true,
		Scenarios: ScenarioResults{
			Idle: &IdleResult{
				Passed: true,
				Tiers: []IdleTierResult{
					{Target: 100, Established: 100, DurationMs: 5.0, BytesPerConn: 12000, Goroutines: 100, HeartbeatLatencyMs: 1.2, Passed: true},
				},
			},
			FanOut: &FanOutResult{
				Passed: true,
				Tiers: []FanOutTierResult{
					{RuleName: "public", Subscribers: 100, EventsPublished: 50, TotalDelivered: 5000, EventsPerSec: 1500, P50LatencyUs: 50, P95LatencyUs: 120, Passed: true},
				},
			},
			Churn: &ChurnResult{
				Passed: true, TotalCycles: 500, TargetRate: 200, ActualRate: 198.5, GoroutinesDelta: 0,
			},
			SlowConsumer: &SlowConsumerResult{
				Passed: true, TotalSubscribers: 100, FastSubscribers: 80, StalledSubscribers: 20, EvictedCount: 20, FastDelivered: 16000,
			},
		},
	}

	// Test JSON Save & Load
	if err := SaveJSONReport(report, jsonPath); err != nil {
		t.Fatalf("SaveJSONReport failed: %v", err)
	}
	loaded, err := LoadJSONReport(jsonPath)
	if err != nil {
		t.Fatalf("LoadJSONReport failed: %v", err)
	}
	if loaded.Mode != "engine" {
		t.Errorf("Expected mode engine, got %s", loaded.Mode)
	}

	// Test Baseline Comparison (no regression)
	comp := CompareWithBaseline(report, loaded, "baseline.json")
	if comp.HasRegression {
		t.Error("Expected no regression against identical baseline")
	}

	// Test Baseline Comparison (with regression)
	degraded := *report
	degraded.Scenarios.Idle.Tiers[0].BytesPerConn = 25000 // > 20% increase
	comp2 := CompareWithBaseline(&degraded, loaded, "baseline.json")
	if !comp2.HasRegression {
		t.Error("Expected regression detected for degraded RAM")
	}

	// Test Markdown Save
	if err := SaveMarkdownReport(report, mdPath); err != nil {
		t.Fatalf("SaveMarkdownReport failed: %v", err)
	}
	mdContent, err := os.ReadFile(mdPath)
	if err != nil || len(mdContent) == 0 {
		t.Errorf("Failed to read generated markdown report: %v", err)
	}

	// Test HTML Save
	if err := SaveHTMLReport(report, htmlPath); err != nil {
		t.Fatalf("SaveHTMLReport failed: %v", err)
	}
	htmlContent, err := os.ReadFile(htmlPath)
	if err != nil || len(htmlContent) == 0 {
		t.Errorf("Failed to read generated HTML report: %v", err)
	}
}
