package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
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

	"github.com/labstack/echo/v4"
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

// CreateRecord handles inserting a dynamic record in a moul table.
func (h *RecordHandler) CreateRecord(c echo.Context) error {
	moulName := c.Param( "moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
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

		allowed, err := rules.EvaluateRule(moul.Rules.CreateRule, authUser, ruleData)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+err.Error())
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
		if val, ok := body[field.Name]; ok {
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
				} else {
					insertData[field.Name] = val
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
	if moul.Type != "worker" {
		insertData["created_at"] = now
		insertData["updated_at"] = now
	}

	// Auth collection specific fields
	if moul.Type == "auth" {
		username, _ := body["username"].(string)
		email, _ := body["email"].(string)
		password, _ := body["password"].(string)
		passwordConfirm, _ := body["passwordConfirm"].(string)

		if username == "" || email == "" || password == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "username, email, and password are required for auth mouls")
		}
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

		insertData["username"] = username
		insertData["email"] = email
		insertData["passwordHash"] = string(hash)
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
	allowed, err := rules.EvaluateRule(moul.Rules.CreateRule, authUser, insertData)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+err.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
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
	return c.JSON(http.StatusCreated, recordMap)
}

// ListRecords queries records filtering dynamically by auth listRules.
func (h *RecordHandler) ListRecords(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		logger.Error("Failed to load moul", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	// Fetch all records
	var rawRecords []dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).All(&rawRecords)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("Failed to list records", "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	authUser := middleware.GetAuthRecord(c)
	var authorizedRecords []map[string]interface{}
	expandParam := c.QueryParam("expand")

	for _, rec := range rawRecords {
		record := normalizeRecord(moul, nullStringMapToMap(rec))
		h.expandRelations(moul, record, expandParam)
		allowed, err := rules.EvaluateRule(moul.Rules.ListRule, authUser, record)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+err.Error())
		}
		if allowed {
			authorizedRecords = append(authorizedRecords, record)
		}
	}

	return c.JSON(http.StatusOK, authorizedRecords)
}

// GetRecord returns a single record by ID.
func (h *RecordHandler) GetRecord(c echo.Context) error {
	moulName := c.Param("moulName")
	id := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
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
	allowed, err := rules.EvaluateRule(moul.Rules.ViewRule, authUser, recordMap)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+err.Error())
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
func (h *RecordHandler) UpdateRecord(c echo.Context) error {
	moulName := c.Param("moulName")
	id := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
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

	// Check update rule against current record status
	authUser := middleware.GetAuthRecord(c)
	allowed, err := rules.EvaluateRule(moul.Rules.UpdateRule, authUser, recordMap)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+err.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
	}

	body := make(map[string]interface{})
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON payload")
	}

	// Build update params
	updateParams := dbx.Params{}

	// Fields validation
	for _, field := range moul.Fields {
		if val, ok := body[field.Name]; ok {
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
				} else {
					updateParams[field.Name] = val
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
		if moul.Type != "worker" {
			updateParams["updated_at"] = time.Now().UTC().Format(time.RFC3339)
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

	recordMap = normalizeRecord(moul, nullStringMapToMap(updatedRecord))
	expandParam := c.QueryParam("expand")
	h.expandRelations(moul, recordMap, expandParam)
	return c.JSON(http.StatusOK, recordMap)
}

// DeleteRecord deletes a record by ID.
func (h *RecordHandler) DeleteRecord(c echo.Context) error {
	moulName := c.Param("moulName")
	id := c.Param("id")

	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
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
	allowed, err := rules.EvaluateRule(moul.Rules.DeleteRule, authUser, recordMap)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Rule evaluation error: "+err.Error())
	}
	if !allowed {
		if authUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required to perform this action")
		}
		return echo.NewHTTPError(http.StatusForbidden, "You are not allowed to perform this action")
	}

	// Delete
	_, err = h.DB.Delete(moulName, dbx.HashExp{"id": id}).Execute()
	if err != nil {
		logger.Error("Failed to delete record", "record", id, "moul", moulName, "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete record")
	}

	// Clean up relations
	allMouls, err := db.LoadAllMouls(h.DB)
	if err == nil {
		for _, otherMoul := range allMouls {
			for _, field := range otherMoul.Fields {
				if field.Type == "relation" && field.RelationConfig != nil && field.RelationConfig.TargetMoul == moulName {
					card := field.RelationConfig.Cardinality
					if card == "1:1" || card == "1:N" {
						_, _ = h.DB.Update(otherMoul.Name, dbx.Params{field.Name: ""}, dbx.HashExp{field.Name: id}).Execute()
					} else if card == "M:N" {
						var rawRecs []dbx.NullStringMap
						if qErr := h.DB.Select("id", field.Name).From(otherMoul.Name).All(&rawRecs); qErr == nil {
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

	return c.NoContent(http.StatusNoContent)
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
