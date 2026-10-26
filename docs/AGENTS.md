# AGENTS.md - AI Agent & LLM Guide for `moul`

Welcome to `moul`. This document provides essential instructions, operating rules, API reference concepts, and tool definitions for AI coding agents and LLMs interacting with or managing a `moul` server instance.

---

## 1. Overview & Architecture

`moul` is a single-binary dynamic database, multi-factor authentication engine, background job processor (inspired by Elixir's Oban), feature flag targeting provider, host system observability server, and AI-native MCP server.

Key Capabilities:
- **Single Binary Engine**: Zero external dependencies. Everything runs inside a single binary (`moul`) backed by SQLite.
- **Embedded Web Admin Console**: Full-featured graphical admin UI mounted at `/_moul_/`, built with TanStack Router, Meta StyleX, Moul UI (`@moul-dev/ui`), tri-state system/light/dark theme toggle, and Phosphor Icons embedded via Go `embed.FS`.
- **Configurable API Prefix**: All API endpoints default to `/api` but can be customized (e.g. `/v1`) or mounted directly at root (`""`) via `--api-prefix`, `MOUL_API_PREFIX`, or `WithAPIPrefix("")`.
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
   - Flexible Authentication: Pass via `Authorization: Bearer <ADMIN_SECRET_KEY>`, `X-Admin-Key` header, or URL query param `?adminKey=<ADMIN_SECRET_KEY>`.
   - Bearer Token Auth Configuration (Recommended):
     ```json
     {
       "mcpServers": {
         "moul": {
           "type": "http",
           "headers": {
             "Authorization": "Bearer ADMIN_SECRET_KEY"
           },
           "url": "http://localhost:8090/api/mcp"
         }
       }
     }
     ```
   - Header Auth Configuration (`X-Admin-Key`):
     ```json
     {
       "mcpServers": {
         "moul": {
           "type": "http",
           "headers": {
             "X-Admin-Key": "<ADMIN_SECRET_KEY>"
           },
           "url": "http://localhost:8090/api/mcp"
         }
       }
     }
     ```
   - URL Query Parameter Auth Configuration:
     ```json
     {
       "mcpServers": {
         "moul": {
           "type": "http",
           "url": "http://localhost:8090/api/mcp?adminKey=<ADMIN_SECRET_KEY>"
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
   - **Google Gemini Custom Connected Apps** (`gemini.google.com/apps`):
     - URL: `https://<your-host>/api/mcp`
     - Discovery: Automatic RFC 9728 (`/.well-known/oauth-protected-resource`) and RFC 8414 (`/.well-known/oauth-authorization-server`).
     - Registration & Authorization: Full RFC 7591 Dynamic Client Registration and RFC 7636 PKCE authorization code grant with root admin credentials or `MOUL_ADMIN_KEY`.
     - **Configuring Display Name & Mention Handle** (e.g. `@Custom Name` in Gemini):
       - Environment variable: `MOUL_APP_NAME="Custom Name"` (or `MOUL_MCP_NAME="Custom Name"`)
       - Database setting (`_settings` table): `PATCH /api/settings` with `{"app_name": "Custom Name"}`
       - CLI flag: `moul start --app-name "Custom Name"` or `moul mcp --app-name "Custom Name"`
       - Go programmatic SDK: `app.New(app.Config{AppName: "Custom Name"})` or `app.WithAppName("Custom Name")`

### Option B: REST API & OpenAPI Specification
- Live OpenAPI Spec: `http://localhost:8090/openapi.json` or `http://localhost:8090/openapi.yml`
- Swagger UI / API Docs: `http://localhost:8090/docs`

---

## 3. Server Management & CLI Commands

`moul` is distributed as a single executable binary.

```bash
# Start the HTTP server engine and MCP SSE endpoint (default port 8090)
moul start

# Start with a custom API prefix (or --api-prefix "" for root-level routes)
moul start --api-prefix /v1

# Run built-in MCP server in stdio transport mode
moul mcp

# Restore SQLite database from Litestream S3 backup
moul restore

# Update moul binary to the latest release
moul update

# Launch Bubble Tea TUI Admin Console (via moul-ctl binary)
moul-ctl -server http://localhost:8090 -admin-key test-admin-key-1234

# Or launch TUI via convenience subcommand in moul with custom API prefix:
moul ctl -server http://localhost:8090 -admin-key test-admin-key-1234 -api-prefix /v1
```

---

## 4. Environment Configuration

The engine reads environment variables from a `.env` file in the current working directory or environment environment.

| Variable | Default | Description |
|---|---|---|
| `MOUL_ENV` | `development` | Environment mode (`development` or `production`). |
| `MOUL_PORT` | `8090` | HTTP server listening port. |
| `MOUL_API_PREFIX` | `/api` | Base URL path prefix for API endpoints (set to `""` for root). |
| `MOUL_PUBLIC_URL` | `http://localhost:8090` | Base public URL for email links. |
| `MOUL_JWT_SECRET` | Required | Secret key used for signing JWT tokens. |
| `MOUL_ADMIN_KEY` | Required | Master admin key for administrative endpoints and MCP access. |
| `MOUL_DB_PATH` | `moul-local.db` | Path to the SQLite database file. |
| `MOUL_CORS_ORIGINS` | `*` (in dev) | Comma-separated list of allowed CORS origins. |
| `GEOIP_DB_PATH` | `""` | Optional path to MaxMind GeoIP2 `.mmdb` database. |
| `MOUL_TRUSTED_PROXIES` | `loopback` | Reverse proxies allowed to forward the client IP (IPs, CIDRs, `loopback`, `private`, `none`). |
| `MOUL_CLIENT_IP_HEADER` | `""` | Single-value client IP header set by the trusted edge proxy (e.g. `CF-Connecting-IP`); empty uses `X-Forwarded-For`. |
| `MOUL_FILE_URL_TTL` | `1h` | Minimum validity of signed file URLs (`?sig=`). |
| `MOUL_TOKEN_TTL` | `24h` | Lifetime of auth tokens. |
| `MOUL_ROOT_TOKEN_TTL` | `MOUL_TOKEN_TTL` | Lifetime of root user tokens. |
| `MOUL_TOKEN_REFRESH_GRACE` | `168h` | How long after expiry a token may still be refreshed (once); `0s` disables. |

---

## 5. Built-in MCP Server Tools Reference

AI Agents connected via MCP can invoke the following 17 built-in tools:

### Collection & Schema Tools
- `moul_list_collections`: List all dynamic collection schemas and tables.
- `moul_get_collection`: `{"name": "string"}` - Retrieve detailed schema fields and rules.
- `moul_create_collection`: `{"name": "string", "type": "base|auth|worker|analytic", "fields_json": "string"}` - Create table. `fields_json` accepts array of `MoulField` objects (`type`: `text`, `number`, `bool`, `date`, `datetime`, `json`, `url`, `file`, `select`, `relation`). Field names must strictly follow `camelCase` (e.g. `authorId`, `viewsCount`).
- `moul_delete_collection`: `{"name": "string"}` - Drop table and metadata.

### Record CRUD Tools
- `moul_list_records`: `{"collection": "string", "page": int, "per_page": int}` - List paginated records.
- `moul_get_record`: `{"collection": "string", "id": "string"}` - Get single record by ID.
- `moul_create_record`: `{"collection": "string", "data_json": "string"}` - Insert record (auto-generates ID formatted as `<singular_collection>-<randomID>` if unspecified; automatically stamps `createdAt` and `updatedAt`).
- `moul_update_record`: `{"collection": "string", "id": "string", "data_json": "string"}` - Update record by ID (automatically updates `updatedAt`).
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
- Owner restriction: `id = @request.auth.id` or `userId = @request.auth.id`
- RBAC role check (`users` auth collection):
  - Prevent role tampering during signup: `@request.body.role:isset = false || @request.body.role = 'public' || (@collection.users.id = @request.auth.id && @collection.users.role = 'admin')`
  - Prevent self-promotion on update: `(@collection.users.id = @request.auth.id && @collection.users.role = 'admin') || (id = @request.auth.id && @request.body.role:changed = false)`
- Downstream collection role enforcement (e.g. `posts`):
  - Public read, editor write own, admin full:
    - `list`: `status = 'published' || (@collection.users.id = @request.auth.id && (@collection.users.role = 'editor' || @collection.users.role = 'admin'))`
    - `create`: `@collection.users.id = @request.auth.id && (@collection.users.role = 'editor' || @collection.users.role = 'admin')`
    - `update`: `(@collection.users.id = @request.auth.id && @collection.users.role = 'admin') || (authorId = @request.auth.id && @collection.users.id = @request.auth.id && @collection.users.role = 'editor')`
    - `delete`: `@collection.users.id = @request.auth.id && @collection.users.role = 'admin'`

### Auth Collection Default Access Rules
When creating an `auth` collection, default access rules are automatically configured across the Web Admin Console, `moul-ctl`, and backend engine:
- `list`: `id = @request.auth.id` (restricts querying/listing to the authenticated user)
- `view`: `id = @request.auth.id` (users can only view their own record)
- `create`: `""` (empty string; allows open user registration / sign-up via `POST /api/moul/{name}/records`)
- `update`: `id = @request.auth.id` (users can only edit their own profile)
- `delete`: `id = @request.auth.id` (users can only delete their own account)

### Owner Pinning
A column the `updateRule` compares to the caller (`owner = @request.auth.id`) can only be set to the caller's own id by non-admin updates; anything else answers `403`.

### Email Visibility
The `email` of an auth record is returned only to admins and to the user themself, unless the collection defines a bool field named `emailVisibility` and the record sets it to `true`.

### Client Filter Restrictions
Client `?filter=` / `?sort=` / `?search=` values from non-admin callers may not use `@collection` or secret columns (`passwordHash`, `tokenKey`, OTP and reset columns, `oauthProviders`, the `email` of auth collections). Relation paths only match target records the caller may list, and relation sorts require a publicly listable target. See README "Security Defaults" for the full list.

### System Table Protection
All internal tables starting with `_*` (`_workers`, `_moul`, `_settings`, `_rootUsers`, `_visits`, `_requests`, `_feature_flags`, `_certmagic`, `_revoked_tokens`, `_files`, `_file_refs`) are reserved and protected against dynamic record endpoints (`/api/moul/:name/*`). Requests to dynamic record routes for system tables immediately return `404 Not Found`. Use dedicated authenticated endpoints instead (e.g. `/api/workers` for worker jobs, `/api/requests` for request logs, `/api/visits` for visitor analytics, `/api/settings` for settings, `/api/setup` / `/api/admin` for root accounts).

---

## 6a. Security Defaults

Moul ships secure by default. The behaviors below apply to every caller that is neither a root user (`_rootUsers` token) nor the admin key.

- **Admin surface**: schemas (`/api/moul`, `/api/moul/:name`, webhooks, email templates, export/import), settings, file listing and deletion, workers, retry-jobs, visits, requests, feature flag management, system metrics, the rules sandbox and MCP accept only a root user token or the admin key, and only they get collection schemas in `/openapi.json` / `/openapi.yml` (others get the static engine spec). Guests get `401` (with the OAuth discovery challenge), members of other auth collections `403`. Members keep `POST /api/upload` and `POST /api/feature-flags/:key/eval` (identity attributes and a percentage rollout's attribute are pinned to the caller and `org_id` is dropped; other attributes such as `groups` and `role` remain client-asserted, so flags are not an authorization mechanism).
- **Client IP**: forwarding headers are honored only from trusted proxies. By default only loopback is trusted (a reverse proxy or tunnel agent on the same host). A proxy in another container or on the LAN needs `MOUL_TRUSTED_PROXIES` (IPs, CIDRs, `loopback`, `private` for every private network, or `none`); use `private` only when no client can reach Moul from a private address (NAT setups such as Docker Desktop or Kubernetes SNAT). Optionally set `MOUL_CLIENT_IP_HEADER` (e.g. `CF-Connecting-IP`). Rate limits, the root IP allowlist, OTP throttling, the request log and visits all use this address.
- **Hidden records answer like missing ones**: `GET`, `PATCH` and `DELETE` on `/api/moul/:name/records/:id` check the `viewRule` first; a record the caller may not view answers `404 Record not found`, byte for byte the answer for an unknown id (`401` for both when the presented bearer token was rejected, so clients still notice an expired session). Relation targets of a create are validated only after the `createRule` passes.
- **Filters, sorts and search**: the `listRule` and `?filter=` bind their values under separate placeholders, so a filter can never rewrite the rule. Client filters may not use `@collection`, and neither filters nor sorts may reference secret columns (`passwordHash`, `tokenKey`, OTP and reset columns, `oauthProviders`, and the `email` of auth collections). Relation paths (`author.name = 'x'`) only match target records the caller may list; sorting through a relation requires a publicly listable target. Every column, including relation targets, is validated against the schema before it reaches SQL. `?search=` skips emails, and the `?after=` cursor is read under the caller's `listRule`.
- **Responses**: secrets (`passwordHash`, `tokenKey`, OTP, `resetToken`, `resetTokenExpiresAt`, `oauthProviders`, cloak blind indexes) never leave the server. The `email` of an auth record reaches only admins and the user themself, unless the collection has a bool field `emailVisibility` and the record sets it. `?expand=` applies the target collection's `viewRule`: hidden to-one targets are `null`, hidden to-many targets are omitted. Realtime events are redacted per subscriber.
- **Ownership**: a column the `updateRule` pins to the caller (`owner = @request.auth.id`) cannot be changed to anyone else on update (`403`); resending the stored value is fine. Number fields store canonical numbers; strings must be plain decimals of at most 32 bytes.
- **Files**: Moul records who uploaded each file and which record fields reference it. `/storage/<id>/<name>` is served without a signature only when a guest could view a record that references the file; otherwise it needs a `?sig=` signature (returned in record responses, expands, realtime events and the upload response, valid at least `MOUL_FILE_URL_TTL`, default `1h`), the uploader, or a caller who may view a referencing record. Anything else answers the same `404` as a missing file. With S3 enabled, `/storage` presigns a short redirect, so the bucket can be private. File field values must point to their own upload under `/storage`, and members may attach only files they uploaded (or files the record already holds).
- **Uploads**: members may not upload HTML, SVG, XML, scripts or CSS (by extension, declared or sniffed type); the `file_allowed_types` setting (e.g. `image/*,application/pdf`) narrows uploads further. Stored files are served with `X-Content-Type-Options: nosniff`, a sandboxing Content-Security-Policy, a type taken from the extension, and as an attachment unless they are images, audio or video.
- **OTP sign-in**: each issued code allows 5 guesses (then it is voided), each account 20 failures per day, and each client network (IPv4 address or IPv6 /64) 30 failures per 10 minutes; exceeding one answers `429` with `Retry-After`. Codes are compared in constant time and never logged when a mailer or worker can deliver them.

---

## 7. Web Admin Console & TanStack DevTools Architecture

The embedded Web Admin Console (`ui/`) is a Vite-powered React TypeScript application with an integrated **TanStack DevTools** ecosystem:

### Two-Context Console Authentication Architecture
- **Master Admin Key Context (Step 1)**: The user establishes connectivity and authorization using their Master Admin Key (`MOUL_ADMIN_KEY`). Prevents unauthenticated `/api/setup` 401 calls and matches the terminal UX of `moul-ctl`.
- **Root Account Context (Step 2)**: Once the Master Admin Key is verified, the user either initializes the first root administrator (`POST /api/setup`) if `needsSetup: true`, or signs in with root credentials (`POST /api/admin/login`) if `needsSetup: false`. The Master Admin Key is retained in context without redundant re-entry, and can be changed or disconnected at any time.

### Collection Creation & Schema Designer Capabilities
- **Dual-Tab Drawer Workflow**: Create collections with tabs for "General & Fields" and "API Access Rules" without leaving the dashboard.
- **Type-Based Templates**: Automatic preset field suggestions for `base`, `auth`, `worker`, and `analytic` collections.
- **Rule Autocomplete & Syntax Help**: Smart suggestions for `@request.*`, `@collection.*`, schema fields, and operators with keyboard navigation, one-click preset chips, and a full Rule Reference Modal Dialog.
- **Schema Field Validation**: Real-time validation in `FieldsBuilder` enforcing unique camelCase field names, non-reserved columns, min <= max sanity checks (both text character length and numeric values), and option requirements for select/relation fields.

### Records Data Grid & Detail Drawer Capabilities
- **Record ID Interactive Inspection**: Clicking any record ID opens a slide-over `Drawer` displaying full field attributes, relation associations, and system timestamps.
- **In-Drawer Record Modification**: Supports direct live editing of schema fields, relations (1:1, 1:N, M:N), file attachments, JSON attributes, and auth fields with instant persistence.
- **Comprehensive Field Validation**: Pre-submission and live blur validation for all field types (`text`, `number`, `bool`, `date`, `datetime`, `json`, `url`, `email`, `select`, `relation`, `file`, auth credentials) with inline error messages (`isInvalid`, `errorMessage`), constraint guidance, and payload sanitization (preventing empty numbers from coercing to 0).
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
- **SSE Scalability & Backpressure Benchmarking**: `make bench-sse` (in-process engine) and `make bench-sse-network` (HTTP/TCP) test 100, 1,000, and 10,000 connections using `cmd/sse-bench` with automated leak detection, slow-consumer backpressure verification, baseline regression checks, and interactive HTML dashboards.

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

---

## 11. Moul Schema & Naming Conventions

- **Strict camelCase Field Naming**: All collection custom field names must follow strict `camelCase` (`^[a-z][a-zA-Z0-9]*$`). Snake_case, dashes, PascalCase, and reserved words (`id`, `createdAt`, `updatedAt`, `createdat`, `updatedat`, plus auth collection credentials) are forbidden and rejected with HTTP 400.
- **System Timestamps**: System timestamps are universally standardized as `createdAt` and `updatedAt` across all tables, models, handlers, and generated client types.
- **JSON Field Tags**: All Go structs exposed via HTTP JSON APIs (such as `RateLimitRule` with `maxRequests` and `targetedUsers`, `Moul`, `Webhook`, `FileInfo`) must use `camelCase` JSON tags.
- **System Tables**: Internal engine tables use reserved underscore naming: `_moul`, `_visits`, `_requests`, `_settings`, `_rootUsers`, `_feature_flags`, `_certmagic`, `_revoked_tokens`, `_workers`.





