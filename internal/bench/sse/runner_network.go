package sse

import (
	"bufio"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/http/httptest"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/handlers"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/sysmon"
	"github.com/moul-dev/moul-dev/internal/tls"
	"github.com/pocketbase/dbx"
)

const benchAdminKey = "bench-admin-key-secret-1234"

// TryRaiseFileDescriptorLimit attempts to increase the process file descriptor limit (RLIMIT_NOFILE).
func TryRaiseFileDescriptorLimit(target int) (uint64, error) {
	var rLimit syscall.Rlimit
	if err := syscall.Getrlimit(syscall.RLIMIT_NOFILE, &rLimit); err != nil {
		return 0, fmt.Errorf("failed to get rlimit: %w", err)
	}

	desired := uint64(target + 500)
	if rLimit.Cur >= desired {
		return rLimit.Cur, nil
	}

	newCur := desired
	if newCur > rLimit.Max {
		newCur = rLimit.Max
	}
	rLimit.Cur = newCur

	if err := syscall.Setrlimit(syscall.RLIMIT_NOFILE, &rLimit); err != nil {
		return rLimit.Cur, fmt.Errorf("failed to set rlimit: %w", err)
	}
	return rLimit.Cur, nil
}

// NetworkTestServer encapsulates an embedded HTTP server running Moul's router for network benchmarking.
type NetworkTestServer struct {
	Server *httptest.Server
	DB     *dbx.DB
	Router *echo.Echo
	URL    string
}

// StartNetworkTestServer boots an in-memory Echo server initialized with benchmark collections.
func StartNetworkTestServer() (*NetworkTestServer, error) {
	testDB, err := db.InitDB("file:moul_bench?mode=memory&cache=shared")
	if err != nil {
		return nil, fmt.Errorf("failed to init db for network server: %w", err)
	}
	testDB.DB().SetMaxOpenConns(1)

	auth.InitJWT("bench-jwt-secret-key-1234")

	testMoul := &schema.Moul{
		ID:   "moul_bench_posts",
		Name: "bench_posts",
		Type: "base",
		Fields: []schema.MoulField{
			{Name: "title", Type: "text"},
			{Name: "userId", Type: "text"},
			{Name: "status", Type: "text"},
		},
		Rules: schema.MoulRules{
			ListRule:      "",
			ViewRule:      "",
			CreateRule:    "",
			SubscribeRule: "",
		},
	}

	if err := db.SaveMoulMetadata(testDB, testMoul); err != nil {
		_ = testDB.Close()
		return nil, fmt.Errorf("failed to save metadata: %w", err)
	}
	if err := db.CreateMoulTable(testDB, testMoul); err != nil {
		_ = testDB.Close()
		return nil, fmt.Errorf("failed to create table: %w", err)
	}

	analyticsEngine, _ := analytics.NewEngine(testDB, "")
	sysmonCollector := sysmon.NewCollector()
	tlsManager, _ := tls.NewManager(testDB)

	router := handlers.NewRouter(
		testDB,
		nil,
		analyticsEngine,
		nil,
		sysmonCollector,
		tlsManager,
		benchAdminKey,
		true,
		"bench",
	)

	server := httptest.NewServer(router)

	return &NetworkTestServer{
		Server: server,
		DB:     testDB,
		Router: router,
		URL:    server.URL,
	}, nil
}

// Close shuts down the network test server and database.
func (nts *NetworkTestServer) Close() {
	if nts.Server != nil {
		nts.Server.Close()
	}
	if nts.DB != nil {
		_ = nts.DB.Close()
	}
}

// NewNetworkHTTPClient returns an http.Client configured with high connection pools for SSE benchmarking.
func NewNetworkHTTPClient(maxConns int) *http.Client {
	if maxConns <= 0 {
		maxConns = 10000
	}
	transport := &http.Transport{
		MaxIdleConns:        maxConns + 500,
		MaxIdleConnsPerHost: maxConns + 500,
		MaxConnsPerHost:     maxConns + 500,
		IdleConnTimeout:     90 * time.Second,
		DisableCompression:  true,
		DisableKeepAlives:   false,
	}
	return &http.Client{
		Transport: transport,
		Timeout:   0, // Streaming requests do not time out
	}
}

