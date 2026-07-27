package mailer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type CloudflareProvider struct {
	config     Config
	httpClient *http.Client
}

func NewCloudflareProvider(cfg Config) *CloudflareProvider {
	return &CloudflareProvider{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (p *CloudflareProvider) Name() string {
	return "cloudflare"
}

type cloudflarePayload struct {
	From     string   `json:"from"`
	FromName string   `json:"from_name,omitempty"`
	To       []string `json:"to"`
	Subject  string   `json:"subject"`
	Text     string   `json:"text,omitempty"`
	HTML     string   `json:"html,omitempty"`
	ReplyTo  string   `json:"reply_to,omitempty"`
}

func (p *CloudflareProvider) Send(ctx context.Context, email *Email) error {
	endpoint := p.config.Endpoint
	if endpoint == "" {
		accountID := p.config.Domain
		if accountID == "" {
			return fmt.Errorf("cloudflare: account ID (domain field) or custom endpoint is required")
		}
		endpoint = fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/email/send", accountID)
	}

	fromAddr := email.From
	if fromAddr == "" {
		fromAddr = p.config.FromAddress
	}
	fromName := email.FromName
	if fromName == "" {
		fromName = p.config.FromName
	}

	payload := cloudflarePayload{
		From:     fromAddr,
		FromName: fromName,
		To:       email.To,
		Subject:  email.Subject,
		Text:     email.TextBody,
		HTML:     email.HTMLBody,
		ReplyTo:  email.ReplyTo,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("cloudflare: failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("cloudflare: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	apiKey := p.config.APIKey
	if apiKey != "" {
		if !strings.HasPrefix(apiKey, "Bearer ") {
			apiKey = "Bearer " + apiKey
		}
		req.Header.Set("Authorization", apiKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("cloudflare: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("cloudflare: API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}
