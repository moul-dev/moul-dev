package logger_test

import (
	"testing"

	"github.com/moul-dev/moul-dev/internal/logger"
)

func TestLoggerFunctions(t *testing.T) {
	// Exercise logger helper methods to ensure no panics
	logger.Debug("test debug log", "key", "val")
	logger.Info("test info log", "key", "val")
	logger.Warn("test warn log", "key", "val")
	logger.Error("test error log", "key", "val")
	logger.Print("test print log", "key", "val")

	subLogger := logger.With("component", "test")
	if subLogger == nil {
		t.Fatal("Expected non-nil sub-logger from With()")
	}
	subLogger.Info("test sub-logger message")
}