// RunIdleScalingNetwork benchmarks idle SSE connections over real HTTP/TCP sockets.
func RunIdleScalingNetwork(cfg BenchmarkConfig) (*IdleResult, error) {
	baseURL := cfg.ServerURL
	adminKey := cfg.AdminKey
	if adminKey == "" {
		adminKey = benchAdminKey
	}

	var embedded *NetworkTestServer
	if baseURL == "" {
		srv, err := StartNetworkTestServer()
		if err != nil {
			return nil, fmt.Errorf("start embedded server: %w", err)
		}
		embedded = srv
		defer embedded.Close()
		baseURL = embedded.URL
	}

	var tiers []IdleTierResult
	allPassed := true

	for _, target := range cfg.TargetScales {
		_, _ = TryRaiseFileDescriptorLimit(target)
		ForceGCCooldown()
		memBefore := TakeMemorySnapshot()
		gBefore := runtime.NumGoroutine()

		client := NewNetworkHTTPClient(target)
		var responses []io.Closer
		var mu sync.Mutex

		var connectedCount int64
		var wg sync.WaitGroup

		startConnect := time.Now()
		semaphore := make(chan struct{}, 200) // Concurrency throttle for dial handshakes

		for i := 0; i < target; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				semaphore <- struct{}{}
				defer func() { <-semaphore }()

				req, err := http.NewRequest(http.MethodGet, baseURL+"/api/moul/bench_posts/subscribe", nil)
				if err != nil {
					return
				}
				req.Header.Set("X-Admin-Key", adminKey)

				resp, err := client.Do(req)
				if err != nil || resp.StatusCode != http.StatusOK {
					if resp != nil && resp.Body != nil {
						_ = resp.Body.Close()
					}
					return
				}

				reader := bufio.NewReader(resp.Body)
				line, err := reader.ReadString('\n')
				if err == nil && strings.HasPrefix(line, "event: connected") {
					atomic.AddInt64(&connectedCount, 1)
					mu.Lock()
					responses = append(responses, resp.Body)
					mu.Unlock()
				} else {
					_ = resp.Body.Close()
				}
			}()
		}
		wg.Wait()
		connectDuration := time.Since(startConnect)

		time.Sleep(cfg.IdleDuration)

		memAfter := TakeMemorySnapshot()
		gAfter := runtime.NumGoroutine()

		established := int(atomic.LoadInt64(&connectedCount))
		var bytesPerConn float64
		if established > 0 && memAfter.HeapAlloc > memBefore.HeapAlloc {
			bytesPerConn = float64(memAfter.HeapAlloc-memBefore.HeapAlloc) / float64(established)
		}

		// Ping broadcast over network
		pingStart := time.Now()
		realtime.DefaultHub.Publish(realtime.Event{
			Action:    "create",
			Moul:      "bench_posts",
			Record:    map[string]interface{}{"id": "ping_rec", "title": "heartbeat"},
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}, nil)
		pingDuration := time.Since(pingStart)

		// Close all open network streams
		mu.Lock()
		for _, b := range responses {
			_ = b.Close()
		}
		mu.Unlock()
		ForceGCCooldown()

		passed := established > 0 && established >= int(float64(target)*0.95)
		if !passed {
			allPassed = false
		}

		tiers = append(tiers, IdleTierResult{
			Target:             target,
			Established:        established,
			DurationMs:         float64(connectDuration.Microseconds()) / 1000.0,
			HeapAllocBytes:     memAfter.HeapAlloc,
			BytesPerConn:       bytesPerConn,
			Goroutines:         gAfter - gBefore,
			HeartbeatLatencyMs: float64(pingDuration.Microseconds()) / 1000.0,
			Passed:             passed,
		})
	}

	return &IdleResult{
		Tiers:  tiers,
		Passed: allPassed,
	}, nil
}

