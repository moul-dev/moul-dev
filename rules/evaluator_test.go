package rules

import (
	"testing"
)

func TestEvaluateRule(t *testing.T) {
	// 1. Empty rule should evaluate to true
	allowed, err := EvaluateRule("", nil, nil)
	if err != nil {
		t.Fatalf("expected no error for empty rule, got %v", err)
	}
	if !allowed {
		t.Error("expected empty rule to evaluate to true")
	}

	// 2. Simple boolean expression
	recordData := map[string]interface{}{
		"status": "published",
		"price":  100,
	}
	allowed, err = EvaluateRule("status == 'published' && price >= 50", nil, recordData)
	if err != nil {
		t.Fatalf("EvaluateRule failed: %v", err)
	}
	if !allowed {
		t.Error("expected status == 'published' && price >= 50 to be true")
	}

	// 3. Auth context (nil auth)
	allowed, err = EvaluateRule("auth.id == nil", nil, recordData)
	if err != nil {
		t.Fatalf("EvaluateRule failed: %v", err)
	}
	if !allowed {
		t.Error("expected auth.id to be nil when auth context is nil")
	}

	// 4. Auth context (valid auth)
	authRecord := map[string]interface{}{
		"id":    "user-1",
		"email": "user@example.com",
	}
	recordDataWithAuthor := map[string]interface{}{
		"author_id": "user-1",
	}
	allowed, err = EvaluateRule("auth.id == author_id", authRecord, recordDataWithAuthor)
	if err != nil {
		t.Fatalf("EvaluateRule failed: %v", err)
	}
	if !allowed {
		t.Error("expected auth.id == author_id to be true")
	}

	// 5. Rule compilation error (syntax error)
	_, err = EvaluateRule("auth.id ==", authRecord, recordDataWithAuthor)
	if err == nil {
		t.Error("expected compilation error for malformed rule, got nil")
	}

	// 6. Non-boolean output
	_, err = EvaluateRule("'just-a-string'", nil, nil)
	if err == nil {
		t.Error("expected error for non-boolean rule result, got nil")
	}

	// 7. Execution error (index out of bounds)
	outOfBoundsEnv := map[string]interface{}{
		"arr": []int{},
	}
	_, err = EvaluateRule("arr[5] == 1", nil, outOfBoundsEnv)
	if err == nil {
		t.Error("expected execution error for array index out of bounds, got nil")
	}
}
