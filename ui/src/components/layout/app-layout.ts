import { css, html, LitElement, nothing } from 'lit';
import { api } from '../../api/client';
import { QueryController } from '../../lib/query';
import { router } from '../../lib/router';
import { MediaQueryController, StoreController } from '../../lib/store';
import { auth } from '../../state/auth';
import { theme } from '../../state/theme';
import './bottom-tab-bar';
import './header';
import { logoIcon } from './logo';
import './more-menu-drawer';
import { allNavLinks, identityOf, type NavLink, platformNavLinks, systemNavLinks } from './nav';
import { themeSwitcher, themeSwitcherStyles } from './theme-switcher';
import { baseStyles } from '../../styles/base';

const COLLAPSED_KEY = 'moul_sidebar_collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Authenticated shell: sidebar navigation with the account menu, header, scrollable main
 * area for the routed page (default slot), and the bottom tab bar plus "More" drawer below
 * 768px.
 */
export class AdminLayout extends LitElement {
  static override styles = [
    baseStyles,
    themeSwitcherStyles,
    css`
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }

      :host([collapsed]) {
        --content-max-width: 100%;
      }

      moul-sidebar {
        height: 100%;
      }

      @media (max-width: 767px) {
        moul-sidebar-aside {
          display: none !important;
        }
      }

      moul-sidebar-header {
        padding-inline: var(--spacing-2);
      }

      :host([collapsed]) moul-sidebar-header {
        padding-inline: 0;
      }

      /*
       * Collapsed rows sit in an inline-block tooltip, which kept them at the rail's start
       * edge. @moul-dev/web-component centers them after 1.0.0-alpha.1; drop this rule
       * once the console is on that release.
       */
      :host([collapsed]) moul-sidebar-item {
        width: 2.25rem;
        margin-inline: auto;
      }

      moul-popover {
        display: block;
        width: 100%;
      }

      moul-popover::part(trigger) {
        display: block;
      }

      /* Collapsed, the avatar sits in an inline-block tooltip; center it in the rail. */
      .user-tooltip {
        display: flex;
        justify-content: center;
      }

      /*
       * The account menu is wider than the collapsed rail, so centering it under the rail
       * pushed it off the window's left edge. Open it from the rail's edge instead.
       */
      :host([collapsed]) moul-popover::part(popover) {
        left: anchor(left);
        translate: none;
        transform-origin: top left;
      }

      .user-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        padding: 4px var(--spacing-3);
        height: 40px;
        width: 100%;
        min-width: 0;
        overflow: hidden;
        border-radius: var(--radius-md);
        border: 0;
        background-color: transparent;
        color: var(--color-fg);
        font: inherit;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.15s ease;
        outline: none;
      }

      .user-trigger:hover {
        background-color: var(--color-bg-subtle);
      }

      .user-trigger:focus-visible {
        box-shadow: var(--focus-ring);
      }

      :host([collapsed]) .user-trigger {
        padding-inline: 0;
        justify-content: center;
        width: 36px;
        height: 36px;
      }

      .user-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
        overflow: hidden;
        flex: 1;
      }

      .user-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-fg);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .menu {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 260px;
        max-width: 280px;
      }

      .menu-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        padding: 6px 8px;
      }

      .menu-header-meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
        flex: 1;
        gap: 2px;
      }

      .menu-header-name-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
      }

      .menu-header-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-fg);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .menu-header-sub {
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        line-height: 1.3;
      }

      .menu-divider {
        height: 1px;
        background-color: var(--color-border-subtle);
        margin-block: 4px;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: 6px 8px;
        min-height: 36px;
        width: 100%;
        border-radius: var(--radius-md);
        border: 0;
        background-color: transparent;
        color: var(--color-fg);
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
        outline: none;
      }

      .menu-item:hover {
        background-color: var(--color-bg-subtle);
      }

      .menu-item:focus-visible {
        box-shadow: var(--focus-ring);
      }

      .menu-item admin-icon {
        color: var(--color-fg-subtle);
      }

      .menu-item.danger,
      .menu-item.danger admin-icon {
        color: var(--color-error-500);
      }

      .menu-item.danger:hover {
        background-color: var(--color-alert-hover-error);
      }

      .theme-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        padding: 4px 8px;
        min-height: 36px;
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        font-weight: 500;
      }

      .theme-row-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .theme-row-label admin-icon {
        color: var(--color-fg-subtle);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-fg);
        flex-shrink: 0;
        padding: 2px;
        border-radius: var(--radius-md);
        line-height: 1;
      }

      /* Collapsed, the collapse toggle sits exactly on the logo, which only left a hidden tab stop. */
      :host([collapsed]) .brand {
        display: none;
      }

      .header-container {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        padding-inline: 0 var(--spacing-3);
        flex-shrink: 0;
      }

      main {
        flex: 1;
        padding-block: var(--spacing-3);
        padding-inline: 0 var(--spacing-3);
        overflow-y: auto;
        background-color: var(--color-bg);
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      @media (max-width: 767px) {
        .header-container {
          padding-inline: var(--spacing-3);
        }

        main {
          padding-block: var(--spacing-2) calc(68px + env(safe-area-inset-bottom, 0px));
          padding-inline: var(--spacing-3);
        }
      }
    `,
  ];

  static override properties = {
    collapsed: { type: Boolean, reflect: true },
    isMoreOpen: { state: true },
  };

  declare collapsed: boolean;
  declare isMoreOpen: boolean;

  private readonly mobile = new MediaQueryController(this, '(max-width: 767px)');
  private readonly account = new QueryController(this, () => ({
    queryKey: ['rootAccount'],
    queryFn: api.getRootAccount,
    staleTime: 1000 * 60 * 5,
  }));
  private lastPath = '';

