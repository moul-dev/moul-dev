import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { moulsCollection } from '../api/db';
import { collectionTypeBadge } from '../components/collections/collection-type';
import { deleteCollectionDialog } from '../components/collections/delete-collection-dialog';
import '../components/collections/fields-builder';
import { EMPTY_RULES, type MoulRules } from '../components/collections/rules-editor';
import '../components/collections/rules-editor';
import { fieldValue, submitOnEnter } from '../lib/forms';
import { LiveQueryController, TransactionController } from '../lib/live-query';
import { onPress } from '../lib/press';
import { router } from '../lib/router';
import { toast } from '../lib/toast';
import { baseStyles } from '../styles/base';
import { pageHeader, pageStyles } from '../styles/page';
import { validateSchemaFields } from '../utils/fieldValidation';
import { type MoulField, prepareFieldsForSave } from '../utils/fields';

const SELF = 'id = @request.auth.id';

/**
 * Auth collections default their rules to self-access; switching back to base clears exactly
 * those defaults and leaves custom rules alone.
 */
function rulesForType(type: string, rules: MoulRules): MoulRules {
  if (type === 'auth') {
    const selfIfEmpty = (rule?: string) => (rule === '' || rule === SELF || rule === undefined ? SELF : rule);
    return {
      listRule: selfIfEmpty(rules.listRule),
      viewRule: selfIfEmpty(rules.viewRule),
      createRule: rules.createRule || '',
      updateRule: selfIfEmpty(rules.updateRule),
      deleteRule: selfIfEmpty(rules.deleteRule),
    };
  }
  const clearSelf = (rule?: string) => (rule === SELF ? '' : rule);
  return {
    listRule: clearSelf(rules.listRule),
    viewRule: clearSelf(rules.viewRule),
    createRule: rules.createRule,
    updateRule: clearSelf(rules.updateRule),
    deleteRule: clearSelf(rules.deleteRule),
  };
}

