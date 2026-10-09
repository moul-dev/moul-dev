package handlers

import (
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"golang.org/x/crypto/bcrypt"

	"github.com/moul-dev/moul-dev/internal/auth"
	"github.com/moul-dev/moul-dev/internal/logger"
	moulmcp "github.com/moul-dev/moul-dev/internal/mcp"
	"github.com/moul-dev/moul-dev/internal/util"
)

// OAuthServerHandler handles RFC 9728 Protected Resource Metadata,
// RFC 8414 Authorization Server Metadata, RFC 7591 Dynamic Client Registration,
// and OAuth 2.1 authorization code grant with PKCE.
type OAuthServerHandler struct {
	DB       *dbx.DB
	AdminKey string
	AppName  string
}

// NewOAuthServerHandler initializes a new OAuthServerHandler.
func NewOAuthServerHandler(dbConn *dbx.DB, adminKey string, appName ...string) *OAuthServerHandler {
	name := ""
	if len(appName) > 0 && appName[0] != "" {
		name = appName[0]
	}
	return &OAuthServerHandler{
		DB:       dbConn,
		AdminKey: adminKey,
		AppName:  name,
	}
}

func (h *OAuthServerHandler) getAppName() string {
	return moulmcp.ResolveAppName(h.DB, h.AppName)
}

// getBaseURL extracts the canonical scheme and host for metadata and callback endpoints.
func getBaseURL(c *echo.Context) string {
	scheme := "http"
	if c.Request().TLS != nil {
		scheme = "https"
	}
	host := c.Request().Host
	if forwardedHost := c.Request().Header.Get("X-Forwarded-Host"); forwardedHost != "" {
		host = forwardedHost
	}
	if forwardedProto := c.Request().Header.Get("X-Forwarded-Proto"); forwardedProto != "" {
		scheme = forwardedProto
	}
	return fmt.Sprintf("%s://%s", scheme, host)
}

