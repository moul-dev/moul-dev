import { css, html, LitElement } from 'lit';
import { fieldValue } from '../../lib/forms';
import { onPress } from '../../lib/press';
import { baseStyles } from '../../styles/base';
import './rule-docs-modal';

export interface MoulRules {
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
}

export const EMPTY_RULES: Required<MoulRules> = {
  listRule: '',
  viewRule: '',
  createRule: '',
  updateRule: '',
  deleteRule: '',
};

type Preset = 'public' | 'auth' | 'owner' | 'admin';

const SIGNED_IN = '@request.auth.id != ""';
const SELF = 'id = @request.auth.id';
const OWNER = 'userId = @request.auth.id';
const ADMIN = '@request.auth.role = "admin"';

const every = (rule: string): MoulRules => ({
  listRule: rule,
  viewRule: rule,
  createRule: rule,
  updateRule: rule,
  deleteRule: rule,
});

function presetRules(preset: Preset, isAuthCollection: boolean): MoulRules {
  switch (preset) {
    case 'public':
      return every('');
    case 'auth':
      return every(SIGNED_IN);
    case 'owner':
      return isAuthCollection
        ? { listRule: SELF, viewRule: SELF, createRule: '', updateRule: SELF, deleteRule: SELF }
        : { listRule: '', viewRule: '', createRule: SIGNED_IN, updateRule: OWNER, deleteRule: OWNER };
    case 'admin':
      return every(ADMIN);
  }
}

interface RuleInput {
  key: keyof MoulRules;
  label: string;
  placeholder: (auth: boolean) => string;
  description: (auth: boolean) => string;
}

const RULE_INPUTS: RuleInput[] = [
  {
    key: 'listRule',
    label: 'List Records',
    placeholder: (auth) => (auth ? SELF : "e.g. status = 'published'"),
    description: (auth) => (auth ? `Default: ${SELF}` : 'Leave blank for public access.'),
  },
  {
    key: 'viewRule',
    label: 'View Record',
    placeholder: () => SELF,
    description: (auth) => (auth ? `Default: ${SELF}` : 'Leave blank for public access.'),
  },
  {
    key: 'createRule',
    label: 'Create Record',
    placeholder: (auth) => (auth ? 'Leave blank for public sign-ups' : "e.g. @request.auth.id != ''"),
    description: (auth) => (auth ? 'Leave blank for public sign-ups.' : 'Leave blank for public creation.'),
  },
  {
    key: 'updateRule',
    label: 'Update Record',
    placeholder: (auth) => (auth ? SELF : `e.g. ${OWNER}`),
    description: (auth) => (auth ? `Default: ${SELF}` : 'Leave blank for public editing.'),
  },
  {
    key: 'deleteRule',
    label: 'Delete Record',
    placeholder: (auth) => (auth ? SELF : `e.g. ${OWNER}`),
    description: (auth) => (auth ? `Default: ${SELF}` : 'Leave blank for public deletion.'),
  },
];

/**
 * The five access rules of a collection, with one-click presets and the rule reference.
 * Fires `ruleschange` (`detail.rules`) on every edit; set `rules` back to apply it.
 */
export class AdminRulesEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        width: 100%;
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
        color: var(--color-fg);
      }

      .subtitle {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .presets,
      .rules {
        display: flex;
        gap: var(--spacing-2);
      }

      .presets {
        align-items: center;
        flex-wrap: wrap;
      }

      .rules {
        flex-direction: column;
        gap: var(--spacing-3);
      }
    `,
  ];

  static override properties = {
    rules: { attribute: false },
    isAuthCollection: { type: Boolean, attribute: 'is-auth-collection' },
    isDocsOpen: { state: true },
  };

  declare rules: MoulRules;
  declare isAuthCollection: boolean;
  declare isDocsOpen: boolean;

  constructor() {
    super();
    this.rules = { ...EMPTY_RULES };
    this.isAuthCollection = false;
    this.isDocsOpen = false;
  }

  private emit(rules: MoulRules) {
    this.dispatchEvent(new CustomEvent('ruleschange', { detail: { rules } }));
  }

  override render() {
    const auth = this.isAuthCollection;
    const preset = (name: Preset) => onPress(() => this.emit(presetRules(name, auth)));

    return html`
      <div class="header">
        <div class="title-group">
          <h3>
            <admin-icon name="lock-key" size="16" color="var(--color-primary-500)"></admin-icon>
            Access Rules
          </h3>
          <span class="subtitle">Leave blank for public access.</span>
        </div>
        <moul-button variant="outline" @click=${onPress(() => (this.isDocsOpen = true))}>
          <admin-icon slot="prefix" name="book-open" size="16"></admin-icon>
          Examples
        </moul-button>
      </div>

      <div class="presets">
        <moul-button variant="outline" @click=${preset('public')}>Public</moul-button>
        <moul-button variant="outline" @click=${preset('auth')}>Authenticated</moul-button>
        <moul-button variant="outline" @click=${preset('owner')}>${auth ? 'Owner (Self)' : 'Owner Only'}</moul-button>
        <moul-button variant="outline" @click=${preset('admin')}>Admin Only</moul-button>
      </div>

      <div class="rules">
        ${RULE_INPUTS.map(
          (input) => html`
            <moul-text-field
              label=${input.label}
              placeholder=${input.placeholder(auth)}
              description=${input.description(auth)}
              .value=${this.rules[input.key] || ''}
              @input=${(e: Event) => this.emit({ ...this.rules, [input.key]: fieldValue(e) })}
            ></moul-text-field>
          `,
        )}
      </div>

      <admin-rule-docs-modal
        ?is-open=${this.isDocsOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => (this.isDocsOpen = e.detail.isOpen)}
      ></admin-rule-docs-modal>
    `;
  }
}

customElements.define('admin-rules-editor', AdminRulesEditor);

declare global {
  interface HTMLElementTagNameMap {
    'admin-rules-editor': AdminRulesEditor;
  }
}
