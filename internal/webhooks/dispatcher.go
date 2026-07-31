package webhooks

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/schema"
)

// HTTPClient interface for testability and flexibility.
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

var DefaultHTTPClient HTTPClient = &http.Client{
	Timeout: 5 * time.Second,
}

type Payload struct {
	Event     string      `json:"event"`
	Moul      string      `json:"moul"`
	Record    interface{} `json:"record"`
	OldRecord interface{} `json:"old_record,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// MatchesEvent checks if a target event (e.g. "create:before") matches any configured event rule.
func MatchesEvent(events []string, targetEvent string) bool {
	for _, e := range events {
		e = strings.TrimSpace(strings.ToLower(e))
		targetLower := strings.ToLower(targetEvent)

		if e == "*" || e == "all" || e == targetLower {
			return true
		}

		// Support shorthand event matching, e.g. "create" matches "create:before" and "create:after"
		if strings.Contains(targetLower, ":") {
			parts := strings.SplitN(targetLower, ":", 2)
			if e == parts[0] {
				return true
			}
		}
	}
	return false
}

// ComputeSignature calculates the HMAC-SHA256 hex digest of body using secret key.
func ComputeSignature(secret string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}

// DispatchBefore sends synchronous HTTP webhook requests for before-hooks.
// If any before-hook returns a non-2xx status code or encounters a network error,
// the operation is rejected and an error is returned.
func DispatchBefore(ctx context.Context, hooks []schema.Webhook, payload Payload) error {
	var matchingHooks []schema.Webhook
	for _, h := range hooks {
		if h.Enabled && MatchesEvent(h.Events, payload.Event) {
			matchingHooks = append(matchingHooks, h)
		}
	}

	if len(matchingHooks) == 0 {
		return nil
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal webhook payload: %w", err)
	}

	for _, hook := range matchingHooks {
		reqCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, hook.URL, bytes.NewReader(jsonBytes))
		if err != nil {
			cancel()
			return fmt.Errorf("invalid webhook URL %q: %w", hook.URL, err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("User-Agent", "moul-webhook/1.0")
		req.Header.Set("X-Moul-Event", payload.Event)
		req.Header.Set("X-Moul-Webhook-ID", hook.ID)
		req.Header.Set("X-Moul-Timestamp", payload.Timestamp)

		if hook.Secret != "" {
			req.Header.Set("X-Moul-Signature", ComputeSignature(hook.Secret, jsonBytes))
		}

		resp, err := DefaultHTTPClient.Do(req)
		if err != nil {
			cancel()
			return fmt.Errorf("before webhook %q execution failed: %w", hook.URL, err)
		}

		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		_ = resp.Body.Close()
		cancel()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return fmt.Errorf("before webhook %q rejected operation with status %d: %s", hook.URL, resp.StatusCode, strings.TrimSpace(string(respBody)))
		}
	}

	return nil
}

// DispatchAfter dispatches asynchronous HTTP webhook requests in the background.
func DispatchAfter(ctx context.Context, hooks []schema.Webhook, payload Payload) {
	var matchingHooks []schema.Webhook
	for _, h := range hooks {
		if h.Enabled && MatchesEvent(h.Events, payload.Event) {
			matchingHooks = append(matchingHooks, h)
		}
	}

	if len(matchingHooks) == 0 {
		return
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		logger.Error("Failed to marshal after-webhook payload", "event", payload.Event, "err", err)
		return
	}

	go func(hooksToRun []schema.Webhook, body []byte) {
		for _, hook := range hooksToRun {
			reqCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, hook.URL, bytes.NewReader(body))
			if err != nil {
				cancel()
				logger.Error("Invalid after-webhook request", "url", hook.URL, "err", err)
				continue
			}

			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("User-Agent", "moul-webhook/1.0")
			req.Header.Set("X-Moul-Event", payload.Event)
			req.Header.Set("X-Moul-Webhook-ID", hook.ID)
			req.Header.Set("X-Moul-Timestamp", payload.Timestamp)

			if hook.Secret != "" {
				req.Header.Set("X-Moul-Signature", ComputeSignature(hook.Secret, body))
			}

			resp, err := DefaultHTTPClient.Do(req)
			if err != nil {
				cancel()
				logger.Error("After-webhook execution failed", "url", hook.URL, "err", err)
				continue
			}

			_ = resp.Body.Close()
			cancel()
		}
	}(matchingHooks, jsonBytes)
}

// TestWebhook sends a test ping event to a webhook endpoint and returns response stats.
func TestWebhook(ctx context.Context, hook schema.Webhook, moulName string) (int, int64, string, error) {
	payload := Payload{
		Event:     "ping",
		Moul:      moulName,
		Record:    map[string]interface{}{"test": true, "message": "Moul Webhook Ping Test"},
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return 0, 0, "", fmt.Errorf("failed to marshal test payload: %w", err)
	}

	start := time.Now()
	reqCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, hook.URL, bytes.NewReader(jsonBytes))
	if err != nil {
		return 0, 0, "", fmt.Errorf("invalid webhook URL: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "moul-webhook/1.0")
	req.Header.Set("X-Moul-Event", payload.Event)
	req.Header.Set("X-Moul-Webhook-ID", hook.ID)
	req.Header.Set("X-Moul-Timestamp", payload.Timestamp)

	if hook.Secret != "" {
		req.Header.Set("X-Moul-Signature", ComputeSignature(hook.Secret, jsonBytes))
	}

	resp, err := DefaultHTTPClient.Do(req)
	duration := time.Since(start).Milliseconds()
	if err != nil {
		return 0, duration, "", fmt.Errorf("webhook test request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
	return resp.StatusCode, duration, strings.TrimSpace(string(respBody)), nil
}