// ProtectedResourceMetadata handles GET /.well-known/oauth-protected-resource and /.well-known/oauth-protected-resource/*
// Conforms to RFC 9728 (OAuth 2.0 Protected Resource Metadata) required by Model Context Protocol (MCP) clients including Google Gemini.
func (h *OAuthServerHandler) ProtectedResourceMetadata(c *echo.Context) error {
	baseURL := getBaseURL(c)

	resourceURI := baseURL + "/api/mcp"
	subPath := c.Param("*")
	if subPath != "" {
		resourceURI = baseURL + "/" + strings.TrimPrefix(subPath, "/")
	}

	metadata := map[string]interface{}{
		"resource": resourceURI,
		"authorization_servers": []string{
			baseURL,
		},
		"scopes_supported": []string{
			"mcp",
			"admin",
		},
		"bearer_methods_supported": []string{
			"header",
		},
		"resource_name":          h.getAppName() + " MCP Server",
		"resource_documentation": baseURL + "/docs",
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/json")
	return c.JSON(http.StatusOK, metadata)
}

// AuthorizationServerMetadata handles GET /.well-known/oauth-authorization-server and /.well-known/openid-configuration
// Conforms to RFC 8414 (OAuth 2.0 Authorization Server Metadata).
func (h *OAuthServerHandler) AuthorizationServerMetadata(c *echo.Context) error {
	baseURL := getBaseURL(c)

	metadata := map[string]interface{}{
		"issuer":                 baseURL,
		"authorization_endpoint": baseURL + "/api/oauth2/authorize",
		"token_endpoint":         baseURL + "/api/oauth2/token",
		"registration_endpoint":  baseURL + "/api/oauth2/register",
		"response_types_supported": []string{
			"code",
		},
		"response_modes_supported": []string{
			"query",
		},
		"grant_types_supported": []string{
			"authorization_code",
			"refresh_token",
		},
		"token_endpoint_auth_methods_supported": []string{
			"client_secret_post",
			"client_secret_basic",
			"none",
		},
		"code_challenge_methods_supported": []string{
			"S256",
			"plain",
		},
		"scopes_supported": []string{
			"mcp",
			"admin",
		},
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/json")
	return c.JSON(http.StatusOK, metadata)
}

// RegisterClientRequest represents the RFC 7591 Dynamic Client Registration payload.
type RegisterClientRequest struct {
	ClientName              string   `json:"client_name"`
	RedirectURIs            []string `json:"redirect_uris"`
	GrantTypes              []string `json:"grant_types"`
	ResponseTypes           []string `json:"response_types"`
	TokenEndpointAuthMethod string   `json:"token_endpoint_auth_method"`
}

// RegisterClient handles POST /api/oauth2/register (RFC 7591 Dynamic Client Registration).
func (h *OAuthServerHandler) RegisterClient(c *echo.Context) error {
	req := new(RegisterClientRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid registration request payload")
	}

	client, err := auth.DefaultOAuthStore.RegisterClient(
		req.ClientName,
		req.RedirectURIs,
		req.GrantTypes,
		req.ResponseTypes,
		req.TokenEndpointAuthMethod,
	)
	if err != nil {
		logger.Error("Failed to register dynamic OAuth client", "err", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to register client")
	}

	response := map[string]interface{}{
		"client_id":                  client.ClientID,
		"client_secret":              client.ClientSecret,
		"client_name":                client.ClientName,
		"redirect_uris":              client.RedirectURIs,
		"grant_types":                client.GrantTypes,
		"response_types":             client.ResponseTypes,
		"token_endpoint_auth_method": client.TokenEndpointAuthMethod,
		"client_id_issued_at":        client.CreatedAt.Unix(),
	}

	return c.JSON(http.StatusCreated, response)
}

// AuthorizeRenderData represents data passed to the OAuth consent page.
type AuthorizeRenderData struct {
	AppName             string
	ClientName          string
	ClientID            string
	RedirectURI         string
	ResponseType        string
	Scope               string
	State               string
	CodeChallenge       string
	CodeChallengeMethod string
	Error               string
	Identity            string
	CancelURL           string
}

// Authorize handles GET /api/oauth2/authorize
func (h *OAuthServerHandler) Authorize(c *echo.Context) error {
	clientID := c.QueryParam("client_id")
	redirectURI := c.QueryParam("redirect_uri")
	responseType := c.QueryParam("response_type")
	scope := c.QueryParam("scope")
	state := c.QueryParam("state")
	codeChallenge := c.QueryParam("code_challenge")
	codeChallengeMethod := c.QueryParam("code_challenge_method")

	if clientID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "client_id is required")
	}
	if redirectURI == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "redirect_uri is required")
	}
	if responseType != "" && responseType != "code" {
		return echo.NewHTTPError(http.StatusBadRequest, "unsupported_response_type: only 'code' is supported")
	}

	// Ensure client exists in store (auto-registers if client was configured manually in Gemini UI)
	client := auth.DefaultOAuthStore.EnsureClient(clientID, redirectURI, "")

	if scope == "" {
		scope = "mcp"
	}

	cancelURL := redirectURI
	if u, err := url.Parse(redirectURI); err == nil {
		q := u.Query()
		q.Set("error", "access_denied")
		if state != "" {
			q.Set("state", state)
		}
		u.RawQuery = q.Encode()
		cancelURL = u.String()
	}

	return renderOAuthAuthorizeTemplate(c, http.StatusOK, AuthorizeRenderData{
		AppName:             h.getAppName(),
		ClientName:          client.ClientName,
		ClientID:            clientID,
		RedirectURI:         redirectURI,
		ResponseType:        "code",
		Scope:               scope,
		State:               state,
		CodeChallenge:       codeChallenge,
		CodeChallengeMethod: codeChallengeMethod,
		CancelURL:           cancelURL,
	})
}

