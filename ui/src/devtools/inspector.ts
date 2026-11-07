import type { Query } from '@tanstack/query-core';
import lightning from '@phosphor-icons/core/regular/lightning.svg?raw';
import signpost from '@phosphor-icons/core/regular/signpost.svg?raw';
import stack from '@phosphor-icons/core/regular/stack.svg?raw';
import terminalWindow from '@phosphor-icons/core/regular/terminal-window.svg?raw';
import { css, html, LitElement, nothing } from 'lit';
import { registerIcons } from '../icons';
import { onPress } from '../lib/press';
import { queryClient } from '../lib/query';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { baseStyles } from '../styles/base';
import { emitAppAction, emitSystemPing, type MoulDevtoolsEvent, moulDevtoolsClient } from './events';

// The dev-only Moul Inspector: the console's event bus, the query cache and the router, in a
// panel docked to the bottom of the window. main.ts loads this module only under `vite dev`,
// so none of it reaches the production bundle. It replaces the TanStack devtools shell and
// its Router, Query and Moul Inspector panels.

registerIcons({
  lightning: { regular: lightning },
  signpost: { regular: signpost },
  stack: { regular: stack },
  'terminal-window': { regular: terminalWindow },
});

type Tab = 'events' | 'queries' | 'router';
type EventType = MoulDevtoolsEvent['type'];

interface LoggedEvent {
  id: string;
  event: MoulDevtoolsEvent;
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'events', label: 'Events', icon: 'lightning' },
  { key: 'queries', label: 'Queries', icon: 'stack' },
  { key: 'router', label: 'Router', icon: 'signpost' },
];

const FILTERS: { key: 'all' | EventType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'auth:state-change', label: 'Auth' },
  { key: 'api:request', label: 'API' },
  { key: 'app:action', label: 'Action' },
  { key: 'system:ping', label: 'System' },
];

const EVENT_ICONS: Record<EventType, { icon: string; color: string }> = {
  'auth:state-change': { icon: 'shield-check', color: 'var(--color-success-500)' },
  'api:request': { icon: 'globe', color: 'var(--color-primary-500)' },
  'app:action': { icon: 'lightning', color: 'var(--color-warning-500)' },
  'system:ping': { icon: 'broadcast', color: 'var(--color-chart-4)' },
};

const EVENT_LIMIT = 100;
const STORAGE_KEY = 'moul_devtools';

function summary(event: MoulDevtoolsEvent): string {
  switch (event.type) {
    case 'auth:state-change':
      return event.payload.isAuthenticated ? `Authenticated (${event.payload.user?.username || 'admin'})` : 'Guest / Logged Out';
    case 'api:request':
      return `${event.payload.method} ${event.payload.url} (${event.payload.status}) ${event.payload.durationMs}ms`;
    case 'app:action':
      return `${event.payload.action} [${event.payload.category}]`;
    case 'system:ping':
      return event.payload.message;
  }
}

const time = (timestamp: number) => (timestamp ? new Date(timestamp).toLocaleTimeString() : '—');
const json = (value: unknown) => JSON.stringify(value, null, 2) ?? 'undefined';

function queryTone(query: Query): string {
  if (query.state.fetchStatus === 'fetching') return 'primary';
  if (query.state.status === 'error') return 'error';
  if (query.state.status === 'pending') return 'warning';
  return query.isStale() ? 'warning' : 'success';
}

function queryLabel(query: Query): string {
  if (query.state.fetchStatus === 'fetching') return 'fetching';
  if (query.state.fetchStatus === 'paused') return 'paused';
  if (query.state.status !== 'success') return query.state.status;
  return query.isStale() ? 'stale' : 'fresh';
}

function loadPrefs(): { open: boolean; tab: Tab } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { open: saved.open === true, tab: TABS.some((t) => t.key === saved.tab) ? saved.tab : 'events' };
  } catch {
    return { open: false, tab: 'events' };
  }
}

