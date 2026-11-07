import{a as e,c as t,i as n,n as r,o as i,r as a,t as o}from"./press-BQyLhwVv.js";import{d as s,l as c,r as l,u}from"./query-DEj2kaNm.js";import{t as d}from"./client-DaTS5Mxb.js";import{i as ee,t as f}from"./router-B1wwybcr.js";import{n as p,t as m}from"./live-query-DDtzER30.js";import{F as h,Jt as g,a as _,c as v,i as y,l as b,o as x,r as S,s as C}from"./index-DeN0Cdry.js";import{n as w,r as T}from"./repeat-Utyd6s0W.js";import"./data-table-kOkcDszi.js";import{n as E}from"./page-ITe5xmEa.js";import{n as te,t as D}from"./forms-ChSyHPkg.js";import{i as ne,n as re,r as ie,t as O}from"./fieldValidation-D0RWDzzJ.js";import{t as k}from"./toast-CRunUHSe.js";import{a as A,c as j,i as M,n as N,o as P,r as F,s as I,t as L}from"./record-helpers-BhvqQe0T.js";var R=[{key:`json`,icon:`file-code`,label:`JSON`,description:`Structured JSON format. Ideal for migrations, backups, and nested relations.`},{key:`csv`,icon:`file-csv`,label:`CSV`,description:`RFC 4180 spreadsheet format. Ideal for Excel, Google Sheets, or data analysts.`}],z=class extends a{static styles=[r,t`
      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 700;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-block: var(--spacing-2);
        color: var(--color-fg);
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .section-label {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .formats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-3);
      }

      .format {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .format:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .format[aria-pressed='true'] {
        border-color: var(--color-primary-500);
        background-color: var(--color-bg-subtle);
      }

      .format-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .format-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .format-description {
        font-size: var(--font-size-xs);
        line-height: 1.4;
        color: var(--color-fg-subtle);
      }

      .scope {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .scope label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--font-size-sm);
        cursor: pointer;
      }

      .scope input {
        accent-color: var(--color-primary-500);
      }
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},moulName:{type:String,attribute:`moul-name`},activeFilter:{type:String,attribute:`active-filter`},activeSearch:{type:String,attribute:`active-search`},totalRecords:{type:Number,attribute:`total-records`},format:{state:!0},scope:{state:!0},includeSchema:{state:!0},isExporting:{state:!0}};constructor(){super(),this.isOpen=!1,this.moulName=``,this.activeFilter=``,this.activeSearch=``,this.totalRecords=0,this.format=`json`,this.scope=`all`,this.includeSchema=!1,this.isExporting=!1}get hasActiveFilters(){return!!(this.activeFilter.trim()||this.activeSearch.trim())}willUpdate(e){e.has(`isOpen`)&&this.isOpen&&(this.scope=this.hasActiveFilters?`filtered`:`all`)}close(){this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}async export(){this.isExporting=!0;try{await d.exportRecords(this.moulName,{format:this.format,includeSchema:this.format===`json`&&this.includeSchema,filter:this.scope===`filtered`?this.activeFilter:void 0}),k.success(`Export Successful`,`Exported ${this.moulName} records as ${this.format.toUpperCase()}.`),this.close()}catch(e){k.error(`Export Failed`,e.message||`Failed to download exported records.`)}finally{this.isExporting=!1}}render(){return i`
      <moul-modal
        size="md"
        aria-label=${`Export ${this.moulName} records`}
        ?is-open=${this.isOpen}
        @openchange=${e=>{e.stopPropagation(),e.detail.isOpen||this.close()}}
      >
        <h2 slot="header">
          <admin-icon name="download-simple" size="20" color="var(--color-primary-500)"></admin-icon>
          Export Records - ${this.moulName}
        </h2>

        <div class="content">
          <div class="section">
            <span class="section-label">Export Format</span>
            <div class="formats">
              ${R.map(e=>i`
                  <button type="button" class="format" aria-pressed=${String(this.format===e.key)} @click=${()=>this.format=e.key}>
                    <span class="format-header">
                      <span class="format-title">
                        <admin-icon name=${e.icon} size="18" color="var(--color-primary-500)"></admin-icon>
                        ${e.label}
                      </span>
                      ${this.format===e.key?i`<moul-badge tone="primary" size="sm">Selected</moul-badge>`:n}
                    </span>
                    <span class="format-description">${e.description}</span>
                  </button>
                `)}
            </div>
          </div>

          <div class="section">
            <span class="section-label">Export Scope</span>
            <div class="scope">
              <label>
                <input type="radio" name="scope" .checked=${this.scope===`all`} @change=${()=>this.scope=`all`} />
                <admin-icon name="database" size="16"></admin-icon>
                All Records (${this.totalRecords} records in collection)
              </label>
              ${this.hasActiveFilters?i`
                    <label>
                      <input type="radio" name="scope" .checked=${this.scope===`filtered`} @change=${()=>this.scope=`filtered`} />
                      <admin-icon name="funnel" size="16"></admin-icon>
                      Active Filtered Subset
                    </label>
                  `:n}
            </div>
          </div>

          ${this.format===`json`?i`
                <div class="section">
                  <span class="section-label">Advanced Options</span>
                  <moul-checkbox
                    ?is-checked=${this.includeSchema}
                    @change=${e=>this.includeSchema=e.detail.isChecked}
                  >
                    Include collection schema definition in export envelope
                  </moul-checkbox>
                </div>
              `:n}
        </div>

        <moul-button slot="footer" variant="outline" ?is-disabled=${this.isExporting} @click=${o(()=>this.close())}>
          Cancel
        </moul-button>
        <moul-button slot="footer" variant="primary" ?is-pending=${this.isExporting} @click=${o(()=>this.export())}>
          ${this.isExporting?n:i`<admin-icon slot="prefix" name="download-simple" size="16"></admin-icon>`}
          ${this.isExporting?`Exporting...`:`Download ${this.format.toUpperCase()}`}
        </moul-button>
      </moul-modal>
    `}};customElements.define(`admin-export-modal`,z);var B=e=>/\.(csv|json)$/i.test(e.name),V=class extends a{static styles=[r,t`
      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 700;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-block: var(--spacing-2);
        color: var(--color-fg);
      }

      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-3);
        width: 100%;
        padding: var(--spacing-6);
        border-radius: var(--radius-lg);
        border: 2px dashed var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dropzone:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .dropzone.drag-over {
        border-color: var(--color-primary-500);
        background-color: var(--color-bg-subtle);
      }

      .dropzone-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-500);
      }

      .dropzone-title,
      .file-name {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .dropzone-sub,
      .file-size {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .file {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
      }

      .file-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .options,
      .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-3);
      }

      .stats {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-2);
      }

      /* Let the selects shrink to their column instead of overflowing the dialog */
      .options > * {
        min-width: 0;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .stat-value {
        font-size: var(--font-size-xl);
        font-weight: 700;
      }

      .stat-label {
        margin-top: 2px;
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .errors-title {
        display: block;
        margin-bottom: 6px;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .errors {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        max-height: 180px;
        overflow-y: auto;
        padding: var(--spacing-2);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
      }

      .error {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        color: var(--color-error-500);
      }
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},moulName:{type:String,attribute:`moul-name`},file:{state:!0},mode:{state:!0},errorMode:{state:!0},isUploading:{state:!0},result:{state:!0},isDragOver:{state:!0}};constructor(){super(),this.isOpen=!1,this.moulName=``,this.file=null,this.mode=`upsert`,this.errorMode=`atomic`,this.isUploading=!1,this.result=null,this.isDragOver=!1}reset(){this.file=null,this.result=null,this.isUploading=!1}close(){this.reset(),this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}pickFile(e){e&&(B(e)?(this.file=e,this.result=null):k.error(`Invalid File`,`Only .csv and .json files are supported for import.`))}onDrop(e){e.preventDefault(),this.isDragOver=!1,this.pickFile(e.dataTransfer?.files?.[0])}async runImport(){if(this.file){this.isUploading=!0;try{let e=await d.importRecords(this.moulName,this.file,{mode:this.mode,onError:this.errorMode});this.result=e,k.success(`Import Finished`,`Imported ${e.total} records into ${this.moulName}.`),this.dispatchEvent(new CustomEvent(`imported`,{detail:e}))}catch(e){k.error(`Import Failed`,e.message||`Failed to import records.`)}finally{this.isUploading=!1}}}renderResult(e){let t=e.errors??[],r=(e,t,n=`var(--color-fg)`)=>i`
      <div class="stat">
        <span class="stat-value" style="color: ${n}">${e}</span>
        <span class="stat-label">${t}</span>
      </div>
    `;return i`
      <moul-alert
        tone=${t.length>0?`warning`:`success`}
        description=${t.length>0?`Import partially completed with ${t.length} error(s).`:`Records imported and synchronized successfully!`}
      ></moul-alert>
      <div class="stats">
        ${r(e.total,`Total`)} ${r(e.inserted,`Inserted`,`var(--color-success-500)`)}
        ${r(e.updated,`Updated`,`var(--color-primary-500)`)} ${r(e.skipped,`Skipped`,`var(--color-fg-subtle)`)}
      </div>
      ${t.length>0?i`
            <div>
              <span class="errors-title">Row Errors (${t.length}):</span>
              <div class="errors">
                ${t.map(e=>i`
                    <div class="error">
                      <admin-icon name="warning-circle" size="14"></admin-icon>
                      <span>Row ${e.row}: ${e.message}</span>
                    </div>
                  `)}
              </div>
            </div>
          `:n}
    `}renderForm(){let e=this.file,t=e?.name.toLowerCase().endsWith(`.csv`);return i`
      <input
        id="file-input"
        type="file"
        accept=".csv,.json"
        hidden
        @change=${e=>{let t=e.target;this.pickFile(t.files?.[0]),t.value=``}}
      />
      ${e?i`
            <div class="file">
              <div class="file-info">
                <admin-icon name=${t?`file-csv`:`file-code`} size="28" color="var(--color-primary-500)"></admin-icon>
                <div class="file-meta">
                  <span class="file-name">${e.name}</span>
                  <span class="file-size">${F(e.size)||`0 B`} • ${t?`CSV`:`JSON`}</span>
                </div>
              </div>
              <moul-button
                variant="ghost"
                is-icon
                aria-label="Remove selected file"
                ?is-disabled=${this.isUploading}
                @click=${o(()=>this.file=null)}
              >
                <admin-icon name="x" size="16"></admin-icon>
              </moul-button>
            </div>
          `:i`
            <button
              type="button"
              class="dropzone ${this.isDragOver?`drag-over`:``}"
              @click=${()=>this.renderRoot.querySelector(`#file-input`)?.click()}
              @dragover=${e=>{e.preventDefault(),this.isDragOver=!0}}
              @dragleave=${()=>this.isDragOver=!1}
              @drop=${this.onDrop}
            >
              <span class="dropzone-icon"><admin-icon name="upload-simple" size="24"></admin-icon></span>
              <span>
                <span class="dropzone-title">Click to browse or drag & drop file</span>
                <span class="dropzone-sub" style="display: block">Supports CSV (comma-delimited) or JSON records array</span>
              </span>
            </button>
          `}

      <div class="options">
        <moul-select
          label="Conflict Mode"
          selected-key=${this.mode}
          ?is-disabled=${this.isUploading}
          @selectionchange=${e=>{e.detail.selectedKey&&(this.mode=e.detail.selectedKey)}}
        >
          <moul-select-item key="upsert">Upsert (Insert new, update by ID)</moul-select-item>
          <moul-select-item key="insert">Insert Only (Fail on duplicate ID)</moul-select-item>
          <moul-select-item key="replace">Replace (Truncate collection first)</moul-select-item>
        </moul-select>
        <moul-select
          label="Error Handling"
          selected-key=${this.errorMode}
          ?is-disabled=${this.isUploading}
          @selectionchange=${e=>{e.detail.selectedKey&&(this.errorMode=e.detail.selectedKey)}}
        >
          <moul-select-item key="atomic">Atomic (Rollback entire batch)</moul-select-item>
          <moul-select-item key="continue">Continue (Skip invalid rows)</moul-select-item>
        </moul-select>
      </div>
    `}render(){let e=this.result;return i`
      <moul-modal
        size="lg"
        aria-label=${`Import records into ${this.moulName}`}
        ?is-open=${this.isOpen}
        ?is-dismissable=${!this.isUploading}
        @openchange=${e=>{e.stopPropagation(),e.detail.isOpen||this.close()}}
      >
        <h2 slot="header">
          <admin-icon name="upload-simple" size="20" color="var(--color-primary-500)"></admin-icon>
          Import Records - ${this.moulName}
        </h2>

        <div class="content">${e?this.renderResult(e):this.renderForm()}</div>

        ${e?i`
              <moul-button slot="footer" variant="outline" @click=${o(()=>this.reset())}>
                <admin-icon slot="prefix" name="arrows-clockwise" size="16"></admin-icon>
                Import Another File
              </moul-button>
              <moul-button slot="footer" variant="primary" @click=${o(()=>this.close())}>Done</moul-button>
            `:i`
              <moul-button slot="footer" variant="outline" ?is-disabled=${this.isUploading} @click=${o(()=>this.close())}>
                Cancel
              </moul-button>
              <moul-button
                slot="footer"
                variant="primary"
                ?is-disabled=${!this.file}
                ?is-pending=${this.isUploading}
                @click=${o(()=>this.runImport())}
              >
                ${this.isUploading?n:i`<admin-icon slot="prefix" name="upload-simple" size="16"></admin-icon>`}
                ${this.isUploading?`Importing records...`:`Execute Import`}
              </moul-button>
            `}
      </moul-modal>
    `}};customElements.define(`admin-import-modal`,V);var H=class extends a{static styles=[r,t`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        font-family: var(--font-family-base);
        color: var(--color-fg);
      }

      .label {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .required {
        color: var(--color-error-500);
      }

      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        width: 100%;
        padding: var(--spacing-4);
        border-radius: var(--radius-md);
        border: 1px dashed var(--color-border);
        background-color: var(--color-bg-subtle);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .dropzone:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .dropzone.dragging {
        border-color: var(--color-primary-500);
        background-color: var(--color-bg-elevated);
      }

      .dropzone.invalid {
        border-color: var(--color-error-500);
        background-color: color-mix(in oklab, var(--color-error-500) 5%, transparent);
      }

      .dropzone-text {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .browse {
        color: var(--color-primary-500);
        font-weight: 500;
      }

      .uploading {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2);
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }

      .attached {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-3);
        padding: var(--spacing-2);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .attached-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        min-width: 0;
        flex: 1;
      }

      .thumb,
      .icon-box {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
      }

      .thumb {
        object-fit: cover;
      }

      .icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-bg-subtle);
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .error {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        font-size: var(--font-size-xs);
        color: var(--color-error-500);
      }
    `];static properties={label:{type:String},required:{type:Boolean},value:{attribute:!1},errorMessage:{type:String,attribute:`error-message`},isUploading:{state:!0},isDragging:{state:!0}};constructor(){super(),this.label=``,this.required=!1,this.value=null,this.errorMessage=``,this.isUploading=!1,this.isDragging=!1}emit(e){this.dispatchEvent(new CustomEvent(`valuechange`,{detail:{value:e}}))}browse(){this.isUploading||this.renderRoot.querySelector(`input[type=file]`)?.click()}async upload(e){this.isUploading=!0;try{let t=await d.uploadFile(e);Array.isArray(t)&&t.length>0?this.emit(t[0]):t&&typeof t==`object`&&this.emit(t),k.success(`File Uploaded`,`${e.name} uploaded successfully.`)}catch(e){k.error(`Upload Failed`,e.message||`Failed to upload file.`)}finally{this.isUploading=!1}}renderAttached(){let e=this.value,t=A(e),r=M(e),a=typeof e==`object`&&e?.size?F(e.size):``,s=typeof e==`object`?e?.createdAt||e?.created_at:void 0;return i`
      <div class="attached">
        <div class="attached-left">
          ${I(e)&&t?i`<img class="thumb" src=${t} alt=${r} />`:i`<span class="icon-box"><admin-icon name="file" size="22" color="var(--color-primary-500)"></admin-icon></span>`}
          <div class="info">
            <span class="name" title=${r}>${r}</span>
            <div class="meta">
              ${a?i`<span>${a}</span>`:n}
              ${s?i`<span>${new Date(s).toLocaleDateString()}</span>`:n}
            </div>
          </div>
        </div>
        <div class="actions">
          ${t?i`
                <moul-button variant="ghost" is-icon aria-label="View file" @click=${o(()=>window.open(t,`_blank`,`noopener`))}>
                  <admin-icon name="arrow-square-out" size="14"></admin-icon>
                </moul-button>
              `:n}
          <moul-button variant="outline" aria-label="Replace file" ?is-disabled=${this.isUploading} @click=${o(()=>this.browse())}>
            <admin-icon slot="prefix" name="upload-simple" size="14"></admin-icon>
            Replace
          </moul-button>
          <moul-button variant="ghost" is-icon aria-label="Remove file" ?is-disabled=${this.isUploading} @click=${o(()=>this.emit(null))}>
            <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
          </moul-button>
        </div>
      </div>
    `}renderDropzone(){let e=!!this.errorMessage;return i`
      <button
        type="button"
        class="dropzone ${this.isDragging?`dragging`:``} ${e?`invalid`:``}"
        aria-label=${`Upload ${this.label}`}
        @click=${()=>this.browse()}
        @dragover=${e=>{e.preventDefault(),this.isDragging=!0}}
        @dragleave=${e=>{e.preventDefault(),this.isDragging=!1}}
        @drop=${e=>{e.preventDefault(),this.isDragging=!1;let t=e.dataTransfer?.files?.[0];t&&this.upload(t)}}
      >
        ${this.isUploading?i`
              <span class="uploading">
                <moul-spinner size="sm"></moul-spinner>
                Uploading file to storage...
              </span>
            `:i`
              <admin-icon name="cloud-arrow-up" size="28" color=${e?`var(--color-error-500)`:`var(--color-primary-500)`}></admin-icon>
              <span class="dropzone-text">Drag & drop a file here, or <span class="browse">browse</span></span>
            `}
      </button>
    `}render(){return i`
      <span class="label">${this.label}${this.required?i`<span class="required">*</span>`:n}</span>
      <input
        type="file"
        hidden
        @change=${e=>{let t=e.target,n=t.files?.[0];n&&this.upload(n),t.value=``}}
      />
      ${this.value?this.renderAttached():this.renderDropzone()}
      ${this.errorMessage?i`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`:n}
    `}};customElements.define(`admin-file-field`,H);var U=c(class extends u{constructor(e){if(super(e),e.type!==s.PROPERTY&&e.type!==s.ATTRIBUTE&&e.type!==s.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!T(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(t,[r]){if(r===e||r===n)return r;let i=t.element,a=t.name;if(t.type===s.PROPERTY){if(r===i[a])return e}else if(t.type===s.BOOLEAN_ATTRIBUTE){if(!!r===i.hasAttribute(a))return e}else if(t.type===s.ATTRIBUTE&&i.getAttribute(a)===r+``)return e;return w(t),r}}),W=`__none__`,G=class extends a{static styles=[r,t`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        font-family: var(--font-family-base);
        color: var(--color-fg);
      }

      .label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .required {
        color: var(--color-error-500);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-1);
        min-height: 36px;
        padding: 6px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
      }

      .chips-empty {
        padding: 2px 4px;
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-primary-500);
        background-color: var(--color-bg-elevated);
        font-size: var(--font-size-xs);
      }

      .chip button {
        margin-left: 2px;
        padding: 0;
        border: none;
        background: none;
        color: var(--color-fg-subtle);
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
      }

      .error {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        font-size: var(--font-size-xs);
        color: var(--color-error-500);
      }
    `];static properties={label:{type:String},required:{type:Boolean},relationConfig:{attribute:!1},value:{attribute:!1},errorMessage:{type:String,attribute:`error-message`}};targets=new m(this,e=>{let t=this.relationConfig?.targetMoul;return t?e.from({record:x(t,{perPage:100})}):void 0},()=>[this.relationConfig?.targetMoul]);constructor(){super(),this.label=``,this.required=!1,this.relationConfig=void 0,this.value=null,this.errorMessage=``}emit(e){this.dispatchEvent(new CustomEvent(`valuechange`,{detail:{value:e}}))}get targetRecords(){return this.targets.data}renderLabel(e,t){return i`
      <span class="label">
        <admin-icon name="link" size="14" color="var(--color-primary-500)"></admin-icon>
        ${this.label}
        <moul-badge tone="primary" size="sm">${e} ➔ ${t}</moul-badge>
        ${this.required?i`<span class="required">*</span>`:n}
      </span>
    `}renderMany(e){let t=Array.isArray(this.value)?this.value.map(String):this.value?[String(this.value)]:[],r=this.targetRecords,a=e=>this.emit(t.filter(t=>t!==e));return i`
      ${this.renderLabel(`M:N`,e)}
      <div class="chips">
        ${t.length===0?i`<span class="chips-empty">No records selected. Select records from the dropdown below to link.</span>`:t.map(e=>{let t=r.find(t=>String(t.id)===e),n=t?P(t):e;return i`
                <span class="chip">
                  <admin-icon name="link" size="12" color="var(--color-primary-500)"></admin-icon>
                  ${n}
                  <button type="button" aria-label=${`Remove ${n}`} @click=${()=>a(e)}>×</button>
                </span>
              `})}
      </div>
      <!-- Always shows the placeholder: picking a record adds it to the chips above. -->
      <moul-select
        aria-label=${`Add ${this.label} record`}
        placeholder=${this.targets.isLoading?`Loading records...`:`Select record to add to ${this.label}...`}
        .selectedKey=${U(``)}
        @selectionchange=${e=>{let n=e.detail.selectedKey;n&&!t.includes(n)&&this.emit([...t,n])}}
      >
        ${r.filter(e=>!t.includes(String(e.id))).map(e=>i`<moul-select-item key=${String(e.id)}>${P(e)} (${e.id})</moul-select-item>`)}
      </moul-select>
      ${this.errorMessage?i`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`:n}
    `}render(){let e=this.relationConfig?.targetMoul||``,t=this.relationConfig?.cardinality||`1:N`;if(t===`M:N`)return this.renderMany(e);let r=this.value?String(this.value):``;return i`
      ${this.renderLabel(t,e)}
      <moul-select
        aria-label=${`${this.label} (${t} ➔ ${e})`}
        placeholder=${this.targets.isLoading?`Loading target records...`:`Select ${e} record...`}
        ?is-required=${this.required}
        .selectedKey=${U(r)}
        @selectionchange=${e=>{let t=e.detail.selectedKey;this.emit(!t||t===W?``:t)}}
      >
        <moul-select-item key=${W}><em>(None / Clear)</em></moul-select-item>
        ${this.targetRecords.map(e=>i`<moul-select-item key=${String(e.id)}>${P(e)} (${e.id})</moul-select-item>`)}
      </moul-select>
      ${this.errorMessage?i`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`:n}
    `}};customElements.define(`admin-relation-field`,G);var K=new Set([`username`,`email`,`password`,`passwordConfirm`]),q={date:`date`,datetime:`datetime-local`,url:`url`,email:`email`,cloak:`password`};function J(e){switch(e.type){case`cloak`:return`Encrypted at rest with AES-256-GCM`;case`text`:case`editor`:return e.min!==void 0||e.max!==void 0?`Length: ${e.min??0}..${e.max??`∞`} characters`:``;case`url`:return`Must start with http:// or https://`;case`date`:return`Date in YYYY-MM-DD format`;case`datetime`:return`Local or ISO 8601 date & time`;default:return``}}var Y=e=>typeof e==`object`&&e?JSON.stringify(e,null,2):String(e??``);function X(e){try{return JSON.parse(e)}catch{return e}}var ae=class extends a{static styles=[r,t`
      .title {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        font-size: 1rem;
        font-weight: 600;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        width: 100%;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-inline: var(--spacing-1);
        color: var(--color-fg);
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        padding-block: var(--spacing-2) var(--spacing-1);
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .inspector {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .inspector-header,
      .row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .inspector-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .inline {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      .worker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: var(--spacing-2);
      }

      .worker-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
      }

      .stat-label {
        font-size: var(--font-size-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-fg-subtle);
      }

      .stat-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .error-trace {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-alert-border-error);
        background-color: var(--color-alert-bg-error);
      }

      .error-trace-title {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-error-500);
      }

      pre {
        margin: 0;
        padding: var(--spacing-2);
        overflow-y: auto;
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .error-trace pre {
        max-height: 160px;
        background-color: var(--color-bg-subtle);
        color: var(--color-error-500);
      }

      .json {
        max-height: 180px;
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .payload-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .hint {
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
      }

      .metadata {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
      }

      .metadata-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
      }

      .metadata-row span:last-child {
        color: var(--color-fg);
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},moulName:{type:String,attribute:`moul-name`},moul:{attribute:!1},fields:{attribute:!1},record:{attribute:!1},records:{attribute:!1},active:{state:!0},formData:{state:!0},formErrors:{state:!0},touched:{state:!0},copied:{state:!0},showRawJson:{state:!0}};copiedTimer;saving=new p(this);retrying=new p(this);discarding=new p(this);constructor(){super(),this.isOpen=!1,this.moulName=``,this.moul=null,this.fields=[],this.record=null,this.records=void 0,this.active=null,this.formData={},this.formErrors={},this.touched={},this.copied=null,this.showRawJson=!1}get isCreating(){return this.active===null}willUpdate(e){(e.has(`isOpen`)&&this.isOpen||e.has(`record`)&&this.isOpen)&&(this.active=this.record?b(this.record):null,this.formData=this.active?{...this.active}:{},this.formErrors={},this.touched={},this.showRawJson=!1)}patchActive(e,t){this.active?.id===e&&(this.active={...this.active,...t},this.formData={...this.active})}close(){this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}async copy(e,t){await L(t)?(this.copied=e,window.clearTimeout(this.copiedTimer),this.copiedTimer=window.setTimeout(()=>this.copied=null,2e3)):k.error(`Copy Failed`,`The browser blocked clipboard access.`)}setError(e,t){let n={...this.formErrors};t?n[e]=t:delete n[e],this.formErrors=n}validateField(e,t,n){if(this.moul?.type===`auth`&&K.has(e)){let t=re(n,this.isCreating);this.setError(e,t[e]),e===`password`&&this.touched.passwordConfirm&&this.setError(`passwordConfirm`,t.passwordConfirm);return}let r=(this.moul?.fields||[]).find(t=>t.name===e);r&&this.setError(e,ie(r,t,!this.isCreating))}change(e,t){this.formData={...this.formData,[e]:t},this.touched[e]&&this.validateField(e,t,this.formData)}touch(e){this.touched={...this.touched,[e]:!0},this.validateField(e,this.formData[e],this.formData)}commit(e,t){this.change(e,t),this.touch(e)}save(){let e=ne(this.moul?.fields||[],this.formData,this.moul?.type===`auth`,this.isCreating);if(!e.isValid){this.formErrors=e.errors,this.touched={...this.touched,...Object.fromEntries(Object.keys(e.errors).map(e=>[e,!0]))},k.error(`Validation Error`,Object.values(e.errors)[0]||`Please resolve the highlighted field errors before saving.`);return}let t=O(this.moul?.fields||[],this.formData);this.isCreating?this.createRecord(t):this.updateRecord(String(this.active.id),t)}async createRecord(e){if(this.records)try{await this.saving.track(this.records.insert({...e,id:g()},{optimistic:!1})),this.close(),k.success(`Record Created`,`New record created successfully.`)}catch(e){k.error(`Creation Failed`,e?.message||`Failed to create record.`)}}async updateRecord(e,t){if(this.records)try{await this.saving.track(this.records.update(e,e=>Object.assign(e,t))),this.close(),k.success(`Record Updated`,`Record updated successfully.`)}catch(e){k.error(`Update Failed`,e?.message||`Failed to update record.`)}}async retry(e){if(this.records)try{await this.retrying.track(v(this.records,[String(e.id)])),k.success(`Task Scheduled for Retry`,`Worker task ${e.id} marked as available for immediate execution.`),this.patchActive(e.id,{state:`available`,attempt:0,scheduled_at:new Date().toISOString()})}catch(e){k.error(`Retry Failed`,e?.message||`Failed to retry worker task.`)}}async discard(e){if(!this.records)return;let t=new Date().toISOString();try{await this.discarding.track(this.records.update(String(e.id),e=>Object.assign(e,{state:`discarded`,discarded_at:t}))),k.info(`Task Discarded`,`Worker task ${e.id} was marked as discarded.`),this.patchActive(e.id,{state:`discarded`,discarded_at:t})}catch(e){k.error(`Discard Failed`,e?.message||`Failed to discard task.`)}}textField(e,t,n={}){return i`
      <moul-text-field
        label=${t}
        type=${n.type??`text`}
        description=${n.description??``}
        error-message=${this.formErrors[e]??``}
        ?is-required=${!!n.required}
        .value=${String(this.formData[e]??``)}
        @input=${t=>this.change(e,D(t))}
        @focusout=${()=>this.touch(e)}
      ></moul-text-field>
    `}renderField(e){let t=this.formErrors[e.name]??``,r=this.formData[e.name];switch(e.type){case`bool`:return i`
          <moul-checkbox
            ?is-checked=${!!r}
            @change=${t=>this.change(e.name,t.detail.isChecked)}
          >
            ${e.name}
          </moul-checkbox>
        `;case`file`:return i`
          <admin-file-field
            label=${e.name}
            error-message=${t}
            ?required=${!!e.required}
            .value=${r}
            @valuechange=${t=>this.commit(e.name,t.detail.value)}
          ></admin-file-field>
        `;case`relation`:return i`
          <admin-relation-field
            label=${e.name}
            error-message=${t}
            ?required=${!!e.required}
            .relationConfig=${e.relationConfig}
            .value=${r}
            @valuechange=${t=>this.commit(e.name,t.detail.value)}
          ></admin-relation-field>
        `;case`json`:return i`
          <moul-text-area
            label=${e.name}
            placeholder='{"key": "value"}'
            description="Valid JSON object or array"
            rows="4"
            error-message=${t}
            ?is-required=${!!e.required}
            .value=${Y(r)}
            @input=${t=>this.change(e.name,X(D(t)))}
            @focusout=${()=>this.touch(e.name)}
          ></moul-text-area>
        `;case`number`:{let a=typeof r==`number`?r:r!=null&&r!==``?Number(r):null;return i`
          <moul-number-field
            label=${e.name}
            description=${e.min!==void 0||e.max!==void 0?`Value range: ${e.min??`-∞`}..${e.max??`+∞`}`:``}
            error-message=${t}
            min=${e.min??n}
            max=${e.max??n}
            ?is-required=${!!e.required}
            .value=${a}
            @input=${t=>this.change(e.name,t.target.value)}
            @focusout=${()=>this.touch(e.name)}
          ></moul-number-field>
        `}case`select`:return e.options?.length>0?i`
            <moul-select
              label=${e.name}
              placeholder=${`Select ${e.name}`}
              ?is-required=${!!e.required}
              selected-key=${r??``}
              @selectionchange=${t=>this.commit(e.name,t.detail.selectedKey||``)}
            >
              ${e.options.map(e=>i`<moul-select-item key=${e}>${e}</moul-select-item>`)}
            </moul-select>
            ${t?i`<span class="hint" style="color: var(--color-error-500)">${t}</span>`:n}
          `:this.textField(e.name,e.name,{required:!!e.required});default:return this.textField(e.name,e.name,{type:q[e.type]??`text`,required:!!e.required,description:J(e)})}}renderWorkerInspector(e){let t=Array.isArray(e.errors)&&e.errors.length>0?e.errors.join(`
`):e.last_error?String(e.last_error):null,r=(e.attempt??0)>=(e.max_attempts??3),a=(e,t,n=``)=>i`
      <div class="worker-stat">
        <span class="stat-label">${e}</span>
        <span class="stat-value" style=${n} title=${String(t)}>${t}</span>
      </div>
    `;return i`
      <div class="inspector">
        <div class="inspector-header">
          <span class="inspector-title">
            <admin-icon name="clock" size="16" color="var(--color-primary-500)"></admin-icon>
            Worker Task Inspector
          </span>
          <div class="inline">
            <moul-button
              variant="secondary"
              aria-label="Retry task immediately"
              ?is-pending=${this.retrying.isPending}
              @click=${o(()=>this.retry(e))}
            >
              <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
              Retry Task
            </moul-button>
            <moul-button
              variant="danger-soft"
              aria-label="Discard task"
              ?is-disabled=${e.state===`discarded`}
              ?is-pending=${this.discarding.isPending}
              @click=${o(()=>this.discard(e))}
            >
              <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
              Discard
            </moul-button>
          </div>
        </div>

        <div class="worker-grid">
          ${a(`Handler`,e.worker||`anonymous`)} ${a(`Queue`,e.queue||`default`)}
          ${a(`Attempts`,`${e.attempt??0} / ${e.max_attempts??3}`,r?`color: var(--color-error-500)`:``)}
          ${a(`Priority`,e.priority??0)}
        </div>

        ${t?i`
              <div class="error-trace">
                <div class="row-between">
                  <span class="error-trace-title">
                    <admin-icon name="warning-circle" size="15"></admin-icon>
                    Error Trace
                  </span>
                  <moul-button variant="ghost" size="sm" aria-label="Copy error trace" @click=${o(()=>this.copy(`error`,t))}>
                    <admin-icon
                      slot="prefix"
                      name=${this.copied===`error`?`check`:`copy`}
                      size="12"
                      color=${this.copied===`error`?`var(--color-success-500)`:``}
                    ></admin-icon>
                    ${this.copied===`error`?`Copied`:`Copy`}
                  </moul-button>
                </div>
                <pre>${t}</pre>
              </div>
            `:n}

        <div class="row-between">
          <span class="payload-label">Task Payload / Arguments (args)</span>
          <span class="hint">JSON Payload</span>
        </div>
        <moul-text-area
          aria-label="Task Payload Arguments"
          placeholder="{}"
          rows="4"
          .value=${Y(this.formData.args)}
          @input=${e=>this.formData={...this.formData,args:X(D(e))}}
        ></moul-text-area>
      </div>
    `}renderMetadata(e){let t=(e,t)=>t?i`<div class="metadata-row"><span>${e}</span><span>${new Date(String(t)).toLocaleString()}</span></div>`:n;return i`
      <div class="section-title">
        <admin-icon name="info" size="16" color="var(--color-primary-500)"></admin-icon>
        System Metadata & Inspection
      </div>
      <div class="metadata">
        <div class="metadata-row"><span>Record ID:</span><span style="font-weight: 600">${e.id}</span></div>
        ${t(`Created At:`,e.createdAt||e.created_at)} ${t(`Inserted At:`,e.inserted_at)}
        ${t(`Updated At:`,e.updatedAt||e.updated_at)} ${t(`Scheduled At:`,e.scheduled_at)}
      </div>
      <div class="row-between">
        <moul-button variant="outline" @click=${o(()=>this.showRawJson=!this.showRawJson)}>
          <admin-icon slot="prefix" name="code" size="14"></admin-icon>
          ${this.showRawJson?`Hide Raw JSON`:`Inspect Raw JSON`}
        </moul-button>
        <moul-button
          variant="ghost"
          size="sm"
          aria-label="Copy full record JSON"
          @click=${o(()=>this.copy(`json`,JSON.stringify(e,null,2)))}
        >
          <admin-icon
            slot="prefix"
            name=${this.copied===`json`?`check`:`copy`}
            size="13"
            color=${this.copied===`json`?`var(--color-success-500)`:``}
          ></admin-icon>
          ${this.copied===`json`?`Copied`:`Copy JSON`}
        </moul-button>
      </div>
      ${this.showRawJson?i`<pre class="json">${JSON.stringify(e,null,2)}</pre>`:n}
    `}render(){let e=this.active,t=this.isCreating,r=this.moul?.type||`base`,a=this.saving.isPending,s=e?.state?j(e.state):void 0;return i`
      <moul-drawer
        placement="right"
        size="lg"
        ?is-open=${this.isOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(e.stopPropagation(),e.detail.isOpen||this.close())}}
      >
        <div slot="header" class="header-row">
          <span class="title">
            ${t?`Create Record`:`Record #${e.id}`}
            <moul-badge tone="primary" size="sm">${r}</moul-badge>
            ${e?.state?s?i`<moul-badge tone=${s} size="sm">${e.state}</moul-badge>`:i`<moul-badge variant="bordered" size="sm">${e.state}</moul-badge>`:n}
            ${e?.id?i`
                  <moul-button variant="ghost" size="sm" aria-label="Copy record ID" @click=${o(()=>this.copy(`id`,String(e.id)))}>
                    <admin-icon
                      slot="prefix"
                      name=${this.copied===`id`?`check`:`copy`}
                      size="13"
                      color=${this.copied===`id`?`var(--color-success-500)`:``}
                    ></admin-icon>
                    ${this.copied===`id`?`Copied`:`Copy ID`}
                  </moul-button>
                `:n}
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${o(()=>this.close())}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <form
          @submit=${e=>{e.preventDefault(),this.save()}}
          @keydown=${te}
        >
          ${r===`worker`&&e?this.renderWorkerInspector(e):n}

          <div class="section-title">
            <admin-icon name="list-bullets" size="16" color="var(--color-primary-500)"></admin-icon>
            ${t?`New Record`:`Edit Record`}
          </div>

          ${r===`auth`?i`
                ${this.textField(`username`,`Username`,{required:t})}
                ${this.textField(`email`,`Email`,{type:`email`,required:t})}
                ${t?i`
                      ${this.textField(`password`,`Password`,{type:`password`,required:!0,description:`Minimum 8 characters`})}
                      ${this.textField(`passwordConfirm`,`Confirm Password`,{type:`password`,required:!0})}
                    `:n}
              `:n}
          ${this.fields.map(e=>i`<div>${this.renderField(e)}</div>`)}
          ${e?this.renderMetadata(e):n}
        </form>

        <div slot="footer" class="footer">
          <div>
            ${e?i`
                  <moul-button variant="danger-soft" @click=${o(()=>this.dispatchEvent(new CustomEvent(`deleterequest`,{detail:{record:e}})))}>
                    <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
                    Delete
                  </moul-button>
                `:n}
          </div>
          <div class="inline" style="gap: var(--spacing-2)">
            <moul-button variant="ghost" @click=${o(()=>this.close())}>Cancel</moul-button>
            ${r===`worker`&&e?i`
                  <moul-button variant="secondary" ?is-pending=${this.retrying.isPending} @click=${o(()=>this.retry(e))}>
                    <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                    Retry Task
                  </moul-button>
                `:n}
            <moul-button variant="primary" ?is-disabled=${a} @click=${o(()=>this.save())}>
              ${a?`Saving...`:t?`Create Record`:`Save Changes`}
            </moul-button>
          </div>
        </div>
      </moul-drawer>
    `}};customElements.define(`admin-record-drawer`,ae);var oe=new Set([`failed`,`discarded`,`retryable`,`completed`]);function se(e){let t=(t,n)=>{let r=Number.parseInt(e.get(t)??``,10);return Number.isFinite(r)&&r>0?r:n};return{page:t(`page`,1),perPage:t(`perPage`,30),sort:e.get(`sort`)||void 0,filter:e.get(`filter`)||void 0,search:e.get(`search`)||void 0,create:e.get(`create`)===`true`}}function ce(e,t){let n=(t||`id`).split(`,`).map(e=>e.trim()).filter(Boolean).map(e=>({field:e.replace(/^[-+]/,``),desc:e.startsWith(`-`)}));if(n.some(({field:e})=>e.includes(`.`)||e===`@random`))return e;n.some(({field:e})=>e===`id`)||n.push({field:`id`,desc:!1});let r=e;for(let{field:e,desc:t}of n)r=r.orderBy(({record:t})=>t[e],{direction:t?`desc`:`asc`,nulls:t?`last`:`first`,stringSort:`lexical`});return r}var le=(e,t)=>e.from({record:t});function Z(e,t,n){return i`
    <a
      class="chip"
      href=${f.href(`/records/${encodeURIComponent(e)}`,{page:1,perPage:30,search:t})}
      target="_blank"
      rel="noopener"
      title=${`Target: ${e} · ID: ${t}`}
      style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border: 1px solid var(--color-primary-500); border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-fg); font-size: var(--font-size-xs); text-decoration: none"
    >
      <admin-icon name="link" size="12" color="var(--color-primary-500)"></admin-icon>
      ${n}
    </a>
  `}var Q=i`<span class="muted">-</span>`;function ue(e,t){let n=t[e.name];if(e.type===`file`){if(!n)return Q;let e=A(n),t=M(n);return i`
      <span style="display: inline-flex; align-items: center; gap: 0.5rem">
        ${I(n)&&e?i`
              <a href=${e} target="_blank" rel="noopener noreferrer" title=${`View ${t}`} style="display: inline-flex">
                <img
                  src=${e}
                  alt=${t}
                  style="width: 28px; height: 28px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border-subtle)"
                />
              </a>
            `:i`<admin-icon name="file" size="18" color="var(--color-primary-500)"></admin-icon>`}
        ${e?i`
              <a
                href=${e}
                target="_blank"
                rel="noopener noreferrer"
                title=${t}
                class="small nowrap"
                style="display: inline-flex; align-items: center; gap: 0.25rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; color: var(--color-primary-500); text-decoration: none"
              >
                ${t}
                <admin-icon name="arrow-square-out" size="11"></admin-icon>
              </a>
            `:i`<span class="small">${t}</span>`}
      </span>
    `}if(e.type===`relation`){if(!n||Array.isArray(n)&&n.length===0)return Q;let r=e.relationConfig?.targetMoul||``,a=t.expand?.[e.name];if((e.relationConfig?.cardinality||`1:N`)===`M:N`){let e=Array.isArray(n)?n.map(String):[String(n)],t=Array.isArray(a)?a:[];return i`
        <span style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center">
          ${e.map((e,n)=>{let i=t.find(t=>String(t.id)===e)||t[n];return Z(r,e,i?P(i):e)})}
        </span>
      `}let o=String(n);return Z(r,o,a?P(a):o)}if(n==null||e.type===`cloak`&&n===``)return Q;if(e.type===`cloak`)return i`
      <moul-badge variant="bordered">
        <admin-icon slot="prefix" name="lock" size="12"></admin-icon>
        ${String(n)}
      </moul-badge>
    `;if(typeof n==`boolean`)return i`<moul-badge tone=${n?`success`:`error`}>${String(n)}</moul-badge>`;let r=typeof n==`object`?JSON.stringify(n):String(n);return i`<span class="truncate ${typeof n==`object`?`mono small`:``}" title=${r}>${r}</span>`}var $=class extends a{static styles=[r,E,t`
      :host {
        --page-gap: var(--spacing-4);
      }

      .page-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .title-name {
        text-transform: capitalize;
      }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        width: 100%;
      }

      moul-search-field {
        width: 360px;
        max-width: 100%;
      }

      .selection {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .count {
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-block: var(--spacing-2);
        font-size: 0.875rem;
        color: var(--color-fg-subtle);
      }

      .pagination-buttons {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      .dialog-text {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }
    `];static properties={searchText:{state:!0},selectedIds:{state:!0},isDrawerOpen:{state:!0},drawerRecord:{state:!0},recordToDelete:{state:!0},isBatchDeleteOpen:{state:!0},isExportOpen:{state:!0},isImportOpen:{state:!0}};get moulName(){return f.location.params.moulName??``}get search(){return se(f.location.search)}moul=new m(this,e=>this.moulName?e.from({moul:y}).where(({moul:e})=>h(e.name,this.moulName)).findOne():void 0,()=>[this.moulName]);get expand(){let e=(this.moul.first?.fields??[]).filter(e=>e.type===`relation`&&e.name).map(e=>e.name);return e.length>0?e.join(`,`):void 0}get query(){let{page:e,perPage:t,sort:n,filter:r,search:i}=this.search;return{page:e,perPage:t,sort:n,filter:r,search:i,expand:this.expand}}get page(){return this.moulName&&!this.moul.isLoading?x(this.moulName,this.query):void 0}records=new m(this,e=>{let t=this.page;return t?ce(le(e,t),this.search.sort):void 0},()=>[this.page]);pageInfo=new l(this,()=>C(this.moulName,this.query));lastSearchParam;lastPage;constructor(){super(),this.searchText=``,this.selectedIds=new Set,this.isDrawerOpen=!1,this.drawerRecord=null,this.recordToDelete=null,this.isBatchDeleteOpen=!1,this.isExportOpen=!1,this.isImportOpen=!1,new ee(this,f)}willUpdate(){let e=this.search;e.search!==this.lastSearchParam&&(this.lastSearchParam=e.search,this.searchText=e.search??``);let t=this.page;t&&t!==this.lastPage&&(this.lastPage=t,this.selectedIds=new Set),e.create&&(this.openCreate(),this.setSearch({create:void 0},!0))}get rows(){return this.records.data}setSearch(e,t=!1){let n=this.search;f.navigate(f.location.pathname,{replace:t,search:{page:n.page,perPage:n.perPage,sort:n.sort,filter:n.filter,search:n.search,...e}})}openCreate(){this.drawerRecord=null,this.isDrawerOpen=!0}openDetail(e){this.drawerRecord=e,this.isDrawerOpen=!0}toggleSelected(e,t){let n=new Set(this.selectedIds);for(let r of e)t?n.add(r):n.delete(r);this.selectedIds=n}async deleteRecord(e){let t=String(e.id);if(this.recordToDelete=null,this.isDrawerOpen=!1,this.selectedIds.has(t)){let e=new Set(this.selectedIds);e.delete(t),this.selectedIds=e}try{await this.page?.delete(t).when(`settled`),k.info(`Record Deleted`,`Record was deleted.`)}catch(e){k.error(`Delete Failed`,e?.message||`Failed to delete record.`)}}async batchDelete(){let e=[...this.selectedIds];this.selectedIds=new Set,this.isBatchDeleteOpen=!1;try{await this.page?.delete(e).when(`settled`),k.info(`Records Deleted`,`Successfully deleted ${e.length} record${e.length>1?`s`:``}.`)}catch(e){k.error(`Batch Delete Failed`,e?.message||`Failed to delete selected records.`)}}async retry(e){let t=this.page;if(!t)return;let n=e.length===1;try{await v(t,e).when(`settled`),k.success(n?`Task Scheduled for Retry`:`Tasks Scheduled for Retry`,n?`Worker task ${e[0]} marked as available for immediate execution.`:`Successfully scheduled ${e.length} tasks for retry.`)}catch(e){k.error(n?`Retry Failed`:`Batch Retry Failed`,e?.message||`Failed to retry worker tasks.`)}}batchRetry(){let e=[...this.selectedIds];this.selectedIds=new Set,this.retry(e)}exportSelected(){let e=this.rows.filter(e=>this.selectedIds.has(String(e.id))).map(b),t=URL.createObjectURL(new Blob([JSON.stringify(e,null,2)],{type:`application/json`})),n=document.createElement(`a`);n.href=t,n.download=`${this.moulName}-selected-${e.length}-records.json`,n.click(),URL.revokeObjectURL(t),k.success(`Exported Selected`,`Downloaded ${e.length} selected record${e.length>1?`s`:``} as JSON.`)}columns(e,t){let r=this.rows,a=r.length>0&&r.every(e=>this.selectedIds.has(String(e.id))),s=!a&&r.some(e=>this.selectedIds.has(String(e.id))),c=[{key:`__select`,width:`44px`,title:i`
          <moul-checkbox
            aria-label="Select all rows on page"
            ?is-checked=${a}
            ?is-indeterminate=${s}
            @change=${e=>this.toggleSelected(r.map(e=>String(e.id)),e.detail.isChecked)}
          ></moul-checkbox>
        `,render:e=>i`
          <moul-checkbox
            aria-label=${`Select record #${e.id}`}
            ?is-checked=${this.selectedIds.has(String(e.id))}
            @change=${t=>this.toggleSelected([String(e.id)],t.detail.isChecked)}
          ></moul-checkbox>
        `},{key:`id`,title:`ID`,render:e=>i`
          <button type="button" class="cell-link" title=${`Click to view and edit record #${e.id}`} @click=${()=>this.openDetail(e)}>
            ${String(e.id)}
          </button>
        `}];e===`auth`&&c.push({key:`username`,title:`Username`,render:e=>e.username||`-`},{key:`email`,title:`Email`,render:e=>e.email||`-`}),e===`worker`&&c.push({key:`worker`,title:`Worker`,render:e=>i`<span style="font-weight: 600">${e.worker||`-`}</span>`},{key:`state`,title:`State`,render:e=>{let t=j(e.state);return t?i`<moul-badge tone=${t}>${e.state||`available`}</moul-badge>`:i`<moul-badge variant="bordered">${e.state||`available`}</moul-badge>`}},{key:`queue`,title:`Queue`,render:e=>e.queue||`default`},{key:`attempt`,title:`Attempt`,align:`end`,render:e=>{let t=(e.attempt??0)>=(e.max_attempts??3);return i`<span style="color: ${t?`var(--color-error-500)`:`var(--color-fg-subtle)`}">${e.attempt??0}/${e.max_attempts??3}</span>`}});for(let e of t)c.push({key:e.name,title:e.name,render:t=>ue(e,t)});return c.push({key:`createdAt`,title:`Created At`,render:e=>{let t=e.createdAt||e.created_at||e.inserted_at;return i`<span class="muted small nowrap">${t?new Date(String(t)).toLocaleString():`-`}</span>`}},{key:`__actions`,title:`Actions`,align:`end`,render:t=>{let r=e===`worker`&&oe.has(String(t.state||`available`).toLowerCase());return i`
            <span style="display: inline-flex; align-items: center; gap: 0.25rem">
              ${r?i`
                    <moul-button
                      variant="secondary"
                      size="sm"
                      aria-label=${`Retry task ${t.id}`}
                      @click=${o(()=>this.retry([String(t.id)]))}
                    >
                      <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                      Retry
                    </moul-button>
                  `:n}
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`View and edit record ${t.id}`} @click=${o(()=>this.openDetail(t))}>
                <admin-icon name="pencil-simple" size="14"></admin-icon>
              </moul-button>
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Delete record ${t.id}`} @click=${o(()=>this.recordToDelete=t)}>
                <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </span>
          `}}),c}renderToolbar(e){let t=this.selectedIds.size,r=this.moul.first?.type===`worker`;return i`
      <moul-card>
        <moul-card-body>
          <div class="toolbar">
            <moul-search-field
              aria-label="Search records"
              placeholder="Search records..."
              .value=${this.searchText}
              @input=${e=>this.searchText=D(e)}
              @submit=${()=>this.setSearch({page:1,search:this.searchText.trim()||void 0})}
              @clear=${()=>this.setSearch({page:1,search:void 0})}
            ></moul-search-field>
            ${t>0?i`
                  <div class="selection">
                    <moul-badge tone="primary">${t} selected</moul-badge>
                    <moul-button variant="ghost" @click=${o(()=>this.selectedIds=new Set)}>Clear</moul-button>
                    <moul-button variant="outline" @click=${o(()=>this.exportSelected())}>
                      <admin-icon slot="prefix" name="download-simple" size="14"></admin-icon>
                      Export
                    </moul-button>
                    ${r?i`
                          <moul-button variant="secondary" @click=${o(()=>this.batchRetry())}>
                            <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                            Retry
                          </moul-button>
                        `:n}
                    <moul-button variant="danger-soft" @click=${o(()=>this.isBatchDeleteOpen=!0)}>
                      <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
                      Delete (${t})
                    </moul-button>
                  </div>
                `:i`<span class="count">Showing ${this.rows.length} of ${e} record${e===1?``:`s`}</span>`}
          </div>
        </moul-card-body>
      </moul-card>
    `}renderDialogs(){let e=this.selectedIds.size,t=this.recordToDelete;return i`
      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${t!==null}
        @openchange=${e=>{e.detail.isOpen||(this.recordToDelete=null)}}
      >
        <span slot="header">Delete Record</span>
        <p slot="body" class="dialog-text">
          Are you sure you want to delete record <strong>“${t?.id}”</strong>?<br /><br />This action cannot be undone.
        </p>
        <moul-button slot="footer" variant="outline" @click=${o(()=>this.recordToDelete=null)}>Cancel</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          @click=${o(()=>{t&&this.deleteRecord(t)})}
        >
          Delete Record
        </moul-button>
      </moul-alert-dialog>

      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${this.isBatchDeleteOpen}
        @openchange=${e=>{e.detail.isOpen||(this.isBatchDeleteOpen=!1)}}
      >
        <span slot="header">Delete ${e} Records</span>
        <p slot="body" class="dialog-text">
          Are you sure you want to delete <strong>${e} selected record${e>1?`s`:``}</strong> from “${this.moulName}”?
          <br /><br />This action cannot be undone.
        </p>
        <moul-button slot="footer" variant="outline" @click=${o(()=>this.isBatchDeleteOpen=!1)}>Cancel</moul-button>
        <moul-button slot="footer" variant="danger" @click=${o(()=>this.batchDelete())}>
          Delete ${e} Records
        </moul-button>
      </moul-alert-dialog>
    `}render(){let e=this.moulName,t=this.moul.first,n=t?.type||`base`,r=this.search,a=this.rows,s=_(this.pageInfo.data),c=s.totalItems??a.length,l=Math.max(1,s.totalPages??1),u=N(t,a);return i`
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <admin-icon name="database" size="24" color="var(--color-primary-500)"></admin-icon>
            <span class="title-name">${e} Records</span>
            <moul-badge tone="primary">${n}</moul-badge>
          </h1>
          <span class="page-subtitle">Explore records data grid</span>
        </div>
        <div class="page-actions">
          <moul-button variant="outline" @click=${o(()=>f.navigate(`/collections/${encodeURIComponent(e)}`))}>
            <admin-icon slot="prefix" name="sliders" size="16"></admin-icon>
            Schema & Settings
          </moul-button>
          <moul-button variant="outline" @click=${o(()=>this.isExportOpen=!0)}>
            <admin-icon slot="prefix" name="download-simple" size="16"></admin-icon>
            Export
          </moul-button>
          <moul-button variant="outline" @click=${o(()=>this.isImportOpen=!0)}>
            <admin-icon slot="prefix" name="upload-simple" size="16"></admin-icon>
            Import
          </moul-button>
          <moul-button variant="primary" @click=${o(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
            New Record
          </moul-button>
        </div>
      </div>

      ${this.renderToolbar(c)}

      <admin-data-table
        aria-label=${`${e} records table`}
        dense
        skeleton-rows="6"
        .columns=${this.columns(n,u)}
        .rows=${a}
        .isRowSelected=${e=>this.selectedIds.has(String(e.id))}
        ?loading=${this.records.isLoading||this.moul.isLoading}
      >
        <moul-empty-state slot="empty">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-fg-subtle)"></admin-icon>
          <span slot="title">No records found</span>
          <span slot="description">${r.search?.trim()?`No records matching "${r.search}".`:`No records in "${e}" yet.`}</span>
          <moul-button slot="actions" variant="primary" @click=${o(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Record
          </moul-button>
        </moul-empty-state>
      </admin-data-table>

      <div class="pagination">
        <span>Page ${r.page} of ${l}</span>
        <div class="pagination-buttons">
          <moul-button variant="secondary" ?is-disabled=${r.page<=1} @click=${o(()=>this.setSearch({page:Math.max(1,r.page-1)}))}>
            <admin-icon slot="prefix" name="caret-left" size="14"></admin-icon>
            Previous
          </moul-button>
          <moul-button variant="secondary" ?is-disabled=${r.page>=l} @click=${o(()=>this.setSearch({page:r.page+1}))}>
            Next
            <admin-icon slot="suffix" name="caret-right" size="14"></admin-icon>
          </moul-button>
        </div>
      </div>

      <admin-record-drawer
        moul-name=${e}
        ?is-open=${this.isDrawerOpen}
        .moul=${t}
        .fields=${u}
        .record=${this.drawerRecord}
        .records=${this.page}
        @openchange=${e=>this.isDrawerOpen=e.detail.isOpen}
        @deleterequest=${e=>this.recordToDelete=e.detail.record}
      ></admin-record-drawer>

      ${this.renderDialogs()}

      <admin-export-modal
        moul-name=${e}
        active-filter=${r.filter??``}
        active-search=${r.search??``}
        total-records=${c}
        ?is-open=${this.isExportOpen}
        @openchange=${e=>this.isExportOpen=e.detail.isOpen}
      ></admin-export-modal>

      <admin-import-modal
        moul-name=${e}
        ?is-open=${this.isImportOpen}
        @openchange=${e=>this.isImportOpen=e.detail.isOpen}
        @imported=${()=>S(this.moulName)}
      ></admin-import-modal>
    `}};customElements.define(`admin-records-page`,$);export{$ as AdminRecordsPage};