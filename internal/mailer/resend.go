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

type ResendProvider struct {
	config     Config
	httpClient *http.Client
}

func NewResendProvider(cfg Config) *ResendProvider {
	return &ResendProvider{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (p *ResendProvider) Name() string {
	return "resend"
}

type resendPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html,omitempty"`
	Text    string   `json:"text,omitempty"`
	ReplyTo string   `json:"reply_to,omitempty"`
}

func (p *ResendProvider) Send(ctx context.Context, email *Email) error {
	endpoint := p.config.Endpoint
	if endpoint == "" {
		endpoint = "https://api.resend.com/emails"
	}

	fromAddr := email.From
	if fromAddr == "" {
		fromAddr = p.config.FromAddress
	}
	fromName := email.FromName
	if fromName == "" {
		fromName = p.config.FromName
	}

	formattedFrom := fromAddr
	if fromName != "" {
		formattedFrom = fmt.Sprintf("%s <%s>", fromName, fromAddr)
	}

	payload := resendPayload{
		From:    formattedFrom,
		To:      email.To,
		Subject: email.Subject,
		HTML:    email.HTMLBody,
		Text:    email.TextBody,
		ReplyTo: email.ReplyTo,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("resend: failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("resend: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	apiKey := p.config.APIKey
	if !strings.HasPrefix(apiKey, "Bearer ") {
		apiKey = "Bearer " + apiKey
	}
	req.Header.Set("Authorization", apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("resend: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend: API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}
