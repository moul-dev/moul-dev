package sysmon

import (
	"context"
	"encoding/json"
	"testing"
	"time"
)

func TestCollector_ProcessPayload(t *testing.T) {
	collector := NewCollector()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	err := collector.Start(ctx)
	if err != nil {
		t.Fatalf("Failed to start collector: %v", err)
	}
	defer collector.Close()

	// Payload 1: cpu metric
	cpuPayload := MetricPoint{
		Name: "cpu",
		Fields: map[string]interface{}{
			"usage_active": 25.5,
			"usage_user":   15.0,
			"usage_system": 10.5,
			"usage_idle":   74.5,
		},
		Tags: map[string]string{
			"cpu": "cpu-total",
		},
		Timestamp: time.Now().Unix(),
	}
	cpuData, _ := json.Marshal(cpuPayload)
	collector.ProcessPayload(cpuData)

	// Payload 2: mem & system batch
	memPayload := MetricPoint{
		Name: "mem",
		Fields: map[string]interface{}{
			"used_percent": float64(45.2),
			"total":        uint64(16000000000),
			"used":         uint64(7232000000),
			"free":         uint64(8768000000),
		},
		Timestamp: time.Now().Unix(),
	}
	sysPayload := MetricPoint{
		Name: "system",
		Fields: map[string]interface{}{
			"load1":  1.25,
			"load5":  0.95,
			"load15": 0.80,
			"uptime": uint64(86400),
			"n_cpus": 8,
		},
		Timestamp: time.Now().Unix(),
	}
	batch := MetricsJSONBatch{
		Metrics: []MetricPoint{memPayload, sysPayload},
	}
	batchData, _ := json.Marshal(batch)
	collector.ProcessPayload(batchData)

	snapshot := collector.GetSnapshot()

	if snapshot.Current.CPU.UsageActive != 25.5 {
		t.Errorf("Expected CPU UsageActive = 25.5, got %f", snapshot.Current.CPU.UsageActive)
	}

	if snapshot.Current.Memory.UsedPercent != 45.2 {
		t.Errorf("Expected Memory UsedPercent = 45.2, got %f", snapshot.Current.Memory.UsedPercent)
	}

	if snapshot.Current.System.Load1 != 1.25 {
		t.Errorf("Expected System Load1 = 1.25, got %f", snapshot.Current.System.Load1)
	}

	if snapshot.Current.CPU.Cores != 8 {
		t.Errorf("Expected CPU Cores = 8, got %d", snapshot.Current.CPU.Cores)
	}
}

func TestCollector_NativeStats(t *testing.T) {
	collector := NewCollector()
	snapshot := collector.GetSnapshot()

	if snapshot.Current.CPU.Cores <= 0 {
		t.Errorf("Expected native CPU Cores > 0, got %d", snapshot.Current.CPU.Cores)
	}

	if snapshot.Current.OS == "" {
		t.Errorf("Expected non-empty OS name")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := collector.Start(ctx); err != nil {
		t.Fatalf("Failed to start collector: %v", err)
	}
	defer collector.Close()

	time.Sleep(50 * time.Millisecond)

	snapAfter := collector.GetSnapshot()
	if snapAfter.Current.System.NumGoroutines <= 0 {
		t.Errorf("Expected NumGoroutines > 0, got %d", snapAfter.Current.System.NumGoroutines)
	}
}
