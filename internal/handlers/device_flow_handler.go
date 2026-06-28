package handlers

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/db"
)

type DeviceFlowHandler struct {
	DB *dbx.DB
}

func NewDeviceFlowHandler(dbConn *dbx.DB) *DeviceFlowHandler {
	return &DeviceFlowHandler{DB: dbConn}
}

type DeviceAuthorizeRequest struct {
	ClientID string `json:"client_id" form:"client_id"`
	Scope    string `json:"scope" form:"scope"`
}

type DeviceTokenRequest struct {
	GrantType  string `json:"grant_type" form:"grant_type"`
	DeviceCode string `json:"device_code" form:"device_code"`
	ClientID   string `json:"client_id" form:"client_id"`
}

// RenderData represents the variables passed to the HTML template.
type RenderData struct {
	Success    bool
	Error      string
	UserCode   string
	AuthMoul   string
	Identity   string
}

// DeviceAuthorize handles POST /api/oauth2/device/authorize
func (h *DeviceFlowHandler) DeviceAuthorize(c echo.Context) error {
	req := new(DeviceAuthorizeRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if req.ClientID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "client_id is required")
	}

	// Create device request valid for 5 minutes
	expiry := 5 * time.Minute
	deviceReq, err := auth.DefaultDeviceFlowStore.CreateDeviceRequest(req.ClientID, expiry)
	if err != nil {
		log.Printf("[ERROR] Failed to create device authorization: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error")
	}

	scheme := "http"
	if c.Request().TLS != nil {
		scheme = "https"
	}
	// Check header for proxy host first if needed, otherwise use request host
	host := c.Request().Host
	if forwardedHost := c.Request().Header.Get("X-Forwarded-Host"); forwardedHost != "" {
		host = forwardedHost
	}
	if forwardedProto := c.Request().Header.Get("X-Forwarded-Proto"); forwardedProto != "" {
		scheme = forwardedProto
	}

	baseURL := fmt.Sprintf("%s://%s", scheme, host)
	verificationURI := baseURL + "/device"
	verificationURIComplete := fmt.Sprintf("%s?user_code=%s", verificationURI, deviceReq.UserCode)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"device_code":               deviceReq.DeviceCode,
		"user_code":                 deviceReq.UserCode,
		"verification_uri":          verificationURI,
		"verification_uri_complete": verificationURIComplete,
		"expires_in":                int(expiry.Seconds()),
		"interval":                  5,
	})
}

// DeviceToken handles POST /api/oauth2/device/token
func (h *DeviceFlowHandler) DeviceToken(c echo.Context) error {
	req := new(DeviceTokenRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	if req.GrantType != "urn:ietf:params:oauth:grant-type:device_code" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "unsupported_grant_type",
		})
	}

	if req.DeviceCode == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid_request",
		})
	}

	deviceReq, ok := auth.DefaultDeviceFlowStore.GetRequestByDeviceCode(req.DeviceCode)
	if !ok {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "expired_token",
		})
	}

	if !deviceReq.Approved {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "authorization_pending",
		})
	}

	// Approved! Return the access token and clean up the store entry.
	response := map[string]interface{}{
		"access_token": deviceReq.JWTToken,
		"token_type":   "Bearer",
		"expires_in":   24 * 3600, // Token is valid for 24 hours
	}

	return c.JSON(http.StatusOK, response)
}

// RenderDeviceForm handles GET /device
func (h *DeviceFlowHandler) RenderDeviceForm(c echo.Context) error {
	userCode := c.QueryParam("user_code")
	authMoul := c.QueryParam("auth_moul")
	if authMoul == "" {
		authMoul = "users"
	}

	return renderTemplate(c, http.StatusOK, RenderData{
		UserCode: userCode,
		AuthMoul: authMoul,
	})
}

