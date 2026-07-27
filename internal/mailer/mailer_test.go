package mailer

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestConsoleProvider(t *testing.T) {
	p := NewConsoleProvider()
	if p.Name() != "console" {
		t.Fatalf("expected provider name 'console', got %s", p.Name())
	}

	email := &Email{
		From:     "test@example.com",
		FromName: "Test Sender",
		To:       []string{"user@example.com"},
		Subject:  "Hello Console",
		TextBody: "Plain text content",
		HTMLBody: "<p>HTML content</p>",
	}

	err := p.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestResendProvider(t *testing.T) {
	var capturedReq *http.Request
	var capturedBody []byte

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedReq = r
		capturedBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"id": "msg_12345"}`))
	}))
	defer ts.Close()

	cfg := Config{
		Enabled:     true,
		Provider:    "resend",
		FromAddress: "noreply@example.com",
		FromName:    "Resend App",
		APIKey:      "re_123456789",
		Endpoint:    ts.URL,
	}

	p := NewResendProvider(cfg)
	if p.Name() != "resend" {
		t.Fatalf("expected provider name 'resend', got %s", p.Name())
	}

	email := &Email{
		To:       []string{"recipient@example.com"},
		Subject:  "Welcome to Resend",
		TextBody: "Welcome body",
	}

	err := p.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("send failed: %v", err)
	}

	if capturedReq.Header.Get("Authorization") != "Bearer re_123456789" {
		t.Errorf("unexpected Auth header: %s", capturedReq.Header.Get("Authorization"))
	}

	var payload resendPayload
	if err := json.Unmarshal(capturedBody, &payload); err != nil {
		t.Fatalf("failed to unmarshal payload: %v", err)
	}

	if payload.From != "Resend App <noreply@example.com>" {
		t.Errorf("unexpected From: %s", payload.From)
	}
	if len(payload.To) != 1 || payload.To[0] != "recipient@example.com" {
		t.Errorf("unexpected To: %v", payload.To)
	}
	if payload.Subject != "Welcome to Resend" {
		t.Errorf("unexpected Subject: %s", payload.Subject)
	}
}

func TestSendGridProvider(t *testing.T) {
	var capturedReq *http.Request
	var capturedBody []byte

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedReq = r
		capturedBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusAccepted)
	}))
	defer ts.Close()

	cfg := Config{
		Enabled:     true,
		Provider:    "sendgrid",
		FromAddress: "sg@example.com",
		FromName:    "SendGrid App",
		APIKey:      "SG.123456789",
		Endpoint:    ts.URL,
	}

	p := NewSendGridProvider(cfg)
	if p.Name() != "sendgrid" {
		t.Fatalf("expected provider name 'sendgrid', got %s", p.Name())
	}

	email := &Email{
		To:       []string{"sg_user@example.com"},
		Subject:  "Hello SendGrid",
		HTMLBody: "<p>SendGrid content</p>",
	}

	err := p.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("send failed: %v", err)
	}

	if capturedReq.Header.Get("Authorization") != "Bearer SG.123456789" {
		t.Errorf("unexpected Auth header: %s", capturedReq.Header.Get("Authorization"))
	}

	var payload sendGridPayload
	if err := json.Unmarshal(capturedBody, &payload); err != nil {
		t.Fatalf("failed to unmarshal payload: %v", err)
	}

	if payload.From.Email != "sg@example.com" || payload.From.Name != "SendGrid App" {
		t.Errorf("unexpected From: %+v", payload.From)
	}
	if len(payload.Personalizations) != 1 || payload.Personalizations[0].To[0].Email != "sg_user@example.com" {
		t.Errorf("unexpected personalizations: %+v", payload.Personalizations)
	}
}

func TestMailgunProvider(t *testing.T) {
	var capturedReq *http.Request
	var capturedBody []byte

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedReq = r
		capturedBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"id": "<202607271200.12345@mg.example.com>", "message": "Queued"}`))
	}))
	defer ts.Close()

	cfg := Config{
		Enabled:     true,
		Provider:    "mailgun",
		FromAddress: "mg@example.com",
		FromName:    "Mailgun App",
		APIKey:      "key-123456789",
		Domain:      "mg.example.com",
		Endpoint:    ts.URL,
	}

	p := NewMailgunProvider(cfg)
	if p.Name() != "mailgun" {
		t.Fatalf("expected provider name 'mailgun', got %s", p.Name())
	}

	email := &Email{
		To:       []string{"mg_to@example.com"},
		Subject:  "Mailgun Test",
		TextBody: "Mailgun text body",
	}

	err := p.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("send failed: %v", err)
	}

	user, pass, ok := capturedReq.BasicAuth()
	if !ok || user != "api" || pass != "key-123456789" {
		t.Errorf("unexpected basic auth: user=%s pass=%s ok=%v", user, pass, ok)
	}

	bodyStr := string(capturedBody)
	if !strings.Contains(bodyStr, "mg_to%40example.com") && !strings.Contains(bodyStr, "mg_to@example.com") {
		t.Errorf("expected body to contain recipient: %s", bodyStr)
	}
}

