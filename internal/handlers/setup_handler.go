package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/logger"
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
			"moul":       "_rootUsers",
			"created_at": recordMap["created_at"],
			"updated_at": recordMap["updated_at"],
		},
	})
}
