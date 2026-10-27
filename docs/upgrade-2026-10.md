# Moul October Release: Embedder Upgrade Guide

Moul v2026.10.0 closes a set of security holes found by an embedding app, cuts Moul's fixed cost per request, and adds Go hooks for programmatic writes. Several defaults change for non-admin callers, so work through the upgrade checklist before you deploy.

## Upgrade checklist

This release does not migrate existing databases, so start from a fresh database; everything else is a code or configuration change in your app.

- [ ] **Reset development databases.** Files uploaded before the upgrade are not tracked and are served only to admins; re-upload them.
- [ ] **Call admin endpoints with admin credentials.** Schemas, settings, webhooks, email templates, export and import, workers, file listing and deletion, visits, requests, feature-flag management, system metrics, the rules sandbox and MCP now need the admin key or a `_rootUsers` token. Members of other collections get 403.
- [ ] **Set `MOUL_TRUSTED_PROXIES` if your reverse proxy is not on the same host** (another container, a LAN load balancer, Tailscale). Otherwise every client shares the proxy's IP for rate limits.
- [ ] **Treat 404 as "missing or not visible".** Hidden records now answer exactly like missing ones; a rejected or expired token gets 401 for both, so session-expiry handling keeps working.
- [ ] **Add a bool field `emailVisibility` to auth collections whose emails should be public.** Other users' emails are now hidden by default.
- [ ] **Check `?expand=` on user relations.** Expanded records follow the target's view rule; auth collections default to `id = @request.auth.id`, so other users expand to `null` until you relax that rule.
- [ ] **Move privileged queries server-side.** Client filters can no longer use `@collection`, secret columns or the email of auth collections, and relation filters only match rows the caller may list.
- [ ] **Store file fields exactly as `POST /api/upload` returns them.** Members may attach only their own uploads; external links belong in a `url` field.
- [ ] **Refetch records for fresh file URLs and make S3 buckets private.** Files of records guests cannot view are served through signed URLs that expire.
- [ ] **Handle 429 on OTP sign-in and 413 on image uploads** (see Security changes).
- [ ] **Pick token lifetimes** with `MOUL_TOKEN_TTL` and `MOUL_TOKEN_REFRESH_GRACE` if 24 hours and 7 days do not suit your app.

## Security changes

Every change below applies to callers that are neither a root user nor the admin key; admins keep full access.

| Area | Before | Now |
| --- | --- | --- |
| Admin routes | Any signed-in member of any auth collection could manage schemas, settings, webhooks, workers, files, flags and MCP; `GET /api/moul` and the live OpenAPI spec were public | Admin key or `_rootUsers` token only; guests get 401, members 403; guests get the static OpenAPI spec without collections or rules |
| Client IP | The first `X-Forwarded-For` entry, chosen by the client, keyed rate limits and the root IP allowlist | Forwarding headers are honored only from trusted proxies (loopback by default); optional single-value header such as `CF-Connecting-IP` |
| `?filter=` and the list rule | A filter's values could overwrite the list rule's, exposing rows the rule hid | Rule and filter bind values separately; the rule always applies |
| `?filter=` reach | `@collection` could read other tables, system tables included; relation paths read hidden rows | `@collection` refused in client filters; relation paths only match target rows the caller may list |
| `?sort=` | A sort on a related field reached SQL unchecked | Every column is checked against the schema and quoted |
| Secret columns | Filters, sorts and search could probe password hashes, tokens and emails | Refused with 400; search skips emails |
| Record responses | `resetToken`, `resetTokenExpiresAt` and `oauthProviders` returned; every user's email visible | Secrets never leave the server; email visible to its owner, admins, or everyone when `emailVisibility` is true |
| `?expand=` | Expanded records ignored the target's rules | Hidden to-one targets are `null`, hidden to-many targets are left out |
| Record existence | Hidden records answered 401/403, missing ones 404 | Both answer 404; relation targets are checked only after the create rule passes |
| Ownership | An owner could hand a record to another user | A column the update rule pins with `= @request.auth.id` cannot be changed to someone else (403); resending the stored value is fine |
| Number fields | Any string the parser accepted was stored as text | Plain decimals of at most 32 bytes, stored as numbers |
| File fields | Any JSON, including other users' files and external links | File objects pointing to `/storage/<id>/…`; members attach only their own uploads |
| `/storage/*` | Any file served to anyone with its URL | Unsigned only when a guest could view a record using it; otherwise a signed `?sig=` URL; everything else answers like a missing file; S3 served through presigned redirects |
| Uploads | Any type, served from the API's own origin (HTML or SVG could run script) | Members cannot upload HTML, SVG, XML, scripts or CSS; files served with `nosniff`, a sandboxing CSP, and as downloads unless media; images over 40 MP get 413 |
| OTP sign-in | Unlimited guesses at a 6-digit code; codes written to the log | 5 guesses per code (then voided), 20 failures per account per day, 30 per network per 10 minutes, 429 with `Retry-After` and a `reason` naming the spent budget (`code`: request a new code; `account` or `network`: wait); codes not logged when deliverable |
| Token refresh | Any expired token, however old, could be refreshed repeatedly | Within 7 days of expiry and only once; logout revokes for the token's whole refreshable life |
| Realtime | Events carried emails, and a record leaving a subscriber's view was sent in its new, hidden form | Events are redacted per subscriber; the removal event carries the last visible version |
| Feature-flag evaluation | Members could evaluate a flag as any user | Identity attributes come from the token; `groups` and `role` stay client-asserted, so flags are not an authorization tool |

