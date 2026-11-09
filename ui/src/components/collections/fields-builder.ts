import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { fieldValue } from '../../lib/forms';
import { onPress } from '../../lib/press';
import { baseStyles } from '../../styles/base';
import {
  FIELD_TYPES,
  getNextDefaultFieldName,
  getNextDefaultRelationName,
  isEligibleForUnique,
  isReservedFieldName,
  isValidCamelCase,
  type MoulField,
  toCamelCase,
} from '../../utils/fields';

type RelationConfig = NonNullable<MoulField['relationConfig']>;

interface MoulSummary {
  name: string;
  type?: string;
}

/** Everything the card for one field needs to know about its validity. */
function describeField(field: MoulField, index: number, fields: MoulField[], collectionType: string) {
  const name = (field.name || '').trim();
  const isEmpty = !name;
  const isConflict = Boolean(name && isReservedFieldName(name, collectionType));
  const isInvalidCamel = Boolean(name && !isValidCamelCase(name));
  const isDuplicate = Boolean(
    name && fields.some((f, i) => i !== index && (f.name || '').trim().toLowerCase() === name.toLowerCase()),
  );
  const hasMinMaxConflict = field.min != null && field.max != null && field.min > field.max;
  const hasSelectError = field.type === 'select' && (!field.options || field.options.length === 0);
  const isUniqueEligible = isEligibleForUnique(field.type);
  const hasUniqueError = Boolean(field.unique && !isUniqueEligible);
  const suggestedCamel = toCamelCase(name);
  return {
    isEmpty,
    isConflict,
    isInvalidCamel,
    isDuplicate,
    hasMinMaxConflict,
    hasSelectError,
    isUniqueEligible,
    hasUniqueError,
    isInvalid:
      isEmpty || isConflict || isInvalidCamel || isDuplicate || hasMinMaxConflict || hasSelectError || hasUniqueError,
    suggestedCamel,
    canSuggestFix:
      isInvalidCamel &&
      Boolean(suggestedCamel) &&
      suggestedCamel !== name &&
      isValidCamelCase(suggestedCamel) &&
      !isReservedFieldName(suggestedCamel, collectionType),
  };
}

/**
 * Editor for a collection's custom fields: name, type, required/unique, and per-type options
 * (relation target, select options, length or value limits, cloak search). Fires `fieldschange`
 * (`detail.fields`) on every edit; set `fields` back to apply it.
 */