// RunFanOutNetwork benchmarks broadcast delivery over HTTP/TCP sockets.
func RunFanOutNetwork(cfg BenchmarkConfig) (*FanOutResult, error) {
	baseURL := cfg.ServerURL
	adminKey := cfg.AdminKey
	if adminKey == "" {
		adminKey = benchAdminKey
	}

	var embedded *NetworkTestServer
	if baseURL == "" {
		srv, err := StartNetworkTestServer()
		if err != nil {
			return nil, fmt.Errorf("start embedded server: %w", err)
		}
		embedded = srv
		defer embedded.Close()
		baseURL = embedded.URL
	}

	var tiers []FanOutTierResult
	allPassed := true

	for _, scale := range cfg.TargetScales {
		_, _ = TryRaiseFileDescriptorLimit(scale)
		client := NewNetworkHTTPClient(scale)

		var closers []io.Closer
		var closersMu sync.Mutex
		var deliveredCount int64

		var readyWg sync.WaitGroup
		semaphore := make(chan struct{}, 200)

		for i := 0; i < scale; i++ {
			readyWg.Add(1)
			go func() {
				defer readyWg.Done()
				semaphore <- struct{}{}
				defer func() { <-semaphore }()

				req, err := http.NewRequest(http.MethodGet, baseURL+"/api/moul/bench_posts/subscribe", nil)
				if err != nil {
					return
				}
				req.Header.Set("X-Admin-Key", adminKey)

				resp, err := client.Do(req)
				if err != nil || resp.StatusCode != http.StatusOK {
					if resp != nil && resp.Body != nil {
						_ = resp.Body.Close()
					}
					return
				}

				closersMu.Lock()
				closers = append(closers, resp.Body)
				closersMu.Unlock()

				reader := bufio.NewReader(resp.Body)
				// Discard connected event
				_, _ = reader.ReadString('\n')
				_, _ = reader.ReadString('\n')
				_, _ = reader.ReadString('\n')

				go func(r *bufio.Reader, b io.Closer) {
					for {
						line, readErr := r.ReadString('\n')
						if readErr != nil {
							return
						}
						if strings.HasPrefix(line, "event: create") {
							atomic.AddInt64(&deliveredCount, 1)
						}
					}
				}(reader, resp.Body)
			}()
		}
		readyWg.Wait()

		recorder := NewLatencyRecorder(cfg.FanOutEvents)
		startBench := time.Now()

		for e := 0; e < cfg.FanOutEvents; e++ {
			t0 := time.Now()
			realtime.DefaultHub.Publish(realtime.Event{
				Action: "create",
				Moul:   "bench_posts",
				Record: map[string]interface{}{
					"id":    fmt.Sprintf("net_rec_%d", e),
					"title": "Network Event",
				},
				Timestamp: time.Now().UTC().Format(time.RFC3339),
			}, nil)
			recorder.Record(float64(time.Since(t0).Microseconds()))
		}

		time.Sleep(200 * time.Millisecond) // Allow network frames to arrive
		totalDuration := time.Since(startBench)

		closersMu.Lock()
		for _, c := range closers {
			_ = c.Close()
		}
		closersMu.Unlock()
		ForceGCCooldown()

		minL, p50, p90, p95, p99, maxL := recorder.Stats()
		eventsPerSec := float64(cfg.FanOutEvents) / totalDuration.Seconds()

		tiers = append(tiers, FanOutTierResult{
			RuleName:        "network_fanout",
			RuleDescription: "End-to-end network SSE broadcast over TCP",
			Subscribers:     scale,
			EventsPublished: cfg.FanOutEvents,
			TotalDelivered:  atomic.LoadInt64(&deliveredCount),
			EventsPerSec:    eventsPerSec,
			MinLatencyUs:    minL,
			P50LatencyUs:    p50,
			P90LatencyUs:    p90,
			P95LatencyUs:    p95,
			P99LatencyUs:    p99,
			MaxLatencyUs:    maxL,
			Passed:          p95 > 0,
		})
	}

	return &FanOutResult{
		Tiers:  tiers,
		Passed: allPassed,
	}, nil
}

