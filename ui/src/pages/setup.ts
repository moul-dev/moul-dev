import { html, LitElement } from 'lit';
import { api } from '../api/client';
import { fieldValue, submitOnEnter } from '../lib/forms';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { auth } from '../state/auth';
import { authCard, authCardStyles, keyStatus } from './auth-card';

/** First-run setup: verify the master admin key, then create the root administrator. */
export class AdminSetupPage extends LitElement {
  static override styles = authCardStyles;

  static override properties = {
    masterKey: { state: true },
    username: { state: true },
    email: { state: true },
    password: { state: true },
    passwordConfirm: { state: true },
    error: { state: true },
    loading: { state: true },
  };

  declare masterKey: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare passwordConfirm: string;
  declare error: string | null;
  declare loading: boolean;

  constructor() {
    super();
    this.masterKey = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.passwordConfirm = '';
    this.error = null;
    this.loading = false;
    new StoreController(this, auth);
  }

  // Context 1: Master Admin Key Verification
  private async onVerifyKey(event: SubmitEvent) {
    event.preventDefault();
    this.error = null;

    const trimmed = this.masterKey.trim();
    if (!trimmed) {
      this.error = 'Master Admin Key is required';
      return;
    }

    this.loading = true;
    try {
      const res = await auth.verifyAndSetAdminKey(trimmed);
      if (!res.needsSetup) {
        router.navigate('/login');
      }
    } catch (err: any) {
      this.error = err.message || 'Invalid Master Admin Key (Unauthorized)';
    } finally {
      this.loading = false;
    }
  }

  // Context 2: Root User Setup Submission
  private async onSetupSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.error = null;

    if (this.password !== this.passwordConfirm) {
      this.error = 'Passwords do not match';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters long';
      return;
    }

    this.loading = true;
    try {
      await api.setupRootUser({ username: this.username.trim(), email: this.email.trim(), password: this.password });
      // Auto-authenticate with the created credentials
      try {
        await auth.adminLogin(this.username.trim(), this.password);
        router.navigate('/overview');
      } catch {
        router.navigate('/login');
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to setup root user';
    } finally {
      this.loading = false;
    }
  }

  private onClearKey = () => {
    auth.clearAdminKey();
    this.masterKey = '';
    this.error = null;
  };

  private renderBody() {
    if (!auth.adminKey) {
      return html`
        <form @submit=${this.onVerifyKey} @keydown=${submitOnEnter}>
          <moul-text-field
            label="Master Admin Key"
            type="password"
            placeholder="Enter MOUL_ADMIN_KEY"
            description="Configured via MOUL_ADMIN_KEY"
            is-required
            .value=${this.masterKey}
            @input=${(e: Event) => (this.masterKey = fieldValue(e))}
          ></moul-text-field>
          <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
            ${this.loading ? 'Verifying...' : 'Continue'}
          </moul-button>
        </form>
      `;
    }

    if (!auth.needsSetup) {
      return html`
        ${keyStatus(this.onClearKey)}
        <moul-alert tone="primary" description="Root administrator already created. Please sign in with your credentials."></moul-alert>
        <moul-button variant="primary" size="lg" @press=${() => router.navigate('/login')}>Go to Sign In</moul-button>
      `;
    }

    return html`
      <form @submit=${this.onSetupSubmit} @keydown=${submitOnEnter}>
        ${keyStatus(this.onClearKey)}
        <moul-text-field
          label="Username"
          placeholder="admin"
          is-required
          .value=${this.username}
          @input=${(e: Event) => (this.username = fieldValue(e))}
        ></moul-text-field>
        <moul-text-field
          label="Email"
          type="email"
          placeholder="admin@example.com"
          is-required
          .value=${this.email}
          @input=${(e: Event) => (this.email = fieldValue(e))}
        ></moul-text-field>
        <moul-text-field
          label="Password"
          type="password"
          placeholder="••••••••"
          description="Minimum 8 characters"
          is-required
          .value=${this.password}
          @input=${(e: Event) => (this.password = fieldValue(e))}
        ></moul-text-field>
        <moul-text-field
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          is-required
          .value=${this.passwordConfirm}
          @input=${(e: Event) => (this.passwordConfirm = fieldValue(e))}
        ></moul-text-field>
        <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
          ${this.loading ? 'Creating account...' : 'Create Account'}
        </moul-button>
      </form>
    `;
  }

  override render() {
    const hasVerifiedKey = Boolean(auth.adminKey);
    return authCard({
      title: hasVerifiedKey ? 'Welcome to moul' : 'Connect to moul',
      subtitle: hasVerifiedKey ? 'Set up your root administrator account.' : 'Enter your Master Admin Key to continue.',
      body: html`
        ${this.error ? html`<moul-alert tone="error" description=${this.error}></moul-alert>` : ''}
        ${this.renderBody()}
      `,
      footer: hasVerifiedKey
        ? html`Already set up? <moul-link href=${router.href('/login')}>Sign In</moul-link>`
        : undefined,
    });
  }
}

customElements.define('admin-setup-page', AdminSetupPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-setup-page': AdminSetupPage;
  }
}
