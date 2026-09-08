# Custom Binary Embedding with Web Admin Console

This example demonstrates how to embed Moul as a Go library inside your own custom binary while retaining full access to the Web Admin Console.

## Features Included

- **Automatic Admin Console**: The production-ready Web Admin Console (TanStack Router, StyleX, React Aria) is embedded directly into your binary via `pkg/ui.DistFS()`.
- **Zero Node.js / Bun Requirement**: Pre-built static assets are bundled inside `github.com/moul-dev/moul-dev/pkg/ui/dist`, so you can build with standard `go build`.
- **Safe Route Prefixing**: Mounted by default at `/_moul_/` without capturing `/admin`, preventing route collision with your host application.
- **Customizable**:
  - Customize URL prefix: `.WithAdminPrefix("/dashboard")`
  - Replace with your own frontend SPA: `.WithAdminUI(customFS)`
  - Disable entirely for headless API services: `.DisableAdminUI()`
  - Enable `/admin` convenience redirect: `.WithAdminRedirect(true)`

## Running the Example

```bash
# From repository root
MOUL_ENV=development go run examples/custom-binary/main.go
```

Then visit:
- **Web Admin Console**: [http://localhost:8090/\_moul\_/](http://localhost:8090/_moul_/)
- **Custom API Endpoint**: [http://localhost:8090/api/custom/hello](http://localhost:8090/api/custom/hello)
- **API Documentation**: [http://localhost:8090/docs](http://localhost:8090/docs)
