package flags

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/pocketbase/dbx"
)

// Store handles database persistence and thread-safe caching for feature flags.
type Store struct {
	db      *dbx.DB
	mu      sync.RWMutex
	cache   map[string]*Flag
	lastRef time.Time
	ttl     time.Duration
}

// NewStore initializes a feature flag Store.
func NewStore(db *dbx.DB) *Store {
	s := &Store{
		db:    db,
		cache: make(map[string]*Flag),
		ttl:   10 * time.Second,
	}
	_ = s.RefreshCache()
	return s
}

// RefreshCache loads all flags from SQLite into memory.
func (s *Store) RefreshCache() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	var dbFlags []Flag
	err := s.db.Select("*").From("_feature_flags").All(&dbFlags)
	if err != nil {
		return err
	}

	newCache := make(map[string]*Flag)
	for i := range dbFlags {
		f := &dbFlags[i]
		if f.GatesJSON != "" {
			var g GatesConfig
			if err := json.Unmarshal([]byte(f.GatesJSON), &g); err == nil {
				f.Gates = g
			}
		}
		newCache[f.Key] = f
	}

	s.cache = newCache
	s.lastRef = time.Now()
	return nil
}

// GetFlag retrieves a flag by key from cache (refreshing if expired).
func (s *Store) GetFlag(key string) (*Flag, error) {
	s.mu.RLock()
	if time.Since(s.lastRef) > s.ttl {
		s.mu.RUnlock()
		_ = s.RefreshCache()
		s.mu.RLock()
	}
	flag, exists := s.cache[key]
	s.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("flag not found: %s", key)
	}
	return flag, nil
}

// ListFlags returns all cached flags.
func (s *Store) ListFlags() ([]*Flag, error) {
	s.mu.RLock()
	if time.Since(s.lastRef) > s.ttl {
		s.mu.RUnlock()
		_ = s.RefreshCache()
		s.mu.RLock()
	}
	res := make([]*Flag, 0, len(s.cache))
	for _, f := range s.cache {
		res = append(res, f)
	}
	s.mu.RUnlock()
	return res, nil
}

// SaveFlag persists a flag to SQLite and updates the cache.
func (s *Store) SaveFlag(flag *Flag) error {
	gatesJSON, err := json.Marshal(flag.Gates)
	if err != nil {
		return fmt.Errorf("invalid gates config: %w", err)
	}
	flag.GatesJSON = string(gatesJSON)
	flag.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	var count int
	err = s.db.Select("COUNT(*)").From("_feature_flags").Where(dbx.HashExp{"key": flag.Key}).Row(&count)
	if err == nil && count > 0 {
		_, err = s.db.Update("_feature_flags", dbx.Params{
			"description":   flag.Description,
			"enabled":       flag.Enabled,
			"default_value": flag.DefaultValue,
			"gates":         flag.GatesJSON,
			"updated_at":    flag.UpdatedAt,
		}, dbx.HashExp{"key": flag.Key}).Execute()
	} else {
		if flag.ID == "" {
			flag.ID = fmt.Sprintf("ff_%d", time.Now().UnixNano())
		}
		if flag.CreatedAt == "" {
			flag.CreatedAt = flag.UpdatedAt
		}
		_, err = s.db.Insert("_feature_flags", dbx.Params{
			"id":            flag.ID,
			"key":           flag.Key,
			"description":   flag.Description,
			"enabled":       flag.Enabled,
			"default_value": flag.DefaultValue,
			"gates":         flag.GatesJSON,
			"created_at":    flag.CreatedAt,
			"updated_at":    flag.UpdatedAt,
		}).Execute()
	}

	if err != nil {
		return err
	}
	return s.RefreshCache()
}

// DeleteFlag deletes a flag from SQLite and cache.
func (s *Store) DeleteFlag(key string) error {
	_, err := s.db.Delete("_feature_flags", dbx.HashExp{"key": key}).Execute()
	if err != nil {
		return err
	}
	return s.RefreshCache()
}

// Provider implements OpenFeature FeatureProvider interface.
type Provider struct {
	store *Store
}

// NewProvider creates a new OpenFeature provider backed by Store.
func NewProvider(store *Store) *Provider {
	return &Provider{store: store}
}

// Metadata returns provider metadata.
func (p *Provider) Metadata() openfeature.Metadata {
	return openfeature.Metadata{
		Name: "MoulFeatureFlagProvider",
	}
}

