package dataio

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/moul-dev/moul-dev/internal/schema"
)

// ExportCSV formats records as RFC 4180 CSV rows and writes them to w.
func ExportCSV(records []map[string]interface{}, headers []string, w io.Writer) error {
	writer := csv.NewWriter(w)
	defer writer.Flush()

	// 1. Write headers
	if err := writer.Write(headers); err != nil {
		return fmt.Errorf("failed to write csv header: %w", err)
	}

	// 2. Write rows
	for _, rec := range records {
		row := make([]string, len(headers))
		for i, h := range headers {
			val, exists := rec[h]
			if !exists || val == nil {
				row[i] = ""
				continue
			}

			switch v := val.(type) {
			case string:
				row[i] = v
			case bool:
				if v {
					row[i] = "true"
				} else {
					row[i] = "false"
				}
			case float64:
				row[i] = strconv.FormatFloat(v, 'f', -1, 64)
			case float32:
				row[i] = strconv.FormatFloat(float64(v), 'f', -1, 64)
			case int:
				row[i] = strconv.Itoa(v)
			case int64:
				row[i] = strconv.FormatInt(v, 10)
			case int32:
				row[i] = strconv.Itoa(int(v))
			default:
				// Complex types (maps, slices, objects): serialize to JSON
				bytes, err := json.Marshal(v)
				if err != nil {
					row[i] = fmt.Sprintf("%v", v)
				} else {
					row[i] = string(bytes)
				}
			}
		}

		if err := writer.Write(row); err != nil {
			return fmt.Errorf("failed to write csv row: %w", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return fmt.Errorf("csv flush error: %w", err)
	}

	return nil
}

// ParseCSV reads CSV input, automatically mapping headers to fields and casting types based on schema.
func ParseCSV(r io.Reader, moul *schema.Moul) ([]map[string]interface{}, error) {
	reader := csv.NewReader(r)
	reader.FieldsPerRecord = -1 // Allow variable row length gracefully
	reader.TrimLeadingSpace = true

	headers, err := reader.Read()
	if err != nil {
		if err == io.EOF {
			return []map[string]interface{}{}, nil
		}
		return nil, fmt.Errorf("failed to read csv headers: %w", err)
	}

	// Clean headers
	for i, h := range headers {
		headers[i] = strings.TrimSpace(h)
	}

	// Map of schema field types for faster lookup
	fieldTypes := make(map[string]string)
	if moul != nil {
		for _, f := range moul.Fields {
			fieldTypes[f.Name] = f.Type
		}
	}

	var records []map[string]interface{}
	line := 1

	for {
		row, err := reader.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, fmt.Errorf("error reading csv line %d: %w", line+1, err)
		}
		line++

		rec := make(map[string]interface{})
		hasValues := false

		for i, val := range row {
			if i >= len(headers) {
				break
			}
			header := headers[i]
			if header == "" {
				continue
			}

			trimmedVal := strings.TrimSpace(val)
			if trimmedVal != "" {
				hasValues = true
			}

			// Determine expected type
			expectedType := fieldTypes[header]

			switch expectedType {
			case "number":
				if trimmedVal == "" {
					rec[header] = nil
				} else if f, err := strconv.ParseFloat(trimmedVal, 64); err == nil {
					rec[header] = f
				} else {
					rec[header] = trimmedVal
				}
			case "bool":
				if trimmedVal == "" {
					rec[header] = false
				} else {
					lower := strings.ToLower(trimmedVal)
					rec[header] = (lower == "true" || lower == "1" || lower == "yes")
				}
			case "json", "file":
				if trimmedVal == "" {
					rec[header] = nil
				} else if strings.HasPrefix(trimmedVal, "{") || strings.HasPrefix(trimmedVal, "[") {
					var decoded interface{}
					if err := json.Unmarshal([]byte(trimmedVal), &decoded); err == nil {
						rec[header] = decoded
					} else {
						rec[header] = trimmedVal
					}
				} else {
					rec[header] = trimmedVal
				}
			case "relation":
				if strings.HasPrefix(trimmedVal, "[") {
					var decoded []string
					if err := json.Unmarshal([]byte(trimmedVal), &decoded); err == nil {
						rec[header] = decoded
					} else {
						rec[header] = trimmedVal
					}
				} else {
					rec[header] = trimmedVal
				}
			default:
				// System fields or unmapped columns
				if header == "verified" {
					lower := strings.ToLower(trimmedVal)
					rec[header] = (lower == "true" || lower == "1")
				} else if header == "attempt" || header == "max_attempts" || header == "priority" {
					if num, err := strconv.Atoi(trimmedVal); err == nil {
						rec[header] = num
					} else {
						rec[header] = trimmedVal
					}
				} else {
					rec[header] = trimmedVal
				}
			}
		}

		if hasValues {
			records = append(records, rec)
		}
	}

	return records, nil
}
