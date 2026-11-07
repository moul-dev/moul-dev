import { html, LitElement } from 'lit';
import { fieldValue, submitOnEnter } from '../lib/forms';
import { onPress } from '../lib/press';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { auth } from '../state/auth';
import { authCard, authCardStyles, keyStatus } from './auth-card';

/**
 * Two-step sign-in: verify the master admin key, then sign in the root user. Sends the
 * visitor to /setup when the server has no root user yet.
 */
export class AdminLoginPage extends LitElement {
  static override styles = authCardStyles;

  static override properties = {
    masterKey: { state: true },
    identity: { state: true },
    password: { state: true },
    error: { state: true },
    loading: { state: true },
  };

  declare masterKey: string;
  declare identity: string;
  declare password: string;
  declare error: string | null;
  declare loading: boolean;

  constructor() {
    super();
    this.masterKey = '';
    this.identity = '';
    this.password = '';
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
      if (res.needsSetup) {
        router.navigate('/setup');
      }
    } catch (err: any) {
      this.error = err.message || 'Invalid Master Admin Key (Unauthorized)';
    } finally {
      this.loading = false;
    }
  }

  // Context 2: Root User Authentication
  private async onUserLogin(event: SubmitEvent) {
    event.preventDefault();
    this.error = null;

    if (!this.identity.trim() || !this.password) {
      this.error = 'Username/Email and Password are required';
      return;
    }

    this.loading = true;
    try {
      await auth.adminLogin(this.identity.trim(), this.password);
      router.navigate('/overview');
    } catch (err: any) {
      this.error = err.message || 'Authentication failed. Please verify your credentials.';
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

    if (auth.needsSetup) {
      return html`
        ${keyStatus(this.onClearKey)}
        <moul-alert tone="warning" description="Initial setup required. Create the root administrator account to proceed."></moul-alert>
        <moul-button variant="primary" size="lg" @click=${onPress(() => router.navigate('/setup'))}>Create Root Admin</moul-button>
      `;
    }

    return html`
      <form @submit=${this.onUserLogin} @keydown=${submitOnEnter}>
        ${keyStatus(this.onClearKey)}
        <moul-text-field
          label="Username or Email"
          placeholder="admin@example.com"
          is-required
          .value=${this.identity}
          @input=${(e: Event) => (this.identity = fieldValue(e))}
        ></moul-text-field>
        <moul-text-field
          label="Password"
          type="password"
          placeholder="••••••••"
          is-required
          .value=${this.password}
          @input=${(e: Event) => (this.password = fieldValue(e))}
        ></moul-text-field>
        <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
          ${this.loading ? 'Signing in...' : 'Sign In'}
        </moul-button>
      </form>
    `;
  }

  override render() {
    const hasVerifiedKey = Boolean(auth.adminKey);
    return authCard({
      title: hasVerifiedKey ? 'moul console' : 'Connect to moul',
      subtitle: hasVerifiedKey
        ? 'Sign in with your administrator credentials'
        : 'Enter your Master Admin Key to access the administration console',
      body: html`
        ${this.error ? html`<moul-alert tone="error" description=${this.error}></moul-alert>` : ''}
        ${this.renderBody()}
      `,
      footer:
        hasVerifiedKey && auth.needsSetup
          ? html`First time running moul? <moul-link href=${router.href('/setup')}>Set up root administrator</moul-link>`
          : undefined,
    });
  }
}

customElements.define('admin-login-page', AdminLoginPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-login-page': AdminLoginPage;
  }
}
