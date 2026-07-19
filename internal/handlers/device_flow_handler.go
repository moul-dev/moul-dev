package handlers

import (
	"database/sql"
	"fmt"
	"html/template"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/util"
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
	Success  bool
	Error    string
	UserCode string
	AuthMoul string
	Identity string
}

// DeviceAuthorize handles POST /api/oauth2/device/authorize
func (h *DeviceFlowHandler) DeviceAuthorize(c *echo.Context) error {
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
		logger.Error("Failed to create device authorization", "err", err)
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
func (h *DeviceFlowHandler) DeviceToken(c *echo.Context) error {
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
func (h *DeviceFlowHandler) RenderDeviceForm(c *echo.Context) error {
	userCode := c.QueryParam("user_code")
	authMoul := c.QueryParam("auth_moul")
	if authMoul != "" && authMoul != "_rootUsers" {
		return renderTemplate(c, http.StatusBadRequest, RenderData{
			Error:    "Device authorization is only supported for the root account",
			UserCode: userCode,
		})
	}
	authMoul = "_rootUsers"

	return renderTemplate(c, http.StatusOK, RenderData{
		UserCode: userCode,
		AuthMoul: authMoul,
	})
}

// VerifyDevice handles POST /device/verify
func (h *DeviceFlowHandler) VerifyDevice(c *echo.Context) error {
	userCode := c.FormValue("user_code")
	authMoul := c.FormValue("auth_moul")
	if authMoul != "" && authMoul != "_rootUsers" {
		return renderTemplate(c, http.StatusBadRequest, RenderData{
			Error:    "Device authorization is only supported for the root account",
			UserCode: userCode,
		})
	}
	authMoul = "_rootUsers"
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

	// 2. Authenticate User Credentials directly against _rootUsers
	var record dbx.NullStringMap
	err := h.DB.Select("*").From("_rootUsers").
		Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
		One(&record)

	if err != nil {
		if err == sql.ErrNoRows {
			return renderErr("Invalid email/username or password")
		}
		logger.Error("Failed to query auth record in _rootUsers", "err", err)
		return renderErr("Internal server error")
	}

	recordMap := nullStringMapToMap(record)

	// Compare Password
	hashVal, ok := recordMap["passwordHash"]
	if !ok || hashVal == nil {
		logger.Error("Missing password hash in database record for _rootUsers")
		return renderErr("Internal server error")
	}
	passwordHash, ok := hashVal.(string)
	if !ok {
		logger.Error("Invalid password hash type in database record for _rootUsers")
		return renderErr("Internal server error")
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	if err != nil {
		return renderErr("Invalid email/username or password")
	}

	// 2.5 Verify client IP address restrictions for root user
	var ipEnabledVal string
	_ = h.DB.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_ip_enabled"}).Row(&ipEnabledVal)
	if ipEnabledVal == "true" {
		var allowedIPs string
		_ = h.DB.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_allowed_ips"}).Row(&allowedIPs)
		if !util.IsIPAllowed(c.RealIP(), allowedIPs) {
			return renderErr("Your IP address is not authorized to log in as a root user")
		}
	}

	id, _ := recordMap["id"].(string)
	email, _ := recordMap["email"].(string)
	username, _ := recordMap["username"].(string)

	// 3. Generate JWT Token
	token, err := auth.GenerateToken(id, email, username, authMoul)
	if err != nil {
		logger.Error("Failed to generate auth token", "err", err)
		return renderErr("Failed to generate auth token")
	}

	// 4. Approve Device
	err = auth.DefaultDeviceFlowStore.ApproveDeviceRequest(userCode, authMoul, id, token)
	if err != nil {
		return renderErr(fmt.Sprintf("Approval failed: %v", err))
	}

	return renderTemplate(c, http.StatusOK, RenderData{
		Success: true,
	})
}

// ServeFavicon serves the embedded favicon SVG.
func (h *DeviceFlowHandler) ServeFavicon(c *echo.Context) error {
	return c.Blob(http.StatusOK, "image/svg+xml", []byte(embeddedFaviconSVG))
}

const embeddedFaviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    polygon {
      fill: #000000;
    }
    @media (prefers-color-scheme: dark) {
      polygon {
        fill: #ffffff;
      }
    }
  </style>
  <polygon points="80.29,50.00 65.06,73.08 35.53,66.00 35.53,34.00 65.06,26.92" />
  <polygon points="82.01,51.24 95.00,51.24 88.99,72.83 71.53,88.94 66.78,74.32" />
  <polygon points="64.33,75.29 69.08,89.92 43.24,94.02 17.82,80.55 34.80,68.21" />
  <polygon points="33.04,66.00 16.06,78.34 5.00,50.00 16.06,21.66 33.04,34.00" />
  <polygon points="34.80,31.79 17.82,19.45 43.24,5.98 69.08,10.08 64.33,24.71" />
  <polygon points="66.78,25.68 71.53,11.06 88.99,27.17 95.00,48.76 82.01,48.76" />
</svg>`

// Helper to render the HTML template
func renderTemplate(c *echo.Context, status int, data RenderData) error {
	tmpl, err := template.New("device").Parse(htmlTemplate)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Template parsing error")
	}
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTMLCharsetUTF8)
	c.Response().WriteHeader(status)
	return tmpl.Execute(c.Response(), data)
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authorize Device - Moul</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Dark Theme variables by default */
            --bg-color: #09090b;
            --card-bg: rgba(18, 18, 22, 0.7);
            --card-border: rgba(255, 255, 255, 0.08);
            --primary: #ffffff;
            --primary-glow: rgba(255, 255, 255, 0.15);
            --text-color: #f4f4f5;
            --text-muted: #a1a1aa;
            --success: #ffffff;
            --error: #ffffff;
            --input-bg: rgba(9, 9, 11, 0.8);
            --input-border: rgba(255, 255, 255, 0.1);
            --shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(255, 255, 255, 0.01);
            --btn-bg: #ffffff;
            --btn-text: #09090b;
            --btn-hover-bg: #e4e4e7;
            --error-bg: rgba(255, 255, 255, 0.02);
            --error-border: rgba(255, 255, 255, 0.15);
            --success-bg: rgba(255, 255, 255, 0.02);
            --success-border: rgba(255, 255, 255, 0.25);
        }
        @media (prefers-color-scheme: light) {
            :root {
                /* Light/White Theme variables */
                --bg-color: #fafafa;
                --card-bg: rgba(255, 255, 255, 0.85);
                --card-border: rgba(0, 0, 0, 0.08);
                --primary: #09090b;
                --primary-glow: rgba(0, 0, 0, 0.08);
                --text-color: #09090b;
                --text-muted: #71717a;
                --input-bg: #ffffff;
                --input-border: rgba(0, 0, 0, 0.12);
                --shadow: 0 20px 40px rgba(0, 0, 0, 0.04), 0 0 50px rgba(0, 0, 0, 0.01);
                --btn-bg: #09090b;
                --btn-text: #ffffff;
                --btn-hover-bg: #27272a;
                --error-bg: rgba(0, 0, 0, 0.01);
                --error-border: rgba(0, 0, 0, 0.12);
                --success-bg: rgba(0, 0, 0, 0.01);
                --success-border: rgba(0, 0, 0, 0.2);
            }
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }
        body {
            background-color: var(--bg-color);
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
            box-shadow: var(--shadow);
            text-align: center;
        }
        .logo-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
        }
        .logo-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 12px;
            filter: drop-shadow(0 0 15px var(--primary-glow));
        }
        .logo-text {
            font-size: 2rem;
            font-weight: 800;
            color: var(--text-color);
            letter-spacing: 3px;
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
            padding: 8px 14px;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 12px;
            color: var(--text-color);
            font-size: 0.95rem;
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
            padding: 10px 16px;
            background: var(--btn-bg);
            border: none;
            border-radius: 12px;
            color: var(--btn-text);
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, box-shadow 0.2s;
            margin-top: 10px;
            box-shadow: 0 4px 12px var(--primary-glow);
        }
        button:hover {
            background: var(--btn-hover-bg);
            box-shadow: 0 6px 20px var(--primary-glow);
        }
        button:active {
            opacity: 0.9;
        }
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            margin-bottom: 24px;
            text-align: left;
            border: 1px solid var(--alert-border);
            background: var(--alert-bg);
        }
        .alert-error {
            --alert-bg: var(--error-bg);
            --alert-border: var(--error-border);
            border-left: 4px solid var(--text-color);
            color: var(--text-color);
        }
        .alert-success {
            --alert-bg: var(--success-bg);
            --alert-border: var(--success-border);
            border-left: 4px solid var(--text-color);
            color: var(--text-color);
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <polygon points="80.29,50.00 65.06,73.08 35.53,66.00 35.53,34.00 65.06,26.92" fill="var(--primary)" />
                <polygon points="82.01,51.24 95.00,51.24 88.99,72.83 71.53,88.94 66.78,74.32" fill="var(--primary)" opacity="0.85" />
                <polygon points="64.33,75.29 69.08,89.92 43.24,94.02 17.82,80.55 34.80,68.21" fill="var(--primary)" opacity="0.75" />
                <polygon points="33.04,66.00 16.06,78.34 5.00,50.00 16.06,21.66 33.04,34.00" fill="var(--primary)" opacity="0.85" />
                <polygon points="34.80,31.79 17.82,19.45 43.24,5.98 69.08,10.08 64.33,24.71" fill="var(--primary)" opacity="0.75" />
                <polygon points="66.78,25.68 71.53,11.06 88.99,27.17 95.00,48.76 82.01,48.76" fill="var(--primary)" opacity="0.9" />
            </svg>
            <div class="logo-text">MOUL</div>
        </div>
        
        {{if .Success}}
            <h2 style="margin-bottom: 12px; font-weight: 600;">Device Authorized</h2>
            <p class="subtitle" style="margin-bottom: 0;">You have successfully authorized the client. You can now return to your terminal; the application will resume automatically.</p>
        {{else}}
            <p class="subtitle">Enter the authorization code and your credentials to connect your device.</p>
            
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