## Performance changes

Moul's fixed cost per request drops mainly because signed-in requests and polls no longer touch SQLite for auth, visits and schemas.

| Area | Change | Control |
| --- | --- | --- |
| SQLite connections | Busy timeout, WAL, `synchronous` and foreign keys apply to every pooled connection, and idle connections are kept instead of reopened | `MOUL_DB_MAX_CONNS` (default max(4, CPU count)) |
| Write transactions | Every transaction takes the write lock before its first read, so read-then-write no longer fails with "database is locked"; jobs are claimed in one statement; the sign-in email enqueue retries while SQLite is busy | `app.WriteTx` for your own read-then-write code |
| Request log | Can be turned off, sampled or narrowed; each batch is one transaction | `request_log_*` settings |
| Revoked tokens | Checked in memory instead of one query per request; changes from other processes are picked up within 60 s | none |
| Visits | Requests that cannot keep the visit cookie (API clients, server-side rendering, probes) are logged without creating a visit row; known visits are cached | none |
| Collection schemas | Cached in process; `/moul/*` requests and the worker poll no longer re-read and parse them; outside changes are picked up within 1 s | none |
| Photo pipeline | Image processing is limited in parallel, uses a cheaper resize filter (about half the CPU of Lanczos on a 12 MP photo), refuses images over 40 MP before decoding, and returns `width` and `height` | `MOUL_IMAGE_CONCURRENCY`, `file_thumbs_async` |

## New Go APIs

Record hooks run for every record write, over HTTP or from Go, so notifications and side effects live in one place. Register them before `Bootstrap`:

```go
a.OnRecordBeforeCreate(func(e *app.RecordEvent) error {
	// e.Record holds the values about to be stored; change them or return an error to refuse.
	// Return an *echo.HTTPError to choose the status (400 otherwise).
	return nil
}, "posts")

a.OnRecordAfterCreate(func(e *app.RecordEvent) error {
	// e.Record is the stored record; e.Auth is the caller (nil for admins and Go code).
	return notifyFollowers(e.Context, e.Record)
}, "posts", "comments")
```

`OnRecordBefore{Create,Update,Delete}` and `OnRecordAfter{Create,Update,Delete}` take the collections to watch (none means all).

`app.Records()` writes through the same pipeline as the HTTP API (validation, rules, webhooks, realtime events, file tracking and hooks). It acts as admin; `AsUser` applies the collection rules as that user:

```go
post, err := a.Records().Create(ctx, "posts", map[string]interface{}{"title": "Hi", "author": userID})

alice, err := a.Records().AsUser("users", "alice")
page, err := alice.List(ctx, "posts", url.Values{"filter": {"status = 'draft'"}})
```

Writes your code makes with raw SQL or in its own transaction can be announced after commit, so hooks, webhooks and realtime subscribers see them. This replaces hand-written notifications and client polling:

