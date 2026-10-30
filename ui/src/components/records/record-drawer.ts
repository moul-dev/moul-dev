import { safeRandomUUID } from '@tanstack/db';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { type RecordsCollection, retryJobs, withoutVirtualProps } from '../../api/db';
import { fieldValue, submitOnEnter } from '../../lib/forms';
import { TransactionController } from '../../lib/live-query';
import { onPress } from '../../lib/press';
import { toast } from '../../lib/toast';
import { baseStyles } from '../../styles/base';
import { formatFormDataForSubmit, validateAuthFields, validateFieldValue, validateRecordForm } from '../../utils/fieldValidation';
import './file-field';
import { copyText, workerStateTone } from './record-helpers';
import './relation-field';

type Field = { name: string; type: string; [key: string]: any };
type CopyTarget = 'id' | 'json' | 'error';

const AUTH_INPUTS = new Set(['username', 'email', 'password', 'passwordConfirm']);

const TEXT_TYPES: Record<string, string> = {
  date: 'date',
  datetime: 'datetime-local',
  url: 'url',
  email: 'email',
  cloak: 'password',
};

function textDescription(f: Field): string {
  switch (f.type) {
    case 'cloak':
      return 'Encrypted at rest with AES-256-GCM';
    case 'text':
    case 'editor':
      return f.min !== undefined || f.max !== undefined ? `Length: ${f.min ?? 0}..${f.max ?? '∞'} characters` : '';
    case 'url':
      return 'Must start with http:// or https://';
    case 'date':
      return 'Date in YYYY-MM-DD format';
    case 'datetime':
      return 'Local or ISO 8601 date & time';
    default:
      return '';
  }
}

/** JSON text for a value that may already be parsed. */
const jsonText = (value: unknown) =>
  typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value ?? '');

