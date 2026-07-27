package mailer

import "context"

// Email represents an email message to be dispatched by a mail provider.
type Email struct {
	From     string            `json:"from"`
	FromName string            `json:"from_name"`
	To       []string          `json:"to"`
	Subject  string            `json:"subject"`
	TextBody string            `json:"text_body"`
	HTMLBody string            `json:"html_body"`
	ReplyTo  string            `json:"reply_to,omitempty"`
	Headers  map[string]string `json:"headers,omitempty"`
}

// Config defines configuration parameters for email delivery services.
type Config struct {
	Enabled     bool   `json:"enabled"`
	Provider    string `json:"provider"` // "console", "ses", "resend", "mailgun", "sendgrid", "cloudflare"
	FromAddress string `json:"from_address"`
	FromName    string `json:"from_name"`
	APIKey      string `json:"api_key"`
	APISecret   string `json:"api_secret"`
	Domain      string `json:"domain"`
	Region      string `json:"region"`
	Endpoint    string `json:"endpoint"`
}

// Provider interface implemented by all supported email delivery providers.
type Provider interface {
	Name() string
	Send(ctx context.Context, email *Email) error
}
