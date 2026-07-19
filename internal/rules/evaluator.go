package rules

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/expr-lang/expr"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// EvaluateRule evaluates a boolean rule expression (with PocketBase-like syntax) against the auth context, record data, and request context.
func EvaluateRule(
	dbConn *dbx.DB,
	ruleStr string,
	authRecord map[string]interface{},
	recordData map[string]interface{},
	requestContext ...map[string]interface{},
) (bool, error) {
	if ruleStr == "" {
		return true, nil // Empty rule means public access
	}

	// 1. Translate PocketBase rules syntax to Go expr syntax
	translatedStr, collectionGroups, err := Translate(ruleStr)
	if err != nil {
		return false, fmt.Errorf("failed to translate rule: %w", err)
	}

	// 2. Prepare environment
	env := make(map[string]interface{})

	// Add record fields
	for k, v := range recordData {
		env[k] = v
	}
	env["_record"] = recordData

	// Add auth context
	if authRecord != nil {
		env["auth"] = authRecord
	} else {
		env["auth"] = map[string]interface{}{
			"id":       nil,
			"username": nil,
			"email":    nil,
		}
	}

	// Add request context
	reqMap := map[string]interface{}{
		"auth":    env["auth"],
		"body":    map[string]interface{}{},
		"headers": map[string]interface{}{},
		"query":   map[string]interface{}{},
		"method":  "",
	}
	if len(requestContext) > 0 && requestContext[0] != nil {
		for k, v := range requestContext[0] {
			reqMap[k] = v
		}
	}
	env["request"] = reqMap

	// Inject Datetime Macros (UTC)
	now := time.Now().UTC()
	env["_now"] = now.Format("2006-01-02 15:04:05.000Z")
	env["_yesterday"] = now.AddDate(0, 0, -1).Format("2006-01-02 15:04:05.000Z")
	env["_tomorrow"] = now.AddDate(0, 0, 1).Format("2006-01-02 15:04:05.000Z")
	env["_todayStart"] = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC).Format("2006-01-02 15:04:05.000Z")
	env["_todayEnd"] = time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 999000000, time.UTC).Format("2006-01-02 15:04:05.000Z")
	
	// Month start/end
	firstDayMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	env["_monthStart"] = firstDayMonth.Format("2006-01-02 15:04:05.000Z")
	env["_monthEnd"] = firstDayMonth.AddDate(0, 1, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond).Format("2006-01-02 15:04:05.000Z")
	
	// Year start/end
	firstDayYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
	env["_yearStart"] = firstDayYear.Format("2006-01-02 15:04:05.000Z")
	env["_yearEnd"] = firstDayYear.AddDate(1, 0, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond).Format("2006-01-02 15:04:05.000Z")

	// Inject function helpers
	env["lower"] = func(val interface{}) string {
		if val == nil {
			return ""
		}
		return strings.ToLower(fmt.Sprintf("%v", val))
	}

	env["length"] = func(val interface{}) int {
		if val == nil {
			return 0
		}
		rv := reflect.ValueOf(val)
		if rv.Kind() == reflect.Slice || rv.Kind() == reflect.Array || rv.Kind() == reflect.Map {
			return rv.Len()
		}
		if s, ok := val.(string); ok {
			return len(s)
		}
		return 0
	}

	env["isset"] = func(parent interface{}, key string) bool {
		if parent == nil {
			return false
		}
		m, ok := parent.(map[string]interface{})
		if !ok {
			return false
		}
		_, exists := m[key]
		return exists
	}

	env["changed"] = func(record interface{}, key string, body interface{}) bool {
		if record == nil || body == nil {
			return false
		}
		recMap, ok1 := record.(map[string]interface{})
		bodyMap, ok2 := body.(map[string]interface{})
		if !ok1 || !ok2 {
			return false
		}
		newVal, exists := bodyMap[key]
		if !exists {
			return false
		}
		oldVal := recMap[key]
		return !equalValues(newVal, oldVal)
	}

	env["geoDistance"] = func(lonA, latA, lonB, latB interface{}) float64 {
		flonA, err1 := toFloat64(lonA)
		flatA, err2 := toFloat64(latA)
		flonB, err3 := toFloat64(lonB)
		flatB, err4 := toFloat64(latB)
		if err1 != nil || err2 != nil || err3 != nil || err4 != nil {
			return 0
		}
		rad := math.Pi / 180
		la1 := flatA * rad
		lo1 := flonA * rad
		la2 := flatB * rad
		lo2 := flonB * rad

		dlat := la2 - la1
		dlon := lo2 - lo1

		a := math.Sin(dlat/2)*math.Sin(dlat/2) + math.Cos(la1)*math.Cos(la2)*math.Sin(dlon/2)*math.Sin(dlon/2)
		c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

		return 6371 * c
	}

	env["strftime"] = func(format interface{}, args ...interface{}) string {
		if dbConn == nil {
			return ""
		}
		fStr, ok := format.(string)
		if !ok {
			return ""
		}
		queryParts := make([]string, len(args)+1)
		queryParts[0] = "{:f}"
		params := dbx.Params{"f": fStr}
		for idx, arg := range args {
			pName := fmt.Sprintf("a%d", idx)
			queryParts[idx+1] = "{:" + pName + "}"
			params[pName] = arg
		}
		sqlStr := fmt.Sprintf("SELECT strftime(%s)", strings.Join(queryParts, ", "))

		var result sql.NullString
		qErr := dbConn.NewQuery(sqlStr).Bind(params).Row(&result)
		if qErr != nil || !result.Valid {
			return ""
		}
		return result.String
	}

	env["like"] = func(a, b interface{}) bool {
		return likeMatch(a, b)
	}

	// Wildcard / modifier function registrations
	env["any_eq"] = func(a, b interface{}) bool {
		for _, item := range toSlice(a) {
			if equalValues(item, b) {
				return true
			}
		}
		return false
	}
	env["any_neq"] = func(a, b interface{}) bool {
		for _, item := range toSlice(a) {
			if !equalValues(item, b) {
				return true
			}
		}
		return false
	}
	env["any_like"] = func(a, b interface{}) bool {
		for _, item := range toSlice(a) {
			if likeMatch(item, b) {
				return true
			}
		}
		return false
	}
	env["any_not_like"] = func(a, b interface{}) bool {
		for _, item := range toSlice(a) {
			if !likeMatch(item, b) {
				return true
			}
		}
		return false
	}
	env["any_gt"] = func(a, b interface{}) bool {
		return anyCompare(a, b, func(x, y float64) bool { return x > y })
	}
	env["any_gte"] = func(a, b interface{}) bool {
		return anyCompare(a, b, func(x, y float64) bool { return x >= y })
	}
	env["any_lt"] = func(a, b interface{}) bool {
		return anyCompare(a, b, func(x, y float64) bool { return x < y })
	}
	env["any_lte"] = func(a, b interface{}) bool {
		return anyCompare(a, b, func(x, y float64) bool { return x <= y })
	}

	env["all_eq"] = func(a, b interface{}) bool {
		slice := toSlice(a)
		if len(slice) == 0 {
			return false
		}
		for _, item := range slice {
			if !equalValues(item, b) {
				return false
			}
		}
		return true
	}
	env["all_neq"] = func(a, b interface{}) bool {
		slice := toSlice(a)
		if len(slice) == 0 {
			return false
		}
		for _, item := range slice {
			if equalValues(item, b) {
				return false
			}
		}
		return true
	}
	env["all_like"] = func(a, b interface{}) bool {
		slice := toSlice(a)
		if len(slice) == 0 {
			return false
		}
		for _, item := range slice {
			if !likeMatch(item, b) {
				return false
			}
		}
		return true
	}
	env["all_not_like"] = func(a, b interface{}) bool {
		slice := toSlice(a)
		if len(slice) == 0 {
			return false
		}
		for _, item := range slice {
			if likeMatch(item, b) {
				return false
			}
		}
		return true
	}
	env["all_gt"] = func(a, b interface{}) bool {
		return allCompare(a, b, func(x, y float64) bool { return x > y })
	}
	env["all_gte"] = func(a, b interface{}) bool {
		return allCompare(a, b, func(x, y float64) bool { return x >= y })
	}
	env["all_lt"] = func(a, b interface{}) bool {
		return allCompare(a, b, func(x, y float64) bool { return x < y })
	}
	env["all_lte"] = func(a, b interface{}) bool {
		return allCompare(a, b, func(x, y float64) bool { return x <= y })
	}

	env["exists"] = func(tableName string, filterStr string, args ...interface{}) bool {
		if dbConn == nil {
			return false
		}
		if errVal := db.ValidateTableName(tableName); errVal != nil {
			return false
		}
		// Convert ? to {:p0}, {:p1}, etc. for dbx compatibility
		params := dbx.Params{}
		runes := []rune(filterStr)
		var newFilter strings.Builder
		paramIdx := 0
		for _, r := range runes {
			if r == '?' {
				pName := fmt.Sprintf("p%d", paramIdx)
				newFilter.WriteString("{:" + pName + "}")
				if paramIdx < len(args) {
					params[pName] = args[paramIdx]
				} else {
					params[pName] = nil
				}
				paramIdx++
			} else {
				newFilter.WriteRune(r)
			}
		}

		quotedTable := db.QuoteIdentifier(tableName)
		queryStr := fmt.Sprintf("SELECT 1 FROM %s WHERE %s LIMIT 1", quotedTable, newFilter.String())
		var count int
		dbErr := dbConn.NewQuery(queryStr).Bind(params).Row(&count)
		if dbErr != nil {
			return false
		}
		return count > 0
	}

	env["get"] = func(tableName string, recordId interface{}) interface{} {
		if dbConn == nil {
			return nil
		}
		recIdStr, ok := recordId.(string)
		if !ok || recIdStr == "" {
			return nil
		}
		if errVal := db.ValidateTableName(tableName); errVal != nil {
			return nil
		}
		moul, errM := db.LoadMoulByName(dbConn, tableName)
		if errM != nil {
			return nil
		}
		quotedTable := db.QuoteIdentifier(tableName)
		queryStr := fmt.Sprintf("SELECT * FROM %s WHERE id = {:id} LIMIT 1", quotedTable)
		var rawRec dbx.NullStringMap
		errQ := dbConn.NewQuery(queryStr).Bind(dbx.Params{"id": recIdStr}).One(&rawRec)
		if errQ != nil {
			return nil
		}
		recordMap := nullStringMapToMap(rawRec)
		normalized := normalizeRecord(moul, recordMap)
		return normalized
	}

	// 3. Evaluate Grouped @collection queries
	for groupKey, group := range collectionGroups {
		safeKey := "exists_group_" + strings.ReplaceAll(groupKey, ":", "_")
		if dbConn == nil {
			env[safeKey] = false
			continue
		}
		if errVal := db.ValidateTableName(group.Table); errVal != nil {
			env[safeKey] = false
			continue
		}

		var sqlParts []string
		params := dbx.Params{}
		validGroup := true

		for idx, cond := range group.Conditions {
			sqlOp := cond.Operator
			if sqlOp == "=" || sqlOp == "==" {
				sqlOp = "="
			} else if sqlOp == "~" {
				sqlOp = "LIKE"
			} else if sqlOp == "!~" {
				sqlOp = "NOT LIKE"
			}
			if strings.HasPrefix(sqlOp, "?") {
				sqlOp = strings.TrimPrefix(sqlOp, "?")
				if sqlOp == "=" || sqlOp == "==" {
					sqlOp = "="
				} else if sqlOp == "~" {
					sqlOp = "LIKE"
				} else if sqlOp == "!~" {
					sqlOp = "NOT LIKE"
				}
			}

			var paramVal interface{}
			if cond.IsValId {
				paramVal = resolvePath(env, cond.Value)
			} else {
				paramVal = cond.Value
			}

			if sqlOp == "LIKE" || sqlOp == "NOT LIKE" {
				if s, ok := paramVal.(string); ok {
					if !strings.Contains(s, "%") {
						paramVal = "%" + s + "%"
					}
				}
			}

			pName := fmt.Sprintf("c%d", idx)
			sqlParts = append(sqlParts, fmt.Sprintf("%s %s {:%s}", db.QuoteIdentifier(cond.Field), sqlOp, pName))
			params[pName] = paramVal
		}

		if !validGroup || len(sqlParts) == 0 {
			env[safeKey] = false
			continue
		}

		quotedTable := db.QuoteIdentifier(group.Table)
		queryStr := fmt.Sprintf("SELECT 1 FROM %s WHERE %s LIMIT 1", quotedTable, strings.Join(sqlParts, " AND "))
		var count int
		dbErr := dbConn.NewQuery(queryStr).Bind(params).Row(&count)
		env[safeKey] = (dbErr == nil && count > 0)
	}

	// Compile translation with safety restrictions
	program, compileErr := expr.Compile(translatedStr,
		expr.Env(env),
		expr.AsBool(),
		expr.AllowUndefinedVariables(),
		expr.DisableAllBuiltins(),
	)
	if compileErr != nil {
		return false, fmt.Errorf("failed to compile rule '%s': %w", ruleStr, compileErr)
	}

	// Run expression
	output, runErr := expr.Run(program, env)
	if runErr != nil {
		return false, fmt.Errorf("failed to execute rule '%s': %w", ruleStr, runErr)
	}

	allowed, ok := output.(bool)
	if !ok {
		return false, fmt.Errorf("rule did not evaluate to a boolean (got %T)", output)
	}

	return allowed, nil
}

