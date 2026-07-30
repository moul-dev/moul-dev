package tui

import (
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/sysmon"
)

func TestViewDashboardSysmonInfo_Rendering(t *testing.T) {
	m := &Model{
		Width:  100,
		Height: 30,
		SystemStatus: &sysmon.SystemStatusResponse{
			Current: sysmon.MetricsSnapshot{
				Timestamp:      time.Now(),
				OS:             "darwin",
				Arch:           "arm64",
				TelegrafActive: true,
				SocketPath:     "/tmp/moul-telegraf.sock",
				CPU: sysmon.CPUStats{
					UsageActive: 42.5,
					UsageUser:   25.0,
					UsageSystem: 17.5,
					UsageIdle:   57.5,
					Cores:       8,
				},
				Memory: sysmon.MemoryStats{
					UsedPercent: 65.4,
					Total:       16000000000,
					Used:        10464000000,
					Free:        5536000000,
				},
				Disk: sysmon.DiskStats{
					UsedPercent: 35.0,
					Total:       500000000000,
					Used:        175000000000,
					Free:        325000000000,
					Path:        "/",
				},
				System: sysmon.SystemStats{
					Load1:         1.45,
					Load5:         1.20,
					Load15:        0.95,
					Uptime:        3600,
					NumGoroutines: 24,
				},
			},
		},
	}

	output := m.viewDashboardSysmonInfo(90)
	if !strings.Contains(output, "HOST SYSTEM MONITORING") {
		t.Errorf("Expected output to contain header 'HOST SYSTEM MONITORING'")
	}

	if !strings.Contains(output, "TELEGRAF SOCKET ACTIVE") {
		t.Errorf("Expected output to show 'TELEGRAF SOCKET ACTIVE'")
	}

	if !strings.Contains(output, "42.5%") {
		t.Errorf("Expected output to render CPU percentage 42.5%%")
	}

	if !strings.Contains(output, "65.4%") {
		t.Errorf("Expected output to render Memory percentage 65.4%%")
	}

	if !strings.Contains(output, "Load Averages: 1m: 1.45") {
		t.Errorf("Expected output to render Load Averages")
	}
}

func TestViewDashboardSysmonInfo_NilStatus(t *testing.T) {
	m := &Model{
		Width:        100,
		Height:       30,
		SystemStatus: nil,
	}

	output := m.viewDashboardSysmonInfo(90)
	if !strings.Contains(output, "Fetching host system metrics") {
		t.Errorf("Expected fallback string when SystemStatus is nil")
	}
}
