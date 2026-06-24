package handlers

import (
	"database/sql"
	"net/http"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB *dbx.DB
}

func NewAuthHandler(dbConn *dbx.DB) *AuthHandler {
	return &AuthHandler{DB: dbConn}
}

type AuthRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

// AuthWithPassword verifies credentials and returns a signed JWT token.
func (h *AuthHandler) AuthWithPassword(c echo.Context) error {
	moulName := c.Param("moulName")
	moul, err := db.LoadMoulByName(h.DB, moulName)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Moul not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if moul.Type != "auth" {
		return echo.NewHTTPError(http.StatusBadRequest, "This moul is not an auth collection")
	}

	req := new(AuthRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if req.Identity == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "identity and password are required")
	}

	// Fetch record by email or username using dbx.NullStringMap
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(moulName).
		Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": req.Identity})).
		One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid credentials")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	recordMap := nullStringMapToMap(record)

	// Extract password hash
	hashVal, ok := recordMap["passwordHash"]
	if !ok || hashVal == nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Missing password hash in database record")
	}
	passwordHash, ok := hashVal.(string)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, "Invalid password hash type in database record")
	}

	// Compare password
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid credentials")
	}

	// Get claim details
	id, _ := recordMap["id"].(string)
	email, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	// Generate JWT
	token, err := auth.GenerateToken(id, email, username, moulName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate auth token")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":  token,
		"record": normalizeRecord(moul, recordMap),
	})
}
