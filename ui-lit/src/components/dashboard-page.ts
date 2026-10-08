import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { authActions } from '../context/auth-state.js';

@customElement('dashboard-page')
export class DashboardPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
    }
    h1 {
      color: #111827;
      margin-top: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .logout-btn {
      padding: 0.5rem 1rem;
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .logout-btn:hover {
      background-color: #e5e7eb;
    }
    .content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
  `;

  private _handleLogout() {
    authActions.logout();
    window.dispatchEvent(new CustomEvent('navigate', { detail: '/_moul_/login' }));
  }

  render() {
    return html`
      <div class="header">
        <h1>Moul Admin Dashboard (Lit)</h1>
        <button class="logout-btn" @click=${this._handleLogout}>Logout</button>
      </div>
      <div class="content">
        <p>Welcome to the new Lit-based Admin Console.</p>
        <p>This is a placeholder for the dashboard content.</p>
      </div>
    `;
  }
}
