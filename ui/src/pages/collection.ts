import { css, html, LitElement, nothing } from 'lit';
import { api } from '../api/client';
import { deleteCollectionDialog } from '../components/collections/delete-collection-dialog';
import '../components/collections/fields-builder';
import { EMPTY_RULES, type MoulRules } from '../components/collections/rules-editor';
import '../components/collections/rules-editor';
import { onPress } from '../lib/press';
import { MutationController, QueryController, queryClient } from '../lib/query';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { toast } from '../lib/toast';
import { baseStyles } from '../styles/base';
import { pageStyles } from '../styles/page';
import { validateSchemaFields } from '../utils/fieldValidation';
import { type MoulField, prepareFieldsForSave } from '../utils/fields';

interface IncomingRelation {
  sourceMoul: string;
  fieldName: string;
  cardinality: string;
  onDelete: string;
}

/** Relation fields in other collections that point at `name`. */
function incomingRelations(allMouls: any[] | undefined, name: string): IncomingRelation[] {
  const incoming: IncomingRelation[] = [];
  for (const m of allMouls ?? []) {
    if (m.name === name) continue; // self-references are listed as outgoing
    for (const f of m.fields ?? []) {
      if (f.type === 'relation' && f.relationConfig?.targetMoul === name) {
        incoming.push({
          sourceMoul: m.name,
          fieldName: f.name,
          cardinality: f.relationConfig.cardinality || '1:N',
          onDelete: f.relationConfig.onDelete || 'SET_NULL',
        });
      }
    }
  }
  return incoming;
}

