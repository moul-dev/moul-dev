import{C as e,d as t,l as n,o as r,r as i,t as a,v as o,x as s}from"./index-RipJGQkD.js";import{t as c}from"./repeat-CCJXDy8Q.js";import{n as l,t as u}from"./page-BkXVDI8g.js";import{t as d}from"./collection-type-CFe_NMzc.js";var f={page:1,perPage:30},p=class extends o{static styles=[i,e`
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
    `];static properties={moul:{attribute:!1}};count=new n(this,()=>({queryKey:[`collectionRecordCount`,this.moul?.name],queryFn:()=>t.listRecords(this.moul.name,{perPage:1}),enabled:!!this.moul?.name}));render(){let{name:e,type:t}=this.moul,{data:n,isLoading:i}=this.count.result,o=(n&&!Array.isArray(n)?n.totalItems:void 0)??(Array.isArray(n)?n.length:0),c=`/records/${encodeURIComponent(e)}`;return s`
      <moul-card>
        <moul-card-body>
          <div class="inner">
            <div class="top-row">
              <a class="name" href=${r.href(c,f)}>
                <admin-icon name="database" size="18" color="var(--color-primary-500)"></admin-icon>
                <span>${e}</span>
              </a>
              <div class="badges">
                ${d(t)}
                <moul-badge variant="bordered">${i?`...`:`${o} records`}</moul-badge>
              </div>
            </div>

            <div class="bottom-row">
              <moul-button
                variant="outline"
                aria-label=${`Create new record in ${e}`}
                @click=${a(()=>r.navigate(c,{search:{...f,create:!0}}))}
              >
                <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
                New Record
              </moul-button>
              <moul-button
                variant="ghost"
                aria-label=${`Browse ${e} records`}
                @click=${a(()=>r.navigate(c,{search:f}))}
              >
                View Table
                <admin-icon slot="suffix" name="arrow-right" size="14"></admin-icon>
              </moul-button>
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `}};customElements.define(`admin-collection-card`,p);var m=class extends o{static styles=[i,l,e`
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
    `];mouls=new n(this,()=>({queryKey:[`mouls`],queryFn:t.listMouls}));metrics=new n(this,()=>({queryKey:[`sysmon`],queryFn:t.getMetrics,refetchInterval:5e3}));renderCollections(){let{data:e,isLoading:t}=this.mouls.result;return t?s`<div class="muted">Loading collections...</div>`:!e||e.length===0?s`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No collections yet</span>
          <span slot="description">Create your first collection to define your schema and store data.</span>
          <moul-button slot="actions" variant="primary" @click=${a(()=>r.navigate(`/collections`))}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            Create Collection
          </moul-button>
        </moul-empty-state>
      `:s`
      <div class="collections">
        ${c(e,e=>e.name,e=>s`<admin-collection-card .moul=${e}></admin-collection-card>`)}
      </div>
    `}render(){let{data:e,isLoading:t}=this.mouls.result,n=this.metrics.data?.current,i=Array.isArray(e)?e.length:0,o=n?Math.round(Number(n.memory?.used)/1024/1024*10)/10:0,c=Number(n?.system?.num_goroutines)||0,l=()=>`...`;return s`
      ${u(`Overview`,`System status and collections at a glance.`,s`
          <moul-button variant="primary" @click=${a(()=>r.navigate(`/collections`))}>
            Manage Collections
            <admin-icon slot="suffix" name="arrow-right" size="16"></admin-icon>
          </moul-button>
        `)}

      <div class="stats">
        <moul-stat
          label="Collections"
          description="Active schema tables"
          .value=${i}
          .valueFormatter=${t?l:void 0}
        >
          <admin-icon slot="icon" name="database" size="20" color="var(--color-primary-500)"></admin-icon>
        </moul-stat>
        <moul-stat
          label="Memory"
          description="Go runtime heap"
          suffix=${n?` MB`:``}
          .value=${o}
          .valueFormatter=${n?void 0:l}
        >
          <admin-icon slot="icon" name="cpu" size="20" color="var(--color-success-500)"></admin-icon>
        </moul-stat>
        <moul-stat
          label="Goroutines"
          description="Active concurrent routines"
          .value=${c}
          .valueFormatter=${n?void 0:l}
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
          ${i>2?s`<span class="muted" style="font-size: var(--font-size-sm)">${i} collections</span>`:``}
        </div>
        ${this.renderCollections()}
      </div>
    `}};customElements.define(`admin-overview-page`,m);export{p as AdminCollectionCard,m as AdminOverviewPage};