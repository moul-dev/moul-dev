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

type SendGridProvider struct {
	config     Config
	httpClient *http.Client
}

func NewSendGridProvider(cfg Config) *SendGridProvider {
	return &SendGridProvider{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (p *SendGridProvider) Name() string {
	return "sendgrid"
}

type sendGridEmail struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type sendGridPersonalization struct {
	To []sendGridEmail `json:"to"`
}

type sendGridContent struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type sendGridPayload struct {
	Personalizations []sendGridPersonalization `json:"personalizations"`
	From             sendGridEmail             `json:"from"`
	Subject          string                    `json:"subject"`
	Content          []sendGridContent         `json:"content"`
	ReplyTo          *sendGridEmail            `json:"reply_to,omitempty"`
}

func (p *SendGridProvider) Send(ctx context.Context, email *Email) error {
	endpoint := p.config.Endpoint
	if endpoint == "" {
		endpoint = "https://api.sendgrid.com/v3/mail/send"
	}

	fromAddr := email.From
	if fromAddr == "" {
		fromAddr = p.config.FromAddress
	}
	fromName := email.FromName
	if fromName == "" {
		fromName = p.config.FromName
	}

	toEmails := make([]sendGridEmail, len(email.To))
	for i, to := range email.To {
		toEmails[i] = sendGridEmail{Email: to}
	}

	var contents []sendGridContent
	if email.TextBody != "" {
		contents = append(contents, sendGridContent{
			Type:  "text/plain",
			Value: email.TextBody,
		})
	}
	if email.HTMLBody != "" {
		contents = append(contents, sendGridContent{
			Type:  "text/html",
			Value: email.HTMLBody,
		})
	}
	if len(contents) == 0 {
		contents = append(contents, sendGridContent{
			Type:  "text/plain",
			Value: " ",
		})
	}

	payload := sendGridPayload{
		Personalizations: []sendGridPersonalization{
			{To: toEmails},
		},
		From: sendGridEmail{
			Email: fromAddr,
			Name:  fromName,
		},
		Subject: email.Subject,
		Content: contents,
	}

	if email.ReplyTo != "" {
		payload.ReplyTo = &sendGridEmail{Email: email.ReplyTo}
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("sendgrid: failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("sendgrid: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	apiKey := p.config.APIKey
	if !strings.HasPrefix(apiKey, "Bearer ") {
		apiKey = "Bearer " + apiKey
	}
	req.Header.Set("Authorization", apiKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("sendgrid: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("sendgrid: API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}
