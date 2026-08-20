# Custom Agent Rules

## Documentation Integrity & Synchronization
- **Synchronous Documentation Updates**: Always update relevant documentation (including `README.md`, API references, LLM guides such as `llms.txt` and `AGENTS.md`, OpenAPI specifications, and feature guides) whenever implementing feature changes, API additions, or relevant bugfixes.

## Moul UI (`@moul-dev/ui`) Standards
- **Primary UI Library**: When writing frontend React code, use components from `@moul-dev/ui` (built on React Aria Components + StyleX).
- **Global Stylesheet**: Ensure `import '@moul-dev/ui/style.css';` is included at the application root.
- **React Aria Events**: Always use `onPress` instead of `onClick` on buttons and interactive triggers.
- **State & Accessibility**: Use standard React Aria props (`isSelected`, `selectedKey`, `onSelectionChange`, `isOpen`, `onOpenChange`) and ensure all icon-only buttons have an `aria-label`.
- **Compound Structure**: Follow compound component conventions for `Card`, `Modal`, `Drawer`, `AlertDialog`, `Tabs`, `Table`, and `Sidebar`.

