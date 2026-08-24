package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/middleware"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"
)

type SetupHandler struct {
	DB *dbx.DB
}

func NewSetupHandler(dbConn *dbx.DB) *SetupHandler {
	return &SetupHandler{DB: dbConn}
}

type SetupRequest struct {
	Username string `json:"username"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AdminLoginRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

// CheckSetupStatus checks if any root user exists in the _rootUsers table.
func (h *SetupHandler) CheckSetupStatus(c *echo.Context) error {
	var count int
	err := h.DB.Select("COUNT(*)").From("_rootUsers").Row(&count)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to check setup status: "+err.Error())
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"needsSetup": count == 0,
	})
}

// SetupRootUser registers the initial root user if none exist.
func (h *SetupHandler) SetupRootUser(c *echo.Context) error {
	var count int
	err := h.DB.Select("COUNT(*)").From("_rootUsers").Row(&count)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to check setup status: "+err.Error())
	}
	if count > 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "Root user setup is already complete")
	}

	req := new(SetupRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	username := strings.TrimSpace(req.Username)
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = username
	}
	email := strings.TrimSpace(req.Email)
	password := strings.TrimSpace(req.Password)

	if username == "" || email == "" || password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "username, email, and password are required")
	}

	if len(password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password must be at least 8 characters long")
	}

	if !strings.Contains(email, "@") {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid email address")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password: "+err.Error())
	}

	now := time.Now().UTC().Format(time.RFC3339)
	id := util.RandomID()

	_, err = h.DB.Insert("_rootUsers", dbx.Params{
		"id":           id,
		"username":     username,
		"name":         name,
		"email":        email,
		"passwordHash": string(hashedPassword),
		"created_at":   now,
		"updated_at":   now,
	}).Execute()

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create root user: "+err.Error())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Root user created successfully",
		"id":      id,
	})
}

// AdminLogin handles authenticating a root user to the Admin Console using their username/email and password.
// Elevated authorization is enforced via Admin Key middleware on this route.
func (h *SetupHandler) AdminLogin(c *echo.Context) error {
	req := new(AdminLoginRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	identity := strings.TrimSpace(req.Identity)
	password := strings.TrimSpace(req.Password)

	if identity == "" || password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "username/email and password are required")
	}

	var record dbx.NullStringMap
	err := h.DB.Select("*").From("_rootUsers").
		Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
		One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid email/username or password")
		}
		logger.Error("Failed to query auth record in _rootUsers", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	hashVal, ok := recordMap["passwordHash"]
	if !ok || hashVal == nil {
		logger.Error("Missing password hash in database record for _rootUsers")
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	passwordHash, ok := hashVal.(string)
	if !ok {
		logger.Error("Invalid password hash type in database record for _rootUsers")
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid email/username or password")
	}

	// Verify client IP address restrictions for root user if enabled
	var ipEnabledVal string
	_ = h.DB.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_ip_enabled"}).Row(&ipEnabledVal)
	if ipEnabledVal == "true" {
		var allowedIPs string
		_ = h.DB.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_allowed_ips"}).Row(&allowedIPs)
		if !util.IsIPAllowed(c.RealIP(), allowedIPs) {
			return echo.NewHTTPError(http.StatusForbidden, "Your IP address is not authorized to log in as a root user")
		}
	}

	id, _ := recordMap["id"].(string)
	email, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)
	name, _ := recordMap["name"].(string)
	if name == "" {
		name = username
	}

	token, err := auth.GenerateToken(id, email, username, "_rootUsers")
	if err != nil {
		logger.Error("Failed to generate root auth token", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": token,
		"record": map[string]interface{}{
			"id":         id,
			"email":      email,
			"username":   username,
			"name":       name,
			"moul":       "_rootUsers",
			"created_at": recordMap["created_at"],
			"updated_at": recordMap["updated_at"],
		},
	})
}

type UpdateRootPasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
	Identity        string `json:"identity"`
	OldPassword     string `json:"oldPassword"`
	NewPassword     string `json:"newPassword"`
}

// UpdateRootPassword allows updating the password of a root user.
// Requires Admin Key middleware and verification of the user's current password.
func (h *SetupHandler) UpdateRootPassword(c *echo.Context) error {
	req := new(UpdateRootPasswordRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	currentPassword := strings.TrimSpace(req.CurrentPassword)
	if currentPassword == "" {
		currentPassword = strings.TrimSpace(req.OldPassword)
	}

	newPassword := strings.TrimSpace(req.Password)
	if newPassword == "" {
		newPassword = strings.TrimSpace(req.NewPassword)
	}

	passwordConfirm := strings.TrimSpace(req.PasswordConfirm)
	identity := strings.TrimSpace(req.Identity)

	if currentPassword == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "currentPassword is required")
	}
	if newPassword == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "password is required")
	}
	if passwordConfirm != "" && newPassword != passwordConfirm {
		return echo.NewHTTPError(http.StatusBadRequest, "password and passwordConfirm must match")
	}
	if err := auth.ValidatePassword(newPassword); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var record dbx.NullStringMap
	var err error

	authUser := middleware.GetAuthRecord(c)
	if authUser != nil && authUser["moul"] == "_rootUsers" && authUser["id"] != nil {
		err = h.DB.Select("*").From("_rootUsers").
			Where(dbx.HashExp{"id": authUser["id"]}).
			One(&record)
	} else if identity != "" {
		err = h.DB.Select("*").From("_rootUsers").
			Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
			One(&record)
	} else {
		err = h.DB.Select("*").From("_rootUsers").
			OrderBy("created_at ASC").
			Limit(1).
			One(&record)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Root user not found")
		}
		logger.Error("Failed to query root user for password update", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	hashVal, ok := recordMap["passwordHash"]
	if !ok || hashVal == nil {
		logger.Error("Missing password hash in database record for _rootUsers")
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}
	passwordHash, ok := hashVal.(string)
	if !ok {
		logger.Error("Invalid password hash type in database record for _rootUsers")
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(currentPassword)); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid current password")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password: "+err.Error())
	}

	now := time.Now().UTC().Format(time.RFC3339)
	_, err = h.DB.Update("_rootUsers", dbx.Params{
		"passwordHash": string(hashedPassword),
		"updated_at":   now,
	}, dbx.HashExp{"id": recordMap["id"]}).Execute()

	if err != nil {
		logger.Error("Failed to update password in _rootUsers", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update root password: "+err.Error())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Root password updated successfully",
	})
}

// GetRootAccount retrieves current root user account information.
func (h *SetupHandler) GetRootAccount(c *echo.Context) error {
	var record dbx.NullStringMap
	var err error

	authUser := middleware.GetAuthRecord(c)
	identity := strings.TrimSpace(c.QueryParam("identity"))

	if authUser != nil && authUser["moul"] == "_rootUsers" && authUser["id"] != nil {
		err = h.DB.Select("*").From("_rootUsers").
			Where(dbx.HashExp{"id": authUser["id"]}).
			One(&record)
	} else if identity != "" {
		err = h.DB.Select("*").From("_rootUsers").
			Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
			One(&record)
	} else {
		err = h.DB.Select("*").From("_rootUsers").
			OrderBy("created_at ASC").
			Limit(1).
			One(&record)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Root user not found")
		}
		logger.Error("Failed to query root user account", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	id, _ := recordMap["id"].(string)
	email, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)
	name, _ := recordMap["name"].(string)
	if name == "" {
		name = username
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":         id,
		"email":      email,
		"username":   username,
		"name":       name,
		"moul":       "_rootUsers",
		"created_at": recordMap["created_at"],
		"updated_at": recordMap["updated_at"],
	})
}

type UpdateRootAccountRequest struct {
	Username        string `json:"username"`
	Name            string `json:"name"`
	Email           string `json:"email"`
	CurrentPassword string `json:"currentPassword"`
	Password        string `json:"password"`
	NewPassword     string `json:"newPassword"`
	PasswordConfirm string `json:"passwordConfirm"`
	Identity        string `json:"identity"`
}

// UpdateRootAccount allows updating the username, name, email, and optionally password of a root user.
func (h *SetupHandler) UpdateRootAccount(c *echo.Context) error {
	req := new(UpdateRootAccountRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	identity := strings.TrimSpace(req.Identity)
	if identity == "" {
		identity = strings.TrimSpace(c.QueryParam("identity"))
	}

	var record dbx.NullStringMap
	var err error

	authUser := middleware.GetAuthRecord(c)
	if authUser != nil && authUser["moul"] == "_rootUsers" && authUser["id"] != nil {
		err = h.DB.Select("*").From("_rootUsers").
			Where(dbx.HashExp{"id": authUser["id"]}).
			One(&record)
	} else if identity != "" {
		err = h.DB.Select("*").From("_rootUsers").
			Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
			One(&record)
	} else {
		err = h.DB.Select("*").From("_rootUsers").
			OrderBy("created_at ASC").
			Limit(1).
			One(&record)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Root user not found")
		}
		logger.Error("Failed to query root user for account update", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	recordMap := nullStringMapToMap(record)
	recordID, _ := recordMap["id"].(string)
	currentUsername, _ := recordMap["username"].(string)
	currentEmail, _ := recordMap["email"].(string)
	currentName, _ := recordMap["name"].(string)
	if currentName == "" {
		currentName = currentUsername
	}

	updateParams := dbx.Params{}

	// Update username if provided
	targetUsername := currentUsername
	if req.Username != "" {
		newUsername := strings.TrimSpace(req.Username)
		if newUsername == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "username cannot be empty")
		}
		if newUsername != currentUsername {
			var count int
			_ = h.DB.Select("COUNT(*)").From("_rootUsers").
				Where(dbx.NewExp("username = {:username} AND id != {:id}", dbx.Params{"username": newUsername, "id": recordID})).
				Row(&count)
			if count > 0 {
				return echo.NewHTTPError(http.StatusBadRequest, "Username is already taken")
			}
			updateParams["username"] = newUsername
			targetUsername = newUsername
		}
	}

	// Update name if provided
	targetName := currentName
	if req.Name != "" {
		newName := strings.TrimSpace(req.Name)
		if newName != currentName {
			updateParams["name"] = newName
			targetName = newName
		}
	}

	// Update email if provided
	targetEmail := currentEmail
	if req.Email != "" {
		newEmail := strings.TrimSpace(req.Email)
		if !strings.Contains(newEmail, "@") {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid email address")
		}
		if newEmail != currentEmail {
			var count int
			_ = h.DB.Select("COUNT(*)").From("_rootUsers").
				Where(dbx.NewExp("email = {:email} AND id != {:id}", dbx.Params{"email": newEmail, "id": recordID})).
				Row(&count)
			if count > 0 {
				return echo.NewHTTPError(http.StatusBadRequest, "Email is already in use")
			}
			updateParams["email"] = newEmail
			targetEmail = newEmail
		}
	}

	// Check password change if requested
	newPassword := strings.TrimSpace(req.Password)
	if newPassword == "" {
		newPassword = strings.TrimSpace(req.NewPassword)
	}
	currentPassword := strings.TrimSpace(req.CurrentPassword)
	passwordConfirm := strings.TrimSpace(req.PasswordConfirm)

	if newPassword != "" || currentPassword != "" {
		if currentPassword == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "currentPassword is required to change password")
		}
		if newPassword == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "password is required")
		}
		if passwordConfirm != "" && newPassword != passwordConfirm {
			return echo.NewHTTPError(http.StatusBadRequest, "password and passwordConfirm must match")
		}
		if err := auth.ValidatePassword(newPassword); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}

		hashVal, ok := recordMap["passwordHash"]
		if !ok || hashVal == nil {
			logger.Error("Missing password hash in database record for _rootUsers")
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}
		passwordHash, ok := hashVal.(string)
		if !ok {
			logger.Error("Invalid password hash type in database record for _rootUsers")
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
		}

		if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(currentPassword)); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid current password")
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password: "+err.Error())
		}
		updateParams["passwordHash"] = string(hashedPassword)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	updateParams["updated_at"] = now

	if len(updateParams) > 1 { // More than just updated_at
		_, err = h.DB.Update("_rootUsers", updateParams, dbx.HashExp{"id": recordID}).Execute()
		if err != nil {
			logger.Error("Failed to update root account in _rootUsers", "err", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update root account: "+err.Error())
		}
	}

	token, err := auth.GenerateToken(recordID, targetEmail, targetUsername, "_rootUsers")
	if err != nil {
		logger.Error("Failed to generate refreshed root auth token", "err", err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Root account updated successfully",
		"token":   token,
		"record": map[string]interface{}{
			"id":         recordID,
			"email":      targetEmail,
			"username":   targetUsername,
			"name":       targetName,
			"moul":       "_rootUsers",
			"created_at": recordMap["created_at"],
			"updated_at": now,
		},
	})
}