// Helpers

func toSlice(val interface{}) []interface{} {
	if val == nil {
		return nil
	}
	rv := reflect.ValueOf(val)
	if rv.Kind() == reflect.Slice || rv.Kind() == reflect.Array {
		res := make([]interface{}, rv.Len())
		for i := 0; i < rv.Len(); i++ {
			res[i] = rv.Index(i).Interface()
		}
		return res
	}
	return []interface{}{val}
}

func toFloat64(v interface{}) (float64, error) {
	switch val := v.(type) {
	case float64:
		return val, nil
	case float32:
		return float64(val), nil
	case int:
		return float64(val), nil
	case int64:
		return float64(val), nil
	case int32:
		return float64(val), nil
	case string:
		return strconv.ParseFloat(val, 64)
	default:
		return 0, fmt.Errorf("not a number")
	}
}

func equalValues(a, b interface{}) bool {
	if a == nil || b == nil {
		return a == b
	}
	fa, errA := toFloat64(a)
	fb, errB := toFloat64(b)
	if errA == nil && errB == nil {
		return fa == fb
	}
	sa := fmt.Sprintf("%v", a)
	sb := fmt.Sprintf("%v", b)
	return sa == sb
}

func sqlLikeMatch(str, pattern string) bool {
	escaped := regexp.QuoteMeta(pattern)
	escaped = strings.ReplaceAll(escaped, "%", ".*")
	escaped = strings.ReplaceAll(escaped, "_", ".")
	exprPattern := "^" + escaped + "$"
	re, err := regexp.Compile("(?i)" + exprPattern)
	if err != nil {
		return false
	}
	return re.MatchString(str)
}

