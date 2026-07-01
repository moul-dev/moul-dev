package tui

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
)

// Client wraps all communication with the moul-dev API.
type Client struct {
	BaseURL  string
	AdminKey string
	Token    string
	HTTP     *http.Client
}

// NewClient creates a new TUI client instance.
func NewClient(baseURL, adminKey string) *Client {
	baseURL = strings.TrimSuffix(baseURL, "/")
	return &Client{
		BaseURL:  baseURL,
		AdminKey: adminKey,
		HTTP: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// CheckConnection sends a quick ping/list request to check if the server is responsive.
func (c *Client) CheckConnection() error {
	_, err := c.ListMouls()
	return err
}

// request executes an HTTP request, automatically attaching required headers.
func (c *Client) request(method, path string, body interface{}, responseData interface{}) error {
	var bodyReader io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("failed to marshal request body: %w", err)
		}
		bodyReader = bytes.NewReader(jsonData)
	}

	url := fmt.Sprintf("%s%s", c.BaseURL, path)
	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.AdminKey != "" {
		req.Header.Set("X-Admin-Key", c.AdminKey)
	}
	if c.Token != "" {
		req.Header.Set("Authorization", "Bearer "+c.Token)
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		var apiErr struct {
			Message string `json:"message"`
		}
		_ = json.Unmarshal(respBody, &apiErr)
		msg := string(respBody)
		if apiErr.Message != "" {
			msg = apiErr.Message
		}
		return fmt.Errorf("server returned error %d: %s", resp.StatusCode, msg)
	}

	if responseData != nil {
		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response body: %w", err)
		}
		if err := json.Unmarshal(respBody, responseData); err != nil {
			return fmt.Errorf("failed to parse JSON response: %w", err)
		}
	}

	return nil
}

// ListMouls fetches all registered collections.
func (c *Client) ListMouls() ([]schema.Moul, error) {
	var mouls []schema.Moul
	err := c.request("GET", "/api/mouls", nil, &mouls)
	return mouls, err
}

// CreateMoul creates a new database table and schema.
func (c *Client) CreateMoul(m *schema.Moul) error {
	return c.request("POST", "/api/mouls", m, nil)
}

// DeleteMoul deletes a collection by name.
func (c *Client) DeleteMoul(name string) error {
	path := fmt.Sprintf("/api/mouls/%s", name)
	return c.request("DELETE", path, nil, nil)
}

// ListRecords fetches records of a specific moul.
func (c *Client) ListRecords(moulName string, expand ...string) ([]map[string]interface{}, error) {
	var records []map[string]interface{}
	path := fmt.Sprintf("/api/mouls/%s/records", moulName)
	if len(expand) > 0 {
		path = fmt.Sprintf("%s?expand=%s", path, strings.Join(expand, ","))
	}
	err := c.request("GET", path, nil, &records)
	return records, err
}

// GetRecord fetches a single record of a specific moul by ID.
func (c *Client) GetRecord(moulName string, id string, expand ...string) (map[string]interface{}, error) {
	var record map[string]interface{}
	path := fmt.Sprintf("/api/mouls/%s/records/%s", moulName, id)
	if len(expand) > 0 {
		path = fmt.Sprintf("%s?expand=%s", path, strings.Join(expand, ","))
	}
	err := c.request("GET", path, nil, &record)
	return record, err
}

// CreateRecord inserts a new record into a moul.
func (c *Client) CreateRecord(moulName string, data map[string]interface{}) (map[string]interface{}, error) {
	var record map[string]interface{}
	path := fmt.Sprintf("/api/mouls/%s/records", moulName)
	err := c.request("POST", path, data, &record)
	return record, err
}

// UpdateRecord updates an existing record.
func (c *Client) UpdateRecord(moulName string, id string, data map[string]interface{}) (map[string]interface{}, error) {
	var record map[string]interface{}
	path := fmt.Sprintf("/api/mouls/%s/records/%s", moulName, id)
	err := c.request("PATCH", path, data, &record)
	return record, err
}

