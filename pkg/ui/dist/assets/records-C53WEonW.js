import{C as e,_ as t,b as n,c as r,d as i,g as a,h as o,l as s,o as c,r as l,s as u,t as d,u as f,v as p,x as m,y as h}from"./index-RipJGQkD.js";import{n as g,r as _}from"./repeat-CCJXDy8Q.js";import"./data-table-D9L3z-YW.js";import{n as v}from"./page-BkXVDI8g.js";import{n as y,t as b}from"./forms-ChSyHPkg.js";import{i as x,n as S,r as C,t as w}from"./fieldValidation-D0RWDzzJ.js";import{t as T}from"./toast-CFk4KYOX.js";import{a as E,c as D,i as O,n as k,o as A,r as j,s as M,t as N}from"./record-helpers--GpKp9o_.js";var P=[{key:`json`,icon:`file-code`,label:`JSON`,description:`Structured JSON format. Ideal for migrations, backups, and nested relations.`},{key:`csv`,icon:`file-csv`,label:`CSV`,description:`RFC 4180 spreadsheet format. Ideal for Excel, Google Sheets, or data analysts.`}],F=class extends p{static styles=[l,e`
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
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},moulName:{type:String,attribute:`moul-name`},activeFilter:{type:String,attribute:`active-filter`},activeSearch:{type:String,attribute:`active-search`},totalRecords:{type:Number,attribute:`total-records`},format:{state:!0},scope:{state:!0},includeSchema:{state:!0},isExporting:{state:!0}};constructor(){super(),this.isOpen=!1,this.moulName=``,this.activeFilter=``,this.activeSearch=``,this.totalRecords=0,this.format=`json`,this.scope=`all`,this.includeSchema=!1,this.isExporting=!1}get hasActiveFilters(){return!!(this.activeFilter.trim()||this.activeSearch.trim())}willUpdate(e){e.has(`isOpen`)&&this.isOpen&&(this.scope=this.hasActiveFilters?`filtered`:`all`)}close(){this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}async export(){this.isExporting=!0;try{await i.exportRecords(this.moulName,{format:this.format,includeSchema:this.format===`json`&&this.includeSchema,filter:this.scope===`filtered`?this.activeFilter:void 0}),T.success(`Export Successful`,`Exported ${this.moulName} records as ${this.format.toUpperCase()}.`),this.close()}catch(e){T.error(`Export Failed`,e.message||`Failed to download exported records.`)}finally{this.isExporting=!1}}render(){return m`
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
              ${P.map(e=>m`
                  <button type="button" class="format" aria-pressed=${String(this.format===e.key)} @click=${()=>this.format=e.key}>
                    <span class="format-header">
                      <span class="format-title">
                        <admin-icon name=${e.icon} size="18" color="var(--color-primary-500)"></admin-icon>
                        ${e.label}
                      </span>
                      ${this.format===e.key?m`<moul-badge tone="primary" size="sm">Selected</moul-badge>`:h}
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
              ${this.hasActiveFilters?m`
                    <label>
                      <input type="radio" name="scope" .checked=${this.scope===`filtered`} @change=${()=>this.scope=`filtered`} />
                      <admin-icon name="funnel" size="16"></admin-icon>
                      Active Filtered Subset
                    </label>
                  `:h}
            </div>
          </div>

          ${this.format===`json`?m`
                <div class="section">
                  <span class="section-label">Advanced Options</span>
                  <moul-checkbox
                    ?is-checked=${this.includeSchema}
                    @change=${e=>this.includeSchema=e.detail.isChecked}
                  >
                    Include collection schema definition in export envelope
                  </moul-checkbox>
                </div>
              `:h}
        </div>

        <moul-button slot="footer" variant="outline" ?is-disabled=${this.isExporting} @click=${d(()=>this.close())}>
          Cancel
        </moul-button>
        <moul-button slot="footer" variant="primary" ?is-pending=${this.isExporting} @click=${d(()=>this.export())}>
          ${this.isExporting?h:m`<admin-icon slot="prefix" name="download-simple" size="16"></admin-icon>`}
          ${this.isExporting?`Exporting...`:`Download ${this.format.toUpperCase()}`}
        </moul-button>
      </moul-modal>
    `}};customElements.define(`admin-export-modal`,F);var I=e=>/\.(csv|json)$/i.test(e.name),L=class extends p{static styles=[l,e`
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
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},moulName:{type:String,attribute:`moul-name`},file:{state:!0},mode:{state:!0},errorMode:{state:!0},isUploading:{state:!0},result:{state:!0},isDragOver:{state:!0}};constructor(){super(),this.isOpen=!1,this.moulName=``,this.file=null,this.mode=`upsert`,this.errorMode=`atomic`,this.isUploading=!1,this.result=null,this.isDragOver=!1}reset(){this.file=null,this.result=null,this.isUploading=!1}close(){this.reset(),this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}pickFile(e){e&&(I(e)?(this.file=e,this.result=null):T.error(`Invalid File`,`Only .csv and .json files are supported for import.`))}onDrop(e){e.preventDefault(),this.isDragOver=!1,this.pickFile(e.dataTransfer?.files?.[0])}async runImport(){if(this.file){this.isUploading=!0;try{let e=await i.importRecords(this.moulName,this.file,{mode:this.mode,onError:this.errorMode});this.result=e,T.success(`Import Finished`,`Imported ${e.total} records into ${this.moulName}.`),this.dispatchEvent(new CustomEvent(`imported`,{detail:e}))}catch(e){T.error(`Import Failed`,e.message||`Failed to import records.`)}finally{this.isUploading=!1}}}renderResult(e){let t=e.errors??[],n=(e,t,n=`var(--color-fg)`)=>m`
      <div class="stat">
        <span class="stat-value" style="color: ${n}">${e}</span>
        <span class="stat-label">${t}</span>
      </div>
    `;return m`
      <moul-alert
        tone=${t.length>0?`warning`:`success`}
        description=${t.length>0?`Import partially completed with ${t.length} error(s).`:`Records imported and synchronized successfully!`}
      ></moul-alert>
      <div class="stats">
        ${n(e.total,`Total`)} ${n(e.inserted,`Inserted`,`var(--color-success-500)`)}
        ${n(e.updated,`Updated`,`var(--color-primary-500)`)} ${n(e.skipped,`Skipped`,`var(--color-fg-subtle)`)}
      </div>
      ${t.length>0?m`
            <div>
              <span class="errors-title">Row Errors (${t.length}):</span>
              <div class="errors">
                ${t.map(e=>m`
                    <div class="error">
                      <admin-icon name="warning-circle" size="14"></admin-icon>
                      <span>Row ${e.row}: ${e.message}</span>
                    </div>
                  `)}
              </div>
            </div>
          `:h}
    `}renderForm(){let e=this.file,t=e?.name.toLowerCase().endsWith(`.csv`);return m`
      <input
        id="file-input"
        type="file"
        accept=".csv,.json"
        hidden
        @change=${e=>{let t=e.target;this.pickFile(t.files?.[0]),t.value=``}}
      />
      ${e?m`
            <div class="file">
              <div class="file-info">
                <admin-icon name=${t?`file-csv`:`file-code`} size="28" color="var(--color-primary-500)"></admin-icon>
                <div class="file-meta">
                  <span class="file-name">${e.name}</span>
                  <span class="file-size">${j(e.size)||`0 B`} • ${t?`CSV`:`JSON`}</span>
                </div>
              </div>
              <moul-button
                variant="ghost"
                is-icon
                aria-label="Remove selected file"
                ?is-disabled=${this.isUploading}
                @click=${d(()=>this.file=null)}
              >
                <admin-icon name="x" size="16"></admin-icon>
              </moul-button>
            </div>
          `:m`
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
    `}render(){let e=this.result;return m`
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

        ${e?m`
              <moul-button slot="footer" variant="outline" @click=${d(()=>this.reset())}>
                <admin-icon slot="prefix" name="arrows-clockwise" size="16"></admin-icon>
                Import Another File
              </moul-button>
              <moul-button slot="footer" variant="primary" @click=${d(()=>this.close())}>Done</moul-button>
            `:m`
              <moul-button slot="footer" variant="outline" ?is-disabled=${this.isUploading} @click=${d(()=>this.close())}>
                Cancel
              </moul-button>
              <moul-button
                slot="footer"
                variant="primary"
                ?is-disabled=${!this.file}
                ?is-pending=${this.isUploading}
                @click=${d(()=>this.runImport())}
              >
                ${this.isUploading?h:m`<admin-icon slot="prefix" name="upload-simple" size="16"></admin-icon>`}
                ${this.isUploading?`Importing records...`:`Execute Import`}
              </moul-button>
            `}
      </moul-modal>
    `}};customElements.define(`admin-import-modal`,L);var R=class extends p{static styles=[l,e`
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
    `];static properties={label:{type:String},required:{type:Boolean},value:{attribute:!1},errorMessage:{type:String,attribute:`error-message`},isUploading:{state:!0},isDragging:{state:!0}};constructor(){super(),this.label=``,this.required=!1,this.value=null,this.errorMessage=``,this.isUploading=!1,this.isDragging=!1}emit(e){this.dispatchEvent(new CustomEvent(`valuechange`,{detail:{value:e}}))}browse(){this.isUploading||this.renderRoot.querySelector(`input[type=file]`)?.click()}async upload(e){this.isUploading=!0;try{let t=await i.uploadFile(e);Array.isArray(t)&&t.length>0?this.emit(t[0]):t&&typeof t==`object`&&this.emit(t),T.success(`File Uploaded`,`${e.name} uploaded successfully.`)}catch(e){T.error(`Upload Failed`,e.message||`Failed to upload file.`)}finally{this.isUploading=!1}}renderAttached(){let e=this.value,t=E(e),n=O(e),r=typeof e==`object`&&e?.size?j(e.size):``,i=typeof e==`object`?e?.createdAt||e?.created_at:void 0;return m`
      <div class="attached">
        <div class="attached-left">
          ${M(e)&&t?m`<img class="thumb" src=${t} alt=${n} />`:m`<span class="icon-box"><admin-icon name="file" size="22" color="var(--color-primary-500)"></admin-icon></span>`}
          <div class="info">
            <span class="name" title=${n}>${n}</span>
            <div class="meta">
              ${r?m`<span>${r}</span>`:h}
              ${i?m`<span>${new Date(i).toLocaleDateString()}</span>`:h}
            </div>
          </div>
        </div>
        <div class="actions">
          ${t?m`
                <moul-button variant="ghost" is-icon aria-label="View file" @click=${d(()=>window.open(t,`_blank`,`noopener`))}>
                  <admin-icon name="arrow-square-out" size="14"></admin-icon>
                </moul-button>
              `:h}
          <moul-button variant="outline" aria-label="Replace file" ?is-disabled=${this.isUploading} @click=${d(()=>this.browse())}>
            <admin-icon slot="prefix" name="upload-simple" size="14"></admin-icon>
            Replace
          </moul-button>
          <moul-button variant="ghost" is-icon aria-label="Remove file" ?is-disabled=${this.isUploading} @click=${d(()=>this.emit(null))}>
            <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
          </moul-button>
        </div>
      </div>
    `}renderDropzone(){let e=!!this.errorMessage;return m`
      <button
        type="button"
        class="dropzone ${this.isDragging?`dragging`:``} ${e?`invalid`:``}"
        aria-label=${`Upload ${this.label}`}
        @click=${()=>this.browse()}
        @dragover=${e=>{e.preventDefault(),this.isDragging=!0}}
        @dragleave=${e=>{e.preventDefault(),this.isDragging=!1}}
        @drop=${e=>{e.preventDefault(),this.isDragging=!1;let t=e.dataTransfer?.files?.[0];t&&this.upload(t)}}
      >
        ${this.isUploading?m`
              <span class="uploading">
                <moul-spinner size="sm"></moul-spinner>
                Uploading file to storage...
              </span>
            `:m`
              <admin-icon name="cloud-arrow-up" size="28" color=${e?`var(--color-error-500)`:`var(--color-primary-500)`}></admin-icon>
              <span class="dropzone-text">Drag & drop a file here, or <span class="browse">browse</span></span>
            `}
      </button>
    `}render(){return m`
      <span class="label">${this.label}${this.required?m`<span class="required">*</span>`:h}</span>
      <input
        type="file"
        hidden
        @change=${e=>{let t=e.target,n=t.files?.[0];n&&this.upload(n),t.value=``}}
      />
      ${this.value?this.renderAttached():this.renderDropzone()}
      ${this.errorMessage?m`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`:h}
    `}};customElements.define(`admin-file-field`,R);var z=o(class extends a{constructor(e){if(super(e),e.type!==t.PROPERTY&&e.type!==t.ATTRIBUTE&&e.type!==t.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!_(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[r]){if(r===n||r===h)return r;let i=e.element,a=e.name;if(e.type===t.PROPERTY){if(r===i[a])return n}else if(e.type===t.BOOLEAN_ATTRIBUTE){if(!!r===i.hasAttribute(a))return n}else if(e.type===t.ATTRIBUTE&&i.getAttribute(a)===r+``)return n;return g(e),r}}),B=`__none__`,V=class extends p{static styles=[l,e`
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
    `];static properties={label:{type:String},required:{type:Boolean},relationConfig:{attribute:!1},value:{attribute:!1},errorMessage:{type:String,attribute:`error-message`}};targets=new s(this,()=>{let e=this.relationConfig?.targetMoul||``;return{queryKey:[`records`,e,1,100],queryFn:()=>i.listRecords(e,{perPage:100}),enabled:!!e}});constructor(){super(),this.label=``,this.required=!1,this.relationConfig=void 0,this.value=null,this.errorMessage=``}emit(e){this.dispatchEvent(new CustomEvent(`valuechange`,{detail:{value:e}}))}get targetRecords(){let e=this.targets.data;return Array.isArray(e)?e:Array.isArray(e?.items)?e.items:[]}renderLabel(e,t){return m`
      <span class="label">
        <admin-icon name="link" size="14" color="var(--color-primary-500)"></admin-icon>
        ${this.label}
        <moul-badge tone="primary" size="sm">${e} ➔ ${t}</moul-badge>
        ${this.required?m`<span class="required">*</span>`:h}
      </span>
    `}renderMany(e){let t=Array.isArray(this.value)?this.value.map(String):this.value?[String(this.value)]:[],n=this.targetRecords,r=e=>this.emit(t.filter(t=>t!==e));return m`
      ${this.renderLabel(`M:N`,e)}
      <div class="chips">
        ${t.length===0?m`<span class="chips-empty">No records selected. Select records from the dropdown below to link.</span>`:t.map(e=>{let t=n.find(t=>String(t.id)===e),i=t?A(t):e;return m`
                <span class="chip">
                  <admin-icon name="link" size="12" color="var(--color-primary-500)"></admin-icon>
                  ${i}
                  <button type="button" aria-label=${`Remove ${i}`} @click=${()=>r(e)}>×</button>
                </span>
              `})}
      </div>
      <!-- Always shows the placeholder: picking a record adds it to the chips above. -->
      <moul-select
        aria-label=${`Add ${this.label} record`}
        placeholder=${this.targets.result.isLoading?`Loading records...`:`Select record to add to ${this.label}...`}
        .selectedKey=${z(``)}
        @selectionchange=${e=>{let n=e.detail.selectedKey;n&&!t.includes(n)&&this.emit([...t,n])}}
      >
        ${n.filter(e=>!t.includes(String(e.id))).map(e=>m`<moul-select-item key=${String(e.id)}>${A(e)} (${e.id})</moul-select-item>`)}
      </moul-select>
      ${this.errorMessage?m`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`:h}
    `}render(){let e=this.relationConfig?.targetMoul||``,t=this.relationConfig?.cardinality||`1:N`;if(t===`M:N`)return this.renderMany(e);let n=this.value?String(this.value):``;return m`
      ${this.renderLabel(t,e)}
      <moul-select
        aria-label=${`${this.label} (${t} ➔ ${e})`}
        placeholder=${this.targets.result.isLoading?`Loading target records...`:`Select ${e} record...`}
        ?is-required=${this.required}
        .selectedKey=${z(n)}
        @selectionchange=${e=>{let t=e.detail.selectedKey;this.emit(!t||t===B?``:t)}}
      >
        <moul-select-item key=${B}><em>(None / Clear)</em></moul-select-item>
        ${this.targetRecords.map(e=>m`<moul-select-item key=${String(e.id)}>${A(e)} (${e.id})</moul-select-item>`)}
      </moul-select>
      ${this.errorMessage?m`<div class="error"><admin-icon name="warning-circle" size="14"></admin-icon><span>${this.errorMessage}</span></div>`:h}
    `}};customElements.define(`admin-relation-field`,V);var H=new Set([`username`,`email`,`password`,`passwordConfirm`]),U={date:`date`,datetime:`datetime-local`,url:`url`,email:`email`,cloak:`password`};function W(e){switch(e.type){case`cloak`:return`Encrypted at rest with AES-256-GCM`;case`text`:case`editor`:return e.min!==void 0||e.max!==void 0?`Length: ${e.min??0}..${e.max??`∞`} characters`:``;case`url`:return`Must start with http:// or https://`;case`date`:return`Date in YYYY-MM-DD format`;case`datetime`:return`Local or ISO 8601 date & time`;default:return``}}var G=e=>typeof e==`object`&&e?JSON.stringify(e,null,2):String(e??``);function K(e){try{return JSON.parse(e)}catch{return e}}var q=class extends p{static styles=[l,e`
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
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},moulName:{type:String,attribute:`moul-name`},moul:{attribute:!1},fields:{attribute:!1},record:{attribute:!1},active:{state:!0},formData:{state:!0},formErrors:{state:!0},touched:{state:!0},copied:{state:!0},showRawJson:{state:!0}};copiedTimer;invalidate(){f.invalidateQueries({queryKey:[`records`,this.moulName]})}createMutation=new r(this,{mutationFn:e=>i.createRecord(this.moulName,e),onSuccess:()=>{this.invalidate(),this.close(),T.success(`Record Created`,`New record created successfully.`)},onError:e=>T.error(`Creation Failed`,e.message||`Failed to create record.`)});updateMutation=new r(this,{mutationFn:({id:e,data:t})=>i.updateRecord(this.moulName,e,t),onSuccess:()=>{this.invalidate(),this.close(),T.success(`Record Updated`,`Record updated successfully.`)},onError:e=>T.error(`Update Failed`,e.message||`Failed to update record.`)});retryMutation=new r(this,{mutationFn:async e=>{try{return await i.retryJobs(this.moulName,[e.id])}catch{return await i.updateRecord(this.moulName,e.id,{state:`available`,scheduled_at:new Date().toISOString(),attempt:0})}},onSuccess:(e,t)=>{this.invalidate(),f.invalidateQueries({queryKey:[`workerJobs`]}),T.success(`Task Scheduled for Retry`,`Worker task ${t.id} marked as available for immediate execution.`),this.patchActive(t.id,{state:`available`,attempt:0,scheduled_at:new Date().toISOString()})},onError:e=>T.error(`Retry Failed`,e.message||`Failed to retry worker task.`)});discardMutation=new r(this,{mutationFn:e=>i.updateRecord(this.moulName,e.id,{state:`discarded`,discarded_at:new Date().toISOString()}),onSuccess:(e,t)=>{this.invalidate(),f.invalidateQueries({queryKey:[`workerJobs`]}),T.info(`Task Discarded`,`Worker task ${t.id} was marked as discarded.`),this.patchActive(t.id,{state:`discarded`,discarded_at:new Date().toISOString()})},onError:e=>T.error(`Discard Failed`,e.message||`Failed to discard task.`)});constructor(){super(),this.isOpen=!1,this.moulName=``,this.moul=null,this.fields=[],this.record=null,this.active=null,this.formData={},this.formErrors={},this.touched={},this.copied=null,this.showRawJson=!1}get isCreating(){return this.active===null}willUpdate(e){(e.has(`isOpen`)&&this.isOpen||e.has(`record`)&&this.isOpen)&&(this.active=this.record,this.formData=this.record?{...this.record}:{},this.formErrors={},this.touched={},this.showRawJson=!1)}patchActive(e,t){this.active?.id===e&&(this.active={...this.active,...t},this.formData={...this.active})}close(){this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}async copy(e,t){await N(t)?(this.copied=e,window.clearTimeout(this.copiedTimer),this.copiedTimer=window.setTimeout(()=>this.copied=null,2e3)):T.error(`Copy Failed`,`The browser blocked clipboard access.`)}setError(e,t){let n={...this.formErrors};t?n[e]=t:delete n[e],this.formErrors=n}validateField(e,t,n){if(this.moul?.type===`auth`&&H.has(e)){let t=S(n,this.isCreating);this.setError(e,t[e]),e===`password`&&this.touched.passwordConfirm&&this.setError(`passwordConfirm`,t.passwordConfirm);return}let r=(this.moul?.fields||[]).find(t=>t.name===e);r&&this.setError(e,C(r,t,!this.isCreating))}change(e,t){this.formData={...this.formData,[e]:t},this.touched[e]&&this.validateField(e,t,this.formData)}touch(e){this.touched={...this.touched,[e]:!0},this.validateField(e,this.formData[e],this.formData)}commit(e,t){this.change(e,t),this.touch(e)}save(){let e=x(this.moul?.fields||[],this.formData,this.moul?.type===`auth`,this.isCreating);if(!e.isValid){this.formErrors=e.errors,this.touched={...this.touched,...Object.fromEntries(Object.keys(e.errors).map(e=>[e,!0]))},T.error(`Validation Error`,Object.values(e.errors)[0]||`Please resolve the highlighted field errors before saving.`);return}let t=w(this.moul?.fields||[],this.formData);this.isCreating?this.createMutation.mutate(t):this.updateMutation.mutate({id:this.active.id,data:t})}textField(e,t,n={}){return m`
      <moul-text-field
        label=${t}
        type=${n.type??`text`}
        description=${n.description??``}
        error-message=${this.formErrors[e]??``}
        ?is-required=${!!n.required}
        .value=${String(this.formData[e]??``)}
        @input=${t=>this.change(e,b(t))}
        @focusout=${()=>this.touch(e)}
      ></moul-text-field>
    `}renderField(e){let t=this.formErrors[e.name]??``,n=this.formData[e.name];switch(e.type){case`bool`:return m`
          <moul-checkbox
            ?is-checked=${!!n}
            @change=${t=>this.change(e.name,t.detail.isChecked)}
          >
            ${e.name}
          </moul-checkbox>
        `;case`file`:return m`
          <admin-file-field
            label=${e.name}
            error-message=${t}
            ?required=${!!e.required}
            .value=${n}
            @valuechange=${t=>this.commit(e.name,t.detail.value)}
          ></admin-file-field>
        `;case`relation`:return m`
          <admin-relation-field
            label=${e.name}
            error-message=${t}
            ?required=${!!e.required}
            .relationConfig=${e.relationConfig}
            .value=${n}
            @valuechange=${t=>this.commit(e.name,t.detail.value)}
          ></admin-relation-field>
        `;case`json`:return m`
          <moul-text-area
            label=${e.name}
            placeholder='{"key": "value"}'
            description="Valid JSON object or array"
            rows="4"
            error-message=${t}
            ?is-required=${!!e.required}
            .value=${G(n)}
            @input=${t=>this.change(e.name,K(b(t)))}
            @focusout=${()=>this.touch(e.name)}
          ></moul-text-area>
        `;case`number`:{let r=typeof n==`number`?n:n!=null&&n!==``?Number(n):null;return m`
          <moul-number-field
            label=${e.name}
            description=${e.min!==void 0||e.max!==void 0?`Value range: ${e.min??`-∞`}..${e.max??`+∞`}`:``}
            error-message=${t}
            min=${e.min??h}
            max=${e.max??h}
            ?is-required=${!!e.required}
            .value=${r}
            @input=${t=>this.change(e.name,t.target.value)}
            @focusout=${()=>this.touch(e.name)}
          ></moul-number-field>
        `}case`select`:return e.options?.length>0?m`
            <moul-select
              label=${e.name}
              placeholder=${`Select ${e.name}`}
              ?is-required=${!!e.required}
              selected-key=${n??``}
              @selectionchange=${t=>this.commit(e.name,t.detail.selectedKey||``)}
            >
              ${e.options.map(e=>m`<moul-select-item key=${e}>${e}</moul-select-item>`)}
            </moul-select>
            ${t?m`<span class="hint" style="color: var(--color-error-500)">${t}</span>`:h}
          `:this.textField(e.name,e.name,{required:!!e.required});default:return this.textField(e.name,e.name,{type:U[e.type]??`text`,required:!!e.required,description:W(e)})}}renderWorkerInspector(e){let t=Array.isArray(e.errors)&&e.errors.length>0?e.errors.join(`
`):e.last_error?String(e.last_error):null,n=(e.attempt??0)>=(e.max_attempts??3),r=(e,t,n=``)=>m`
      <div class="worker-stat">
        <span class="stat-label">${e}</span>
        <span class="stat-value" style=${n} title=${String(t)}>${t}</span>
      </div>
    `;return m`
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
              ?is-pending=${this.retryMutation.isPending}
              @click=${d(()=>this.retryMutation.mutate(e))}
            >
              <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
              Retry Task
            </moul-button>
            <moul-button
              variant="danger-soft"
              aria-label="Discard task"
              ?is-disabled=${e.state===`discarded`}
              ?is-pending=${this.discardMutation.isPending}
              @click=${d(()=>this.discardMutation.mutate(e))}
            >
              <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
              Discard
            </moul-button>
          </div>
        </div>

        <div class="worker-grid">
          ${r(`Handler`,e.worker||`anonymous`)} ${r(`Queue`,e.queue||`default`)}
          ${r(`Attempts`,`${e.attempt??0} / ${e.max_attempts??3}`,n?`color: var(--color-error-500)`:``)}
          ${r(`Priority`,e.priority??0)}
        </div>

        ${t?m`
              <div class="error-trace">
                <div class="row-between">
                  <span class="error-trace-title">
                    <admin-icon name="warning-circle" size="15"></admin-icon>
                    Error Trace
                  </span>
                  <moul-button variant="ghost" size="sm" aria-label="Copy error trace" @click=${d(()=>this.copy(`error`,t))}>
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
            `:h}

        <div class="row-between">
          <span class="payload-label">Task Payload / Arguments (args)</span>
          <span class="hint">JSON Payload</span>
        </div>
        <moul-text-area
          aria-label="Task Payload Arguments"
          placeholder="{}"
          rows="4"
          .value=${G(this.formData.args)}
          @input=${e=>this.formData={...this.formData,args:K(b(e))}}
        ></moul-text-area>
      </div>
    `}renderMetadata(e){let t=(e,t)=>t?m`<div class="metadata-row"><span>${e}</span><span>${new Date(String(t)).toLocaleString()}</span></div>`:h;return m`
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
        <moul-button variant="outline" @click=${d(()=>this.showRawJson=!this.showRawJson)}>
          <admin-icon slot="prefix" name="code" size="14"></admin-icon>
          ${this.showRawJson?`Hide Raw JSON`:`Inspect Raw JSON`}
        </moul-button>
        <moul-button
          variant="ghost"
          size="sm"
          aria-label="Copy full record JSON"
          @click=${d(()=>this.copy(`json`,JSON.stringify(e,null,2)))}
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
      ${this.showRawJson?m`<pre class="json">${JSON.stringify(e,null,2)}</pre>`:h}
    `}render(){let e=this.active,t=this.isCreating,n=this.moul?.type||`base`,r=this.createMutation.isPending||this.updateMutation.isPending,i=e?.state?D(e.state):void 0;return m`
      <moul-drawer
        placement="right"
        size="lg"
        ?is-open=${this.isOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(e.stopPropagation(),e.detail.isOpen||this.close())}}
      >
        <div slot="header" class="header-row">
          <span class="title">
            ${t?`Create Record`:`Record #${e.id}`}
            <moul-badge tone="primary" size="sm">${n}</moul-badge>
            ${e?.state?i?m`<moul-badge tone=${i} size="sm">${e.state}</moul-badge>`:m`<moul-badge variant="bordered" size="sm">${e.state}</moul-badge>`:h}
            ${e?.id?m`
                  <moul-button variant="ghost" size="sm" aria-label="Copy record ID" @click=${d(()=>this.copy(`id`,String(e.id)))}>
                    <admin-icon
                      slot="prefix"
                      name=${this.copied===`id`?`check`:`copy`}
                      size="13"
                      color=${this.copied===`id`?`var(--color-success-500)`:``}
                    ></admin-icon>
                    ${this.copied===`id`?`Copied`:`Copy ID`}
                  </moul-button>
                `:h}
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${d(()=>this.close())}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <form
          @submit=${e=>{e.preventDefault(),this.save()}}
          @keydown=${y}
        >
          ${n===`worker`&&e?this.renderWorkerInspector(e):h}

          <div class="section-title">
            <admin-icon name="list-bullets" size="16" color="var(--color-primary-500)"></admin-icon>
            ${t?`New Record`:`Edit Record`}
          </div>

          ${n===`auth`?m`
                ${this.textField(`username`,`Username`,{required:t})}
                ${this.textField(`email`,`Email`,{type:`email`,required:t})}
                ${t?m`
                      ${this.textField(`password`,`Password`,{type:`password`,required:!0,description:`Minimum 8 characters`})}
                      ${this.textField(`passwordConfirm`,`Confirm Password`,{type:`password`,required:!0})}
                    `:h}
              `:h}
          ${this.fields.map(e=>m`<div>${this.renderField(e)}</div>`)}
          ${e?this.renderMetadata(e):h}
        </form>

        <div slot="footer" class="footer">
          <div>
            ${e?m`
                  <moul-button variant="danger-soft" @click=${d(()=>this.dispatchEvent(new CustomEvent(`deleterequest`,{detail:{record:e}})))}>
                    <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
                    Delete
                  </moul-button>
                `:h}
          </div>
          <div class="inline" style="gap: var(--spacing-2)">
            <moul-button variant="ghost" @click=${d(()=>this.close())}>Cancel</moul-button>
            ${n===`worker`&&e?m`
                  <moul-button variant="secondary" ?is-pending=${this.retryMutation.isPending} @click=${d(()=>this.retryMutation.mutate(e))}>
                    <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                    Retry Task
                  </moul-button>
                `:h}
            <moul-button variant="primary" ?is-disabled=${r} @click=${d(()=>this.save())}>
              ${r?`Saving...`:t?`Create Record`:`Save Changes`}
            </moul-button>
          </div>
        </div>
      </moul-drawer>
    `}};customElements.define(`admin-record-drawer`,q);var J=new Set([`failed`,`discarded`,`retryable`,`completed`]);function Y(e){let t=(t,n)=>{let r=Number.parseInt(e.get(t)??``,10);return Number.isFinite(r)&&r>0?r:n};return{page:t(`page`,1),perPage:t(`perPage`,30),sort:e.get(`sort`)||void 0,filter:e.get(`filter`)||void 0,search:e.get(`search`)||void 0,create:e.get(`create`)===`true`}}function X(e,t,n){return m`
    <a
      class="chip"
      href=${c.href(`/records/${encodeURIComponent(e)}`,{page:1,perPage:30,search:t})}
      target="_blank"
      rel="noopener"
      title=${`Target: ${e} · ID: ${t}`}
      style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border: 1px solid var(--color-primary-500); border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-fg); font-size: var(--font-size-xs); text-decoration: none"
    >
      <admin-icon name="link" size="12" color="var(--color-primary-500)"></admin-icon>
      ${n}
    </a>
  `}var Z=m`<span class="muted">-</span>`;function Q(e,t){let n=t[e.name];if(e.type===`file`){if(!n)return Z;let e=E(n),t=O(n);return m`
      <span style="display: inline-flex; align-items: center; gap: 0.5rem">
        ${M(n)&&e?m`
              <a href=${e} target="_blank" rel="noopener noreferrer" title=${`View ${t}`} style="display: inline-flex">
                <img
                  src=${e}
                  alt=${t}
                  style="width: 28px; height: 28px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border-subtle)"
                />
              </a>
            `:m`<admin-icon name="file" size="18" color="var(--color-primary-500)"></admin-icon>`}
        ${e?m`
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
            `:m`<span class="small">${t}</span>`}
      </span>
    `}if(e.type===`relation`){if(!n||Array.isArray(n)&&n.length===0)return Z;let r=e.relationConfig?.targetMoul||``,i=t.expand?.[e.name];if((e.relationConfig?.cardinality||`1:N`)===`M:N`){let e=Array.isArray(n)?n.map(String):[String(n)],t=Array.isArray(i)?i:[];return m`
        <span style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center">
          ${e.map((e,n)=>{let i=t.find(t=>String(t.id)===e)||t[n];return X(r,e,i?A(i):e)})}
        </span>
      `}let a=String(n);return X(r,a,i?A(i):a)}if(n==null||e.type===`cloak`&&n===``)return Z;if(e.type===`cloak`)return m`
      <moul-badge variant="bordered">
        <admin-icon slot="prefix" name="lock" size="12"></admin-icon>
        ${String(n)}
      </moul-badge>
    `;if(typeof n==`boolean`)return m`<moul-badge tone=${n?`success`:`error`}>${String(n)}</moul-badge>`;let r=typeof n==`object`?JSON.stringify(n):String(n);return m`<span class="truncate ${typeof n==`object`?`mono small`:``}" title=${r}>${r}</span>`}var $=class extends p{static styles=[l,v,e`
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
    `];static properties={searchText:{state:!0},selectedIds:{state:!0},isDrawerOpen:{state:!0},drawerRecord:{state:!0},recordToDelete:{state:!0},isBatchDeleteOpen:{state:!0},isBatchDeleting:{state:!0},isBatchRetrying:{state:!0},isExportOpen:{state:!0},isImportOpen:{state:!0}};get moulName(){return c.location.params.moulName??``}get search(){return Y(c.location.search)}moul=new s(this,()=>({queryKey:[`moul`,this.moulName],queryFn:()=>i.getMoul(this.moulName),enabled:!!this.moulName}));get expand(){let e=(this.moul.data?.fields??[]).filter(e=>e.type===`relation`&&e.name).map(e=>e.name);return e.length>0?e.join(`,`):void 0}records=new s(this,()=>{let e=this.search,t=this.expand;return{queryKey:[`records`,this.moulName,e.page,e.perPage,e.sort,e.filter,e.search,t],queryFn:()=>i.listRecords(this.moulName,{page:e.page,perPage:e.perPage,sort:e.sort,filter:e.filter,search:e.search,expand:t}),enabled:!!this.moulName}});deleteMutation=new r(this,{mutationFn:e=>i.deleteRecord(this.moulName,e),onSuccess:(e,t)=>{if(this.invalidateRecords(),this.isDrawerOpen=!1,this.selectedIds.has(String(t))){let e=new Set(this.selectedIds);e.delete(String(t)),this.selectedIds=e}T.info(`Record Deleted`,`Record was deleted.`)},onError:e=>T.error(`Delete Failed`,e.message||`Failed to delete record.`),onSettled:()=>{this.recordToDelete=null}});retryMutation=new r(this,{mutationFn:async e=>{try{return await i.retryJobs(this.moulName,[e.id])}catch{return await i.updateRecord(this.moulName,e.id,{state:`available`,scheduled_at:new Date().toISOString(),attempt:0})}},onSuccess:(e,t)=>{this.invalidateRecords(),f.invalidateQueries({queryKey:[`workerJobs`]}),T.success(`Task Scheduled for Retry`,`Worker task ${t.id} marked as available for immediate execution.`)},onError:e=>T.error(`Retry Failed`,e.message||`Failed to retry worker task.`)});lastSearchParam;lastMoulName=``;constructor(){super(),this.searchText=``,this.selectedIds=new Set,this.isDrawerOpen=!1,this.drawerRecord=null,this.recordToDelete=null,this.isBatchDeleteOpen=!1,this.isBatchDeleting=!1,this.isBatchRetrying=!1,this.isExportOpen=!1,this.isImportOpen=!1,new u(this,c)}willUpdate(){let e=this.search;e.search!==this.lastSearchParam&&(this.lastSearchParam=e.search,this.searchText=e.search??``),this.moulName!==this.lastMoulName&&(this.lastMoulName=this.moulName,this.selectedIds=new Set),e.create&&(this.openCreate(),this.setSearch({create:void 0},!0))}get rows(){let e=this.records.data;return Array.isArray(e)?e:Array.isArray(e?.items)?e.items:[]}invalidateRecords(){f.invalidateQueries({queryKey:[`records`,this.moulName]})}setSearch(e,t=!1){let n=this.search;c.navigate(c.location.pathname,{replace:t,search:{page:n.page,perPage:n.perPage,sort:n.sort,filter:n.filter,search:n.search,...e}})}openCreate(){this.drawerRecord=null,this.isDrawerOpen=!0}openDetail(e){this.drawerRecord=e,this.isDrawerOpen=!0}toggleSelected(e,t){let n=new Set(this.selectedIds);for(let r of e)t?n.add(r):n.delete(r);this.selectedIds=n}async batchDelete(){let e=[...this.selectedIds];this.isBatchDeleting=!0;try{await Promise.all(e.map(e=>i.deleteRecord(this.moulName,e))),this.invalidateRecords(),T.info(`Records Deleted`,`Successfully deleted ${e.length} record${e.length>1?`s`:``}.`),this.selectedIds=new Set,this.isBatchDeleteOpen=!1}catch(e){this.invalidateRecords(),T.error(`Batch Delete Failed`,e.message||`Failed to delete selected records.`)}finally{this.isBatchDeleting=!1}}async batchRetry(){let e=[...this.selectedIds];this.isBatchRetrying=!0;try{await i.retryJobs(this.moulName,e),this.invalidateRecords(),f.invalidateQueries({queryKey:[`workerJobs`]}),T.success(`Tasks Scheduled for Retry`,`Successfully scheduled ${e.length} task${e.length>1?`s`:``} for retry.`),this.selectedIds=new Set}catch(e){T.error(`Batch Retry Failed`,e.message||`Failed to retry selected worker tasks.`)}finally{this.isBatchRetrying=!1}}exportSelected(){let e=this.rows.filter(e=>this.selectedIds.has(String(e.id))),t=URL.createObjectURL(new Blob([JSON.stringify(e,null,2)],{type:`application/json`})),n=document.createElement(`a`);n.href=t,n.download=`${this.moulName}-selected-${e.length}-records.json`,n.click(),URL.revokeObjectURL(t),T.success(`Exported Selected`,`Downloaded ${e.length} selected record${e.length>1?`s`:``} as JSON.`)}columns(e,t){let n=this.rows,r=n.length>0&&n.every(e=>this.selectedIds.has(String(e.id))),i=!r&&n.some(e=>this.selectedIds.has(String(e.id))),a=[{key:`__select`,width:`44px`,title:m`
          <moul-checkbox
            aria-label="Select all rows on page"
            ?is-checked=${r}
            ?is-indeterminate=${i}
            @change=${e=>this.toggleSelected(n.map(e=>String(e.id)),e.detail.isChecked)}
          ></moul-checkbox>
        `,render:e=>m`
          <moul-checkbox
            aria-label=${`Select record #${e.id}`}
            ?is-checked=${this.selectedIds.has(String(e.id))}
            @change=${t=>this.toggleSelected([String(e.id)],t.detail.isChecked)}
          ></moul-checkbox>
        `},{key:`id`,title:`ID`,render:e=>m`
          <button type="button" class="cell-link" title=${`Click to view and edit record #${e.id}`} @click=${()=>this.openDetail(e)}>
            ${String(e.id)}
          </button>
        `}];e===`auth`&&a.push({key:`username`,title:`Username`,render:e=>e.username||`-`},{key:`email`,title:`Email`,render:e=>e.email||`-`}),e===`worker`&&a.push({key:`worker`,title:`Worker`,render:e=>m`<span style="font-weight: 600">${e.worker||`-`}</span>`},{key:`state`,title:`State`,render:e=>{let t=D(e.state);return t?m`<moul-badge tone=${t}>${e.state||`available`}</moul-badge>`:m`<moul-badge variant="bordered">${e.state||`available`}</moul-badge>`}},{key:`queue`,title:`Queue`,render:e=>e.queue||`default`},{key:`attempt`,title:`Attempt`,align:`end`,render:e=>{let t=(e.attempt??0)>=(e.max_attempts??3);return m`<span style="color: ${t?`var(--color-error-500)`:`var(--color-fg-subtle)`}">${e.attempt??0}/${e.max_attempts??3}</span>`}});for(let e of t)a.push({key:e.name,title:e.name,render:t=>Q(e,t)});return a.push({key:`createdAt`,title:`Created At`,render:e=>{let t=e.createdAt||e.created_at||e.inserted_at;return m`<span class="muted small nowrap">${t?new Date(String(t)).toLocaleString():`-`}</span>`}},{key:`__actions`,title:`Actions`,align:`end`,render:t=>{let n=e===`worker`&&J.has(String(t.state||`available`).toLowerCase()),r=this.retryMutation.isPending&&this.retryMutation.result.variables?.id===t.id;return m`
            <span style="display: inline-flex; align-items: center; gap: 0.25rem">
              ${n?m`
                    <moul-button
                      variant="secondary"
                      size="sm"
                      aria-label=${`Retry task ${t.id}`}
                      ?is-pending=${r}
                      @click=${d(()=>this.retryMutation.mutate(t))}
                    >
                      <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                      Retry
                    </moul-button>
                  `:h}
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`View and edit record ${t.id}`} @click=${d(()=>this.openDetail(t))}>
                <admin-icon name="pencil-simple" size="14"></admin-icon>
              </moul-button>
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Delete record ${t.id}`} @click=${d(()=>this.recordToDelete=t)}>
                <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </span>
          `}}),a}renderToolbar(e){let t=this.selectedIds.size,n=this.moul.data?.type===`worker`;return m`
      <moul-card>
        <moul-card-body>
          <div class="toolbar">
            <moul-search-field
              aria-label="Search records"
              placeholder="Search records..."
              .value=${this.searchText}
              @input=${e=>this.searchText=b(e)}
              @submit=${()=>this.setSearch({page:1,search:this.searchText.trim()||void 0})}
              @clear=${()=>this.setSearch({page:1,search:void 0})}
            ></moul-search-field>
            ${t>0?m`
                  <div class="selection">
                    <moul-badge tone="primary">${t} selected</moul-badge>
                    <moul-button variant="ghost" @click=${d(()=>this.selectedIds=new Set)}>Clear</moul-button>
                    <moul-button variant="outline" @click=${d(()=>this.exportSelected())}>
                      <admin-icon slot="prefix" name="download-simple" size="14"></admin-icon>
                      Export
                    </moul-button>
                    ${n?m`
                          <moul-button variant="secondary" ?is-pending=${this.isBatchRetrying} @click=${d(()=>this.batchRetry())}>
                            <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                            Retry
                          </moul-button>
                        `:h}
                    <moul-button variant="danger-soft" @click=${d(()=>this.isBatchDeleteOpen=!0)}>
                      <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
                      Delete (${t})
                    </moul-button>
                  </div>
                `:m`<span class="count">Showing ${this.rows.length} of ${e} record${e===1?``:`s`}</span>`}
          </div>
        </moul-card-body>
      </moul-card>
    `}renderDialogs(){let e=this.selectedIds.size,t=this.recordToDelete;return m`
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
        <moul-button slot="footer" variant="outline" @click=${d(()=>this.recordToDelete=null)}>Cancel</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          ?is-pending=${this.deleteMutation.isPending}
          @click=${d(()=>{t&&this.deleteMutation.mutate(String(t.id))})}
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
        <moul-button slot="footer" variant="outline" @click=${d(()=>this.isBatchDeleteOpen=!1)}>Cancel</moul-button>
        <moul-button slot="footer" variant="danger" ?is-pending=${this.isBatchDeleting} @click=${d(()=>this.batchDelete())}>
          Delete ${e} Records
        </moul-button>
      </moul-alert-dialog>
    `}render(){let e=this.moulName,t=this.moul.data,n=t?.type||`base`,r=this.search,i=this.rows,a=this.records.data,o=a&&!Array.isArray(a)&&typeof a.totalItems==`number`?a.totalItems:i.length,s=a&&!Array.isArray(a)&&typeof a.totalPages==`number`?Math.max(1,a.totalPages):1,l=k(t,i);return m`
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
          <moul-button variant="outline" @click=${d(()=>c.navigate(`/collections/${encodeURIComponent(e)}`))}>
            <admin-icon slot="prefix" name="sliders" size="16"></admin-icon>
            Schema & Settings
          </moul-button>
          <moul-button variant="outline" @click=${d(()=>this.isExportOpen=!0)}>
            <admin-icon slot="prefix" name="download-simple" size="16"></admin-icon>
            Export
          </moul-button>
          <moul-button variant="outline" @click=${d(()=>this.isImportOpen=!0)}>
            <admin-icon slot="prefix" name="upload-simple" size="16"></admin-icon>
            Import
          </moul-button>
          <moul-button variant="primary" @click=${d(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
            New Record
          </moul-button>
        </div>
      </div>

      ${this.renderToolbar(o)}

      <admin-data-table
        aria-label=${`${e} records table`}
        dense
        skeleton-rows="6"
        .columns=${this.columns(n,l)}
        .rows=${i}
        .isRowSelected=${e=>this.selectedIds.has(String(e.id))}
        ?loading=${this.records.result.isLoading}
      >
        <moul-empty-state slot="empty">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-fg-subtle)"></admin-icon>
          <span slot="title">No records found</span>
          <span slot="description">${r.search?.trim()?`No records matching "${r.search}".`:`No records in "${e}" yet.`}</span>
          <moul-button slot="actions" variant="primary" @click=${d(()=>this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Record
          </moul-button>
        </moul-empty-state>
      </admin-data-table>

      <div class="pagination">
        <span>Page ${r.page} of ${s}</span>
        <div class="pagination-buttons">
          <moul-button variant="secondary" ?is-disabled=${r.page<=1} @click=${d(()=>this.setSearch({page:Math.max(1,r.page-1)}))}>
            <admin-icon slot="prefix" name="caret-left" size="14"></admin-icon>
            Previous
          </moul-button>
          <moul-button variant="secondary" ?is-disabled=${r.page>=s} @click=${d(()=>this.setSearch({page:r.page+1}))}>
            Next
            <admin-icon slot="suffix" name="caret-right" size="14"></admin-icon>
          </moul-button>
        </div>
      </div>

      <admin-record-drawer
        moul-name=${e}
        ?is-open=${this.isDrawerOpen}
        .moul=${t}
        .fields=${l}
        .record=${this.drawerRecord}
        @openchange=${e=>this.isDrawerOpen=e.detail.isOpen}
        @deleterequest=${e=>this.recordToDelete=e.detail.record}
      ></admin-record-drawer>

      ${this.renderDialogs()}

      <admin-export-modal
        moul-name=${e}
        active-filter=${r.filter??``}
        active-search=${r.search??``}
        total-records=${o}
        ?is-open=${this.isExportOpen}
        @openchange=${e=>this.isExportOpen=e.detail.isOpen}
      ></admin-export-modal>

      <admin-import-modal
        moul-name=${e}
        ?is-open=${this.isImportOpen}
        @openchange=${e=>this.isImportOpen=e.detail.isOpen}
        @imported=${()=>this.invalidateRecords()}
      ></admin-import-modal>
    `}};customElements.define(`admin-records-page`,$);export{$ as AdminRecordsPage};