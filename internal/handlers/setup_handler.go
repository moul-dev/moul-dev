package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
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