func TestCloudflareProvider(t *testing.T) {
	var capturedReq *http.Request
	var capturedBody []byte

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedReq = r
		capturedBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	}))
	defer ts.Close()

	cfg := Config{
		Enabled:     true,
		Provider:    "cloudflare",
		FromAddress: "cf@example.com",
		FromName:    "Cloudflare App",
		APIKey:      "cf_token_123",
		Domain:      "cf_account_123",
		Endpoint:    ts.URL,
	}

	p := NewCloudflareProvider(cfg)
	if p.Name() != "cloudflare" {
		t.Fatalf("expected provider name 'cloudflare', got %s", p.Name())
	}

	email := &Email{
		To:       []string{"cf_to@example.com"},
		Subject:  "Cloudflare Email",
		TextBody: "Cloudflare body",
	}

	err := p.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("send failed: %v", err)
	}

	if capturedReq.Header.Get("Authorization") != "Bearer cf_token_123" {
		t.Errorf("unexpected Auth header: %s", capturedReq.Header.Get("Authorization"))
	}

	var payload cloudflarePayload
	if err := json.Unmarshal(capturedBody, &payload); err != nil {
		t.Fatalf("failed to unmarshal payload: %v", err)
	}

	if payload.From != "cf@example.com" || payload.FromName != "Cloudflare App" {
		t.Errorf("unexpected From: %+v", payload)
	}
}

func TestSESProvider(t *testing.T) {
	var capturedReq *http.Request
	var capturedBody []byte

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedReq = r
		capturedBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"MessageId": "ses-msg-123"}`))
	}))
	defer ts.Close()

	cfg := Config{
		Enabled:     true,
		Provider:    "ses",
		FromAddress: "ses@example.com",
		FromName:    "SES Sender",
		APIKey:      "AKIAIOSFODNN7EXAMPLE",
		APISecret:   "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
		Region:      "us-east-1",
		Endpoint:    ts.URL,
	}

	p := NewSESProvider(cfg)
	if p.Name() != "ses" {
		t.Fatalf("expected provider name 'ses', got %s", p.Name())
	}

	email := &Email{
		To:       []string{"ses_to@example.com"},
		Subject:  "SES Test Subject",
		HTMLBody: "<p>SES body</p>",
	}

	err := p.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("send failed: %v", err)
	}

	authHeader := capturedReq.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "AWS4-HMAC-SHA256") {
		t.Errorf("expected AWS4-HMAC-SHA256 Auth header, got: %s", authHeader)
	}

	var payload sesPayload
	if err := json.Unmarshal(capturedBody, &payload); err != nil {
		t.Fatalf("failed to unmarshal payload: %v", err)
	}

	if payload.FromEmailAddress != "SES Sender <ses@example.com>" {
		t.Errorf("unexpected FromEmailAddress: %s", payload.FromEmailAddress)
	}
}

func TestMailerManagerFallback(t *testing.T) {
	m, err := NewMailer(nil)
	if err != nil {
		t.Fatalf("failed to create mailer: %v", err)
	}

	if m.ProviderName() != "console" {
		t.Errorf("expected default provider name 'console', got %s", m.ProviderName())
	}

	email := &Email{
		From:    "sender@example.com",
		To:      []string{"receiver@example.com"},
		Subject: "Test Fallback",
	}

	err = m.Send(context.Background(), email)
	if err != nil {
		t.Fatalf("expected no error on fallback send, got %v", err)
	}
}
