# moul-dev

Documentation and landing site for [moul.dev](https://moul.dev), built with [Waku](https://waku.gg) and [Fumadocs](https://fumadocs.dev).

## Internationalization (i18n)

The site supports multi-language routing configured via Fumadocs i18n:
- **English (`en`)**: Default language served without prefix at `/` and `/docs/...`.
- **Khmer (`km` - ភាសាខ្មែរ)**: Localized language served under `/km` and `/km/docs/...`.

### Content Conventions
- Documentation source files reside in `content/docs/`.
- English documents use `.mdx` (e.g., `index.mdx`) and `meta.json`.
- Khmer documents use `.km.mdx` (e.g., `index.km.mdx`) and `meta.km.json`.
- Fumadocs automatically falls back to English for documents without a `.km.mdx` counterpart.

## Development

Run development server:

```bash
bun run dev
```

Build static output:

```bash
bun run build
```

Type check and MDX validation:

```bash
bun run types:check
```

Lint and format:

```bash
bun run lint
bun run format
```
