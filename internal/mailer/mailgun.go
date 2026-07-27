package mailer

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type MailgunProvider struct {
	config     Config
	httpClient *http.Client
}

func NewMailgunProvider(cfg Config) *MailgunProvider {
	return &MailgunProvider{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (p *MailgunProvider) Name() string {
	return "mailgun"
}

func (p *MailgunProvider) Send(ctx context.Context, email *Email) error {
	domain := p.config.Domain
	if domain == "" {
		return fmt.Errorf("mailgun: domain is required")
	}

	endpoint := p.config.Endpoint
	if endpoint == "" {
		host := "api.mailgun.net"
		if strings.ToLower(p.config.Region) == "eu" {
			host = "api.eu.mailgun.net"
		}
		endpoint = fmt.Sprintf("https://%s/v3/%s/messages", host, domain)
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

	form := url.Values{}
	form.Set("from", formattedFrom)
	for _, to := range email.To {
		form.Add("to", to)
	}
	form.Set("subject", email.Subject)
	if email.TextBody != "" {
		form.Set("text", email.TextBody)
	}
	if email.HTMLBody != "" {
		form.Set("html", email.HTMLBody)
	}
	if email.ReplyTo != "" {
		form.Set("h:Reply-To", email.ReplyTo)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return fmt.Errorf("mailgun: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth("api", p.config.APIKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("mailgun: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mailgun: API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}