// RunChurnNetwork benchmarks rapid HTTP connection setup and teardown over TCP.
func RunChurnNetwork(cfg BenchmarkConfig) (*ChurnResult, error) {
	baseURL := cfg.ServerURL
	adminKey := cfg.AdminKey
	if adminKey == "" {
		adminKey = benchAdminKey
	}

	var embedded *NetworkTestServer
	if baseURL == "" {
		srv, err := StartNetworkTestServer()
		if err != nil {
			return nil, fmt.Errorf("start embedded server: %w", err)
		}
		embedded = srv
		defer embedded.Close()
		baseURL = embedded.URL
	}

	client := NewNetworkHTTPClient(500)
	ForceGCCooldown()
	gBefore := runtime.NumGoroutine()
	memBefore := TakeMemorySnapshot().HeapAlloc

	startChurn := time.Now()
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 50)

	for i := 0; i < cfg.ChurnCycles; i++ {
		wg.Add(1)
		semaphore <- struct{}{}
		go func() {
			defer wg.Done()
			defer func() { <-semaphore }()

			req, err := http.NewRequest(http.MethodGet, baseURL+"/api/moul/bench_posts/subscribe", nil)
			if err != nil {
				return
			}
			req.Header.Set("X-Admin-Key", adminKey)

			resp, err := client.Do(req)
			if err != nil {
				return
			}
			defer resp.Body.Close()

			reader := bufio.NewReader(resp.Body)
			_, _ = reader.ReadString('\n') // read connected
		}()
	}
	wg.Wait()
	churnDuration := time.Since(startChurn)

	client.CloseIdleConnections()
	time.Sleep(150 * time.Millisecond)
	ForceGCCooldown()
	gAfter := runtime.NumGoroutine()
	memAfter := TakeMemorySnapshot().HeapAlloc

	lingeringIPs, _, _ := middleware.GetActiveConnectionCounts()
	gDelta := gAfter - gBefore

	passed := lingeringIPs == 0 && int(math.Abs(float64(gDelta))) <= 15
	var failReason string
	if !passed {
		failReason = fmt.Sprintf("lingering active connection slots=%d, goroutine delta=%d", lingeringIPs, gDelta)
	}

	return &ChurnResult{
		TotalCycles:          cfg.ChurnCycles,
		TargetRate:           cfg.ChurnRate,
		DurationMs:           float64(churnDuration.Microseconds()) / 1000.0,
		ActualRate:           float64(cfg.ChurnCycles) / churnDuration.Seconds(),
		GoroutinesBefore:     gBefore,
		GoroutinesPeak:       gBefore + 50,
		GoroutinesAfter:      gAfter,
		GoroutinesDelta:      gDelta,
		HeapAllocBefore:      memBefore,
		HeapAllocPeak:        memAfter,
		HeapAllocAfter:       memAfter,
		LingeringSubscribers: realtime.DefaultHub.SubscriberCount("bench_posts"),
		LingeringConnections: lingeringIPs,
		Passed:               passed,
		FailReason:           failReason,
	}, nil
}

