import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import { getAuthToken } from './api/client.js';
import './components/login-page.js';
import './components/dashboard-page.js';

@customElement('moul-app')
export class MoulApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    }
  `;

  private _router = new Router(this, [
    { 
      path: '/_moul_/', 
      render: () => {
        if (!getAuthToken()) {
          this._router.goto('/_moul_/login');
          return html`<login-page></login-page>`;
        }
        return html`<dashboard-page></dashboard-page>`;
      }
    },
    { path: '/_moul_/login', render: () => html`<login-page></login-page>` },
    { path: '/*', render: () => html`<h1>Not Found</h1>` }
  ]);

  render() {
    return html`${this._router.outlet()}`;
  }
}
