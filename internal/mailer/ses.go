package mailer

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
	"time"
)

type SESProvider struct {
	config     Config
	httpClient *http.Client
}

func NewSESProvider(cfg Config) *SESProvider {
	return &SESProvider{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (p *SESProvider) Name() string {
	return "ses"
}

type sesContentData struct {
	Data    string `json:"Data"`
	Charset string `json:"Charset,omitempty"`
}

type sesBody struct {
	Text *sesContentData `json:"Text,omitempty"`
	Html *sesContentData `json:"Html,omitempty"`
}

type sesSimpleMessage struct {
	Subject sesContentData `json:"Subject"`
	Body    sesBody        `json:"Body"`
}

type sesContent struct {
	Simple sesSimpleMessage `json:"Simple"`
}

type sesDestination struct {
	ToAddresses []string `json:"ToAddresses"`
}

type sesPayload struct {
	FromEmailAddress      string         `json:"FromEmailAddress"`
	Destination           sesDestination `json:"Destination"`
	Content               sesContent     `json:"Content"`
	ReplyToEmailAddresses []string       `json:"ReplyToEmailAddresses,omitempty"`
}

func (p *SESProvider) Send(ctx context.Context, email *Email) error {
	region := p.config.Region
	if region == "" {
		region = "us-east-1"
	}

	endpoint := p.config.Endpoint
	host := fmt.Sprintf("email.%s.amazonaws.com", region)
	path := "/v2/email/outbound-emails"
	if endpoint == "" {
		endpoint = fmt.Sprintf("https://%s%s", host, path)
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

	msgBody := sesBody{}
	if email.TextBody != "" {
		msgBody.Text = &sesContentData{Data: email.TextBody, Charset: "UTF-8"}
	}
	if email.HTMLBody != "" {
		msgBody.Html = &sesContentData{Data: email.HTMLBody, Charset: "UTF-8"}
	}
	if msgBody.Text == nil && msgBody.Html == nil {
		msgBody.Text = &sesContentData{Data: " ", Charset: "UTF-8"}
	}

	payload := sesPayload{
		FromEmailAddress: formattedFrom,
		Destination: sesDestination{
			ToAddresses: email.To,
		},
		Content: sesContent{
			Simple: sesSimpleMessage{
				Subject: sesContentData{Data: email.Subject, Charset: "UTF-8"},
				Body:    msgBody,
			},
		},
	}

	if email.ReplyTo != "" {
		payload.ReplyToEmailAddresses = []string{email.ReplyTo}
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("ses: failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("ses: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Sign request if credentials provided
	accessKey := p.config.APIKey
	secretKey := p.config.APISecret
	if accessKey != "" && secretKey != "" {
		now := time.Now().UTC()
		signSESv4(req, data, accessKey, secretKey, region, now)
	} else if accessKey != "" {
		// Token authorization fallback
		req.Header.Set("Authorization", "Bearer "+accessKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("ses: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ses: API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

// signSESv4 signs HTTP request using AWS Signature Version 4
func signSESv4(req *http.Request, bodyBytes []byte, accessKey, secretKey, region string, t time.Time) {
	amzDate := t.Format("20060102T150405Z")
	dateStamp := t.Format("20060102")

	req.Header.Set("X-Amz-Date", amzDate)
	req.Header.Set("Host", req.URL.Host)

	payloadHash := sha256Hex(bodyBytes)

	canonicalHeaders := fmt.Sprintf("content-type:%s\nhost:%s\nx-amz-date:%s\n",
		req.Header.Get("Content-Type"),
		req.Header.Get("Host"),
		amzDate,
	)
	signedHeaders := "content-type;host;x-amz-date"

	canonicalRequest := fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n%s",
		req.Method,
		req.URL.Path,
		req.URL.RawQuery,
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	)

	credentialScope := fmt.Sprintf("%s/%s/ses/aws4_request", dateStamp, region)
	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s",
		amzDate,
		credentialScope,
		sha256Hex([]byte(canonicalRequest)),
	)

	signingKey := getSignatureKey(secretKey, dateStamp, region, "ses")
	signature := hex.EncodeToString(hmacSHA256(signingKey, []byte(stringToSign)))

	authHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		accessKey,
		credentialScope,
		signedHeaders,
		signature,
	)

	req.Header.Set("Authorization", authHeader)
}

func sha256Hex(b []byte) string {
	h := sha256.Sum256(b)
	return hex.EncodeToString(h[:])
}

func hmacSHA256(key, data []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}

func getSignatureKey(key, dateStamp, regionName, serviceName string) []byte {
	kDate := hmacSHA256([]byte("AWS4"+key), []byte(dateStamp))
	kRegion := hmacSHA256(kDate, []byte(regionName))
	kService := hmacSHA256(kRegion, []byte(serviceName))
	kSigning := hmacSHA256(kService, []byte("aws4_request"))
	return kSigning
}
