import{C as e,c as t,d as n,l as r,o as i,r as a,t as o,u as s,v as c,x as l,y as u}from"./index-RipJGQkD.js";import{t as d}from"./repeat-CCJXDy8Q.js";import{n as f,t as p}from"./page-BkXVDI8g.js";import{n as m,t as h}from"./rules-editor-DoS-GY3A.js";import{n as g,t as _}from"./forms-ChSyHPkg.js";import{a as v,f as y}from"./fieldValidation-D0RWDzzJ.js";import{t as b}from"./toast-CFk4KYOX.js";import{t as x}from"./collection-type-CFe_NMzc.js";var S=`id = @request.auth.id`;function C(e,t){if(e===`auth`){let e=e=>e===``||e===S||e===void 0?S:e;return{listRule:e(t.listRule),viewRule:e(t.viewRule),createRule:t.createRule||``,updateRule:e(t.updateRule),deleteRule:e(t.deleteRule)}}let n=e=>e===S?``:e;return{listRule:n(t.listRule),viewRule:n(t.viewRule),createRule:t.createRule,updateRule:n(t.updateRule),deleteRule:n(t.deleteRule)}}var w=class extends c{static styles=[a,f,e`
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
    `];static properties={isCreateOpen:{state:!0},createTab:{state:!0},collectionToDelete:{state:!0},newName:{state:!0},newType:{state:!0},newFields:{state:!0},newRules:{state:!0},error:{state:!0}};mouls=new r(this,()=>({queryKey:[`mouls`],queryFn:n.listMouls}));createMutation=new t(this,{mutationFn:e=>n.createMoul(e),onSuccess:()=>{s.invalidateQueries({queryKey:[`mouls`]}),this.isCreateOpen=!1,this.resetCreateForm(),b.success(`Collection Created`,`Collection created successfully.`)},onError:e=>{this.error=e.message||`Failed to create collection`}});deleteMutation=new t(this,{mutationFn:e=>n.deleteMoul(e),onSuccess:()=>{s.invalidateQueries({queryKey:[`mouls`]}),this.collectionToDelete=null,b.success(`Collection Deleted`,`Collection was deleted successfully.`)},onError:e=>{this.collectionToDelete=null,b.error(`Delete Failed`,e.message||`Failed to delete collection.`)}});constructor(){super(),this.isCreateOpen=!1,this.collectionToDelete=null,this.resetCreateForm()}resetCreateForm(){this.newName=``,this.newType=`base`,this.newFields=[],this.newRules={...h},this.createTab=`general`,this.error=null}openCreate(){this.resetCreateForm(),this.isCreateOpen=!0}handleCreate(){this.error=null;let e=this.newName.trim().toLowerCase();if(!e){this.error=`Collection name is required.`,this.createTab=`general`;return}let t=v(this.newFields,this.newType);if(!t.isValid){this.error=t.summaryErrors[0]||`Please fix invalid field configurations.`,this.createTab=`general`;return}let n=this.newType===`auth`?{listRule:this.newRules.listRule||S,viewRule:this.newRules.viewRule||S,createRule:this.newRules.createRule||``,updateRule:this.newRules.updateRule||S,deleteRule:this.newRules.deleteRule||S}:this.newRules;this.createMutation.mutate({name:e,type:this.newType,fields:y(this.newFields,e),rules:n})}renderFieldPills(e){let t=e=>l`<span class="pill">${e}</span>`;return l`
      <div class="fields">
        <span>Fields:</span>
        ${t(`id`)} ${t(`createdAt`)} ${t(`updatedAt`)}
        ${e.type===`auth`?l`<span class="pill accent">username</span><span class="pill accent">email</span>`:u}
        ${(e.fields||[]).map(e=>e.type===`relation`&&e.relationConfig?l`
                <span
                  class="pill accent"
                  title=${`Relation ${e.name} ➔ ${e.relationConfig.targetMoul} (${e.relationConfig.cardinality||`1:N`})`}
                >
                  <admin-icon name="link" size="12"></admin-icon>
                  ${e.name} ➔ ${e.relationConfig.targetMoul}
                </span>
              `:t(`${e.name} (${e.type})`))}
      </div>
    `}renderCard(e){let t=e.name;return l`
      <moul-card>
        <moul-card-header>
          <div class="card-top">
            <span class="card-name">
              <admin-icon name="database" size="20" color="var(--color-primary-500)"></admin-icon>
              ${t}
            </span>
            ${x(e.type)}
          </div>
        </moul-card-header>
        <moul-card-body>${this.renderFieldPills(e)}</moul-card-body>
        <moul-card-footer>
          <div class="card-actions">
            <div class="action-group">
              <moul-button
                variant="secondary"
                @click=${o(()=>i.navigate(`/records/${encodeURIComponent(t)}`,{search:{page:1,perPage:30}}))}
              >
                <admin-icon slot="prefix" name="table" size="14"></admin-icon>
                Records
              </moul-button>
              <moul-button variant="ghost" @click=${o(()=>i.navigate(`/collections/${encodeURIComponent(t)}`))}>
                <admin-icon slot="prefix" name="sliders" size="14"></admin-icon>
                Schema
              </moul-button>
            </div>
            <moul-button variant="ghost" is-icon aria-label=${`Delete collection ${t}`} @click=${o(()=>this.collectionToDelete=t)}>
              <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
            </moul-button>
          </div>
        </moul-card-footer>
      </moul-card>
    `}renderList(){let{data:e,isLoading:t}=this.mouls.result;return t?l`<div class="muted">Loading collections...</div>`:!e||e.length===0?l`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No collections yet</span>
          <span slot="description">Create your first collection to define your schema and store data.</span>
          <moul-button slot="actions" variant="primary" @click=${o(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Collection
          </moul-button>
        </moul-empty-state>
      `:l`<div class="grid">${d(e,e=>e.name,e=>this.renderCard(e))}</div>`}renderCreateDrawer(){let e=this.createMutation.isPending;return l`
      <moul-drawer
        placement="right"
        size="lg"
        ?is-open=${this.isCreateOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(this.isCreateOpen=e.detail.isOpen)}}
      >
        <div slot="header" class="drawer-header">
          <h2>Create Collection</h2>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${o(()=>this.isCreateOpen=!1)}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <form
          @submit=${e=>{e.preventDefault(),this.handleCreate()}}
          @keydown=${g}
        >
          ${this.error?l`<moul-alert tone="error" description=${this.error}></moul-alert>`:u}

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
                  @input=${e=>this.newName=_(e)}
                ></moul-text-field>
                <moul-select
                  label="Collection Type"
                  selected-key=${this.newType}
                  @selectionchange=${e=>{e.detail.selectedKey&&(this.newType=e.detail.selectedKey,this.newRules=C(this.newType,this.newRules))}}
                >
                  <moul-select-item key="base">Base — Standard data collection</moul-select-item>
                  <moul-select-item key="auth">Auth — Users with authentication</moul-select-item>
                </moul-select>
                <admin-fields-builder
                  current-moul-name=${this.newName}
                  collection-type=${this.newType}
                  .fields=${this.newFields}
                  .allMouls=${this.mouls.data??[]}
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

        <moul-button slot="footer" variant="outline" @click=${o(()=>this.isCreateOpen=!1)}>Cancel</moul-button>
        <moul-button slot="footer" variant="primary" ?is-disabled=${e} @click=${o(()=>this.handleCreate())}>
          ${e?`Creating Collection...`:`Create Collection`}
        </moul-button>
      </moul-drawer>
    `}render(){return l`
      ${p(`Collections Schema`,`Manage schemas, fields, and access rules.`,l`
          <moul-button variant="primary" @click=${o(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" weight="bold" size="16"></admin-icon>
            New Collection
          </moul-button>
        `)}
      ${this.renderList()} ${this.renderCreateDrawer()}
      ${m({isOpen:this.collectionToDelete!==null,name:this.collectionToDelete??``,isPending:this.deleteMutation.isPending,onCancel:()=>this.collectionToDelete=null,onConfirm:()=>{this.collectionToDelete&&this.deleteMutation.mutate(this.collectionToDelete)}})}
    `}};customElements.define(`admin-collections-page`,w);export{w as AdminCollectionsPage};