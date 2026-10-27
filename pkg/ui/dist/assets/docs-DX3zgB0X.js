import{C as e,r as t,t as n,v as r,x as i}from"./index-RipJGQkD.js";import{n as a,t as o}from"./page-BkXVDI8g.js";var s=class extends r{static styles=[t,a,e`
      :host {
        --page-gap: var(--spacing-4);
        height: calc(100vh - 120px);
      }

      moul-card {
        flex: 1;
        min-height: 0;
        padding: 0;
        overflow: hidden;
      }

      iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
      }
    `];render(){return i`
      ${o(`API Reference`,`Explore and test endpoints generated from your schema.`,i`
          <moul-button variant="outline" @click=${n(()=>window.open(`/docs`,`_blank`,`noopener`))}>
            Open in new tab
            <admin-icon slot="suffix" name="arrow-square-out" size="16"></admin-icon>
          </moul-button>
        `)}
      <moul-card>
        <iframe src="/docs" title="Moul API Docs"></iframe>
      </moul-card>
    `}};customElements.define(`admin-docs-page`,s);export{s as AdminDocsPage};