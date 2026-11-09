import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { api } from '../api/client';
import '../components/data-table';
import type { DataColumn } from '../components/data-table';
import { fieldValue, submitOnEnter } from '../lib/forms';
import { onPress } from '../lib/press';
import { MutationController, QueryController, queryClient } from '../lib/query';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { toast } from '../lib/toast';
import { auth } from '../state/auth';
import { baseStyles } from '../styles/base';
import { pageHeader, pageStyles } from '../styles/page';
import {
  firstMissing,
  initialValues,
  isRequired,
  type SettingField,
  SETTINGS_SECTIONS,
  type SettingsDrawer,
} from './settings-sections';

interface RateLimitRule {
  label: string;
  maxRequests: number;
  interval: number;
  targetedUsers: 'all' | 'authenticated' | 'guest' | string;
}

type DrawerMode = null | SettingsDrawer | 'ratelimit-add' | 'ratelimit-edit' | 'account' | 'password';

const TABS = [
  { key: 's3', icon: 'cloud', label: 'S3 Storage' },
  { key: 'litestream', icon: 'floppy-disk', label: 'Litestream Backups' },
  { key: 'ratelimit', icon: 'gauge', label: 'Rate Limiting' },
  { key: 'rootips', icon: 'globe-hemisphere-west', label: 'Root User IPs' },
  { key: 'email', icon: 'envelope-simple', label: 'Email Delivery' },
  { key: 'oauth', icon: 'lock-key', label: 'OAuth2 Providers' },
  { key: 'account', icon: 'user-gear', label: 'Root Account' },
];

const DRAWER_TITLES: Record<string, string> = {
  'ratelimit-add': 'Add Rate Limit Rule',
  'ratelimit-edit': 'Edit Rate Limit Rule',
  account: 'Edit Root User Account',
  password: 'Change Root Password',
};

const AUDIENCES = [
  { key: 'all', label: 'All Users (all)' },
  { key: 'authenticated', label: 'Authenticated Only (authenticated)' },
  { key: 'guest', label: 'Guests Only (guest)' },
];

const EMPTY_RULE: RateLimitRule = { label: '', maxRequests: 60, interval: 60, targetedUsers: 'all' };
const EMPTY_PASSWORD = { currentPassword: '', newPassword: '', passwordConfirm: '' };

function statusBadge(on: boolean, onLabel: string, offLabel: string) {
  return on ? html`<moul-badge tone="success">${onLabel}</moul-badge>` : html`<moul-badge variant="bordered">${offLabel}</moul-badge>`;
}

