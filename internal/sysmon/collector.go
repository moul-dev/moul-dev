package sysmon

import (
	"bytes"
	"context"
	"encoding/json"
	"runtime"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
)

// MetricPoint represents a parsed measurement metric.
type MetricPoint struct {
	Name      string                 `json:"name"`
	Fields    map[string]interface{} `json:"fields"`
	Tags      map[string]string      `json:"tags"`
	Timestamp int64                  `json:"timestamp"`
}

// MetricsJSONBatch represents a batch payload sent to sysmon.
type MetricsJSONBatch struct {
	Metrics []MetricPoint `json:"metrics"`
}

// CPUStats holds CPU usage metrics.
type CPUStats struct {
	UsageActive float64 `json:"usage_active"`
	UsageUser   float64 `json:"usage_user"`
	UsageSystem float64 `json:"usage_system"`
	UsageIdle   float64 `json:"usage_idle"`
	Cores       int     `json:"cores"`
}

// MemoryStats holds Memory usage metrics in bytes & percentage.
type MemoryStats struct {
	UsedPercent float64 `json:"used_percent"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	Available   uint64  `json:"available"`
}

// DiskStats holds Disk usage metrics in bytes & percentage.
type DiskStats struct {
	UsedPercent float64 `json:"used_percent"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	Path        string  `json:"path"`
}

// NetStats holds Network throughput & packet counters.
type NetStats struct {
	BytesSent   uint64 `json:"bytes_sent"`
	BytesRecv   uint64 `json:"bytes_recv"`
	PacketsSent uint64 `json:"packets_sent"`
	PacketsRecv uint64 `json:"packets_recv"`
}

// SystemStats holds host load averages, uptime, and process stats.
type SystemStats struct {
	Load1         float64 `json:"load1"`
	Load5         float64 `json:"load5"`
	Load15        float64 `json:"load15"`
	Uptime        uint64  `json:"uptime"`
	NumGoroutines int     `json:"num_goroutines"`
}

// MetricsSnapshot represents a point-in-time state of system metrics.
type MetricsSnapshot struct {
	Timestamp time.Time   `json:"timestamp"`
	OS        string      `json:"os"`
	Arch      string      `json:"arch"`
	CPU       CPUStats    `json:"cpu"`
	Memory    MemoryStats `json:"memory"`
	Disk      DiskStats   `json:"disk"`
	Network   NetStats    `json:"network"`
	System    SystemStats `json:"system"`
}

// SystemStatusResponse is the public API response format.
type SystemStatusResponse struct {
	Current MetricsSnapshot   `json:"current"`
	History []MetricsSnapshot `json:"history"`
}

// Collector maintains system metrics and history state.
type Collector struct {
	mu         sync.RWMutex
	current    MetricsSnapshot
	history    []MetricsSnapshot
	maxHistory int
	startTime  time.Time
}

// NewCollector constructs a new system metrics collector.
func NewCollector() *Collector {
	return &Collector{
		maxHistory: 30,
		startTime:  time.Now(),
		current: MetricsSnapshot{
			Timestamp: time.Now(),
			OS:        runtime.GOOS,
			Arch:      runtime.GOARCH,
			CPU:       CPUStats{Cores: runtime.NumCPU()},
		},
		history: make([]MetricsSnapshot, 0, 30),
	}
}

// Start initializes the native metrics collection ticker in background.
func (c *Collector) Start(ctx context.Context) error {
	logger.Info("System monitoring collector initialized")

	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()

		c.tick()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				c.tick()
			}
		}
	}()

	return nil
}

// Close stops the collector.
func (c *Collector) Close() error {
	logger.Info("System monitoring collector stopped")
	return nil
}