export class AdminDevtools extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        position: fixed;
        inset-inline-end: var(--spacing-4);
        bottom: var(--spacing-4);
        z-index: 60;
        font-family: var(--font-family-base);
        font-size: var(--font-size-sm);
        color: var(--color-fg);
      }

      :host([open]) {
        inset-inline: 0;
        bottom: 0;
      }

      @media (max-width: 767px) {
        :host(:not([open])) {
          bottom: calc(58px + env(safe-area-inset-bottom, 0px) + var(--spacing-3));
        }
      }

      .fab {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-full);
        background-color: var(--color-bg-elevated);
        color: var(--color-primary-500);
        box-shadow: var(--shadow-lg);
        cursor: pointer;
        outline: none;
      }

      .fab:hover {
        background-color: var(--color-bg-subtle);
      }

      .fab:focus-visible {
        box-shadow: var(--focus-ring);
      }

      .panel {
        display: flex;
        flex-direction: column;
        height: min(45vh, 480px);
        min-height: 280px;
        background-color: var(--color-bg-elevated);
        border-top: 1px solid var(--color-border-subtle);
        box-shadow: var(--shadow-lg);
      }

      header,
      .toolbar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2) var(--spacing-3);
        padding: var(--spacing-2) var(--spacing-3);
        border-bottom: 1px solid var(--color-border-subtle);
      }

      .title {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        font-weight: 600;
      }

      .tab-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .spacer {
        flex: 1;
      }

      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-1) var(--spacing-4);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .stats b {
        font-family: var(--font-mono);
        font-weight: 600;
        color: var(--color-fg);
      }

      .body {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(260px, 380px) minmax(0, 1fr);
      }

      .list {
        overflow-y: auto;
        border-inline-end: 1px solid var(--color-border-subtle);
      }

      .detail {
        overflow: auto;
        padding: var(--spacing-3);
      }

      @media (max-width: 767px) {
        .panel {
          height: 70vh;
        }

        .body {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
        }

        .list {
          border-inline-end: none;
          border-bottom: 1px solid var(--color-border-subtle);
        }
      }

      .row {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
        padding: var(--spacing-2) var(--spacing-3);
        border: none;
        border-bottom: 1px solid var(--color-border-subtle);
        border-inline-start: 3px solid transparent;
        background: none;
        color: inherit;
        font: inherit;
        text-align: start;
        cursor: pointer;
        outline: none;
      }

      .row:hover {
        background-color: var(--color-bg-subtle);
      }

      .row:focus-visible {
        box-shadow: inset var(--focus-ring);
      }

      .row[aria-current='true'] {
        background-color: var(--color-bg-subtle);
        border-inline-start-color: var(--color-primary-500);
      }

      .row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        min-width: 0;
      }

      .row-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .mono,
      .row-detail {
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
      }

      .row-detail,
      .muted {
        color: var(--color-fg-subtle);
      }

      .row-detail,
      .ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .detail-head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        margin-bottom: var(--spacing-3);
      }

      .detail-head .title {
        min-width: 0;
      }

      .label {
        margin: var(--spacing-3) 0 var(--spacing-1);
        font-size: var(--font-size-xs);
        font-weight: 600;
        color: var(--color-fg-subtle);
      }

      pre {
        margin: 0;
        padding: var(--spacing-3);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .empty {
        padding: var(--spacing-6);
        text-align: center;
        color: var(--color-fg-subtle);
        font-size: var(--font-size-xs);
      }

      dl {
        display: grid;
        grid-template-columns: max-content minmax(0, 1fr);
        gap: var(--spacing-1) var(--spacing-4);
        margin: 0;
      }

      dt {
        color: var(--color-fg-subtle);
        font-size: var(--font-size-xs);
      }

      dd {
        margin: 0;
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        word-break: break-all;
      }
    `,
  ];

  static override properties = {
    open: { type: Boolean, reflect: true },
    tab: { state: true },
    filter: { state: true },
    events: { state: true },
    selectedEventId: { state: true },
    selectedQueryHash: { state: true },
  };

  declare open: boolean;
  declare tab: Tab;
  declare filter: 'all' | EventType;
  declare events: LoggedEvent[];
  declare selectedEventId: string | null;
  declare selectedQueryHash: string | null;

  private nextId = 0;
  private unsubscribeEvents?: () => void;
  private unsubscribeQueries?: () => void;

  constructor() {
    super();
    const prefs = loadPrefs();
    this.open = prefs.open;
    this.tab = prefs.tab;
    this.filter = 'all';
    // The bus kept what happened before this module loaded (boot, first auth check, requests).
    this.events = moulDevtoolsClient.history.map((event) => this.log(event));
    this.selectedEventId = null;
    this.selectedQueryHash = null;
    new StoreController(this, router);
  }

  private log(event: MoulDevtoolsEvent): LoggedEvent {
    this.nextId += 1;
    return { id: String(this.nextId), event };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.unsubscribeEvents = moulDevtoolsClient.onAll((event) => {
      this.events = [this.log(event), ...this.events.slice(0, EVENT_LIMIT - 1)];
    });
    // Query state changes on every fetch; repaint only while that tab is showing.
    this.unsubscribeQueries = queryClient.getQueryCache().subscribe(() => {
      if (this.open && this.tab === 'queries') this.requestUpdate();
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeEvents?.();
    this.unsubscribeQueries?.();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('open') || changed.has('tab')) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ open: this.open, tab: this.tab }));
      } catch {
        // Storage can be unavailable (private mode); the panel just won't remember its state.
      }
    }
  }

  // ── Events ───────────────────────────────────────────────────────────────

  private renderEvents() {
    const visible = this.filter === 'all' ? this.events : this.events.filter((e) => e.event.type === this.filter);
    const selected = visible.find((e) => e.id === this.selectedEventId) ?? visible[0];
    const api = this.events.flatMap((e) => (e.event.type === 'api:request' ? [e.event.payload] : []));
    const latency = api.length ? Math.round(api.reduce((sum, p) => sum + p.durationMs, 0) / api.length) : 0;
    const auth = this.events.find((e) => e.event.type === 'auth:state-change')?.event;

    return html`
      <div class="toolbar">
        <moul-toggle-button-group
          selected-key=${this.filter}
          aria-label="Event filter"
          @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
            if (e.target === e.currentTarget && e.detail.selectedKey) this.filter = e.detail.selectedKey as typeof this.filter;
          }}
        >
          ${FILTERS.map((f) => html`<moul-toggle-button value=${f.key} size="sm">${f.label}</moul-toggle-button>`)}
        </moul-toggle-button-group>
        <span class="stats">
          <span>Events <b>${this.events.length}</b></span>
          <span>API calls <b>${api.length}</b></span>
          <span>Avg latency <b>${latency}ms</b></span>
          <span>Auth <b>${auth?.type === 'auth:state-change' ? (auth.payload.isAuthenticated ? 'logged in' : 'logged out') : '—'}</b></span>
        </span>
        <span class="spacer"></span>
        <moul-button
          size="sm"
          variant="secondary"
          @click=${onPress(() =>
            emitAppAction({
              action: 'devtools:test-trigger',
              category: 'custom',
              details: { message: 'Simulated runtime action from the inspector', filter: this.filter },
            }),
          )}
        >
          <admin-icon slot="prefix" name="play" size="12" weight="fill"></admin-icon>
          Emit Action
        </moul-button>
        <moul-button size="sm" variant="secondary" @click=${onPress(() => emitSystemPing(`Ping at ${new Date().toLocaleTimeString()}`))}>
          <admin-icon slot="prefix" name="broadcast" size="12"></admin-icon>
          Ping
        </moul-button>
        <moul-button
          size="sm"
          variant="ghost"
          @click=${onPress(() => {
            this.events = [];
            moulDevtoolsClient.history.length = 0;
          })}
        >
          <admin-icon slot="prefix" name="trash" size="12"></admin-icon>
          Clear
        </moul-button>
      </div>
      <div class="body">
        <div class="list" role="list">
          ${visible.length === 0
            ? html`<div class="empty">No events yet. Use the console, or press Emit Action.</div>`
            : visible.map((item) => {
                const { icon, color } = EVENT_ICONS[item.event.type];
                return html`
                  <button
                    class="row"
                    role="listitem"
                    aria-current=${String(item === selected)}
                    @click=${() => (this.selectedEventId = item.id)}
                  >
                    <span class="row-head">
                      <span class="row-title">
                        <admin-icon name=${icon} size="14" color=${color}></admin-icon>
                        <span class="ellipsis">${item.event.type}</span>
                      </span>
                      <span class="mono muted">${time(item.event.payload.timestamp)}</span>
                    </span>
                    <span class="row-detail">${summary(item.event)}</span>
                  </button>
                `;
              })}
        </div>
        <div class="detail">
          ${selected
            ? html`
                <div class="detail-head">
                  <span class="title">
                    <admin-icon name=${EVENT_ICONS[selected.event.type].icon} size="16" color=${EVENT_ICONS[selected.event.type].color}></admin-icon>
                    ${selected.event.type}
                  </span>
                  <moul-badge size="sm" tone="primary">${new Date(selected.event.payload.timestamp).toISOString()}</moul-badge>
                </div>
                <pre>${json(selected.event.payload)}</pre>
              `
            : html`<div class="empty">Select an event to inspect its payload.</div>`}
        </div>
      </div>
    `;
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  private renderQueries() {
    const queries = [...queryClient.getQueryCache().getAll()].sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt);
    const selected = queries.find((q) => q.queryHash === this.selectedQueryHash) ?? queries[0];
    const filters = (query: Query) => ({ queryKey: query.queryKey, exact: true });
    const count = (label: string) => queries.filter((q) => queryLabel(q) === label).length;

    return html`
      <div class="toolbar">
        <span class="stats">
          <span>Queries <b>${queries.length}</b></span>
          <span>Fresh <b>${count('fresh')}</b></span>
          <span>Stale <b>${count('stale')}</b></span>
          <span>Fetching <b>${count('fetching')}</b></span>
          <span>Errors <b>${count('error')}</b></span>
        </span>
        <span class="spacer"></span>
        <moul-button size="sm" variant="secondary" @click=${onPress(() => queryClient.invalidateQueries())}>
          <admin-icon slot="prefix" name="arrows-clockwise" size="12"></admin-icon>
          Invalidate All
        </moul-button>
      </div>
      <div class="body">
        <div class="list" role="list">
          ${queries.length === 0
            ? html`<div class="empty">The query cache is empty.</div>`
            : queries.map(
                (query) => html`
                  <button
                    class="row"
                    role="listitem"
                    aria-current=${String(query === selected)}
                    @click=${() => (this.selectedQueryHash = query.queryHash)}
                  >
                    <span class="row-head">
                      <span class="row-title mono ellipsis">${query.queryHash}</span>
                      <moul-badge size="sm" tone=${queryTone(query)}>${queryLabel(query)}</moul-badge>
                    </span>
                    <span class="row-detail">
                      ${query.getObserversCount()} observer${query.getObserversCount() === 1 ? '' : 's'} · updated
                      ${time(query.state.dataUpdatedAt)}
                    </span>
                  </button>
                `,
              )}
        </div>
        <div class="detail">
          ${selected
            ? html`
                <div class="detail-head">
                  <span class="title mono ellipsis">${selected.queryHash}</span>
                  <moul-badge size="sm" tone=${queryTone(selected)}>${queryLabel(selected)}</moul-badge>
                  <span class="spacer"></span>
                  <moul-button size="sm" variant="secondary" @click=${onPress(() => queryClient.refetchQueries(filters(selected)))}>
                    Refetch
                  </moul-button>
                  <moul-button size="sm" variant="secondary" @click=${onPress(() => queryClient.invalidateQueries(filters(selected)))}>
                    Invalidate
                  </moul-button>
                  <moul-button size="sm" variant="ghost" @click=${onPress(() => queryClient.removeQueries(filters(selected)))}>
                    Remove
                  </moul-button>
                </div>
                <dl>
                  <dt>Status</dt>
                  <dd>${selected.state.status} / ${selected.state.fetchStatus}</dd>
                  <dt>Observers</dt>
                  <dd>${selected.getObserversCount()}</dd>
                  <dt>Updated</dt>
                  <dd>${time(selected.state.dataUpdatedAt)}</dd>
                  <dt>Fetches</dt>
                  <dd>${selected.state.dataUpdateCount}</dd>
                </dl>
                ${selected.state.error
                  ? html`<div class="label">Error</div><pre>${String(selected.state.error)}</pre>`
                  : nothing}
                <div class="label">Data</div>
                <pre>${json(selected.state.data)}</pre>
              `
            : html`<div class="empty">Select a query to inspect its data.</div>`}
        </div>
      </div>
    `;
  }

  // ── Router ───────────────────────────────────────────────────────────────

  private renderRouter() {
    const { pathname, search, params, route } = router.location;
    return html`
      <div class="body">
        <div class="list" role="list">
          ${router.routes.map((r) => {
            const isStatic = !r.path.includes(':');
            return html`
              <button
                class="row"
                role="listitem"
                aria-current=${String(r === route)}
                ?disabled=${!isStatic}
                title=${isStatic ? `Go to ${r.path}` : 'Has parameters; open it from the console'}
                @click=${() => isStatic && router.navigate(r.path)}
              >
                <span class="row-head">
                  <span class="row-title mono">${r.path}</span>
                  ${r.layout === 'bare' ? html`<moul-badge size="sm" variant="bordered">bare</moul-badge>` : nothing}
                </span>
                <span class="row-detail">${r.redirect ? `→ ${r.redirect}` : `<${r.tag}>`}</span>
              </button>
            `;
          })}
        </div>
        <div class="detail">
          <dl>
            <dt>Pathname</dt>
            <dd>${pathname}</dd>
            <dt>Route</dt>
            <dd>${route?.path ?? '—'}</dd>
            <dt>Element</dt>
            <dd>${route?.tag ? `<${route.tag}>` : '—'}</dd>
            <dt>URL</dt>
            <dd>${router.href(pathname, search)}</dd>
          </dl>
          <div class="label">Params</div>
          <pre>${json(params)}</pre>
          <div class="label">Search</div>
          <pre>${json(Object.fromEntries(search))}</pre>
        </div>
      </div>
    `;
  }

  override render() {
    if (!this.open) {
      return html`
        <button class="fab" title="Moul Inspector (dev only)" aria-label="Open Moul Inspector" @click=${() => (this.open = true)}>
          <admin-icon name="terminal-window" size="20"></admin-icon>
        </button>
      `;
    }
    return html`
      <section class="panel" aria-label="Moul Inspector">
        <header>
          <span class="title">
            <admin-icon name="terminal-window" size="16" color="var(--color-primary-500)"></admin-icon>
            Moul Inspector
          </span>
          <moul-badge size="sm" variant="bordered">dev only</moul-badge>
          <moul-toggle-button-group
            selected-key=${this.tab}
            aria-label="Inspector panel"
            @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
              if (e.target === e.currentTarget && e.detail.selectedKey) this.tab = e.detail.selectedKey as Tab;
            }}
          >
            ${TABS.map(
              (t) => html`
                <moul-toggle-button value=${t.key} size="sm">
                  <span class="tab-label"><admin-icon name=${t.icon} size="14"></admin-icon>${t.label}</span>
                </moul-toggle-button>
              `,
            )}
          </moul-toggle-button-group>
          <span class="spacer"></span>
          <moul-button size="sm" variant="ghost" is-icon aria-label="Close Moul Inspector" @click=${onPress(() => (this.open = false))}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </header>
        ${this.tab === 'events' ? this.renderEvents() : this.tab === 'queries' ? this.renderQueries() : this.renderRouter()}
      </section>
    `;
  }
}

if (!customElements.get('admin-devtools')) customElements.define('admin-devtools', AdminDevtools);

declare global {
  interface HTMLElementTagNameMap {
    'admin-devtools': AdminDevtools;
  }
}

document.body.append(document.createElement('admin-devtools'));
