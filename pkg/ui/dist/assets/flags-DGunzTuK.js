import{C as e,c as t,d as n,l as r,r as i,t as a,u as o,v as s,x as c,y as l}from"./index-RipJGQkD.js";import{t as u}from"./repeat-CCJXDy8Q.js";import{n as d,t as f}from"./page-BkXVDI8g.js";import{n as p,t as m}from"./forms-ChSyHPkg.js";import{t as h}from"./toast-CFk4KYOX.js";var g=`{
  "user_id": "usr_123",
  "role": "beta"
}`,_=[{label:`Standard User`,json:`{
  "user_id": "usr_standard_123"
}`},{label:`Beta Tester`,json:`{
  "user_id": "usr_beta_456",
  "role": "beta_tester"
}`},{label:`Internal Staff`,json:`{
  "user_id": "usr_staff_789",
  "groups": ["internal_staff"]
}`},{label:`Rollout Target`,json:`{
  "target_id": "user_bucket_42",
  "percentage": 50
}`}],v=class extends s{static styles=[i,d,e`
      :host {
        --page-gap: var(--spacing-4);
      }

      .flags {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
      }

      .flag {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-3);
        width: 100%;
      }

      .flag-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .flag-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .flag-key {
        font-family: var(--font-mono);
        font-size: 1rem;
        font-weight: 600;
      }

      .flag-description {
        font-size: 0.8125rem;
        color: var(--color-fg-subtle);
      }

      .flag-actions,
      .presets {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .drawer-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        width: 100%;
        font-size: 1rem;
        font-weight: 600;
      }

      .drawer-title span {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        color: var(--color-fg);
      }

      .presets-label,
      .outcome-label {
        display: block;
        margin-bottom: var(--spacing-1);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-fg-subtle);
      }

      .json-error {
        font-size: var(--font-size-sm);
        color: var(--color-error-500);
      }

      .result {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        margin-top: var(--spacing-2);
        padding: var(--spacing-4);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-sm);
      }

      .result code {
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
      }

      .outcome {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        font-weight: 700;
      }
    `];static properties={isCreateOpen:{state:!0},flagToDelete:{state:!0},newKey:{state:!0},newDescription:{state:!0},newEnabled:{state:!0},isEvalOpen:{state:!0},evalKey:{state:!0},evalContext:{state:!0},evalJsonError:{state:!0},evalResult:{state:!0}};flags=new r(this,()=>({queryKey:[`flags`],queryFn:n.listFeatureFlags}));createMutation=new t(this,{mutationFn:e=>n.createFeatureFlag(e),onSuccess:()=>{o.invalidateQueries({queryKey:[`flags`]}),this.isCreateOpen=!1,this.resetCreateForm(),h.success(`Flag Created`,`Feature flag was created successfully.`)},onError:e=>h.error(`Create Failed`,e.message||`Failed to create feature flag.`)});updateMutation=new t(this,{mutationFn:({key:e,data:t})=>n.updateFeatureFlag(e,t),onSuccess:()=>o.invalidateQueries({queryKey:[`flags`]}),onError:e=>{o.invalidateQueries({queryKey:[`flags`]}),h.error(`Update Failed`,e.message||`Failed to update feature flag.`)}});deleteMutation=new t(this,{mutationFn:e=>n.deleteFeatureFlag(e),onSuccess:()=>{o.invalidateQueries({queryKey:[`flags`]}),this.flagToDelete=null,h.success(`Flag Deleted`,`Feature flag was deleted successfully.`)},onError:e=>{this.flagToDelete=null,h.error(`Delete Failed`,e.message||`Failed to delete feature flag.`)}});evalMutation=new t(this,{mutationFn:({key:e,context:t})=>n.evalFeatureFlag(e,t),onSuccess:e=>{this.evalResult=e},onError:e=>h.error(`Evaluation Failed`,e.message||`Failed to evaluate feature flag.`)});constructor(){super(),this.isCreateOpen=!1,this.flagToDelete=null,this.isEvalOpen=!1,this.evalKey=``,this.evalContext=g,this.evalJsonError=null,this.evalResult=null,this.resetCreateForm()}resetCreateForm(){this.newKey=``,this.newDescription=``,this.newEnabled=!0}create(){this.newKey.trim()?this.createMutation.mutate({key:this.newKey.trim(),description:this.newDescription.trim(),enabled:this.newEnabled,value_type:`boolean`,variations:[{value:!0,name:`On`},{value:!1,name:`Off`}],rules:[]}):h.error(`Validation Error`,`Flag key is required.`)}openEval(e){let t=this.flags.data??[];this.evalKey=e||t[0]?.key||``,this.evalResult=null,this.evalJsonError=null,this.isEvalOpen=!0}runEval(){this.evalJsonError=null;let e={};if(this.evalContext.trim())try{e=JSON.parse(this.evalContext)}catch(e){this.evalJsonError=`Invalid JSON format: ${e.message}`;return}this.evalMutation.mutate({key:this.evalKey,context:e})}renderFlag(e){return c`
      <moul-card>
        <moul-card-body>
          <div class="flag">
            <div class="flag-info">
              <div class="flag-title">
                <admin-icon name="flag" size="18" color="var(--color-primary-500)"></admin-icon>
                <span class="flag-key">${e.key}</span>
                ${e.enabled?c`<moul-badge tone="success">Enabled</moul-badge>`:c`<moul-badge variant="bordered">Disabled</moul-badge>`}
              </div>
              ${e.description?c`<span class="flag-description">${e.description}</span>`:l}
            </div>
            <div class="flag-actions">
              <moul-button variant="outline" aria-label=${`Test evaluate flag ${e.key}`} @click=${a(()=>this.openEval(e.key))}>
                <admin-icon slot="prefix" name="flask" size="14"></admin-icon>
                Evaluate
              </moul-button>
              <moul-switch
                aria-label=${`Toggle flag ${e.key}`}
                ?is-checked=${!!e.enabled}
                @change=${t=>this.updateMutation.mutate({key:e.key,data:{enabled:t.detail.isChecked}})}
              >
                ${e.enabled?`Enabled`:`Disabled`}
              </moul-switch>
              <moul-button variant="ghost" is-icon aria-label=${`Delete flag ${e.key}`} @click=${a(()=>this.flagToDelete=e)}>
                <admin-icon name="trash" size="16" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </div>
          </div>
        </moul-card-body>
      </moul-card>
    `}renderList(){let{data:e,isLoading:t}=this.flags.result;return t?c`<div class="muted">Loading feature flags...</div>`:!e||e.length===0?c`
        <moul-empty-state variant="bordered">
          <admin-icon slot="icon" name="flag" size="32" color="var(--color-primary-500)"></admin-icon>
          <span slot="title">No feature flags</span>
          <span slot="description">Add flags to safely toggle features and manage rollouts.</span>
          <moul-button slot="actions" variant="primary" @click=${a(()=>this.isCreateOpen=!0)}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Flag
          </moul-button>
        </moul-empty-state>
      `:c`<div class="flags">${u(e,e=>e.key,e=>this.renderFlag(e))}</div>`}renderEvalDrawer(){let e=this.flags.data??[],t=this.evalResult;return c`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isEvalOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(this.isEvalOpen=e.detail.isOpen)}}
      >
        <div slot="header" class="drawer-title">
          <span>
            <admin-icon name="flask" size="20" color="var(--color-primary-500)"></admin-icon>
            Feature Flag Eval Playground
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${a(()=>this.isEvalOpen=!1)}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <div class="form">
          ${e.length>0?c`
                <moul-select
                  label="Select Target Flag"
                  selected-key=${this.evalKey}
                  @selectionchange=${e=>{e.detail.selectedKey&&(this.evalKey=e.detail.selectedKey,this.evalResult=null)}}
                >
                  ${e.map(e=>c`<moul-select-item key=${e.key} value=${e.key}>${e.key} (${e.enabled?`ON`:`OFF`})</moul-select-item>`)}
                </moul-select>
              `:l}

          <div>
            <span class="presets-label">Quick Context Presets</span>
            <div class="presets">
              ${_.map(e=>c`
                  <moul-button
                    variant="outline"
                    size="sm"
                    @click=${a(()=>{this.evalContext=e.json,this.evalJsonError=null})}
                  >
                    ${e.label}
                  </moul-button>
                `)}
            </div>
          </div>

          <moul-text-area
            label="Evaluation Context (JSON)"
            rows="6"
            description="Attributes passed to targeting gates & percentage rollouts"
            .value=${this.evalContext}
            @input=${e=>this.evalContext=m(e)}
          ></moul-text-area>

          ${this.evalJsonError?c`<div class="json-error">${this.evalJsonError}</div>`:l}
          ${t?c`
                <div class="result">
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <span class="outcome-label" style="margin: 0">Evaluation Outcome</span>
                    <moul-badge tone=${t.value?`success`:`error`}>
                      <span class="outcome">
                        <admin-icon name=${t.value?`check-circle`:`x-circle`} weight="bold" size="15"></admin-icon>
                        ${String(t.value).toUpperCase()}
                      </span>
                    </moul-badge>
                  </div>
                  <div>Reason Code: <code>${t.reason||`evaluated`}</code></div>
                  ${t.variation===void 0?l:c`<div class="muted">Variation: <strong>${String(t.variation)}</strong></div>`}
                </div>
              `:l}
        </div>

        <moul-button slot="footer" variant="ghost" @click=${a(()=>this.isEvalOpen=!1)}>Close</moul-button>
        <moul-button
          slot="footer"
          variant="primary"
          ?is-disabled=${!this.evalKey}
          ?is-pending=${this.evalMutation.isPending}
          @click=${a(()=>this.runEval())}
        >
          <admin-icon slot="prefix" name="play" weight="fill" size="14"></admin-icon>
          Run Evaluation
        </moul-button>
      </moul-drawer>
    `}renderCreateDrawer(){let e=this.createMutation.isPending;return c`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isCreateOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(this.isCreateOpen=e.detail.isOpen)}}
      >
        <div slot="header" class="drawer-title">
          <span>Create Feature Flag</span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${a(()=>this.isCreateOpen=!1)}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>
        <form
          class="form"
          @submit=${e=>{e.preventDefault(),this.create()}}
          @keydown=${p}
        >
          <moul-text-field
            label="Flag Key"
            placeholder="e.g. enable_beta_dashboard"
            description="Unique snake_case identifier"
            is-required
            .value=${this.newKey}
            @input=${e=>this.newKey=m(e)}
          ></moul-text-field>
          <moul-text-field
            label="Description"
            placeholder="What does this feature flag toggle?"
            .value=${this.newDescription}
            @input=${e=>this.newDescription=m(e)}
          ></moul-text-field>
          <moul-checkbox ?is-checked=${this.newEnabled} @change=${e=>this.newEnabled=e.detail.isChecked}>
            Enable by default
          </moul-checkbox>
        </form>
        <moul-button slot="footer" variant="ghost" @click=${a(()=>this.isCreateOpen=!1)}>Cancel</moul-button>
        <moul-button slot="footer" variant="primary" ?is-disabled=${e} @click=${a(()=>this.create())}>
          ${e?`Creating...`:`Create Flag`}
        </moul-button>
      </moul-drawer>
    `}render(){let e=this.flagToDelete;return c`
      ${f(`Feature Flags`,`Feature toggles and gradual rollouts.`,c`
          <moul-button variant="secondary" @click=${a(()=>this.openEval())}>
            <admin-icon slot="prefix" name="flask" size="16"></admin-icon>
            Playground
          </moul-button>
          <moul-button variant="primary" @click=${a(()=>this.isCreateOpen=!0)}>
            <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
            New Flag
          </moul-button>
        `)}
      ${this.renderList()} ${this.renderEvalDrawer()} ${this.renderCreateDrawer()}

      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${e!==null}
        @openchange=${e=>{e.detail.isOpen||(this.flagToDelete=null)}}
      >
        <span slot="header">Delete Feature Flag</span>
        <p slot="body" style="margin: 0; font-size: var(--font-size-sm); color: var(--color-fg-subtle)">
          Are you sure you want to delete feature flag <strong>“${e?.key}”</strong>?<br /><br />
          This action cannot be undone and will remove all targeting rules associated with this flag.
        </p>
        <moul-button slot="footer" variant="outline" @click=${a(()=>this.flagToDelete=null)}>Cancel</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          ?is-pending=${this.deleteMutation.isPending}
          @click=${a(()=>{e&&this.deleteMutation.mutate(e.key)})}
        >
          Delete
        </moul-button>
      </moul-alert-dialog>
    `}};customElements.define(`admin-flags-page`,v);export{v as AdminFlagsPage};