// Hooks returns provider hooks.
func (p *Provider) Hooks() []openfeature.Hook {
	return nil
}

// BooleanEvaluation evaluates boolean flag.
func (p *Provider) BooleanEvaluation(ctx context.Context, flagKey string, defaultValue bool, evalCtx openfeature.FlattenedContext) openfeature.BoolResolutionDetail {
	flag, err := p.store.GetFlag(flagKey)
	if err != nil {
		return openfeature.BoolResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.DefaultReason,
				ResolutionError: openfeature.NewFlagNotFoundResolutionError(err.Error()),
			},
		}
	}

	res := Evaluate(flag, evalCtx)
	bVal, ok := res.Value.(bool)
	if !ok {
		return openfeature.BoolResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.Reason(res.Reason),
				ResolutionError: openfeature.NewTypeMismatchResolutionError("value is not a boolean"),
			},
		}
	}

	return openfeature.BoolResolutionDetail{
		Value: bVal,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason: openfeature.Reason(res.Reason),
		},
	}
}

// StringEvaluation evaluates string flag.
func (p *Provider) StringEvaluation(ctx context.Context, flagKey string, defaultValue string, evalCtx openfeature.FlattenedContext) openfeature.StringResolutionDetail {
	flag, err := p.store.GetFlag(flagKey)
	if err != nil {
		return openfeature.StringResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.DefaultReason,
				ResolutionError: openfeature.NewFlagNotFoundResolutionError(err.Error()),
			},
		}
	}

	res := Evaluate(flag, evalCtx)
	sVal := fmt.Sprintf("%v", res.Value)
	return openfeature.StringResolutionDetail{
		Value: sVal,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason: openfeature.Reason(res.Reason),
		},
	}
}

// FloatEvaluation evaluates float flag.
func (p *Provider) FloatEvaluation(ctx context.Context, flagKey string, defaultValue float64, evalCtx openfeature.FlattenedContext) openfeature.FloatResolutionDetail {
	flag, err := p.store.GetFlag(flagKey)
	if err != nil {
		return openfeature.FloatResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.DefaultReason,
				ResolutionError: openfeature.NewFlagNotFoundResolutionError(err.Error()),
			},
		}
	}

	res := Evaluate(flag, evalCtx)
	var fVal float64
	switch v := res.Value.(type) {
	case float64:
		fVal = v
	case float32:
		fVal = float64(v)
	case int:
		fVal = float64(v)
	case int64:
		fVal = float64(v)
	default:
		return openfeature.FloatResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.Reason(res.Reason),
				ResolutionError: openfeature.NewTypeMismatchResolutionError("value is not a float"),
			},
		}
	}

	return openfeature.FloatResolutionDetail{
		Value: fVal,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason: openfeature.Reason(res.Reason),
		},
	}
}

// IntEvaluation evaluates int flag.
func (p *Provider) IntEvaluation(ctx context.Context, flagKey string, defaultValue int64, evalCtx openfeature.FlattenedContext) openfeature.IntResolutionDetail {
	flag, err := p.store.GetFlag(flagKey)
	if err != nil {
		return openfeature.IntResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.DefaultReason,
				ResolutionError: openfeature.NewFlagNotFoundResolutionError(err.Error()),
			},
		}
	}

	res := Evaluate(flag, evalCtx)
	var iVal int64
	switch v := res.Value.(type) {
	case int64:
		iVal = v
	case int:
		iVal = int64(v)
	case float64:
		iVal = int64(v)
	default:
		return openfeature.IntResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.Reason(res.Reason),
				ResolutionError: openfeature.NewTypeMismatchResolutionError("value is not an int"),
			},
		}
	}

	return openfeature.IntResolutionDetail{
		Value: iVal,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason: openfeature.Reason(res.Reason),
		},
	}
}

// ObjectEvaluation evaluates object flag.
func (p *Provider) ObjectEvaluation(ctx context.Context, flagKey string, defaultValue interface{}, evalCtx openfeature.FlattenedContext) openfeature.InterfaceResolutionDetail {
	flag, err := p.store.GetFlag(flagKey)
	if err != nil {
		return openfeature.InterfaceResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.DefaultReason,
				ResolutionError: openfeature.NewFlagNotFoundResolutionError(err.Error()),
			},
		}
	}

	res := Evaluate(flag, evalCtx)
	return openfeature.InterfaceResolutionDetail{
		Value: res.Value,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason: openfeature.Reason(res.Reason),
		},
	}
}
