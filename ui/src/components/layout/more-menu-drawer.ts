import { css, html, LitElement } from 'lit';
import { router } from '../../lib/router';
import { StoreController } from '../../lib/store';
import { auth } from '../../state/auth';
import { type ThemeMode, theme } from '../../state/theme';
import { type Identity, identityOf, systemNavLinks } from './nav';
import { themeSwitcher, themeSwitcherStyles } from './theme-switcher';
import { baseStyles } from '../../styles/base';

/**
 * Mobile bottom sheet behind the "More" tab: account card, system modules, theme and
 * sign out. Fires `openchange` (`detail.isOpen`) when it closes itself.
 */
export class AdminMoreMenuDrawer extends LitElement {
  static override styles = [
    baseStyles,
    themeSwitcherStyles,
    css`
      /* Size the sheet to its content (up to the drawer's 85vh cap) instead of size="lg"'s fixed 32rem */
      moul-drawer::part(base) {
        height: auto;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-fg);
      }

      .body {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
      }

      .user-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-radius: var(--radius-lg);
        background-color: var(--color-bg-subtle);
        border: 1px solid var(--color-border-subtle);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        min-width: 0;
        flex: 1;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }

      .user-name-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .user-name {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--color-fg);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .user-sub {
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .section-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-subtle);
        margin-top: var(--spacing-1);
        margin-bottom: 2px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-2);
      }

      .nav-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-1);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        cursor: pointer;
        text-align: left;
        font: inherit;
        transition: all 0.15s ease;
        outline: none;
      }

      .nav-card:hover,
      .nav-card:active,
      .nav-card.active {
        background-color: var(--color-bg-elevated);
      }

      .nav-card.active {
        border-color: var(--color-primary-500);
      }

      .nav-card:focus-visible {
        box-shadow: var(--focus-ring);
      }

      .nav-card-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        background-color: var(--color-bg);
        color: var(--color-fg);
        margin-bottom: 2px;
      }

      .active .nav-card-icon {
        background-color: var(--color-primary-500);
        color: var(--color-fg-on-primary);
      }

      .nav-card-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-fg);
      }

      .nav-card-sub {
        font-size: 0.6875rem;
        color: var(--color-fg-subtle);
        line-height: 1.2;
      }

      .settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        background-color: var(--color-bg-subtle);
        border: 1px solid var(--color-border-subtle);
      }

      .settings-row-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-fg);
      }

      .settings-row-label admin-icon {
        color: var(--color-fg-subtle);
      }

      .divider {
        height: 1px;
        background-color: var(--color-border-subtle);
        margin-block: var(--spacing-1);
      }

      .sign-out {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        padding: var(--spacing-3) var(--spacing-4);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-alert-border-error);
        background-color: var(--color-alert-bg-error);
        color: var(--color-error-500);
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        outline: none;
      }

      .sign-out:hover {
        background-color: var(--color-alert-hover-error);
      }

      .sign-out:active {
        background-color: var(--color-alert-active-error);
      }

      .sign-out:focus-visible {
        box-shadow: var(--focus-ring);
      }
    `,
  ];

  static override properties = {
    isOpen: { type: Boolean, attribute: 'is-open' },
    identity: { attribute: false },
  };

  declare isOpen: boolean;
  declare identity: Identity;

  constructor() {
    super();
    this.isOpen = false;
    this.identity = identityOf(null);
    new StoreController(this, router, theme);
  }

  private close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('openchange', { detail: { isOpen: false } }));
  }

  private go(to: string, search?: Record<string, string>) {
    this.close();
    router.navigate(to, { search });
  }

  private onOpenChange(event: CustomEvent<{ isOpen: boolean }>) {
    event.stopPropagation();
    if (!event.detail.isOpen) this.close();
  }

  override render() {
    const { displayName, subtitle } = this.identity;

    return html`
      <moul-drawer placement="bottom" size="lg" ?is-open=${this.isOpen} @openchange=${this.onOpenChange}>
        <div slot="header" class="header-row">
          <h2>Menu & System Tools</h2>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close menu" @press=${() => this.close()}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <div class="body">
          <div class="user-card">
            <div class="user-info">
              <moul-avatar name=${displayName} size="md"></moul-avatar>
              <div class="user-meta">
                <div class="user-name-row">
                  <span class="user-name">${displayName}</span>
                  <moul-badge tone="primary" size="sm">ROOT</moul-badge>
                </div>
                <span class="user-sub">${subtitle}</span>
              </div>
            </div>
            <moul-button variant="ghost" is-icon aria-label="Account Settings" @press=${() => this.go('/settings', { tab: 'account' })}>
              <admin-icon name="user-gear" size="18"></admin-icon>
            </moul-button>
          </div>

          <div>
            <div class="section-title">System Modules</div>
            <div class="grid">
              ${systemNavLinks.map((item) => {
                const isActive = router.isActive(item.to);
                return html`
                  <button type="button" class="nav-card ${isActive ? 'active' : ''}" @click=${() => this.go(item.to)}>
                    <span class="nav-card-icon"><admin-icon name=${item.icon} size="18"></admin-icon></span>
                    <span class="nav-card-title">${item.label}</span>
                    <span class="nav-card-sub">${item.description}</span>
                  </button>
                `;
              })}
            </div>
          </div>

          <div>
            <div class="section-title">Preferences</div>
            <div class="settings-row">
              <span class="settings-row-label">
                <admin-icon name="sun" size="18"></admin-icon>
                <span>Theme</span>
              </span>
              ${themeSwitcher(theme.theme, (next: ThemeMode) => theme.setTheme(next))}
            </div>
          </div>

          <div class="divider"></div>

          <button
            type="button"
            class="sign-out"
            @click=${() => {
              this.close();
              auth.logout();
            }}
          >
            <admin-icon name="sign-out" weight="bold" size="18"></admin-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </moul-drawer>
    `;
  }
}

customElements.define('admin-more-menu-drawer', AdminMoreMenuDrawer);

declare global {
  interface HTMLElementTagNameMap {
    'admin-more-menu-drawer': AdminMoreMenuDrawer;
  }
}