/** Schema editor for one collection: associations, fields, access rules, delete. */
export class AdminCollectionPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
      .page-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .associations {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .association-column {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .association-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .association {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-xs);
      }

      .association-path,
      .association-badges {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .association-badges {
        gap: 4px;
      }

      .target {
        color: var(--color-primary-400);
      }

      .none {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .danger-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 1rem;
        color: var(--color-error-500);
      }

      .danger-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-3);
      }

      .danger-row strong {
        display: block;
        font-size: var(--font-size-sm);
      }

      .danger-row span {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }
    `,
  ];

  static override properties = {
    fields: { state: true },
    rules: { state: true },
    isDeleteOpen: { state: true },
  };

  declare fields: MoulField[];
  declare rules: MoulRules;
  declare isDeleteOpen: boolean;

  private get moulName(): string {
    return router.location.params.moulName ?? '';
  }

  private readonly moul = new QueryController(this, () => ({
    queryKey: ['moul', this.moulName],
    queryFn: () => api.getMoul(this.moulName),
    enabled: Boolean(this.moulName),
  }));

  private readonly allMouls = new QueryController(this, () => ({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  }));

  /** The server copy the editable `fields` and `rules` were last reset from. */
  private loadedMoul: unknown;

  private readonly updateMutation = new MutationController(this, {
    mutationFn: (data: any) => api.updateMoul(this.moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moul', this.moulName] });
      queryClient.invalidateQueries({ queryKey: ['mouls'] });
      toast.success('Schema Saved', 'Collection schema and associations saved successfully.');
    },
    onError: (err: any) => {
      toast.error('Save Failed', err.message || 'Failed to save collection schema.');
    },
  });

  private readonly deleteMutation = new MutationController(this, {
    mutationFn: (name: string) => api.deleteMoul(name),
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: ['mouls'] });
      queryClient.removeQueries({ queryKey: ['moul', name] });
      this.isDeleteOpen = false;
      toast.success('Collection Deleted', `Collection "${name}" was deleted successfully.`);
      router.navigate('/collections');
    },
    onError: (err: any) => {
      this.isDeleteOpen = false;
      toast.error('Delete Failed', err.message || 'Failed to delete collection.');
    },
  });

  constructor() {
    super();
    this.fields = [];
    this.rules = { ...EMPTY_RULES };
    this.isDeleteOpen = false;
    new StoreController(this, router);
  }

  override willUpdate(): void {
    // Reset the editable copy whenever the server copy changes (first load, save, other collection).
    const moul = this.moul.data;
    if (moul && moul !== this.loadedMoul) {
      this.loadedMoul = moul;
      this.fields = moul.fields || [];
      this.rules = moul.rules || {};
    }
  }

  private save() {
    const validation = validateSchemaFields(this.fields, this.moul.data?.type || 'base');
    if (!validation.isValid) {
      toast.error('Schema Validation Error', validation.summaryErrors[0] || 'Please fix invalid field configurations.');
      return;
    }
    this.updateMutation.mutate({
      name: this.moulName,
      fields: prepareFieldsForSave(this.fields, this.moulName),
      rules: this.rules,
    });
  }

  private renderAssociations() {
    const name = this.moulName;
    const outgoing = this.fields.filter((f) => f.type === 'relation' && f.relationConfig);
    const incoming = incomingRelations(this.allMouls.data, name);
    const total = outgoing.length + incoming.length;
    const bordered = (text: string) => html`<moul-badge variant="bordered">${text}</moul-badge>`;

    return html`
      <moul-card>
        <moul-card-header>
          <div class="section-header">
            <h2>
              <admin-icon name="share-network" size="18" color="var(--color-primary-500)"></admin-icon>
              Associations & Relationships Graph
            </h2>
            ${total > 0
              ? html`<moul-badge tone="primary">${total} active association${total !== 1 ? 's' : ''}</moul-badge>`
              : bordered('0 active associations')}
          </div>
        </moul-card-header>
        <moul-card-body>
          <div class="associations">
            <div class="association-column">
              <div class="association-title">
                <admin-icon name="arrow-right" size="14" color="var(--color-primary-500)"></admin-icon>
                Outgoing References (${outgoing.length})
              </div>
              ${outgoing.length === 0
                ? html`<span class="none">No outgoing foreign relations configured in this collection.</span>`
                : outgoing.map(
                    (f) => html`
                      <div class="association">
                        <div class="association-path">
                          <admin-icon name="link" size="14" color="var(--color-primary-500)"></admin-icon>
                          <strong>${f.name}</strong>
                          <span class="muted">➔</span>
                          <strong class="target">${f.relationConfig?.targetMoul}</strong>
                          ${f.relationConfig?.targetMoul === name ? bordered('self') : nothing}
                        </div>
                        <div class="association-badges">
                          <moul-badge tone="primary">${f.relationConfig?.cardinality || '1:N'}</moul-badge>
                          ${bordered(f.relationConfig?.onDelete || 'SET_NULL')}
                        </div>
                      </div>
                    `,
                  )}
            </div>

            <div class="association-column">
              <div class="association-title">
                <admin-icon name="share-network" size="14" color="var(--color-success-500)"></admin-icon>
                Incoming References (${incoming.length})
              </div>
              ${incoming.length === 0
                ? html`<span class="none">No other collections reference ${name} yet.</span>`
                : incoming.map(
                    (inc) => html`
                      <div class="association">
                        <div class="association-path">
                          <strong class="target">${inc.sourceMoul}</strong>
                          <span class="muted">(${inc.fieldName})</span>
                          <span class="muted">➔</span>
                          <strong>${name}</strong>
                        </div>
                        <div class="association-badges">
                          <moul-badge tone="success">${inc.cardinality}</moul-badge>
                          ${bordered(inc.onDelete)}
                        </div>
                      </div>
                    `,
                  )}
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `;
  }

  override render() {
    const name = this.moulName;
    const moul = this.moul.data;
    if (this.moul.result.isLoading) {
      return html`<div class="muted">Loading collection schema...</div>`;
    }
    const isSaving = this.updateMutation.isPending;
    const openDelete = onPress(() => (this.isDeleteOpen = true));

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <admin-icon name="database" size="24" color="var(--color-primary-500)"></admin-icon>
            ${name}
            <moul-badge tone="primary">${moul?.type || 'base'}</moul-badge>
          </h1>
          <span class="page-subtitle">Configure fields, associations, and access rules.</span>
        </div>
        <div class="page-actions">
          <moul-button variant="danger-soft" aria-label=${`Delete collection ${name}`} @click=${openDelete}>
            <admin-icon slot="prefix" name="trash" size="16"></admin-icon>
            Delete
          </moul-button>
          <moul-button variant="primary" ?is-disabled=${isSaving} @click=${onPress(() => this.save())}>
            <admin-icon slot="prefix" name="floppy-disk" size="16"></admin-icon>
            ${isSaving ? 'Saving...' : 'Save Schema'}
          </moul-button>
        </div>
      </div>

      ${this.renderAssociations()}

      <moul-card>
        <moul-card-body>
          <admin-fields-builder
            current-moul-name=${name}
            collection-type=${moul?.type || 'base'}
            .fields=${this.fields}
            .allMouls=${this.allMouls.data ?? []}
            @fieldschange=${(e: CustomEvent<{ fields: MoulField[] }>) => (this.fields = e.detail.fields)}
          ></admin-fields-builder>
        </moul-card-body>
      </moul-card>

      <moul-card>
        <moul-card-body>
          <admin-rules-editor
            ?is-auth-collection=${moul?.type === 'auth'}
            .rules=${this.rules}
            @ruleschange=${(e: CustomEvent<{ rules: MoulRules }>) => (this.rules = e.detail.rules)}
          ></admin-rules-editor>
        </moul-card-body>
      </moul-card>

      <moul-card>
        <moul-card-header>
          <h2 class="danger-title">
            <admin-icon name="warning-circle" size="20"></admin-icon>
            Danger Zone
          </h2>
        </moul-card-header>
        <moul-card-body>
          <div class="danger-row">
            <div>
              <strong>Delete this collection</strong>
              <span>Permanently delete <code>${name}</code> and all of its records. This action cannot be undone.</span>
            </div>
            <moul-button variant="danger" @click=${openDelete}>
              <admin-icon slot="prefix" name="trash" size="16"></admin-icon>
              Delete Collection
            </moul-button>
          </div>
        </moul-card-body>
      </moul-card>

      ${deleteCollectionDialog({
        isOpen: this.isDeleteOpen,
        name,
        isPending: this.deleteMutation.isPending,
        confirmLabel: 'Delete Collection',
        onCancel: () => (this.isDeleteOpen = false),
        onConfirm: () => this.deleteMutation.mutate(name),
      })}
    `;
  }
}

customElements.define('admin-collection-page', AdminCollectionPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-collection-page': AdminCollectionPage;
  }
}
