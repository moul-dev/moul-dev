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
func (c *Client) ListRecords(moulName string) ([]map[string]interface{}, error) {
	var records []map[string]interface{}
	path := fmt.Sprintf("/api/mouls/%s/records", moulName)
	err := c.request("GET", path, nil, &records)
	return records, err
}

// GetRecord fetches a single record of a specific moul by ID.
func (c *Client) GetRecord(moulName string, id string) (map[string]interface{}, error) {
	var record map[string]interface{}
	path := fmt.Sprintf("/api/mouls/%s/records/%s", moulName, id)
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
