import{i as e,l as t,n,o as r,r as i,t as a}from"./press-CVc8c9H4.js";import{l as o}from"./query-DdOx0cLf.js";import{t as s}from"./forms-ChSyHPkg.js";import{c,d as l,l as u,o as d,p as f,s as p,u as m}from"./fieldValidation-D0RWDzzJ.js";import{t as h}from"./toast-C0GhDIwH.js";function g(e){return r`
    <moul-alert-dialog
      tone="error"
      size="sm"
      ?is-open=${e.isOpen}
      @openchange=${t=>{t.detail.isOpen||e.onCancel()}}
    >
      <span slot="header">Delete Collection</span>
      <p slot="body" style="margin: 0; font-size: var(--font-size-sm); color: var(--color-fg-subtle)">
        Are you sure you want to delete collection <strong>“${e.name}”</strong>?
        <br /><br />
        This will permanently delete the collection and all of its records. This action cannot be undone.
      </p>
      <moul-button slot="footer" variant="outline" @click=${a(e.onCancel)}>Cancel</moul-button>
      <moul-button slot="footer" variant="danger" ?is-pending=${e.isPending} @click=${a(e.onConfirm)}>
        ${e.confirmLabel??`Delete`}
      </moul-button>
    </moul-alert-dialog>
  `}function _(e,t,n,r){let i=(e.name||``).trim(),a=!i,o=!!(i&&m(i,r)),s=!(!i||l(i)),c=!!(i&&n.some((e,n)=>n!==t&&(e.name||``).trim().toLowerCase()===i.toLowerCase())),d=e.min!=null&&e.max!=null&&e.min>e.max,p=e.type===`select`&&(!e.options||e.options.length===0),h=u(e.type),g=!(!e.unique||h),_=f(i);return{isEmpty:a,isConflict:o,isInvalidCamel:s,isDuplicate:c,hasMinMaxConflict:d,hasSelectError:p,isUniqueEligible:h,hasUniqueError:g,isInvalid:a||o||s||c||d||p||g,suggestedCamel:_,canSuggestFix:s&&!!_&&_!==i&&l(_)&&!m(_,r)}}var v=class extends i{static styles=[n,t`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        width: 100%;
        color: var(--color-fg);
        font-family: var(--font-family-base);
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .title-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .subtitle {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .system-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
      }

      .system-banner-left,
      .system-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .system-fields {
        gap: var(--spacing-1);
      }

      .system-banner-label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-xs);
        font-weight: 600;
        color: var(--color-fg-subtle);
      }

      .system-banner-right {
        font-size: 0.6875rem;
        font-style: italic;
        color: var(--color-fg-subtle);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--color-fg);
      }

      .pill.auth {
        border-color: var(--color-primary-500);
        color: var(--color-primary-500);
        font-weight: 500;
      }

      .field-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .field-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
        transition: border-color 0.15s ease;
      }

      .field-card.relation {
        border-color: var(--color-primary-500);
      }

      .field-card.invalid {
        border-color: var(--color-error-500);
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
      }

      .top-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        width: 100%;
      }

      .order {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        flex-shrink: 0;
      }

      .order-number {
        min-width: 14px;
        text-align: center;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--color-fg-subtle);
      }

      .order-actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .name {
        flex-grow: 1;
        min-width: 0;
      }

      /* The warnings below the row explain the problem; the field only needs the red frame */
      .name.invalid::part(input-container) {
        border-color: var(--color-error-500);
      }

      .type {
        width: 175px;
        flex-shrink: 0;
      }

      .type-item {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .checkboxes {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .truncate {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .warnings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        padding-top: 2px;
      }

      /* Icon beside the message; a fix button goes under the message */
      .warning {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
        gap: var(--spacing-1) var(--spacing-2);
        font-size: var(--font-size-xs);
        color: var(--color-error-500);
      }

      .warning admin-icon {
        margin-top: 1px;
      }

      .warning moul-button {
        grid-column: 2;
        justify-self: start;
      }

      .panel {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-top: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
      }

      .panel-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .relation-banner {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .relation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-3);
      }

      .options-empty {
        font-size: var(--font-size-xs);
        font-style: italic;
        color: var(--color-fg-subtle);
      }

      .add-option {
        display: flex;
        align-items: flex-end;
        gap: var(--spacing-2);
        max-width: 360px;
      }

      .add-option moul-text-field {
        flex: 1;
      }

      .constraint-label,
      .security-title {
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .security-title {
        font-weight: 600;
      }

      .number-row {
        display: flex;
        gap: var(--spacing-2);
        max-width: 380px;
      }

      .number-row moul-number-field {
        flex: 1;
      }

      .security-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .security-description {
        padding-left: var(--spacing-4);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }
    `];static properties={fields:{attribute:!1},currentMoulName:{type:String,attribute:`current-moul-name`},allMouls:{attribute:!1},collectionType:{type:String,attribute:`collection-type`},expanded:{state:!0},newOptions:{state:!0}};constructor(){super(),this.fields=[],this.currentMoulName=``,this.allMouls=[],this.collectionType=`base`,this.expanded={},this.newOptions={}}emit(e){this.dispatchEvent(new CustomEvent(`fieldschange`,{detail:{fields:e}}))}addField(){this.emit([...this.fields,{name:p(this.fields),type:`text`,required:!1}])}moveField(e,t){let n=e+t;if(n<0||n>=this.fields.length)return;let r=[...this.fields];[r[e],r[n]]=[r[n],r[e]],this.emit(r),this.expanded={...this.expanded,[e]:!!this.expanded[n],[n]:!!this.expanded[e]}}removeField(e){this.emit(this.fields.filter((t,n)=>n!==e));let t={};for(let[n,r]of Object.entries(this.expanded)){let i=Number(n);i<e?t[i]=r:i>e&&(t[i-1]=r)}this.expanded=t}changeField(e,t,n){let r=[...this.fields],i={...r[e],[t]:n};if(t===`type`&&n===`relation`){let t=this.allMouls.find(e=>e.name!==this.currentMoulName)?.name||this.currentMoulName||`users`;i.relationConfig??={targetMoul:t,cardinality:`1:N`,onDelete:`SET_NULL`},/^field\d+$/i.test(i.name)&&(i.name=c(t,this.currentMoulName,this.fields.filter((t,n)=>n!==e))),this.expanded={...this.expanded,[e]:!0}}t===`type`&&n===`select`&&(i.options&&i.options.length!==0||(i.options=[`option1`,`option2`]),this.expanded={...this.expanded,[e]:!0}),t===`type`&&n===`cloak`&&(i.searchable??=!1),t===`unique`&&n&&(i.required=!0),t===`required`&&!n&&i.unique&&(i.unique=!1),t===`type`&&!u(String(n))&&(i.unique=!1),r[e]=i,this.emit(r)}changeRelation(e,t,n){let r=[...this.fields],i=r[e].relationConfig||{targetMoul:this.currentMoulName||`users`,cardinality:`1:N`,onDelete:`SET_NULL`};r[e]={...r[e],relationConfig:{...i,[t]:n}},this.emit(r)}addOption(e){let t=(this.newOptions[e]||``).trim();if(!t)return;let n=this.fields[e].options||[];if(!n.includes(t)){let r=[...this.fields];r[e]={...r[e],options:[...n,t]},this.emit(r)}this.newOptions={...this.newOptions,[e]:``}}removeOption(e,t){let n=[...this.fields];n[e]={...n[e],options:(n[e].options||[]).filter(e=>e!==t)},this.emit(n)}renderSystemFields(){let e=this.collectionType===`auth`,t=e=>r`<moul-badge variant="bordered" size="sm">${e}</moul-badge>`;return r`
      <div class="system-banner">
        <div class="system-banner-left">
          <span class="system-banner-label">
            <admin-icon name="info" size="14" color="var(--color-primary-500)"></admin-icon>
            ${e?`Auth & System Columns:`:`System Columns:`}
          </span>
          <div class="system-fields">
            <span class="pill" title="Primary Key (string)">id ${t(`PK`)}</span>
            ${e?r`
                  <span class="pill auth" title="Required unique login username">
                    <admin-icon name="user" size="11"></admin-icon>username
                    <moul-badge tone="primary" size="sm">unique</moul-badge>
                  </span>
                  <span class="pill auth" title="Required unique email address">
                    <admin-icon name="user" size="11"></admin-icon>email
                    <moul-badge tone="primary" size="sm">unique</moul-badge>
                  </span>
                  <span class="pill auth" title="Bcrypt password hash (hidden from read APIs)">
                    <admin-icon name="shield-check" size="11"></admin-icon>passwordHash
                  </span>
                  <span class="pill" title="Creation ISO-8601 timestamp">createdAt</span>
                  <span class="pill" title="Last updated ISO-8601 timestamp">updatedAt</span>
                `:r`
                  <span class="pill" title="Creation ISO-8601 timestamp">createdAt ${t(`datetime`)}</span>
                  <span class="pill" title="Last updated ISO-8601 timestamp">updatedAt ${t(`datetime`)}</span>
                `}
          </div>
        </div>
        <span class="system-banner-right">Auto-managed</span>
      </div>
    `}renderOptionsToggle(e,t,n){let i=e.min!==void 0||e.max!==void 0,o=`sliders`,s,c=i;switch(e.type){case`relation`:o=`link`,c=!!e.relationConfig?.targetMoul,s=e.relationConfig?.targetMoul?`➔ ${e.relationConfig.targetMoul} (${e.relationConfig.cardinality||`1:N`})`:`Configure Relation`;break;case`cloak`:o=`lock-key`,c=!!e.searchable,s=e.searchable?`Searchable`:`Cloak Options`;break;case`select`:o=`tag`,c=(e.options||[]).length>0,s=`${(e.options||[]).length} options`;break;case`text`:case`editor`:s=i?`${e.min??0}..${e.max??`∞`} chars`:`Length Limits`;break;default:s=i?`${e.min??`-∞`}..${e.max??`+∞`}`:`Value Range`}return r`
      <moul-button
        variant=${c?`secondary`:`outline`}
        size="sm"
        aria-label=${`Configure options for ${e.name||`field ${t+1}`}`}
        aria-expanded=${n?`true`:`false`}
        @click=${a(()=>this.expanded={...this.expanded,[t]:!n})}
      >
        <admin-icon slot="prefix" name=${o} size="13" color="var(--color-primary-500)"></admin-icon>
        <span class="truncate">${s}</span>
        <admin-icon slot="suffix" name=${n?`caret-up`:`caret-down`} size="12"></admin-icon>
      </moul-button>
    `}renderWarnings(t,n,i){let o=(t,n=e)=>r`
      <div class="warning">
        <admin-icon name="warning-circle" size="14"></admin-icon>
        <span>${t}</span>
        ${n}
      </div>
    `;return r`
      <div class="warnings">
        ${i.isEmpty?o(`Field name is required.`):e}
        ${i.isConflict?o(`“${t.name}” is already a built-in default column for ${this.collectionType} collections. Please rename or remove it.`):e}
        ${!i.isConflict&&!i.isEmpty&&i.isInvalidCamel?o(`Field name “${t.name}” must be camelCase (e.g. “authorId”, “viewsCount”).`,i.canSuggestFix?r`
                    <moul-button variant="secondary" size="sm" @click=${a(()=>this.changeField(n,`name`,i.suggestedCamel))}>
                      Use “${i.suggestedCamel}”
                    </moul-button>
                  `:e):e}
        ${i.isDuplicate&&!i.isConflict?o(`Field name “${t.name}” is already used in another field. Field names must be unique.`):e}
        ${i.hasMinMaxConflict?o(`Minimum (${t.min}) cannot be greater than maximum (${t.max}).`):e}
        ${i.hasSelectError?o(`Select field requires at least one allowed option.`):e}
        ${i.hasUniqueError?o(`Field “${t.name}” of type “${t.type}” cannot have a unique constraint.`):e}
      </div>
    `}renderRelationPanel(e,t){let n=e=>n=>{n.detail.selectedKey&&this.changeRelation(t,e,n.detail.selectedKey)};return r`
      <div class="panel-section">
        <div class="relation-banner">
          <admin-icon name="info" size="15" color="var(--color-primary-500)"></admin-icon>
          <span>Relational link from <strong>${this.currentMoulName||`this collection`}</strong> to target collection.</span>
        </div>
        <div class="relation-grid">
          <moul-select
            label="Target Collection"
            placeholder="Choose collection"
            selected-key=${e.relationConfig?.targetMoul||this.allMouls[0]?.name||`users`}
            @selectionchange=${n(`targetMoul`)}
          >
            ${this.allMouls.map(e=>r`
                <moul-select-item key=${e.name}>
                  ${e.name} ${e.name===this.currentMoulName?`(Self)`:`(${e.type})`}
                </moul-select-item>
              `)}
          </moul-select>
          <moul-select
            label="Relationship Type"
            placeholder="Choose cardinality"
            selected-key=${e.relationConfig?.cardinality||`1:N`}
            @selectionchange=${n(`cardinality`)}
          >
            <moul-select-item key="1:N">1:N — Single Reference (Many-to-One)</moul-select-item>
            <moul-select-item key="1:1">1:1 — Unique Reference (One-to-One)</moul-select-item>
            <moul-select-item key="M:N">M:N — Multiple References (Many-to-Many)</moul-select-item>
          </moul-select>
          <moul-select
            label="When Target is Deleted"
            placeholder="Choose delete rule"
            selected-key=${e.relationConfig?.onDelete||`SET_NULL`}
            @selectionchange=${n(`onDelete`)}
          >
            <moul-select-item key="SET_NULL">SET_NULL (Clear link, keep record)</moul-select-item>
            <moul-select-item key="CASCADE">CASCADE (Delete record too)</moul-select-item>
            <moul-select-item key="RESTRICT">RESTRICT (Prevent deleting target)</moul-select-item>
          </moul-select>
        </div>
      </div>
    `}renderSelectPanel(t,n){let i=t.options||[];return r`
      <div class="panel-section">
        <moul-tag-group
          label="Allowed Options"
          is-removable
          @remove=${e=>this.removeOption(n,e.detail.key)}
        >
          ${o(i,e=>e,e=>r`<moul-tag key=${e} size="sm" is-removable>${e}</moul-tag>`)}
        </moul-tag-group>
        ${i.length===0?r`<span class="options-empty">No options added yet. Type an option name below and press Add.</span>`:e}
        <div class="add-option">
          <moul-text-field
            aria-label="New option name"
            placeholder="Option name (e.g. published)"
            .value=${this.newOptions[n]||``}
            @input=${e=>this.newOptions={...this.newOptions,[n]:s(e)}}
            @keydown=${e=>{e.key===`Enter`&&(e.preventDefault(),this.addOption(n))}}
          ></moul-text-field>
          <moul-button variant="secondary" @click=${a(()=>this.addOption(n))}>Add</moul-button>
        </div>
      </div>
    `}renderLimitsPanel(t,n,i){let a=i===`text`,o=e=>t=>{let r=t.target.value;this.changeField(n,e,r??void 0)};return r`
      <div class="panel-section">
        <span class="constraint-label">${a?`Character Length Limits (optional):`:`Numeric Range Limits (optional):`}</span>
        <div class="number-row">
          <moul-number-field
            label=${a?`Min Characters`:`Minimum Value`}
            min=${a?0:e}
            .value=${t.min??null}
            @input=${o(`min`)}
          ></moul-number-field>
          <moul-number-field
            label=${a?`Max Characters`:`Maximum Value`}
            min=${a?0:e}
            .value=${t.max??null}
            @input=${o(`max`)}
          ></moul-number-field>
        </div>
      </div>
    `}renderCloakPanel(e,t){return r`
      <div class="panel-section">
        <div class="security-header">
          <admin-icon name="lock-key" size="16" color="var(--color-primary-500)"></admin-icon>
          <span class="security-title">Encrypted Field (Cloak) Security Configuration</span>
        </div>
        <moul-checkbox
          ?is-checked=${!!e.searchable}
          @change=${e=>this.changeField(t,`searchable`,e.detail.isChecked)}
        >
          <span class="security-title" style="font-weight: 500">Enable Searchable Ciphertext (Blind Indexing)</span>
        </moul-checkbox>
        <span class="security-description">
          Enables exact equality queries on encrypted fields using a deterministic blind index HMAC without revealing
          plaintext to the database server.
        </span>
      </div>
    `}renderField(t,n){let i=_(t,n,this.fields,this.collectionType),o=t.type,c=o===`text`||o===`editor`,l=[`relation`,`select`,`number`,`cloak`].includes(o)||c,u=!!this.expanded[n],f=t.name||`field ${n+1}`;return r`
      <div class="field-card ${o===`relation`?`relation`:``} ${i.isInvalid?`invalid`:``}">
        <div class="card-content">
          <div class="top-row">
            <div class="order">
              <span class="order-number">${n+1}</span>
              <div class="order-actions">
                <moul-tooltip content="Move up">
                  <moul-button
                    variant="outline"
                    size="sm"
                    is-icon
                    aria-label=${`Move ${f} up`}
                    ?is-disabled=${n===0}
                    @click=${a(()=>this.moveField(n,-1))}
                  >
                    <admin-icon name="caret-up" size="12"></admin-icon>
                  </moul-button>
                </moul-tooltip>
                <moul-tooltip content="Move down">
                  <moul-button
                    variant="outline"
                    size="sm"
                    is-icon
                    aria-label=${`Move ${f} down`}
                    ?is-disabled=${n===this.fields.length-1}
                    @click=${a(()=>this.moveField(n,1))}
                  >
                    <admin-icon name="caret-down" size="12"></admin-icon>
                  </moul-button>
                </moul-tooltip>
              </div>
            </div>

            <moul-text-field
              class="name ${i.isInvalid?`invalid`:``}"
              aria-label=${`Field ${n+1} name`}
              aria-invalid=${i.isInvalid?`true`:`false`}
              placeholder="fieldName (e.g. authorId)"
              .value=${t.name}
              @input=${e=>this.changeField(n,`name`,s(e))}
            ></moul-text-field>

            <moul-select
              class="type"
              aria-label=${`Field ${n+1} type`}
              placeholder="Select Type"
              selected-key=${o}
              @selectionchange=${e=>{e.detail.selectedKey&&this.changeField(n,`type`,e.detail.selectedKey)}}
            >
              ${d.map(e=>r`
                  <moul-select-item key=${e.id} value=${e.label}>
                    <span class="type-item">
                      <admin-icon name=${e.icon} size="15" color="var(--color-primary-500)"></admin-icon>
                      ${e.label}
                    </span>
                  </moul-select-item>
                `)}
            </moul-select>

            <moul-tooltip content="Remove field">
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Remove field ${f}`} @click=${a(()=>this.removeField(n))}>
                <admin-icon name="trash" size="16" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </moul-tooltip>
          </div>

          <div class="bottom-row">
            <div class="checkboxes">
              <moul-checkbox
                ?is-checked=${!!t.required}
                aria-label=${`Required constraint for ${f}`}
                @change=${e=>this.changeField(n,`required`,e.detail.isChecked)}
              >
                Required
              </moul-checkbox>
              <moul-checkbox
                ?is-checked=${i.isUniqueEligible&&!!t.unique}
                ?is-disabled=${!i.isUniqueEligible}
                title=${i.isUniqueEligible?``:`Unique constraint is not supported for ${o} fields`}
                aria-label=${i.isUniqueEligible?`Unique constraint for ${f}`:`Unique constraint not supported for ${f}`}
                @change=${e=>this.changeField(n,`unique`,e.detail.isChecked)}
              >
                Unique
              </moul-checkbox>
            </div>
            ${l?this.renderOptionsToggle(t,n,u):e}
          </div>

          ${i.isInvalid?this.renderWarnings(t,n,i):e}
        </div>

        ${u&&l?r`
              <div class="panel">
                ${o===`relation`?this.renderRelationPanel(t,n):e}
                ${o===`select`?this.renderSelectPanel(t,n):e}
                ${c?this.renderLimitsPanel(t,n,`text`):e}
                ${o===`number`?this.renderLimitsPanel(t,n,`number`):e}
                ${o===`cloak`?this.renderCloakPanel(t,n):e}
              </div>
            `:e}
      </div>
    `}render(){return r`
      <div class="header">
        <div class="title-group">
          <h3>
            <admin-icon name="sliders" size="16" color="var(--color-primary-500)"></admin-icon>
            Schema Fields
          </h3>
          <span class="subtitle">Define custom columns, data types, and relationships.</span>
        </div>
        <moul-button variant="primary" @click=${a(()=>this.addField())}>
          <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
          Add Field
        </moul-button>
      </div>

      ${this.renderSystemFields()}
      ${this.fields.length===0?r`
            <moul-empty-state variant="bordered" size="sm">
              <span slot="title">No custom fields</span>
              <span slot="description">Click '+ Add Field' to start defining custom columns.</span>
            </moul-empty-state>
          `:r`<div class="field-list">${this.fields.map((e,t)=>this.renderField(e,t))}</div>`}
    `}};customElements.define(`admin-fields-builder`,v);var y=[{title:`Public Access`,desc:`Anyone can query or execute without logging in. Leave rule empty.`,code:``,badge:`Public`},{title:`Signed-In Users Only`,desc:`Requires a valid login token from any registered user.`,code:`@request.auth.id != ""`,badge:`Authenticated`,tone:`primary`},{title:`Author / Owner Only`,desc:`Only the user who owns the record can view, edit, or delete it.`,code:`userId = @request.auth.id`,badge:`Ownership`,tone:`success`},{title:`User Profile Self-Access`,desc:`For users collections, allows users to view or update only their own profile.`,code:`id = @request.auth.id`,badge:`Self Profile`,tone:`success`},{title:`Administrators Only`,desc:`Restricts access exclusively to users with role="admin".`,code:`@request.auth.role = "admin"`,badge:`Admins Only`,tone:`warning`},{title:`Published or Creator`,desc:`Visitors can view published items, while creators can view/edit their own drafts.`,code:`status = "published" || authorId = @request.auth.id`,badge:`Visibility`,tone:`primary`},{title:`Cross-Table Role Lookup`,desc:`Checks whether the requesting user has permission in another table.`,code:`@collection.userRoles.userId = @request.auth.id && @collection.userRoles.role = "admin"`,badge:`Relational Join`,tone:`warning`}],b=[[`@request.auth.id`,`ID of current logged-in user`,`@request.auth.id != ""`],[`@request.auth.email`,`Email of logged-in user`,`@request.auth.email ~ "@company.com"`],[`@request.auth.role`,`Role field of the logged-in user`,`@request.auth.role = "admin"`],[`@request.body.<field>`,`Incoming request body value during create or update`,`@request.body.status = "draft"`],[`@request.headers.<name>`,`HTTP request header`,`@request.headers.x_api_version = "v1"`],[`@request.query.<name>`,`URL query parameter`,`@request.query.preview = "true"`]],x=[[`=, !=, >, <, >=, <=`,`Standard equality and comparison`,`price >= 10`],[`~, !~`,`Text contains or does not contain`,`title ~ "announcement"`],[`&&, ||, !`,`AND, OR, NOT logical operators`,`status = "active" && !archived`],[`?=`,`Array contains element`,`tags ?= "featured"`],[`@collection.<table>.<field>`,`Look up relation in another table`,`@collection.members.userId = @request.auth.id`],[`geoDistance(lon1, lat1, lon2, lat2)`,`Calculates geographical distance (km)`,`geoDistance(lon, lat, 104.9, 11.5) < 50`]],S=class extends i{static styles=[n,t`
      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--color-fg);
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-5);
        max-height: 68vh;
        overflow-y: auto;
        padding-right: var(--spacing-1);
        color: var(--color-fg);
      }

      .intro {
        margin: 0;
        font-size: var(--font-size-sm);
        line-height: 1.5;
        color: var(--color-fg-subtle);
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .presets {
        display: grid;
        gap: var(--spacing-2);
      }

      .preset {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-elevated);
      }

      .preset-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .preset-title-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .preset-title {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .preset-desc {
        font-size: var(--font-size-xs);
        line-height: 1.4;
        color: var(--color-fg-subtle);
      }

      .preset-code {
        align-self: flex-start;
        margin-top: var(--spacing-1);
        padding: 2px var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-500);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        word-break: break-all;
      }

      .table-wrapper {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        overflow: hidden;
        background-color: var(--color-bg-elevated);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--font-size-xs);
      }

      th {
        padding: var(--spacing-2);
        background-color: var(--color-bg-subtle);
        color: var(--color-fg-subtle);
        font-weight: 600;
        text-align: left;
        border-bottom: 1px solid var(--color-border);
      }

      td {
        padding: var(--spacing-2);
        border-bottom: 1px solid var(--color-border-subtle);
        vertical-align: middle;
      }

      code {
        font-family: var(--font-mono);
      }

      .code-tag {
        padding: 2px var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-500);
        font-size: 0.75rem;
        font-weight: 600;
      }
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},copiedCode:{state:!0}};copiedTimer;constructor(){super(),this.isOpen=!1,this.copiedCode=null}close(){this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}async copy(e,t){try{await navigator.clipboard.writeText(e)}catch{h.error(`Copy Failed`,`The browser blocked clipboard access.`);return}this.copiedCode=e,h.success(`Rule Copied`,`Rule for "${t}" copied to clipboard.`),window.clearTimeout(this.copiedTimer),this.copiedTimer=window.setTimeout(()=>this.copiedCode=null,2e3)}renderTable(e,t){return r`
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>${e}</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(([e,t,n])=>r`
                <tr>
                  <td><code class="code-tag">${e}</code></td>
                  <td>${t}</td>
                  <td><code>${n}</code></td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `}render(){return r`
      <moul-modal
        size="lg"
        ?is-open=${this.isOpen}
        @openchange=${e=>{e.stopPropagation(),e.detail.isOpen||this.close()}}
      >
        <h2 slot="header">
          <admin-icon name="book-open" size="20" color="var(--color-primary-500)"></admin-icon>
          Access Rules Reference
        </h2>

        <div class="content">
          <p class="intro">
            Rules control who can access records. Leave a rule empty for public access, or use expressions to
            restrict it.
          </p>

          <div class="section">
            <h3>
              <admin-icon name="sparkle" size="16" color="var(--color-primary-500)"></admin-icon>
              Popular Setups
            </h3>
            <div class="presets">
              ${y.map(e=>{let t=this.copiedCode===e.code;return r`
                  <div class="preset">
                    <div class="preset-info">
                      <div class="preset-title-row">
                        <span class="preset-title">${e.title}</span>
                        ${e.tone?r`<moul-badge tone=${e.tone} size="sm">${e.badge}</moul-badge>`:r`<moul-badge variant="bordered" size="sm">${e.badge}</moul-badge>`}
                      </div>
                      <span class="preset-desc">${e.desc}</span>
                      <code class="preset-code">${e.code||`<Empty — Public Access>`}</code>
                    </div>
                    <moul-button
                      variant="outline"
                      aria-label=${`Copy rule: ${e.title}`}
                      @click=${a(()=>this.copy(e.code,e.title))}
                    >
                      <admin-icon slot="prefix" name=${t?`check`:`copy`} size="16"></admin-icon>
                      ${t?`Copied`:`Copy`}
                    </moul-button>
                  </div>
                `})}
            </div>
          </div>

          <div class="section">
            <h3>
              <admin-icon name="lock-key" size="16" color="var(--color-primary-500)"></admin-icon>
              User & Request Variables
            </h3>
            ${this.renderTable(`Variable`,b)}
          </div>

          <div class="section">
            <h3>
              <admin-icon name="code" size="16" color="var(--color-primary-500)"></admin-icon>
              Operators & Functions
            </h3>
            ${this.renderTable(`Syntax`,x)}
          </div>
        </div>

        <moul-button slot="footer" variant="primary" @click=${a(()=>this.close())}>Close</moul-button>
      </moul-modal>
    `}};customElements.define(`admin-rule-docs-modal`,S);var C={listRule:``,viewRule:``,createRule:``,updateRule:``,deleteRule:``},w=`@request.auth.id != ""`,T=`id = @request.auth.id`,E=`userId = @request.auth.id`,D=`@request.auth.role = "admin"`,O=e=>({listRule:e,viewRule:e,createRule:e,updateRule:e,deleteRule:e});function k(e,t){switch(e){case`public`:return O(``);case`auth`:return O(w);case`owner`:return t?{listRule:T,viewRule:T,createRule:``,updateRule:T,deleteRule:T}:{listRule:``,viewRule:``,createRule:w,updateRule:E,deleteRule:E};case`admin`:return O(D)}}var A=[{key:`listRule`,label:`List Records`,placeholder:e=>e?T:`e.g. status = 'published'`,description:e=>e?`Default: ${T}`:`Leave blank for public access.`},{key:`viewRule`,label:`View Record`,placeholder:()=>T,description:e=>e?`Default: ${T}`:`Leave blank for public access.`},{key:`createRule`,label:`Create Record`,placeholder:e=>e?`Leave blank for public sign-ups`:`e.g. @request.auth.id != ''`,description:e=>e?`Leave blank for public sign-ups.`:`Leave blank for public creation.`},{key:`updateRule`,label:`Update Record`,placeholder:e=>e?T:`e.g. ${E}`,description:e=>e?`Default: ${T}`:`Leave blank for public editing.`},{key:`deleteRule`,label:`Delete Record`,placeholder:e=>e?T:`e.g. ${E}`,description:e=>e?`Default: ${T}`:`Leave blank for public deletion.`}],j=class extends i{static styles=[n,t`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        width: 100%;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .title-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-fg);
      }

      .subtitle {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .presets,
      .rules {
        display: flex;
        gap: var(--spacing-2);
      }

      .presets {
        align-items: center;
        flex-wrap: wrap;
      }

      .rules {
        flex-direction: column;
        gap: var(--spacing-3);
      }
    `];static properties={rules:{attribute:!1},isAuthCollection:{type:Boolean,attribute:`is-auth-collection`},isDocsOpen:{state:!0}};constructor(){super(),this.rules={...C},this.isAuthCollection=!1,this.isDocsOpen=!1}emit(e){this.dispatchEvent(new CustomEvent(`ruleschange`,{detail:{rules:e}}))}render(){let e=this.isAuthCollection,t=t=>a(()=>this.emit(k(t,e)));return r`
      <div class="header">
        <div class="title-group">
          <h3>
            <admin-icon name="lock-key" size="16" color="var(--color-primary-500)"></admin-icon>
            Access Rules
          </h3>
          <span class="subtitle">Leave blank for public access.</span>
        </div>
        <moul-button variant="outline" @click=${a(()=>this.isDocsOpen=!0)}>
          <admin-icon slot="prefix" name="book-open" size="16"></admin-icon>
          Examples
        </moul-button>
      </div>

      <div class="presets">
        <moul-button variant="outline" @click=${t(`public`)}>Public</moul-button>
        <moul-button variant="outline" @click=${t(`auth`)}>Authenticated</moul-button>
        <moul-button variant="outline" @click=${t(`owner`)}>${e?`Owner (Self)`:`Owner Only`}</moul-button>
        <moul-button variant="outline" @click=${t(`admin`)}>Admin Only</moul-button>
      </div>

      <div class="rules">
        ${A.map(t=>r`
            <moul-text-field
              label=${t.label}
              placeholder=${t.placeholder(e)}
              description=${t.description(e)}
              .value=${this.rules[t.key]||``}
              @input=${e=>this.emit({...this.rules,[t.key]:s(e)})}
            ></moul-text-field>
          `)}
      </div>

      <admin-rule-docs-modal
        ?is-open=${this.isDocsOpen}
        @openchange=${e=>this.isDocsOpen=e.detail.isOpen}
      ></admin-rule-docs-modal>
    `}};customElements.define(`admin-rules-editor`,j);export{g as n,C as t};