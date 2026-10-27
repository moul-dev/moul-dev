import { css, html, LitElement, nothing } from 'lit';
import { router } from '../../lib/router';
import { MediaQueryController, StoreController } from '../../lib/store';
import { logoIcon } from './logo';
import { baseStyles } from '../../styles/base';

/** Top bar: breadcrumb for the current page and the engine/auth status badges. */
export class AdminHeader extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        width: 100%;
        max-width: var(--content-max-width, 1200px);
        transition: max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;
      }

      header {
        height: 48px;
        background-color: var(--color-bg-subtle);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-inline: var(--spacing-4);
      }

      .left {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
        overflow: hidden;
      }

      .mobile-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-fg);
        flex-shrink: 0;
        margin-right: 2px;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        flex-shrink: 0;
      }

      .badge-content {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      @media (max-width: 767px) {
        header {
          padding-inline: var(--spacing-3);
        }
        .actions {
          gap: 4px;
        }
      }
    `,
  ];

  private readonly mobile = new MediaQueryController(this, '(max-width: 767px)');

  constructor() {
    super();
    new StoreController(this, router);
  }

  override render() {
    const isMobile = this.mobile.matches;
    const segments = router.location.pathname.split('/').filter(Boolean);
    const currentTitle =
      segments.length > 0
        ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Overview';

    return html`
      <header>
        <div class="left">
          ${isMobile
            ? html`<a class="mobile-logo" href=${router.href('/overview')} aria-label="moul.dev Home">${logoIcon(24)}</a>`
            : nothing}
          <moul-breadcrumbs aria-label="Breadcrumbs">
            <moul-breadcrumb-item href=${router.href('/overview')}>moul</moul-breadcrumb-item>
            <moul-breadcrumb-item is-current>${currentTitle}</moul-breadcrumb-item>
          </moul-breadcrumbs>
        </div>

        <div class="actions">
          <moul-badge tone="primary">
            <span class="badge-content" title="Engine Online">
              <admin-icon name="cpu" size="13"></admin-icon>
              ${isMobile ? nothing : html`<span>Engine Online</span>`}
            </span>
          </moul-badge>
          <moul-badge tone="success">
            <span class="badge-content" title="Root Auth">
              <admin-icon name="shield-check" weight="fill" size="13"></admin-icon>
              ${isMobile ? nothing : html`<span>Root Auth</span>`}
            </span>
          </moul-badge>
        </div>
      </header>
    `;
  }
}

customElements.define('admin-header', AdminHeader);

declare global {
  interface HTMLElementTagNameMap {
    'admin-header': AdminHeader;
  }
}
