import { css, html, LitElement } from 'lit';
import { onPress } from '../../lib/press';
import { toast } from '../../lib/toast';
import { baseStyles } from '../../styles/base';

type BadgeTone = 'primary' | 'success' | 'warning';

const PRESETS: { title: string; desc: string; code: string; badge: string; tone?: BadgeTone }[] = [
  {
    title: 'Public Access',
    desc: 'Anyone can query or execute without logging in. Leave rule empty.',
    code: '',
    badge: 'Public',
  },
  {
    title: 'Signed-In Users Only',
    desc: 'Requires a valid login token from any registered user.',
    code: '@request.auth.id != ""',
    badge: 'Authenticated',
    tone: 'primary',
  },
  {
    title: 'Author / Owner Only',
    desc: 'Only the user who owns the record can view, edit, or delete it.',
    code: 'userId = @request.auth.id',
    badge: 'Ownership',
    tone: 'success',
  },
  {
    title: 'User Profile Self-Access',
    desc: 'For users collections, allows users to view or update only their own profile.',
    code: 'id = @request.auth.id',
    badge: 'Self Profile',
    tone: 'success',
  },
  {
    title: 'Administrators Only',
    desc: 'Restricts access exclusively to users with role="admin".',
    code: '@request.auth.role = "admin"',
    badge: 'Admins Only',
    tone: 'warning',
  },
  {
    title: 'Published or Creator',
    desc: 'Visitors can view published items, while creators can view/edit their own drafts.',
    code: 'status = "published" || authorId = @request.auth.id',
    badge: 'Visibility',
    tone: 'primary',
  },
  {
    title: 'Cross-Table Role Lookup',
    desc: 'Checks whether the requesting user has permission in another table.',
    code: '@collection.userRoles.userId = @request.auth.id && @collection.userRoles.role = "admin"',
    badge: 'Relational Join',
    tone: 'warning',
  },
];

const VARIABLES: [string, string, string][] = [
  ['@request.auth.id', 'ID of current logged-in user', '@request.auth.id != ""'],
  ['@request.auth.email', 'Email of logged-in user', '@request.auth.email ~ "@company.com"'],
  ['@request.auth.role', 'Role field of the logged-in user', '@request.auth.role = "admin"'],
  ['@request.body.<field>', 'Incoming request body value during create or update', '@request.body.status = "draft"'],
  ['@request.headers.<name>', 'HTTP request header', '@request.headers.x_api_version = "v1"'],
  ['@request.query.<name>', 'URL query parameter', '@request.query.preview = "true"'],
];

const OPERATORS: [string, string, string][] = [
  ['=, !=, >, <, >=, <=', 'Standard equality and comparison', 'price >= 10'],
  ['~, !~', 'Text contains or does not contain', 'title ~ "announcement"'],
  ['&&, ||, !', 'AND, OR, NOT logical operators', 'status = "active" && !archived'],
  ['?=', 'Array contains element', 'tags ?= "featured"'],
  ['@collection.<table>.<field>', 'Look up relation in another table', '@collection.members.userId = @request.auth.id'],
  ['geoDistance(lon1, lat1, lon2, lat2)', 'Calculates geographical distance (km)', 'geoDistance(lon, lat, 104.9, 11.5) < 50'],
];

/** Reference for the access-rule language: presets to copy, request variables, operators. */
export class AdminRuleDocsModal extends LitElement {
  static override styles = [
    baseStyles,
    css`
      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--color-fg);
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-5);
        max-height: 68vh;
        overflow-y: auto;
        padding-right: var(--spacing-1);
        color: var(--color-fg);
      }

      .intro {
        margin: 0;
        font-size: var(--font-size-sm);
        line-height: 1.5;
        color: var(--color-fg-subtle);
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .presets {
        display: grid;
        gap: var(--spacing-2);
      }

      .preset {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
      }

      .preset-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .preset-title-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .preset-title {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .preset-desc {
        font-size: var(--font-size-xs);
        line-height: 1.4;
        color: var(--color-fg-subtle);
      }

      .preset-code {
        align-self: flex-start;
        margin-top: var(--spacing-1);
        padding: 2px var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-500);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        word-break: break-all;
      }

      .table-wrapper {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        overflow: hidden;
        background-color: var(--color-bg-elevated);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--font-size-xs);
      }

      th {
        padding: var(--spacing-2);
        background-color: var(--color-bg-subtle);
        color: var(--color-fg-subtle);
        font-weight: 600;
        text-align: left;
        border-bottom: 1px solid var(--color-border);
      }

      td {
        padding: var(--spacing-2);
        border-bottom: 1px solid var(--color-border-subtle);
        vertical-align: middle;
      }

      code {
        font-family: var(--font-mono);
      }

      .code-tag {
        padding: 2px var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-500);
        font-size: 0.75rem;
        font-weight: 600;
      }
    `,
  ];

