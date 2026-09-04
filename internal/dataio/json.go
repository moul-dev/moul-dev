package dataio

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
)

// ExportJSON serializes records into formatted JSON (either as a flat array or envelope).
func ExportJSON(records []map[string]interface{}, moul *schema.Moul, includeSchema bool, w io.Writer) error {
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")

	if includeSchema {
		envelope := JSONExportEnvelope{
			Schema:     moul,
			ExportedAt: time.Now().UTC().Format(time.RFC3339),
			Total:      len(records),
			Records:    records,
		}
		if err := enc.Encode(envelope); err != nil {
			return fmt.Errorf("failed to encode json envelope: %w", err)
		}
		return nil
	}

	if err := enc.Encode(records); err != nil {
		return fmt.Errorf("failed to encode json records: %w", err)
	}
	return nil
}

// ParseJSON parses JSON input, gracefully accepting a flat array, envelope, or single object.
func ParseJSON(r io.Reader) (*JSONExportEnvelope, []map[string]interface{}, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read json input: %w", err)
	}
	if len(bytes.TrimSpace(data)) == 0 {
		return nil, nil, fmt.Errorf("empty json input")
	}

	var raw interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, nil, fmt.Errorf("invalid json payload: %w", err)
	}

	switch v := raw.(type) {
	case []interface{}:
		// Flat array of records
		records := make([]map[string]interface{}, 0, len(v))
		for i, item := range v {
			if rec, ok := item.(map[string]interface{}); ok {
				records = append(records, rec)
			} else {
				return nil, nil, fmt.Errorf("item at index %d is not a JSON object", i)
			}
		}
		return nil, records, nil

	case map[string]interface{}:
		// Check if this is an envelope with "records" field
		if recs, ok := v["records"].([]interface{}); ok {
			var envelope JSONExportEnvelope
			if err := json.Unmarshal(data, &envelope); err != nil {
				return nil, nil, fmt.Errorf("failed to parse json envelope: %w", err)
			}

			records := make([]map[string]interface{}, 0, len(recs))
			for i, item := range recs {
				if rec, ok := item.(map[string]interface{}); ok {
					records = append(records, rec)
				} else {
					return nil, nil, fmt.Errorf("envelope records[%d] is not a JSON object", i)
				}
			}
			return &envelope, records, nil
		}

		// Single record object
		return nil, []map[string]interface{}{v}, nil

	default:
		return nil, nil, fmt.Errorf("expected JSON array or object, received %T", raw)
	}
}