// AuthorizeConfirm handles POST /api/oauth2/authorize
func (h *OAuthServerHandler) AuthorizeConfirm(c *echo.Context) error {
	clientID := strings.TrimSpace(c.FormValue("client_id"))
	redirectURI := strings.TrimSpace(c.FormValue("redirect_uri"))
	scope := strings.TrimSpace(c.FormValue("scope"))
	state := strings.TrimSpace(c.FormValue("state"))
	codeChallenge := strings.TrimSpace(c.FormValue("code_challenge"))
	codeChallengeMethod := strings.TrimSpace(c.FormValue("code_challenge_method"))
	identity := strings.TrimSpace(c.FormValue("identity"))
	password := strings.TrimSpace(c.FormValue("password"))

	renderErr := func(msg string) error {
		clientName := "MCP Client"
		if client, ok := auth.DefaultOAuthStore.GetClient(clientID); ok {
			clientName = client.ClientName
		}
		cancelURL := redirectURI
		if u, err := url.Parse(redirectURI); err == nil {
			q := u.Query()
			q.Set("error", "access_denied")
			if state != "" {
				q.Set("state", state)
			}
			u.RawQuery = q.Encode()
			cancelURL = u.String()
		}
		return renderOAuthAuthorizeTemplate(c, http.StatusBadRequest, AuthorizeRenderData{
			AppName:             h.getAppName(),
			ClientName:          clientName,
			ClientID:            clientID,
			RedirectURI:         redirectURI,
			ResponseType:        "code",
			Scope:               scope,
			State:               state,
			CodeChallenge:       codeChallenge,
			CodeChallengeMethod: codeChallengeMethod,
			Error:               msg,
			Identity:            identity,
			CancelURL:           cancelURL,
		})
	}

	if clientID == "" || redirectURI == "" {
		return renderErr("Missing client_id or redirect_uri")
	}
	if identity == "" || password == "" {
		return renderErr("Root administrator email/username and password are required")
	}

	var userID, email, username, authMoul string
	authenticated := false

	// 1. Primary Authentication: Database _rootUsers verification (Standard Root Account)
	if h.DB != nil {
		var record dbx.NullStringMap
		err := h.DB.Select("*").From("_rootUsers").
			Where(dbx.NewExp("username = {:identity} OR email = {:identity}", dbx.Params{"identity": identity})).
			One(&record)

		if err == nil {
			recordMap := nullStringMapToMap(record)
			if hashVal, ok := recordMap["passwordHash"].(string); ok && hashVal != "" {
				if bcrypt.CompareHashAndPassword([]byte(hashVal), []byte(password)) == nil {
					// Check IP whitelist if configured
					var ipEnabledVal string
					_ = h.DB.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_ip_enabled"}).Row(&ipEnabledVal)
					if ipEnabledVal == "true" {
						var allowedIPs string
						_ = h.DB.Select("value").From("_settings").Where(dbx.HashExp{"key": "root_user_allowed_ips"}).Row(&allowedIPs)
						if !util.IsIPAllowed(c.RealIP(), allowedIPs) {
							return renderErr("Your IP address is not authorized to log in as root user")
						}
					}

					userID, _ = recordMap["id"].(string)
					email, _ = recordMap["email"].(string)
					username, _ = recordMap["username"].(string)
					authMoul = "_rootUsers"
					authenticated = true
				}
			}
		} else if err != sql.ErrNoRows {
			logger.Error("Failed to query root user for oauth authorization", "err", err)
		}
	}

	// 2. Fallback: Master Admin Key (for headless or single-key environments)
	if !authenticated && h.AdminKey != "" && (subtle.ConstantTimeCompare([]byte(identity), []byte(h.AdminKey)) == 1 || subtle.ConstantTimeCompare([]byte(password), []byte(h.AdminKey)) == 1) {
		userID = "admin"
		username = "admin"
		email = "admin@moul.local"
		authMoul = "_rootUsers"
		authenticated = true
	}

	if !authenticated {
		return renderErr("Invalid administrator credentials. Please check your username/email and password.")
	}

	// Create Authorization Code
	authCode, err := auth.DefaultOAuthStore.CreateAuthorizationCode(
		clientID,
		redirectURI,
		codeChallenge,
		codeChallengeMethod,
		scope,
		userID,
		username,
		email,
		authMoul,
		5*time.Minute,
	)
	if err != nil {
		logger.Error("Failed to create authorization code", "err", err)
		return renderErr("Failed to issue authorization code")
	}

	// Redirect to client callback URL using proper URL query manipulation
	u, err := url.Parse(redirectURI)
	if err != nil {
		return renderErr("Invalid redirect URI format")
	}
	q := u.Query()
	q.Set("code", authCode.Code)
	if state != "" {
		q.Set("state", state)
	}
	u.RawQuery = q.Encode()

	return c.Redirect(http.StatusFound, u.String())
}

