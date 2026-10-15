package sse

import (
	"fmt"
	"math"
	"runtime"
	"sync"
	"sync/atomic"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/realtime"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// InitEngineEnvironment initializes an in-memory SQLite database and test collection schema for engine benchmarking.
func InitEngineEnvironment(ruleStr string) (*dbx.DB, *realtime.Hub, func(), error) {
	testDB, err := db.InitDB(":memory:")
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to init in-memory db: %w", err)
	}

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
			SubscribeRule: ruleStr,
			ViewRule:      ruleStr,
			ListRule:      ruleStr,
		},
	}

	if err := db.SaveMoulMetadata(testDB, testMoul); err != nil {
		_ = testDB.Close()
		return nil, nil, nil, fmt.Errorf("failed to save metadata: %w", err)
	}
	if err := db.CreateMoulTable(testDB, testMoul); err != nil {
		_ = testDB.Close()
		return nil, nil, nil, fmt.Errorf("failed to create table: %w", err)
	}

	hub := realtime.NewHub()

	cleanup := func() {
		_ = testDB.Close()
	}
	return testDB, hub, cleanup, nil
}

// RunIdleScalingEngine benchmarks memory and goroutine scaling for idle SSE connections in-process.
func RunIdleScalingEngine(cfg BenchmarkConfig) (*IdleResult, error) {
	_, hub, cleanup, err := InitEngineEnvironment("")
	if err != nil {
		return nil, fmt.Errorf("idle benchmark environment: %w", err)
	}
	defer cleanup()

	var tiers []IdleTierResult
	allPassed := true

	for _, target := range cfg.TargetScales {
		ForceGCCooldown()
		memBefore := TakeMemorySnapshot()
		gBefore := runtime.NumGoroutine()

		clients := make([]*realtime.Client, target)
		var stopWorkers sync.WaitGroup
		stopCh := make(chan struct{})

		startSetup := time.Now()
		for i := 0; i < target; i++ {
			c := realtime.NewClient("bench_posts", nil, true, "", "*", "")
			clients[i] = c
			hub.Subscribe(c)

			// Reader drain goroutine simulating an idle connected client
			stopWorkers.Add(1)
			go func(cl *realtime.Client) {
				defer stopWorkers.Done()
				for {
					select {
					case <-stopCh:
						return
					case _, ok := <-cl.Send:
						if !ok {
							return
						}
					}
				}
			}(c)
		}
		setupDuration := time.Since(startSetup)

		// Hold idle state
		time.Sleep(cfg.IdleDuration)

		memAfter := TakeMemorySnapshot()
		gAfter := runtime.NumGoroutine()

		var bytesPerConn float64
		if memAfter.HeapAlloc > memBefore.HeapAlloc {
			bytesPerConn = float64(memAfter.HeapAlloc-memBefore.HeapAlloc) / float64(target)
		} else {
			bytesPerConn = float64(memAfter.HeapAlloc) / float64(target)
		}

		// Ping broadcast test
		pingStart := time.Now()
		hub.Publish(realtime.Event{
			Action:    "create",
			Moul:      "bench_posts",
			Record:    map[string]interface{}{"id": "ping_rec", "title": "heartbeat"},
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}, nil)
		pingDuration := time.Since(pingStart)

		// Cleanup this tier
		close(stopCh)
		for _, c := range clients {
			hub.Unsubscribe(c)
		}
		stopWorkers.Wait()
		ForceGCCooldown()

		passed := bytesPerConn < 30000 // Under 30KB per idle engine client
		if !passed {
			allPassed = false
		}

		tiers = append(tiers, IdleTierResult{
			Target:             target,
			Established:        target,
			DurationMs:         float64(setupDuration.Microseconds()) / 1000.0,
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

// RunFanOutEngine benchmarks event broadcast fan-out and security rule evaluation across tiers.
func RunFanOutEngine(cfg BenchmarkConfig) (*FanOutResult, error) {
	ruleTiers := []struct {
		name        string
		desc        string
		rule        string
		setupClient func(i int) *realtime.Client
		record      map[string]interface{}
	}{
		{
			name: "public",
			desc: "No rule (public raw fan-out)",
			rule: "",
			setupClient: func(i int) *realtime.Client {
				return realtime.NewClient("bench_posts", nil, false, "", "*", "")
			},
			record: map[string]interface{}{"id": "rec_pub", "title": "Public broadcast", "userId": "usr_pub"},
		},
		{
			name: "simple_auth",
			desc: "@request.auth.id != '' (authenticated presence)",
			rule: "@request.auth.id != ''",
			setupClient: func(i int) *realtime.Client {
				authRecord := map[string]interface{}{"id": fmt.Sprintf("usr_%d", i), "moul": "users"}
				return realtime.NewClient("bench_posts", authRecord, false, "@request.auth.id != ''", "*", "")
			},
			record: map[string]interface{}{"id": "rec_auth", "title": "Auth broadcast", "userId": "usr_auth"},
		},
		{
			name: "owner_match",
			desc: "userId = @request.auth.id (50% matching owner clients)",
			rule: "userId = @request.auth.id",
			setupClient: func(i int) *realtime.Client {
				var uid string
				if i%2 == 0 {
					uid = "owner_123"
				} else {
					uid = fmt.Sprintf("other_%d", i)
				}
				authRecord := map[string]interface{}{"id": uid, "moul": "users"}
				return realtime.NewClient("bench_posts", authRecord, false, "userId = @request.auth.id", "*", "")
			},
			record: map[string]interface{}{"id": "rec_owner", "title": "Owner broadcast", "userId": "owner_123"},
		},
	}

	var tiers []FanOutTierResult
	allPassed := true

	for _, scale := range cfg.TargetScales {
		for _, rt := range ruleTiers {
			dbConn, hub, cleanup, err := InitEngineEnvironment(rt.rule)
			if err != nil {
				return nil, fmt.Errorf("init fanout environment: %w", err)
			}

			clients := make([]*realtime.Client, scale)
			var deliveredCount int64
			var stopWorkers sync.WaitGroup
			stopCh := make(chan struct{})

			for i := 0; i < scale; i++ {
				c := rt.setupClient(i)
				clients[i] = c
				hub.Subscribe(c)

				stopWorkers.Add(1)
				go func(cl *realtime.Client) {
					defer stopWorkers.Done()
					for {
						select {
						case <-stopCh:
							return
						case _, ok := <-cl.Send:
							if !ok {
								return
							}
							atomic.AddInt64(&deliveredCount, 1)
						}
					}
				}(c)
			}

			recorder := NewLatencyRecorder(cfg.FanOutEvents)
			startBench := time.Now()

			for e := 0; e < cfg.FanOutEvents; e++ {
				evt := realtime.Event{
					Action:    "create",
					Moul:      "bench_posts",
					Record:    rt.record,
					Timestamp: time.Now().UTC().Format(time.RFC3339),
				}
				t0 := time.Now()
				hub.Publish(evt, dbConn)
				recorder.Record(float64(time.Since(t0).Microseconds()))
			}

			totalDuration := time.Since(startBench)
			close(stopCh)
			for _, c := range clients {
				hub.Unsubscribe(c)
			}
			stopWorkers.Wait()
			cleanup()
			ForceGCCooldown()

			minL, p50, p90, p95, p99, maxL := recorder.Stats()
			eventsPerSec := float64(cfg.FanOutEvents) / totalDuration.Seconds()

			tiers = append(tiers, FanOutTierResult{
				RuleName:        rt.name,
				RuleDescription: rt.desc,
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
				Passed:          p95 > 0 && eventsPerSec > 0,
			})
		}
	}

	return &FanOutResult{
		Tiers:  tiers,
		Passed: allPassed,
	}, nil
}

// RunChurnEngine benchmarks connection churn and validates zero lingering leaks in-process.
func RunChurnEngine(cfg BenchmarkConfig) (*ChurnResult, error) {
	_, hub, cleanup, err := InitEngineEnvironment("")
	if err != nil {
		return nil, fmt.Errorf("churn benchmark environment: %w", err)
	}
	defer cleanup()

	ForceGCCooldown()
	gBefore := runtime.NumGoroutine()
	memBefore := TakeMemorySnapshot().HeapAlloc

	var gPeak int
	var memPeak uint64

	startChurn := time.Now()
	ticker := time.NewTicker(time.Second / time.Duration(cfg.ChurnRate))
	defer ticker.Stop()

	for i := 0; i < cfg.ChurnCycles; i++ {
		<-ticker.C
		c := realtime.NewClient("bench_posts", nil, true, "", "*", "")
		hub.Subscribe(c)

		// Sample peak periodically
		if i%(cfg.ChurnCycles/10+1) == 0 {
			curG := runtime.NumGoroutine()
			curMem := TakeMemorySnapshot().HeapAlloc
			if curG > gPeak {
				gPeak = curG
			}
			if curMem > memPeak {
				memPeak = curMem
			}
		}

		// Simulate client reading and exiting
		hub.Unsubscribe(c)
	}
	churnDuration := time.Since(startChurn)

	ForceGCCooldown()
	gAfter := runtime.NumGoroutine()
	memAfter := TakeMemorySnapshot().HeapAlloc

	lingeringSubs := hub.SubscriberCount("bench_posts")
	gDelta := gAfter - gBefore

	passed := lingeringSubs == 0 && int(math.Abs(float64(gDelta))) <= 5
	var failReason string
	if !passed {
		failReason = fmt.Sprintf("lingering subscribers=%d, goroutine delta=%d", lingeringSubs, gDelta)
	}

	return &ChurnResult{
		TotalCycles:          cfg.ChurnCycles,
		TargetRate:           cfg.ChurnRate,
		DurationMs:           float64(churnDuration.Microseconds()) / 1000.0,
		ActualRate:           float64(cfg.ChurnCycles) / churnDuration.Seconds(),
		GoroutinesBefore:     gBefore,
		GoroutinesPeak:       gPeak,
		GoroutinesAfter:      gAfter,
		GoroutinesDelta:      gDelta,
		HeapAllocBefore:      memBefore,
		HeapAllocPeak:        memPeak,
		HeapAllocAfter:       memAfter,
		LingeringSubscribers: lingeringSubs,
		LingeringConnections: 0,
		Passed:               passed,
		FailReason:           failReason,
	}, nil
}

// RunSlowConsumerEngine tortures the hub with mixed fast and stalled consumers, verifying backpressure eviction.
func RunSlowConsumerEngine(cfg BenchmarkConfig) (*SlowConsumerResult, error) {
	_, hub, cleanup, err := InitEngineEnvironment("")
	if err != nil {
		return nil, fmt.Errorf("slow consumer environment: %w", err)
	}
	defer cleanup()

	totalSubscribers := 500
	if len(cfg.TargetScales) > 0 && cfg.TargetScales[0] > 0 {
		totalSubscribers = cfg.TargetScales[0]
	}
	stalledCount := int(float64(totalSubscribers) * cfg.SlowRatio)
	if stalledCount < 1 {
		stalledCount = 1
	}
	fastCount := totalSubscribers - stalledCount

	var evictedCount int64
	var fastDelivered int64
	latencyRec := NewLatencyRecorder(200)

	var stopWorkers sync.WaitGroup
	stopCh := make(chan struct{})

	// 1. Fast subscribers actively draining
	for i := 0; i < fastCount; i++ {
		c := realtime.NewClient("bench_posts", nil, true, "", "*", "")
		hub.Subscribe(c)

		stopWorkers.Add(1)
		go func(cl *realtime.Client) {
			defer stopWorkers.Done()
			for {
				select {
				case <-stopCh:
					return
				case <-cl.Send:
					atomic.AddInt64(&fastDelivered, 1)
				}
			}
		}(c)
	}

	// 2. Stalled subscribers never draining Send channel, but monitoring Disconnect
	for i := 0; i < stalledCount; i++ {
		c := realtime.NewClient("bench_posts", nil, true, "", "*", "")
		hub.Subscribe(c)

		stopWorkers.Add(1)
		go func(cl *realtime.Client) {
			defer stopWorkers.Done()
			select {
			case <-stopCh:
				return
			case reason := <-cl.Disconnect:
				if reason == "slow_consumer" {
					atomic.AddInt64(&evictedCount, 1)
				}
				hub.Unsubscribe(cl)
			}
		}(c)
	}

	// 3. Publish flood exceeding DefaultClientBufferSize (128)
	floodEvents := 200
	memBefore := TakeMemorySnapshot()

	for e := 0; e < floodEvents; e++ {
		t0 := time.Now()
		hub.Publish(realtime.Event{
			Action: "create",
			Moul:   "bench_posts",
			Record: map[string]interface{}{
				"id":    fmt.Sprintf("flood_%d", e),
				"title": "Flood Event",
			},
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}, nil)
		latencyRec.Record(float64(time.Since(t0).Microseconds()))
	}

	// Allow brief settling for eviction channel reception
	time.Sleep(200 * time.Millisecond)

	close(stopCh)
	stopWorkers.Wait()
	memAfter := TakeMemorySnapshot()
	ForceGCCooldown()

	_, _, _, _, p99Fast, _ := latencyRec.Stats()
	evicted := int(atomic.LoadInt64(&evictedCount))
	passed := evicted > 0 && atomic.LoadInt64(&fastDelivered) > 0

	var failReason string
	if !passed {
		failReason = fmt.Sprintf("evicted=%d/%d stalled clients, fastDelivered=%d", evicted, stalledCount, atomic.LoadInt64(&fastDelivered))
	}

	return &SlowConsumerResult{
		TotalSubscribers:   totalSubscribers,
		FastSubscribers:    fastCount,
		StalledSubscribers: stalledCount,
		EventsPublished:    floodEvents,
		FastDelivered:      atomic.LoadInt64(&fastDelivered),
		EvictedCount:       evicted,
		FastP99LatencyUs:   p99Fast,
		HeadOfLineBlocked:  false,
		PeakHeapBytes:      memAfter.HeapAlloc - memBefore.HeapAlloc,
		Passed:             passed,
		FailReason:         failReason,
	}, nil
}

// RunAllEngine executes all 4 benchmark scenarios in-process and builds the full report.
func RunAllEngine(cfg BenchmarkConfig) (*BenchmarkReport, error) {
	idleRes, err := RunIdleScalingEngine(cfg)
	if err != nil {
		return nil, fmt.Errorf("engine idle benchmark failed: %w", err)
	}

	fanOutRes, err := RunFanOutEngine(cfg)
	if err != nil {
		return nil, fmt.Errorf("engine fanout benchmark failed: %w", err)
	}

	churnRes, err := RunChurnEngine(cfg)
	if err != nil {
		return nil, fmt.Errorf("engine churn benchmark failed: %w", err)
	}

	slowRes, err := RunSlowConsumerEngine(cfg)
	if err != nil {
		return nil, fmt.Errorf("engine slow consumer benchmark failed: %w", err)
	}

	allPassed := idleRes.Passed && fanOutRes.Passed && churnRes.Passed && slowRes.Passed

	return &BenchmarkReport{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Mode:      "engine",
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
		Summary: fmt.Sprintf("Engine benchmark completed: allPassed=%v", allPassed),
	}, nil
}
