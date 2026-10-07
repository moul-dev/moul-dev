import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { setAuthToken } from '../api/client.js';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f9fafb;
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      margin-top: 0;
      font-size: 1.5rem;
      color: #111827;
      text-align: center;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover {
      background-color: #4338ca;
    }
    .error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      text-align: center;
    }
  `;

  @state()
  private _email = '';

  @state()
  private _password = '';

  @state()
  private _error = '';

  private _handleLogin(e: Event) {
    e.preventDefault();
    if (this._email && this._password) {
      console.log('Login attempt with:', this._email);
      // Simulate auth token retrieval
      setAuthToken('dummy-token-for-lit-ui');
      window.location.href = '/_moul_/';
    } else {
      this._error = 'Please fill in both fields.';
    }
  }

  render() {
    return html`
      <div class="card">
        <h1>Moul Admin Login</h1>
        <form @submit=${this._handleLogin}>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              .value=${this._email}
              @input=${(e: Event) => this._email = (e.target as HTMLInputElement).value}
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              .value=${this._password}
              @input=${(e: Event) => this._password = (e.target as HTMLInputElement).value}
              required
            />
          </div>
          ${this._error ? html`<div class="error">${this._error}</div>` : ''}
          <button type="submit">Sign In</button>
        </form>
      </div>
    `;
  }
}
