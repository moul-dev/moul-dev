# AGENTS.md - AI Agent & LLM Guide for `moul`

Welcome to `moul`. This document provides essential instructions, operating rules, API reference concepts, and tool definitions for AI coding agents and LLMs interacting with or managing a `moul` server instance.

---

## 1. Overview & Architecture

`moul` is a single-binary dynamic database, multi-factor authentication engine, background job processor (inspired by Elixir's Oban), feature flag targeting provider, host system observability server, and AI-native MCP server.

Key Capabilities:
- **Single Binary Engine**: Zero external dependencies. Everything runs inside a single binary (`moul`) backed by SQLite.
- **Embedded Web Admin Console**: Full-featured graphical admin UI mounted at `/_moul_/` (auto-redirect from `/admin`), built with TanStack Router, Meta StyleX, Moul UI (`@moul-dev/ui`), tri-state system/light/dark theme toggle, and Phosphor Icons embedded via Go `embed.FS`.
- **Dynamic Schema Execution**: Database collections (called "Mouls") and access rules can be created, updated, and queried at runtime via HTTP API, TUI console, or MCP server without restarting the process.
- **Programmatic Go API & HTTP Hooks**: Embed the server via `pkg/app` and attach custom HTTP routes (`RegisterRoute`, `OnRouterInit`) and worker tasks without forking core engine logic.
- **AI-Native MCP Server**: Native Model Context Protocol (MCP) server supporting stdio transport (`moul mcp`) and HTTP SSE transport (`/api/mcp`).

---

## 2. Connecting AI Agents to `moul`

AI Agents (such as Claude Desktop, Cursor, or custom AI applications) can connect to `moul` using two primary interfaces:

### Option A: Built-in MCP Server (Recommended)
`moul` exposes 17 native MCP tools spanning database management, record CRUD, worker jobs, feature flags, and system telemetry.

1. **Stdio Transport**:
   - Command: `moul mcp`
   - Configuration in `claude_desktop_config.json` or `.cursor/mcp.json`:
     ```json
     {
       "mcpServers": {
         "moul": {
           "command": "/path/to/moul",
           "args": ["mcp"],
           "env": {
             "MOUL_DB_PATH": "/path/to/moul-local.db"
           }
         }
       }
     }
     ```

2. **Streamable HTTP & SSE Transport (MCP 2025 Specification)**:
   - URL: `http://localhost:8090/api/mcp`
   - Flexible Authentication: Pass via `X-Admin-Key` header, `Authorization: Bearer <MOUL_ADMIN_KEY>`, or URL query param `?adminKey=<MOUL_ADMIN_KEY>`.
   - Header Auth Configuration:
     ```json
     {
       "mcpServers": {
         "moul-http": {
           "url": "http://localhost:8090/api/mcp",
           "headers": {
             "X-Admin-Key": "<MOUL_ADMIN_KEY>"
           }
         }
       }
     }
     ```
   - URL Query Parameter Auth Configuration:
     ```json
     {
       "mcpServers": {
         "moul-http": {
           "url": "http://localhost:8090/api/mcp?adminKey=<MOUL_ADMIN_KEY>"
         }
       }
     }
     ```
   - cURL Streamable HTTP example:
     ```bash
     curl -X POST "http://localhost:8090/api/mcp" \
       -H "X-Admin-Key: <MOUL_ADMIN_KEY>" \
       -H "Content-Type: application/json" \
       -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "curl", "version": "1.0"}}}'
     ```

### Option B: REST API & OpenAPI Specification
- Live OpenAPI Spec: `http://localhost:8090/openapi.json` or `http://localhost:8090/openapi.yml`
- Swagger UI / API Docs: `http://localhost:8090/docs`

---

## 3. Server Management & CLI Commands

`moul` is distributed as a single executable binary.

```bash
# Start the HTTP server engine and MCP SSE endpoint (default port 8090)
moul start

# Run built-in MCP server in stdio transport mode
moul mcp

# Restore SQLite database from Litestream S3 backup
moul restore

# Update moul binary to the latest release
moul update

# Launch Bubble Tea TUI Admin Console (via moul-ctl binary)
moul-ctl -server http://localhost:8090 -admin-key test-admin-key-1234

# Or launch TUI via convenience subcommand in moul:
moul ctl -server http://localhost:8090 -admin-key test-admin-key-1234
```

---

## 4. Environment Configuration

The engine reads environment variables from a `.env` file in the current working directory or environment environment.

| Variable | Default | Description |
|---|---|---|
| `MOUL_ENV` | `development` | Environment mode (`development` or `production`). |
| `MOUL_PORT` | `8090` | HTTP server listening port. |
| `MOUL_PUBLIC_URL` | `http://localhost:8090` | Base public URL for email links. |
| `MOUL_JWT_SECRET` | Required | Secret key used for signing JWT tokens. |
| `MOUL_ADMIN_KEY` | Required | Master admin key for administrative endpoints and MCP access. |
| `MOUL_DB_PATH` | `moul-local.db` | Path to the SQLite database file. |
| `MOUL_CORS_ORIGINS` | `*` (in dev) | Comma-separated list of allowed CORS origins. |
| `GEOIP_DB_PATH` | `""` | Optional path to MaxMind GeoIP2 `.mmdb` database. |

---

## 5. Built-in MCP Server Tools Reference

AI Agents connected via MCP can invoke the following 17 built-in tools:

### Collection & Schema Tools
- `moul_list_collections`: List all dynamic collection schemas and tables.
- `moul_get_collection`: `{"name": "string"}` - Retrieve detailed schema fields and rules.
- `moul_create_collection`: `{"name": "string", "type": "base|auth|worker|analytic", "fields_json": "string"}` - Create table. `fields_json` accepts array of `MoulField` objects (`type`: `text`, `number`, `bool`, `date`, `datetime`, `json`, `url`, `file`, `select`, `relation`).
- `moul_delete_collection`: `{"name": "string"}` - Drop table and metadata.

### Record CRUD Tools
- `moul_list_records`: `{"collection": "string", "page": int, "per_page": int}` - List paginated records.
- `moul_get_record`: `{"collection": "string", "id": "string"}` - Get single record by ID.
- `moul_create_record`: `{"collection": "string", "data_json": "string"}` - Insert record (auto-generates ID formatted as `<singular_collection>-<randomID>` if unspecified).
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

---

## 7. Web Admin Console & TanStack DevTools Architecture

The embedded Web Admin Console (`ui/`) is a Vite-powered React TypeScript application with an integrated **TanStack DevTools** ecosystem:

### Collection Creation & Schema Designer Capabilities
- **Dual-Tab Drawer Workflow**: Create collections with tabs for "General & Fields" and "API Access Rules" without leaving the dashboard.
- **Type-Based Templates**: Automatic preset field suggestions for `base`, `auth`, `worker`, and `analytic` collections.
- **Rule Autocomplete & Syntax Help**: Smart suggestions for `@request.*`, `@collection.*`, schema fields, and operators with keyboard navigation, one-click preset chips, and a full Rule Reference Modal Dialog.

### Records Data Grid & Detail Drawer Capabilities
- **Record ID Interactive Inspection**: Clicking any record ID opens a slide-over `Drawer` displaying full field attributes, relation associations, and system timestamps.
- **In-Drawer Record Modification**: Supports direct live editing of schema fields, relations (1:1, 1:N, M:N), file attachments, JSON attributes, and auth fields with instant persistence.
- **Worker Task Inspector & Retry Actions**: For worker job collections, the drawer features execution health cards (attempt count, queue, worker handler, priority, timestamps), an error trace box with one-click copy, and immediate task retry (`POST /api/moul/:name/retry-jobs`) and discard actions.

### DevTools Architecture & Capabilities
- **Unified Framework Adapter**: `<AppDevtools />` wraps `<TanStackDevtools />` from `@tanstack/react-devtools` mounted once at the root route (`__root.tsx`).
- **Tabbed Plugin System**: Consolidates first-party library panels (`TanStackRouterDevtoolsPanel`, `ReactQueryDevtoolsPanel`) and product-specific panels (`MoulDevtoolsPanel`) into a single docked container.
- **Typed Event Inspection (`@tanstack/devtools-event-client`)**: Uses namespaced, type-safe events (`auth:state-change`, `api:request`, `app:action`, `system:ping`) to monitor runtime state transitions, active authentication, and API latency.
- **Vite Integration (`@tanstack/devtools-vite`)**:
  - **Source Inspection**: Hold `Shift` + `Alt` + `Ctrl/Meta` and hover any DOM element to inspect and jump directly to its source file in the IDE.
  - **Client/Server Console Piping**: Pipes browser console logs to the Vite dev terminal and vice versa.
  - **Zero Production Overhead**: DevTools code, imports, and JSX are automatically stripped in production builds (`removeDevtoolsOnBuild: true`).

---

## 8. Developer CLI Tooling & Diagnostics

`moul` includes built-in commands for rapid local iteration, type safety, and testing:

- **Data Import & Export**: `moul export <collection> [--format=csv|json] [--out=file]` and `moul import <collection> <file> [--mode=upsert|insert|replace]` for bulk CSV and JSON data transfers.
- **Database Seeding**: `moul seed` (or `make seed`) populates demo collections, records, and feature flags.
- **TypeScript Type Generation**: `moul typegen --out ui/src/types/schema.d.ts` (or `make typegen`) extracts schema definitions into strict TypeScript interfaces.
- **Rule Expression Testing**: `moul test-rule --rule="<rule>" --record='{...}' --auth='{...}'` validates and benchmarks rules.
- **Worker DLQ Management**: `moul worker retry <table_name> [job_id]` and `moul worker list-failed <table_name>`.
- **Self-Contained E2E Flow Testing**: `make test-e2e` executes full API authentication, CRUD, worker, and analytics flows in-process without manual server startup.

---

## 9. Production Deployment Instructions

When assisting users with deploying `moul` to production on **Ubuntu Server 26.04 LTS**:
- Refer to the dedicated LXD system container, Tailscale, and Cloudflare Tunnel deployment guide: [docs/deployment-lxd-tailscale-cloudflare.md](/docs/deployment-lxd-tailscale-cloudflare.md).
- Ensure host firewall rules close public SSH (port 22) after configuring Tailscale, and route public traffic via `cloudflared`.

---

## 10. Go Backend Engineering Standards

When developing or refactoring backend Go code:
- **Strict Error Handling**: Never discard errors silently using blank identifiers (`_ = ...` or `_, _ = ...`). Always check and propagate errors with `%w` wrapping (`fmt.Errorf("...: %w", err)`) or map them to structured HTTP domain responses.
- **Testing Completeness & Shared Helpers**: Every new package, service, or handler must be accompanied by comprehensive tests (`*_test.go`). Use `internal/testutil` (`testutil.NewTestDB(t)` and `testutil.NewTestServer(t)`) for all database and HTTP test setups instead of manual boilerplate.
- **SQL & Data Access Safety**: Never construct raw SQL strings with dynamic variable concatenation. Always use `safesql` validation and parameterized PocketBase `dbx` builders (`dbx.Params`, `dbx.HashExp`, `dbx.NewExp`).
- **Synchronous OpenAPI & API Documentation**: Whenever adding, modifying, or deleting HTTP endpoints in `internal/handlers/router.go`, synchronously update `docs/openapi.json` and `docs/openapi.yml`, then run `make sync-docs`.
- **Concurrency & State Safety**: Stateful services, in-memory caches, and background workers must ensure thread safety with appropriate synchronization primitives (`sync.RWMutex` / `sync.Mutex`).