// DeleteRecord deletes a record by ID.
func (c *Client) DeleteRecord(moulName string, id string) error {
	path := fmt.Sprintf("/api/mouls/%s/records/%s", moulName, id)
	return c.request("DELETE", path, nil, nil)
}

// ListVisits retrieves the visits log (requires JWT authentication).
func (c *Client) ListVisits() ([]map[string]interface{}, error) {
	var visits []map[string]interface{}
	err := c.request("GET", "/api/visits", nil, &visits)
	return visits, err
}

// Login authenticates with a password to retrieve a JWT token.
func (c *Client) Login(authMoul, identity, password string) (string, error) {
	payload := map[string]string{
		"identity": identity,
		"password": password,
	}
	var respData struct {
		Token string                 `json:"token"`
		User  map[string]interface{} `json:"record"`
	}
	path := fmt.Sprintf("/api/mouls/%s/auth-with-password", authMoul)
	if err := c.request("POST", path, payload, &respData); err != nil {
		return "", err
	}
	c.Token = respData.Token
	return respData.Token, nil
}

// DeviceAuthResponse represents the response from the device authorization endpoint.
type DeviceAuthResponse struct {
	DeviceCode              string `json:"device_code"`
	UserCode                string `json:"user_code"`
	VerificationURI         string `json:"verification_uri"`
	VerificationURIComplete string `json:"verification_uri_complete"`
	ExpiresIn               int    `json:"expires_in"`
	Interval                int    `json:"interval"`
}

// RequestDeviceCode initiates the device authorization flow.
func (c *Client) RequestDeviceCode(clientID string) (*DeviceAuthResponse, error) {
	payload := map[string]string{
		"client_id": clientID,
	}
	var resp DeviceAuthResponse
	if err := c.request("POST", "/api/oauth2/device/authorize", payload, &resp); err != nil {
		return nil, err
	}
	return &resp, nil
}

// DeviceTokenResponse represents the response from the device token endpoint.
type DeviceTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// PollDeviceToken polls the token endpoint for the JWT token.
func (c *Client) PollDeviceToken(clientID, deviceCode string) (*DeviceTokenResponse, error) {
	payload := map[string]string{
		"grant_type":  "urn:ietf:params:oauth:grant-type:device_code",
		"device_code": deviceCode,
		"client_id":   clientID,
	}
	var resp DeviceTokenResponse
	if err := c.request("POST", "/api/oauth2/device/token", payload, &resp); err != nil {
		return nil, err
	}
	c.Token = resp.AccessToken
	return &resp, nil
}

// SetupStatusResponse represents the response from the setup status endpoint.
type SetupStatusResponse struct {
	NeedsSetup bool `json:"needsSetup"`
}

// CheckSetupStatus requests the setup status of the server.
func (c *Client) CheckSetupStatus() (bool, error) {
	var resp SetupStatusResponse
	if err := c.request("GET", "/api/setup", nil, &resp); err != nil {
		return false, err
	}
	return resp.NeedsSetup, nil
}

// SetupRootUser registers the initial root user.
func (c *Client) SetupRootUser(username, email, password string) error {
	payload := map[string]string{
		"username": username,
		"email":    email,
		"password": password,
	}
	return c.request("POST", "/api/setup", payload, nil)
}

// GetSettings fetches all settings from the database and returns them as a JSON object.
func (c *Client) GetSettings() (map[string]string, error) {
	var settings map[string]string
	err := c.request("GET", "/api/settings", nil, &settings)
	return settings, err
}

// UpdateSettings updates key-value settings in the database.
func (c *Client) UpdateSettings(settings map[string]string) (map[string]string, error) {
	var updated map[string]string
	err := c.request("PATCH", "/api/settings", settings, &updated)
	return updated, err
}

