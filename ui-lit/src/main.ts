import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import { SignalWatcher } from '@lit-labs/signals';
import { authStateSignal, authActions } from './context/auth-state.js';
import './components/login-page.js';
import './components/setup-page.js';
import './components/dashboard-page.js';

@customElement('moul-app')
export class MoulApp extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    }
  `;

  @state() private _isReady = false;

  private _router = new Router(this, [
    { 
      path: '/_moul_/', 
      render: () => {
        const auth = authStateSignal.get();
        if (!auth.isAuthenticated) {
          // Push state asynchronously to avoid Lit cycle issues
          setTimeout(() => this._router.goto('/_moul_/login'), 0);
          return html`<login-page></login-page>`;
        }
        return html`<dashboard-page></dashboard-page>`;
      }
    },
    { 
      path: '/_moul_/login', 
      render: () => {
        const auth = authStateSignal.get();
        if (auth.isAuthenticated) {
          setTimeout(() => this._router.goto('/_moul_/'), 0);
          return html`<dashboard-page></dashboard-page>`;
        }
        return html`<login-page></login-page>`;
      } 
    },
    { 
      path: '/_moul_/setup', 
      render: () => {
         const auth = authStateSignal.get();
         if (auth.isAuthenticated) {
           setTimeout(() => this._router.goto('/_moul_/'), 0);
           return html`<dashboard-page></dashboard-page>`;
         }
         return html`<setup-page></setup-page>`;
      } 
    },
    { 
      path: '/*', 
      render: () => {
          setTimeout(() => this._router.goto('/_moul_/'), 0);
          return html`<div>Redirecting...</div>`;
      }
    }
  ]);

  constructor() {
    super();
    // Initialize auth state
    authActions.init().then(() => {
        this._isReady = true;
    });
  }

  connectedCallback() {
      super.connectedCallback();
      window.addEventListener('navigate', this._handleNavigate);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener('navigate', this._handleNavigate);
  }

  private _handleNavigate = (e: Event) => {
      const path = (e as CustomEvent).detail;
      this._router.goto(path);
  }

  render() {
    if (!this._isReady) {
        return html`<div>Loading...</div>`;
    }
    return html`${this._router.outlet()}`;
  }
}
