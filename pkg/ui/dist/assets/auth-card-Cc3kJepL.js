import{C as e,i as t,n,r,s as i,t as a,v as o,x as s}from"./index-RipJGQkD.js";var c={system:{icon:`sparkle`,label:`System`,next:`Light`},light:{icon:`sun`,label:`Light`,next:`Dark`},dark:{icon:`moon`,label:`Dark`,next:`System`}},l=class extends o{constructor(){super(),new i(this,t)}render(){let{icon:e,label:n,next:r}=c[t.theme],i=t.theme===`system`?`System (${t.resolvedTheme})`:n;return s`
      <moul-tooltip content=${n} delay="250" placement="bottom">
        <moul-button
          variant="outline"
          is-icon
          aria-label=${`Current theme: ${i}. Click to switch to ${r} mode`}
          @click=${a(()=>t.cycleTheme())}
        >
          <admin-icon name=${e} weight="duotone" size="16"></admin-icon>
        </moul-button>
      </moul-tooltip>
    `}};customElements.define(`admin-theme-toggle`,l);var u=[r,e`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      width: 100%;
      background-color: var(--color-bg-subtle);
      padding: var(--spacing-4);
      position: relative;
    }

    .theme-toggle {
      position: absolute;
      top: var(--spacing-4);
      right: var(--spacing-4);
    }

    .card {
      width: 100%;
      max-width: 460px;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--spacing-1);
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-fg);
      margin-bottom: var(--spacing-2);
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-fg);
      font-family: var(--font-family-base);
      letter-spacing: -0.025em;
    }

    .subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-fg-subtle);
      font-family: var(--font-family-base);
    }

    .stack,
    form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      width: 100%;
    }

    .stack {
      gap: 1rem;
    }

    .key-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-3);
      background-color: var(--color-bg-subtle);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-subtle);
      width: 100%;
    }

    .key-status-label {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-fg);
    }

    .footer {
      text-align: center;
      font-size: 0.8125rem;
      color: var(--color-fg-subtle);
      font-family: var(--font-family-base);
      width: 100%;
    }
  `];function d(e){return s`
    <div class="container">
      <div class="theme-toggle"><admin-theme-toggle></admin-theme-toggle></div>
      <div class="card">
        <moul-card>
          <moul-card-header>
            <div class="header">
              <div class="logo">${n(44)}</div>
              <h1>${e.title}</h1>
              <p class="subtitle">${e.subtitle}</p>
            </div>
          </moul-card-header>
          <moul-card-body><div class="stack">${e.body}</div></moul-card-body>
          ${e.footer?s`<moul-card-footer><div class="footer">${e.footer}</div></moul-card-footer>`:``}
        </moul-card>
      </div>
    </div>
  `}function f(e){return s`
    <div class="key-status">
      <span class="key-status-label">
        <moul-badge tone="success" is-dot aria-label="Verified"></moul-badge>
        Admin key verified
      </span>
      <moul-button variant="ghost" size="sm" @click=${a(()=>e())}>Change Key</moul-button>
    </div>
  `}export{u as n,f as r,d as t};