// ProcessPayload decodes metric JSON payloads from API pushes.
func (c *Collector) ProcessPayload(data []byte) {
	data = bytes.TrimSpace(data)
	if len(data) == 0 {
		return
	}

	var points []MetricPoint

	// 1. Try single MetricPoint
	var pt MetricPoint
	if err := json.Unmarshal(data, &pt); err == nil && pt.Name != "" {
		points = append(points, pt)
	} else {
		// 2. Try array of MetricPoints
		var ptArray []MetricPoint
		if err := json.Unmarshal(data, &ptArray); err == nil && len(ptArray) > 0 {
			points = ptArray
		} else {
			// 3. Try MetricsJSONBatch struct {"metrics": [...]}
			var batch MetricsJSONBatch
			if err := json.Unmarshal(data, &batch); err == nil && len(batch.Metrics) > 0 {
				points = batch.Metrics
			}
		}
	}

	if len(points) == 0 {
		return
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	c.current.Timestamp = time.Now()

	for _, p := range points {
		c.applyMetricPointLocked(p)
	}
}

func (c *Collector) applyMetricPointLocked(p MetricPoint) {
	switch p.Name {
	case "cpu":
		if cpuType, ok := p.Tags["cpu"]; !ok || cpuType == "cpu-total" || cpuType == "total" {
			c.current.CPU.UsageActive = getFloat(p.Fields, "usage_active")
			c.current.CPU.UsageUser = getFloat(p.Fields, "usage_user")
			c.current.CPU.UsageSystem = getFloat(p.Fields, "usage_system")
			c.current.CPU.UsageIdle = getFloat(p.Fields, "usage_idle")
			if c.current.CPU.UsageActive == 0 && c.current.CPU.UsageIdle > 0 {
				c.current.CPU.UsageActive = 100.0 - c.current.CPU.UsageIdle
			}
		}
	case "mem":
		c.current.Memory.UsedPercent = getFloat(p.Fields, "used_percent")
		c.current.Memory.Total = getUint64(p.Fields, "total")
		c.current.Memory.Used = getUint64(p.Fields, "used")
		c.current.Memory.Free = getUint64(p.Fields, "free")
		c.current.Memory.Available = getUint64(p.Fields, "available")
	case "disk":
		if path, ok := p.Tags["path"]; !ok || path == "/" || c.current.Disk.Path == "" {
			c.current.Disk.UsedPercent = getFloat(p.Fields, "used_percent")
			c.current.Disk.Total = getUint64(p.Fields, "total")
			c.current.Disk.Used = getUint64(p.Fields, "used")
			c.current.Disk.Free = getUint64(p.Fields, "free")
			if path != "" {
				c.current.Disk.Path = path
			} else {
				c.current.Disk.Path = "/"
			}
		}
	case "net":
		c.current.Network.BytesSent = getUint64(p.Fields, "bytes_sent")
		c.current.Network.BytesRecv = getUint64(p.Fields, "bytes_recv")
		c.current.Network.PacketsSent = getUint64(p.Fields, "packets_sent")
		c.current.Network.PacketsRecv = getUint64(p.Fields, "packets_recv")
	case "system":
		c.current.System.Load1 = getFloat(p.Fields, "load1")
		c.current.System.Load5 = getFloat(p.Fields, "load5")
		c.current.System.Load15 = getFloat(p.Fields, "load15")
		if uptime := getUint64(p.Fields, "uptime"); uptime > 0 {
			c.current.System.Uptime = uptime
		}
		if nCpus := getInt(p.Fields, "n_cpus"); nCpus > 0 {
			c.current.CPU.Cores = nCpus
		}
	}
}

// tick updates history and native metrics.
func (c *Collector) tick() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	c.current.Timestamp = now
	c.current.OS = runtime.GOOS
	c.current.Arch = runtime.GOARCH
	c.current.System.NumGoroutines = runtime.NumGoroutine()

	c.populateNativeStatsLocked(now)

	// Append to history
	c.history = append(c.history, c.current)
	if len(c.history) > c.maxHistory {
		c.history = c.history[len(c.history)-c.maxHistory:]
	}
}

// populateNativeStatsLocked generates standard Go runtime stats.
func (c *Collector) populateNativeStatsLocked(now time.Time) {
	c.current.System.Uptime = uint64(now.Sub(c.startTime).Seconds())
	if c.current.CPU.Cores == 0 {
		c.current.CPU.Cores = runtime.NumCPU()
	}

	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	c.current.Memory.AllocatedBytes(m.Alloc, m.Sys)
}

// AllocatedBytes sets memory stats based on Go memstats.
func (m *MemoryStats) AllocatedBytes(alloc, sys uint64) {
	m.Used = alloc
	m.Total = sys
	if m.Total > 0 {
		m.UsedPercent = (float64(m.Used) / float64(m.Total)) * 100.0
		m.Free = m.Total - m.Used
		m.Available = m.Free
	}
}

// GetSnapshot returns the current system status response with current metrics and history.
func (c *Collector) GetSnapshot() SystemStatusResponse {
	c.mu.RLock()
	defer c.mu.RUnlock()

	historyCopy := make([]MetricsSnapshot, len(c.history))
	copy(historyCopy, c.history)

	return SystemStatusResponse{
		Current: c.current,
		History: historyCopy,
	}
}

// Helper conversion functions
func getFloat(fields map[string]interface{}, key string) float64 {
	val, ok := fields[key]
	if !ok {
		return 0.0
	}
	switch v := val.(type) {
	case float64:
		return v
	case float32:
		return float64(v)
	case int64:
		return float64(v)
	case int:
		return float64(v)
	case uint64:
		return float64(v)
	case json.Number:
		f, _ := v.Float64()
		return f
	default:
		return 0.0
	}
}

func getUint64(fields map[string]interface{}, key string) uint64 {
	val, ok := fields[key]
	if !ok {
		return 0
	}
	switch v := val.(type) {
	case float64:
		return uint64(v)
	case int64:
		return uint64(v)
	case uint64:
		return v
	case int:
		return uint64(v)
	case json.Number:
		i, _ := v.Int64()
		return uint64(i)
	default:
		return 0
	}
}

func getInt(fields map[string]interface{}, key string) int {
	val, ok := fields[key]
	if !ok {
		return 0
	}
	switch v := val.(type) {
	case float64:
		return int(v)
	case int64:
		return int(v)
	case int:
		return v
	case json.Number:
		i, _ := v.Int64()
		return int(i)
	default:
		return 0
	}
}
