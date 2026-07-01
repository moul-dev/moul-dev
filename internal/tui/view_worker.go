package tui

import (
	"fmt"
	"strings"
	"time"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
)

// updateWorkerMonitor handles interaction on the background worker dashboard.
func (m *Model) updateWorkerMonitor(msg tea.Msg) tea.Cmd {
	workerMoulName := m.getWorkerMoulName()

	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		m.SuccessMsg = ""
		m.Err = nil

		switch msg.String() {
		case "up", "k":
			if m.SelectedJobIndex > 0 {
				m.SelectedJobIndex--
			}
		case "down", "j":
			if m.SelectedJobIndex < len(m.Jobs)-1 {
				m.SelectedJobIndex++
			}
		case "enter", "v":
			// Open job detail
			if len(m.Jobs) > 0 && m.SelectedJobIndex >= 0 && m.SelectedJobIndex < len(m.Jobs) {
				job := m.Jobs[m.SelectedJobIndex]
				jsonStr := formatJSON(job)
				m.Viewport.SetContent(jsonStr)
				m.Viewport.SetYOffset(0)
				m.State = StateRecordDetail
				m.ViewDetail = "job"
			}
		case "r":
			// Retry job
			if len(m.Jobs) > 0 && m.SelectedJobIndex >= 0 && m.SelectedJobIndex < len(m.Jobs) {
				job := m.Jobs[m.SelectedJobIndex]
				jobID, _ := job["id"].(string)
				if jobID != "" {
					return func() tea.Msg {
						nowStr := time.Now().UTC().Format(time.RFC3339)
						payload := map[string]interface{}{
							"state":        "available",
							"scheduled_at": nowStr,
						}
						_, err := m.Client.UpdateRecord(workerMoulName, jobID, payload)
						if err != nil {
							return ErrMsg{err}
						}
						// Reload jobs
						jobs, err := m.Client.ListRecords(workerMoulName)
						if err != nil {
							return ErrMsg{err}
						}
						return jobsActionMsg{jobs: jobs, action: "retried"}
					}
				}
			}
		case "c":
			// Cancel / Discard job
			if len(m.Jobs) > 0 && m.SelectedJobIndex >= 0 && m.SelectedJobIndex < len(m.Jobs) {
				job := m.Jobs[m.SelectedJobIndex]
				jobID, _ := job["id"].(string)
				if jobID != "" {
					return func() tea.Msg {
						payload := map[string]interface{}{
							"state": "discarded",
						}
						_, err := m.Client.UpdateRecord(workerMoulName, jobID, payload)
						if err != nil {
							return ErrMsg{err}
						}
						// Reload jobs
						jobs, err := m.Client.ListRecords(workerMoulName)
						if err != nil {
							return ErrMsg{err}
						}
						return jobsActionMsg{jobs: jobs, action: "cancelled"}
					}
				}
			}
		case "f":
			// Refresh
			return m.fetchJobs()
		case "esc", "left", "h":
			m.State = StateDashboard
			m.Jobs = nil
			m.SelectedJobIndex = 0
		}

	case jobsActionMsg:
		m.Jobs = msg.jobs
		m.SuccessMsg = fmt.Sprintf("Job %s successfully!", msg.action)
	}

	return nil
}

type jobsActionMsg struct {
	jobs   []map[string]interface{}
	action string
}

func (m *Model) getWorkerMoulName() string {
	for _, moul := range m.Mouls {
		if moul.Type == "worker" {
			return moul.Name
		}
	}
	return "background_tasks"
}

