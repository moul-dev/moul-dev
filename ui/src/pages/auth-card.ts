import { css, html, type TemplateResult } from 'lit';
import { logoIcon } from '../components/layout/logo';
import '../components/layout/theme-toggle';
import { baseStyles } from '../styles/base';

/** Shared frame of the sign-in and setup pages: centered card with logo, title and theme toggle. */
export const authCardStyles = [
  baseStyles,
  css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      width: 100%;
      background-color: var(--color-bg-subtle);
      padding: var(--spacing-4);
      position: relative;
    }

    .theme-toggle {
      position: absolute;
      top: var(--spacing-4);
      right: var(--spacing-4);
    }

    .card {
      width: 100%;
      max-width: 460px;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--spacing-1);
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-fg);
      margin-bottom: var(--spacing-2);
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-fg);
      font-family: var(--font-family-base);
      letter-spacing: -0.025em;
    }

    .subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-fg-subtle);
      font-family: var(--font-family-base);
    }

    .stack,
    form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      width: 100%;
    }

    .stack {
      gap: 1rem;
    }

    .key-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-3);
      background-color: var(--color-bg-subtle);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-subtle);
      width: 100%;
    }

    .key-status-label {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-fg);
    }

    .footer {
      text-align: center;
      font-size: 0.8125rem;
      color: var(--color-fg-subtle);
      font-family: var(--font-family-base);
      width: 100%;
    }
  `,
];

export function authCard(options: { title: string; subtitle: string; body: TemplateResult; footer?: TemplateResult }) {
  return html`
    <div class="container">
      <div class="theme-toggle"><admin-theme-toggle></admin-theme-toggle></div>
      <div class="card">
        <moul-card>
          <moul-card-header>
            <div class="header">
              <div class="logo">${logoIcon(44)}</div>
              <h1>${options.title}</h1>
              <p class="subtitle">${options.subtitle}</p>
            </div>
          </moul-card-header>
          <moul-card-body><div class="stack">${options.body}</div></moul-card-body>
          ${options.footer ? html`<moul-card-footer><div class="footer">${options.footer}</div></moul-card-footer>` : ''}
        </moul-card>
      </div>
    </div>
  `;
}

/** "Admin key verified" row with a button to forget the key. */
export function keyStatus(onClear: () => void) {
  return html`
    <div class="key-status">
      <span class="key-status-label">
        <moul-badge tone="success" is-dot aria-label="Verified"></moul-badge>
        Admin key verified
      </span>
      <moul-button variant="ghost" size="sm" @press=${onClear}>Change Key</moul-button>
    </div>
  `;
}