// TokenRequest represents the OAuth 2.0 token request.
type TokenRequest struct {
	GrantType    string `json:"grant_type" form:"grant_type"`
	Code         string `json:"code" form:"code"`
	RedirectURI  string `json:"redirect_uri" form:"redirect_uri"`
	ClientID     string `json:"client_id" form:"client_id"`
	ClientSecret string `json:"client_secret" form:"client_secret"`
	CodeVerifier string `json:"code_verifier" form:"code_verifier"`
	RefreshToken string `json:"refresh_token" form:"refresh_token"`
}

// Token handles POST /api/oauth2/token
func (h *OAuthServerHandler) Token(c *echo.Context) error {
	req := new(TokenRequest)
	_ = c.Bind(req)

	// Fallback to form values if bind didn't capture
	if req.GrantType == "" {
		req.GrantType = c.FormValue("grant_type")
	}
	if req.Code == "" {
		req.Code = c.FormValue("code")
	}
	if req.RedirectURI == "" {
		req.RedirectURI = c.FormValue("redirect_uri")
	}
	if req.ClientID == "" {
		req.ClientID = c.FormValue("client_id")
	}
	if req.ClientSecret == "" {
		req.ClientSecret = c.FormValue("client_secret")
	}
	if req.CodeVerifier == "" {
		req.CodeVerifier = c.FormValue("code_verifier")
	}
	if req.RefreshToken == "" {
		req.RefreshToken = c.FormValue("refresh_token")
	}

	// Check HTTP Basic Auth (Authorization: Basic <base64(client_id:client_secret)>)
	if authHeader := c.Request().Header.Get("Authorization"); authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.EqualFold(parts[0], "basic") {
			decoded, err := base64.StdEncoding.DecodeString(parts[1])
			if err == nil {
				credParts := strings.SplitN(string(decoded), ":", 2)
				if len(credParts) == 2 {
					if req.ClientID == "" {
						req.ClientID = credParts[0]
					}
					if req.ClientSecret == "" {
						req.ClientSecret = credParts[1]
					}
				}
			}
		}
	}

	switch req.GrantType {
	case "authorization_code":
		if req.Code == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error":             "invalid_request",
				"error_description": "code is required",
			})
		}

		authCode, err := auth.DefaultOAuthStore.ExchangeAuthorizationCode(
			req.Code,
			req.ClientID,
			req.RedirectURI,
			req.CodeVerifier,
			req.ClientSecret,
		)
		if err != nil {
			logger.Warn("OAuth token authorization_code exchange rejected", "err", err)
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error":             "invalid_grant",
				"error_description": err.Error(),
			})
		}

		// Generate signed JWT token
		accessToken, err := auth.GenerateToken(authCode.UserID, authCode.Email, authCode.Username, authCode.AuthMoul)
		if err != nil {
			logger.Error("Failed to generate JWT access token", "err", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error":             "server_error",
				"error_description": "Failed to issue access token",
			})
		}

		// Issue Refresh Token
		refreshToken, err := auth.DefaultOAuthStore.CreateRefreshToken(
			authCode.ClientID,
			authCode.UserID,
			authCode.Email,
			authCode.Username,
			authCode.AuthMoul,
			authCode.Scope,
			30*24*time.Hour,
		)
		if err != nil {
			logger.Error("Failed to issue refresh token", "err", err)
		}

		response := map[string]interface{}{
			"access_token": accessToken,
			"token_type":   "Bearer",
			"expires_in":   86400, // 24 hours
			"scope":        authCode.Scope,
		}
		if refreshToken != nil {
			response["refresh_token"] = refreshToken.Token
		}

		c.Response().Header().Set("Cache-Control", "no-store")
		c.Response().Header().Set("Pragma", "no-cache")
		return c.JSON(http.StatusOK, response)

	case "refresh_token":
		if req.RefreshToken == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error":             "invalid_request",
				"error_description": "refresh_token is required",
			})
		}

		ref, err := auth.DefaultOAuthStore.ExchangeRefreshToken(req.RefreshToken, req.ClientID)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error":             "invalid_grant",
				"error_description": err.Error(),
			})
		}

		accessToken, err := auth.GenerateToken(ref.UserID, ref.Email, ref.Username, ref.AuthMoul)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error":             "server_error",
				"error_description": "Failed to generate access token",
			})
		}

		response := map[string]interface{}{
			"access_token":  accessToken,
			"token_type":    "Bearer",
			"expires_in":    86400,
			"refresh_token": ref.Token,
			"scope":         ref.Scope,
		}

		c.Response().Header().Set("Cache-Control", "no-store")
		c.Response().Header().Set("Pragma", "no-cache")
		return c.JSON(http.StatusOK, response)

	default:
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":             "unsupported_grant_type",
			"error_description": fmt.Sprintf("Grant type '%s' is not supported", req.GrantType),
		})
	}
}

