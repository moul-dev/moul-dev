import { css, html, LitElement, nothing } from 'lit';
import { api } from '../../api/client';
import { onPress } from '../../lib/press';
import { toast } from '../../lib/toast';
import { baseStyles } from '../../styles/base';
import { formatFileSize, getFileName, getFileUrl, isImageFile } from './record-helpers';

/**
 * File field of the record form: uploads to storage on pick or drop and holds the upload
 * result as its value. Fires `valuechange` (`detail.value`, `null` when removed).
 */
export class AdminFileField extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        font-family: var(--font-family-base);
        color: var(--color-fg);
      }

      .label {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .required {
        color: var(--color-error-500);
      }

      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        width: 100%;
        padding: var(--spacing-4);
        border-radius: var(--radius-md);
        border: 1px dashed var(--color-border);
        background-color: var(--color-bg-subtle);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .dropzone:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .dropzone.dragging {
        border-color: var(--color-primary-500);
        background-color: var(--color-bg-elevated);
      }

      .dropzone.invalid {
        border-color: var(--color-error-500);
        background-color: color-mix(in oklab, var(--color-error-500) 5%, transparent);
      }

      .dropzone-text {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .browse {
        color: var(--color-primary-500);
        font-weight: 500;
      }

      .uploading {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2);
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }

      .attached {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-3);
        padding: var(--spacing-2);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .attached-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        min-width: 0;
        flex: 1;
      }

      .thumb,
      .icon-box {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
      }

      .thumb {
        object-fit: cover;
      }

      .icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-bg-subtle);
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .error {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        font-size: var(--font-size-xs);
        color: var(--color-error-500);
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    required: { type: Boolean },
    value: { attribute: false },
    errorMessage: { type: String, attribute: 'error-message' },
    isUploading: { state: true },
    isDragging: { state: true },
  };

  declare label: string;
  declare required: boolean;
  declare value: any;
  declare errorMessage: string;
  declare isUploading: boolean;
  declare isDragging: boolean;

  constructor() {
    super();
    this.label = '';
    this.required = false;
    this.value = null;
    this.errorMessage = '';
    this.isUploading = false;
    this.isDragging = false;
  }

  private emit(value: unknown) {
    this.dispatchEvent(new CustomEvent('valuechange', { detail: { value } }));
  }

  private browse() {
    if (!this.isUploading) this.renderRoot.querySelector<HTMLInputElement>('input[type=file]')?.click();
  }

  private async upload(file: File) {
    this.isUploading = true;
    try {
      const result = await api.uploadFile(file);
      if (Array.isArray(result) && result.length > 0) {
        this.emit(result[0]);
      } else if (result && typeof result === 'object') {
        this.emit(result);
      }
      toast.success('File Uploaded', `${file.name} uploaded successfully.`);
    } catch (err: any) {
      toast.error('Upload Failed', err.message || 'Failed to upload file.');
    } finally {
      this.isUploading = false;
    }
  }

  private renderAttached() {
    const value = this.value;
    const url = getFileUrl(value);
    const name = getFileName(value);
    const size = typeof value === 'object' && value?.size ? formatFileSize(value.size) : '';
    const created = typeof value === 'object' ? value?.createdAt || value?.created_at : undefined;
    return html`
      <div class="attached">
        <div class="attached-left">
          ${isImageFile(value) && url
            ? html`<img class="thumb" src=${url} alt=${name} />`
            : html`<span class="icon-box"><admin-icon name="file" size="22" color="var(--color-primary-500)"></admin-icon></span>`}
          <div class="info">
            <span class="name" title=${name}>${name}</span>
            <div class="meta">
              ${size ? html`<span>${size}</span>` : nothing}
              ${created ? html`<span>${new Date(created).toLocaleDateString()}</span>` : nothing}
            </div>
          </div>
        </div>
        <div class="actions">
          ${url
            ? html`
                <moul-tooltip content="Open in new tab">
                  <moul-button variant="ghost" is-icon aria-label="View file" @click=${onPress(() => window.open(url, '_blank', 'noopener'))}>
                    <admin-icon name="arrow-square-out" size="14"></admin-icon>
                  </moul-button>
                </moul-tooltip>
              `
            : nothing}
          <moul-button variant="outline" aria-label="Replace file" ?is-disabled=${this.isUploading} @click=${onPress(() => this.browse())}>
            <admin-icon slot="prefix" name="upload-simple" size="14"></admin-icon>
            Replace
          </moul-button>
          <moul-tooltip content="Remove file">
            <moul-button variant="ghost" is-icon aria-label="Remove file" ?is-disabled=${this.isUploading} @click=${onPress(() => this.emit(null))}>
              <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
            </moul-button>
          </moul-tooltip>
        </div>
      </div>
    `;
  }

  private renderDropzone() {
    const isInvalid = Boolean(this.errorMessage);
    return html`
      <button
        type="button"
        class="dropzone ${this.isDragging ? 'dragging' : ''} ${isInvalid ? 'invalid' : ''}"
        aria-label=${`Upload ${this.label}`}
        @click=${() => this.browse()}
        @dragover=${(e: DragEvent) => {
          e.preventDefault();
          this.isDragging = true;
        }}
        @dragleave=${(e: DragEvent) => {
          e.preventDefault();
          this.isDragging = false;
        }}
        @drop=${(e: DragEvent) => {
          e.preventDefault();
          this.isDragging = false;
          const file = e.dataTransfer?.files?.[0];
          if (file) this.upload(file);
        }}
      >
        ${this.isUploading
          ? html`
              <span class="uploading">
                <moul-spinner size="sm"></moul-spinner>
                Uploading file to storage...
              </span>
            `
          : html`
              <admin-icon name="cloud-arrow-up" size="28" color=${isInvalid ? 'var(--color-error-500)' : 'var(--color-primary-500)'}></admin-icon>
              <span class="dropzone-text">Drag & drop a file here, or <span class="browse">browse</span></span>
            `}
      </button>
    `;
  }

  override render() {
    return html`
      <span class="label">${this.label}${this.required ? html`<span class="required">*</span>` : nothing}</span>
      <input
        type="file"
        hidden
        @change=${(e: Event) => {
          const input = e.target as HTMLInputElement;
          const file = input.files?.[0];
          if (file) this.upload(file);
          input.value = '';
        }}
      />
      ${this.value ? this.renderAttached() : this.renderDropzone()}
      ${this.errorMessage
        ? html`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`
        : nothing}
    `;
  }
}

customElements.define('admin-file-field', AdminFileField);

declare global {
  interface HTMLElementTagNameMap {
    'admin-file-field': AdminFileField;
  }
}
