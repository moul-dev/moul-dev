# AGENTS.md - AI Agent & LLM Guide for `mould`

Welcome to `mould`. This document provides essential instructions, operating rules, API reference concepts, and tool definitions for AI coding agents and LLMs interacting with or managing a `mould` server instance.

---

## 1. Overview & Architecture

`mould` is a single-binary dynamic database, multi-factor authentication engine, background job processor (inspired by Elixir's Oban), feature flag targeting provider, host system observability server, and AI-native MCP server.

Key Capabilities:
- **Single Binary Engine**: Zero external dependencies. Everything runs inside a single binary (`mould`) backed by SQLite.
- **Dynamic Schema Execution**: Database collections (called "Mouls") and access rules can be created, updated, and queried at runtime via HTTP API, TUI console, or MCP server without restarting the process.
- **AI-Native MCP Server**: Native Model Context Protocol (MCP) server supporting stdio transport (`mould mcp`) and HTTP SSE transport (`/api/mcp`).

---

## 2. Connecting AI Agents to `mould`

AI Agents (such as Claude Desktop, Cursor, or custom AI applications) can connect to `mould` using two primary interfaces:

### Option A: Built-in MCP Server (Recommended)
`mould` exposes 17 native MCP tools spanning database management, record CRUD, worker jobs, feature flags, and system telemetry.

1. **Stdio Transport**:
   - Command: `mould mcp`
   - Configuration in `claude_desktop_config.json`:
     ```json
     {
       "mcpServers": {
         "mould": {
           "command": "/path/to/mould",
           "args": ["mcp"],
           "env": {
             "MOUL_DB_PATH": "/path/to/moul-local.db"
           }
         }
       }
     }
     ```

2. **HTTP SSE Transport**:
   - URL: `http://localhost:8090/api/mcp`
   - Header: `X-Admin-Key: <MOUL_ADMIN_KEY>` or `Authorization: Bearer <MOUL_ADMIN_KEY>`

### Option B: REST API & OpenAPI Specification
- Live OpenAPI Spec: `http://localhost:8090/openapi.json` or `http://localhost:8090/openapi.yml`
- Swagger UI / API Docs: `http://localhost:8090/docs`

---

## 3. Server Management & CLI Commands

`mould` is distributed as a single executable binary.

```bash
# Start the HTTP server engine and MCP SSE endpoint (default port 8090)
mould start

# Run built-in MCP server in stdio transport mode
mould mcp

# Restore SQLite database from Litestream S3 backup
mould restore

# Update mould binary to the latest release
mould update

# Launch Bubble Tea TUI Admin Console (via moul binary)
moul -server http://localhost:8090 -admin-key test-admin-key-1234
```

---

## 4. Environment Configuration

The engine reads environment variables from a `.env` file in the current working directory or environment environment.

| Variable | Default | Description |
|---|---|---|
| `MOUL_ENV` | `development` | Environment mode (`development` or `production`). |
| `MOUL_PORT` | `8090` | HTTP server listening port. |
| `MOUL_JWT_SECRET` | Required | Secret key used for signing JWT tokens. |
| `MOUL_ADMIN_KEY` | Required | Master admin key for administrative endpoints and MCP access. |
| `MOUL_DB_PATH` | `moul-local.db` | Path to the SQLite database file. |
| `MOUL_CORS_ORIGINS` | `*` (in dev) | Comma-separated list of allowed CORS origins. |
| `GEOIP_DB_PATH` | `""` | Optional path to MaxMind GeoIP2 `.mmdb` database. |
| `MOUL_TELEGRAF_SOCKET_PATH` | `/tmp/moul-telegraf.sock` | Path to Telegraf Unix Domain Socket for sysmon metrics stream. |

---

## 5. Built-in MCP Server Tools Reference

AI Agents connected via MCP can invoke the following 17 built-in tools:

### Collection & Schema Tools
- `moul_list_collections`: List all dynamic collection schemas and tables.
- `moul_get_collection`: `{"name": "string"}` - Retrieve detailed schema fields and rules.
- `moul_create_collection`: `{"name": "string", "type": "base|auth|worker|analytic", "fields_json": "string"}` - Create table.
- `moul_delete_collection`: `{"name": "string"}` - Drop table and metadata.

### Record CRUD Tools
- `moul_list_records`: `{"collection": "string", "page": int, "per_page": int}` - List paginated records.
- `moul_get_record`: `{"collection": "string", "id": "string"}` - Get single record by ID.
- `moul_create_record`: `{"collection": "string", "data_json": "string"}` - Insert record.
- `moul_update_record`: `{"collection": "string", "id": "string", "data_json": "string"}` - Update record by ID.
- `moul_delete_record`: `{"collection": "string", "id": "string"}` - Delete record by ID.

### Background Worker Tools
- `moul_list_worker_jobs`: `{"table": "string", "state": "string", "limit": int}` - List jobs.
- `moul_enqueue_job`: `{"table": "string", "worker": "string", "args_json": "string", "queue": "string", "priority": int}` - Enqueue job.
- `moul_cancel_job`: `{"table": "string", "id": "string"}` - Cancel job.

### Feature Flag Tools
- `moul_list_feature_flags`: List feature flags and gate rules.
- `moul_set_feature_flag`: `{"key": "string", "enabled": bool, "description": "string", "default_value": "string"}` - Set flag.

### System & Observability Tools
- `moul_get_system_metrics`: Get real-time host CPU, RAM, Disk, and Load metrics.
- `moul_get_analytics_summary`: Get visitor and HTTP request metrics summary.
- `moul_list_requests`: `{"limit": int}` - Query recent HTTP request logs.

---

## 6. Access Rules Syntax

Dynamic collections support access rules governing `list`, `view`, `create`, `update`, and `delete` operations.

### Placeholders & Macros
- `@request.auth.id`: Authenticated user ID from JWT.
- `@request.auth.email`: Authenticated user email address.
- `@collection.<table_name>.<field_name>`: Cross-collection relational lookup.
- `@now`: Current UTC timestamp string.

### Examples
- Public read: `""` (empty)
- Auth required: `@request.auth.id != ""`
- Owner restriction: `id = @request.auth.id` or `user_id = @request.auth.id`
