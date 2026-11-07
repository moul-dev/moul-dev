import{c as e,n as t,o as n,r,t as i}from"./press-BQyLhwVv.js";import{n as a}from"./query-DEj2kaNm.js";import{t as o}from"./client-DaTS5Mxb.js";import{t as s}from"./router-B1wwybcr.js";import{t as c}from"./live-query-DDtzER30.js";import{i as l}from"./index-DeN0Cdry.js";import{t as u}from"./repeat-Utyd6s0W.js";import{n as d,t as f}from"./page-ITe5xmEa.js";import{t as p}from"./collection-type-CsNDn6tw.js";var m={page:1,perPage:30},h=class extends r{static styles=[t,e`
      :host {
        display: block;
      }

      moul-card {
        height: 100%;
      }

      .inner {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        width: 100%;
      }

      .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
      }

      .name {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--color-fg);
        text-decoration: none;
        text-transform: capitalize;
        border-radius: var(--radius-sm);
      }

      .name:hover {
        text-decoration: underline;
      }

      .name:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .badges {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        flex-shrink: 0;
      }

      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: var(--spacing-2);
        border-top: 1px solid var(--color-border-subtle);
      }
    `];static properties={moul:{attribute:!1}};count=new a(this,()=>({queryKey:[`collectionRecordCount`,this.moul?.name],queryFn:()=>o.listRecords(this.moul.name,{perPage:1}),enabled:!!this.moul?.name}));render(){let{name:e,type:t}=this.moul,{data:r,isLoading:a}=this.count.result,o=(r&&!Array.isArray(r)?r.totalItems:void 0)??(Array.isArray(r)?r.length:0),c=`/records/${encodeURIComponent(e)}`;return n`
      <moul-card>
        <moul-card-body>
          <div class="inner">
            <div class="top-row">
              <a class="name" href=${s.href(c,m)}>
                <admin-icon name="database" size="18" color="var(--color-primary-500)"></admin-icon>
                <span>${e}</span>
              </a>
              <div class="badges">
                ${p(t)}
                <moul-badge variant="bordered">${a?`...`:`${o} records`}</moul-badge>
              </div>
            </div>

            <div class="bottom-row">
              <moul-button
                variant="outline"
                aria-label=${`Create new record in ${e}`}
                @click=${i(()=>s.navigate(c,{search:{...m,create:!0}}))}
              >
                <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
                New Record
              </moul-button>
              <moul-button
                variant="ghost"
                aria-label=${`Browse ${e} records`}
                @click=${i(()=>s.navigate(c,{search:m}))}
              >
                View Table
                <admin-icon slot="suffix" name="arrow-right" size="14"></admin-icon>
              </moul-button>
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `}};customElements.define(`admin-collection-card`,h);var g=class extends r{static styles=[t,d,e`
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--spacing-4);
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .collections {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
        gap: var(--spacing-4);
      }
    `];mouls=new c(this,e=>e.from({moul:l}));metrics=new a(this,()=>({queryKey:[`sysmon`],queryFn:o.getMetrics,refetchInterval:5e3}));renderCollections(){let{data:e,isLoading:t}=this.mouls;return t?n`<div class="muted">Loading collections...</div>`:e.length===0?n`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No collections yet</span>
          <span slot="description">Create your first collection to define your schema and store data.</span>
          <moul-button slot="actions" variant="primary" @click=${i(()=>s.navigate(`/collections`))}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            Create Collection
          </moul-button>
        </moul-empty-state>
      `:n`
      <div class="collections">
        ${u(e,e=>e.name,e=>n`<admin-collection-card .moul=${e}></admin-collection-card>`)}
      </div>
    `}render(){let{data:e,isLoading:t}=this.mouls,r=this.metrics.data?.current,a=Array.isArray(e)?e.length:0,o=r?Math.round(Number(r.memory?.used)/1024/1024*10)/10:0,c=Number(r?.system?.num_goroutines)||0,l=()=>`...`;return n`
      ${f(`Overview`,`System status and collections at a glance.`,n`
          <moul-button variant="primary" @click=${i(()=>s.navigate(`/collections`))}>
            Manage Collections
            <admin-icon slot="suffix" name="arrow-right" size="16"></admin-icon>
          </moul-button>
        `)}

      <div class="stats">
        <moul-stat
          label="Collections"
          description="Active schema tables"
          .value=${a}
          .valueFormatter=${t?l:void 0}
        >
          <admin-icon slot="icon" name="database" size="20" color="var(--color-primary-500)"></admin-icon>
        </moul-stat>
        <moul-stat
          label="Memory"
          description="Go runtime heap"
          suffix=${r?` MB`:``}
          .value=${o}
          .valueFormatter=${r?void 0:l}
        >
          <admin-icon slot="icon" name="cpu" size="20" color="var(--color-success-500)"></admin-icon>
        </moul-stat>
        <moul-stat
          label="Goroutines"
          description="Active concurrent routines"
          .value=${c}
          .valueFormatter=${r?void 0:l}
        >
          <admin-icon slot="icon" name="pulse" size="20" color="var(--color-warning-500)"></admin-icon>
        </moul-stat>
        <moul-stat label="Storage Engine" description="Write-ahead logging (WAL) active" .value=${1} .valueFormatter=${()=>`SQLite`}>
          <admin-icon slot="icon" name="hard-drives" size="20" color="var(--color-primary-500)"></admin-icon>
        </moul-stat>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Collections</h2>
          ${a>2?n`<span class="muted" style="font-size: var(--font-size-sm)">${a} collections</span>`:``}
        </div>
        ${this.renderCollections()}
      </div>
    `}};customElements.define(`admin-overview-page`,g);export{h as AdminCollectionCard,g as AdminOverviewPage};