/** Every collection as a card, with a drawer to create one and a guarded delete. */
export class AdminCollectionsPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
      :host {
        --page-gap: var(--spacing-4);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .card-top,
      .card-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .card-name {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 1.125rem;
        font-weight: 600;
      }

      .fields {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-1);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px var(--spacing-1);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .pill.accent {
        border-color: var(--color-primary-500);
        color: var(--color-primary-500);
        font-weight: 500;
      }

      .action-group {
        display: flex;
        gap: var(--spacing-1);
      }

      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .drawer-header h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        color: var(--color-fg);
      }

      .tab-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-block: var(--spacing-3);
      }
    `,
  ];

  static override properties = {
    isCreateOpen: { state: true },
    createTab: { state: true },
    collectionToDelete: { state: true },
    newName: { state: true },
    newType: { state: true },
    newFields: { state: true },
    newRules: { state: true },
    error: { state: true },
  };

  declare isCreateOpen: boolean;
  declare createTab: 'general' | 'rules';
  declare collectionToDelete: string | null;
  declare newName: string;
  declare newType: string;
  declare newFields: MoulField[];
  declare newRules: MoulRules;
  declare error: string | null;

  private readonly mouls = new LiveQueryController(this, (q) => q.from({ moul: moulsCollection }));
  private readonly creating = new TransactionController(this);
  private readonly deleting = new TransactionController(this);

  constructor() {
    super();
    this.isCreateOpen = false;
    this.collectionToDelete = null;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.newName = '';
    this.newType = 'base';
    this.newFields = [];
    this.newRules = { ...EMPTY_RULES };
    this.createTab = 'general';
    this.error = null;
  }

  private openCreate() {
    this.resetCreateForm();
    this.isCreateOpen = true;
  }

  private async handleCreate() {
    this.error = null;

    const name = this.newName.trim().toLowerCase();
    if (!name) {
      this.error = 'Collection name is required.';
      this.createTab = 'general';
      return;
    }
    if (moulsCollection.has(name)) {
      this.error = `A collection named "${name}" already exists.`;
      this.createTab = 'general';
      return;
    }

    const validation = validateSchemaFields(this.newFields, this.newType);
    if (!validation.isValid) {
      this.error = validation.summaryErrors[0] || 'Please fix invalid field configurations.';
      this.createTab = 'general';
      return;
    }

    const rules: MoulRules =
      this.newType === 'auth'
        ? {
            listRule: this.newRules.listRule || SELF,
            viewRule: this.newRules.viewRule || SELF,
            createRule: this.newRules.createRule || '',
            updateRule: this.newRules.updateRule || SELF,
            deleteRule: this.newRules.deleteRule || SELF,
          }
        : this.newRules;

    // Not optimistic: the server has the last word on the schema, and its error belongs in this form.
    const tx = moulsCollection.insert(
      { name, type: this.newType, fields: prepareFieldsForSave(this.newFields, name), rules },
      { optimistic: false },
    );
    try {
      await this.creating.track(tx);
    } catch (err: any) {
      this.error = err?.message || 'Failed to create collection';
      return;
    }
    this.isCreateOpen = false;
    this.resetCreateForm();
    toast.success('Collection Created', 'Collection created successfully.');
  }

  /** The card leaves at once; the dialog stays up until the server confirms, and a failure puts the card back. */
  private async deleteCollection(name: string) {
    try {
      await this.deleting.track(moulsCollection.delete(name));
      toast.success('Collection Deleted', 'Collection was deleted successfully.');
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Failed to delete collection.');
    } finally {
      this.collectionToDelete = null;
    }
  }

  private renderFieldPills(moul: any) {
    const pill = (text: string) => html`<span class="pill">${text}</span>`;
    return html`
      <div class="fields">
        <span>Fields:</span>
        ${pill('id')} ${pill('createdAt')} ${pill('updatedAt')}
        ${moul.type === 'auth' ? html`<span class="pill accent">username</span><span class="pill accent">email</span>` : nothing}
        ${(moul.fields || []).map((f: MoulField) =>
          f.type === 'relation' && f.relationConfig
            ? html`
                <span
                  class="pill accent"
                  title=${`Relation ${f.name} ➔ ${f.relationConfig.targetMoul} (${f.relationConfig.cardinality || '1:N'})`}
                >
                  <admin-icon name="link" size="12"></admin-icon>
                  ${f.name} ➔ ${f.relationConfig.targetMoul}
                </span>
              `
            : pill(`${f.name} (${f.type})`),
        )}
      </div>
    `;
  }

  private renderCard(moul: any) {
    const name: string = moul.name;
    return html`
      <moul-card>
        <moul-card-header>
          <div class="card-top">
            <span class="card-name">
              <admin-icon name="database" size="20" color="var(--color-primary-500)"></admin-icon>
              ${name}
            </span>
            ${collectionTypeBadge(moul.type)}
          </div>
        </moul-card-header>
        <moul-card-body>${this.renderFieldPills(moul)}</moul-card-body>
        <moul-card-footer>
          <div class="card-actions">
            <div class="action-group">
              <moul-button
                variant="secondary"
                @click=${onPress(() => router.navigate(`/records/${encodeURIComponent(name)}`, { search: { page: 1, perPage: 30 } }))}
              >
                <admin-icon slot="prefix" name="table" size="14"></admin-icon>
                Records
              </moul-button>
              <moul-button variant="ghost" @click=${onPress(() => router.navigate(`/collections/${encodeURIComponent(name)}`))}>
                <admin-icon slot="prefix" name="sliders" size="14"></admin-icon>
                Schema
              </moul-button>
            </div>
            <moul-tooltip content="Delete collection">
              <moul-button variant="ghost" is-icon aria-label=${`Delete collection ${name}`} @click=${onPress(() => (this.collectionToDelete = name))}>
                <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </moul-tooltip>
          </div>
        </moul-card-footer>
      </moul-card>
    `;
  }

  private renderList() {
    const { data: mouls, isLoading } = this.mouls;
    if (isLoading) return html`<div class="muted">Loading collections...</div>`;
    if (mouls.length === 0) {
      return html`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No collections yet</span>
          <span slot="description">Create your first collection to define your schema and store data.</span>
          <moul-button slot="actions" variant="primary" @click=${onPress(() => this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Collection
          </moul-button>
        </moul-empty-state>
      `;
    }
    return html`<div class="grid">${repeat(mouls, (m) => m.name, (m) => this.renderCard(m))}</div>`;
  }

  private renderCreateDrawer() {
    const isPending = this.creating.isPending;
    return html`
      <moul-drawer
        placement="right"
        size="lg"
        ?is-open=${this.isCreateOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (e.target === e.currentTarget) this.isCreateOpen = e.detail.isOpen;
        }}
      >
        <div slot="header" class="drawer-header">
          <h2>Create Collection</h2>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${onPress(() => (this.isCreateOpen = false))}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <form
          @submit=${(e: SubmitEvent) => {
            e.preventDefault();
            this.handleCreate();
          }}
          @keydown=${submitOnEnter}
        >
          ${this.error ? html`<moul-alert tone="error" description=${this.error}></moul-alert>` : nothing}

          <moul-tabs
            variant="line"
            selected-key=${this.createTab}
            @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
              if (e.target === e.currentTarget) this.createTab = e.detail.selectedKey as 'general' | 'rules';
            }}
          >
            <moul-tab slot="tab" key="general">General & Fields</moul-tab>
            <moul-tab slot="tab" key="rules">Rules</moul-tab>

            <moul-tab-panel key="general">
              <div class="tab-content">
                <moul-text-field
                  label="Collection Name"
                  placeholder="e.g. posts, products, customers"
                  description="Unique table name for this collection."
                  is-required
                  .value=${this.newName}
                  @input=${(e: Event) => (this.newName = fieldValue(e))}
                ></moul-text-field>
                <moul-select
                  label="Collection Type"
                  selected-key=${this.newType}
                  @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
                    if (!e.detail.selectedKey) return;
                    this.newType = e.detail.selectedKey;
                    this.newRules = rulesForType(this.newType, this.newRules);
                  }}
                >
                  <moul-select-item key="base">Base — Standard data collection</moul-select-item>
                  <moul-select-item key="auth">Auth — Users with authentication</moul-select-item>
                </moul-select>
                <admin-fields-builder
                  current-moul-name=${this.newName}
                  collection-type=${this.newType}
                  .fields=${this.newFields}
                  .allMouls=${this.mouls.data}
                  @fieldschange=${(e: CustomEvent<{ fields: MoulField[] }>) => (this.newFields = e.detail.fields)}
                ></admin-fields-builder>
              </div>
            </moul-tab-panel>

            <moul-tab-panel key="rules">
              <div class="tab-content">
                <admin-rules-editor
                  ?is-auth-collection=${this.newType === 'auth'}
                  .rules=${this.newRules}
                  @ruleschange=${(e: CustomEvent<{ rules: MoulRules }>) => (this.newRules = e.detail.rules)}
                ></admin-rules-editor>
              </div>
            </moul-tab-panel>
          </moul-tabs>
        </form>

        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.isCreateOpen = false))}>Cancel</moul-button>
        <moul-button slot="footer" variant="primary" ?is-disabled=${isPending} @click=${onPress(() => this.handleCreate())}>
          ${isPending ? 'Creating Collection...' : 'Create Collection'}
        </moul-button>
      </moul-drawer>
    `;
  }

  override render() {
    return html`
      ${pageHeader(
        'Collections Schema',
        'Manage schemas, fields, and access rules.',
        html`
          <moul-button variant="primary" @click=${onPress(() => this.openCreate())}>
            <admin-icon slot="prefix" name="plus" weight="bold" size="16"></admin-icon>
            New Collection
          </moul-button>
        `,
      )}
      ${this.renderList()} ${this.renderCreateDrawer()}
      ${deleteCollectionDialog({
        isOpen: this.collectionToDelete !== null,
        name: this.collectionToDelete ?? '',
        isPending: this.deleting.isPending,
        onCancel: () => (this.collectionToDelete = null),
        onConfirm: () => {
          if (this.collectionToDelete) void this.deleteCollection(this.collectionToDelete);
        },
      })}
    `;
  }
}

customElements.define('admin-collections-page', AdminCollectionsPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-collections-page': AdminCollectionsPage;
  }
}
