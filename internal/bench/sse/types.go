package sse

import "time"

// BenchmarkConfig holds the configuration for running SSE benchmark suites.
type BenchmarkConfig struct {
	Mode           string        `json:"mode"`           // "engine" or "network"
	TargetScales   []int         `json:"targetScales"`   // e.g. [100, 1000, 10000]
	IdleDuration   time.Duration `json:"idleDuration"`   // duration to hold idle streams
	FanOutEvents   int           `json:"fanOutEvents"`   // number of broadcast events per tier
	ChurnCycles    int           `json:"churnCycles"`    // total churn connection cycles
	ChurnRate      int           `json:"churnRate"`      // target churn operations per second
	SlowRatio      float64       `json:"slowRatio"`      // fraction of slow consumers (e.g. 0.20)
	ServerURL      string        `json:"serverUrl"`      // external server URL for network mode
	AdminKey       string        `json:"adminKey"`       // admin key for authorization
	Quiet          bool          `json:"quiet"`          // suppress live progress output
	ComparePath    string        `json:"comparePath"`    // path to baseline JSON
	ExportJSONPath string        `json:"exportJsonPath"` // output path for JSON report
	ExportMDPath   string        `json:"exportMdPath"`   // output path for Markdown report
	ExportHTMLPath string        `json:"exportHtmlPath"` // output path for HTML report
}

// DefaultBenchmarkConfig returns a production-ready benchmark configuration.
func DefaultBenchmarkConfig() BenchmarkConfig {
	return BenchmarkConfig{
		Mode:         "engine",
		TargetScales: []int{100, 1000, 10000},
		IdleDuration: 3 * time.Second,
		FanOutEvents: 50,
		ChurnCycles:  2000,
		ChurnRate:    400,
		SlowRatio:    0.20,
	}
}

// IdleTierResult records metrics for an idle connection scale step.
type IdleTierResult struct {
	Target             int     `json:"target"`
	Established        int     `json:"established"`
	DurationMs         float64 `json:"durationMs"`
	HeapAllocBytes     uint64  `json:"heapAllocBytes"`
	BytesPerConn       float64 `json:"bytesPerConn"`
	Goroutines         int     `json:"goroutines"`
	HeartbeatLatencyMs float64 `json:"heartbeatLatencyMs"`
	Passed             bool    `json:"passed"`
}

// IdleResult holds all scale step results for the idle scenario.
type IdleResult struct {
	Tiers  []IdleTierResult `json:"tiers"`
	Passed bool             `json:"passed"`
}

// FanOutTierResult records latency percentiles and throughput for a rule tier.
type FanOutTierResult struct {
	RuleName        string  `json:"ruleName"`        // "public", "simple_auth", "owner_match"
	RuleDescription string  `json:"ruleDescription"` // expression or human description
	Subscribers     int     `json:"subscribers"`
	EventsPublished int     `json:"eventsPublished"`
	TotalDelivered  int64   `json:"totalDelivered"`
	EventsPerSec    float64 `json:"eventsPerSec"`
	MinLatencyUs    float64 `json:"minLatencyUs"`
	P50LatencyUs    float64 `json:"p50LatencyUs"`
	P90LatencyUs    float64 `json:"p90LatencyUs"`
	P95LatencyUs    float64 `json:"p95LatencyUs"`
	P99LatencyUs    float64 `json:"p99LatencyUs"`
	MaxLatencyUs    float64 `json:"maxLatencyUs"`
	Passed          bool    `json:"passed"`
}

// FanOutResult holds all rule evaluation broadcast tiers.
type FanOutResult struct {
	Tiers  []FanOutTierResult `json:"tiers"`
	Passed bool               `json:"passed"`
}

// ChurnResult records metrics from connection churn and leak detection.
type ChurnResult struct {
	TotalCycles          int     `json:"totalCycles"`
	TargetRate           int     `json:"targetRate"`
	DurationMs           float64 `json:"durationMs"`
	ActualRate           float64 `json:"actualRate"`
	GoroutinesBefore     int     `json:"goroutinesBefore"`
	GoroutinesPeak       int     `json:"goroutinesPeak"`
	GoroutinesAfter      int     `json:"goroutinesAfter"`
	GoroutinesDelta      int     `json:"goroutinesDelta"`
	HeapAllocBefore      uint64  `json:"heapAllocBefore"`
	HeapAllocPeak        uint64  `json:"heapAllocPeak"`
	HeapAllocAfter       uint64  `json:"heapAllocAfter"`
	LingeringSubscribers int     `json:"lingeringSubscribers"`
	LingeringConnections int     `json:"lingeringConnections"`
	Passed               bool    `json:"passed"`
	FailReason           string  `json:"failReason,omitempty"`
}

// SlowConsumerResult records eviction and isolation metrics under flood conditions.
type SlowConsumerResult struct {
	TotalSubscribers   int     `json:"totalSubscribers"`
	FastSubscribers    int     `json:"fastSubscribers"`
	StalledSubscribers int     `json:"stalledSubscribers"`
	EventsPublished    int     `json:"eventsPublished"`
	FastDelivered      int64   `json:"fastDelivered"`
	EvictedCount       int     `json:"evictedCount"`
	FastP99LatencyUs   float64 `json:"fastP99LatencyUs"`
	HeadOfLineBlocked  bool    `json:"headOfLineBlocked"`
	PeakHeapBytes      uint64  `json:"peakHeapBytes"`
	Passed             bool    `json:"passed"`
	FailReason         string  `json:"failReason,omitempty"`
}

// ScenarioResults aggregates the individual benchmark scenarios.
type ScenarioResults struct {
	Idle         *IdleResult         `json:"idle,omitempty"`
	FanOut       *FanOutResult       `json:"fanOut,omitempty"`
	Churn        *ChurnResult        `json:"churn,omitempty"`
	SlowConsumer *SlowConsumerResult `json:"slowConsumer,omitempty"`
}

// RegressionItem describes a detected regression against a baseline.
type RegressionItem struct {
	Metric   string  `json:"metric"`
	Baseline float64 `json:"baseline"`
	Current  float64 `json:"current"`
	DeltaPct float64 `json:"deltaPct"`
	Warning  string  `json:"warning"`
}

// ComparisonReport captures regression evaluation against a baseline run.
type ComparisonReport struct {
	BaselineFile  string           `json:"baselineFile"`
	HasRegression bool             `json:"hasRegression"`
	Regressions   []RegressionItem `json:"regressions"`
}

// BenchmarkReport is the comprehensive output container for the entire suite.
type BenchmarkReport struct {
	Timestamp  string            `json:"timestamp"`
	Mode       string            `json:"mode"`
	GoVersion  string            `json:"goVersion"`
	NumCPU     int               `json:"numCpu"`
	OS         string            `json:"os"`
	Arch       string            `json:"arch"`
	Scenarios  ScenarioResults   `json:"scenarios"`
	Passed     bool              `json:"passed"`
	Comparison *ComparisonReport `json:"comparison,omitempty"`
	Summary    string            `json:"summary"`
}
