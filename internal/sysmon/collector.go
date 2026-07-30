package sysmon

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
)

// MetricPoint represents a parsed measurement metric from Telegraf.
type MetricPoint struct {
	Name      string                 `json:"name"`
	Fields    map[string]interface{} `json:"fields"`
	Tags      map[string]string      `json:"tags"`
	Timestamp int64                  `json:"timestamp"`
}

// TelegrafJSONBatch represents a batch payload sent by Telegraf socket_writer.
type TelegrafJSONBatch struct {
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
	Timestamp      time.Time   `json:"timestamp"`
	OS             string      `json:"os"`
	Arch           string      `json:"arch"`
	TelegrafActive bool        `json:"telegraf_active"`
	SocketPath     string      `json:"socket_path"`
	CPU            CPUStats    `json:"cpu"`
	Memory         MemoryStats `json:"memory"`
	Disk           DiskStats   `json:"disk"`
	Network        NetStats    `json:"network"`
	System         SystemStats `json:"system"`
}

// SystemStatusResponse is the public API response format.
type SystemStatusResponse struct {
	Current MetricsSnapshot   `json:"current"`
	History []MetricsSnapshot `json:"history"`
}

// Collector listens on a Unix Domain Socket for Telegraf metrics and maintains current state.
type Collector struct {
	mu             sync.RWMutex
	socketPath     string
	listener       net.Listener
	closed         bool
	lastTelegrafAt time.Time
	current        MetricsSnapshot
	history        []MetricsSnapshot
	maxHistory     int
	startTime      time.Time
}

// NewCollector constructs a new Unix Domain Socket collector.
func NewCollector(socketPath string) *Collector {
	if socketPath == "" {
		socketPath = "/tmp/moul-telegraf.sock"
	}
	return &Collector{
		socketPath: socketPath,
		maxHistory: 30,
		startTime:  time.Now(),
		current: MetricsSnapshot{
			Timestamp:      time.Now(),
			OS:             runtime.GOOS,
			Arch:           runtime.GOARCH,
			TelegrafActive: false,
			SocketPath:     socketPath,
			CPU:            CPUStats{Cores: runtime.NumCPU()},
		},
		history: make([]MetricsSnapshot, 0, 30),
	}
}

// Start initializes the Unix Domain Socket listener and listens in background.
func (c *Collector) Start(ctx context.Context) error {
	c.mu.Lock()
	socketPath := c.socketPath
	c.mu.Unlock()

	// Ensure parent directory exists
	dir := filepath.Dir(socketPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create socket directory: %w", err)
	}

	// Remove stale socket file if present
	_ = os.Remove(socketPath)

	l, err := net.Listen("unix", socketPath)
	if err != nil {
		return fmt.Errorf("failed to listen on unix socket %s: %w", socketPath, err)
	}

	// Set socket permissions so Telegraf runner can connect
	_ = os.Chmod(socketPath, 0777)

	c.mu.Lock()
	c.listener = l
	c.mu.Unlock()

	logger.Info("Telegraf Unix Domain Socket collector initialized", "socket", socketPath)

	// Goroutine to accept UDS connections
	go func() {
		for {
			conn, err := l.Accept()
			if err != nil {
				c.mu.RLock()
				isClosed := c.closed
				c.mu.RUnlock()
				if isClosed {
					return
				}
				select {
				case <-ctx.Done():
					return
				default:
					time.Sleep(100 * time.Millisecond)
					continue
				}
			}

			go c.handleConnection(conn)
		}
	}()

	// Periodic task to roll snapshots into history and update fallback stats
	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()

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

// Close stops the socket listener and removes the socket file.
func (c *Collector) Close() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.closed = true
	var err error
	if c.listener != nil {
		err = c.listener.Close()
		c.listener = nil
	}

	_ = os.Remove(c.socketPath)
	logger.Info("Telegraf Unix Domain Socket collector stopped", "socket", c.socketPath)
	return err
}

// handleConnection reads incoming data streams from Telegraf socket_writer.
func (c *Collector) handleConnection(conn net.Conn) {
	defer conn.Close()

	reader := bufio.NewReader(conn)
	for {
		line, err := reader.ReadBytes('\n')
		if len(line) > 0 {
			c.ProcessPayload(line)
		}
		if err != nil {
			if err != io.EOF {
				// Connection finished or error
			}
			break
		}
	}
}

// ProcessPayload decodes metric JSON payloads from Telegraf or API pushes.
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
			// 3. Try TelegrafJSONBatch struct {"metrics": [...]}
			var batch TelegrafJSONBatch
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

	now := time.Now()
	c.lastTelegrafAt = now
	c.current.TelegrafActive = true
	c.current.Timestamp = now

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

// tick updates history and fallback metrics if Telegraf is disconnected.
func (c *Collector) tick() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	telegrafActive := time.Since(c.lastTelegrafAt) < 15*time.Second
	c.current.TelegrafActive = telegrafActive
	c.current.Timestamp = now
	c.current.OS = runtime.GOOS
	c.current.Arch = runtime.GOARCH
	c.current.System.NumGoroutines = runtime.NumGoroutine()

	if !telegrafActive {
		c.populateFallbackStatsLocked(now)
	}

	// Append to history
	c.history = append(c.history, c.current)
	if len(c.history) > c.maxHistory {
		c.history = c.history[len(c.history)-c.maxHistory:]
	}
}

// populateFallbackStatsLocked generates standard Go runtime stats when Telegraf isn't active.
func (c *Collector) populateFallbackStatsLocked(now time.Time) {
	c.current.System.Uptime = uint64(now.Sub(c.startTime).Seconds())
	if c.current.CPU.Cores == 0 {
		c.current.CPU.Cores = runtime.NumCPU()
	}

	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	c.current.Memory.AllocatedBytes(m.Alloc, m.Sys)
}

// AllocatedBytes sets memory stats based on Go memstats fallback.
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