  static override properties = {
    isOpen: { type: Boolean, attribute: 'is-open' },
    copiedCode: { state: true },
  };

  declare isOpen: boolean;
  declare copiedCode: string | null;

  private copiedTimer?: number;

  constructor() {
    super();
    this.isOpen = false;
    this.copiedCode = null;
  }

  private close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('openchange', { detail: { isOpen: false } }));
  }

  private async copy(code: string, label: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      toast.error('Copy Failed', 'The browser blocked clipboard access.');
      return;
    }
    this.copiedCode = code;
    toast.success('Rule Copied', `Rule for "${label}" copied to clipboard.`);
    window.clearTimeout(this.copiedTimer);
    this.copiedTimer = window.setTimeout(() => (this.copiedCode = null), 2000);
  }

  private renderTable(firstColumn: string, rows: [string, string, string][]) {
    return html`
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>${firstColumn}</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(
              ([syntax, description, example]) => html`
                <tr>
                  <td><code class="code-tag">${syntax}</code></td>
                  <td>${description}</td>
                  <td><code>${example}</code></td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  override render() {
    return html`
      <moul-modal
        size="lg"
        ?is-open=${this.isOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          e.stopPropagation();
          if (!e.detail.isOpen) this.close();
        }}
      >
        <h2 slot="header">
          <admin-icon name="book-open" size="20" color="var(--color-primary-500)"></admin-icon>
          Access Rules Reference
        </h2>

        <div class="content">
          <p class="intro">
            Rules control who can access records. Leave a rule empty for public access, or use expressions to
            restrict it.
          </p>

          <div class="section">
            <h3>
              <admin-icon name="sparkle" size="16" color="var(--color-primary-500)"></admin-icon>
              Popular Setups
            </h3>
            <div class="presets">
              ${PRESETS.map((preset) => {
                const copied = this.copiedCode === preset.code;
                return html`
                  <div class="preset">
                    <div class="preset-info">
                      <div class="preset-title-row">
                        <span class="preset-title">${preset.title}</span>
                        ${preset.tone
                          ? html`<moul-badge tone=${preset.tone} size="sm">${preset.badge}</moul-badge>`
                          : html`<moul-badge variant="bordered" size="sm">${preset.badge}</moul-badge>`}
                      </div>
                      <span class="preset-desc">${preset.desc}</span>
                      <code class="preset-code">${preset.code || '<Empty — Public Access>'}</code>
                    </div>
                    <moul-button
                      variant="outline"
                      aria-label=${`Copy rule: ${preset.title}`}
                      @click=${onPress(() => this.copy(preset.code, preset.title))}
                    >
                      <admin-icon slot="prefix" name=${copied ? 'check' : 'copy'} size="16"></admin-icon>
                      ${copied ? 'Copied' : 'Copy'}
                    </moul-button>
                  </div>
                `;
              })}
            </div>
          </div>

          <div class="section">
            <h3>
              <admin-icon name="lock-key" size="16" color="var(--color-primary-500)"></admin-icon>
              User & Request Variables
            </h3>
            ${this.renderTable('Variable', VARIABLES)}
          </div>

          <div class="section">
            <h3>
              <admin-icon name="code" size="16" color="var(--color-primary-500)"></admin-icon>
              Operators & Functions
            </h3>
            ${this.renderTable('Syntax', OPERATORS)}
          </div>
        </div>

        <moul-button slot="footer" variant="primary" @click=${onPress(() => this.close())}>Close</moul-button>
      </moul-modal>
    `;
  }
}

customElements.define('admin-rule-docs-modal', AdminRuleDocsModal);

declare global {
  interface HTMLElementTagNameMap {
    'admin-rule-docs-modal': AdminRuleDocsModal;
  }
}
