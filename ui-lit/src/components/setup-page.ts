import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { SignalWatcher } from '@lit-labs/signals';
import { authStateSignal, authActions } from '../context/auth-state.js';
import { api } from '../api/client.js';
import './ui/moul-components.js';

@customElement('setup-page')
export class SetupPage extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: sans-serif;
    }
    
    .card-wrapper {
      width: 100%;
      maxWidth: 460px;
    }
    
    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
    }
    
    .title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }
    
    .subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    
    .form-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .key-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background-color: #f9fafb;
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;
    }
    
    .footer-text {
        text-align: center;
        font-size: 0.8125rem;
        color: #6b7280;
    }
    
    .link {
        color: #4f46e5;
        text-decoration: none;
        cursor: pointer;
    }
    .link:hover {
        text-decoration: underline;
    }
  `;

  @state() private _masterKeyInput = '';
  @state() private _username = '';
  @state() private _email = '';
  @state() private _password = '';
  @state() private _passwordConfirm = '';
  @state() private _error: string | null = null;

  private _verifyTask = new Task(this, { task: async ([key]: [string]) => {
      this._error = null;
      try {
        const res = await authActions.verifyAndSetAdminKey(key);
        if (!res.needsSetup) {
           window.dispatchEvent(new CustomEvent('navigate', { detail: '/_moul_/login' }));
        }
      } catch (err: any) {
        this._error = err.message || 'Invalid Master Admin Key (Unauthorized)';
        throw err;
      }
    }, args: () => [this._masterKeyInput] as [string], autoRun: false });

  private _setupTask = new Task(this, { task: async ([username, email, password, passwordConfirm]: [string, string, string, string]) => {
      this._error = null;
      
      if (password !== passwordConfirm) {
          throw new Error('Passwords do not match');
      }
      if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
      }

      try {
        await api.setupRootUser({ username: username.trim(), email: email.trim(), password });
        try {
            await authActions.adminLogin(username.trim(), password);
            window.dispatchEvent(new CustomEvent('navigate', { detail: '/_moul_/' }));
        } catch {
            window.dispatchEvent(new CustomEvent('navigate', { detail: '/_moul_/login' }));
        }
      } catch (err: any) {
        this._error = err.message || 'Failed to setup root user';
        throw err;
      }
    }, args: () => [this._username, this._email, this._password, this._passwordConfirm] as [string, string, string, string], autoRun: false });

  private _handleVerifySubmit(e: Event) {
    e.preventDefault();
    if (!this._masterKeyInput.trim()) {
        this._error = 'Master Admin Key is required';
        return;
    }
    this._verifyTask.run();
  }

  private _handleSetupSubmit(e: Event) {
    e.preventDefault();
    this._setupTask.run();
  }

  private _handleClearKey() {
      authActions.clearAdminKey();
      this._masterKeyInput = '';
      this._error = null;
  }

  render() {
    const auth = authStateSignal.get();
    const hasVerifiedKey = Boolean(auth.adminKey);

    return html`
      <div class="card-wrapper">
        <moul-card>
          <div slot="header" class="header">
            <h1 class="title">
              ${hasVerifiedKey ? 'Welcome to moul' : 'Connect to moul'}
            </h1>
            <p class="subtitle">
              ${hasVerifiedKey
                ? 'Set up your root administrator account.'
                : 'Enter your Master Admin Key to continue.'}
            </p>
          </div>

          <div class="form-col">
            ${this._error || this._setupTask.error ? html`
              <moul-alert variant="error" description="${this._error || (this._setupTask.error as Error).message}"></moul-alert>
            ` : ''}

            ${!hasVerifiedKey ? html`
              <!-- Context 1: Master Admin Key Entry -->
              <form @submit="${this._handleVerifySubmit}" class="form-col">
                <moul-textfield
                  label="Master Admin Key"
                  type="password"
                  placeholder="Enter MOUL_ADMIN_KEY"
                  .value="${this._masterKeyInput}"
                  @input-change="${(e: CustomEvent) => this._masterKeyInput = e.detail}"
                  isRequired
                  description="Configured via MOUL_ADMIN_KEY"
                ></moul-textfield>

                <moul-button type="submit" variant="primary" ?isDisabled="${this._verifyTask.status === 1}">
                  ${this._verifyTask.status === 1 ? 'Verifying...' : 'Continue'}
                </moul-button>
              </form>
            ` : !auth.needsSetup ? html`
              <!-- Setup already complete, redirect -->
              <div class="form-col">
                <div class="key-status-row">
                  <moul-badge variant="success" dot>Admin key verified</moul-badge>
                  <moul-button variant="ghost" @click="${this._handleClearKey}">Change Key</moul-button>
                </div>
                <moul-alert
                  variant="info"
                  description="Root administrator already created. Please sign in with your credentials."
                ></moul-alert>
                <moul-button
                  variant="primary"
                  @click="${() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/_moul_/login' }))}"
                >
                  Go to Sign In
                </moul-button>
              </div>
            ` : html`
              <!-- Context 2: Root User Account Creation -->
              <form @submit="${this._handleSetupSubmit}" class="form-col">
                <div class="key-status-row">
                  <moul-badge variant="success" dot>Admin key verified</moul-badge>
                  <moul-button variant="ghost" @click="${this._handleClearKey}">Change Key</moul-button>
                </div>

                <moul-textfield
                  label="Username"
                  placeholder="admin"
                  .value="${this._username}"
                  @input-change="${(e: CustomEvent) => this._username = e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-textfield
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  .value="${this._email}"
                  @input-change="${(e: CustomEvent) => this._email = e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-textfield
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  .value="${this._password}"
                  @input-change="${(e: CustomEvent) => this._password = e.detail}"
                  isRequired
                  description="Minimum 8 characters"
                ></moul-textfield>

                <moul-textfield
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  .value="${this._passwordConfirm}"
                  @input-change="${(e: CustomEvent) => this._passwordConfirm = e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-button type="submit" variant="primary" ?isDisabled="${this._setupTask.status === 1}">
                  ${this._setupTask.status === 1 ? 'Creating account...' : 'Create Account'}
                </moul-button>
              </form>
            `}
          </div>

          ${hasVerifiedKey ? html`
            <div slot="footer" class="footer-text">
              Already set up? 
              <a class="link" @click="${(e: Event) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('navigate', { detail: '/_moul_/login' }));
              }}">Sign In</a>
            </div>
          ` : ''}
        </moul-card>
      </div>
    `;
  }
}
