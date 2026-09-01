package flags

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/open-feature/go-sdk/openfeature"
)

func TestFlagEvaluation(t *testing.T) {
	// 1. Master Boolean switch
	fDisabled := NewFlag("1", "test-flag", "test", false, "false", GatesConfig{})
	res := Evaluate(fDisabled, nil)
	if res.Value != false || res.Reason != "DISABLED" {
		t.Errorf("expected disabled flag to evaluate to false (DISABLED), got %v (%s)", res.Value, res.Reason)
	}

	fEnabled := NewFlag("2", "test-flag-2", "test", true, "true", GatesConfig{})
	res2 := Evaluate(fEnabled, nil)
	if res2.Value != true || res2.Reason != "DEFAULT" {
		t.Errorf("expected enabled flag to evaluate to true (DEFAULT), got %v (%s)", res2.Value, res2.Reason)
	}

	// 2. Actor Gate Overrides
	fActor := NewFlag("3", "actor-flag", "test", true, "false", GatesConfig{
		Actors: map[string]bool{
			"user:123": true,
			"user:999": false,
		},
	})
	resActor1 := Evaluate(fActor, map[string]interface{}{"user_id": "123"})
	if resActor1.Value != true || resActor1.Reason != "TARGETING_MATCH (Actor)" {
		t.Errorf("expected user:123 to be enabled by actor gate, got %v (%s)", resActor1.Value, resActor1.Reason)
	}
	resActor2 := Evaluate(fActor, map[string]interface{}{"user_id": "999"})
	if resActor2.Value != false || resActor2.Reason != "TARGETING_MATCH (Actor)" {
		t.Errorf("expected user:999 to be disabled by actor gate, got %v (%s)", resActor2.Value, resActor2.Reason)
	}
	resActor3 := Evaluate(fActor, map[string]interface{}{"user_id": "456"})
	if resActor3.Value != false || resActor3.Reason != "DEFAULT" {
		t.Errorf("expected user:456 to fallback to default, got %v (%s)", resActor3.Value, resActor3.Reason)
	}

	// 3. Group Gate Rules
	fGroup := NewFlag("4", "group-flag", "test", true, "false", GatesConfig{
		Groups: map[string]bool{
			"admins":       true,
			"beta-testers": true,
		},
	})
	resGroup1 := Evaluate(fGroup, map[string]interface{}{"groups": []string{"admins"}})
	if resGroup1.Value != true || resGroup1.Reason != "TARGETING_MATCH (Group)" {
		t.Errorf("expected admins group to evaluate to true, got %v (%s)", resGroup1.Value, resGroup1.Reason)
	}
	resGroup2 := Evaluate(fGroup, map[string]interface{}{"groups": []string{"regular"}})
	if resGroup2.Value != false || resGroup2.Reason != "DEFAULT" {
		t.Errorf("expected regular group to evaluate to false default, got %v (%s)", resGroup2.Value, resGroup2.Reason)
	}

	// 4. Percentage Rollout
	fPerc := NewFlag("5", "perc-flag", "test", true, "false", GatesConfig{
		Percentage: &Percentage{
			Percentage: 50.0,
		},
	})
	// Calculate hash for target ID 1 vs 2 to check determinism
	resP1 := Evaluate(fPerc, map[string]interface{}{"user_id": "user_alpha"})
	resP1Repeat := Evaluate(fPerc, map[string]interface{}{"user_id": "user_alpha"})
	if resP1.Value != resP1Repeat.Value {
		t.Errorf("percentage evaluation for user_alpha must be deterministic! got %v then %v", resP1.Value, resP1Repeat.Value)
	}
}

func TestStoreAndOpenFeatureProvider(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_flags.db")

	database, err := db.InitDB(dbPath)
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	defer database.Close()

	store := NewStore(database)
	provider := NewProvider(store)

	// Register with OpenFeature SDK
	if err := openfeature.SetProviderAndWait(provider); err != nil {
		t.Fatalf("failed to set provider: %v", err)
	}
	client := openfeature.NewClient("test-client")

	// 1. Non-existent flag should return default fallback value
	val, err := client.BooleanValue(context.Background(), "missing-flag", false, openfeature.EvaluationContext{})
	if err == nil {
		t.Errorf("expected FLAG_NOT_FOUND error for missing flag, got nil")
	}
	if val != false {
		t.Errorf("expected missing flag to return default false, got %v", val)
	}

	// 2. Create a flag in Store
	flag := NewFlag("", "new-feature", "Awesome feature", true, "false", GatesConfig{
		Actors: map[string]bool{
			"vip_user": true,
		},
	})
	if err := store.SaveFlag(flag); err != nil {
		t.Fatalf("failed to save flag: %v", err)
	}

	// 3. Evaluate via OpenFeature Client
	evalCtx := openfeature.NewEvaluationContext("vip_user", map[string]interface{}{
		"user_id": "vip_user",
	})
	valVip, _ := client.BooleanValue(context.Background(), "new-feature", false, evalCtx)
	if valVip != true {
		t.Errorf("expected vip_user to get true for new-feature, got %v", valVip)
	}

	// 4. Update Flag State (Master disable)
	flag.Enabled = false
	if err := store.SaveFlag(flag); err != nil {
		t.Fatalf("failed to update flag: %v", err)
	}

	valDisabled, _ := client.BooleanValue(context.Background(), "new-feature", true, evalCtx)
	if valDisabled != false {
		t.Errorf("expected disabled flag to evaluate to default false, got %v", valDisabled)
	}
}
