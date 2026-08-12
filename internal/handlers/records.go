package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/analytics"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/rules"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/moul-dev/moul-dev/internal/webhooks"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"
)

type RecordEngine interface {
	Trigger(tableName string, jobID string)
}

type RecordHandler struct {
	DB              *dbx.DB
	Engine          RecordEngine
	AnalyticsEngine *analytics.Engine
	SecureCookies   bool // Set to true in production, false in development
}

func NewRecordHandler(dbConn *dbx.DB) *RecordHandler {
	return &RecordHandler{DB: dbConn, SecureCookies: true}
}

// Convert dbx.NullStringMap to map[string]interface{}
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

func validateFieldConstraints(field schema.MoulField, val interface{}, isUpdate bool) error {
	if field.Required {
		if val == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q is required", field.Name))
		}
		if strVal, ok := val.(string); ok && strings.TrimSpace(strVal) == "" {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q is required and cannot be empty", field.Name))
		}
	}

	if val == nil {
		return nil
	}

	asFloat := func(v interface{}) (float64, bool) {
		switch num := v.(type) {
		case float64:
			return num, true
		case float32:
			return float64(num), true
		case int:
			return float64(num), true
		case int64:
			return float64(num), true
		case int32:
			return float64(num), true
		case json.Number:
			if f, err := num.Float64(); err == nil {
				return f, true
			}
		case string:
			if f, err := strconv.ParseFloat(num, 64); err == nil {
				return f, true
			}
		}
		return 0, false
	}

	switch field.Type {
	case "number":
		numVal, ok := asFloat(val)
		if !ok {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a number", field.Name))
		}
		if field.Min != nil && numVal < *field.Min {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be at least %v", field.Name, *field.Min))
		}
		if field.Max != nil && numVal > *field.Max {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be at most %v", field.Name, *field.Max))
		}
	case "text":
		if strVal, ok := val.(string); ok {
			runeLen := float64(len([]rune(strVal)))
			if field.Min != nil && runeLen < *field.Min {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q length must be at least %v characters", field.Name, *field.Min))
			}
			if field.Max != nil && runeLen > *field.Max {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q length must be at most %v characters", field.Name, *field.Max))
			}
		}
	case "bool":
		switch v := val.(type) {
		case bool:
			// valid
		case int, int64, float64:
			// valid numeric boolean
		case string:
			lower := strings.ToLower(strings.TrimSpace(v))
			if lower != "true" && lower != "false" && lower != "1" && lower != "0" {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a boolean", field.Name))
			}
		default:
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a boolean", field.Name))
		}
	case "date":
		strVal, ok := val.(string)
		if !ok {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a date string (YYYY-MM-DD)", field.Name))
		}
		if strVal != "" {
			if _, err := time.Parse("2006-01-02", strVal); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a valid date in YYYY-MM-DD format", field.Name))
			}
		}
	case "datetime":
		strVal, ok := val.(string)
		if !ok {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be an ISO 8601 date-time string", field.Name))
		}
		if strVal != "" {
			valid := false
			formats := []string{
				time.RFC3339,
				time.RFC3339Nano,
				"2006-01-02T15:04:05Z",
				"2006-01-02T15:04:05",
				"2006-01-02 15:04:05",
			}
			for _, fmtStr := range formats {
				if _, err := time.Parse(fmtStr, strVal); err == nil {
					valid = true
					break
				}
			}
			if !valid {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a valid ISO 8601 date-time string (e.g. 2026-08-12T10:15:44Z)", field.Name))
			}
		}
	case "json":
		if strVal, ok := val.(string); ok && strVal != "" {
			if !json.Valid([]byte(strVal)) {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be valid JSON", field.Name))
			}
		}
	case "url":
		strVal, ok := val.(string)
		if !ok {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a URL string", field.Name))
		}
		if strVal != "" {
			parsed, err := url.ParseRequestURI(strVal)
			if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Field %q must be a valid HTTP/HTTPS URL", field.Name))
			}
		}
	}

	return nil
}

