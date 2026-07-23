package middleware

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

type tokenBucket struct {
	tokens   float64
	lastSeen time.Time
}

type limiterState struct {
	sync.RWMutex
	enabled  bool
	rules    []schema.RateLimitRule
	limiters map[string]*tokenBucket
}

var globalState = &limiterState{
	limiters: make(map[string]*tokenBucket),
}

// InitRateLimiter loads initial configuration and starts the cleanup loop.
func InitRateLimiter(db *dbx.DB) error {
	if err := ReloadRateLimiter(db); err != nil {
		return err
	}
	globalState.startCleanup(1 * time.Minute)
	return nil
}

// ReloadRateLimiter refreshes settings from the database.
func ReloadRateLimiter(db *dbx.DB) error {
	globalState.Lock()
	defer globalState.Unlock()

	var enabledVal string
	err := db.Select("value").From("_settings").Where(dbx.HashExp{"key": "rate_limiting_enabled"}).Row(&enabledVal)
	if err != nil {
		return err
	}
	globalState.enabled = (enabledVal == "true")

	var rulesVal string
	err = db.Select("value").From("_settings").Where(dbx.HashExp{"key": "rate_limiting_rules"}).Row(&rulesVal)
	if err != nil {
		return err
	}

	var rules []schema.RateLimitRule
	if rulesVal != "" {
		if err := json.Unmarshal([]byte(rulesVal), &rules); err != nil {
			return err
		}
	}
	globalState.rules = rules

	// Clear existing limiters to apply new limits immediately
	globalState.limiters = make(map[string]*tokenBucket)

	return nil
}

func (s *limiterState) startCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			s.Lock()
			now := time.Now()
			for k, lim := range s.limiters {
				// Purge limiters that haven't been active for 10 minutes
				if now.Sub(lim.lastSeen) > 10*time.Minute {
					delete(s.limiters, k)
				}
			}
			s.Unlock()
		}
	}()
}

// getMoulAndAction resolves moul name and action from the parameterized Echo path.
func getMoulAndAction(c *echo.Context) (string, string) {
	path := c.Path()
	method := c.Request().Method
	moulName := c.Param("moulName")

	if moulName == "" {
		return "", ""
	}

	if strings.Contains(path, "/auth-with-") || strings.Contains(path, "/otp/") || strings.Contains(path, "/passkey/") {
		return moulName, "auth"
	}

	if path == "/api/moul/:moulName/records" {
		if method == http.MethodPost {
			return moulName, "create"
		}
		if method == http.MethodGet {
			return moulName, "list"
		}
	}

	if path == "/api/moul/:moulName/records/:id" {
		if method == http.MethodGet {
			return moulName, "view"
		}
		if method == http.MethodPatch {
			return moulName, "update"
		}
		if method == http.MethodDelete {
			return moulName, "delete"
		}
	}

	return "", ""
}

// DynamicRateLimiter interceptor that implements dynamic rate limiting.
func DynamicRateLimiter(adminKey string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			globalState.RLock()
			enabled := globalState.enabled
			rules := globalState.rules
			globalState.RUnlock()

			if !enabled {
				return next(c)
			}

			// Admin requests bypass all rate limits
			providedAdminKey := c.Request().Header.Get("X-Admin-Key")
			if providedAdminKey != "" && providedAdminKey == adminKey {
				return next(c)
			}

			ip := c.RealIP()
			moulName, action := getMoulAndAction(c)
			path := c.Request().URL.Path

			// Match rules sequentially (top-to-bottom)
			var matchedRule *schema.RateLimitRule
			for _, r := range rules {
				// 1. Check targeted users
				authRecord := GetAuthRecord(c)
				if r.TargetedUsers == "authenticated" && authRecord == nil {
					continue
				}
				if r.TargetedUsers == "guest" && authRecord != nil {
					continue
				}

				// 2. Check path or action label
				if strings.Contains(r.Label, ":") {
					// Action match: [moulPattern]:[actionPattern]
					parts := strings.Split(r.Label, ":")
					if len(parts) == 2 {
						moulPattern := parts[0]
						actionPattern := parts[1]

						if moulName != "" && action != "" {
							moulMatch := (moulPattern == "*" || moulPattern == moulName)
							actionMatch := (actionPattern == "*" || actionPattern == action)
							if moulMatch && actionMatch {
								matchedRule = &r
								break
							}
						}
					}
				} else {
					// Path prefix match
					if strings.HasPrefix(path, r.Label) {
						matchedRule = &r
						break
					}
				}
			}

			if matchedRule != nil {
				// Evaluate rate limit check using custom token bucket
				key := ip + ":" + matchedRule.Label
				globalState.Lock()
				lim, exists := globalState.limiters[key]
				if !exists {
					lim = &tokenBucket{
						tokens:   float64(matchedRule.MaxRequests),
						lastSeen: time.Now(),
					}
					globalState.limiters[key] = lim
				}

				now := time.Now()
				elapsed := now.Sub(lim.lastSeen).Seconds()
				lim.lastSeen = now

				// Refill based on time elapsed
				refill := elapsed * (float64(matchedRule.MaxRequests) / float64(matchedRule.Interval))
				lim.tokens += refill
				if lim.tokens > float64(matchedRule.MaxRequests) {
					lim.tokens = float64(matchedRule.MaxRequests)
				}

				allowed := false
				if lim.tokens >= 1.0 {
					lim.tokens -= 1.0
					allowed = true
				}
				globalState.Unlock()

				if !allowed {
					return echo.NewHTTPError(http.StatusTooManyRequests, "Too many requests")
				}
			}

			return next(c)
		}
	}
}
