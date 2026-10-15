package sse

import (
	"math"
	"runtime"
	"sort"
	"sync"
	"time"
)

// LatencyRecorder collects microsecond duration samples and calculates statistics.
type LatencyRecorder struct {
	mu      sync.Mutex
	samples []float64
}

// NewLatencyRecorder initializes a new recorder with pre-allocated capacity.
func NewLatencyRecorder(capacity int) *LatencyRecorder {
	if capacity <= 0 {
		capacity = 1000
	}
	return &LatencyRecorder{
		samples: make([]float64, 0, capacity),
	}
}

// Record appends a latency measurement in microseconds.
func (lr *LatencyRecorder) Record(durationUs float64) {
	lr.mu.Lock()
	lr.samples = append(lr.samples, durationUs)
	lr.mu.Unlock()
}

// Stats computes summary statistics and percentiles across all recorded samples.
func (lr *LatencyRecorder) Stats() (min, p50, p90, p95, p99, max float64) {
	lr.mu.Lock()
	defer lr.mu.Unlock()

	n := len(lr.samples)
	if n == 0 {
		return 0, 0, 0, 0, 0, 0
	}

	sorted := make([]float64, n)
	copy(sorted, lr.samples)
	sort.Float64s(sorted)

	min = sorted[0]
	max = sorted[n-1]
	p50 = percentile(sorted, 50)
	p90 = percentile(sorted, 90)
	p95 = percentile(sorted, 95)
	p99 = percentile(sorted, 99)
	return min, p50, p90, p95, p99, max
}

func percentile(sorted []float64, pct float64) float64 {
	n := len(sorted)
	if n == 0 {
		return 0
	}
	if n == 1 {
		return sorted[0]
	}
	rank := (pct / 100.0) * float64(n-1)
	lower := int(math.Floor(rank))
	upper := int(math.Ceil(rank))
	weight := rank - float64(lower)
	return sorted[lower]*(1.0-weight) + sorted[upper]*weight
}

// MemorySnapshot captures current Go runtime memory counters.
type MemorySnapshot struct {
	HeapAlloc   uint64
	HeapObjects uint64
	NumGC       uint32
}

// TakeMemorySnapshot reads current runtime memory stats.
func TakeMemorySnapshot() MemorySnapshot {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return MemorySnapshot{
		HeapAlloc:   m.HeapAlloc,
		HeapObjects: m.HeapObjects,
		NumGC:       m.NumGC,
	}
}

// ForceGCCooldown executes consecutive GC sweeps and pauses briefly to settle memory.
func ForceGCCooldown() {
	runtime.GC()
	time.Sleep(50 * time.Millisecond)
	runtime.GC()
	time.Sleep(50 * time.Millisecond)
}
