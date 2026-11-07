import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { api } from '../../api/client';
import { onPress } from '../../lib/press';
import { toast } from '../../lib/toast';
import { baseStyles } from '../../styles/base';

type ExportFormat = 'json' | 'csv';

const FORMATS: { key: ExportFormat; icon: string; label: string; description: string }[] = [
  {
    key: 'json',
    icon: 'file-code',
    label: 'JSON',
    description: 'Structured JSON format. Ideal for migrations, backups, and nested relations.',
  },
  {
    key: 'csv',
    icon: 'file-csv',
    label: 'CSV',
    description: 'RFC 4180 spreadsheet format. Ideal for Excel, Google Sheets, or data analysts.',
  },
];

/** Downloads a collection's records as JSON or CSV, optionally limited to the active filter. */
export class AdminExportModal extends LitElement {
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
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-block: var(--spacing-2);
        color: var(--color-fg);
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .section-label {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .formats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-3);
      }

      .format {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .format:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .format[aria-pressed='true'] {
        border-color: var(--color-primary-500);
        background-color: var(--color-bg-subtle);
      }

      .format-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .format-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .format-description {
        font-size: var(--font-size-xs);
        line-height: 1.4;
        color: var(--color-fg-subtle);
      }

      .scope {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .scope label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--font-size-sm);
        cursor: pointer;
      }

      .scope input {
        accent-color: var(--color-primary-500);
      }
    `,
  ];

  static override properties = {
    isOpen: { type: Boolean, attribute: 'is-open' },
    moulName: { type: String, attribute: 'moul-name' },
    activeFilter: { type: String, attribute: 'active-filter' },
    activeSearch: { type: String, attribute: 'active-search' },
    totalRecords: { type: Number, attribute: 'total-records' },
    format: { state: true },
    scope: { state: true },
    includeSchema: { state: true },
    isExporting: { state: true },
  };

  declare isOpen: boolean;
  declare moulName: string;
  declare activeFilter: string;
  declare activeSearch: string;
  declare totalRecords: number;
  declare format: ExportFormat;
  declare scope: 'all' | 'filtered';
  declare includeSchema: boolean;
  declare isExporting: boolean;

  constructor() {
    super();
    this.isOpen = false;
    this.moulName = '';
    this.activeFilter = '';
    this.activeSearch = '';
    this.totalRecords = 0;
    this.format = 'json';
    this.scope = 'all';
    this.includeSchema = false;
    this.isExporting = false;
  }

  private get hasActiveFilters(): boolean {
    return Boolean(this.activeFilter.trim() || this.activeSearch.trim());
  }

  override willUpdate(changed: PropertyValues<this>): void {
    // Default to the filtered subset whenever the dialog opens with a filter in place.
    if (changed.has('isOpen') && this.isOpen) {
      this.scope = this.hasActiveFilters ? 'filtered' : 'all';
    }
  }

  private close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('openchange', { detail: { isOpen: false } }));
  }

  private async export() {
    this.isExporting = true;
    try {
      await api.exportRecords(this.moulName, {
        format: this.format,
        includeSchema: this.format === 'json' ? this.includeSchema : false,
        filter: this.scope === 'filtered' ? this.activeFilter : undefined,
      });
      toast.success('Export Successful', `Exported ${this.moulName} records as ${this.format.toUpperCase()}.`);
      this.close();
    } catch (err: any) {
      toast.error('Export Failed', err.message || 'Failed to download exported records.');
    } finally {
      this.isExporting = false;
    }
  }

  override render() {
    return html`
      <moul-modal
        size="md"
        aria-label=${`Export ${this.moulName} records`}
        ?is-open=${this.isOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          e.stopPropagation();
          if (!e.detail.isOpen) this.close();
        }}
      >
        <h2 slot="header">
          <admin-icon name="download-simple" size="20" color="var(--color-primary-500)"></admin-icon>
          Export Records - ${this.moulName}
        </h2>

        <div class="content">
          <div class="section">
            <span class="section-label">Export Format</span>
            <div class="formats">
              ${FORMATS.map(
                (f) => html`
                  <button type="button" class="format" aria-pressed=${String(this.format === f.key)} @click=${() => (this.format = f.key)}>
                    <span class="format-header">
                      <span class="format-title">
                        <admin-icon name=${f.icon} size="18" color="var(--color-primary-500)"></admin-icon>
                        ${f.label}
                      </span>
                      ${this.format === f.key ? html`<moul-badge tone="primary" size="sm">Selected</moul-badge>` : nothing}
                    </span>
                    <span class="format-description">${f.description}</span>
                  </button>
                `,
              )}
            </div>
          </div>

          <div class="section">
            <span class="section-label">Export Scope</span>
            <div class="scope">
              <label>
                <input type="radio" name="scope" .checked=${this.scope === 'all'} @change=${() => (this.scope = 'all')} />
                <admin-icon name="database" size="16"></admin-icon>
                All Records (${this.totalRecords} records in collection)
              </label>
              ${this.hasActiveFilters
                ? html`
                    <label>
                      <input type="radio" name="scope" .checked=${this.scope === 'filtered'} @change=${() => (this.scope = 'filtered')} />
                      <admin-icon name="funnel" size="16"></admin-icon>
                      Active Filtered Subset
                    </label>
                  `
                : nothing}
            </div>
          </div>

          ${this.format === 'json'
            ? html`
                <div class="section">
                  <span class="section-label">Advanced Options</span>
                  <moul-checkbox
                    ?is-checked=${this.includeSchema}
                    @change=${(e: CustomEvent<{ isChecked: boolean }>) => (this.includeSchema = e.detail.isChecked)}
                  >
                    Include collection schema definition in export envelope
                  </moul-checkbox>
                </div>
              `
            : nothing}
        </div>

        <moul-button slot="footer" variant="outline" ?is-disabled=${this.isExporting} @click=${onPress(() => this.close())}>
          Cancel
        </moul-button>
        <moul-button slot="footer" variant="primary" ?is-pending=${this.isExporting} @click=${onPress(() => this.export())}>
          ${this.isExporting ? nothing : html`<admin-icon slot="prefix" name="download-simple" size="16"></admin-icon>`}
          ${this.isExporting ? 'Exporting...' : `Download ${this.format.toUpperCase()}`}
        </moul-button>
      </moul-modal>
    `;
  }
}

customElements.define('admin-export-modal', AdminExportModal);

declare global {
  interface HTMLElementTagNameMap {
    'admin-export-modal': AdminExportModal;
  }
}
