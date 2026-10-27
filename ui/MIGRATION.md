# Admin Console: React → Web Components

`@moul-dev/ui` 2026.10.27 dropped its React build. It now ships `<moul-*>` custom elements
(Lit 3, Shadow DOM, a CSS token layer) and removed the `@moul-dev/ui/react`, `/tokens` and
`/tokens.stylex` entry points. This console was built on the old React build plus React 19,
TanStack Router/Query, StyleX and `@phosphor-icons/react`. This document tracks its rebuild
without React. Delete it in the final phase.

## Stack

| Concern | Before | After |
| :--- | :--- | :--- |
| Components | React function components | Lit 3 `LitElement`s, prefix `admin-` |
| Library | `import { Button } from '@moul-dev/ui'` | `<moul-button>`; `import '@moul-dev/ui'` once |
| Styling | StyleX + `tokens.stylex` | Lit `css` per element, `var(--token)` from `@moul-dev/ui/style.css` |
| Routing | TanStack Router (file-based) | `src/lib/router.ts`: History API, `/_moul_` base, auth guard, lazy pages |
| Server state | TanStack React Query | `@tanstack/query-core` behind `QueryController` / `MutationController` (`src/lib/query.ts`) |
| App state | React context (auth, theme) | `Store` singletons + `StoreController` (`src/lib/store.ts`) |
| Icons | `@phosphor-icons/react` | `@phosphor-icons/webcomponents` (`<ph-*>`, registered in `src/icons.ts`) |
| Devtools | TanStack Devtools + React panel | `src/devtools/events.ts` on `EventTarget`; inspector panel rebuilt in Phase 6 |

Elements follow the library's authoring style: `static properties` plus `declare` fields, no
decorators. `npm run build` runs `scripts/verify-no-react.ts`, which fails on any React,
StyleX or React-ecosystem dependency.

## Porting conventions

- `useQuery({ queryKey, queryFn, ... })` → `new QueryController(this, () => ({ queryKey, queryFn, ... }))`.
  The options callback runs on every update, so keys may read reactive properties.
- `useMutation({...})` → `new MutationController(this, {...})`; `.mutate()` / `.mutateAsync()` as before.
- `queryClient.invalidateQueries(...)` → the `queryClient` exported by `src/lib/query.ts`.
- `useNavigate()` / `<Link to>` → `router.navigate(path, { search })` / `<a href=${router.href(path)}>`.
- `useParams()` / `useSearch()` → `this.route.params` / `this.route.search` from a `RouteController`.
- `onPress` on `<Button>` → `@click=${onPress(() => …)}` (`src/lib/press.ts`), **not** `@press`:
  2026.10.27's `<moul-button>` fires `press` twice per mouse click, so toggles flip back and
  mutations repeat. `onPress` uses the native `click` and skips disabled or pending buttons.
- `onChange={setX}` on fields → `@input=${(e) => (this.x = fieldValue(e))}` (`src/lib/forms.ts`).
- Tables → `<admin-data-table>` (`src/components/data-table.ts`) with `render` per column;
  `<moul-table>` can only print strings. Cell templates render in the table's shadow root, so use
  its `.mono` / `.muted` / `.small` / `.nowrap` classes or inline styles.
- Pickers: prefer `<moul-select>` over `<moul-combobox>` unless typing to filter matters. The
  combobox does not show a preset `selected-key`'s text, and after a selection it lists only the
  selected item when reopened.
- Page layout → `pageStyles` and `pageHeader(title, subtitle, actions)` from `src/styles/page.ts`.
- Badge/Alert/Toast `variant="success"` → `tone="success"`; old `variant="info"` → `tone="primary"`.
  There is no neutral tone; for the old `variant="neutral"` badge try `variant="bordered"`.
- `<Card variant="default">` → `<moul-card>` with **no** `variant`: that is the neutral surface. Any
  `variant` (including `shadow` and `glass`) paints the card in its `tone`.
- `toastQueue.add({ title, description, variant })` → `toast.success|error|info(title, description)` from `src/lib/toast.ts`.
- Start every element's `styles` with `baseStyles` (`src/styles/base.ts`). `index.css` does not reach
  into shadow roots, so without it `width: 100%` plus padding overflows.
- Forms of `<moul-text-field>`s: add `@keydown=${submitOnEnter}` (`src/lib/forms.ts`) to the `<form>`;
  the field's `<input>` lives in a shadow root, so Enter would not submit otherwise.
- Library events bubble and are `composed`. A listener on an ancestor also hears its descendants'
  `selectionchange`, `openchange` and `collapsechange`; check `event.target === event.currentTarget`.
- Icons: `<admin-icon name="kebab-name" size="16" weight="fill">`. Register each new icon and weight in
  `src/icons.ts`; an unregistered one renders nothing and warns in dev.

## Phases

The old `.tsx` files stay in the tree as the reference for what is left; `tsconfig.json`
excludes them and nothing imports them. Each phase deletes the files it ports and replaces the
route's placeholder in `src/routes.ts`.

- [x] **Phase 1: Foundation and shell.** Toolchain, router, query/store controllers, theme, auth,
  toasts, devtools event bus, `<admin-app>`, sidebar layout, header, mobile tab bar and drawer,
  theme toggle, logo, login and setup pages, placeholders for every other route.
- [x] **Phase 2: Dashboard pages.** `overview`, `analytics`, `realtime`, `docs`, plus
  `<admin-data-table>` and the shared page styles.
- [ ] **Phase 3: Collections.** `collections/index`, `collections/$moulName`, `FieldsBuilder`,
  `RulesEditor`, `RuleDocsModal`.
- [ ] **Phase 4: Records.** `records/$moulName`, `ImportModal`, `ExportModal`.
- [ ] **Phase 5: System.** `settings`, `workers`, `flags`.
- [ ] **Phase 6: Finish.** Dev-only inspector panel, drop the `.tsx` exclude and any leftovers,
  rebuild and commit `pkg/ui/dist` (`make ui-check-sync`), update Makefile and README, browser QA
  on desktop and mobile in light and dark themes, delete this file.

Phases 2 to 5 are independent of each other once Phase 1 is in: each touches its own pages and
one entry in `src/routes.ts`.
