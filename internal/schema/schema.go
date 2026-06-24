package schema

import "encoding/json"

type MoulField struct {
	Name string `json:"name"`
	Type string `json:"type"` // "text", "number", "bool", "json"
}

type MoulRules struct {
	ListRule   string `json:"listRule"`
	ViewRule   string `json:"viewRule"`
	CreateRule string `json:"createRule"`
	UpdateRule string `json:"updateRule"`
	DeleteRule string `json:"deleteRule"`
}

type Moul struct {
	ID        string      `json:"id"`
	Name      string      `json:"name"`
	Type      string      `json:"type"` // "base", "auth", or "worker"
	Fields    []MoulField `json:"fields"`
	Rules     MoulRules   `json:"rules"`
	CreatedAt string      `json:"created_at"`
	UpdatedAt string      `json:"updated_at"`
}

// Helper to serialize Fields to JSON for SQLite storage
func (m *Moul) SerializeFields() (string, error) {
	bytes, err := json.Marshal(m.Fields)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// Helper to serialize Rules to JSON for SQLite storage
func (m *Moul) SerializeRules() (string, error) {
	bytes, err := json.Marshal(m.Rules)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}