/** Keeps parsed JSON when the text is valid, the raw text otherwise (validation reports it). */
function parseJsonInput(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Drawer to create a record (`record` null) or inspect and edit one, with a task inspector
 * for worker collections. Fires `openchange` when it closes and `deleterequest`
 * (`detail.record`) from its Delete button; the page owns the confirmation.
 */
export class AdminRecordDrawer extends LitElement {
  static override styles = [
    baseStyles,
    css`
      .title {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        font-size: 1rem;
        font-weight: 600;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        width: 100%;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-inline: var(--spacing-1);
        color: var(--color-fg);
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        padding-block: var(--spacing-2) var(--spacing-1);
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .inspector {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .inspector-header,
      .row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .inspector-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .inline {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      .worker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: var(--spacing-2);
      }

      .worker-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
      }

      .stat-label {
        font-size: var(--font-size-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-fg-subtle);
      }

      .stat-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .error-trace {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-alert-border-error);
        background-color: var(--color-alert-bg-error);
      }

      .error-trace-title {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-error-500);
      }

      pre {
        margin: 0;
        padding: var(--spacing-2);
        overflow-y: auto;
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .error-trace pre {
        max-height: 160px;
        background-color: var(--color-bg-subtle);
        color: var(--color-error-500);
      }

      .json {
        max-height: 180px;
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .payload-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .hint {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .metadata {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
      }

      .metadata-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
      }

      .metadata-row span:last-child {
        color: var(--color-fg);
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
    `,
  ];

  static override properties = {
    isOpen: { type: Boolean, attribute: 'is-open' },
    moulName: { type: String, attribute: 'moul-name' },
    moul: { attribute: false },
    fields: { attribute: false },
    record: { attribute: false },
    records: { attribute: false },
    active: { state: true },
    formData: { state: true },
    formErrors: { state: true },
    touched: { state: true },
    copied: { state: true },
    showRawJson: { state: true },
  };

  declare isOpen: boolean;
  declare moulName: string;
  declare moul: any;
  declare fields: Field[];
  /** The record to edit; null to create one. */
  declare record: any | null;
  /** The grid page's collection, which saves go through. */
  declare records: RecordsCollection | undefined;
  /** Local copy of `record`, kept current after retry/discard without closing the drawer. */
  declare active: any | null;
  declare formData: Record<string, any>;
  declare formErrors: Record<string, string>;
  declare touched: Record<string, boolean>;
  declare copied: CopyTarget | null;
  declare showRawJson: boolean;

  private copiedTimer?: number;

  private readonly saving = new TransactionController(this);
  private readonly retrying = new TransactionController(this);
  private readonly discarding = new TransactionController(this);

  constructor() {
    super();
    this.isOpen = false;
    this.moulName = '';
    this.moul = null;
    this.fields = [];
    this.record = null;
    this.records = undefined;
    this.active = null;
    this.formData = {};
    this.formErrors = {};
    this.touched = {};
    this.copied = null;
    this.showRawJson = false;
  }

  private get isCreating(): boolean {
    return this.active === null;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    // Start each opening from the given record (or an empty form) with no errors shown.
    if ((changed.has('isOpen') && this.isOpen) || (changed.has('record') && this.isOpen)) {
      this.active = this.record ? withoutVirtualProps(this.record) : null;
      this.formData = this.active ? { ...this.active } : {};
      this.formErrors = {};
      this.touched = {};
      this.showRawJson = false;
    }
  }

  private patchActive(id: unknown, patch: Record<string, unknown>) {
    if (this.active?.id !== id) return;
    this.active = { ...this.active, ...patch };
    this.formData = { ...this.active };
  }

  private close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('openchange', { detail: { isOpen: false } }));
  }

  private async copy(target: CopyTarget, text: string) {
    if (!(await copyText(text))) {
      toast.error('Copy Failed', 'The browser blocked clipboard access.');
      return;
    }
    this.copied = target;
    window.clearTimeout(this.copiedTimer);
    this.copiedTimer = window.setTimeout(() => (this.copied = null), 2000);
  }

  private setError(name: string, message: string | null | undefined) {
    const next = { ...this.formErrors };
    if (message) next[name] = message;
    else delete next[name];
    this.formErrors = next;
  }

  private validateField(name: string, value: unknown, form: Record<string, any>) {
    if (this.moul?.type === 'auth' && AUTH_INPUTS.has(name)) {
      const authErrors = validateAuthFields(form, this.isCreating);
      this.setError(name, authErrors[name]);
      // A changed password can fix or break an already-checked confirmation.
      if (name === 'password' && this.touched.passwordConfirm) this.setError('passwordConfirm', authErrors.passwordConfirm);
      return;
    }
    const def = (this.moul?.fields || []).find((f: any) => f.name === name);
    if (def) this.setError(name, validateFieldValue(def, value, !this.isCreating));
  }

  private change(name: string, value: unknown) {
    this.formData = { ...this.formData, [name]: value };
    if (this.touched[name]) this.validateField(name, value, this.formData);
  }

  private touch(name: string) {
    this.touched = { ...this.touched, [name]: true };
    this.validateField(name, this.formData[name], this.formData);
  }

  /** For pickers and uploads, where a pick both changes the value and marks the field touched. */
  private commit(name: string, value: unknown) {
    this.change(name, value);
    this.touch(name);
  }

  private save() {
    const validation = validateRecordForm(this.moul?.fields || [], this.formData, this.moul?.type === 'auth', this.isCreating);
    if (!validation.isValid) {
      this.formErrors = validation.errors;
      this.touched = { ...this.touched, ...Object.fromEntries(Object.keys(validation.errors).map((k) => [k, true])) };
      toast.error(
        'Validation Error',
        Object.values(validation.errors)[0] || 'Please resolve the highlighted field errors before saving.',
      );
      return;
    }
    const data = formatFormDataForSubmit(this.moul?.fields || [], this.formData);
    if (this.isCreating) void this.createRecord(data);
    else void this.updateRecord(String(this.active.id), data);
  }

  /** Waits for the server before the row shows up: it assigns the ID and decides where the row sorts. */
  private async createRecord(data: Record<string, any>) {
    if (!this.records) return;
    try {
      // The ID is a placeholder the collection needs as a key; the handler doesn't send it.
      await this.saving.track(this.records.insert({ ...data, id: safeRandomUUID() }, { optimistic: false }));
      this.close();
      toast.success('Record Created', 'New record created successfully.');
    } catch (err: any) {
      toast.error('Creation Failed', err?.message || 'Failed to create record.');
    }
  }

  /** The grid row changes at once; the drawer closes when the server accepts, or stays open to fix a refusal. */
  private async updateRecord(id: string, data: Record<string, any>) {
    if (!this.records) return;
    try {
      await this.saving.track(this.records.update(id, (draft) => Object.assign(draft, data)));
      this.close();
      toast.success('Record Updated', 'Record updated successfully.');
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Failed to update record.');
    }
  }

  private async retry(record: any) {
    if (!this.records) return;
    try {
      await this.retrying.track(retryJobs(this.records, [String(record.id)]));
      toast.success('Task Scheduled for Retry', `Worker task ${record.id} marked as available for immediate execution.`);
      this.patchActive(record.id, { state: 'available', attempt: 0, scheduled_at: new Date().toISOString() });
    } catch (err: any) {
      toast.error('Retry Failed', err?.message || 'Failed to retry worker task.');
    }
  }

  private async discard(record: any) {
    if (!this.records) return;
    const discarded_at = new Date().toISOString();
    try {
      await this.discarding.track(
        this.records.update(String(record.id), (draft) => Object.assign(draft, { state: 'discarded', discarded_at })),
      );
      toast.info('Task Discarded', `Worker task ${record.id} was marked as discarded.`);
      this.patchActive(record.id, { state: 'discarded', discarded_at });
    } catch (err: any) {
      toast.error('Discard Failed', err?.message || 'Failed to discard task.');
    }
  }

  private textField(name: string, label: string, options: { type?: string; required?: boolean; description?: string } = {}) {
    return html`
      <moul-text-field
        label=${label}
        type=${options.type ?? 'text'}
        description=${options.description ?? ''}
        error-message=${this.formErrors[name] ?? ''}
        ?is-required=${Boolean(options.required)}
        .value=${String(this.formData[name] ?? '')}
        @input=${(e: Event) => this.change(name, fieldValue(e))}
        @focusout=${() => this.touch(name)}
      ></moul-text-field>
    `;
  }

  private renderField(f: Field) {
    const error = this.formErrors[f.name] ?? '';
    const value = this.formData[f.name];
    switch (f.type) {
      case 'bool':
        return html`
          <moul-checkbox
            ?is-checked=${Boolean(value)}
            @change=${(e: CustomEvent<{ isChecked: boolean }>) => this.change(f.name, e.detail.isChecked)}
          >
            ${f.name}
          </moul-checkbox>
        `;
      case 'file':
        return html`
          <admin-file-field
            label=${f.name}
            error-message=${error}
            ?required=${Boolean(f.required)}
            .value=${value}
            @valuechange=${(e: CustomEvent<{ value: unknown }>) => this.commit(f.name, e.detail.value)}
          ></admin-file-field>
        `;
      case 'relation':
        return html`
          <admin-relation-field
            label=${f.name}
            error-message=${error}
            ?required=${Boolean(f.required)}
            .relationConfig=${f.relationConfig}
            .value=${value}
            @valuechange=${(e: CustomEvent<{ value: unknown }>) => this.commit(f.name, e.detail.value)}
          ></admin-relation-field>
        `;
      case 'json':
        return html`
          <moul-text-area
            label=${f.name}
            placeholder='{"key": "value"}'
            description="Valid JSON object or array"
            rows="4"
            error-message=${error}
            ?is-required=${Boolean(f.required)}
            .value=${jsonText(value)}
            @input=${(e: Event) => this.change(f.name, parseJsonInput(fieldValue(e)))}
            @focusout=${() => this.touch(f.name)}
          ></moul-text-area>
        `;
      case 'number': {
        const numeric = typeof value === 'number' ? value : value !== undefined && value !== null && value !== '' ? Number(value) : null;
        return html`
          <moul-number-field
            label=${f.name}
            description=${f.min !== undefined || f.max !== undefined ? `Value range: ${f.min ?? '-∞'}..${f.max ?? '+∞'}` : ''}
            error-message=${error}
            min=${f.min ?? nothing}
            max=${f.max ?? nothing}
            ?is-required=${Boolean(f.required)}
            .value=${numeric}
            @input=${(e: Event) => this.change(f.name, (e.target as HTMLElement & { value: number | null }).value)}
            @focusout=${() => this.touch(f.name)}
          ></moul-number-field>
        `;
      }
      case 'select':
        if (f.options?.length > 0) {
          return html`
            <moul-select
              label=${f.name}
              placeholder=${`Select ${f.name}`}
              ?is-required=${Boolean(f.required)}
              selected-key=${value ?? ''}
              @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => this.commit(f.name, e.detail.selectedKey || '')}
            >
              ${f.options.map((opt: string) => html`<moul-select-item key=${opt}>${opt}</moul-select-item>`)}
            </moul-select>
            ${error ? html`<span class="hint" style="color: var(--color-error-500)">${error}</span>` : nothing}
          `;
        }
        return this.textField(f.name, f.name, { required: Boolean(f.required) });
      default:
        return this.textField(f.name, f.name, {
          type: TEXT_TYPES[f.type] ?? 'text',
          required: Boolean(f.required),
          description: textDescription(f),
        });
    }
  }

  private renderWorkerInspector(record: any) {
    const errors =
      Array.isArray(record.errors) && record.errors.length > 0
        ? record.errors.join('\n')
        : record.last_error
          ? String(record.last_error)
          : null;
    const exhausted = (record.attempt ?? 0) >= (record.max_attempts ?? 3);
    const stat = (label: string, value: unknown, style = '') => html`
      <div class="worker-stat">
        <span class="stat-label">${label}</span>
        <span class="stat-value" style=${style} title=${String(value)}>${value}</span>
      </div>
    `;
    return html`
      <div class="inspector">
        <div class="inspector-header">
          <span class="inspector-title">
            <admin-icon name="clock" size="16" color="var(--color-primary-500)"></admin-icon>
            Worker Task Inspector
          </span>
          <div class="inline">
            <moul-button
              variant="secondary"
              aria-label="Retry task immediately"
              ?is-pending=${this.retrying.isPending}
              @click=${onPress(() => this.retry(record))}
            >
              <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
              Retry Task
            </moul-button>
            <moul-button
              variant="danger-soft"
              aria-label="Discard task"
              ?is-disabled=${record.state === 'discarded'}
              ?is-pending=${this.discarding.isPending}
              @click=${onPress(() => this.discard(record))}
            >
              <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
              Discard
            </moul-button>
          </div>
        </div>

        <div class="worker-grid">
          ${stat('Handler', record.worker || 'anonymous')} ${stat('Queue', record.queue || 'default')}
          ${stat('Attempts', `${record.attempt ?? 0} / ${record.max_attempts ?? 3}`, exhausted ? 'color: var(--color-error-500)' : '')}
          ${stat('Priority', record.priority ?? 0)}
        </div>

        ${errors
          ? html`
              <div class="error-trace">
                <div class="row-between">
                  <span class="error-trace-title">
                    <admin-icon name="warning-circle" size="15"></admin-icon>
                    Error Trace
                  </span>
                  <moul-button variant="ghost" size="sm" aria-label="Copy error trace" @click=${onPress(() => this.copy('error', errors))}>
                    <admin-icon
                      slot="prefix"
                      name=${this.copied === 'error' ? 'check' : 'copy'}
                      size="12"
                      color=${this.copied === 'error' ? 'var(--color-success-500)' : ''}
                    ></admin-icon>
                    ${this.copied === 'error' ? 'Copied' : 'Copy'}
                  </moul-button>
                </div>
                <pre>${errors}</pre>
              </div>
            `
          : nothing}

        <div class="row-between">
          <span class="payload-label">Task Payload / Arguments (args)</span>
          <span class="hint">JSON Payload</span>
        </div>
        <moul-text-area
          aria-label="Task Payload Arguments"
          placeholder="{}"
          rows="4"
          .value=${jsonText(this.formData.args)}
          @input=${(e: Event) => (this.formData = { ...this.formData, args: parseJsonInput(fieldValue(e)) })}
        ></moul-text-area>
      </div>
    `;
  }

  private renderMetadata(record: any) {
    const row = (label: string, value: unknown) =>
      value ? html`<div class="metadata-row"><span>${label}</span><span>${new Date(String(value)).toLocaleString()}</span></div>` : nothing;
    return html`
      <div class="section-title">
        <admin-icon name="info" size="16" color="var(--color-primary-500)"></admin-icon>
        System Metadata & Inspection
      </div>
      <div class="metadata">
        <div class="metadata-row"><span>Record ID:</span><span style="font-weight: 600">${record.id}</span></div>
        ${row('Created At:', record.createdAt || record.created_at)} ${row('Inserted At:', record.inserted_at)}
        ${row('Updated At:', record.updatedAt || record.updated_at)} ${row('Scheduled At:', record.scheduled_at)}
      </div>
      <div class="row-between">
        <moul-button variant="outline" @click=${onPress(() => (this.showRawJson = !this.showRawJson))}>
          <admin-icon slot="prefix" name="code" size="14"></admin-icon>
          ${this.showRawJson ? 'Hide Raw JSON' : 'Inspect Raw JSON'}
        </moul-button>
        <moul-button
          variant="ghost"
          size="sm"
          aria-label="Copy full record JSON"
          @click=${onPress(() => this.copy('json', JSON.stringify(record, null, 2)))}
        >
          <admin-icon
            slot="prefix"
            name=${this.copied === 'json' ? 'check' : 'copy'}
            size="13"
            color=${this.copied === 'json' ? 'var(--color-success-500)' : ''}
          ></admin-icon>
          ${this.copied === 'json' ? 'Copied' : 'Copy JSON'}
        </moul-button>
      </div>
      ${this.showRawJson ? html`<pre class="json">${JSON.stringify(record, null, 2)}</pre>` : nothing}
    `;
  }

  override render() {
    const record = this.active;
    const creating = this.isCreating;
    const type = this.moul?.type || 'base';
    const isSaving = this.saving.isPending;
    const stateTone = record?.state ? workerStateTone(record.state) : undefined;

    return html`
      <moul-drawer
        placement="right"
        size="lg"
        ?is-open=${this.isOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (e.target !== e.currentTarget) return;
          e.stopPropagation();
          if (!e.detail.isOpen) this.close();
        }}
      >
        <div slot="header" class="header-row">
          <span class="title">
            ${creating ? 'Create Record' : `Record #${record.id}`}
            <moul-badge tone="primary" size="sm">${type}</moul-badge>
            ${record?.state
              ? stateTone
                ? html`<moul-badge tone=${stateTone} size="sm">${record.state}</moul-badge>`
                : html`<moul-badge variant="bordered" size="sm">${record.state}</moul-badge>`
              : nothing}
            ${record?.id
              ? html`
                  <moul-button variant="ghost" size="sm" aria-label="Copy record ID" @click=${onPress(() => this.copy('id', String(record.id)))}>
                    <admin-icon
                      slot="prefix"
                      name=${this.copied === 'id' ? 'check' : 'copy'}
                      size="13"
                      color=${this.copied === 'id' ? 'var(--color-success-500)' : ''}
                    ></admin-icon>
                    ${this.copied === 'id' ? 'Copied' : 'Copy ID'}
                  </moul-button>
                `
              : nothing}
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${onPress(() => this.close())}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <form
          @submit=${(e: SubmitEvent) => {
            e.preventDefault();
            this.save();
          }}
          @keydown=${submitOnEnter}
        >
          ${type === 'worker' && record ? this.renderWorkerInspector(record) : nothing}

          <div class="section-title">
            <admin-icon name="list-bullets" size="16" color="var(--color-primary-500)"></admin-icon>
            ${creating ? 'New Record' : 'Edit Record'}
          </div>

          ${type === 'auth'
            ? html`
                ${this.textField('username', 'Username', { required: creating })}
                ${this.textField('email', 'Email', { type: 'email', required: creating })}
                ${creating
                  ? html`
                      ${this.textField('password', 'Password', { type: 'password', required: true, description: 'Minimum 8 characters' })}
                      ${this.textField('passwordConfirm', 'Confirm Password', { type: 'password', required: true })}
                    `
                  : nothing}
              `
            : nothing}
          ${this.fields.map((f) => html`<div>${this.renderField(f)}</div>`)}
          ${record ? this.renderMetadata(record) : nothing}
        </form>

        <div slot="footer" class="footer">
          <div>
            ${record
              ? html`
                  <moul-button variant="danger-soft" @click=${onPress(() => this.dispatchEvent(new CustomEvent('deleterequest', { detail: { record } })))}>
                    <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
                    Delete
                  </moul-button>
                `
              : nothing}
          </div>
          <div class="inline" style="gap: var(--spacing-2)">
            <moul-button variant="ghost" @click=${onPress(() => this.close())}>Cancel</moul-button>
            ${type === 'worker' && record
              ? html`
                  <moul-button variant="secondary" ?is-pending=${this.retrying.isPending} @click=${onPress(() => this.retry(record))}>
                    <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                    Retry Task
                  </moul-button>
                `
              : nothing}
            <moul-button variant="primary" ?is-disabled=${isSaving} @click=${onPress(() => this.save())}>
              ${isSaving ? 'Saving...' : creating ? 'Create Record' : 'Save Changes'}
            </moul-button>
          </div>
        </div>
      </moul-drawer>
    `;
  }
}

customElements.define('admin-record-drawer', AdminRecordDrawer);

declare global {
  interface HTMLElementTagNameMap {
    'admin-record-drawer': AdminRecordDrawer;
  }
}
