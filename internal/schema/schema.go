package schema

import "encoding/json"

type RelationConfig struct {
	TargetMoul  string `json:"targetMoul"`
	Cardinality string `json:"cardinality"` // "1:1", "1:N", "M:N"
}

type MoulField struct {
	Name           string          `json:"name"`
	Type           string          `json:"type"` // "text", "number", "bool", "json", "file", "relation"
	RelationConfig *RelationConfig `json:"relationConfig,omitempty"`
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
	Type      string      `json:"type"` // "base", "auth", "worker", or "analytic"
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
