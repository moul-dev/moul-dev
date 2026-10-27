import { css, html, LitElement, nothing } from 'lit';
import { router } from '../../lib/router';
import { StoreController } from '../../lib/store';
import { baseStyles } from '../../styles/base';

interface Tab {
  to: string;
  label: string;
  ariaLabel: string;
  icon: string;
  isActive: () => boolean;
}

const TABS: Tab[] = [
  {
    to: '/overview',
    label: 'Overview',
    ariaLabel: 'Overview',
    icon: 'squares-four',
    isActive: () => router.location.pathname === '/overview' || router.location.pathname === '/',
  },
  {
    to: '/collections',
    label: 'Collections',
    ariaLabel: 'Collections',
    icon: 'database',
    isActive: () => router.isActive('/collections') || router.isActive('/records'),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    ariaLabel: 'Analytics',
    icon: 'chart-line-up',
    isActive: () => router.isActive('/analytics'),
  },
  {
    to: '/realtime',
    label: 'Realtime',
    ariaLabel: 'Realtime Hub',
    icon: 'broadcast',
    isActive: () => router.isActive('/realtime'),
  },
];

const MORE_PATHS = ['/workers', '/flags', '/settings', '/docs'];

/**
 * Fixed bottom navigation shown below 768px. The fifth tab opens the "More" drawer;
 * it fires `openmore`.
 */
export class AdminBottomTabBar extends LitElement {
  static override styles = [
    baseStyles,
    css`
      nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 50;
        height: calc(58px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding-inline: var(--spacing-2);
        background-color: var(--color-bg-glass);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid var(--color-border-subtle);
        box-shadow: var(--shadow-sm);
      }

      @media (min-width: 768px) {
        nav {
          display: none;
        }
      }

      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        flex: 1;
        max-width: 72px;
        height: 46px;
        padding: 4px;
        border-radius: var(--radius-md);
        border: 0;
        background-color: transparent;
        color: var(--color-fg-subtle);
        cursor: pointer;
        font: inherit;
        outline: none;
        transition: all 0.15s ease;
        -webkit-tap-highlight-color: transparent;
        position: relative;
      }

      button:focus-visible {
        box-shadow: var(--focus-ring);
      }

      button.active {
        color: var(--color-primary-500);
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 24px;
        position: relative;
        transition: transform 0.15s ease;
      }

      .active .icon {
        transform: scale(1.08);
      }

      .dot {
        position: absolute;
        top: -2px;
        right: 2px;
        width: 5px;
        height: 5px;
        border-radius: 9999px;
        background-color: var(--color-primary-500);
      }

      .label {
        font-size: 0.6875rem;
        font-weight: 500;
        font-family: var(--font-family-base);
        line-height: 1.1;
        letter-spacing: -0.01em;
        transition: font-weight 0.15s ease;
      }

      .active .label {
        font-weight: 600;
      }
  `,
  ];

  static override properties = {
    isMoreOpen: { type: Boolean, attribute: 'is-more-open' },
  };

  declare isMoreOpen: boolean;

  constructor() {
    super();
    this.isMoreOpen = false;
    new StoreController(this, router);
  }

  private renderTab(icon: string, label: string, isActive: boolean, badge: unknown = nothing) {
    return html`
      <span class="icon">
        <admin-icon name=${icon} size="22" weight=${isActive ? 'fill' : 'regular'}></admin-icon>
        ${badge}
      </span>
      <span class="label">${label}</span>
    `;
  }

  override render() {
    const isMoreActive = this.isMoreOpen || MORE_PATHS.some((path) => router.isActive(path));

    return html`
      <nav aria-label="Mobile Bottom Navigation">
        ${TABS.map((tab) => {
          const isActive = tab.isActive();
          return html`
            <button
              type="button"
              class=${isActive ? 'active' : ''}
              aria-label=${tab.ariaLabel}
              aria-current=${isActive ? 'page' : nothing}
              @click=${() => router.navigate(tab.to)}
            >
              ${this.renderTab(tab.icon, tab.label, isActive)}
            </button>
          `;
        })}
        <button
          type="button"
          class=${isMoreActive ? 'active' : ''}
          aria-label="More navigation and system settings"
          aria-expanded=${this.isMoreOpen ? 'true' : 'false'}
          @click=${() => this.dispatchEvent(new CustomEvent('openmore'))}
        >
          ${this.renderTab(
            'dots-three-outline-vertical',
            'More',
            isMoreActive,
            isMoreActive && !this.isMoreOpen ? html`<span class="dot"></span>` : nothing,
          )}
        </button>
      </nav>
    `;
  }
}

customElements.define('admin-bottom-tab-bar', AdminBottomTabBar);

declare global {
  interface HTMLElementTagNameMap {
    'admin-bottom-tab-bar': AdminBottomTabBar;
  }
}
