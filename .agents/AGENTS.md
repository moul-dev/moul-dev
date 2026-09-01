# Custom Agent Rules

## Documentation Integrity & Synchronization
- **Synchronous Documentation Updates**: Always update relevant documentation (including `README.md`, API references, LLM guides such as `llms.txt` and `AGENTS.md`, OpenAPI specifications, and feature guides) whenever implementing feature changes, API additions, or relevant bugfixes.

## Go Backend Engineering Standards
- **Strict Error Handling**: Never discard errors silently using blank identifiers (`_ = ...` or `_, _ = ...`). Always check and propagate errors with `%w` wrapping (`fmt.Errorf("...: %w", err)`) or map them to structured HTTP domain responses.
- **Testing Completeness & Shared Helpers**: Every new package, service, or handler must be accompanied by comprehensive tests (`*_test.go`). Use `internal/testutil` (`testutil.NewTestDB(t)` and `testutil.NewTestServer(t)`) for all database and HTTP test setups instead of manual boilerplate.
- **SQL & Data Access Safety**: Never construct raw SQL strings with dynamic variable concatenation. Always use `safesql` validation and parameterized PocketBase `dbx` builders (`dbx.Params`, `dbx.HashExp`, `dbx.NewExp`).
- **Synchronous OpenAPI & API Documentation**: Whenever adding, modifying, or deleting HTTP endpoints in `internal/handlers/router.go`, synchronously update `docs/openapi.json` and `docs/openapi.yml`, then run `make sync-docs`.
- **Concurrency & State Safety**: Stateful services, in-memory caches, and background workers must ensure thread safety with appropriate synchronization primitives (`sync.RWMutex` / `sync.Mutex`).

## Moul UI (`@moul-dev/ui`) Standards
- **Primary UI Library**: When writing frontend React code, use components from `@moul-dev/ui` (built on React Aria Components + StyleX).
- **Global Stylesheet**: Ensure `import '@moul-dev/ui/style.css';` is included at the application root.
- **React Aria Events**: Always use `onPress` instead of `onClick` on buttons and interactive triggers.
- **State & Accessibility**: Use standard React Aria props (`isSelected`, `selectedKey`, `onSelectionChange`, `isOpen`, `onOpenChange`) and ensure all icon-only buttons have an `aria-label`.
- **Compound Structure**: Follow compound component conventions for `Card`, `Modal`, `Drawer`, `AlertDialog`, `Tabs`, `Table`, and `Sidebar`.