// viewWorkerMonitor renders the list of jobs in a styled table.
func (m *Model) viewWorkerMonitor() string {
	var s strings.Builder
	s.WriteString(HeaderStyle.Render("System Dashboard: Background Jobs Monitor"))
	s.WriteString("\n")

	if m.SuccessMsg != "" {
		s.WriteString(AlertSuccessStyle.Render(m.SuccessMsg))
		s.WriteString("\n")
	}
	if m.Err != nil {
		s.WriteString(AlertErrorStyle.Render(fmt.Sprintf("Error: %v", m.Err)))
		s.WriteString("\n")
	}

	if len(m.Jobs) == 0 {
		s.WriteString(lipgloss.NewStyle().Foreground(ColorTextMuted).Render("  No background tasks found in worker collection.\n"))
		s.WriteString("\n")
		s.WriteString(HelpStyle.Render(" [f] Refresh  [Esc] Back"))
		return ContentStyle.Width(m.Width).Render(s.String())
	}

	// Headers
	headers := []string{"ID", "WORKER", "QUEUE", "STATE", "ATTEMPT", "SCHEDULED_AT"}

	// Draw table header
	var headerLine strings.Builder
	for _, h := range headers {
		width := 16
		if h == "ID" {
			width = 24
		} else if h == "SCHEDULED_AT" {
			width = 22
		}
		headerLine.WriteString(fmt.Sprintf("%-*s", width, strings.ToUpper(h)))
	}
	s.WriteString(TableHeaderStyle.Render(headerLine.String()))
	s.WriteString("\n")

	// Calculate window/scrolling logic
	maxRows := m.Height - 11
	if maxRows < 3 {
		maxRows = 3
	}

	startIndex := 0
	if m.SelectedJobIndex >= maxRows {
		startIndex = m.SelectedJobIndex - maxRows + 1
	}
	endIndex := startIndex + maxRows
	if endIndex > len(m.Jobs) {
		endIndex = len(m.Jobs)
	}

	visibleJobs := m.Jobs[startIndex:endIndex]

	// Draw rows
	for i, job := range visibleJobs {
		rIdx := startIndex + i
		var rowLine strings.Builder
		for _, h := range headers {
			valStr := ""
			switch h {
			case "ID":
				valStr, _ = job["id"].(string)
			case "WORKER":
				valStr, _ = job["worker"].(string)
			case "QUEUE":
				valStr, _ = job["queue"].(string)
			case "STATE":
				valStr, _ = job["state"].(string)
				// Color state
				switch valStr {
				case "completed":
					valStr = lipgloss.NewStyle().Foreground(ColorGreen).Render(valStr)
				case "executing":
					valStr = lipgloss.NewStyle().Foreground(ColorCyan).Render(valStr)
				case "discarded":
					valStr = lipgloss.NewStyle().Foreground(ColorRed).Render(valStr)
				case "retryable":
					valStr = lipgloss.NewStyle().Foreground(ColorYellow).Render(valStr)
				}
			case "ATTEMPT":
				attempt := 0
				maxAttempts := 0
				if att, ok := job["attempt"].(float64); ok {
					attempt = int(att)
				}
				if max, ok := job["max_attempts"].(float64); ok {
					maxAttempts = int(max)
				}
				valStr = fmt.Sprintf("%d/%d", attempt, maxAttempts)
			case "SCHEDULED_AT":
				tStr, _ := job["scheduled_at"].(string)
				valStr = formatTime(tStr)
			}

			// Print cell
			width := 16
			if h == "ID" {
				width = 24
			} else if h == "SCHEDULED_AT" {
				width = 22
			}
			rowLine.WriteString(fmt.Sprintf("%-*s", width, valStr))
		}

		line := rowLine.String()
		if rIdx == m.SelectedJobIndex {
			s.WriteString(TableCellSelectedStyle.Width(m.Width - 10).Render(line))
		} else {
			s.WriteString(TableCellStyle.Render(line))
		}
		s.WriteString("\n")
	}

	s.WriteString("\n")
	s.WriteString(HelpStyle.Render(" ↑/↓: Scroll  [v/Enter] Details  [r] Retry job  [c] Cancel/Discard  [f] Refresh  [Esc] Back"))

	return ContentStyle.Width(m.Width).Render(s.String())
}
