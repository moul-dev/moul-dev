import { css, html, LitElement } from 'lit';
import { onPress } from '../lib/press';
import { baseStyles } from '../styles/base';
import { pageHeader, pageStyles } from '../styles/page';

/** The server's interactive API reference (`/docs`), embedded. */
export class AdminDocsPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
      :host {
        --page-gap: var(--spacing-4);
        height: calc(100vh - 120px);
      }

      moul-card {
        flex: 1;
        min-height: 0;
        padding: 0;
        overflow: hidden;
      }

      iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
      }
    `,
  ];

  override render() {
    return html`
      ${pageHeader(
        'API Reference',
        'Explore and test endpoints generated from your schema.',
        html`
          <moul-button variant="outline" @click=${onPress(() => window.open('/docs', '_blank', 'noopener'))}>
            Open in new tab
            <admin-icon slot="suffix" name="arrow-square-out" size="16"></admin-icon>
          </moul-button>
        `,
      )}
      <moul-card>
        <iframe src="/docs" title="Moul API Docs"></iframe>
      </moul-card>
    `;
  }
}

customElements.define('admin-docs-page', AdminDocsPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-docs-page': AdminDocsPage;
  }
}
