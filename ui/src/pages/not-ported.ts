import { css, html, LitElement } from 'lit';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { baseStyles } from '../styles/base';

// Temporary: routes whose React page has not been rebuilt yet. Remove this element, and its
// entries in src/routes.ts, as each phase of ui/MIGRATION.md lands.
const PENDING: Record<string, { title: string; phase: number; source: string }> = {
  '/overview': { title: 'Overview', phase: 2, source: 'routes/_auth/overview.tsx' },
  '/analytics': { title: 'Analytics', phase: 2, source: 'routes/_auth/analytics.tsx' },
  '/realtime': { title: 'Realtime Hub', phase: 2, source: 'routes/_auth/realtime.tsx' },
  '/docs': { title: 'API Reference', phase: 2, source: 'routes/_auth/docs.tsx' },
  '/collections': { title: 'Collections', phase: 3, source: 'routes/_auth/collections/index.tsx' },
  '/collections/:moulName': { title: 'Collection', phase: 3, source: 'routes/_auth/collections/$moulName.tsx' },
  '/records/:moulName': { title: 'Records', phase: 4, source: 'routes/_auth/records/$moulName.tsx' },
  '/settings': { title: 'Settings', phase: 5, source: 'routes/_auth/settings.tsx' },
  '/workers': { title: 'Worker Queue', phase: 5, source: 'routes/_auth/workers.tsx' },
  '/flags': { title: 'Feature Flags', phase: 5, source: 'routes/_auth/flags.tsx' },
};

export class AdminNotPortedPage extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        max-width: var(--content-max-width, 1200px);
        width: 100%;
      }
      code {
        font-family: var(--font-family-mono);
        font-size: 0.8125rem;
      }
  `,
  ];

  constructor() {
    super();
    new StoreController(this, router);
  }

  override render() {
    const entry = PENDING[router.location.route?.path ?? ''];
    return html`
      <moul-empty-state variant="bordered">
        <admin-icon slot="icon" name="squares-four" size="28"></admin-icon>
        <span slot="title">${entry?.title ?? 'Page'} is being rebuilt</span>
        <span slot="description">
          This page moves to web components in Phase ${entry?.phase ?? '?'} of <code>ui/MIGRATION.md</code>.
          The React source is <code>ui/src/${entry?.source ?? ''}</code>.
        </span>
      </moul-empty-state>
    `;
  }
}

customElements.define('admin-not-ported-page', AdminNotPortedPage);
