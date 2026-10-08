import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('moul-card')
export class MoulCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .body {
      padding: 1.5rem;
    }

    .footer {
      padding: 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
  `;

  render() {
    return html`
      <div class="card">
        <div class="header"><slot name="header"></slot></div>
        <div class="body"><slot></slot></div>
        <div class="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}

@customElement('moul-textfield')
export class MoulTextField extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-sizing: border-box;
      font-size: 1rem;
    }
    
    input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }

    .description {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) type = 'text';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean }) isRequired = false;
  @property({ type: String }) description = '';

  private _onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.dispatchEvent(new CustomEvent('input-change', { detail: this.value }));
  }

  render() {
    return html`
      <div>
        ${this.label ? html`<label>${this.label} ${this.isRequired ? '*' : ''}</label>` : ''}
        <input
          type="${this.type}"
          placeholder="${this.placeholder}"
          .value="${this.value}"
          ?required="${this.isRequired}"
          @input="${this._onInput}"
        />
        ${this.description ? html`<p class="description">${this.description}</p>` : ''}
      </div>
    `;
  }
}

@customElement('moul-button')
export class MoulButton extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 1rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      font-weight: 500;
      color: white;
      background-color: #4f46e5;
      cursor: pointer;
      font-size: 1rem;
    }

    button:hover {
      background-color: #4338ca;
    }
    
    button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    button.ghost {
      background-color: transparent;
      color: #4f46e5;
    }

    button.ghost:hover {
      background-color: #f3f4f6;
    }
  `;

  @property({ type: String }) variant = 'primary';
  @property({ type: Boolean }) isDisabled = false;

  render() {
    return html`
      <button 
        ?disabled="${this.isDisabled}" 
        class="${this.variant}"
        @click="${(e: Event) => {
            if (this.getAttribute('type') === 'submit') {
                const form = this.closest('form');
                if (form) {
                    e.preventDefault();
                    form.requestSubmit();
                }
            } else {
                e.preventDefault();
            }
        }}"
       >
        <slot></slot>
      </button>
    `;
  }
}

@customElement('moul-alert')
export class MoulAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }

    :host([variant="error"]) {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #f87171;
    }

    :host([variant="warning"]) {
      background-color: #fffbeb;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    
    :host([variant="info"]) {
      background-color: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
  `;

  @property({ type: String, reflect: true }) variant = 'info';
  @property({ type: String }) description = '';

  render() {
    return html`<div>${this.description}</div>`;
  }
}

@customElement('moul-badge')
export class MoulBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    :host([variant="success"]) {
      background-color: #d1fae5;
      color: #065f46;
    }

    .dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      margin-right: 0.375rem;
      background-color: currentColor;
    }
  `;

  @property({ type: String, reflect: true }) variant = 'success';
  @property({ type: Boolean }) dot = false;

  render() {
    return html`
      ${this.dot ? html`<div class="dot"></div>` : ''}
      <slot></slot>
    `;
  }
}