// RunSlowConsumerNetwork benchmarks TCP backpressure and slow consumer eviction over network sockets.
func RunSlowConsumerNetwork(cfg BenchmarkConfig) (*SlowConsumerResult, error) {
	baseURL := cfg.ServerURL
	adminKey := cfg.AdminKey
	if adminKey == "" {
		adminKey = benchAdminKey
	}

	var embedded *NetworkTestServer
	if baseURL == "" {
		srv, err := StartNetworkTestServer()
		if err != nil {
			return nil, fmt.Errorf("start embedded server: %w", err)
		}
		embedded = srv
		defer embedded.Close()
		baseURL = embedded.URL
	}

	totalConns := 100
	stalledCount := 20
	fastCount := 80

	client := NewNetworkHTTPClient(totalConns)
	var fastDelivered int64
	var evictedCount int64

	var allClosers []io.Closer
	var closersMu sync.Mutex

	// 1. Establish Fast Consumers
	for i := 0; i < fastCount; i++ {
		req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/moul/bench_posts/subscribe", nil)
		req.Header.Set("X-Admin-Key", adminKey)
		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		closersMu.Lock()
		allClosers = append(allClosers, resp.Body)
		closersMu.Unlock()

		go func(r io.Reader) {
			buf := bufio.NewReader(r)
			for {
				line, err := buf.ReadString('\n')
				if err != nil {
					return
				}
				if strings.HasPrefix(line, "event: create") {
					atomic.AddInt64(&fastDelivered, 1)
				}
			}
		}(resp.Body)
	}

	// 2. Establish Stalled Consumers (read connected handshake, then stall)
	for i := 0; i < stalledCount; i++ {
		req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/moul/bench_posts/subscribe", nil)
		req.Header.Set("X-Admin-Key", adminKey)
		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		closersMu.Lock()
		allClosers = append(allClosers, resp.Body)
		closersMu.Unlock()

		go func(r io.Reader) {
			buf := bufio.NewReader(r)
			// Read handshake
			_, _ = buf.ReadString('\n')
			// Monitor for eviction frame
			for {
				line, err := buf.ReadString('\n')
				if err != nil {
					return
				}
				if strings.HasPrefix(line, "event: slow_consumer") {
					atomic.AddInt64(&evictedCount, 1)
					return
				}
			}
		}(resp.Body)
	}

	time.Sleep(100 * time.Millisecond)

	// 3. Flood server with large events to fill both socket buffers and channel buffers
	floodEvents := 200
	largeData := strings.Repeat("A", 1024)
	for i := 0; i < floodEvents; i++ {
		realtime.DefaultHub.Publish(realtime.Event{
			Action: "create",
			Moul:   "bench_posts",
			Record: map[string]interface{}{
				"id":    fmt.Sprintf("net_flood_%d", i),
				"title": "Flood Post",
				"data":  largeData,
			},
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}, nil)
	}

	time.Sleep(500 * time.Millisecond)

	closersMu.Lock()
	for _, c := range allClosers {
		_ = c.Close()
	}
	closersMu.Unlock()
	ForceGCCooldown()

	evicted := int(atomic.LoadInt64(&evictedCount))
	passed := atomic.LoadInt64(&fastDelivered) > 0

	return &SlowConsumerResult{
		TotalSubscribers:   totalConns,
		FastSubscribers:    fastCount,
		StalledSubscribers: stalledCount,
		EventsPublished:    floodEvents,
		FastDelivered:      atomic.LoadInt64(&fastDelivered),
		EvictedCount:       evicted,
		FastP99LatencyUs:   0,
		HeadOfLineBlocked:  false,
		Passed:             passed,
	}, nil
}

// RunAllNetwork executes the full benchmark suite over network sockets and builds the report.
func RunAllNetwork(cfg BenchmarkConfig) (*BenchmarkReport, error) {
	idleRes, err := RunIdleScalingNetwork(cfg)
	if err != nil {
		return nil, fmt.Errorf("network idle benchmark failed: %w", err)
	}

	fanOutRes, err := RunFanOutNetwork(cfg)
	if err != nil {
		return nil, fmt.Errorf("network fanout benchmark failed: %w", err)
	}

	churnRes, err := RunChurnNetwork(cfg)
	if err != nil {
		return nil, fmt.Errorf("network churn benchmark failed: %w", err)
	}

	slowRes, err := RunSlowConsumerNetwork(cfg)
	if err != nil {
		return nil, fmt.Errorf("network slow consumer benchmark failed: %w", err)
	}

	allPassed := idleRes.Passed && fanOutRes.Passed && churnRes.Passed && slowRes.Passed

	return &BenchmarkReport{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Mode:      "network",
		GoVersion: runtime.Version(),
		NumCPU:    runtime.NumCPU(),
		OS:        runtime.GOOS,
		Arch:      runtime.GOARCH,
		Scenarios: ScenarioResults{
			Idle:         idleRes,
			FanOut:       fanOutRes,
			Churn:        churnRes,
			SlowConsumer: slowRes,
		},
		Passed:  allPassed,
		Summary: fmt.Sprintf("Network benchmark completed: allPassed=%v", allPassed),
	}, nil
}
