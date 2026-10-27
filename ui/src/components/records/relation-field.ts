import { css, html, LitElement, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { api } from '../../api/client';
import { QueryController } from '../../lib/query';
import { baseStyles } from '../../styles/base';
import type { MoulField } from '../../utils/fields';
import { getRecordDisplayLabel } from './record-helpers';

type RelationConfig = NonNullable<MoulField['relationConfig']>;

const NONE = '__none__';

/**
 * Relation field of the record form: a picker over up to 100 records of the target collection.
 * 1:1 and 1:N hold one ID; M:N holds an array of IDs shown as removable chips. Fires
 * `valuechange` (`detail.value`).
 */
export class AdminRelationField extends LitElement {
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
        gap: 4px;
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .required {
        color: var(--color-error-500);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-1);
        min-height: 36px;
        padding: 6px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
      }

      .chips-empty {
        padding: 2px 4px;
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-primary-500);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-xs);
      }

      .chip button {
        margin-left: 2px;
        padding: 0;
        border: none;
        background: none;
        color: var(--color-fg-subtle);
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
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
    relationConfig: { attribute: false },
    value: { attribute: false },
    errorMessage: { type: String, attribute: 'error-message' },
  };

  declare label: string;
  declare required: boolean;
  declare relationConfig: RelationConfig | undefined;
  declare value: unknown;
  declare errorMessage: string;

  private readonly targets = new QueryController(this, () => {
    const target = this.relationConfig?.targetMoul || '';
    return {
      queryKey: ['records', target, 1, 100],
      queryFn: () => api.listRecords(target, { perPage: 100 }),
      enabled: Boolean(target),
    };
  });

  constructor() {
    super();
    this.label = '';
    this.required = false;
    this.relationConfig = undefined;
    this.value = null;
    this.errorMessage = '';
  }

  private emit(value: unknown) {
    this.dispatchEvent(new CustomEvent('valuechange', { detail: { value } }));
  }

  private get targetRecords(): any[] {
    const data = this.targets.data;
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.items) ? data.items : [];
  }

  private renderLabel(cardinality: string, target: string) {
    return html`
      <span class="label">
        <admin-icon name="link" size="14" color="var(--color-primary-500)"></admin-icon>
        ${this.label}
        <moul-badge tone="primary" size="sm">${cardinality} ➔ ${target}</moul-badge>
        ${this.required ? html`<span class="required">*</span>` : nothing}
      </span>
    `;
  }

  private renderMany(target: string) {
    const selected: string[] = Array.isArray(this.value) ? this.value.map(String) : this.value ? [String(this.value)] : [];
    const records = this.targetRecords;
    const remove = (id: string) => this.emit(selected.filter((i) => i !== id));

    return html`
      ${this.renderLabel('M:N', target)}
      <div class="chips">
        ${selected.length === 0
          ? html`<span class="chips-empty">No records selected. Select records from the dropdown below to link.</span>`
          : selected.map((id) => {
              const rec = records.find((r) => String(r.id) === id);
              const display = rec ? getRecordDisplayLabel(rec) : id;
              return html`
                <span class="chip">
                  <admin-icon name="link" size="12" color="var(--color-primary-500)"></admin-icon>
                  ${display}
                  <button type="button" aria-label=${`Remove ${display}`} @click=${() => remove(id)}>×</button>
                </span>
              `;
            })}
      </div>
      <!-- Always shows the placeholder: picking a record adds it to the chips above. -->
      <moul-select
        aria-label=${`Add ${this.label} record`}
        placeholder=${this.targets.result.isLoading ? 'Loading records...' : `Select record to add to ${this.label}...`}
        .selectedKey=${live('')}
        @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
          const id = e.detail.selectedKey;
          if (id && !selected.includes(id)) this.emit([...selected, id]);
        }}
      >
        ${records
          .filter((r) => !selected.includes(String(r.id)))
          .map((r) => html`<moul-select-item key=${String(r.id)}>${getRecordDisplayLabel(r)} (${r.id})</moul-select-item>`)}
      </moul-select>
      ${this.errorMessage
        ? html`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`
        : nothing}
    `;
  }

  override render() {
    const target = this.relationConfig?.targetMoul || '';
    const cardinality = this.relationConfig?.cardinality || '1:N';
    if (cardinality === 'M:N') return this.renderMany(target);

    const current = this.value ? String(this.value) : '';
    return html`
      ${this.renderLabel(cardinality, target)}
      <moul-select
        aria-label=${`${this.label} (${cardinality} ➔ ${target})`}
        placeholder=${this.targets.result.isLoading ? 'Loading target records...' : `Select ${target} record...`}
        ?is-required=${this.required}
        .selectedKey=${live(current)}
        @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
          const key = e.detail.selectedKey;
          this.emit(!key || key === NONE ? '' : key);
        }}
      >
        <moul-select-item key=${NONE}><em>(None / Clear)</em></moul-select-item>
        ${this.targetRecords.map(
          (r) => html`<moul-select-item key=${String(r.id)}>${getRecordDisplayLabel(r)} (${r.id})</moul-select-item>`,
        )}
      </moul-select>
      ${this.errorMessage
        ? html`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`
        : nothing}
    `;
  }
}

customElements.define('admin-relation-field', AdminRelationField);

declare global {
  interface HTMLElementTagNameMap {
    'admin-relation-field': AdminRelationField;
  }
}
