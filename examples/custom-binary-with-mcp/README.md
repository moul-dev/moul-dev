# Custom Binary Embedding with Built-in MCP Server

This example demonstrates how to embed Moul as a Go library inside your own custom binary while retaining full Model Context Protocol (MCP) server support and adding your own custom MCP tools.

Custom MCP tools registered in your Go binary are available across **both** MCP transport modes:
1. **Local Stdio Transport** (`go run main.go mcp`)
2. **Streamable HTTP & SSE Transport** (`go run main.go start` at `http://localhost:8090/api/mcp`)

---

## Key Features Demonstrated

- **Embedded MCP Server**: Retains all 17+ built-in Moul tools (`moul_list_collections`, `moul_get_record`, `moul_enqueue_job`, `moul_get_system_metrics`, etc.).
- **Custom MCP Tool Registration**: Use `moulApp.RegisterMCPTool(...)` to register domain-specific tools (such as `calculate_customer_discount`) directly in Go.
- **Stdio Guarding**: Uses `if !app.IsMCP()` to prevent non-JSON console output from polluting standard output during stdio sessions.
- **Dual HTTP Authentication**: Supports authenticating remote MCP clients using either `Authorization: Bearer <ADMIN_KEY>` or `X-Admin-Key: <ADMIN_KEY>`.
- **Full Backend Capabilities**: Includes custom REST routes (`/api/custom/info`), background workers, and embedded Web Admin Console (`/_moul_/`).

---

## 1. Running the Binary

### Option A: HTTP Server Mode (Streamable HTTP & SSE)

Starts the full web server, background workers, Web Admin Console, and the HTTP MCP endpoint:

```bash
MOUL_ENV=development go run examples/custom-binary-with-mcp/main.go start
```

Default credentials in development mode:
- **Admin Key**: `admin-key-dev-secret-change-me`
- **MCP Endpoint**: `http://localhost:8090/api/mcp`
- **Web Admin Console**: `http://localhost:8090/_moul_/`

### Option B: Local Stdio Mode (CLI Transport)

Runs the binary directly over standard input and standard output for local AI assistants (Claude Desktop, local Cursor, Antigravity):

```bash
go run examples/custom-binary-with-mcp/main.go mcp
```

> [!NOTE]
> Stdio mode does not require `MOUL_ADMIN_KEY` or `MOUL_JWT_SECRET` environment variables because the process runs with the privileges of the local executing user.

---

## 2. HTTP Authentication Methods

When connecting remote AI assistants or HTTP clients to `http://localhost:8090/api/mcp`, Moul supports two primary header authentication methods:

### Method 1: Bearer Token Header (`Authorization: Bearer <ADMIN_KEY>`)

The standard HTTP authorization convention supported natively by Cursor, Claude Code, Windsurf, and modern MCP clients:

```http
POST /api/mcp HTTP/1.1
Host: localhost:8090
Authorization: Bearer admin-key-dev-secret-change-me
Content-Type: application/json
```

### Method 2: Dedicated Admin Key Header (`X-Admin-Key: <ADMIN_KEY>`)

A dedicated header designed for API gateways, proxies, and automated scripts:

```http
POST /api/mcp HTTP/1.1
Host: localhost:8090
X-Admin-Key: admin-key-dev-secret-change-me
Content-Type: application/json
```

*(Optional fallback: If your client cannot supply custom request headers, you can pass the key as a query parameter: `http://localhost:8090/api/mcp?adminKey=admin-key-dev-secret-change-me`)*

---

## 3. AI Assistant Configurations

### Cursor (`.cursor/mcp.json`)

#### Option 1: Remote HTTP with Bearer Token (Recommended)

```json
{
  "mcpServers": {
    "custom-moul": {
      "type": "http",
      "url": "http://localhost:8090/api/mcp",
      "headers": {
        "Authorization": "Bearer admin-key-dev-secret-change-me"
      }
    }
  }
}
```

#### Option 2: Remote HTTP with X-Admin-Key Header

```json
{
  "mcpServers": {
    "custom-moul": {
      "type": "http",
      "url": "http://localhost:8090/api/mcp",
      "headers": {
        "X-Admin-Key": "admin-key-dev-secret-change-me"
      }
    }
  }
}
```

#### Option 3: Local Process via Stdio Transport

```json
{
  "mcpServers": {
    "custom-moul": {
      "command": "go",
      "args": ["run", "examples/custom-binary-with-mcp/main.go", "mcp"],
      "env": {
        "MOUL_DB_PATH": "moul-local.db"
      }
    }
  }
}
```

---

### Claude Desktop (`claude_desktop_config.json`)

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "custom-moul": {
      "command": "go",
      "args": [
        "run",
        "/absolute/path/to/moul-dev/examples/custom-binary-with-mcp/main.go",
        "mcp"
      ],
      "env": {
        "MOUL_DB_PATH": "/absolute/path/to/moul-dev/moul-local.db"
      }
    }
  }
}
```

---

## 4. Testing with cURL (Direct JSON-RPC)

You can verify that the custom tool `calculate_customer_discount` is working by dispatching JSON-RPC requests directly.

### Using `Authorization: Bearer` Header:

```bash
curl -s -X POST "http://localhost:8090/api/mcp" \
  -H "Authorization: Bearer admin-key-dev-secret-change-me" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "calculate_customer_discount",
      "arguments": {
        "tier": "platinum",
        "amount": 250.0
      }
    }
  }' | jq .
```

### Using `X-Admin-Key` Header:

```bash
curl -s -X POST "http://localhost:8090/api/mcp" \
  -H "X-Admin-Key: admin-key-dev-secret-change-me" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "calculate_customer_discount",
      "arguments": {
        "tier": "gold",
        "amount": 100.0
      }
    }
  }' | jq .
```

### Expected Output:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Tier: platinum | Base: $250.00 | Discount: 25% (-$62.50) | Final: $187.50"
      }
    ]
  }
}
```

---

## 5. Registering Custom Tools in Go

Use `app.RegisterMCPTool` to expose any custom Go function to your AI assistant:

```go
customTool := mcp.NewTool(
    "calculate_customer_discount",
    mcp.WithDescription("Calculate personalized customer discount rate based on tier and order amount"),
    mcp.WithString("tier", mcp.Required(), mcp.Description("Customer membership tier: standard, silver, gold, or platinum")),
    mcp.WithNumber("amount", mcp.Required(), mcp.Description("Total order amount in USD")),
)

moulApp.RegisterMCPTool(customTool, func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
    tier := req.GetString("tier", "standard")
    amount := req.GetFloat("amount", 0.0)
    
    // Custom domain logic...
    return mcp.NewToolResultText("..."), nil
})
```