  constructor() {
    super();
    this.collapsed = readCollapsed();
    this.isMoreOpen = false;
    new StoreController(this, router, auth, theme);
  }

  override updated(): void {
    // Start each page at the top, as a full page load would.
    if (router.location.pathname !== this.lastPath) {
      this.lastPath = router.location.pathname;
      this.renderRoot.querySelector('main')?.scrollTo({ top: 0 });
    }
  }

  // The theme switcher and sidebar groups fire bubbling `selectionchange` / `collapsechange`
  // events of their own; only the sidebar's events drive navigation and collapsing.
  private onSelectionChange(event: CustomEvent<{ selectedKey: string }>) {
    if (event.target !== event.currentTarget) return;
    router.navigate(event.detail.selectedKey);
  }

  private onCollapseChange(event: CustomEvent<{ collapsed: boolean }>) {
    if (event.target !== event.currentTarget) return;
    this.collapsed = event.detail.collapsed;
    try {
      localStorage.setItem(COLLAPSED_KEY, String(this.collapsed));
    } catch {
      // ignore storage errors
    }
  }

  private closeMenu() {
    const popover = this.renderRoot.querySelector('moul-popover');
    if (popover) popover.isOpen = false;
  }

  private renderNavItem(link: NavLink) {
    return html`
      <moul-sidebar-item key=${link.to} href=${router.href(link.to)} label=${link.label}>
        <admin-icon slot="icon" name=${link.icon} size="18"></admin-icon>
      </moul-sidebar-item>
    `;
  }

  override render() {
    const identity = identityOf(this.account.data || auth.user);
    const { displayName, subtitle } = identity;
    // A collection's records belong under Collections, as in the mobile tab bar.
    const selectedKey = router.isActive('/records')
      ? '/collections'
      : allNavLinks.find((link) => router.isActive(link.to))?.to || '/overview';
    const isMobile = this.mobile.matches;
    const userTrigger = html`
      <button slot=${this.collapsed ? nothing : 'trigger'} type="button" class="user-trigger" aria-label="Root User Menu">
        <span class="user-row">
          <moul-avatar name=${displayName} size="sm"></moul-avatar>
          ${this.collapsed ? nothing : html`<span class="user-name">${displayName}</span>`}
        </span>
        ${this.collapsed ? nothing : html`<admin-icon name="caret-down" size="12" color="var(--color-fg-subtle)"></admin-icon>`}
      </button>
    `;

    return html`
      <moul-sidebar
        ?collapsed=${this.collapsed}
        selected-key=${selectedKey}
        @selectionchange=${this.onSelectionChange}
        @collapsechange=${this.onCollapseChange}
      >
        <moul-sidebar-aside show-collapse-toggle>
          <moul-sidebar-header>
            <moul-popover placement="bottom">
              ${this.collapsed
                ? html`
                    <moul-tooltip slot="trigger" class="user-tooltip" content=${displayName} placement="right" delay="200">
                      ${userTrigger}
                    </moul-tooltip>
                  `
                : userTrigger}

              <div class="menu">
                <div class="menu-header">
                  <moul-avatar name=${displayName} size="sm"></moul-avatar>
                  <div class="menu-header-meta">
                    <div class="menu-header-name-row">
                      <span class="menu-header-name">${displayName}</span>
                      <moul-badge tone="primary" size="sm">ROOT</moul-badge>
                    </div>
                    <span class="menu-header-sub">${subtitle}</span>
                  </div>
                </div>

                <div class="menu-divider"></div>

                <button
                  type="button"
                  class="menu-item"
                  @click=${() => {
                    this.closeMenu();
                    router.navigate('/settings', { search: { tab: 'account' } });
                  }}
                >
                  <admin-icon name="user-gear" size="16"></admin-icon>
                  <span>Account</span>
                </button>

                <div class="theme-row">
                  <span class="theme-row-label">
                    <admin-icon name="sun" size="16"></admin-icon>
                    <span>Theme</span>
                  </span>
                  ${themeSwitcher(theme.theme, (next) => theme.setTheme(next))}
                </div>

                <div class="menu-divider"></div>

                <button
                  type="button"
                  class="menu-item danger"
                  @click=${() => {
                    this.closeMenu();
                    auth.logout();
                  }}
                >
                  <admin-icon name="sign-out" size="16"></admin-icon>
                  <span>Sign Out</span>
                </button>
              </div>
            </moul-popover>
          </moul-sidebar-header>

          <moul-sidebar-group label="Platform">${platformNavLinks.map((link) => this.renderNavItem(link))}</moul-sidebar-group>
          <moul-sidebar-group label="System">${systemNavLinks.map((link) => this.renderNavItem(link))}</moul-sidebar-group>

          <moul-sidebar-footer>
            <a class="brand" href=${router.href('/overview')} aria-label="moul.dev">${logoIcon(32)}</a>
          </moul-sidebar-footer>
        </moul-sidebar-aside>

        <moul-sidebar-main>
          <div class="header-container"><admin-header></admin-header></div>
          <main><slot></slot></main>
        </moul-sidebar-main>
      </moul-sidebar>

      ${isMobile
        ? html`
            <admin-bottom-tab-bar ?is-more-open=${this.isMoreOpen} @openmore=${() => (this.isMoreOpen = true)}></admin-bottom-tab-bar>
            <admin-more-menu-drawer
              ?is-open=${this.isMoreOpen}
              .identity=${identity}
              @openchange=${(event: CustomEvent<{ isOpen: boolean }>) => (this.isMoreOpen = event.detail.isOpen)}
            ></admin-more-menu-drawer>
          `
        : nothing}
    `;
  }
}

customElements.define('admin-layout', AdminLayout);

declare global {
  interface HTMLElementTagNameMap {
    'admin-layout': AdminLayout;
  }
}
