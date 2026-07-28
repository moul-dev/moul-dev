package flags

import (
	"encoding/json"
	"fmt"
	"hash/crc32"
	"strings"
	"time"
)

// Flag represents a feature flag stored in SQLite.
type Flag struct {
	ID           string      `json:"id" db:"id"`
	Key          string      `json:"key" db:"key"`
	Description  string      `json:"description" db:"description"`
	Enabled      bool        `json:"enabled" db:"enabled"`
	DefaultValue string      `json:"default_value" db:"default_value"`
	Gates        GatesConfig `json:"gates" db:"-"`
	GatesJSON    string      `json:"-" db:"gates"`
	CreatedAt    string      `json:"created_at" db:"created_at"`
	UpdatedAt    string      `json:"updated_at" db:"updated_at"`
}

// GatesConfig represents gate rules for actor, group, and percentage targeting.
type GatesConfig struct {
	Actors     map[string]bool `json:"actors,omitempty"`
	Groups     map[string]bool `json:"groups,omitempty"`
	Percentage *Percentage     `json:"percentage,omitempty"`
}

// Percentage defines a percentage rollout gate.
type Percentage struct {
	Percentage float64 `json:"percentage"`          // 0.0 to 100.0
	Attribute  string  `json:"attribute,omitempty"` // Context attribute key to hash (default: "target_id" or "user_id")
}

// EvaluationResult represents the evaluation result of a flag.
type EvaluationResult struct {
	Value  interface{} `json:"value"`
	Reason string      `json:"reason"`
}

// Evaluate evaluates a Flag given an evaluation context map.
func Evaluate(flag *Flag, evalCtx map[string]interface{}) EvaluationResult {
	// 1. Master Boolean Switch
	if !flag.Enabled {
		return EvaluationResult{
			Value:  parseValue(flag.DefaultValue),
			Reason: "DISABLED",
		}
	}

	if evalCtx == nil {
		evalCtx = make(map[string]interface{})
	}

	// 2. Actor Gates
	if len(flag.Gates.Actors) > 0 {
		actorKeys := extractActorKeys(evalCtx)
		for _, key := range actorKeys {
			if enabled, ok := flag.Gates.Actors[key]; ok {
				return EvaluationResult{
					Value:  enabled,
					Reason: "TARGETING_MATCH (Actor)",
				}
			}
		}
	}

	// 3. Group Gates
	if len(flag.Gates.Groups) > 0 {
		groups := extractGroups(evalCtx)
		for _, grp := range groups {
			if enabled, ok := flag.Gates.Groups[grp]; ok {
				return EvaluationResult{
					Value:  enabled,
					Reason: "TARGETING_MATCH (Group)",
				}
			}
		}
	}

	// 4. Percentage Rollout Gate
	if flag.Gates.Percentage != nil && flag.Gates.Percentage.Percentage > 0 {
		targetVal := extractTargetID(evalCtx, flag.Gates.Percentage.Attribute)
		if targetVal != "" {
			bucket := calculatePercentageBucket(flag.Key, targetVal)
			if bucket < flag.Gates.Percentage.Percentage {
				return EvaluationResult{
					Value:  true,
					Reason: "TARGETING_MATCH (Percentage)",
				}
			} else {
				return EvaluationResult{
					Value:  false,
					Reason: "TARGETING_MATCH (Percentage)",
				}
			}
		}
	}

	// 5. Default Fallback
	return EvaluationResult{
		Value:  parseValue(flag.DefaultValue),
		Reason: "DEFAULT",
	}
}

// Helper: Calculate deterministic percentage bucket (0.0 to 99.999...) using CRC32
func calculatePercentageBucket(flagKey, targetID string) float64 {
	hashInput := fmt.Sprintf("%s:%s", flagKey, targetID)
	checksum := crc32.ChecksumIEEE([]byte(hashInput))
	return float64(checksum%10000) / 100.0
}

// Helper: Extract actor identifiers from evaluation context
func extractActorKeys(ctx map[string]interface{}) []string {
	var keys []string
	candidates := []string{"target_id", "user_id", "actor_id", "actor", "user", "email", "org_id"}
	for _, field := range candidates {
		if val, ok := ctx[field]; ok && val != nil {
			strVal := fmt.Sprintf("%v", val)
			if strVal != "" {
				keys = append(keys, strVal)
				keys = append(keys, fmt.Sprintf("%s:%s", field, strVal))
				if strings.HasSuffix(field, "_id") {
					shortField := strings.TrimSuffix(field, "_id")
					keys = append(keys, fmt.Sprintf("%s:%s", shortField, strVal))
				}
			}
		}
	}
	return keys
}

// Helper: Extract groups list from evaluation context
func extractGroups(ctx map[string]interface{}) []string {
	var groups []string
	if grpVal, ok := ctx["groups"]; ok && grpVal != nil {
		switch g := grpVal.(type) {
		case []string:
			groups = append(groups, g...)
		case []interface{}:
			for _, item := range g {
				groups = append(groups, fmt.Sprintf("%v", item))
			}
		case string:
			groups = append(groups, g)
		}
	}
	if roleVal, ok := ctx["role"]; ok && roleVal != nil {
		groups = append(groups, fmt.Sprintf("%v", roleVal))
	}
	return groups
}

// Helper: Extract target ID for percentage calculation
func extractTargetID(ctx map[string]interface{}, customAttr string) string {
	if customAttr != "" {
		if val, ok := ctx[customAttr]; ok && val != nil {
			return fmt.Sprintf("%v", val)
		}
	}
	for _, field := range []string{"target_id", "user_id", "actor_id", "id", "email"} {
		if val, ok := ctx[field]; ok && val != nil {
			s := fmt.Sprintf("%v", val)
			if s != "" {
				return s
			}
		}
	}
	return ""
}

// Helper: Parse string default value into appropriate type
func parseValue(val string) interface{} {
	lower := strings.ToLower(strings.TrimSpace(val))
	if lower == "true" {
		return true
	}
	if lower == "false" {
		return false
	}
	var js interface{}
	if err := json.Unmarshal([]byte(val), &js); err == nil {
		return js
	}
	return val
}

// NewFlag creates a Flag instance with initialized default values.
func NewFlag(id, key, description string, enabled bool, defaultValue string, gates GatesConfig) *Flag {
	now := time.Now().UTC().Format(time.RFC3339)
	if id == "" {
		id = fmt.Sprintf("ff_%d", time.Now().UnixNano())
	}
	if defaultValue == "" {
		defaultValue = "false"
	}
	gatesJSON, _ := json.Marshal(gates)
	return &Flag{
		ID:           id,
		Key:          key,
		Description:  description,
		Enabled:      enabled,
		DefaultValue: defaultValue,
		Gates:        gates,
		GatesJSON:    string(gatesJSON),
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}
