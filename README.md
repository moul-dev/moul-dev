# Moul

![Device OAuth Demo](assets/device-oauth-demo.png)

`mould` is a lightweight, self-contained dynamic database, authentication, and background job processing engine in Go, inspired by PocketBase and Elixir's Oban.

---

## Table of Contents

- [Key Features](#key-features)
- [Technical Stack](#technical-stack)
- [Local Development Guide](#local-development-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Run Local Server](#run-local-server)
  - [Live Reloading (Hot Reload)](#live-reloading-hot-reload)
  - [Local S3 Storage (MinIO)](#local-s3-storage-minio)
  - [Testing & Verification Flows](#testing--verification-flows)
- [Documentation & API Specification (`/docs`)](#documentation--api-specification-docs)
  - [Interactive Runtime `/docs` Endpoint](#interactive-runtime-docs-endpoint)
  - [OpenAPI Specification Files](#openapi-specification-files)
  - [Embedded OpenAPI Spec in Go](#embedded-openapi-spec-in-go)
- [Moul TUI Admin Console (`moul`)](#moul-tui-admin-console-moul)
  - [Overview](#overview)
  - [Build and Run](#build-and-run)
  - [Connection Setup & Config Storage](#connection-setup--config-storage)
  - [TUI Features & Capabilities](#tui-features--capabilities)
  - [Keyboard Controls Guide](#keyboard-controls-guide)
- [Programmatic Go API](#programmatic-go-api)
  - [1. Register and Start Worker Engine](#1-register-and-start-worker-engine)
  - [2. Enqueue Job Programmatically from Go](#2-enqueue-job-programmatically-from-go)
  - [3. Programmatic Analytics API](#3-programmatic-analytics-api)
- [Worker Engine Architecture & Operations](#worker-engine-architecture--operations)
- [Access Rules & Filters Syntax](#access-rules--filters-syntax)
- [Deployment Information](#deployment-information)
  - [Single-Binary Production Build](#single-binary-production-build)
  - [Production Environment Variables](#production-environment-variables)
  - [Litestream Automated S3 Backup & Disaster Recovery](#litestream-automated-s3-backup--disaster-recovery)
  - [Systemd Service Deployment Example](#systemd-service-deployment-example)

---

## Key Features

1. **Dynamic Moul (Tables)**: Create, list, update, and delete database tables and schemas at runtime via HTTP API or TUI.
2. **Dynamic Record CRUD**: Perform complete CRUD operations on any dynamic moul using raw JSON payloads governed by HCL-like authorization rules.
3. **Multi-Factor & Modern Auth**: Built-in support for Password, Email OTP, WebAuthn Passkeys, and OAuth2 Device Flow.
4. **Rule Authorization Engine**: Enforce robust access rules (e.g. `@request.auth.id != ""` or `@collection.user_roles.user_id = @request.auth.id`) dynamically, featuring datetime macros, field modifiers, wildcard matching, and database helper functions.
5. **Background Worker Engine**: High-performance, SQLite-backed asynchronous background job processor (inspired by Elixir's Oban) with queue priorities, automatic retries with exponential backoffs, and immediate dispatch triggers.
6. **Single Binary SQLite**: Driven by `github.com/pocketbase/dbx` and the CGO-free `modernc.org/sqlite` driver for lightweight, zero-configuration local development and deployment.
7. **First-Party Analytics & Session Tracking**: Create `analytic` moul that automatically track events and sessions. Parses client headers (IP, User-Agent, Referrer, UTM parameters) to resolve browser, OS, device, referring domain, and marketing campaign parameters, including optional MaxMind GeoIP2 resolution.
8. **Default Request Tracking**: All HTTP requests are automatically tracked via a global middleware. Visitor sessions are deduplicated in `_visits`, and per-request data (method, path, status code, response time) is batch-inserted asynchronously into `_requests` for zero-latency-impact observability.
9. **TUI Admin Console**: Full-featured Terminal User Interface (TUI) built with Charm's Bubble Tea to manage schemas, records, worker queues, analytics, email templates, and system settings without requiring a browser.
10. **Feature Flags & OpenFeature SDK**: Integrated OpenFeature Go SDK provider with multi-level gate targeting (master boolean switches, actor overrides, dynamic group rules, and deterministic percentage rollouts) backed by SQLite storage and fast thread-safe in-memory caching.
11. **Telegraf Host System Monitoring**: High-performance Unix Domain Socket listener (`/tmp/moul-telegraf.sock`) receiving metric streams (CPU, memory, disk space, network, system load) from Telegraf for real-time observability in the TUI console and REST API.
12. **Outbound HTTP Webhooks**: Configure outbound HTTP webhooks per collection with granular event triggers (`create:before`, `create:after`, `update:before`, `update:after`, `delete:before`, `delete:after`, or wildcard `*`). Supports synchronous before-hooks that can reject/abort database operations on error, asynchronous background after-hooks, and HMAC-SHA256 payload signature verification (`X-Moul-Signature`).
13. **Built-in MCP Server**: Native Model Context Protocol (MCP) server providing AI agents (Claude Desktop, Cursor, custom assistants) full inspection and control over collections, record CRUD, background workers, feature flags, and system metrics via stdio (`mould mcp`) and HTTP SSE (`/api/mcp`).

---

## Technical Stack

- **HTTP Framework**: [Echo v5](https://echo.labstack.com)
- **Feature Flag SDK**: [OpenFeature Go SDK](https://github.com/open-feature/go-sdk) (with `fun_with_flags` gate engine)
- **Host System Monitoring**: [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) over Unix Domain Sockets (JSON over UDS stream)
- **Database Abstraction**: [pocketbase/dbx](https://github.com/pocketbase/dbx)
- **SQLite Driver**: [modernc.org/sqlite](https://github.com/modernc/sqlite) (Pure Go, CGO-free)
- **TUI Framework**: [Charm Bubble Tea](https://github.com/charmbracelet/bubbletea), [Bubbles](https://github.com/charmbracelet/bubbles), [Lip Gloss](https://github.com/charmbracelet/lipgloss)
- **Expression Engine**: [expr-lang/expr](https://github.com/expr-lang/expr)
- **JWT Handling**: [golang-jwt/jwt](https://github.com/golang-jwt/jwt)
- **Database Replication / Backup**: [Litestream](https://litestream.io/) (Embedded Go S3 replication)
- **Structured Logging**: Standard library `log/slog`

---

## Local Development Guide

### Prerequisites

- **Go**: Version 1.26 or higher
- **Air** *(Optional, for live reload)*: Install via `go install github.com/air-verse/air@latest` or `brew install air`
- **MinIO & MinIO Client (`mc`)** *(Optional, for local S3 testing)*: `brew install minio minio-client` on macOS

### Environment Configuration

The engine reads environment variables from a `.env` file in the project root if present. Default environment setup for local development:

```env
MOUL_ENV=development
MOUL_PORT=8090
MOUL_JWT_SECRET=test-secret-key-for-unit-tests-1234
MOUL_ADMIN_KEY=test-admin-key-1234
MOUL_DB_PATH=moul-local.db
```

### Run Local Server

Start the Echo HTTP server and background worker engine on port `:8090` (this automatically creates or opens the local SQLite database file `moul-local.db`):

```bash
make run
# Or directly via Go:
go run cmd/mould/main.go start
```

### Live Reloading (Hot Reload)

For active local development with instant code recompilation on change:

```bash
make dev
# Runs air using .air.toml
```

### Local Telegraf Host System Monitoring

To stream live host metrics (CPU %, Memory %, Disk space, System load, Network I/O) into `mould` and view them in the `moul` TUI console:

1. **Install Telegraf** *(macOS via Homebrew)*:
   ```bash
   brew install telegraf
   ```

2. **Start Telegraf agent** *(in a separate terminal window while `make run` is active)*:
   ```bash
   make telegraf
   # Or directly:
   telegraf --config assets/telegraf.conf
   ```

Once Telegraf connects to `/tmp/moul-telegraf.sock`, the status badge in the TUI System Monitor view automatically changes to `🟢 TELEGRAF SOCKET ACTIVE`.

### Local S3 Storage (MinIO)

For testing file uploads and Litestream database backups locally against an S3 API:

1. **Start MinIO server**:
   ```bash
   make minio-start
   ```
   Starts MinIO server storing data in `tmp/minio` (Console available at [http://localhost:9001](http://localhost:9001), credentials: `minioadmin` / `minioadmin`).

2. **Configure MinIO Client (`mc`)**:
   In a separate terminal, register the `moul-local` alias:
   ```bash
   make minio-setup
   ```

3. **Create Storage Buckets**:
   ```bash
   mc mb moul-local/moul-bucket
   mc mb moul-local/moul-litestream
   ```

### Testing & Verification Flows

`mould` includes unit tests, integration tests, and automated cURL verification flows.

#### 1. Unit & Integration Tests
```bash
# Run all Go package tests
make test-go

# Run tests with code coverage output
make test-coverage

# Run TUI tests
make test-tui
```

#### 2. Automated cURL Flow Scripts
Ensure the server is running (`make run`) in a separate terminal before executing flow tests:

- **Verify Dynamic CRUD, Auth, and Rules Enforcement**:
  ```bash
  make test-flow
  ```
- **Verify Asynchronous Background Worker Queue**:
  ```bash
  make test-worker
  ```
- **Verify First-Party Analytics and Visit Resolution**:
  ```bash
  make test-analytics
  ```

---

## Documentation & API Specification (`/docs`)

`mould` maintains an accurate OpenAPI 3.0 specification serving interactive API documentation directly from the running engine.

### Interactive Runtime `/docs` Endpoint

When the server is running (`make run`), interactive API documentation is accessible in your browser:

- **Scalar API Reference (Default)**: [http://localhost:8090/docs](http://localhost:8090/docs)
- **Swagger UI**: [http://localhost:8090/docs?ui=swagger](http://localhost:8090/docs?ui=swagger)

### OpenAPI Specification Files

The OpenAPI spec is available in both YAML and JSON formats for exporting to Postman, Insomnia, or API SDK generator tools:

- **YAML Spec**: [http://localhost:8090/openapi.yml](http://localhost:8090/openapi.yml) (or `/docs/openapi.yml`)
- **JSON Spec**: [http://localhost:8090/openapi.json](http://localhost:8090/openapi.json) (or `/docs/openapi.json`)
- **Repository File**: [`docs/openapi.yml`](docs/openapi.yml)

### Embedded OpenAPI Spec in Go

The specification file is embedded into the compiled binary via Go's `//go:embed openapi.yml` directive in [`docs/docs.go`](docs/docs.go). This ensures single-binary deployments serve live API docs without requiring external static asset files.

### Extensibility & Custom Workers

- **Worker Extensibility Guide**: [`docs/worker-extensibility.md`](docs/worker-extensibility.md) - Learn how to build custom `mould` binaries with custom background job handlers and periodic tasks using `pkg/app`.
- **Example Binary**: [`examples/custom-worker/main.go`](examples/custom-worker/main.go) - A runnable code example of an embedded Mould application.

---

## Moul TUI Admin Console (`moul`)

### Overview

`moul` comes with a modern, self-contained Terminal User Interface (TUI) built with Charm's **Bubble Tea** ecosystem (`bubbletea`, `bubbles`, `lipgloss`). It provides full administration over your engine directly from the command line without opening a browser.

![TUI Demo](assets/device-oauth-demo.png)

### Build and Run

#### Run via Go
```bash
make tui
# Or:
go run cmd/moul/main.go
```

#### Build Compiled TUI Binary
```bash
make build-tui
./bin/moul
```

### Connection Setup & Config Storage

On initial startup, `moul` prompts for connection credentials:
1. **Server URL**: Server address (defaults to `http://localhost:8090`).
2. **Admin Key**: The security key configured on the server (`MOUL_ADMIN_KEY`).

Credentials and connection state are securely saved to `~/.config/moul.json` (with fallback to system keyring where available) for automatic re-connection on subsequent launches.

### TUI Features & Capabilities

- **Dashboard**: High-level system overview displaying collection counters, active workers, visit statistics, and quick system links.
- **Collection Schema Management**: Create new collections (`base`, `auth`, `worker`, `analytic`), add/remove fields, choose field types, and write HCL access control rules.
- **Dynamic Record CRUD Console**: Browse collection records with pagination, inspect JSON payloads, add new records, edit existing records, and delete records.
- **Background Workers Monitor**: Real-time view of background job queues (`executing`, `available`, `completed`, `discarded`). Inspect job parameters, view error stack traces, force-retry failed jobs (`r`), or discard jobs (`c`).
- **Analytics & Visits Observatory**: Authenticate user credentials (`l`) to inspect live site visit logs (`_visits`) including OS, browser, device type, resolved GeoIP location, landing page, and UTM campaign tracking parameters.
- **Email Templates Editor**: Customize transactional email templates (OTP verification, Password Reset) per auth collection and send live test emails.
- **System Settings Panel**: Configure server SMTP/email delivery providers (Amazon SES, Resend, Mailgun, SendGrid, Cloudflare, Console), CORS policy, rate limits, and storage options.

### Keyboard Controls Guide

| Screen | Key | Action |
| :--- | :--- | :--- |
| **Global** | `ctrl+c` | Exit program |
| **Connection Screen** | `Tab` / `Shift+Tab` | Navigate inputs |
| | `Enter` | Connect to server |
| **Dashboard** | `↑`/`↓` or `k`/`j` | Navigate collections and options |
| | `Enter` / `l` / `→` | Open selected item |
| | `r` | Refresh schema list from server |
| | `Esc` | Disconnect and return to login screen |
| **Record List** | `↑`/`↓` or `k`/`j` | Scroll record list |
| | `Enter` / `v` | Inspect detailed JSON payload |
| | `n` | Create new record |
| | `e` | Edit selected record |
| | `d` | Delete selected record |
| | `r` | Refresh record list |
| | `Esc` / `h` / `←` | Back to dashboard |
| **Worker Monitor** | `↑`/`↓` or `k`/`j` | Scroll job queue |
| | `Enter` / `v` | View job details & stack trace |
| | `r` | Force-retry failed job |
| | `c` | Discard/cancel job |
| | `f` | Refresh worker status |
| | `Esc` | Back to dashboard |
| **Analytics Console** | `l` | Log in user to retrieve JWT token |
| | `↑`/`↓` or `k`/`j` | Scroll visit logs |
| | `Enter` / `v` | View visit metadata & UTM details |
| | `f` | Refresh visits |
| | `Esc` | Back to dashboard |

---

## Programmatic Go API

In addition to HTTP endpoints, backend processing and custom background worker tasks can be implemented programmatically in Go.

### 1. Register and Start Worker Engine

```go
import (
	"context"
	"github.com/moul-dev/moul-dev/internal/worker"
)

// 1. Initialize worker engine
workerEngine := worker.NewEngine(dbConn)

// 2. Register custom execution handler
workerEngine.Register("SendEmail", func(ctx context.Context, job *worker.Job) error {
	to := job.Args["to"].(string)
	subject := job.Args["subject"].(string)
	
	// Execute custom background logic...
	println("Sending email to " + to)
	return nil
})

// 3. Start processing loop with context cancellation
ctx, cancel := context.WithCancel(context.Background())
defer cancel()
workerEngine.Start(ctx)
defer workerEngine.Stop() // Gracefully awaits running tasks to complete
```

### 2. Enqueue Job Programmatically from Go

```go
jobOpts := map[string]interface{}{
	"worker": "SendEmail",
	"priority": 1,
	"args": map[string]interface{}{
		"to": "user@example.com",
		"subject": "System Alert",
	},
}

job, err := workerEngine.Enqueue(context.Background(), "background_tasks", jobOpts)
```

### 3. Programmatic Analytics API

```go
import (
	"context"
	"github.com/moul-dev/moul-dev/internal/analytics"
)

params := &analytics.EventParams{
	VisitToken:   "visit-123",
	VisitorToken: "visitor-456",
	Name:         "payment_completed",
	Properties: map[string]interface{}{
		"amount": 99.9,
	},
}

event, err := analyticsEngine.Track(context.Background(), "events", params)
```

---

## Built-in Model Context Protocol (MCP) Server

`mould` includes a built-in MCP server powered by `github.com/mark3labs/mcp-go`. This allows AI assistants (Claude Desktop, Cursor, AI agents) to inspect, query, and manage your dynamic database, background jobs, feature flags, and host metrics.

### Transport Modes

1. **Stdio Transport Mode (`mould mcp`)**: Runs directly as a CLI subcommand over standard input/output.
2. **HTTP SSE Mode (`/api/mcp`)**: Enabled automatically on `mould start`. Requires `X-Admin-Key` or `Authorization: Bearer <MOUL_ADMIN_KEY>`.

### Integration Examples

#### Claude Desktop Configuration (`claude_desktop_config.json`)

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

### Available MCP Tools

| MCP Tool Name | Description |
|---|---|
| `moul_list_collections` | List all dynamic collection schemas and tables |
| `moul_get_collection` | Get detailed field schema and rules for a collection |
| `moul_create_collection` | Create a new dynamic collection schema and SQLite table |
| `moul_delete_collection` | Delete a collection and drop its physical table |
| `moul_list_records` | Query paginated records from any collection |
| `moul_get_record` | Retrieve a single record by ID |
| `moul_create_record` | Insert a new dynamic record |
| `moul_update_record` | Update an existing record |
| `moul_delete_record` | Delete a record by ID |
| `moul_list_worker_jobs` | List background jobs by status/queue |
| `moul_enqueue_job` | Enqueue a new background job |
| `moul_cancel_job` | Cancel a pending or retryable worker job |
| `moul_list_feature_flags` | List all feature flags and gate rules |
| `moul_set_feature_flag` | Create or update a feature flag |
| `moul_get_system_metrics` | Fetch host CPU, Memory, Disk, and Load metrics |
| `moul_get_analytics_summary` | Fetch visitor and request analytics totals |
| `moul_list_requests` | Query recent HTTP request logs |

---

## Outbound HTTP Webhooks

Moul collections support outbound HTTP webhooks registered per collection to enable integrations with external automation tools and services.

### Event Triggers & Hook Lifecycles

- **`*:before` Hooks** (`create:before`, `update:before`, `delete:before`): Executed **synchronously** before physical database operations. If the target webhook returns a non-2xx HTTP status code or fails to respond within 5s timeout, the record operation is rejected and an error is returned to the client.
- **`*:after` Hooks** (`create:after`, `update:after`, `delete:after`): Executed **asynchronously** in the background after successful database operations without delaying client response latency.
- **Wildcard & Shorthand Matching**: Setting event `"create"` matches both `create:before` and `create:after`. Setting `"*"`, `""`, or `"all"` matches all events.

### Payload & Signature Format

Outbound webhook POST requests include the following headers and payload:
- `Content-Type: application/json`
- `X-Moul-Event`: Event trigger name (e.g. `create:before`)
- `X-Moul-Webhook-ID`: Unique webhook ID
- `X-Moul-Timestamp`: Event RFC3339 timestamp
- `X-Moul-Signature`: HMAC-SHA256 hex digest of payload body computed using the configured `secret` key.

**JSON Payload**:
```json
{
  "event": "update:after",
  "moul": "products",
  "record": { "id": "prod-123", "name": "Widget Updated", "price": 49.99 },
  "old_record": { "id": "prod-123", "name": "Widget", "price": 39.99 },
  "timestamp": "2026-07-31T19:54:08Z"
}
```

### Webhook Management Endpoints

- `GET /api/moul/:name/webhooks` - List all webhooks for a collection.
- `POST /api/moul/:name/webhooks` - Create a new webhook for a collection.
- `GET /api/moul/:name/webhooks/:id` - Get webhook configuration by ID.
- `PATCH /api/moul/:name/webhooks/:id` - Update webhook configuration by ID.
- `DELETE /api/moul/:name/webhooks/:id` - Remove a webhook by ID.
- `POST /api/moul/:name/webhooks/:id/test` - Trigger a ping test payload (`event: "ping"`) to verify webhook receiver connectivity.

---

## Worker Engine Architecture & Operations

- **State Transitions**: Jobs navigate states (`available` -> `executing` -> `completed` / `discarded`). Historical execution records are retained for metric inspections.
- **Failures & Exponential Backoffs**: If a job handler returns an error or panics, the engine logs error details, increments `attempt`, and reschedules execution with an exponential backoff (`(attempt^2 * 10) + 10` seconds + jitter) until reaching `max_attempts` (default: 20), after which it transitions to `discarded`.
- **Immediate Dispatch**: Enqueuing a job via HTTP or Go API immediately signals the worker engine over an in-memory channel, executing available jobs without waiting for polling tickers.
- **Graceful Shutdown**: On OS interrupt signals (`SIGINT`/`SIGTERM`), worker fetching halts immediately while existing running task handlers are given a graceful timeout to finish execution cleanly.

---

## Access Rules & Filters Syntax

Each Moul (table) supports five HCL-like expression rules evaluated on client API requests:
- `listRule` - Restricts records returned in collection list queries.
- `viewRule` - Controls access to view a single record by ID.
- `createRule` - Validates fields/permissions before record insertion.
- `updateRule` - Validates current record fields and incoming values before update.
- `deleteRule` - Validates permissions before record deletion.

### Rule Expression Syntax Reference

- **Request Context Variables**: `@request.auth.id`, `@request.body.fieldName`, `@request.headers.header_name`, `@request.query.paramName`, `@request.method`
- **Operators**: `=`, `!=`, `>`, `>=`, `<`, `<=`, `~` (LIKE/contains), `!~` (NOT LIKE)
- **Wildcard Array Modifiers**: `?=` (e.g. `allowed_users.id ?= @request.auth.id`)
- **Field Modifiers**: `:lower`, `:length`, `:isset`, `:changed`, `:each`
- **Helper Functions**: `geoDistance(lonA, latA, lonB, latB)`, `strftime(format, timeVal)`
- **Cross-Collection Join Queries**: `@collection.user_roles.user_id = @request.auth.id && @collection.user_roles.role = 'admin'`

---

## Deployment Information

### Single-Binary Production Build

`mould` compiles into a single, self-contained binary containing the HTTP engine, worker processor, embedded web docs, and CGO-free SQLite database driver.

To build the production binary with stripped debug symbols and version metadata:

```bash
make build
# Creates executable at bin/mould
```

### Production Environment Variables

Set the following environment variables on your production server or container:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `MOUL_ENV` | Yes | Application environment mode | `production` |
| `MOUL_ADMIN_KEY` | Yes | Master administrative secret key | `super-secret-admin-key-9988` |
| `MOUL_JWT_SECRET` | Yes | Secret key for signing JWT tokens | `jwt-secret-key-production-3344` |
| `MOUL_PORT` | No | HTTP listening port (default: 8090) | `8090` |
| `MOUL_PUBLIC_URL` | No | Base public URL for email links (default: http://localhost:8090) | `https://api.myapp.com` |
| `MOUL_DB_PATH` | No | Path to SQLite database file | `/var/lib/moul/moul.db` |
| `MOUL_CORS_ORIGINS` | No | Allowed CORS origins (comma-separated) | `https://myapp.com,https://admin.myapp.com` |
| `GEOIP_DB_PATH` | No | Path to MaxMind GeoIP2 `.mmdb` database | `/var/lib/moul/GeoLite2-City.mmdb` |

### Litestream Automated S3 Backup & Disaster Recovery

`mould` includes built-in [Litestream](https://litestream.io/) replication directly in the binary for real-time, point-in-time SQLite replication to S3-compatible cloud storage (AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces).

#### Enabling Replication in Production

To enable background replication, set the following environment variables before running `mould start`:

```env
LITESTREAM_ENABLED=true
LITESTREAM_S3_BUCKET=my-moul-backups
LITESTREAM_ACCESS_KEY_ID=YOUR_AWS_OR_S3_ACCESS_KEY
LITESTREAM_SECRET_ACCESS_KEY=YOUR_AWS_OR_S3_SECRET_KEY
LITESTREAM_REGION=us-east-1
# Optional for S3-compatible services (MinIO, R2, Cloudflare, DigitalOcean):
LITESTREAM_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
LITESTREAM_S3_FORCE_PATH_STYLE=false
```

When enabled, `mould` automatically streams SQLite Write-Ahead Log (WAL) changes to S3 asynchronously with zero downtime.

#### Database Disaster Recovery / Restore

To restore a database state from S3 backup onto a new server:

```bash
# Run restore command using the same Litestream S3 env configuration
./bin/mould restore
# Or via Makefile:
make restore
```

### Systemd Service Deployment Example

For VPS deployments (Ubuntu/Debian), create a systemd service at `/etc/systemd/system/moul.service`:

```ini
[Unit]
Description=Moul Dynamic Database & Engine
After=network.target

[Service]
Type=simple
User=moul
Group=moul
WorkingDirectory=/var/lib/moul
ExecStart=/usr/local/bin/mould start
Restart=always
RestartSec=5
Environment=MOUL_ENV=production
Environment=MOUL_ADMIN_KEY=your-production-admin-key
Environment=MOUL_JWT_SECRET=your-production-jwt-secret
Environment=MOUL_DB_PATH=/var/lib/moul/moul.db
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now moul
```
