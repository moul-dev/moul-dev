import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { api } from '../api/client';
import { fieldValue, submitOnEnter } from '../lib/forms';
import { onPress } from '../lib/press';
import { MutationController, QueryController, queryClient } from '../lib/query';
import { toast } from '../lib/toast';
import { baseStyles } from '../styles/base';
import { pageHeader, pageStyles } from '../styles/page';

type Flag = { key: string; description?: string; enabled?: boolean };

const DEFAULT_CONTEXT = '{\n  "user_id": "usr_123",\n  "role": "beta"\n}';

const CONTEXT_PRESETS: { label: string; json: string }[] = [
  { label: 'Standard User', json: '{\n  "user_id": "usr_standard_123"\n}' },
  { label: 'Beta Tester', json: '{\n  "user_id": "usr_beta_456",\n  "role": "beta_tester"\n}' },
  { label: 'Internal Staff', json: '{\n  "user_id": "usr_staff_789",\n  "groups": ["internal_staff"]\n}' },
  { label: 'Rollout Target', json: '{\n  "target_id": "user_bucket_42",\n  "percentage": 50\n}' },
];

/** Feature flags: on/off toggles, creation, deletion, and a playground to evaluate a flag against a context. */
export class AdminFlagsPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
      :host {
        --page-gap: var(--spacing-4);
      }

      .flags {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
      }

      .flag {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-3);
        width: 100%;
      }

      .flag-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .flag-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .flag-key {
        font-family: var(--font-mono);
        font-size: 1rem;
        font-weight: 600;
      }

      .flag-description {
        font-size: 0.8125rem;
        color: var(--color-fg-subtle);
      }

      .flag-actions,
      .presets {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .drawer-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        width: 100%;
        font-size: 1rem;
        font-weight: 600;
      }

      .drawer-title span {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        color: var(--color-fg);
      }

      .presets-label,
      .outcome-label {
        display: block;
        margin-bottom: var(--spacing-1);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-fg-subtle);
      }

      .json-error {
        font-size: var(--font-size-sm);
        color: var(--color-error-500);
      }

      .result {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        margin-top: var(--spacing-2);
        padding: var(--spacing-4);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-sm);
      }

      .result code {
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
      }

      .outcome {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        font-weight: 700;
      }
    `,
  ];

  static override properties = {
    isCreateOpen: { state: true },
    flagToDelete: { state: true },
    newKey: { state: true },
    newDescription: { state: true },
    newEnabled: { state: true },
    isEvalOpen: { state: true },
    evalKey: { state: true },
    evalContext: { state: true },
    evalJsonError: { state: true },
    evalResult: { state: true },
  };

  declare isCreateOpen: boolean;
  declare flagToDelete: Flag | null;
  declare newKey: string;
  declare newDescription: string;
  declare newEnabled: boolean;
  declare isEvalOpen: boolean;
  declare evalKey: string;
  declare evalContext: string;
  declare evalJsonError: string | null;
  declare evalResult: any | null;

  private readonly flags = new QueryController(this, () => ({
    queryKey: ['flags'],
    queryFn: api.listFeatureFlags,
  }));

  private readonly createMutation = new MutationController(this, {
    mutationFn: (data: any) => api.createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      this.isCreateOpen = false;
      this.resetCreateForm();
      toast.success('Flag Created', 'Feature flag was created successfully.');
    },
    onError: (err: any) => toast.error('Create Failed', err.message || 'Failed to create feature flag.'),
  });

  private readonly updateMutation = new MutationController(this, {
    mutationFn: ({ key, data }: { key: string; data: any }) => api.updateFeatureFlag(key, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flags'] }),
    onError: (err: any) => {
      // Re-read the server state so the switch springs back.
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      toast.error('Update Failed', err.message || 'Failed to update feature flag.');
    },
  });

  private readonly deleteMutation = new MutationController(this, {
    mutationFn: (key: string) => api.deleteFeatureFlag(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      this.flagToDelete = null;
      toast.success('Flag Deleted', 'Feature flag was deleted successfully.');
    },
    onError: (err: any) => {
      this.flagToDelete = null;
      toast.error('Delete Failed', err.message || 'Failed to delete feature flag.');
    },
  });

  private readonly evalMutation = new MutationController(this, {
    mutationFn: ({ key, context }: { key: string; context: unknown }) => api.evalFeatureFlag(key, context),
    onSuccess: (data) => {
      this.evalResult = data;
    },
    onError: (err: any) => toast.error('Evaluation Failed', err.message || 'Failed to evaluate feature flag.'),
  });

  constructor() {
    super();
    this.isCreateOpen = false;
    this.flagToDelete = null;
    this.isEvalOpen = false;
    this.evalKey = '';
    this.evalContext = DEFAULT_CONTEXT;
    this.evalJsonError = null;
    this.evalResult = null;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.newKey = '';
    this.newDescription = '';
    this.newEnabled = true;
  }

  private create() {
    if (!this.newKey.trim()) {
      toast.error('Validation Error', 'Flag key is required.');
      return;
    }
    this.createMutation.mutate({
      key: this.newKey.trim(),
      description: this.newDescription.trim(),
      enabled: this.newEnabled,
      value_type: 'boolean',
      variations: [
        { value: true, name: 'On' },
        { value: false, name: 'Off' },
      ],
      rules: [],
    });
  }

  private openEval(key?: string) {
    const flags: Flag[] = this.flags.data ?? [];
    this.evalKey = key || flags[0]?.key || '';
    this.evalResult = null;
    this.evalJsonError = null;
    this.isEvalOpen = true;
  }

  /** Parses the context in the page, so a JSON typo shows inline instead of as a failed request. */
  private runEval() {
    this.evalJsonError = null;
    let context: unknown = {};
    if (this.evalContext.trim()) {
      try {
        context = JSON.parse(this.evalContext);
      } catch (e: any) {
        this.evalJsonError = `Invalid JSON format: ${e.message}`;
        return;
      }
    }
    this.evalMutation.mutate({ key: this.evalKey, context });
  }

  private renderFlag(flag: Flag) {
    return html`
      <moul-card>
        <moul-card-body>
          <div class="flag">
            <div class="flag-info">
              <div class="flag-title">
                <admin-icon name="flag" size="18" color="var(--color-primary-500)"></admin-icon>
                <span class="flag-key">${flag.key}</span>
                ${flag.enabled
                  ? html`<moul-badge tone="success">Enabled</moul-badge>`
                  : html`<moul-badge variant="bordered">Disabled</moul-badge>`}
              </div>
              ${flag.description ? html`<span class="flag-description">${flag.description}</span>` : nothing}
            </div>
            <div class="flag-actions">
              <moul-button variant="outline" aria-label=${`Test evaluate flag ${flag.key}`} @click=${onPress(() => this.openEval(flag.key))}>
                <admin-icon slot="prefix" name="flask" size="14"></admin-icon>
                Evaluate
              </moul-button>
              <moul-switch
                aria-label=${`Toggle flag ${flag.key}`}
                ?is-checked=${Boolean(flag.enabled)}
                @change=${(e: CustomEvent<{ isChecked: boolean }>) =>
                  this.updateMutation.mutate({ key: flag.key, data: { enabled: e.detail.isChecked } })}
              >
                ${flag.enabled ? 'Enabled' : 'Disabled'}
              </moul-switch>
              <moul-button variant="ghost" is-icon aria-label=${`Delete flag ${flag.key}`} @click=${onPress(() => (this.flagToDelete = flag))}>
                <admin-icon name="trash" size="16" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `;
  }

  private renderList() {
    const { data: flags, isLoading } = this.flags.result;
    if (isLoading) return html`<div class="muted">Loading feature flags...</div>`;
    if (!flags || flags.length === 0) {
      return html`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="flag" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No feature flags</span>
          <span slot="description">Add flags to safely toggle features and manage rollouts.</span>
          <moul-button slot="actions" variant="primary" @click=${onPress(() => (this.isCreateOpen = true))}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Flag
          </moul-button>
        </moul-empty-state>
      `;
    }
    return html`<div class="flags">${repeat(flags as Flag[], (f) => f.key, (f) => this.renderFlag(f))}</div>`;
  }

  private renderEvalDrawer() {
    const flags: Flag[] = this.flags.data ?? [];
    const result = this.evalResult;
    return html`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isEvalOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (e.target === e.currentTarget) this.isEvalOpen = e.detail.isOpen;
        }}
      >
        <div slot="header" class="drawer-title">
          <span>
            <admin-icon name="flask" size="20" color="var(--color-primary-500)"></admin-icon>
            Feature Flag Eval Playground
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${onPress(() => (this.isEvalOpen = false))}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <div class="form">
          ${flags.length > 0
            ? html`
                <moul-select
                  label="Select Target Flag"
                  selected-key=${this.evalKey}
                  @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
                    if (!e.detail.selectedKey) return;
                    this.evalKey = e.detail.selectedKey;
                    this.evalResult = null;
                  }}
                >
                  ${flags.map((f) => html`<moul-select-item key=${f.key} value=${f.key}>${f.key} (${f.enabled ? 'ON' : 'OFF'})</moul-select-item>`)}
                </moul-select>
              `
            : nothing}

          <div>
            <span class="presets-label">Quick Context Presets</span>
            <div class="presets">
              ${CONTEXT_PRESETS.map(
                (p) => html`
                  <moul-button
                    variant="outline"
                    size="sm"
                    @click=${onPress(() => {
                      this.evalContext = p.json;
                      this.evalJsonError = null;
                    })}
                  >
                    ${p.label}
                  </moul-button>
                `,
              )}
            </div>
          </div>

          <moul-text-area
            label="Evaluation Context (JSON)"
            rows="6"
            description="Attributes passed to targeting gates & percentage rollouts"
            .value=${this.evalContext}
            @input=${(e: Event) => (this.evalContext = fieldValue(e))}
          ></moul-text-area>

          ${this.evalJsonError ? html`<div class="json-error">${this.evalJsonError}</div>` : nothing}
          ${result
            ? html`
                <div class="result">
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <span class="outcome-label" style="margin: 0">Evaluation Outcome</span>
                    <moul-badge tone=${result.value ? 'success' : 'error'}>
                      <span class="outcome">
                        <admin-icon name=${result.value ? 'check-circle' : 'x-circle'} weight="bold" size="15"></admin-icon>
                        ${String(result.value).toUpperCase()}
                      </span>
                    </moul-badge>
                  </div>
                  <div>Reason Code: <code>${result.reason || 'evaluated'}</code></div>
                  ${result.variation !== undefined
                    ? html`<div class="muted">Variation: <strong>${String(result.variation)}</strong></div>`
                    : nothing}
                </div>
              `
            : nothing}
        </div>

        <moul-button slot="footer" variant="ghost" @click=${onPress(() => (this.isEvalOpen = false))}>Close</moul-button>
        <moul-button
          slot="footer"
          variant="primary"
          ?is-disabled=${!this.evalKey}
          ?is-pending=${this.evalMutation.isPending}
          @click=${onPress(() => this.runEval())}
        >
          <admin-icon slot="prefix" name="play" weight="fill" size="14"></admin-icon>
          Run Evaluation
        </moul-button>
      </moul-drawer>
    `;
  }

  private renderCreateDrawer() {
    const isPending = this.createMutation.isPending;
    return html`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isCreateOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (e.target === e.currentTarget) this.isCreateOpen = e.detail.isOpen;
        }}
      >
        <div slot="header" class="drawer-title">
          <span>Create Feature Flag</span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${onPress(() => (this.isCreateOpen = false))}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>
        <form
          class="form"
          @submit=${(e: SubmitEvent) => {
            e.preventDefault();
            this.create();
          }}
          @keydown=${submitOnEnter}
        >
          <moul-text-field
            label="Flag Key"
            placeholder="e.g. enable_beta_dashboard"
            description="Unique snake_case identifier"
            is-required
            .value=${this.newKey}
            @input=${(e: Event) => (this.newKey = fieldValue(e))}
          ></moul-text-field>
          <moul-text-field
            label="Description"
            placeholder="What does this feature flag toggle?"
            .value=${this.newDescription}
            @input=${(e: Event) => (this.newDescription = fieldValue(e))}
          ></moul-text-field>
          <moul-checkbox ?is-checked=${this.newEnabled} @change=${(e: CustomEvent<{ isChecked: boolean }>) => (this.newEnabled = e.detail.isChecked)}>
            Enable by default
          </moul-checkbox>
        </form>
        <moul-button slot="footer" variant="ghost" @click=${onPress(() => (this.isCreateOpen = false))}>Cancel</moul-button>
        <moul-button slot="footer" variant="primary" ?is-disabled=${isPending} @click=${onPress(() => this.create())}>
          ${isPending ? 'Creating...' : 'Create Flag'}
        </moul-button>
      </moul-drawer>
    `;
  }

  override render() {
    const flag = this.flagToDelete;
    return html`
      ${pageHeader(
        'Feature Flags',
        'Feature toggles and gradual rollouts.',
        html`
          <moul-button variant="secondary" @click=${onPress(() => this.openEval())}>
            <admin-icon slot="prefix" name="flask" size="16"></admin-icon>
            Playground
          </moul-button>
          <moul-button variant="primary" @click=${onPress(() => (this.isCreateOpen = true))}>
            <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
            New Flag
          </moul-button>
        `,
      )}
      ${this.renderList()} ${this.renderEvalDrawer()} ${this.renderCreateDrawer()}

      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${flag !== null}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (!e.detail.isOpen) this.flagToDelete = null;
        }}
      >
        <span slot="header">Delete Feature Flag</span>
        <p slot="body" style="margin: 0; font-size: var(--font-size-sm); color: var(--color-fg-subtle)">
          Are you sure you want to delete feature flag <strong>“${flag?.key}”</strong>?<br /><br />
          This action cannot be undone and will remove all targeting rules associated with this flag.
        </p>
        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.flagToDelete = null))}>Cancel</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          ?is-pending=${this.deleteMutation.isPending}
          @click=${onPress(() => {
            if (flag) this.deleteMutation.mutate(flag.key);
          })}
        >
          Delete
        </moul-button>
      </moul-alert-dialog>
    `;
  }
}

customElements.define('admin-flags-page', AdminFlagsPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-flags-page': AdminFlagsPage;
  }
}
