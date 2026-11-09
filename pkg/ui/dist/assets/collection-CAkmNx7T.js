import{i as e,l as t,n,o as r,r as i,t as a}from"./press-CVc8c9H4.js";import{i as o,t as s}from"./router-B1wwybcr.js";import{n as c,t as l}from"./live-query-CaUrZsz9.js";import{F as u,i as d}from"./index-BTyfsV_n.js";import{n as f}from"./page-C5Uax4jB.js";import{n as p,t as m}from"./rules-editor-GO4lt_fm.js";import{a as h,f as g}from"./fieldValidation-D0RWDzzJ.js";import{t as _}from"./toast-C0GhDIwH.js";function v(e,t){let n=[];for(let r of e??[])if(r.name!==t)for(let e of r.fields??[])e.type===`relation`&&e.relationConfig?.targetMoul===t&&n.push({sourceMoul:r.name,fieldName:e.name,cardinality:e.relationConfig.cardinality||`1:N`,onDelete:e.relationConfig.onDelete||`SET_NULL`});return n}var y=class extends i{static styles=[n,f,t`
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
    `];static properties={fields:{state:!0},rules:{state:!0},isDeleteOpen:{state:!0}};get moulName(){return s.location.params.moulName??``}moul=new l(this,e=>this.moulName?e.from({moul:d}).where(({moul:e})=>u(e.name,this.moulName)).findOne():void 0,()=>[this.moulName]);allMouls=new l(this,e=>e.from({moul:d}));saving=new c(this);deleting=new c(this);loadedMoul;constructor(){super(),this.fields=[],this.rules={...m},this.isDeleteOpen=!1,new o(this,s)}willUpdate(){let e=this.moul.first;e&&e!==this.loadedMoul&&(this.loadedMoul=e,this.fields=e.fields||[],this.rules=e.rules||{})}async save(){let e=this.moulName,t=h(this.fields,this.moul.first?.type||`base`);if(!t.isValid){_.error(`Schema Validation Error`,t.summaryErrors[0]||`Please fix invalid field configurations.`);return}let n=g(this.fields,e),r=this.rules,i=d.update(e,{optimistic:!1},e=>{e.fields=n,e.rules=r});try{await this.saving.track(i),_.success(`Schema Saved`,`Collection schema and associations saved successfully.`)}catch(e){_.error(`Save Failed`,e?.message||`Failed to save collection schema.`)}}async deleteCollection(e){try{await this.deleting.track(d.delete(e)),_.success(`Collection Deleted`,`Collection "${e}" was deleted successfully.`),s.navigate(`/collections`)}catch(e){_.error(`Delete Failed`,e?.message||`Failed to delete collection.`)}finally{this.isDeleteOpen=!1}}renderAssociations(){let t=this.moulName,n=this.fields.filter(e=>e.type===`relation`&&e.relationConfig),i=v(this.allMouls.data,t),a=n.length+i.length,o=e=>r`<moul-badge variant="bordered">${e}</moul-badge>`;return r`
      <moul-card>
        <moul-card-header>
          <div class="section-header">
            <h2>
              <admin-icon name="share-network" size="18" color="var(--color-primary-500)"></admin-icon>
              Associations & Relationships Graph
            </h2>
            ${a>0?r`<moul-badge tone="primary">${a} active association${a===1?``:`s`}</moul-badge>`:o(`0 active associations`)}
          </div>
        </moul-card-header>
        <moul-card-body>
          <div class="associations">
            <div class="association-column">
              <div class="association-title">
                <admin-icon name="arrow-right" size="14" color="var(--color-primary-500)"></admin-icon>
                Outgoing References (${n.length})
              </div>
              ${n.length===0?r`<span class="none">No outgoing foreign relations configured in this collection.</span>`:n.map(n=>r`
                      <div class="association">
                        <div class="association-path">
                          <admin-icon name="link" size="14" color="var(--color-primary-500)"></admin-icon>
                          <strong>${n.name}</strong>
                          <span class="muted">➔</span>
                          <strong class="target">${n.relationConfig?.targetMoul}</strong>
                          ${n.relationConfig?.targetMoul===t?o(`self`):e}
                        </div>
                        <div class="association-badges">
                          <moul-badge tone="primary">${n.relationConfig?.cardinality||`1:N`}</moul-badge>
                          ${o(n.relationConfig?.onDelete||`SET_NULL`)}
                        </div>
                      </div>
                    `)}
            </div>

            <div class="association-column">
              <div class="association-title">
                <admin-icon name="share-network" size="14" color="var(--color-success-500)"></admin-icon>
                Incoming References (${i.length})
              </div>
              ${i.length===0?r`<span class="none">No other collections reference ${t} yet.</span>`:i.map(e=>r`
                      <div class="association">
                        <div class="association-path">
                          <strong class="target">${e.sourceMoul}</strong>
                          <span class="muted">(${e.fieldName})</span>
                          <span class="muted">➔</span>
                          <strong>${t}</strong>
                        </div>
                        <div class="association-badges">
                          <moul-badge tone="success">${e.cardinality}</moul-badge>
                          ${o(e.onDelete)}
                        </div>
                      </div>
                    `)}
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `}render(){let e=this.moulName,t=this.moul.first;if(this.moul.isLoading)return r`<div class="muted">Loading collection schema...</div>`;let n=this.saving.isPending,i=a(()=>this.isDeleteOpen=!0);return r`
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
          <moul-button variant="danger-soft" aria-label=${`Delete collection ${e}`} @click=${i}>
            <admin-icon slot="prefix" name="trash" size="16"></admin-icon>
            Delete
          </moul-button>
          <moul-button variant="primary" ?is-disabled=${n} @click=${a(()=>this.save())}>
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
            .allMouls=${this.allMouls.data}
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
            <moul-button variant="danger" @click=${i}>
              <admin-icon slot="prefix" name="trash" size="16"></admin-icon>
              Delete Collection
            </moul-button>
          </div>
        </moul-card-body>
      </moul-card>

      ${p({isOpen:this.isDeleteOpen,name:e,isPending:this.deleting.isPending,confirmLabel:`Delete Collection`,onCancel:()=>this.isDeleteOpen=!1,onConfirm:()=>void this.deleteCollection(e)})}
    `}};customElements.define(`admin-collection-page`,y);export{y as AdminCollectionPage};