export class AdminFieldsBuilder extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        width: 100%;
        color: var(--color-fg);
        font-family: var(--font-family-base);
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .title-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .subtitle {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .system-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
      }

      .system-banner-left,
      .system-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .system-fields {
        gap: var(--spacing-1);
      }

      .system-banner-label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-xs);
        font-weight: 600;
        color: var(--color-fg-subtle);
      }

      .system-banner-right {
        font-size: 0.6875rem;
        font-style: italic;
        color: var(--color-fg-subtle);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--color-fg);
      }

      .pill.auth {
        border-color: var(--color-primary-500);
        color: var(--color-primary-500);
        font-weight: 500;
      }

      .field-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .field-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
        transition: border-color 0.15s ease;
      }

      .field-card.relation {
        border-color: var(--color-primary-500);
      }

      .field-card.invalid {
        border-color: var(--color-error-500);
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
      }

      .top-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        width: 100%;
      }

      .order {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        flex-shrink: 0;
      }

      .order-number {
        min-width: 14px;
        text-align: center;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--color-fg-subtle);
      }

      .order-actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .name {
        flex-grow: 1;
        min-width: 0;
      }

      /* The warnings below the row explain the problem; the field only needs the red frame */
      .name.invalid::part(input-container) {
        border-color: var(--color-error-500);
      }

      .type {
        width: 175px;
        flex-shrink: 0;
      }

      .type-item {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .checkboxes {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .truncate {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .warnings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        padding-top: 2px;
      }

      /* Icon beside the message; a fix button goes under the message */
      .warning {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
        gap: var(--spacing-1) var(--spacing-2);
        font-size: var(--font-size-xs);
        color: var(--color-error-500);
      }

      .warning admin-icon {
        margin-top: 1px;
      }

      .warning moul-button {
        grid-column: 2;
        justify-self: start;
      }

      .panel {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-top: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
      }

      .panel-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .relation-banner {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .relation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-3);
      }

      .options-empty {
        font-size: var(--font-size-xs);
        font-style: italic;
        color: var(--color-fg-subtle);
      }

      .add-option {
        display: flex;
        align-items: flex-end;
        gap: var(--spacing-2);
        max-width: 360px;
      }

      .add-option moul-text-field {
        flex: 1;
      }

      .constraint-label,
      .security-title {
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .security-title {
        font-weight: 600;
      }

      .number-row {
        display: flex;
        gap: var(--spacing-2);
        max-width: 380px;
      }

      .number-row moul-number-field {
        flex: 1;
      }

      .security-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .security-description {
        padding-left: var(--spacing-4);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }
    `,
  ];

  static override properties = {
    fields: { attribute: false },
    currentMoulName: { type: String, attribute: 'current-moul-name' },
    allMouls: { attribute: false },
    collectionType: { type: String, attribute: 'collection-type' },
    expanded: { state: true },
    newOptions: { state: true },
  };

  declare fields: MoulField[];
  declare currentMoulName: string;
  declare allMouls: MoulSummary[];
  declare collectionType: string;
  declare expanded: Record<number, boolean>;
  declare newOptions: Record<number, string>;

  constructor() {
    super();
    this.fields = [];
    this.currentMoulName = '';
    this.allMouls = [];
    this.collectionType = 'base';
    this.expanded = {};
    this.newOptions = {};
  }

  private emit(fields: MoulField[]) {
    this.dispatchEvent(new CustomEvent('fieldschange', { detail: { fields } }));
  }

  private addField() {
    this.emit([...this.fields, { name: getNextDefaultFieldName(this.fields), type: 'text', required: false }]);
  }

  private moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= this.fields.length) return;
    const next = [...this.fields];
    [next[index], next[target]] = [next[target], next[index]];
    this.emit(next);
    this.expanded = { ...this.expanded, [index]: Boolean(this.expanded[target]), [target]: Boolean(this.expanded[index]) };
  }

  private removeField(index: number) {
    this.emit(this.fields.filter((_, i) => i !== index));
    // Expansion is tracked by position: shift entries after the removed field up by one.
    const expanded: Record<number, boolean> = {};
    for (const [key, value] of Object.entries(this.expanded)) {
      const i = Number(key);
      if (i < index) expanded[i] = value;
      else if (i > index) expanded[i - 1] = value;
    }
    this.expanded = expanded;
  }

  private changeField(index: number, key: keyof MoulField, value: unknown) {
    const next = [...this.fields];
    const updated: MoulField = { ...next[index], [key]: value };

    if (key === 'type' && value === 'relation') {
      const defaultTarget =
        this.allMouls.find((m) => m.name !== this.currentMoulName)?.name || this.currentMoulName || 'users';
      updated.relationConfig ??= { targetMoul: defaultTarget, cardinality: '1:N', onDelete: 'SET_NULL' };
      if (/^field\d+$/i.test(updated.name)) {
        updated.name = getNextDefaultRelationName(
          defaultTarget,
          this.currentMoulName,
          this.fields.filter((_, i) => i !== index),
        );
      }
      this.expanded = { ...this.expanded, [index]: true };
    }
    if (key === 'type' && value === 'select') {
      if (!updated.options || updated.options.length === 0) updated.options = ['option1', 'option2'];
      this.expanded = { ...this.expanded, [index]: true };
    }
    if (key === 'type' && value === 'cloak') {
      updated.searchable ??= false;
    }
    if (key === 'unique' && value) updated.required = true;
    if (key === 'required' && !value && updated.unique) updated.unique = false;
    if (key === 'type' && !isEligibleForUnique(String(value))) updated.unique = false;

    next[index] = updated;
    this.emit(next);
  }

  private changeRelation(index: number, key: keyof RelationConfig, value: string) {
    const next = [...this.fields];
    const current: RelationConfig = next[index].relationConfig || {
      targetMoul: this.currentMoulName || 'users',
      cardinality: '1:N',
      onDelete: 'SET_NULL',
    };
    next[index] = { ...next[index], relationConfig: { ...current, [key]: value } as RelationConfig };
    this.emit(next);
  }

  private addOption(index: number) {
    const value = (this.newOptions[index] || '').trim();
    if (!value) return;
    const options = this.fields[index].options || [];
    if (!options.includes(value)) {
      const next = [...this.fields];
      next[index] = { ...next[index], options: [...options, value] };
      this.emit(next);
    }
    this.newOptions = { ...this.newOptions, [index]: '' };
  }

  private removeOption(index: number, option: string) {
    const next = [...this.fields];
    next[index] = { ...next[index], options: (next[index].options || []).filter((o) => o !== option) };
    this.emit(next);
  }

  private renderSystemFields() {
    const isAuth = this.collectionType === 'auth';
    const tag = (text: string) => html`<moul-badge variant="bordered" size="sm">${text}</moul-badge>`;
    return html`
      <div class="system-banner">
        <div class="system-banner-left">
          <span class="system-banner-label">
            <admin-icon name="info" size="14" color="var(--color-primary-500)"></admin-icon>
            ${isAuth ? 'Auth & System Columns:' : 'System Columns:'}
          </span>
          <div class="system-fields">
            <span class="pill" title="Primary Key (string)">id ${tag('PK')}</span>
            ${isAuth
              ? html`
                  <span class="pill auth" title="Required unique login username">
                    <admin-icon name="user" size="11"></admin-icon>username
                    <moul-badge tone="primary" size="sm">unique</moul-badge>
                  </span>
                  <span class="pill auth" title="Required unique email address">
                    <admin-icon name="user" size="11"></admin-icon>email
                    <moul-badge tone="primary" size="sm">unique</moul-badge>
                  </span>
                  <span class="pill auth" title="Bcrypt password hash (hidden from read APIs)">
                    <admin-icon name="shield-check" size="11"></admin-icon>passwordHash
                  </span>
                  <span class="pill" title="Creation ISO-8601 timestamp">createdAt</span>
                  <span class="pill" title="Last updated ISO-8601 timestamp">updatedAt</span>
                `
              : html`
                  <span class="pill" title="Creation ISO-8601 timestamp">createdAt ${tag('datetime')}</span>
                  <span class="pill" title="Last updated ISO-8601 timestamp">updatedAt ${tag('datetime')}</span>
                `}
          </div>
        </div>
        <span class="system-banner-right">Auto-managed</span>
      </div>
    `;
  }

  /** Label of the button that opens a field's options panel, by type. */
  private renderOptionsToggle(field: MoulField, index: number, isExpanded: boolean) {
    const hasLimits = field.min !== undefined || field.max !== undefined;
    let icon = 'sliders';
    let label: string;
    let configured = hasLimits;
    switch (field.type) {
      case 'relation':
        icon = 'link';
        configured = Boolean(field.relationConfig?.targetMoul);
        label = field.relationConfig?.targetMoul
          ? `➔ ${field.relationConfig.targetMoul} (${field.relationConfig.cardinality || '1:N'})`
          : 'Configure Relation';
        break;
      case 'cloak':
        icon = 'lock-key';
        configured = Boolean(field.searchable);
        label = field.searchable ? 'Searchable' : 'Cloak Options';
        break;
      case 'select':
        icon = 'tag';
        configured = (field.options || []).length > 0;
        label = `${(field.options || []).length} options`;
        break;
      case 'text':
      case 'editor':
        label = hasLimits ? `${field.min ?? 0}..${field.max ?? '∞'} chars` : 'Length Limits';
        break;
      default:
        label = hasLimits ? `${field.min ?? '-∞'}..${field.max ?? '+∞'}` : 'Value Range';
    }
    return html`
      <moul-button
        variant=${configured ? 'secondary' : 'outline'}
        size="sm"
        aria-label=${`Configure options for ${field.name || `field ${index + 1}`}`}
        aria-expanded=${isExpanded ? 'true' : 'false'}
        @click=${onPress(() => (this.expanded = { ...this.expanded, [index]: !isExpanded }))}
      >
        <admin-icon slot="prefix" name=${icon} size="13" color="var(--color-primary-500)"></admin-icon>
        <span class="truncate">${label}</span>
        <admin-icon slot="suffix" name=${isExpanded ? 'caret-up' : 'caret-down'} size="12"></admin-icon>
      </moul-button>
    `;
  }

  private renderWarnings(field: MoulField, index: number, info: ReturnType<typeof describeField>) {
    const warning = (text: unknown, action: unknown = nothing) => html`
      <div class="warning">
        <admin-icon name="warning-circle" size="14"></admin-icon>
        <span>${text}</span>
        ${action}
      </div>
    `;
    return html`
      <div class="warnings">
        ${info.isEmpty ? warning('Field name is required.') : nothing}
        ${info.isConflict
          ? warning(
              `“${field.name}” is already a built-in default column for ${this.collectionType} collections. Please rename or remove it.`,
            )
          : nothing}
        ${!info.isConflict && !info.isEmpty && info.isInvalidCamel
          ? warning(
              `Field name “${field.name}” must be camelCase (e.g. “authorId”, “viewsCount”).`,
              info.canSuggestFix
                ? html`
                    <moul-button variant="secondary" size="sm" @click=${onPress(() => this.changeField(index, 'name', info.suggestedCamel))}>
                      Use “${info.suggestedCamel}”
                    </moul-button>
                  `
                : nothing,
            )
          : nothing}
        ${info.isDuplicate && !info.isConflict
          ? warning(`Field name “${field.name}” is already used in another field. Field names must be unique.`)
          : nothing}
        ${info.hasMinMaxConflict ? warning(`Minimum (${field.min}) cannot be greater than maximum (${field.max}).`) : nothing}
        ${info.hasSelectError ? warning('Select field requires at least one allowed option.') : nothing}
        ${info.hasUniqueError ? warning(`Field “${field.name}” of type “${field.type}” cannot have a unique constraint.`) : nothing}
      </div>
    `;
  }

  private renderRelationPanel(field: MoulField, index: number) {
    const select = (key: keyof RelationConfig) => (e: CustomEvent<{ selectedKey: string }>) => {
      if (e.detail.selectedKey) this.changeRelation(index, key, e.detail.selectedKey);
    };
    return html`
      <div class="panel-section">
        <div class="relation-banner">
          <admin-icon name="info" size="15" color="var(--color-primary-500)"></admin-icon>
          <span>Relational link from <strong>${this.currentMoulName || 'this collection'}</strong> to target collection.</span>
        </div>
        <div class="relation-grid">
          <moul-select
            label="Target Collection"
            placeholder="Choose collection"
            selected-key=${field.relationConfig?.targetMoul || this.allMouls[0]?.name || 'users'}
            @selectionchange=${select('targetMoul')}
          >
            ${this.allMouls.map(
              (m) => html`
                <moul-select-item key=${m.name}>
                  ${m.name} ${m.name === this.currentMoulName ? '(Self)' : `(${m.type})`}
                </moul-select-item>
              `,
            )}
          </moul-select>
          <moul-select
            label="Relationship Type"
            placeholder="Choose cardinality"
            selected-key=${field.relationConfig?.cardinality || '1:N'}
            @selectionchange=${select('cardinality')}
          >
            <moul-select-item key="1:N">1:N — Single Reference (Many-to-One)</moul-select-item>
            <moul-select-item key="1:1">1:1 — Unique Reference (One-to-One)</moul-select-item>
            <moul-select-item key="M:N">M:N — Multiple References (Many-to-Many)</moul-select-item>
          </moul-select>
          <moul-select
            label="When Target is Deleted"
            placeholder="Choose delete rule"
            selected-key=${field.relationConfig?.onDelete || 'SET_NULL'}
            @selectionchange=${select('onDelete')}
          >
            <moul-select-item key="SET_NULL">SET_NULL (Clear link, keep record)</moul-select-item>
            <moul-select-item key="CASCADE">CASCADE (Delete record too)</moul-select-item>
            <moul-select-item key="RESTRICT">RESTRICT (Prevent deleting target)</moul-select-item>
          </moul-select>
        </div>
      </div>
    `;
  }

  private renderSelectPanel(field: MoulField, index: number) {
    const options = field.options || [];
    return html`
      <div class="panel-section">
        <moul-tag-group
          label="Allowed Options"
          is-removable
          @remove=${(e: CustomEvent<{ key: string }>) => this.removeOption(index, e.detail.key)}
        >
          ${repeat(
            options,
            (option) => option,
            (option) => html`<moul-tag key=${option} size="sm" is-removable>${option}</moul-tag>`,
          )}
        </moul-tag-group>
        ${options.length === 0
          ? html`<span class="options-empty">No options added yet. Type an option name below and press Add.</span>`
          : nothing}
        <div class="add-option">
          <moul-text-field
            aria-label="New option name"
            placeholder="Option name (e.g. published)"
            .value=${this.newOptions[index] || ''}
            @input=${(e: Event) => (this.newOptions = { ...this.newOptions, [index]: fieldValue(e) })}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                this.addOption(index);
              }
            }}
          ></moul-text-field>
          <moul-button variant="secondary" @click=${onPress(() => this.addOption(index))}>Add</moul-button>
        </div>
      </div>
    `;
  }

  private renderLimitsPanel(field: MoulField, index: number, kind: 'text' | 'number') {
    const isText = kind === 'text';
    const limit = (key: 'min' | 'max') => (e: Event) => {
      const value = (e.target as HTMLElement & { value: number | null }).value;
      this.changeField(index, key, value ?? undefined);
    };
    return html`
      <div class="panel-section">
        <span class="constraint-label">${isText ? 'Character Length Limits (optional):' : 'Numeric Range Limits (optional):'}</span>
        <div class="number-row">
          <moul-number-field
            label=${isText ? 'Min Characters' : 'Minimum Value'}
            min=${isText ? 0 : nothing}
            .value=${field.min ?? null}
            @input=${limit('min')}
          ></moul-number-field>
          <moul-number-field
            label=${isText ? 'Max Characters' : 'Maximum Value'}
            min=${isText ? 0 : nothing}
            .value=${field.max ?? null}
            @input=${limit('max')}
          ></moul-number-field>
        </div>
      </div>
    `;
  }

  private renderCloakPanel(field: MoulField, index: number) {
    return html`
      <div class="panel-section">
        <div class="security-header">
          <admin-icon name="lock-key" size="16" color="var(--color-primary-500)"></admin-icon>
          <span class="security-title">Encrypted Field (Cloak) Security Configuration</span>
        </div>
        <moul-checkbox
          ?is-checked=${Boolean(field.searchable)}
          @change=${(e: CustomEvent<{ isChecked: boolean }>) => this.changeField(index, 'searchable', e.detail.isChecked)}
        >
          <span class="security-title" style="font-weight: 500">Enable Searchable Ciphertext (Blind Indexing)</span>
        </moul-checkbox>
        <span class="security-description">
          Enables exact equality queries on encrypted fields using a deterministic blind index HMAC without revealing
          plaintext to the database server.
        </span>
      </div>
    `;
  }

  private renderField(field: MoulField, index: number) {
    const info = describeField(field, index, this.fields, this.collectionType);
    const type = field.type;
    const isText = type === 'text' || type === 'editor';
    const isConfigurable = ['relation', 'select', 'number', 'cloak'].includes(type) || isText;
    const isExpanded = Boolean(this.expanded[index]);
    const label = field.name || `field ${index + 1}`;

    return html`
      <div class="field-card ${type === 'relation' ? 'relation' : ''} ${info.isInvalid ? 'invalid' : ''}">
        <div class="card-content">
          <div class="top-row">
            <div class="order">
              <span class="order-number">${index + 1}</span>
              <div class="order-actions">
                <moul-tooltip content="Move up">
                  <moul-button
                    variant="outline"
                    size="sm"
                    is-icon
                    aria-label=${`Move ${label} up`}
                    ?is-disabled=${index === 0}
                    @click=${onPress(() => this.moveField(index, -1))}
                  >
                    <admin-icon name="caret-up" size="12"></admin-icon>
                  </moul-button>
                </moul-tooltip>
                <moul-tooltip content="Move down">
                  <moul-button
                    variant="outline"
                    size="sm"
                    is-icon
                    aria-label=${`Move ${label} down`}
                    ?is-disabled=${index === this.fields.length - 1}
                    @click=${onPress(() => this.moveField(index, 1))}
                  >
                    <admin-icon name="caret-down" size="12"></admin-icon>
                  </moul-button>
                </moul-tooltip>
              </div>
            </div>

            <moul-text-field
              class="name ${info.isInvalid ? 'invalid' : ''}"
              aria-label=${`Field ${index + 1} name`}
              aria-invalid=${info.isInvalid ? 'true' : 'false'}
              placeholder="fieldName (e.g. authorId)"
              .value=${field.name}
              @input=${(e: Event) => this.changeField(index, 'name', fieldValue(e))}
            ></moul-text-field>

            <moul-select
              class="type"
              aria-label=${`Field ${index + 1} type`}
              placeholder="Select Type"
              selected-key=${type}
              @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
                if (e.detail.selectedKey) this.changeField(index, 'type', e.detail.selectedKey);
              }}
            >
              ${FIELD_TYPES.map(
                (t) => html`
                  <moul-select-item key=${t.id} value=${t.label}>
                    <span class="type-item">
                      <admin-icon name=${t.icon} size="15" color="var(--color-primary-500)"></admin-icon>
                      ${t.label}
                    </span>
                  </moul-select-item>
                `,
              )}
            </moul-select>

            <moul-tooltip content="Remove field">
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Remove field ${label}`} @click=${onPress(() => this.removeField(index))}>
                <admin-icon name="trash" size="16" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </moul-tooltip>
          </div>

          <div class="bottom-row">
            <div class="checkboxes">
              <moul-checkbox
                ?is-checked=${Boolean(field.required)}
                aria-label=${`Required constraint for ${label}`}
                @change=${(e: CustomEvent<{ isChecked: boolean }>) => this.changeField(index, 'required', e.detail.isChecked)}
              >
                Required
              </moul-checkbox>
              <moul-checkbox
                ?is-checked=${info.isUniqueEligible && Boolean(field.unique)}
                ?is-disabled=${!info.isUniqueEligible}
                title=${info.isUniqueEligible ? '' : `Unique constraint is not supported for ${type} fields`}
                aria-label=${info.isUniqueEligible ? `Unique constraint for ${label}` : `Unique constraint not supported for ${label}`}
                @change=${(e: CustomEvent<{ isChecked: boolean }>) => this.changeField(index, 'unique', e.detail.isChecked)}
              >
                Unique
              </moul-checkbox>
            </div>
            ${isConfigurable ? this.renderOptionsToggle(field, index, isExpanded) : nothing}
          </div>

          ${info.isInvalid ? this.renderWarnings(field, index, info) : nothing}
        </div>

        ${isExpanded && isConfigurable
          ? html`
              <div class="panel">
                ${type === 'relation' ? this.renderRelationPanel(field, index) : nothing}
                ${type === 'select' ? this.renderSelectPanel(field, index) : nothing}
                ${isText ? this.renderLimitsPanel(field, index, 'text') : nothing}
                ${type === 'number' ? this.renderLimitsPanel(field, index, 'number') : nothing}
                ${type === 'cloak' ? this.renderCloakPanel(field, index) : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="header">
        <div class="title-group">
          <h3>
            <admin-icon name="sliders" size="16" color="var(--color-primary-500)"></admin-icon>
            Schema Fields
          </h3>
          <span class="subtitle">Define custom columns, data types, and relationships.</span>
        </div>
        <moul-button variant="primary" @click=${onPress(() => this.addField())}>
          <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
          Add Field
        </moul-button>
      </div>

      ${this.renderSystemFields()}
      ${this.fields.length === 0
        ? html`
            <moul-empty-state variant="bordered" size="sm">
              <span slot="title">No custom fields</span>
              <span slot="description">Click '+ Add Field' to start defining custom columns.</span>
            </moul-empty-state>
          `
        : html`<div class="field-list">${this.fields.map((field, index) => this.renderField(field, index))}</div>`}
    `;
  }
}

customElements.define('admin-fields-builder', AdminFieldsBuilder);

declare global {
  interface HTMLElementTagNameMap {
    'admin-fields-builder': AdminFieldsBuilder;
  }
}