// CreateRecord handles inserting a dynamic record in a moul table.
func (h *RecordHandler) CreateRecord(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	body := make(map[string]interface{})
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON payload")
	}

	if moul.Type == "analytic" {
		name, _ := body["name"].(string)
		if name == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "name is required for analytic records")
		}

		var properties map[string]interface{}
		if props, ok := body["properties"].(map[string]interface{}); ok {
			properties = props
		} else {
			properties = make(map[string]interface{})
			for k, v := range body {
				if k != "visit_token" && k != "visitor_token" && k != "name" && k != "id" && k != "landing_page" && k != "referrer" {
					properties[k] = v
				}
			}
		}

		var userID string
		authUser := middleware.GetAuthRecord(c)
		if authUser != nil {
			userID, _ = authUser["id"].(string)
		}

		ruleData := map[string]interface{}{
			"name":       name,
			"properties": properties,
			"user_id":    userID,
		}

		var allowed bool
		var ruleErr error
		if authUser != nil && authUser["moul"] == "_rootUsers" {
			allowed = true
		} else {
			allowed, ruleErr = rules.EvaluateRule(h.DB, moul.Rules.CreateRule, authUser, ruleData, buildRequestContext(c, body))
		}
		if ruleErr != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+ruleErr.Error())
		}
		if !allowed {
			if authUser == nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
			}
			return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
		}

		if h.AnalyticsEngine == nil {
			logger.Error("Analytics engine not initialized", "moul", moulName)
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}

		var visitToken, visitorToken string
		if vt, ok := body["visit_token"].(string); ok {
			visitToken = vt
		}
		if vt, ok := body["visitor_token"].(string); ok {
			visitorToken = vt
		}
		if visitToken == "" {
			visitToken = c.Request().Header.Get("X-Visit-Token")
		}
		if visitorToken == "" {
			visitorToken = c.Request().Header.Get("X-Visitor-Token")
		}
		if visitToken == "" {
			if cookie, err := c.Cookie("moul_visit"); err == nil {
				visitToken = cookie.Value
			}
		}
		if visitorToken == "" {
			if cookie, err := c.Cookie("moul_visitor"); err == nil {
				visitorToken = cookie.Value
			}
		}

		referrer, _ := body["referrer"].(string)
		if referrer == "" {
			referrer = c.Request().Referer()
		}
		landingPage, _ := body["landing_page"].(string)
		if landingPage == "" {
			landingPage = c.Request().Referer()
		}

		res, err := h.AnalyticsEngine.Track(c.Request().Context(), moulName, &analytics.EventParams{
			VisitToken:   visitToken,
			VisitorToken: visitorToken,
			UserID:       userID,
			Name:         name,
			Properties:   properties,
			IP:           c.RealIP(),
			UserAgent:    c.Request().UserAgent(),
			Referrer:     referrer,
			LandingPage:  landingPage,
		})
		if err != nil {
			logger.Error("Analytics tracking failed", "moul", moulName, "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}

		resolvedVisit, _ := res["visit_token"].(string)
		resolvedVisitor, _ := res["visitor_token"].(string)

		c.Response().Header().Set("X-Visit-Token", resolvedVisit)
		c.Response().Header().Set("X-Visitor-Token", resolvedVisitor)

		c.SetCookie(&http.Cookie{
			Name:     "moul_visit",
			Value:    resolvedVisit,
			Path:     "/",
			HttpOnly: true,
			Secure:   h.SecureCookies,
			SameSite: http.SameSiteLaxMode,
			Expires:  time.Now().Add(30 * time.Minute),
		})
		c.SetCookie(&http.Cookie{
			Name:     "moul_visitor",
			Value:    resolvedVisitor,
			Path:     "/",
			HttpOnly: true,
			Secure:   h.SecureCookies,
			SameSite: http.SameSiteLaxMode,
			Expires:  time.Now().AddDate(2, 0, 0),
		})

		return c.JSON(http.StatusCreated, normalizeRecord(moul, res))
	}

	// Prepare data map for db insert
	insertData := make(map[string]interface{})

	// Validate fields in body against schema
	for _, field := range moul.Fields {
		val, ok := body[field.Name]
		if !ok {
			val = nil
		}
		if err := validateFieldConstraints(field, val, false); err != nil {
			return err
		}
		if ok {
			if field.Type == "json" || field.Type == "file" {
				// Serialize JSON values to string
				bytes, err := json.Marshal(val)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON/file field content for: "+field.Name)
				}
				insertData[field.Name] = string(bytes)
			} else if field.Type == "bool" {
				// Normalize boolean to 0 or 1
				if boolVal, ok := val.(bool); ok {
					if boolVal {
						insertData[field.Name] = 1
					} else {
						insertData[field.Name] = 0
					}
				} else if strVal, ok := val.(string); ok {
					lower := strings.ToLower(strings.TrimSpace(strVal))
					if lower == "true" || lower == "1" {
						insertData[field.Name] = 1
					} else {
						insertData[field.Name] = 0
					}
				} else if floatVal, ok := val.(float64); ok {
					if floatVal != 0 {
						insertData[field.Name] = 1
					} else {
						insertData[field.Name] = 0
					}
				} else {
					insertData[field.Name] = val
				}
			} else if field.Type == "select" {
				if val == nil || val == "" {
					insertData[field.Name] = ""
				} else {
					strVal, ok := val.(string)
					if !ok {
						return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Select field %s must be a string", field.Name))
					}
					valid := false
					for _, opt := range field.Options {
						if opt == strVal {
							valid = true
							break
						}
					}
					if !valid {
						return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid value %q for select field %s (allowed: %s)", strVal, field.Name, strings.Join(field.Options, ", ")))
					}
					insertData[field.Name] = strVal
				}
			} else if field.Type == "relation" {
				if val == nil || val == "" {
					if field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
						insertData[field.Name] = "[]"
					} else {
						insertData[field.Name] = ""
					}
				} else {
					targetMoul := field.RelationConfig.TargetMoul
					card := field.RelationConfig.Cardinality
					if card == "1:1" || card == "1:N" {
						strVal, ok := val.(string)
						if !ok {
							return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Relation field %s must be a string ID", field.Name))
						}
						if strVal != "" {
							exists, err := h.recordExists(targetMoul, strVal)
							if err != nil {
								return echo.NewHTTPError(http.StatusInternalServerError, "Failed to validate relation: "+err.Error())
							}
							if !exists {
								return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Reference record %s in collection %s does not exist", strVal, targetMoul))
							}
							if card == "1:1" {
								var count int
								err := h.DB.Select("COUNT(1)").From(moulName).Where(dbx.HashExp{field.Name: strVal}).Row(&count)
								if err == nil && count > 0 {
									return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("1:1 relation field %s already references record %s", field.Name, strVal))
								}
							}
						}
						insertData[field.Name] = strVal
					} else if card == "M:N" {
						var ids []string
						if sliceVal, ok := val.([]interface{}); ok {
							for _, item := range sliceVal {
								strItem, ok := item.(string)
								if !ok {
									return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Relation field %s elements must be strings", field.Name))
								}
								ids = append(ids, strItem)
							}
						} else if sliceVal, ok := val.([]string); ok {
							ids = sliceVal
						} else if strVal, ok := val.(string); ok {
							if strVal != "" {
								for _, part := range strings.Split(strVal, ",") {
									trimmed := strings.TrimSpace(part)
									if trimmed != "" {
										ids = append(ids, trimmed)
									}
								}
							}
						} else {
							return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Relation field %s must be an array of string IDs", field.Name))
						}

						for _, id := range ids {
							exists, err := h.recordExists(targetMoul, id)
							if err != nil {
								return echo.NewHTTPError(http.StatusInternalServerError, "Failed to validate relation: "+err.Error())
							}
							if !exists {
								return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Reference record %s in collection %s does not exist", id, targetMoul))
							}
						}

						bytes, err := json.Marshal(ids)
						if err != nil {
							return echo.NewHTTPError(http.StatusBadRequest, "Invalid relation content for: "+field.Name)
						}
						insertData[field.Name] = string(bytes)
					}
				}
			} else {
				insertData[field.Name] = val
			}
		}
	}

	// Add system fields
	recordID := fmt.Sprintf("%s-%s", util.Singularize(moulName), util.RandomID())
	if customID, ok := body["id"].(string); ok && customID != "" {
		recordID = customID
	}
	insertData["id"] = recordID

	now := time.Now().UTC().Format(time.RFC3339)
	insertData["created_at"] = now
	insertData["updated_at"] = now

	// Auth collection specific fields
	if moul.Type == "auth" {
		username, _ := body["username"].(string)
		email, _ := body["email"].(string)
		password, _ := body["password"].(string)
		passwordConfirm, _ := body["passwordConfirm"].(string)

		if username == "" || email == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "username and email are required for auth mouls")
		}

		insertData["username"] = username
		insertData["email"] = email

		if password != "" || passwordConfirm != "" {
			if password != passwordConfirm {
				return echo.NewHTTPError(http.StatusBadRequest, "password and passwordConfirm must match")
			}

			// Validate password complexity
			if err := auth.ValidatePassword(password); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, err.Error())
			}

			// Hash password
			hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
			if err != nil {
				logger.Error("Failed to hash password", "err", err)
				return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
			}
			insertData["passwordHash"] = string(hash)
		} else {
			insertData["passwordHash"] = nil
		}
	}

	// Worker collection specific fields
	if moul.Type == "worker" {
		workerVal, _ := body["worker"].(string)
		if workerVal == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "worker name is required for worker mouls")
		}
		insertData["worker"] = workerVal

		queueVal, ok := body["queue"].(string)
		if !ok || queueVal == "" {
			queueVal = "default"
		}
		insertData["queue"] = queueVal

		insertData["state"] = "available"
		insertData["attempt"] = 0
		insertData["errors"] = "[]"

		if maxAttemptsVal, ok := body["max_attempts"]; ok {
			if num, err := toInt(maxAttemptsVal); err == nil {
				insertData["max_attempts"] = num
			} else {
				insertData["max_attempts"] = 20
			}
		} else {
			insertData["max_attempts"] = 20
		}

		if priorityVal, ok := body["priority"]; ok {
			if num, err := toInt(priorityVal); err == nil {
				insertData["priority"] = num
			} else {
				insertData["priority"] = 0
			}
		} else {
			insertData["priority"] = 0
		}

		insertData["inserted_at"] = now

		scheduledAtStr, _ := body["scheduled_at"].(string)
		if scheduledAtStr == "" {
			scheduledAtStr = now
		} else {
			if _, err := time.Parse(time.RFC3339, scheduledAtStr); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "Invalid scheduled_at format (must be RFC3339)")
			}
		}
		insertData["scheduled_at"] = scheduledAtStr

		for _, jsonField := range []string{"args", "meta", "tags"} {
			defaultVal := "{}"
			if jsonField == "tags" {
				defaultVal = "[]"
			}
			if val, ok := body[jsonField]; ok {
				bytes, err := json.Marshal(val)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON content for: "+jsonField)
				}
				insertData[jsonField] = string(bytes)
			} else {
				insertData[jsonField] = defaultVal
			}
		}
	}

	// Rule authorization check
	authUser := middleware.GetAuthRecord(c)
	var allowed bool
	var ruleErr error
	if authUser != nil && authUser["moul"] == "_rootUsers" {
		allowed = true
	} else {
		allowed, ruleErr = rules.EvaluateRule(h.DB, moul.Rules.CreateRule, authUser, insertData, buildRequestContext(c, body))
	}
	if ruleErr != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+ruleErr.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
	}

	// Dispatch create:before webhook
	if err := webhooks.DispatchBefore(c.Request().Context(), moul.Webhooks, webhooks.Payload{
		Event:     "create:before",
		Moul:      moulName,
		Record:    insertData,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Perform SQLite INSERT
	_, err = h.DB.Insert(moulName, dbx.Params(insertData)).Execute()
	if err != nil {
		// Detect unique constraints for auth mouls
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return echo.NewHTTPError(http.StatusBadRequest, "Username or Email already exists")
		}
		logger.Error("Failed to insert record", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to insert record")
	}

	// Trigger worker engine
	if moul.Type == "worker" && h.Engine != nil {
		h.Engine.Trigger(moulName, recordID)
	}

	// Fetch back
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": recordID}).One(&record)
	if err != nil {
		logger.Error("Failed to fetch back record", "record", recordID, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := normalizeRecord(moul, nullStringMapToMap(record))
	expandParam := c.QueryParam("expand")
	h.expandRelations(moul, recordMap, expandParam)

	// Dispatch create:after webhook
	webhooks.DispatchAfter(c.Request().Context(), moul.Webhooks, webhooks.Payload{
		Event:     "create:after",
		Moul:      moulName,
		Record:    recordMap,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})

	return c.JSON(http.StatusCreated, recordMap)
}

// ListRecords queries records using server-side filtering, sorting, and pagination.
func (h *RecordHandler) ListRecords(c *echo.Context) error {
	moulName := c.Param("name")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	authUser := middleware.GetAuthRecord(c)
	reqCtx := buildRequestContext(c, nil)

	// Extract pagination params
	page := 1
	if pageStr := c.QueryParam("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	perPage := 30
	if perPageStr := c.QueryParam("perPage"); perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 {
			perPage = pp
		}
	}
	if perPage > 500 {
		perPage = 500
	}

	// 1. Build ListRule SQL
	var ruleSQL string
	var ruleParams dbx.Params
	isRootUser := authUser != nil && authUser["moul"] == "_rootUsers"
	if moul.Rules.ListRule != "" && !isRootUser {
		rSQL, rParams, err := rules.BuildFilterSQL(moul.Rules.ListRule, moul, authUser, reqCtx)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid ListRule expression: "+err.Error())
		}
		ruleSQL = rSQL
		ruleParams = rParams
	}

	// 2. Build Filter Param SQL
	var filterSQL string
	var filterParams dbx.Params
	filterParam := c.QueryParam("filter")
	if filterParam != "" {
		fSQL, fParams, err := rules.BuildFilterSQL(filterParam, moul, authUser, reqCtx)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameter: "+err.Error())
		}
		filterSQL = fSQL
		filterParams = fParams
	}

	// Combine WHERE expressions and merge params
	combinedParams := make(dbx.Params)
	var whereSQLs []string
	if ruleSQL != "" {
		whereSQLs = append(whereSQLs, fmt.Sprintf("(%s)", ruleSQL))
		for k, v := range ruleParams {
			combinedParams[k] = v
		}
	}
	if filterSQL != "" {
		whereSQLs = append(whereSQLs, fmt.Sprintf("(%s)", filterSQL))
		for k, v := range filterParams {
			combinedParams[k] = v
		}
	}

	var fullWhereSQL string
	if len(whereSQLs) > 0 {
		fullWhereSQL = strings.Join(whereSQLs, " AND ")
	}

	// 3. Build Sort SQL
	sortParam := c.QueryParam("sort")
	sortExprs, err := rules.BuildSortSQL(sortParam, moul)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid sort parameter: "+err.Error())
	}
	if len(sortExprs) == 0 {
		if rules.IsValidField("id", moul) {
			sortExprs = []string{"id ASC"}
		}
	}

	// 4. Count matching total records
	countSelect := h.DB.Select("COUNT(1)").From(moulName)
	if fullWhereSQL != "" {
		countSelect.Where(dbx.NewExp(fullWhereSQL, combinedParams))
	}

	var totalItems int
	err = countSelect.Row(&totalItems)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to count records", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	totalPages := 0
	if totalItems > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(perPage)))
	}

	// 5. Query paginated records
	dataWhereSQLs := append([]string{}, whereSQLs...)
	dataParams := make(dbx.Params)
	for k, v := range combinedParams {
		dataParams[k] = v
	}

	after := c.QueryParam("after")
	if after != "" {
		cSQL, cParams := buildCursorWhere(h.DB, moulName, moul, sortExprs, after)
		if cSQL != "" {
			dataWhereSQLs = append(dataWhereSQLs, fmt.Sprintf("(%s)", cSQL))
			for k, v := range cParams {
				dataParams[k] = v
			}
		}
	}

	var dataWhereSQL string
	if len(dataWhereSQLs) > 0 {
		dataWhereSQL = strings.Join(dataWhereSQLs, " AND ")
	}

	dataSelect := h.DB.Select("*").From(moulName)
	if dataWhereSQL != "" {
		dataSelect.Where(dbx.NewExp(dataWhereSQL, dataParams))
	}
	if len(sortExprs) > 0 {
		dataSelect.OrderBy(sortExprs...)
	}
	if after != "" {
		dataSelect.Limit(int64(perPage))
	} else {
		offset := (page - 1) * perPage
		dataSelect.Limit(int64(perPage)).Offset(int64(offset))
	}

	var rawRecords []dbx.NullStringMap
	err = dataSelect.All(&rawRecords)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to list records", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	items := make([]map[string]interface{}, 0, len(rawRecords))
	expandParam := c.QueryParam("expand")
	for _, rec := range rawRecords {
		record := normalizeRecord(moul, nullStringMapToMap(rec))
		h.expandRelations(moul, record, expandParam)
		items = append(items, record)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"page":       page,
		"perPage":    perPage,
		"totalItems": totalItems,
		"totalPages": totalPages,
		"items":      items,
	})
}