/** Engine settings: storage, backups, rate limits, root IPs, email, OAuth providers and the root account. */
export class AdminSettingsPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
      moul-tabs::part(tablist) {
        overflow-x: auto;
        scrollbar-width: none;
      }

      .tab-label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        white-space: nowrap;
      }

      moul-tab-panel {
        padding-block: var(--spacing-2);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        width: 100%;
      }

      .card-title {
        font-size: 1.125rem;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
      }

      .intro {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }

      .grid-2,
      .grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .grid-3 {
        grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .info-label {
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-subtle);
      }

      .info-value {
        font-size: var(--font-size-sm);
        word-break: break-all;
      }

      .info-code {
        display: inline-block;
        padding: var(--spacing-1) var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
      }

      .inline {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .provider-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-3);
      }

      .provider-name {
        font-size: var(--font-size-md);
        font-weight: 600;
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

      form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-inline: var(--spacing-1);
        color: var(--color-fg);
      }

      .dialog-text {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }
    `,
  ];

  static override properties = {
    drawerMode: { state: true },
    form: { state: true },
    snapshot: { state: true },
    editingRuleIndex: { state: true },
    ruleToDelete: { state: true },
    showDiscardDialog: { state: true },
  };

  declare drawerMode: DrawerMode;
  /** Values of the open drawer; settings drawers hold strings, the rule drawer a RateLimitRule. */
  declare form: Record<string, any>;
  /** JSON of `form` when the drawer opened, to detect unsaved changes. */
  declare snapshot: string;
  declare editingRuleIndex: number | null;
  declare ruleToDelete: { index: number; label: string } | null;
  declare showDiscardDialog: boolean;

  private readonly settings = new QueryController(this, () => ({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  }));

  private readonly account = new QueryController(this, () => ({
    queryKey: ['rootAccount'],
    queryFn: api.getRootAccount,
  }));

  private readonly updateMutation = new MutationController(this, {
    mutationFn: (data: Record<string, string>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      this.closeDrawer();
      toast.success('Settings Saved', 'Engine configuration updated successfully.');
    },
    onError: (err: any) => toast.error('Save Failed', err.message || 'Failed to update settings.'),
  });

  private readonly accountMutation = new MutationController(this, {
    mutationFn: (data: { username: string; name: string; email: string }) => api.updateRootAccount(data),
    onSuccess: (res: any) => {
      if (res.record) auth.updateUser({ username: res.record.username, name: res.record.name, email: res.record.email });
      if (res.token) auth.saveToken(res.token);
      queryClient.invalidateQueries({ queryKey: ['rootAccount'] });
      this.closeDrawer();
      toast.success('Account Updated', 'Root user account details updated successfully.');
    },
    onError: (err: any) => toast.error('Account Update Failed', err.message || 'Failed to update root user account.'),
  });

  private readonly passwordMutation = new MutationController(this, {
    mutationFn: (data: { currentPassword: string; password: string; passwordConfirm: string }) => api.updateRootPassword(data),
    onSuccess: () => {
      this.closeDrawer();
      toast.success('Password Updated', 'Root administrator password updated successfully.');
    },
    onError: (err: any) => toast.error('Password Update Failed', err.message || 'Failed to update root password.'),
  });

  constructor() {
    super();
    this.drawerMode = null;
    this.form = {};
    this.snapshot = '';
    this.editingRuleIndex = null;
    this.ruleToDelete = null;
    this.showDiscardDialog = false;
    new StoreController(this, router, auth);
  }

  private get tab(): string {
    const tab = router.location.search.get('tab');
    return TABS.some((t) => t.key === tab) ? tab! : 's3';
  }

  private scrolledToTab = '';

  override async updated(): Promise<void> {
    // A deep link or Back can select a tab past the edge of the scrolling tab strip.
    const tab = this.tab;
    const strip = this.renderRoot.querySelector('moul-tabs') as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
    if (tab === this.scrolledToTab || !strip) return;
    this.scrolledToTab = tab;
    await strip.updateComplete;
    this.renderRoot.querySelector(`moul-tab[key="${tab}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  private get saved(): Record<string, string> | undefined {
    return this.settings.data;
  }

  private get rules(): RateLimitRule[] {
    try {
      const parsed = JSON.parse(this.saved?.rate_limiting_rules || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private get isDirty(): boolean {
    return Boolean(this.drawerMode && this.snapshot && JSON.stringify(this.form) !== this.snapshot);
  }

  private get isSaving(): boolean {
    return this.updateMutation.isPending || this.accountMutation.isPending || this.passwordMutation.isPending;
  }

  private openDrawer(mode: Exclude<DrawerMode, null>, ruleIndex?: number) {
    let form: Record<string, any>;
    if (mode === 'account') {
      const account = this.account.data;
      const user = auth.user;
      form = {
        username: account?.username || user?.username || '',
        name: account?.name || user?.name || '',
        email: account?.email || user?.email || '',
      };
    } else if (mode === 'password') {
      form = { ...EMPTY_PASSWORD };
    } else if (mode === 'ratelimit-add') {
      form = { ...EMPTY_RULE };
    } else if (mode === 'ratelimit-edit') {
      form = { ...(this.rules[ruleIndex ?? -1] ?? EMPTY_RULE) };
    } else {
      form = initialValues(SETTINGS_SECTIONS[mode], this.saved);
    }
    this.editingRuleIndex = mode === 'ratelimit-edit' ? (ruleIndex ?? null) : null;
    this.form = form;
    this.snapshot = JSON.stringify(form);
    this.drawerMode = mode;
  }

  private closeDrawer() {
    this.drawerMode = null;
    this.editingRuleIndex = null;
    this.snapshot = '';
  }

  /** Close unless there are unsaved changes; then ask first. */
  private requestClose() {
    if (this.isDirty) this.showDiscardDialog = true;
    else this.closeDrawer();
  }

  /** Escape must not close a drawer with unsaved changes: catch it before <moul-drawer> does. */
  private readonly onDrawerKeydown = {
    capture: true,
    handleEvent: (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !this.isDirty) return;
      e.preventDefault();
      e.stopPropagation();
      this.showDiscardDialog = true;
    },
  };

  private set(key: string, value: unknown) {
    this.form = { ...this.form, [key]: value };
  }

  private save() {
    const mode = this.drawerMode;
    if (!mode) return;
    const form = this.form;

    if (mode === 'ratelimit-add' || mode === 'ratelimit-edit') {
      if (!String(form.label).trim()) {
        toast.error('Validation Error', 'Rate limit rule label is required.');
        return;
      }
      if (!(form.maxRequests > 0) || !(form.interval > 0)) {
        toast.error('Validation Error', 'Max requests and interval must be greater than 0.');
        return;
      }
      const rule: RateLimitRule = {
        label: String(form.label).trim(),
        maxRequests: Number(form.maxRequests),
        interval: Number(form.interval),
        targetedUsers: form.targetedUsers,
      };
      const rules = [...this.rules];
      if (mode === 'ratelimit-edit' && this.editingRuleIndex !== null) rules[this.editingRuleIndex] = rule;
      else rules.push(rule);
      this.updateMutation.mutate({ rate_limiting_rules: JSON.stringify(rules) });
      return;
    }

    if (mode === 'account') {
      if (!String(form.username).trim()) {
        toast.error('Validation Error', 'Username is required.');
        return;
      }
      this.accountMutation.mutate({ username: form.username.trim(), name: form.name.trim(), email: form.email.trim() });
      return;
    }

    if (mode === 'password') {
      if (!form.currentPassword) {
        toast.error('Validation Error', 'Current password is required.');
        return;
      }
      if (!form.newPassword) {
        toast.error('Validation Error', 'New password is required.');
        return;
      }
      if (form.newPassword !== form.passwordConfirm) {
        toast.error('Validation Error', 'New password and confirmation do not match.');
        return;
      }
      this.passwordMutation.mutate({
        currentPassword: form.currentPassword,
        password: form.newPassword,
        passwordConfirm: form.passwordConfirm,
      });
      return;
    }

    const missing = firstMissing(SETTINGS_SECTIONS[mode], form);
    if (missing) {
      toast.error('Validation Error', `${missing.label} is required.`);
      return;
    }
    this.updateMutation.mutate(form as Record<string, string>);
  }

  private deleteRule() {
    const target = this.ruleToDelete;
    if (!target) return;
    this.updateMutation.mutate({ rate_limiting_rules: JSON.stringify(this.rules.filter((_, i) => i !== target.index)) });
    this.ruleToDelete = null;
  }

  // ── Tab panels ───────────────────────────────────────────────────────────

  private card(icon: string, title: string, action: TemplateResult, body: TemplateResult, iconColor = 'var(--color-primary-500)') {
    return html`
      <moul-card>
        <moul-card-header>
          <div class="card-header">
            <span class="card-title">
              <admin-icon name=${icon} size="20" color=${iconColor}></admin-icon>
              ${title}
            </span>
            ${action}
          </div>
        </moul-card-header>
        <moul-card-body>${body}</moul-card-body>
      </moul-card>
    `;
  }

  private editButton(label: string, mode: Exclude<DrawerMode, null>, icon = 'pencil-simple', variant = 'outline') {
    return html`
      <moul-button variant=${variant} @click=${onPress(() => this.openDrawer(mode))}>
        <admin-icon slot="prefix" name=${icon} size="16"></admin-icon>
        ${label}
      </moul-button>
    `;
  }

  private info(label: string, value: unknown) {
    return html`<div class="info"><span class="info-label">${label}</span><span class="info-value">${value}</span></div>`;
  }

  private overview(intro: string, items: TemplateResult[]) {
    return html`<div class="section"><p class="intro">${intro}</p><div class="grid-2">${items}</div></div>`;
  }

  private renderRateLimits() {
    const s = this.saved;
    const enabled = s?.rate_limiting_enabled === 'true';
    const columns: DataColumn<RateLimitRule & { index: number }>[] = [
      { key: 'label', title: 'Rule Pattern / Route', render: (r) => html`<span style="font-weight: 600">${r.label}</span>` },
      { key: 'maxRequests', title: 'Max Requests', align: 'end', render: (r) => `${r.maxRequests} req` },
      { key: 'interval', title: 'Window (Seconds)', align: 'end', render: (r) => `${r.interval}s` },
      {
        key: 'targetedUsers',
        title: 'Targeted Audience',
        render: (r) => {
          const tone = r.targetedUsers === 'authenticated' ? 'primary' : r.targetedUsers === 'guest' ? 'warning' : '';
          const label = r.targetedUsers?.toUpperCase() || 'ALL';
          return tone ? html`<moul-badge tone=${tone}>${label}</moul-badge>` : html`<moul-badge variant="bordered">${label}</moul-badge>`;
        },
      },
      {
        key: '__actions',
        title: 'Actions',
        render: (r) => html`
          <span style="display: inline-flex; gap: var(--spacing-2)">
            <moul-tooltip content="Edit rule">
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Edit ${r.label}`} @click=${onPress(() => this.openDrawer('ratelimit-edit', r.index))}>
                <admin-icon name="pencil-simple" size="16"></admin-icon>
              </moul-button>
            </moul-tooltip>
            <moul-tooltip content="Delete rule">
              <moul-button
                variant="ghost"
                is-icon
                size="sm"
                aria-label=${`Delete ${r.label}`}
                @click=${onPress(() => (this.ruleToDelete = { index: r.index, label: r.label }))}
              >
                <admin-icon name="trash" size="16" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </moul-tooltip>
          </span>
        `,
      },
    ];
    return this.card(
      'gauge',
      'Rate Limiting & Abuse Prevention',
      html`
        <span class="inline" style="gap: var(--spacing-3)">
          <span class="inline">
            <span class="muted" style="font-size: var(--font-size-sm)">Global Throttle:</span>
            <moul-switch
              ?is-checked=${enabled}
              @change=${(e: CustomEvent<{ isChecked: boolean }>) =>
                this.updateMutation.mutate({ rate_limiting_enabled: e.detail.isChecked ? 'true' : 'false' })}
            >
              ${enabled ? 'Enabled' : 'Disabled'}
            </moul-switch>
          </span>
          ${this.editButton('Add Rule', 'ratelimit-add', 'plus', 'primary')}
        </span>
      `,
      html`
        <div class="section">
          <p class="intro">
            Configure granular sliding-window rate limiters per route, collection, or authentication status to protect against
            brute-force and DDoS attacks.
          </p>
          <admin-data-table
            aria-label="Rate Limit Rules Table"
            dense
            .columns=${columns}
            .rows=${this.rules.map((r, index) => ({ ...r, index }))}
            .rowKey=${(r: { index: number }) => String(r.index)}
          >
            <moul-empty-state slot="empty" size="sm">
              <admin-icon slot="icon" name="gauge" size="32" color="var(--color-fg-subtle)"></admin-icon>
              <span slot="title">No rate limit rules</span>
              <span slot="description">Add custom rules to protect sensitive endpoints from traffic spikes.</span>
              <moul-button slot="actions" variant="outline" @click=${onPress(() => this.openDrawer('ratelimit-add'))}>
                <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
                Add Rule
              </moul-button>
            </moul-empty-state>
          </admin-data-table>
        </div>
      `,
    );
  }

  private renderOAuth() {
    const s = this.saved;
    const provider = (key: string, name: string, icon: string, weight: string, color: string, mode: SettingsDrawer) => {
      const on = s?.[`oauth_${key}_enabled`] === 'true';
      return html`
        <moul-card>
          <moul-card-body>
            <div class="provider-header">
              <span class="inline">
                <admin-icon name=${icon} weight=${weight} size="22" color=${color}></admin-icon>
                <span class="provider-name">${name}</span>
              </span>
              ${statusBadge(on, 'ACTIVE', 'INACTIVE')}
            </div>
            ${this.info('Client ID', s?.[`oauth_${key}_client_id`] || 'Not configured')}
          </moul-card-body>
          <moul-card-footer>${this.editButton(`Configure ${name}`, mode, 'gear')}</moul-card-footer>
        </moul-card>
      `;
    };
    return html`
      <div class="section">
        ${this.card(
          'link-simple',
          'Global OAuth Callback Redirect URL',
          this.editButton('Configure Redirect', 'oauth-global'),
          this.info(
            'Application Redirect URL',
            s?.oauth_redirect_url ? html`<span class="info-code">${s.oauth_redirect_url}</span>` : '—',
          ),
        )}
        <div class="grid-3">
          ${provider('github', 'GitHub', 'github-logo', 'fill', 'var(--color-fg)', 'oauth-github')}
          ${provider('google', 'Google', 'google-logo', 'bold', '#EA4335', 'oauth-google')}
          ${provider('apple', 'Apple', 'apple-logo', 'fill', 'var(--color-fg)', 'oauth-apple')}
        </div>
      </div>
    `;
  }

  private renderAccount() {
    const account = this.account.data;
    const user = auth.user;
    const created = account?.createdAt || account?.created_at;
    const updated = account?.updatedAt || account?.updated_at;
    return this.card(
      'user-gear',
      'Root Administrator Account',
      html`<span class="inline">${this.editButton('Edit Account', 'account')} ${this.editButton('Change Password', 'password', 'lock-key', 'primary')}</span>`,
      this.overview(
        'The root administrator account maintains ultimate privileges over collections, engine configurations, access controls, and backups. You can update your display name, username, and email below.',
        [
          this.info('Display Name', account?.name || user?.name || user?.username || 'admin'),
          this.info('Username', `@${account?.username || user?.username || 'admin'}`),
          this.info('Email Address', account?.email || user?.email || 'None configured'),
          this.info('Role & Privileges', 'Root Superadministrator (Full Access)'),
          ...(created ? [this.info('Account Created', new Date(created).toLocaleString())] : []),
          ...(updated ? [this.info('Last Updated', new Date(updated).toLocaleString())] : []),
        ],
      ),
    );
  }

  private renderPanel(tab: string) {
    const s = this.saved;
    const dash = (value?: string) => value || '—';
    switch (tab) {
      case 's3':
        return this.card(
          'cloud',
          'S3 Object Storage',
          this.editButton('Configure S3', 's3'),
          this.overview(
            'Store and serve user-uploaded files directly through Amazon S3, Cloudflare R2, MinIO, or compatible S3 object storage providers instead of local disk.',
            [
              this.info('Status', statusBadge(s?.file_s3_enabled === 'true', 'ENABLED', 'DISABLED (LOCAL STORAGE)')),
              this.info('Bucket Name', dash(s?.file_s3_bucket)),
              this.info('Endpoint URL', dash(s?.file_s3_endpoint)),
              this.info('Region', dash(s?.file_s3_region)),
            ],
          ),
        );
      case 'litestream':
        return this.card(
          'floppy-disk',
          'Litestream Real-Time Replication',
          this.editButton('Configure Replication', 'litestream'),
          this.overview(
            'Continuously replicate SQLite transactions to S3, Cloudflare R2, or remote object storage for disaster recovery and automated point-in-time restores.',
            [
              this.info('Replication Status', statusBadge(s?.litestream_enabled === 'true', 'ACTIVE', 'INACTIVE')),
              this.info('Replica Target Bucket', dash(s?.litestream_s3_bucket)),
              this.info('Replica Path', dash(s?.litestream_replica_path)),
              this.info('Endpoint', dash(s?.litestream_s3_endpoint)),
            ],
          ),
        );
      case 'ratelimit':
        return this.renderRateLimits();
      case 'rootips':
        return this.card(
          'globe-hemisphere-west',
          'Root User Security IP Whitelist',
          this.editButton('Configure IP Whitelist', 'rootips'),
          this.overview(
            'Restrict access to root administrator logins and elevated API endpoints to specific authorized IP addresses and CIDR subnets.',
            [
              this.info('IP Check Status', statusBadge(s?.root_user_ip_enabled === 'true', 'ENFORCED', 'DISABLED (ANY IP ALLOWED)')),
              this.info(
                'Allowed IPs & Subnets',
                s?.root_user_allowed_ips ? html`<span class="info-code">${s.root_user_allowed_ips}</span>` : '—',
              ),
            ],
          ),
        );
      case 'email':
        return this.card(
          'envelope-simple',
          'Transactional Email Delivery',
          this.editButton('Configure Email Provider', 'email'),
          this.overview(
            'Enable transactional email delivery to send password reset links, OTP verification codes, and user invites via AWS SES, Resend, Mailgun, SendGrid, Cloudflare, or local stdout console.',
            [
              this.info('Email Service Status', statusBadge(s?.email_enabled === 'true', 'ENABLED', 'DISABLED')),
              this.info('Active Provider', html`<span style="text-transform: uppercase">${s?.email_provider || 'console'}</span>`),
              this.info('Sender Address', dash(s?.email_from_address)),
              this.info('Sender Name', dash(s?.email_from_name)),
            ],
          ),
        );
      case 'oauth':
        return this.renderOAuth();
      default:
        return this.renderAccount();
    }
  }

  // ── Drawer forms ─────────────────────────────────────────────────────────

  private renderSettingField(f: SettingField) {
    const value = String(this.form[f.key] ?? '');
    const required = isRequired(f, this.form);
    switch (f.kind) {
      case 'switch':
        return html`
          <moul-switch
            ?is-checked=${value === 'true'}
            @change=${(e: CustomEvent<{ isChecked: boolean }>) => this.set(f.key, e.detail.isChecked ? 'true' : 'false')}
          >
            ${f.label}
          </moul-switch>
        `;
      case 'select':
        return html`
          <moul-select
            label=${f.label}
            selected-key=${value}
            @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
              if (e.detail.selectedKey) this.set(f.key, e.detail.selectedKey);
            }}
          >
            ${f.options?.map((o) => html`<moul-select-item key=${o.key}>${o.label}</moul-select-item>`)}
          </moul-select>
        `;
      case 'textarea':
        return html`
          <moul-text-area
            label=${f.label}
            placeholder=${f.placeholder ?? ''}
            description=${f.description ?? ''}
            rows="4"
            ?is-required=${required}
            .value=${value}
            @input=${(e: Event) => this.set(f.key, fieldValue(e))}
          ></moul-text-area>
        `;
      default:
        return html`
          <moul-text-field
            label=${f.label}
            type=${f.kind}
            placeholder=${f.placeholder ?? ''}
            description=${f.description ?? ''}
            ?is-required=${required}
            .value=${value}
            @input=${(e: Event) => this.set(f.key, fieldValue(e))}
          ></moul-text-field>
        `;
    }
  }

  private text(key: string, label: string, options: { type?: string; placeholder?: string; description?: string; required?: boolean } = {}) {
    return html`
      <moul-text-field
        label=${label}
        type=${options.type ?? 'text'}
        placeholder=${options.placeholder ?? ''}
        description=${options.description ?? ''}
        ?is-required=${Boolean(options.required)}
        .value=${String(this.form[key] ?? '')}
        @input=${(e: Event) => this.set(key, fieldValue(e))}
      ></moul-text-field>
    `;
  }

  private renderDrawerForm(mode: Exclude<DrawerMode, null>) {
    if (mode === 'ratelimit-add' || mode === 'ratelimit-edit') {
      const number = (key: string, label: string, placeholder: string) => html`
        <moul-number-field
          label=${label}
          placeholder=${placeholder}
          min="1"
          is-required
          .value=${this.form[key] ?? null}
          @input=${(e: Event) => this.set(key, (e.target as HTMLElement & { value: number | null }).value ?? 0)}
        ></moul-number-field>
      `;
      return html`
        ${this.text('label', 'Rule Pattern / Label', {
          placeholder: 'e.g. *:auth, /api/batch, users:list',
          description: 'Use *:auth for all authentication actions or specify exact API paths.',
          required: true,
        })}
        ${number('maxRequests', 'Max Requests (per IP)', '10')} ${number('interval', 'Interval Window (seconds)', '3')}
        <moul-select
          label="Target Audience"
          selected-key=${this.form.targetedUsers ?? 'all'}
          @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
            if (e.detail.selectedKey) this.set('targetedUsers', e.detail.selectedKey);
          }}
        >
          ${AUDIENCES.map((a) => html`<moul-select-item key=${a.key}>${a.label}</moul-select-item>`)}
        </moul-select>
      `;
    }
    if (mode === 'account') {
      return html`
        ${this.text('username', 'Username', {
          placeholder: 'e.g. admin',
          description: 'Unique username used for login and CLI authentication',
          required: true,
        })}
        ${this.text('name', 'Display Name', {
          placeholder: 'e.g. Administrator',
          description: 'Full or display name shown across the administration interface',
        })}
        ${this.text('email', 'Email Address', { type: 'email', placeholder: 'e.g. admin@moul.dev', description: 'Root contact email address' })}
      `;
    }
    if (mode === 'password') {
      return html`
        ${this.text('currentPassword', 'Current Password', { type: 'password', placeholder: '••••••••', required: true })}
        ${this.text('newPassword', 'New Password', {
          type: 'password',
          placeholder: '••••••••',
          description: 'Minimum 8 characters (1 uppercase, 1 lowercase, 1 digit)',
          required: true,
        })}
        ${this.text('passwordConfirm', 'Confirm New Password', { type: 'password', placeholder: '••••••••', required: true })}
      `;
    }
    return SETTINGS_SECTIONS[mode].fields.map((f) => this.renderSettingField(f));
  }

  private renderDrawer() {
    const mode = this.drawerMode;
    const title = mode ? (DRAWER_TITLES[mode] ?? SETTINGS_SECTIONS[mode as SettingsDrawer]?.title) : '';
    const dirty = this.isDirty;
    const saveLabel = this.isSaving
      ? 'Saving...'
      : mode === 'account'
        ? 'Save Account'
        : mode === 'password'
          ? 'Update Password'
          : 'Save Settings';

    return html`
      <div @keydown=${this.onDrawerKeydown}>
        <moul-drawer
          placement="right"
          size="md"
          ?is-open=${mode !== null}
          ?is-dismissable=${!dirty}
          @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
            if (e.target === e.currentTarget && !e.detail.isOpen) this.closeDrawer();
          }}
        >
          <div slot="header" class="drawer-title">
            <span class="inline">
              ${title} ${dirty ? html`<moul-badge tone="warning" size="sm">Unsaved Changes</moul-badge>` : nothing}
            </span>
            <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${onPress(() => this.requestClose())}>
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
            ${mode ? this.renderDrawerForm(mode) : nothing}
          </form>
          <moul-button slot="footer" variant="ghost" @click=${onPress(() => this.requestClose())}>Cancel</moul-button>
          <moul-button slot="footer" variant="primary" ?is-disabled=${this.isSaving} @click=${onPress(() => this.save())}>
            ${saveLabel}
          </moul-button>
        </moul-drawer>
      </div>
    `;
  }

  private renderDialogs() {
    return html`
      <moul-alert-dialog
        tone="warning"
        size="sm"
        ?is-open=${this.showDiscardDialog}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (!e.detail.isOpen) this.showDiscardDialog = false;
        }}
      >
        <span slot="header">Discard Unsaved Changes?</span>
        <p slot="body" class="dialog-text">
          You have unsaved changes in this configuration section. If you close now, your modifications will be discarded.
        </p>
        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.showDiscardDialog = false))}>Keep Editing</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          @click=${onPress(() => {
            this.showDiscardDialog = false;
            this.closeDrawer();
          })}
        >
          Discard Changes
        </moul-button>
      </moul-alert-dialog>

      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${this.ruleToDelete !== null}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (!e.detail.isOpen) this.ruleToDelete = null;
        }}
      >
        <span slot="header">Delete Rate Limit Rule</span>
        <p slot="body" class="dialog-text">
          Are you sure you want to delete the rate limit rule for <strong>“${this.ruleToDelete?.label}”</strong>? This change will
          take effect immediately.
        </p>
        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.ruleToDelete = null))}>Cancel</moul-button>
        <moul-button slot="footer" variant="danger" @click=${onPress(() => this.deleteRule())}>Delete Rule</moul-button>
      </moul-alert-dialog>
    `;
  }

  override render() {
    const tab = this.tab;
    return html`
      ${pageHeader(
        'Engine Settings',
        'Manage object storage, litestream backups, rate limiting, security IP whitelist, transactional email, OAuth2 providers, and root credentials.',
      )}
      <moul-tabs
        variant="line"
        selected-key=${tab}
        @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
          if (e.target !== e.currentTarget) return;
          router.navigate('/settings', { search: { tab: e.detail.selectedKey }, replace: true });
        }}
      >
        ${TABS.map(
          (t) => html`
            <moul-tab slot="tab" key=${t.key}>
              <span class="tab-label"><admin-icon name=${t.icon} size="16"></admin-icon>${t.label}</span>
            </moul-tab>
          `,
        )}
        ${TABS.map((t) => html`<moul-tab-panel key=${t.key}>${t.key === tab ? this.renderPanel(t.key) : nothing}</moul-tab-panel>`)}
      </moul-tabs>
      ${this.renderDrawer()} ${this.renderDialogs()}
    `;
  }
}

customElements.define('admin-settings-page', AdminSettingsPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-settings-page': AdminSettingsPage;
  }
}
