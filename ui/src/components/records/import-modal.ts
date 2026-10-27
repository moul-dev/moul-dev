import { css, html, LitElement, nothing } from 'lit';
import { api } from '../../api/client';
import { onPress } from '../../lib/press';
import { toast } from '../../lib/toast';
import { baseStyles } from '../../styles/base';
import { formatFileSize } from './record-helpers';

type ImportResult = Awaited<ReturnType<typeof api.importRecords>>;
type ConflictMode = 'upsert' | 'insert' | 'replace';
type ErrorMode = 'atomic' | 'continue';

const isSupportedFile = (file: File) => /\.(csv|json)$/i.test(file.name);

/**
 * Uploads a CSV or JSON file of records into a collection and reports what was inserted,
 * updated and skipped. Fires `imported` after a successful import and `openchange` on close.
 */
export class AdminImportModal extends LitElement {
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

      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-3);
        width: 100%;
        padding: var(--spacing-6);
        border-radius: var(--radius-lg);
        border: 2px dashed var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dropzone:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .dropzone.drag-over {
        border-color: var(--color-primary-500);
        background-color: var(--color-bg-subtle);
      }

      .dropzone-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-500);
      }

      .dropzone-title,
      .file-name {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .dropzone-sub,
      .file-size {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .file {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
      }

      .file-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .options,
      .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-3);
      }

      .stats {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-2);
      }

      /* Let the selects shrink to their column instead of overflowing the dialog */
      .options > * {
        min-width: 0;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .stat-value {
        font-size: var(--font-size-xl);
        font-weight: 700;
      }

      .stat-label {
        margin-top: 2px;
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .errors-title {
        display: block;
        margin-bottom: 6px;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .errors {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        max-height: 180px;
        overflow-y: auto;
        padding: var(--spacing-2);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
      }

      .error {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        color: var(--color-error-500);
      }
    `,
  ];

  static override properties = {
    isOpen: { type: Boolean, attribute: 'is-open' },
    moulName: { type: String, attribute: 'moul-name' },
    file: { state: true },
    mode: { state: true },
    errorMode: { state: true },
    isUploading: { state: true },
    result: { state: true },
    isDragOver: { state: true },
  };

  declare isOpen: boolean;
  declare moulName: string;
  declare file: File | null;
  declare mode: ConflictMode;
  declare errorMode: ErrorMode;
  declare isUploading: boolean;
  declare result: ImportResult | null;
  declare isDragOver: boolean;

  constructor() {
    super();
    this.isOpen = false;
    this.moulName = '';
    this.file = null;
    this.mode = 'upsert';
    this.errorMode = 'atomic';
    this.isUploading = false;
    this.result = null;
    this.isDragOver = false;
  }

  private reset() {
    this.file = null;
    this.result = null;
    this.isUploading = false;
  }

  private close() {
    this.reset();
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('openchange', { detail: { isOpen: false } }));
  }

  private pickFile(file: File | undefined) {
    if (!file) return;
    if (!isSupportedFile(file)) {
      toast.error('Invalid File', 'Only .csv and .json files are supported for import.');
      return;
    }
    this.file = file;
    this.result = null;
  }

  private onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    this.pickFile(e.dataTransfer?.files?.[0]);
  }

  private async runImport() {
    if (!this.file) return;
    this.isUploading = true;
    try {
      const res = await api.importRecords(this.moulName, this.file, { mode: this.mode, onError: this.errorMode });
      this.result = res;
      toast.success('Import Finished', `Imported ${res.total} records into ${this.moulName}.`);
      this.dispatchEvent(new CustomEvent('imported', { detail: res }));
    } catch (err: any) {
      toast.error('Import Failed', err.message || 'Failed to import records.');
    } finally {
      this.isUploading = false;
    }
  }

  private renderResult(result: ImportResult) {
    const errors = result.errors ?? [];
    const stat = (value: number, label: string, color = 'var(--color-fg)') => html`
      <div class="stat">
        <span class="stat-value" style="color: ${color}">${value}</span>
        <span class="stat-label">${label}</span>
      </div>
    `;
    return html`
      <moul-alert
        tone=${errors.length > 0 ? 'warning' : 'success'}
        description=${errors.length > 0
          ? `Import partially completed with ${errors.length} error(s).`
          : 'Records imported and synchronized successfully!'}
      ></moul-alert>
      <div class="stats">
        ${stat(result.total, 'Total')} ${stat(result.inserted, 'Inserted', 'var(--color-success-500)')}
        ${stat(result.updated, 'Updated', 'var(--color-primary-500)')} ${stat(result.skipped, 'Skipped', 'var(--color-fg-subtle)')}
      </div>
      ${errors.length > 0
        ? html`
            <div>
              <span class="errors-title">Row Errors (${errors.length}):</span>
              <div class="errors">
                ${errors.map(
                  (e) => html`
                    <div class="error">
                      <admin-icon name="warning-circle" size="14"></admin-icon>
                      <span>Row ${e.row}: ${e.message}</span>
                    </div>
                  `,
                )}
              </div>
            </div>
          `
        : nothing}
    `;
  }

  private renderForm() {
    const file = this.file;
    const isCsv = file?.name.toLowerCase().endsWith('.csv');
    return html`
      <input
        id="file-input"
        type="file"
        accept=".csv,.json"
        hidden
        @change=${(e: Event) => {
          const input = e.target as HTMLInputElement;
          this.pickFile(input.files?.[0]);
          input.value = '';
        }}
      />
      ${file
        ? html`
            <div class="file">
              <div class="file-info">
                <admin-icon name=${isCsv ? 'file-csv' : 'file-code'} size="28" color="var(--color-primary-500)"></admin-icon>
                <div class="file-meta">
                  <span class="file-name">${file.name}</span>
                  <span class="file-size">${formatFileSize(file.size) || '0 B'} • ${isCsv ? 'CSV' : 'JSON'}</span>
                </div>
              </div>
              <moul-button
                variant="ghost"
                is-icon
                aria-label="Remove selected file"
                ?is-disabled=${this.isUploading}
                @click=${onPress(() => (this.file = null))}
              >
                <admin-icon name="x" size="16"></admin-icon>
              </moul-button>
            </div>
          `
        : html`
            <button
              type="button"
              class="dropzone ${this.isDragOver ? 'drag-over' : ''}"
              @click=${() => this.renderRoot.querySelector<HTMLInputElement>('#file-input')?.click()}
              @dragover=${(e: DragEvent) => {
                e.preventDefault();
                this.isDragOver = true;
              }}
              @dragleave=${() => (this.isDragOver = false)}
              @drop=${this.onDrop}
            >
              <span class="dropzone-icon"><admin-icon name="upload-simple" size="24"></admin-icon></span>
              <span>
                <span class="dropzone-title">Click to browse or drag & drop file</span>
                <span class="dropzone-sub" style="display: block">Supports CSV (comma-delimited) or JSON records array</span>
              </span>
            </button>
          `}

      <div class="options">
        <moul-select
          label="Conflict Mode"
          selected-key=${this.mode}
          ?is-disabled=${this.isUploading}
          @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
            if (e.detail.selectedKey) this.mode = e.detail.selectedKey as ConflictMode;
          }}
        >
          <moul-select-item key="upsert">Upsert (Insert new, update by ID)</moul-select-item>
          <moul-select-item key="insert">Insert Only (Fail on duplicate ID)</moul-select-item>
          <moul-select-item key="replace">Replace (Truncate collection first)</moul-select-item>
        </moul-select>
        <moul-select
          label="Error Handling"
          selected-key=${this.errorMode}
          ?is-disabled=${this.isUploading}
          @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
            if (e.detail.selectedKey) this.errorMode = e.detail.selectedKey as ErrorMode;
          }}
        >
          <moul-select-item key="atomic">Atomic (Rollback entire batch)</moul-select-item>
          <moul-select-item key="continue">Continue (Skip invalid rows)</moul-select-item>
        </moul-select>
      </div>
    `;
  }

  override render() {
    const result = this.result;
    return html`
      <moul-modal
        size="lg"
        aria-label=${`Import records into ${this.moulName}`}
        ?is-open=${this.isOpen}
        ?is-dismissable=${!this.isUploading}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          e.stopPropagation();
          if (!e.detail.isOpen) this.close();
        }}
      >
        <h2 slot="header">
          <admin-icon name="upload-simple" size="20" color="var(--color-primary-500)"></admin-icon>
          Import Records - ${this.moulName}
        </h2>

        <div class="content">${result ? this.renderResult(result) : this.renderForm()}</div>

        ${result
          ? html`
              <moul-button slot="footer" variant="outline" @click=${onPress(() => this.reset())}>
                <admin-icon slot="prefix" name="arrows-clockwise" size="16"></admin-icon>
                Import Another File
              </moul-button>
              <moul-button slot="footer" variant="primary" @click=${onPress(() => this.close())}>Done</moul-button>
            `
          : html`
              <moul-button slot="footer" variant="outline" ?is-disabled=${this.isUploading} @click=${onPress(() => this.close())}>
                Cancel
              </moul-button>
              <moul-button
                slot="footer"
                variant="primary"
                ?is-disabled=${!this.file}
                ?is-pending=${this.isUploading}
                @click=${onPress(() => this.runImport())}
              >
                ${this.isUploading ? nothing : html`<admin-icon slot="prefix" name="upload-simple" size="16"></admin-icon>`}
                ${this.isUploading ? 'Importing records...' : 'Execute Import'}
              </moul-button>
            `}
      </moul-modal>
    `;
  }
}

customElements.define('admin-import-modal', AdminImportModal);

declare global {
  interface HTMLElementTagNameMap {
    'admin-import-modal': AdminImportModal;
  }
}