```go
err := a.Records().Notify(ctx, app.RecordCreate, "notifications", id, nil)
err = a.Records().Notify(ctx, app.RecordDelete, "notifications", id, deletedRecord)
```

`app.WriteTx` runs a read-then-write transaction that holds the write lock from the start and retries while SQLite is busy:

```go
err := a.WriteTx(func(tx *dbx.Tx) error {
	// read, then write, using tx only
	return nil
})
```

Token lifetime is configurable: `app.WithTokenTTL(30 * 24 * time.Hour)`, per collection with `app.WithCollectionTokenTTL("users", d)`, and the refresh grace with `app.WithTokenRefreshGrace(d)`.

Collection schemas are cached in process. Collections your `OnBeforeStart` hooks define by writing `_moul` directly are served from the first request; after a raw `_moul` write at any other time, call `a.InvalidateSchemaCache()`, or the change is picked up within a second.

## New configuration

| Name | Kind | Default | Purpose |
| --- | --- | --- | --- |
| `MOUL_TRUSTED_PROXIES` | env | `loopback` | Proxies allowed to forward the client IP: IPs, CIDRs, `loopback`, `private` (every private network), or `none` |
| `MOUL_CLIENT_IP_HEADER` | env | unset (`X-Forwarded-For`) | Single-value client IP header set by your edge proxy, such as `CF-Connecting-IP` |
| `MOUL_FILE_URL_TTL` | env | `1h` | Minimum validity of signed file URLs |
| `MOUL_TOKEN_TTL` | env | `24h` | Lifetime of auth tokens |
| `MOUL_ROOT_TOKEN_TTL` | env | `MOUL_TOKEN_TTL` | Lifetime of root user tokens |
| `MOUL_TOKEN_REFRESH_GRACE` | env | `168h` | How long after expiry a token may still be refreshed, once (`0s` disables) |
| `MOUL_DB_MAX_CONNS` | env | max(4, CPU count) | SQLite connection pool size |
| `MOUL_IMAGE_CONCURRENCY` | env | half the CPUs | Images processed in parallel |
| `file_allowed_types` | setting | empty (all but active content) | MIME types members may upload, such as `image/*,application/pdf` |
| `file_thumbs_async` | setting | `false` | Generate image sizes in a background job |
| `request_log_enabled` | setting | `true` | Turn the request log on or off |
| `request_log_sample_rate` | setting | `1` | Share of requests logged (0 to 1) |
| `request_log_exclude_paths` | setting | empty | Extra path prefixes not logged |
| `request_log_retention_days` | setting | `30` | Days request rows are kept |
| `visit_retention_days` | setting | `30` | Days visit rows are kept |

## Workarounds you can delete

If your app added guards around Moul, these are now covered by Moul itself.

| If your app… | Moul now… |
| --- | --- |
| Configures every SQLite connection with a driver hook | Applies the settings to every pooled connection |
| Takes a write lock before read-then-write transactions | Starts every transaction with the write lock; use `app.WriteTx` |
| Gives cookieless API calls a shared visit id | Skips visits for requests that cannot keep the cookie |
| Strips forged admin-key headers or query parameters | Rejects keys in the query string and checks the header in constant time |
| Blocks members from admin routes | Allows only the admin key and root users there |
| Rewrites `?filter=` to include the list rule | Keeps the rule's values separate from the filter's |
| Removes hidden records from `expand` | Applies the target's view rule to expands |
| Strips emails and reset tokens from responses | Redacts them for every caller but the owner and admins |
| Answers hidden records like missing ones | Answers 404 for both |
| Pins owner fields or bounds field values on writes | Pins owner columns and stores numbers and file values canonically |
| Gates `/storage/*` by record visibility, or blocks HTML and SVG uploads | Gates files with record references and signed URLs, and blocks active content |
| Throttles OTP guesses | Limits guesses per code, per account and per network |
| Writes notifications by hand and polls for changes | Runs record hooks and realtime events for Go writes (`Records`, `Notify`) |

## Known limits

- No database migrations: upgrading an existing database in place is not supported in this release.
- A client-chosen record `id` on create still reveals whether that id already exists.
- Feature-flag attributes other than identity (such as `groups` and `role`) are supplied by the client.
