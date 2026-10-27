import{C as e,c as t,d as n,l as r,o as i,r as a,s as o,t as s,u as c,v as l,x as u,y as d}from"./index-RipJGQkD.js";import{n as f}from"./page-BkXVDI8g.js";import{n as p,t as m}from"./rules-editor-DoS-GY3A.js";import{a as h,f as g}from"./fieldValidation-D0RWDzzJ.js";import{t as _}from"./toast-CFk4KYOX.js";function v(e,t){let n=[];for(let r of e??[])if(r.name!==t)for(let e of r.fields??[])e.type===`relation`&&e.relationConfig?.targetMoul===t&&n.push({sourceMoul:r.name,fieldName:e.name,cardinality:e.relationConfig.cardinality||`1:N`,onDelete:e.relationConfig.onDelete||`SET_NULL`});return n}var y=class extends l{static styles=[a,f,e`
      .page-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .associations {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .association-column {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .association-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .association {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-xs);
      }

      .association-path,
      .association-badges {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .association-badges {
        gap: 4px;
      }

      .target {
        color: var(--color-primary-400);
      }

      .none {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .danger-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 1rem;
        color: var(--color-error-500);
      }

      .danger-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-3);
      }

      .danger-row strong {
        display: block;
        font-size: var(--font-size-sm);
      }

      .danger-row span {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }
    `];static properties={fields:{state:!0},rules:{state:!0},isDeleteOpen:{state:!0}};get moulName(){return i.location.params.moulName??``}moul=new r(this,()=>({queryKey:[`moul`,this.moulName],queryFn:()=>n.getMoul(this.moulName),enabled:!!this.moulName}));allMouls=new r(this,()=>({queryKey:[`mouls`],queryFn:n.listMouls}));loadedMoul;updateMutation=new t(this,{mutationFn:e=>n.updateMoul(this.moulName,e),onSuccess:()=>{c.invalidateQueries({queryKey:[`moul`,this.moulName]}),c.invalidateQueries({queryKey:[`mouls`]}),_.success(`Schema Saved`,`Collection schema and associations saved successfully.`)},onError:e=>{_.error(`Save Failed`,e.message||`Failed to save collection schema.`)}});deleteMutation=new t(this,{mutationFn:e=>n.deleteMoul(e),onSuccess:(e,t)=>{c.invalidateQueries({queryKey:[`mouls`]}),c.removeQueries({queryKey:[`moul`,t]}),this.isDeleteOpen=!1,_.success(`Collection Deleted`,`Collection "${t}" was deleted successfully.`),i.navigate(`/collections`)},onError:e=>{this.isDeleteOpen=!1,_.error(`Delete Failed`,e.message||`Failed to delete collection.`)}});constructor(){super(),this.fields=[],this.rules={...m},this.isDeleteOpen=!1,new o(this,i)}willUpdate(){let e=this.moul.data;e&&e!==this.loadedMoul&&(this.loadedMoul=e,this.fields=e.fields||[],this.rules=e.rules||{})}save(){let e=h(this.fields,this.moul.data?.type||`base`);e.isValid?this.updateMutation.mutate({name:this.moulName,fields:g(this.fields,this.moulName),rules:this.rules}):_.error(`Schema Validation Error`,e.summaryErrors[0]||`Please fix invalid field configurations.`)}renderAssociations(){let e=this.moulName,t=this.fields.filter(e=>e.type===`relation`&&e.relationConfig),n=v(this.allMouls.data,e),r=t.length+n.length,i=e=>u`<moul-badge variant="bordered">${e}</moul-badge>`;return u`
      <moul-card>
        <moul-card-header>
          <div class="section-header">
            <h2>
              <admin-icon name="share-network" size="18" color="var(--color-primary-500)"></admin-icon>
              Associations & Relationships Graph
            </h2>
            ${r>0?u`<moul-badge tone="primary">${r} active association${r===1?``:`s`}</moul-badge>`:i(`0 active associations`)}
          </div>
        </moul-card-header>
        <moul-card-body>
          <div class="associations">
            <div class="association-column">
              <div class="association-title">
                <admin-icon name="arrow-right" size="14" color="var(--color-primary-500)"></admin-icon>
                Outgoing References (${t.length})
              </div>
              ${t.length===0?u`<span class="none">No outgoing foreign relations configured in this collection.</span>`:t.map(t=>u`
                      <div class="association">
                        <div class="association-path">
                          <admin-icon name="link" size="14" color="var(--color-primary-500)"></admin-icon>
                          <strong>${t.name}</strong>
                          <span class="muted">➔</span>
                          <strong class="target">${t.relationConfig?.targetMoul}</strong>
                          ${t.relationConfig?.targetMoul===e?i(`self`):d}
                        </div>
                        <div class="association-badges">
                          <moul-badge tone="primary">${t.relationConfig?.cardinality||`1:N`}</moul-badge>
                          ${i(t.relationConfig?.onDelete||`SET_NULL`)}
                        </div>
                      </div>
                    `)}
            </div>

            <div class="association-column">
              <div class="association-title">
                <admin-icon name="share-network" size="14" color="var(--color-success-500)"></admin-icon>
                Incoming References (${n.length})
              </div>
              ${n.length===0?u`<span class="none">No other collections reference ${e} yet.</span>`:n.map(t=>u`
                      <div class="association">
                        <div class="association-path">
                          <strong class="target">${t.sourceMoul}</strong>
                          <span class="muted">(${t.fieldName})</span>
                          <span class="muted">➔</span>
                          <strong>${e}</strong>
                        </div>
                        <div class="association-badges">
                          <moul-badge tone="success">${t.cardinality}</moul-badge>
                          ${i(t.onDelete)}
                        </div>
                      </div>
                    `)}
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `}render(){let e=this.moulName,t=this.moul.data;if(this.moul.result.isLoading)return u`<div class="muted">Loading collection schema...</div>`;let n=this.updateMutation.isPending,r=s(()=>this.isDeleteOpen=!0);return u`
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <admin-icon name="database" size="24" color="var(--color-primary-500)"></admin-icon>
            ${e}
            <moul-badge tone="primary">${t?.type||`base`}</moul-badge>
          </h1>
          <span class="page-subtitle">Configure fields, associations, and access rules.</span>
        </div>
        <div class="page-actions">
          <moul-button variant="danger-soft" aria-label=${`Delete collection ${e}`} @click=${r}>
            <admin-icon slot="prefix" name="trash" size="16"></admin-icon>
            Delete
          </moul-button>
          <moul-button variant="primary" ?is-disabled=${n} @click=${s(()=>this.save())}>
            <admin-icon slot="prefix" name="floppy-disk" size="16"></admin-icon>
            ${n?`Saving...`:`Save Schema`}
          </moul-button>
        </div>
      </div>

      ${this.renderAssociations()}

      <moul-card>
        <moul-card-body>
          <admin-fields-builder
            current-moul-name=${e}
            collection-type=${t?.type||`base`}
            .fields=${this.fields}
            .allMouls=${this.allMouls.data??[]}
            @fieldschange=${e=>this.fields=e.detail.fields}
          ></admin-fields-builder>
        </moul-card-body>
      </moul-card>

      <moul-card>
        <moul-card-body>
          <admin-rules-editor
            ?is-auth-collection=${t?.type===`auth`}
            .rules=${this.rules}
            @ruleschange=${e=>this.rules=e.detail.rules}
          ></admin-rules-editor>
        </moul-card-body>
      </moul-card>

      <moul-card>
        <moul-card-header>
          <h2 class="danger-title">
            <admin-icon name="warning-circle" size="20"></admin-icon>
            Danger Zone
          </h2>
        </moul-card-header>
        <moul-card-body>
          <div class="danger-row">
            <div>
              <strong>Delete this collection</strong>
              <span>Permanently delete <code>${e}</code> and all of its records. This action cannot be undone.</span>
            </div>
            <moul-button variant="danger" @click=${r}>
              <admin-icon slot="prefix" name="trash" size="16"></admin-icon>
              Delete Collection
            </moul-button>
          </div>
        </moul-card-body>
      </moul-card>

      ${p({isOpen:this.isDeleteOpen,name:e,isPending:this.deleteMutation.isPending,confirmLabel:`Delete Collection`,onCancel:()=>this.isDeleteOpen=!1,onConfirm:()=>this.deleteMutation.mutate(e)})}
    `}};customElements.define(`admin-collection-page`,y);export{y as AdminCollectionPage};