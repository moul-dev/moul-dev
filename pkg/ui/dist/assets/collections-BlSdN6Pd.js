import{c as e,i as t,n,o as r,r as i,t as a}from"./press-BQyLhwVv.js";import{t as o}from"./router-B1wwybcr.js";import{n as s,t as c}from"./live-query-DDtzER30.js";import{i as l}from"./index-DeN0Cdry.js";import{t as u}from"./repeat-Utyd6s0W.js";import{n as d,t as f}from"./page-ITe5xmEa.js";import{n as p,t as m}from"./rules-editor-CZ0ADqS3.js";import{n as h,t as g}from"./forms-ChSyHPkg.js";import{a as _,f as v}from"./fieldValidation-D0RWDzzJ.js";import{t as y}from"./toast-CRunUHSe.js";import{t as b}from"./collection-type-CsNDn6tw.js";var x=`id = @request.auth.id`;function S(e,t){if(e===`auth`){let e=e=>e===``||e===x||e===void 0?x:e;return{listRule:e(t.listRule),viewRule:e(t.viewRule),createRule:t.createRule||``,updateRule:e(t.updateRule),deleteRule:e(t.deleteRule)}}let n=e=>e===x?``:e;return{listRule:n(t.listRule),viewRule:n(t.viewRule),createRule:t.createRule,updateRule:n(t.updateRule),deleteRule:n(t.deleteRule)}}var C=class extends i{static styles=[n,d,e`
      :host {
        --page-gap: var(--spacing-4);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .card-top,
      .card-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .card-name {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 1.125rem;
        font-weight: 600;
      }

      .fields {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-1);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px var(--spacing-1);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .pill.accent {
        border-color: var(--color-primary-500);
        color: var(--color-primary-500);
        font-weight: 500;
      }

      .action-group {
        display: flex;
        gap: var(--spacing-1);
      }

      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .drawer-header h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        color: var(--color-fg);
      }

      .tab-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-block: var(--spacing-3);
      }
    `];static properties={isCreateOpen:{state:!0},createTab:{state:!0},collectionToDelete:{state:!0},newName:{state:!0},newType:{state:!0},newFields:{state:!0},newRules:{state:!0},error:{state:!0}};mouls=new c(this,e=>e.from({moul:l}));creating=new s(this);deleting=new s(this);constructor(){super(),this.isCreateOpen=!1,this.collectionToDelete=null,this.resetCreateForm()}resetCreateForm(){this.newName=``,this.newType=`base`,this.newFields=[],this.newRules={...m},this.createTab=`general`,this.error=null}openCreate(){this.resetCreateForm(),this.isCreateOpen=!0}async handleCreate(){this.error=null;let e=this.newName.trim().toLowerCase();if(!e){this.error=`Collection name is required.`,this.createTab=`general`;return}if(l.has(e)){this.error=`A collection named "${e}" already exists.`,this.createTab=`general`;return}let t=_(this.newFields,this.newType);if(!t.isValid){this.error=t.summaryErrors[0]||`Please fix invalid field configurations.`,this.createTab=`general`;return}let n=this.newType===`auth`?{listRule:this.newRules.listRule||x,viewRule:this.newRules.viewRule||x,createRule:this.newRules.createRule||``,updateRule:this.newRules.updateRule||x,deleteRule:this.newRules.deleteRule||x}:this.newRules,r=l.insert({name:e,type:this.newType,fields:v(this.newFields,e),rules:n},{optimistic:!1});try{await this.creating.track(r)}catch(e){this.error=e?.message||`Failed to create collection`;return}this.isCreateOpen=!1,this.resetCreateForm(),y.success(`Collection Created`,`Collection created successfully.`)}async deleteCollection(e){try{await this.deleting.track(l.delete(e)),y.success(`Collection Deleted`,`Collection was deleted successfully.`)}catch(e){y.error(`Delete Failed`,e?.message||`Failed to delete collection.`)}finally{this.collectionToDelete=null}}renderFieldPills(e){let n=e=>r`<span class="pill">${e}</span>`;return r`
      <div class="fields">
        <span>Fields:</span>
        ${n(`id`)} ${n(`createdAt`)} ${n(`updatedAt`)}
        ${e.type===`auth`?r`<span class="pill accent">username</span><span class="pill accent">email</span>`:t}
        ${(e.fields||[]).map(e=>e.type===`relation`&&e.relationConfig?r`
                <span
                  class="pill accent"
                  title=${`Relation ${e.name} ➔ ${e.relationConfig.targetMoul} (${e.relationConfig.cardinality||`1:N`})`}
                >
                  <admin-icon name="link" size="12"></admin-icon>
                  ${e.name} ➔ ${e.relationConfig.targetMoul}
                </span>
              `:n(`${e.name} (${e.type})`))}
      </div>
    `}renderCard(e){let t=e.name;return r`
      <moul-card>
        <moul-card-header>
          <div class="card-top">
            <span class="card-name">
              <admin-icon name="database" size="20" color="var(--color-primary-500)"></admin-icon>
              ${t}
            </span>
            ${b(e.type)}
          </div>
        </moul-card-header>
        <moul-card-body>${this.renderFieldPills(e)}</moul-card-body>
        <moul-card-footer>
          <div class="card-actions">
            <div class="action-group">
              <moul-button
                variant="secondary"
                @click=${a(()=>o.navigate(`/records/${encodeURIComponent(t)}`,{search:{page:1,perPage:30}}))}
              >
                <admin-icon slot="prefix" name="table" size="14"></admin-icon>
                Records
              </moul-button>
              <moul-button variant="ghost" @click=${a(()=>o.navigate(`/collections/${encodeURIComponent(t)}`))}>
                <admin-icon slot="prefix" name="sliders" size="14"></admin-icon>
                Schema
              </moul-button>
            </div>
            <moul-button variant="ghost" is-icon aria-label=${`Delete collection ${t}`} @click=${a(()=>this.collectionToDelete=t)}>
              <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
            </moul-button>
          </div>
        </moul-card-footer>
      </moul-card>
    `}renderList(){let{data:e,isLoading:t}=this.mouls;return t?r`<div class="muted">Loading collections...</div>`:e.length===0?r`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No collections yet</span>
          <span slot="description">Create your first collection to define your schema and store data.</span>
          <moul-button slot="actions" variant="primary" @click=${a(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Collection
          </moul-button>
        </moul-empty-state>
      `:r`<div class="grid">${u(e,e=>e.name,e=>this.renderCard(e))}</div>`}renderCreateDrawer(){let e=this.creating.isPending;return r`
      <moul-drawer
        placement="right"
        size="lg"
        ?is-open=${this.isCreateOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(this.isCreateOpen=e.detail.isOpen)}}
      >
        <div slot="header" class="drawer-header">
          <h2>Create Collection</h2>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${a(()=>this.isCreateOpen=!1)}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <form
          @submit=${e=>{e.preventDefault(),this.handleCreate()}}
          @keydown=${h}
        >
          ${this.error?r`<moul-alert tone="error" description=${this.error}></moul-alert>`:t}

          <moul-tabs
            variant="line"
            selected-key=${this.createTab}
            @selectionchange=${e=>{e.target===e.currentTarget&&(this.createTab=e.detail.selectedKey)}}
          >
            <moul-tab slot="tab" key="general">General & Fields</moul-tab>
            <moul-tab slot="tab" key="rules">Rules</moul-tab>

            <moul-tab-panel key="general">
              <div class="tab-content">
                <moul-text-field
                  label="Collection Name"
                  placeholder="e.g. posts, products, customers"
                  description="Unique table name for this collection."
                  is-required
                  .value=${this.newName}
                  @input=${e=>this.newName=g(e)}
                ></moul-text-field>
                <moul-select
                  label="Collection Type"
                  selected-key=${this.newType}
                  @selectionchange=${e=>{e.detail.selectedKey&&(this.newType=e.detail.selectedKey,this.newRules=S(this.newType,this.newRules))}}
                >
                  <moul-select-item key="base">Base — Standard data collection</moul-select-item>
                  <moul-select-item key="auth">Auth — Users with authentication</moul-select-item>
                </moul-select>
                <admin-fields-builder
                  current-moul-name=${this.newName}
                  collection-type=${this.newType}
                  .fields=${this.newFields}
                  .allMouls=${this.mouls.data}
                  @fieldschange=${e=>this.newFields=e.detail.fields}
                ></admin-fields-builder>
              </div>
            </moul-tab-panel>

            <moul-tab-panel key="rules">
              <div class="tab-content">
                <admin-rules-editor
                  ?is-auth-collection=${this.newType===`auth`}
                  .rules=${this.newRules}
                  @ruleschange=${e=>this.newRules=e.detail.rules}
                ></admin-rules-editor>
              </div>
            </moul-tab-panel>
          </moul-tabs>
        </form>

        <moul-button slot="footer" variant="outline" @click=${a(()=>this.isCreateOpen=!1)}>Cancel</moul-button>
        <moul-button slot="footer" variant="primary" ?is-disabled=${e} @click=${a(()=>this.handleCreate())}>
          ${e?`Creating Collection...`:`Create Collection`}
        </moul-button>
      </moul-drawer>
    `}render(){return r`
      ${f(`Collections Schema`,`Manage schemas, fields, and access rules.`,r`
          <moul-button variant="primary" @click=${a(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" weight="bold" size="16"></admin-icon>
            New Collection
          </moul-button>
        `)}
      ${this.renderList()} ${this.renderCreateDrawer()}
      ${p({isOpen:this.collectionToDelete!==null,name:this.collectionToDelete??``,isPending:this.deleting.isPending,onCancel:()=>this.collectionToDelete=null,onConfirm:()=>{this.collectionToDelete&&this.deleteCollection(this.collectionToDelete)}})}
    `}};customElements.define(`admin-collections-page`,C);export{C as AdminCollectionsPage};