func likeMatch(a, b interface{}) bool {
	sa, okA := a.(string)
	sb, okB := b.(string)
	if !okA || !okB {
		return false
	}
	if !strings.Contains(sb, "%") {
		sb = "%" + sb + "%"
	}
	return sqlLikeMatch(sa, sb)
}

func anyCompare(a, b interface{}, comp func(float64, float64) bool) bool {
	slice := toSlice(a)
	fb, errB := toFloat64(b)
	if errB != nil {
		return false
	}
	for _, item := range slice {
		fa, errA := toFloat64(item)
		if errA == nil {
			if comp(fa, fb) {
				return true
			}
		}
	}
	return false
}

func allCompare(a, b interface{}, comp func(float64, float64) bool) bool {
	slice := toSlice(a)
	if len(slice) == 0 {
		return false
	}
	fb, errB := toFloat64(b)
	if errB != nil {
		return false
	}
	for _, item := range slice {
		fa, errA := toFloat64(item)
		if errA != nil || !comp(fa, fb) {
			return false
		}
	}
	return true
}

func resolvePath(data interface{}, path string) interface{} {
	parts := strings.Split(path, ".")
	current := data
	for _, part := range parts {
		if current == nil {
			return nil
		}
		rv := reflect.ValueOf(current)
		if rv.Kind() == reflect.Slice || rv.Kind() == reflect.Array {
			var result []interface{}
			for i := 0; i < rv.Len(); i++ {
				elem := rv.Index(i).Interface()
				val := resolveSingleField(elem, part)
				if val != nil {
					result = append(result, val)
				}
			}
			current = result
			continue
		}
		current = resolveSingleField(current, part)
	}
	return current
}

