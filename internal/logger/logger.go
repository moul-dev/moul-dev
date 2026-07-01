package logger

import (
	"os"
	"strings"

	"github.com/charmbracelet/log"
)

// Default is the package-level logger instance used throughout the application.
var Default *log.Logger

func init() {
	Default = log.NewWithOptions(os.Stderr, log.Options{
		ReportTimestamp: true,
	})

	// Allow overriding log level via environment variable
	if lvl := os.Getenv("MOUL_LOG_LEVEL"); lvl != "" {
		switch strings.ToLower(lvl) {
		case "debug":
			Default.SetLevel(log.DebugLevel)
		case "info":
			Default.SetLevel(log.InfoLevel)
		case "warn":
			Default.SetLevel(log.WarnLevel)
		case "error":
			Default.SetLevel(log.ErrorLevel)
		case "fatal":
			Default.SetLevel(log.FatalLevel)
		}
	}
}

// With returns a sub-logger with the given key-value context pairs.
func With(keyvals ...interface{}) *log.Logger {
	return Default.With(keyvals...)
}

// Debug logs a message at debug level.
func Debug(msg interface{}, keyvals ...interface{}) {
	Default.Debug(msg, keyvals...)
}

// Info logs a message at info level.
func Info(msg interface{}, keyvals ...interface{}) {
	Default.Info(msg, keyvals...)
}

// Warn logs a message at warn level.
func Warn(msg interface{}, keyvals ...interface{}) {
	Default.Warn(msg, keyvals...)
}

// Error logs a message at error level.
func Error(msg interface{}, keyvals ...interface{}) {
	Default.Error(msg, keyvals...)
}

// Fatal logs a message at fatal level and exits.
func Fatal(msg interface{}, keyvals ...interface{}) {
	Default.Fatal(msg, keyvals...)
}

// Print logs a message with no level (always printed).
func Print(msg interface{}, keyvals ...interface{}) {
	Default.Print(msg, keyvals...)
}
