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

const (
	// DefaultMaxConcurrentPerUser is the default cap for active concurrent realtime SSE streams per user.
	DefaultMaxConcurrentPerUser = 15
	// DefaultMaxConcurrentPerIP is the default cap for active concurrent realtime SSE streams per IP.
	DefaultMaxConcurrentPerIP = 30
)

type limiterState struct {
	sync.RWMutex
	enabled     bool
	rules       []schema.RateLimitRule
	limiters    map[string]*tokenBucket
	activeIPs   map[string]int
	activeUsers map[string]int
	activeRules map[string]int
}

var globalState = &limiterState{
	limiters:    make(map[string]*tokenBucket),
	activeIPs:   make(map[string]int),
	activeUsers: make(map[string]int),
	activeRules: make(map[string]int),
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
	if globalState.activeIPs == nil {
		globalState.activeIPs = make(map[string]int)
	}
	if globalState.activeUsers == nil {
		globalState.activeUsers = make(map[string]int)
	}
	if globalState.activeRules == nil {
		globalState.activeRules = make(map[string]int)
	}

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
	moulName := c.Param("name")

	if path == "/api/moul/subscribe" {
		return "*", "subscribe"
	}
	if path == "/api/realtime/ticket" {
		return "*", "ticket"
	}

	if moulName == "" {
		return "", ""
	}

	if path == "/api/moul/:name/subscribe" {
		return moulName, "subscribe"
	}

	if strings.Contains(path, "/auth-with-") || strings.Contains(path, "/otp/") || strings.Contains(path, "/passkey/") {
		return moulName, "auth"
	}

	if path == "/api/moul/:name/records" {
		if method == http.MethodPost {
			return moulName, "create"
		}
		if method == http.MethodGet {
			return moulName, "list"
		}
	}

	if path == "/api/moul/:name/records/:id" {
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

// AcquireRealtimeConnection checks active connection quotas for an SSE stream.
// If allowed, it increments active connection counters and returns a release function
// to be invoked via defer when the stream terminates.
// If the quota is exceeded, it returns an HTTP 429 error.
func AcquireRealtimeConnection(c *echo.Context, moulName string, authUser map[string]interface{}, isAdmin bool) (func(), error) {
	if isAdmin {
		return func() {}, nil
	}

	globalState.Lock()
	defer globalState.Unlock()

	if !globalState.enabled {
		return func() {}, nil
	}

	if globalState.activeIPs == nil {
		globalState.activeIPs = make(map[string]int)
	}
	if globalState.activeUsers == nil {
		globalState.activeUsers = make(map[string]int)
	}
	if globalState.activeRules == nil {
		globalState.activeRules = make(map[string]int)
	}

	ip := c.RealIP()
	var userKey string
	if authUser != nil {
		if id, ok := authUser["id"].(string); ok && id != "" {
			moul, _ := authUser["moul"].(string)
			if moul == "" {
				moul = "user"
			}
			userKey = moul + ":" + id
		}
	}

	// 1. Check IP quota against baseline default cap
	if globalState.activeIPs[ip] >= DefaultMaxConcurrentPerIP {
		return nil, echo.NewHTTPError(http.StatusTooManyRequests, "Too many concurrent realtime connections for this IP")
	}

	// 2. Check User quota against baseline default cap (if authenticated)
	if userKey != "" && globalState.activeUsers[userKey] >= DefaultMaxConcurrentPerUser {
		return nil, echo.NewHTTPError(http.StatusTooManyRequests, "Too many concurrent realtime connections for this user")
	}

	// 3. Match against configured rules for custom MaxConcurrent caps
	var matchedRule *schema.RateLimitRule
	path := c.Request().URL.Path
	action := "subscribe"

	for _, r := range globalState.rules {
		if r.MaxConcurrent <= 0 {
			continue
		}

		// Check targeted users
		if r.TargetedUsers == "authenticated" && authUser == nil {
			continue
		}
		if r.TargetedUsers == "guest" && authUser != nil {
			continue
		}

		// Check rule label
		if strings.Contains(r.Label, ":") {
			parts := strings.Split(r.Label, ":")
			if len(parts) == 2 {
				moulPattern := parts[0]
				actionPattern := parts[1]
				moulMatch := (moulPattern == "*" || moulPattern == moulName)
				actionMatch := (actionPattern == "*" || actionPattern == action)
				if moulMatch && actionMatch {
					matchedRule = &r
					break
				}
			}
		} else {
			if strings.HasPrefix(path, r.Label) {
				matchedRule = &r
				break
			}
		}
	}

	var ruleSlotKey string
	if matchedRule != nil {
		if userKey != "" {
			ruleSlotKey = userKey + ":" + matchedRule.Label
		} else {
			ruleSlotKey = ip + ":" + matchedRule.Label
		}

		if globalState.activeRules[ruleSlotKey] >= matchedRule.MaxConcurrent {
			return nil, echo.NewHTTPError(http.StatusTooManyRequests, "Too many concurrent realtime connections for this subscription")
		}
	}

	// Increment all applicable counters
	globalState.activeIPs[ip]++
	if userKey != "" {
		globalState.activeUsers[userKey]++
	}
	if ruleSlotKey != "" {
		globalState.activeRules[ruleSlotKey]++
	}

	var releaseOnce sync.Once
	release := func() {
		releaseOnce.Do(func() {
			globalState.Lock()
			defer globalState.Unlock()

			if globalState.activeIPs[ip] > 1 {
				globalState.activeIPs[ip]--
			} else {
				delete(globalState.activeIPs, ip)
			}

			if userKey != "" {
				if globalState.activeUsers[userKey] > 1 {
					globalState.activeUsers[userKey]--
				} else {
					delete(globalState.activeUsers, userKey)
				}
			}

			if ruleSlotKey != "" {
				if globalState.activeRules[ruleSlotKey] > 1 {
					globalState.activeRules[ruleSlotKey]--
				} else {
					delete(globalState.activeRules, ruleSlotKey)
				}
			}
		})
	}

	return release, nil
}

// GetActiveConnectionCounts returns current active counts for inspection/testing.
func GetActiveConnectionCounts() (ips int, users int, rules int) {
	globalState.RLock()
	defer globalState.RUnlock()
	return len(globalState.activeIPs), len(globalState.activeUsers), len(globalState.activeRules)
}

// ResetActiveConnections clears all active connection counters (primarily for tests).
func ResetActiveConnections() {
	globalState.Lock()
	defer globalState.Unlock()
	globalState.activeIPs = make(map[string]int)
	globalState.activeUsers = make(map[string]int)
	globalState.activeRules = make(map[string]int)
}