// buildCursorWhere builds a WHERE SQL clause and parameters for cursor-based pagination (?after=<id>).
func buildCursorWhere(dbEn dbx.Builder, moulName string, moul *schema.Moul, sortExprs []string, after string) (string, dbx.Params) {
	if after == "" {
		return "", nil
	}

	if len(sortExprs) == 0 || (len(sortExprs) == 1 && (sortExprs[0] == "id ASC" || sortExprs[0] == "id")) {
		return "id > {:cursor_after}", dbx.Params{"cursor_after": after}
	}
	if len(sortExprs) == 1 && sortExprs[0] == "id DESC" {
		return "id < {:cursor_after}", dbx.Params{"cursor_after": after}
	}

	// Load record with id = after for cursor comparison values
	var cursorRec dbx.NullStringMap
	err := dbEn.Select("*").From(moulName).Where(dbx.HashExp{"id": after}).One(&cursorRec)
	if err != nil {
		// Fallback to id > after if cursor record not found
		return "id > {:cursor_after}", dbx.Params{"cursor_after": after}
	}

	cursorMap := nullStringMapToMap(cursorRec)

	primarySort := sortExprs[0]
	parts := strings.Split(strings.TrimSpace(primarySort), " ")
	col := parts[0]
	dir := "ASC"
	if len(parts) > 1 && strings.ToUpper(parts[1]) == "DESC" {
		dir = "DESC"
	}

	cursorVal, exists := cursorMap[col]
	if !exists || cursorVal == nil {
		return "id > {:cursor_after}", dbx.Params{"cursor_after": after}
	}

	if dir == "DESC" {
		return fmt.Sprintf("(%s < {:cursor_val} OR (%s = {:cursor_val} AND id > {:cursor_id}))", col, col),
			dbx.Params{"cursor_val": cursorVal, "cursor_id": after}
	}
	return fmt.Sprintf("(%s > {:cursor_val} OR (%s = {:cursor_val} AND id > {:cursor_id}))", col, col),
		dbx.Params{"cursor_val": cursorVal, "cursor_id": after}
}

