package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/db"
	"github.com/moul-dev/moul-dev/middleware"
	"github.com/moul-dev/moul-dev/rules"
	"github.com/moul-dev/moul-dev/schema"
	"github.com/moul-dev/moul-dev/util"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"
)

type RecordHandler struct {
	DB *dbx.DB
}

func NewRecordHandler(dbConn *dbx.DB) *RecordHandler {
	return &RecordHandler{DB: dbConn}
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
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	body := make(map[string]interface{})
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON payload")
	}

	// Prepare data map for db insert
	insertData := make(map[string]interface{})

	// Validate fields in body against schema
	for _, field := range moul.Fields {
		if val, ok := body[field.Name]; ok {
			if field.Type == "json" {
				// Serialize JSON values to string
				bytes, err := json.Marshal(val)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON field content for: "+field.Name)
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

		if username == "" || email == "" || password == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "username, email, and password are required for auth mouls")
		}
		if password != passwordConfirm {
			return echo.NewHTTPError(http.StatusBadRequest, "password and passwordConfirm must match")
		}

		// Hash password
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password")
		}

		insertData["username"] = username
		insertData["email"] = email
		insertData["passwordHash"] = string(hash)
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
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to insert record: "+err.Error())
	}

	// Fetch back
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": recordID}).One(&record)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, normalizeRecord(moul, nullStringMapToMap(record)))
}

// ListRecords queries records filtering dynamically by auth listRules.
func (h *RecordHandler) ListRecords(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Fetch all records
	var rawRecords []dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).All(&rawRecords)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	authUser := middleware.GetAuthRecord(c)
	var authorizedRecords []map[string]interface{}

	for _, rec := range rawRecords {
		record := normalizeRecord(moul, nullStringMapToMap(rec))
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
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Record not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	recordMap := normalizeRecord(moul, nullStringMapToMap(record))
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
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Fetch existing record
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Record not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
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
			if field.Type == "json" {
				bytes, err := json.Marshal(val)
				if err != nil {
					return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON field content for: "+field.Name)
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
			hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password")
			}
			updateParams["passwordHash"] = string(hash)
		}
	}

	// Check if there's actually anything to update
	if len(updateParams) > 0 {
		updateParams["updated_at"] = time.Now().UTC().Format(time.RFC3339)
		_, err = h.DB.Update(moulName, updateParams, dbx.HashExp{"id": id}).Execute()
		if err != nil {
			if strings.Contains(err.Error(), "UNIQUE constraint failed") {
				return echo.NewHTTPError(http.StatusBadRequest, "Username or Email already exists")
			}
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update record: "+err.Error())
		}
	}

	// Fetch back
	var updatedRecord dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&updatedRecord)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, normalizeRecord(moul, nullStringMapToMap(updatedRecord)))
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
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Fetch record
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).Where(dbx.HashExp{"id": id}).One(&record)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Record not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
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
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete record: "+err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

// normalizeRecord helps format the output data for JSON responses
func normalizeRecord(moul *schema.Moul, record map[string]interface{}) map[string]interface{} {
	delete(record, "passwordHash")

	// Convert database strings to correct JSON types based on moul fields schema
	for _, field := range moul.Fields {
		val, ok := record[field.Name]
		if !ok || val == nil {
			continue
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
		case "json":
			if strVal != "" {
				var decoded interface{}
				if err := json.Unmarshal([]byte(strVal), &decoded); err == nil {
					record[field.Name] = decoded
				}
			}
		}
	}

	return record
}