func resolveSingleField(data interface{}, field string) interface{} {
	m, ok := data.(map[string]interface{})
	if !ok {
		return nil
	}
	return m[field]
}

func nullStringMapToMap(m dbx.NullStringMap) map[string]interface{} {
	res := make(map[string]interface{})
	for k, v := range m {
		if v.Valid {
			res[k] = v.String
		} else {
			res[k] = nil
		}
	}
	return res
}

func normalizeRecord(moul *schema.Moul, record map[string]interface{}) map[string]interface{} {
	delete(record, "passwordHash")
	delete(record, "otpCode")
	delete(record, "otpExpiresAt")
	delete(record, "passkeys")

	for _, field := range moul.Fields {
		val, ok := record[field.Name]
		if field.Type == "relation" && field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
			if !ok || val == nil {
				record[field.Name] = []string{}
				continue
			}
		} else {
			if !ok || val == nil {
				continue
			}
		}

		strVal, isStr := val.(string)
		if !isStr {
			continue
		}

		switch field.Type {
		case "number":
			if floatVal, err := strconv.ParseFloat(strVal, 64); err == nil {
				record[field.Name] = floatVal
			}
		case "bool":
			record[field.Name] = (strVal == "1" || strVal == "true")
		case "json", "file":
			if strVal != "" {
				var decoded interface{}
				if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
					record[field.Name] = decoded
				}
			}
		case "relation":
			if field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
				var decoded []string
				if strVal != "" && strVal != "null" {
					if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
						if decoded == nil {
							record[field.Name] = []string{}
						} else {
							record[field.Name] = decoded
						}
					} else {
						record[field.Name] = []string{}
					}
				} else {
					record[field.Name] = []string{}
				}
			}
		}
	}
	return record
}