// GetRecord returns a single record by ID.
func (h *RecordHandler) GetRecord(c *echo.Context) error {
	moulName := c.Param("name")
	id := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Record not found")
		}
		logger.Error("Failed to fetch record", "record", id, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := normalizeRecord(moul, nullStringMapToMap(record))
	expandParam := c.QueryParam("expand")
	h.expandRelations(moul, recordMap, expandParam)
	authUser := middleware.GetAuthRecord(c)
	var allowed bool
	var ruleErr error
	if authUser != nil && authUser["moul"] == "_rootUsers" {
		allowed = true
	} else {
		allowed, ruleErr = rules.EvaluateRule(h.DB, moul.Rules.ViewRule, authUser, recordMap, buildRequestContext(c, nil))
	}
	if ruleErr != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+ruleErr.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to view this record")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to view this record")
	}

	return c.JSON(http.StatusOK, recordMap)
}

// UpdateRecord handles partial updates on fields.
func (h *RecordHandler) UpdateRecord(c *echo.Context) error {
	moulName := c.Param("name")
	id := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	// Fetch existing record
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Record not found")
		}
		logger.Error("Failed to fetch record", "record", id, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := normalizeRecord(moul, nullStringMapToMap(record))

	body := make(map[string]interface{})
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON payload")
	}

	// Check update rule against current record status
	authUser := middleware.GetAuthRecord(c)
	var allowed bool
	var ruleErr error
	if authUser != nil && authUser["moul"] == "_rootUsers" {
		allowed = true
	} else {
		allowed, ruleErr = rules.EvaluateRule(h.DB, moul.Rules.UpdateRule, authUser, recordMap, buildRequestContext(c, body))
	}
	if ruleErr != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+ruleErr.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
	}

	// Build update params
	updateParams := dbx.Params{}

	// Fields validation
	for _, field := range moul.Fields {
		if val, ok := body[field.Name]; ok {
			if err := validateFieldConstraints(field, val, true); err != nil {
				return err
			}
			if field.Type == "json" || field.Type == "file" {
				bytes, err := json.Marshal(val)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON/file field content for: "+field.Name)
				}
				updateParams[field.Name] = string(bytes)
			} else if field.Type == "bool" {
				if boolVal, ok := val.(bool); ok {
					if boolVal {
						updateParams[field.Name] = 1
					} else {
						updateParams[field.Name] = 0
					}
				} else if strVal, ok := val.(string); ok {
					lower := strings.ToLower(strings.TrimSpace(strVal))
					if lower == "true" || lower == "1" {
						updateParams[field.Name] = 1
					} else {
						updateParams[field.Name] = 0
					}
				} else if floatVal, ok := val.(float64); ok {
					if floatVal != 0 {
						updateParams[field.Name] = 1
					} else {
						updateParams[field.Name] = 0
					}
				} else {
					updateParams[field.Name] = val
				}
			} else if field.Type == "select" {
				if val == nil || val == "" {
					updateParams[field.Name] = ""
				} else {
					strVal, ok := val.(string)
					if !ok {
						return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Select field %s must be a string", field.Name))
					}
					valid := false
					for _, opt := range field.Options {
						if opt == strVal {
							valid = true
							break
						}
					}
					if !valid {
						return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid value %q for select field %s (allowed: %s)", strVal, field.Name, strings.Join(field.Options, ", ")))
					}
					updateParams[field.Name] = strVal
				}
			} else if field.Type == "relation" {
				if val == nil || val == "" {
					if field.RelationConfig != nil && field.RelationConfig.Cardinality == "M:N" {
						updateParams[field.Name] = "[]"
					} else {
						updateParams[field.Name] = ""
					}
				} else {
					targetMoul := field.RelationConfig.TargetMoul
					card := field.RelationConfig.Cardinality
					if card == "1:1" || card == "1:N" {
						strVal, ok := val.(string)
						if !ok {
							return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Relation field %s must be a string ID", field.Name))
						}
						if strVal != "" {
							exists, err := h.recordExists(targetMoul, strVal)
							if err != nil {
								return echo.NewHTTPError(http.StatusInternalServerError, "Failed to validate relation: "+err.Error())
							}
							if !exists {
								return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Reference record %s in collection %s does not exist", strVal, targetMoul))
							}
							if card == "1:1" {
								var count int
								err := h.DB.Select("COUNT(1)").From(moulName).Where(dbx.NewExp(fmt.Sprintf("%s = {:val} AND id != {:id}", db.QuoteIdentifier(field.Name)), dbx.Params{"val": strVal, "id": id})).Row(&count)
								if err == nil && count > 0 {
									return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("1:1 relation field %s already references record %s", field.Name, strVal))
								}
							}
						}
						updateParams[field.Name] = strVal
					} else if card == "M:N" {
						var ids []string
						if sliceVal, ok := val.([]interface{}); ok {
							for _, item := range sliceVal {
								strItem, ok := item.(string)
								if !ok {
									return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Relation field %s elements must be strings", field.Name))
								}
								ids = append(ids, strItem)
							}
						} else if sliceVal, ok := val.([]string); ok {
							ids = sliceVal
						} else if strVal, ok := val.(string); ok {
							if strVal != "" {
								for _, part := range strings.Split(strVal, ",") {
									trimmed := strings.TrimSpace(part)
									if trimmed != "" {
										ids = append(ids, trimmed)
									}
								}
							}
						} else {
							return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Relation field %s must be an array of string IDs", field.Name))
						}

						for _, id := range ids {
							exists, err := h.recordExists(targetMoul, id)
							if err != nil {
								return echo.NewHTTPError(http.StatusInternalServerError, "Failed to validate relation: "+err.Error())
							}
							if !exists {
								return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Reference record %s in collection %s does not exist", id, targetMoul))
							}
						}

						bytes, err := json.Marshal(ids)
						if err != nil {
							return echo.NewHTTPError(http.StatusBadRequest, "Invalid relation content for: "+field.Name)
						}
						updateParams[field.Name] = string(bytes)
					}
				}
			} else {
				updateParams[field.Name] = val
			}
		}
	}

	// Auth columns updates (allowing username/email updates, hashing password if updated)
	if moul.Type == "auth" {
		if username, ok := body["username"].(string); ok && username != "" {
			updateParams["username"] = username
		}
		if email, ok := body["email"].(string); ok && email != "" {
			updateParams["email"] = email
		}
		if password, ok := body["password"].(string); ok && password != "" {
			passwordConfirm, _ := body["passwordConfirm"].(string)
			if password != passwordConfirm {
				return echo.NewHTTPError(http.StatusBadRequest, "password and passwordConfirm must match")
			}

			// Validate password complexity on update
			if err := auth.ValidatePassword(password); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, err.Error())
			}

			hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
			if err != nil {
				logger.Error("Failed to hash password", "err", err)
				return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
			}
			updateParams["passwordHash"] = string(hash)
		}
	}

	// Worker columns updates
	if moul.Type == "worker" {
		if stateVal, ok := body["state"].(string); ok && stateVal != "" {
			updateParams["state"] = stateVal
		}
		if queueVal, ok := body["queue"].(string); ok && queueVal != "" {
			updateParams["queue"] = queueVal
		}
		if workerVal, ok := body["worker"].(string); ok && workerVal != "" {
			updateParams["worker"] = workerVal
		}
		if scheduledAtStr, ok := body["scheduled_at"].(string); ok && scheduledAtStr != "" {
			if _, err := time.Parse(time.RFC3339, scheduledAtStr); err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "Invalid scheduled_at format (must be RFC3339)")
			}
			updateParams["scheduled_at"] = scheduledAtStr
		}
		for _, intField := range []string{"attempt", "max_attempts", "priority"} {
			if val, ok := body[intField]; ok {
				if num, err := toInt(val); err == nil {
					updateParams[intField] = num
				}
			}
		}
		for _, jsonField := range []string{"args", "meta", "tags", "errors"} {
			if val, ok := body[jsonField]; ok {
				bytes, err := json.Marshal(val)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON content for: "+jsonField)
				}
				updateParams[jsonField] = string(bytes)
			}
		}
	}

	// Check if there's actually anything to update
	if len(updateParams) > 0 {
		updateParams["updated_at"] = time.Now().UTC().Format(time.RFC3339)

		// Dispatch update:before webhook
		if err := webhooks.DispatchBefore(c.Request().Context(), moul.Webhooks, webhooks.Payload{
			Event:     "update:before",
			Moul:      moulName,
			Record:    updateParams,
			OldRecord: recordMap,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}

		_, err = h.DB.Update(moulName, updateParams, dbx.HashExp{"id": id}).Execute()
		if err != nil {
			if strings.Contains(err.Error(), "UNIQUE constraint failed") {
				return echo.NewHTTPError(http.StatusBadRequest, "Username or Email already exists")
			}
			logger.Error("Failed to update record", "record", id, "moul", moulName, "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update record")
		}
	}

	// Fetch back
	var updatedRecord dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&updatedRecord)
	if err != nil {
		logger.Error("Failed to fetch back record", "record", id, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	updatedRecordMap := normalizeRecord(moul, nullStringMapToMap(updatedRecord))
	expandParam := c.QueryParam("expand")
	h.expandRelations(moul, updatedRecordMap, expandParam)

	// Dispatch update:after webhook
	webhooks.DispatchAfter(c.Request().Context(), moul.Webhooks, webhooks.Payload{
		Event:     "update:after",
		Moul:      moulName,
		Record:    updatedRecordMap,
		OldRecord: recordMap,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})

	return c.JSON(http.StatusOK, updatedRecordMap)
}

// DeleteRecord deletes a record by ID.
func (h *RecordHandler) DeleteRecord(c *echo.Context) error {
	moulName := c.Param("name")
	id := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	// Fetch record
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Record not found")
		}
		logger.Error("Failed to fetch record", "record", id, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := normalizeRecord(moul, nullStringMapToMap(record))

	// Validate rule
	authUser := middleware.GetAuthRecord(c)
	var allowed bool
	var ruleErr error
	if authUser != nil && authUser["moul"] == "_rootUsers" {
		allowed = true
	} else {
		allowed, ruleErr = rules.EvaluateRule(h.DB, moul.Rules.DeleteRule, authUser, recordMap, buildRequestContext(c, nil))
	}
	if ruleErr != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+ruleErr.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
	}

	if err := h.deleteRecordAndCascade(c.Request().Context(), moul, recordMap, id); err != nil {
		if strings.Contains(err.Error(), "RESTRICT constraint") {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		logger.Error("Failed to delete record", "record", id, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete record: "+err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *RecordHandler) deleteRecordAndCascade(ctx context.Context, moul *schema.Moul, recordMap map[string]interface{}, id string) error {
	moulName := moul.Name

	// 1. Check RESTRICT constraints across all collections
	allMouls, err := db.LoadAllMoul(h.DB)
	if err == nil {
		for _, otherMoul := range allMouls {
			for _, field := range otherMoul.Fields {
				if field.Type == "relation" && field.RelationConfig != nil && field.RelationConfig.TargetMoul == moulName {
					onDel := field.RelationConfig.OnDelete
					if onDel == "" {
						onDel = schema.OnDeleteSetNull
					}
					if onDel == schema.OnDeleteRestrict {
						card := field.RelationConfig.Cardinality
						if card == "1:1" || card == "1:N" {
							var count int
							err := h.DB.Select("COUNT(1)").From(otherMoul.Name).Where(dbx.HashExp{field.Name: id}).Row(&count)
							if err == nil && count > 0 {
								return fmt.Errorf("cannot delete record %s in %s: referenced by %s.%s (RESTRICT constraint)", id, moulName, otherMoul.Name, field.Name)
							}
						} else if card == "M:N" {
							var rawRecs []dbx.NullStringMap
							if qErr := h.DB.Select("id", field.Name).From(otherMoul.Name).Where(dbx.NewExp(fmt.Sprintf("%s LIKE {:pat}", db.QuoteIdentifier(field.Name)), dbx.Params{"pat": "%" + id + "%"})).All(&rawRecs); qErr == nil {
								for _, rawRec := range rawRecs {
									recMap := nullStringMapToMap(rawRec)
									rawVal, _ := recMap[field.Name].(string)
									if rawVal != "" {
										var ids []string
										if jsonErr := json.Unmarshal([]byte(rawVal), &ids); jsonErr == nil {
											for _, item := range ids {
												if item == id {
													return fmt.Errorf("cannot delete record %s in %s: referenced by %s.%s (RESTRICT constraint)", id, moulName, otherMoul.Name, field.Name)
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// 2. Dispatch delete:before webhook
	if err := webhooks.DispatchBefore(ctx, moul.Webhooks, webhooks.Payload{
		Event:     "delete:before",
		Moul:      moulName,
		Record:    recordMap,
		OldRecord: recordMap,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}); err != nil {
		return err
	}

	// 3. Perform SQL delete
	_, err = h.DB.Delete(moulName, dbx.HashExp{"id": id}).Execute()
	if err != nil {
		return fmt.Errorf("failed to delete record: %w", err)
	}

	// 4. Dispatch delete:after webhook
	webhooks.DispatchAfter(ctx, moul.Webhooks, webhooks.Payload{
		Event:     "delete:after",
		Moul:      moulName,
		Record:    recordMap,
		OldRecord: recordMap,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})

	// 5. Handle CASCADE and SET_NULL for referencing collections
	if allMouls != nil {
		for _, otherMoul := range allMouls {
			for _, field := range otherMoul.Fields {
				if field.Type == "relation" && field.RelationConfig != nil && field.RelationConfig.TargetMoul == moulName {
					onDel := field.RelationConfig.OnDelete
					if onDel == "" {
						onDel = schema.OnDeleteSetNull
					}
					card := field.RelationConfig.Cardinality

					if onDel == schema.OnDeleteCascade {
						var toDeleteIDs []string
						if card == "1:1" || card == "1:N" {
							var rawRecs []dbx.NullStringMap
							if qErr := h.DB.Select("id").From(otherMoul.Name).Where(dbx.HashExp{field.Name: id}).All(&rawRecs); qErr == nil {
								for _, rawRec := range rawRecs {
									recMap := nullStringMapToMap(rawRec)
									if recID, ok := recMap["id"].(string); ok && recID != "" {
										toDeleteIDs = append(toDeleteIDs, recID)
									}
								}
							}
						} else if card == "M:N" {
							var rawRecs []dbx.NullStringMap
							if qErr := h.DB.Select("id", field.Name).From(otherMoul.Name).Where(dbx.NewExp(fmt.Sprintf("%s LIKE {:pat}", db.QuoteIdentifier(field.Name)), dbx.Params{"pat": "%" + id + "%"})).All(&rawRecs); qErr == nil {
								for _, rawRec := range rawRecs {
									recMap := nullStringMapToMap(rawRec)
									recID, _ := recMap["id"].(string)
									rawVal, _ := recMap[field.Name].(string)
									if rawVal != "" {
										var ids []string
										if jsonErr := json.Unmarshal([]byte(rawVal), &ids); jsonErr == nil {
											for _, item := range ids {
												if item == id {
													toDeleteIDs = append(toDeleteIDs, recID)
													break
												}
											}
										}
									}
								}
							}
						}

						// Recursively delete referencing records
						targetOtherMoul := otherMoul
						for _, childID := range toDeleteIDs {
							var childRec dbx.NullStringMap
							if childErr := h.DB.Select("*").From(targetOtherMoul.Name).Where(dbx.HashExp{"id": childID}).One(&childRec); childErr == nil {
								childMap := normalizeRecord(targetOtherMoul, nullStringMapToMap(childRec))
								_ = h.deleteRecordAndCascade(ctx, targetOtherMoul, childMap, childID)
							}
						}
					} else if onDel == schema.OnDeleteSetNull {
						if card == "1:1" || card == "1:N" {
							_, _ = h.DB.Update(otherMoul.Name, dbx.Params{field.Name: ""}, dbx.HashExp{field.Name: id}).Execute()
						} else if card == "M:N" {
							var rawRecs []dbx.NullStringMap
							if qErr := h.DB.Select("id", field.Name).From(otherMoul.Name).Where(dbx.NewExp(fmt.Sprintf("%s LIKE {:pat}", db.QuoteIdentifier(field.Name)), dbx.Params{"pat": "%" + id + "%"})).All(&rawRecs); qErr == nil {
								for _, rawRec := range rawRecs {
									recMap := nullStringMapToMap(rawRec)
									recID, _ := recMap["id"].(string)
									rawVal, _ := recMap[field.Name].(string)
									if rawVal != "" {
										var ids []string
										if jsonErr := json.Unmarshal([]byte(rawVal), &ids); jsonErr == nil {
											found := false
											var newIDs []string
											for _, item := range ids {
												if item == id {
													found = true
												} else {
													newIDs = append(newIDs, item)
												}
											}
											if found {
												newJSON, _ := json.Marshal(newIDs)
												_, _ = h.DB.Update(otherMoul.Name, dbx.Params{field.Name: string(newJSON)}, dbx.HashExp{"id": recID}).Execute()
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return nil
}

// Helper to safely convert interface to int
func toInt(v interface{}) (int, error) {
	switch val := v.(type) {
	case int:
		return val, nil
	case int64:
		return int(val), nil
	case float64:
		return int(val), nil
	case string:
		return strconv.Atoi(val)
	default:
		return 0, fmt.Errorf("invalid integer type")
	}
}

// normalizeRecord helps format the output data for JSON responses
func normalizeRecord(moul *schema.Moul, record map[string]interface{}) map[string]interface{} {
	delete(record, "passwordHash")
	delete(record, "otpCode")
	delete(record, "otpExpiresAt")
	delete(record, "passkeys")

	// Convert database strings to correct JSON types based on moul fields schema
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
			record[field.Name] = (strVal == "1" || strings.EqualFold(strVal, "true"))
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

	if moul.Type == "worker" {
		for _, jsonField := range []string{"args", "meta", "tags", "errors"} {
			if strVal, ok := record[jsonField].(string); ok && strVal != "" {
				var decoded interface{}
				if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
					record[jsonField] = decoded
				}
			}
		}
		for _, intField := range []string{"attempt", "max_attempts", "priority"} {
			if strVal, ok := record[intField].(string); ok && strVal != "" {
				if intVal, err := strconv.Atoi(strVal); err == nil {
					record[intField] = intVal
				}
			}
		}
	}

	if moul.Type == "analytic" {
		if strVal, ok := record["properties"].(string); ok && strVal != "" {
			var decoded interface{}
			if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
				record["properties"] = decoded
			}
		}
	}

	return record
}

func (h *RecordHandler) recordExists(targetMoul string, id string) (bool, error) {
	var count int
	err := h.DB.Select("COUNT(*)").From(targetMoul).Where(dbx.HashExp{"id": id}).Row(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (h *RecordHandler) expandRelations(moul *schema.Moul, recordMap map[string]interface{}, expandParam string) {
	if expandParam == "" {
		return
	}
	expands := strings.Split(expandParam, ",")
	expandMap := make(map[string]interface{})

	for _, exp := range expands {
		exp = strings.TrimSpace(exp)
		if exp == "" {
			continue
		}

		// Find the field
		var targetField *schema.MoulField
		for _, f := range moul.Fields {
			if f.Name == exp && f.Type == "relation" && f.RelationConfig != nil {
				targetField = &f
				break
			}
		}

		if targetField == nil {
			continue
		}

		targetMoulName := targetField.RelationConfig.TargetMoul
		targetMoul, err := db.LoadMoulByName(h.DB, targetMoulName)
		if err != nil {
			continue
		}

		card := targetField.RelationConfig.Cardinality
		if card == "1:1" || card == "1:N" {
			val, ok := recordMap[exp].(string)
			if ok && val != "" {
				var targetRec dbx.NullStringMap
				err = h.DB.Select("*").From(targetMoulName).Where(dbx.HashExp{"id": val}).One(&targetRec)
				if err == nil {
					expandMap[exp] = normalizeRecord(targetMoul, nullStringMapToMap(targetRec))
				} else {
					expandMap[exp] = nil
				}
			} else {
				expandMap[exp] = nil
			}
		} else if card == "M:N" {
			var ids []string
			if val, ok := recordMap[exp].([]string); ok {
				ids = val
			} else if val, ok := recordMap[exp].([]interface{}); ok {
				for _, item := range val {
					if s, ok := item.(string); ok {
						ids = append(ids, s)
					}
				}
			}

			var expandedRecs []map[string]interface{}
			for _, id := range ids {
				var targetRec dbx.NullStringMap
				err = h.DB.Select("*").From(targetMoulName).Where(dbx.HashExp{"id": id}).One(&targetRec)
				if err == nil {
					expandedRecs = append(expandedRecs, normalizeRecord(targetMoul, nullStringMapToMap(targetRec)))
				}
			}
			expandMap[exp] = expandedRecs
		}
	}

	if len(expandMap) > 0 {
		recordMap["expand"] = expandMap
	}
}

func buildRequestContext(c *echo.Context, body map[string]interface{}) map[string]interface{} {
	headers := make(map[string]interface{})
	if c.Request() != nil {
		for k, vals := range c.Request().Header {
			nk := strings.ReplaceAll(strings.ToLower(k), "-", "_")
			if len(vals) > 0 {
				headers[nk] = vals[0]
			}
		}
	}

	query := make(map[string]interface{})
	if c.Request() != nil && c.Request().URL != nil {
		for k, vals := range c.Request().URL.Query() {
			if len(vals) > 0 {
				query[k] = vals[0]
			}
		}
	}

	method := ""
	if c.Request() != nil {
		method = c.Request().Method
	}

	reqBody := body
	if reqBody == nil {
		reqBody = make(map[string]interface{})
	}

	return map[string]interface{}{
		"body":    reqBody,
		"headers": headers,
		"query":   query,
		"method":  method,
	}
}