// renderOAuthAuthorizeTemplate renders the HTML consent screen.
func renderOAuthAuthorizeTemplate(c *echo.Context, status int, data AuthorizeRenderData) error {
	tmpl, err := template.New("oauth_authorize").Parse(oauthAuthorizeHTML)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Template parsing error")
	}
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTMLCharsetUTF8)
	c.Response().WriteHeader(status)
	return tmpl.Execute(c.Response(), data)
}

const oauthAuthorizeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authorize {{.ClientName}} - {{.AppName}} MCP</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #09090b;
            --card-bg: rgba(18, 18, 22, 0.75);
            --card-border: rgba(255, 255, 255, 0.08);
            --primary: #ffffff;
            --primary-glow: rgba(255, 255, 255, 0.15);
            --text-color: #f4f4f5;
            --text-muted: #a1a1aa;
            --badge-bg: rgba(255, 255, 255, 0.08);
            --badge-border: rgba(255, 255, 255, 0.15);
            --input-bg: rgba(9, 9, 11, 0.85);
            --input-border: rgba(255, 255, 255, 0.12);
            --btn-bg: #ffffff;
            --btn-text: #09090b;
            --btn-hover: #e4e4e7;
            --danger-bg: rgba(239, 68, 68, 0.12);
            --danger-border: rgba(239, 68, 68, 0.3);
            --danger-text: #fca5a5;
        }
        @media (prefers-color-scheme: light) {
            :root {
                --bg-color: #fafafa;
                --card-bg: rgba(255, 255, 255, 0.9);
                --card-border: rgba(0, 0, 0, 0.08);
                --primary: #09090b;
                --primary-glow: rgba(0, 0, 0, 0.08);
                --text-color: #09090b;
                --text-muted: #71717a;
                --badge-bg: rgba(0, 0, 0, 0.04);
                --badge-border: rgba(0, 0, 0, 0.1);
                --input-bg: #ffffff;
                --input-border: rgba(0, 0, 0, 0.14);
                --btn-bg: #09090b;
                --btn-text: #ffffff;
                --btn-hover: #27272a;
                --danger-bg: rgba(239, 68, 68, 0.08);
                --danger-border: rgba(239, 68, 68, 0.2);
                --danger-text: #b91c1c;
            }
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .container {
            width: 100%;
            max-width: 460px;
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--card-border);
            border-radius: 18px;
            padding: 36px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            text-align: center;
        }
        .logo-wrap {
            margin-bottom: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .logo-icon {
            width: 48px;
            height: 48px;
        }
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .subtitle {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-bottom: 20px;
            line-height: 1.45;
        }
        .scope-badge {
            display: inline-block;
            background: var(--badge-bg);
            border: 1px solid var(--badge-border);
            border-radius: 999px;
            padding: 6px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 24px;
            letter-spacing: 0.5px;
        }
        .error-box {
            background: var(--danger-bg);
            border: 1px solid var(--danger-border);
            color: var(--danger-text);
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 0.88rem;
            margin-bottom: 18px;
            text-align: left;
        }
        .form-group {
            text-align: left;
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 0.82rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
            color: var(--text-muted);
        }
        input {
            width: 100%;
            padding: 10px 14px;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 10px;
            color: var(--text-color);
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus {
            border-color: var(--primary);
        }
        .btn-submit {
            width: 100%;
            padding: 12px 18px;
            background: var(--btn-bg);
            color: var(--btn-text);
            border: none;
            border-radius: 10px;
            font-size: 0.98rem;
            font-weight: 700;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            margin-top: 10px;
        }
        .btn-submit:hover {
            background: var(--btn-hover);
        }
        .btn-submit:active {
            transform: scale(0.99);
        }
        .cancel-link {
            display: block;
            margin-top: 16px;
            font-size: 0.85rem;
            color: var(--text-muted);
            text-decoration: none;
        }
        .cancel-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-wrap">
            <svg class="logo-icon" viewBox="0 0 100 100">
                <style>
                    polygon { fill: #000000; }
                    @media (prefers-color-scheme: dark) { polygon { fill: #ffffff; } }
                </style>
                <polygon points="80.29,50.00 65.06,73.08 35.53,66.00 35.53,34.00 65.06,26.92" />
                <polygon points="82.01,51.24 95.00,51.24 88.99,72.83 71.53,88.94 66.78,74.32" />
                <polygon points="64.33,75.29 69.08,89.92 43.24,94.02 17.82,80.55 34.80,68.21" />
                <polygon points="33.04,66.00 16.06,78.34 5.00,50.00 16.06,21.66 33.04,34.00" />
                <polygon points="34.80,31.79 17.82,19.45 43.24,5.98 69.08,10.08 64.33,24.71" />
                <polygon points="66.78,25.68 71.53,11.06 88.99,27.17 95.00,48.76 82.01,48.76" />
            </svg>
        </div>

        <h1>Authorize Access</h1>
        <p class="subtitle"><strong>{{.ClientName}}</strong> is requesting authorization to connect to your {{.AppName}} MCP Server.</p>

        <div class="scope-badge">Scope: {{.Scope}}</div>

        {{if .Error}}
        <div class="error-box">{{.Error}}</div>
        {{end}}

        <form method="POST" action="">
            <input type="hidden" name="client_id" value="{{.ClientID}}">
            <input type="hidden" name="redirect_uri" value="{{.RedirectURI}}">
            <input type="hidden" name="response_type" value="{{.ResponseType}}">
            <input type="hidden" name="scope" value="{{.Scope}}">
            <input type="hidden" name="state" value="{{.State}}">
            <input type="hidden" name="code_challenge" value="{{.CodeChallenge}}">
            <input type="hidden" name="code_challenge_method" value="{{.CodeChallengeMethod}}">

            <div class="form-group">
                <label for="identity">Root Administrator Email or Username</label>
                <input type="text" id="identity" name="identity" value="{{.Identity}}" placeholder="e.g. admin@moul.dev" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn-submit">Authorize {{.ClientName}}</button>
        </form>

        <a class="cancel-link" href="{{.CancelURL}}">Cancel</a>
    </div>
</body>
</html>`
