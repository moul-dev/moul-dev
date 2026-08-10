package tui

import (
	"fmt"
	"strings"
	"time"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
	"github.com/moul-dev/moul-dev/internal/sysmon"
)

type systemMetricsMsg struct {
	status *sysmon.SystemStatusResponse
	err    error
}

func (m *Model) fetchSystemMetrics() tea.Cmd {
	return func() tea.Msg {
		res, err := m.Client.GetSystemMetrics()
		if err != nil {
			return systemMetricsMsg{err: err}
		}
		return systemMetricsMsg{status: res}
	}
}

func (m *Model) viewDashboardSysmonInfo(width int) string {
	if m.SystemStatus == nil {
		return ContentStyle.Width(width).Render(
			TitleStyle.Render("🖥️ HOST SYSTEM MONITORING") + "\n\n" +
				"Fetching host system metrics from server...",
		)
	}

	snap := m.SystemStatus.Current

	var sb strings.Builder

	// Header section
	sb.WriteString(TitleStyle.Render("🖥️ HOST SYSTEM MONITORING"))
	sb.WriteString("\n\n")

	// Metadata Info
	metaInfo := fmt.Sprintf("Host OS: %s/%s | Updated: %s",
		strings.ToUpper(snap.OS),
		strings.ToUpper(snap.Arch),
		snap.Timestamp.Format("15:04:05"),
	)
	sb.WriteString(metaInfo)
	sb.WriteString("\n\n")

	// Gauges Grid
	gaugeWidth := width - 12
	if gaugeWidth < 20 {
		gaugeWidth = 20
	}

	// 1. CPU Usage Gauge
	sb.WriteString(SubtitleStyle.Render(fmt.Sprintf("CPU Usage (%d Cores)", snap.CPU.Cores)))
	sb.WriteString("\n")
	sb.WriteString(renderProgressBar(snap.CPU.UsageActive, gaugeWidth))
	sb.WriteString(fmt.Sprintf(" %.1f%% (User: %.1f%%, Sys: %.1f%%, Idle: %.1f%%)\n\n",
		snap.CPU.UsageActive, snap.CPU.UsageUser, snap.CPU.UsageSystem, snap.CPU.UsageIdle))

	// 2. Memory Usage Gauge
	sb.WriteString(SubtitleStyle.Render("Memory Usage"))
	sb.WriteString("\n")
	sb.WriteString(renderProgressBar(snap.Memory.UsedPercent, gaugeWidth))
	sb.WriteString(fmt.Sprintf(" %.1f%% (%s / %s)\n\n",
		snap.Memory.UsedPercent, formatBytes(snap.Memory.Used), formatBytes(snap.Memory.Total)))

	// 3. Disk Usage Gauge
	sb.WriteString(SubtitleStyle.Render(fmt.Sprintf("Disk Space (%s)", snap.Disk.Path)))
	sb.WriteString("\n")
	sb.WriteString(renderProgressBar(snap.Disk.UsedPercent, gaugeWidth))
	sb.WriteString(fmt.Sprintf(" %.1f%% (%s / %s)\n\n",
		snap.Disk.UsedPercent, formatBytes(snap.Disk.Used), formatBytes(snap.Disk.Total)))

	// 4. System Load & Network Metrics
	sb.WriteString(SubtitleStyle.Render("System Load & Network"))
	sb.WriteString("\n")
	uptimeStr := formatDuration(time.Duration(snap.System.Uptime) * time.Second)
	loadStr := fmt.Sprintf("Load Averages: 1m: %.2f | 5m: %.2f | 15m: %.2f",
		snap.System.Load1, snap.System.Load5, snap.System.Load15)
	netStr := fmt.Sprintf("Network I/O: Sent %s | Recv %s",
		formatBytes(snap.Network.BytesSent), formatBytes(snap.Network.BytesRecv))
	goroutinesStr := fmt.Sprintf("Goroutines: %d | Host Uptime: %s",
		snap.System.NumGoroutines, uptimeStr)

	statsBox := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#6366F1")).
		Padding(0, 1).
		Width(gaugeWidth + 8).
		Render(fmt.Sprintf("%s\n%s\n%s", loadStr, netStr, goroutinesStr))

	sb.WriteString(statsBox)

	return ContentStyle.Width(width).Render(sb.String())
}

// renderProgressBar draws a visual ASCII/Unicode progress bar
func renderProgressBar(percent float64, totalWidth int) string {
	if percent < 0 {
		percent = 0
	}
	if percent > 100 {
		percent = 100
	}
	if totalWidth < 10 {
		totalWidth = 10
	}

	filledLen := int((percent / 100.0) * float64(totalWidth))
	if filledLen > totalWidth {
		filledLen = totalWidth
	}
	emptyLen := totalWidth - filledLen

	filledStr := strings.Repeat("█", filledLen)
	emptyStr := strings.Repeat("░", emptyLen)

	var colorHex string
	if percent < 60 {
		colorHex = "#10B981" // Green
	} else if percent < 85 {
		colorHex = "#F59E0B" // Yellow
	} else {
		colorHex = "#EF4444" // Red
	}

	barStyle := lipgloss.NewStyle().Foreground(lipgloss.Color(colorHex))
	emptyStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("#4B5563"))

	return "[" + barStyle.Render(filledStr) + emptyStyle.Render(emptyStr) + "]"
}

func formatBytes(b uint64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := uint64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(b)/float64(div), "KMGTPE"[exp])
}

func formatDuration(d time.Duration) string {
	days := d / (24 * time.Hour)
	d -= days * 24 * time.Hour
	hours := d / time.Hour
	d -= hours * time.Hour
	minutes := d / time.Minute

	if days > 0 {
		return fmt.Sprintf("%dd %dh %dm", days, hours, minutes)
	}
	if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}
