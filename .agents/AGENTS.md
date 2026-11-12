# Custom Agent Rules

## Documentation Integrity & Synchronization
- **Synchronous Documentation Updates**: Always update relevant documentation (including `README.md`, API references, LLM guides such as `llms.txt` and `AGENTS.md`, OpenAPI specifications, and feature guides) whenever implementing feature changes, API additions, or relevant bugfixes.

## Versioning
- **SemVer `vMAJOR.MINOR.PATCH[-prerelease]`**: Moul and `@moul-dev/web-component` share one scheme, starting at `v1.0.0-alpha.1`. `major` for breaking API or default changes, `minor` for new API, `patch` for fixes; while in alpha, `BUMP=prerelease` advances the counter. Take the next tag from `make next-version BUMP=…` (rules in `internal/semver`) instead of writing one by hand.

## Go Backend Engineering Standards
- **Strict Error Handling**: Never discard errors silently using blank identifiers (`_ = ...` or `_, _ = ...`). Always check and propagate errors with `%w` wrapping (`fmt.Errorf("...: %w", err)`) or map them to structured HTTP domain responses.
- **Testing Completeness & Shared Helpers**: Every new package, service, or handler must be accompanied by comprehensive tests (`*_test.go`). Use `internal/testutil` (`testutil.NewTestDB(t)` and `testutil.NewTestServer(t)`) for all database and HTTP test setups instead of manual boilerplate.
- **SQL & Data Access Safety**: Never construct raw SQL strings with dynamic variable concatenation. Always use `safesql` validation and parameterized PocketBase `dbx` builders (`dbx.Params`, `dbx.HashExp`, `dbx.NewExp`).
- **Synchronous OpenAPI & API Documentation**: Whenever adding, modifying, or deleting HTTP endpoints in `internal/handlers/router.go`, synchronously update `docs/openapi.json` and `docs/openapi.yml`, then run `make sync-docs`.
- **Concurrency & State Safety**: Stateful services, in-memory caches, and background workers must ensure thread safety with appropriate synchronization primitives (`sync.RWMutex` / `sync.Mutex`).

## Moul UI (`@moul-dev/web-component`) Standards
- **Web Components, Not React**: `@moul-dev/web-component` ships `<moul-*>` custom elements built with Lit 3, Shadow DOM, and a native CSS token layer. Write the tags (`<moul-button>`), never PascalCase components (`<Button>`). The console (`ui/`) is Lit with no React; `bun run build` fails if React, React Aria, StyleX, or `@lit/react` appear in `ui/package.json` (`ui/scripts/verify-no-react.ts`).
- **Registration & Tokens**: `import '@moul-dev/web-component'` once registers every element (`ui/src/main.ts`), and `@moul-dev/web-component/style.css` loads the token layer (`ui/src/index.css`). The package has no other entry points (no `/react`, `/tokens`, or `/tokens.stylex`).
- **Lit Bindings**: Boolean state is a kebab-case presence attribute (`?is-disabled=${…}`, `?is-open=${…}`); arrays, objects, and functions are properties (`.columns=${…}`, `.data=${…}`, `.valueFormatter=${…}`); events are DOM events (`@press`, `@change`, `@input`, `@openchange`, `@selectionchange`) with payloads on `event.detail`. There is no `onPress` prop.
- **Buttons**: `<moul-button>` fires `press` once per activation and never while `is-disabled` or `is-pending`, so bind `@press=${…}`. Older console call sites use `@click=${onPress(…)}` (`ui/src/lib/press.ts`), which behaves the same.
- **Overlays & Forms**: Toggle `is-open` on `<moul-modal>`, `<moul-drawer>`, `<moul-alert-dialog>`, and `<moul-popover>`, and react to `openchange` (`detail.isOpen`). Inputs are form-associated: give each a `name` and read the native `<form>` with `FormData`. Enter already submits from text, number, and search fields, so add no Enter handler.
- **Composition**: Build compound widgets from child elements and slots, not props: `<moul-card>` with `<moul-card-header|body|footer>`, `<moul-tabs>` with `<moul-tab slot="tab">` and `<moul-tab-panel>` matched by `key`, `<moul-select>` with `<moul-select-item>`.
- **Tones, Variants & Accessibility**: Color comes from `tone` (`primary | accent | success | warning | error`), surface treatment from `variant`; omit `variant` for a neutral surface. Icon-only buttons (`is-icon`) and dot badges (`is-dot`) need an `aria-label`.
- **Full Reference**: The `moul-ui` skill (`.agents/skills/moul-ui/`) holds the library's rules, recipes, and per-element API. Refresh it from a moul-dev/ui checkout with `make sync-ui-skill` (`UI_REPO`, default `../ui`); never edit it by hand.

## Moul Schema & Naming Conventions
- **Strict camelCase Field Naming**: All collection custom field names must follow strict `camelCase` (`^[a-z][a-zA-Z0-9]*$`). Snake_case, dashes, PascalCase, and reserved words (`id`, `createdAt`, `updatedAt`, `createdat`, `updatedat`, plus auth collection credentials) are forbidden.
- **System Timestamps**: System timestamps are universally standardized as `createdAt` and `updatedAt`.
- **JSON Field Tags**: All Go structs exposed via HTTP JSON APIs (such as `RateLimitRule`, `Moul`, `Webhook`, `FileInfo`) must use `camelCase` JSON tags (e.g. `maxRequests`, `targetedUsers`, `createdAt`, `updatedAt`).