// VerifyDevice handles POST /device/verify
func (h *DeviceFlowHandler) VerifyDevice(c echo.Context) error {
	userCode := c.FormValue("user_code")
	authMoul := c.FormValue("auth_moul")
	identity := c.FormValue("identity")
	password := c.FormValue("password")

	renderErr := func(msg string) error {
		return renderTemplate(c, http.StatusBadRequest, RenderData{
			Error:    msg,
			UserCode: userCode,
			AuthMoul: authMoul,
			Identity: identity,
		})
	}

	if strings.TrimSpace(userCode) == "" {
		return renderErr("User Code is required")
	}
	if strings.TrimSpace(authMoul) == "" {
		return renderErr("Authentication Moul collection is required")
	}
	if strings.TrimSpace(identity) == "" || strings.TrimSpace(password) == "" {
		return renderErr("Email/Username and Password are required")
	}

	// 1. Verify User Code is active
	deviceReq, ok := auth.DefaultDeviceFlowStore.GetRequestByUserCode(userCode)
	if !ok {
		return renderErr("The code you entered is invalid or has expired")
	}

	if deviceReq.Approved {
		return renderErr("This device has already been approved")
	}

	// 2. Load Moul database schema to check if it's an auth type
	moul, err := db.LoadMoulByName(h.DB, authMoul)
	if err != nil {
		if err == sql.ErrNoRows {
			return renderErr(fmt.Sprintf("Moul collection '%s' not found", authMoul))
		}
		log.Printf("[ERROR] Failed to load moul %s for device verification: %v", authMoul, err)
		return renderErr("Internal server error")
	}

	if moul.Type != "auth" {
		return renderErr(fmt.Sprintf("Moul collection '%s' is not an Authentication collection", authMoul))
	}

	// 3. Authenticate User Credentials
	var record dbx.NullStringMap
	err = h.DB.Select("*").From(authMoul).
		Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
		One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return renderErr("Invalid email/username or password")
		}
		log.Printf("[ERROR] Failed to query auth record in %s: %v", authMoul, err)
		return renderErr("Internal server error")
	}

	recordMap := nullStringMapToMap(record)

	// Compare Password
	hashVal, ok := recordMap["passwordHash"]
	if !ok || hashVal == nil {
		log.Printf("[ERROR] Missing password hash in database record for moul %s", authMoul)
		return renderErr("Internal server error")
	}
	passwordHash, ok := hashVal.(string)
	if !ok {
		log.Printf("[ERROR] Invalid password hash type in database record for moul %s", authMoul)
		return renderErr("Internal server error")
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	if err != nil {
		return renderErr("Invalid email/username or password")
	}

	id, _ := recordMap["id"].(string)
	email, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	// 4. Generate JWT Token
	token, err := auth.GenerateToken(id, email, username, authMoul)
	if err != nil {
		log.Printf("[ERROR] Failed to generate auth token: %v", err)
		return renderErr("Failed to generate auth token")
	}

	// 5. Approve Device
	err = auth.DefaultDeviceFlowStore.ApproveDeviceRequest(userCode, authMoul, id, token)
	if err != nil {
		return renderErr(fmt.Sprintf("Approval failed: %v", err))
	}

	return renderTemplate(c, http.StatusOK, RenderData{
		Success: true,
	})
}

// Helper to render the HTML template
func renderTemplate(c echo.Context, status int, data RenderData) error {
	tmpl, err := template.New("device").Parse(htmlTemplate)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Template parsing error")
	}
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTMLCharsetUTF8)
	c.Response().WriteHeader(status)
	return tmpl.Execute(c.Response().Writer, data)
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authorize Device - Moul</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0d0e15;
            --card-bg: rgba(20, 22, 37, 0.7);
            --card-border: rgba(99, 102, 241, 0.2);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.4);
            --text-color: #f3f4f6;
            --text-muted: #9ca3af;
            --success: #10b981;
            --error: #ef4444;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }
        body {
            background-color: var(--bg-color);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 480px;
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
            text-align: center;
        }
        .logo {
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
            letter-spacing: 2px;
        }
        .subtitle {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-bottom: 30px;
        }
        .form-group {
            text-align: left;
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            color: var(--text-muted);
        }
        input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(13, 14, 21, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .user-code-input {
            text-transform: uppercase;
            letter-spacing: 4px;
            font-size: 1.25rem;
            text-align: center;
            font-weight: 600;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }
        button:active {
            transform: translateY(1px);
        }
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            margin-bottom: 24px;
            text-align: left;
            border-left: 4px solid transparent;
        }
        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
            border-left-color: var(--error);
        }
        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            color: #a7f3d0;
            border-left-color: var(--success);
            text-align: center;
        }
        .success-icon {
            font-size: 4rem;
            color: var(--success);
            margin-bottom: 20px;
            animation: scaleIn 0.5s ease-out;
        }
        @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">MOUL</div>
        
        {{if .Success}}
            <div class="success-icon">✓</div>
            <h2 style="margin-bottom: 12px; font-weight: 600;">Device Authorized</h2>
            <p class="subtitle" style="margin-bottom: 0;">You have successfully authorized the TUI client. You can now return to your terminal; the application will resume automatically.</p>
        {{else}}
            <p class="subtitle">Enter the authorization code and your credentials to connect your terminal device.</p>
            
            {{if .Error}}
                <div class="alert alert-error">
                    <strong>Error:</strong> {{.Error}}
                </div>
            {{end}}
            
            <form action="/device/verify" method="POST">
                <div class="form-group">
                    <label for="user_code">User Code</label>
                    <input type="text" id="user_code" name="user_code" class="user-code-input" placeholder="XXXX-XXXX" value="{{.UserCode}}" required autocomplete="off" autofocus>
                </div>
                
                <div class="form-group">
                    <label for="auth_moul">Authentication Moul</label>
                    <input type="text" id="auth_moul" name="auth_moul" placeholder="users" value="{{if .AuthMoul}}{{.AuthMoul}}{{else}}users{{end}}" required>
                </div>
                
                <div class="form-group">
                    <label for="identity">Email / Username</label>
                    <input type="text" id="identity" name="identity" placeholder="your-email@example.com" value="{{.Identity}}" required autocomplete="username">
                </div>
                
                <div class="form-group" style="margin-bottom: 28px;">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password">
                </div>
                
                <button type="submit">Authorize Device</button>
            </form>
        {{end}}
    </div>
</body>
</html>`
