import{i as e,l as t,n,o as r,r as i,t as a}from"./press-CVc8c9H4.js";import{t as o}from"./live-query-CaUrZsz9.js";import{F as s,i as c,l,t as u,u as d}from"./index-BTyfsV_n.js";import"./data-table-BT-iosg4.js";import{n as f,t as p}from"./page-C5Uax4jB.js";import{t as m}from"./toast-C0GhDIwH.js";import{c as h,t as g}from"./record-helpers-BhvqQe0T.js";var _=[`all`,`available`,`executing`,`completed`,`retryable`,`discarded`],v=[{name:`SendEmail`,description:`Asynchronous transactional email dispatcher`},{name:`DeliverWebhook`,description:`HTTP webhook payload delivery with exponential backoff`}],y=e=>String(e.state||`available`).toLowerCase();function b(e){let t=h(e);return t?r`<moul-badge tone=${t}>${e}</moul-badge>`:r`<moul-badge variant="bordered">${e}</moul-badge>`}function x(e){if(!e.payload)return l(e);if(typeof e.payload!=`string`)return e.payload;try{return JSON.parse(e.payload)}catch{return e.payload}}var S=e=>e?new Date(String(e)).toLocaleString():`N/A`,C=class extends i{static styles=[n,f,t`
      .badge-content,
      .actions {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        width: 100%;
      }

      .card-title {
        font-size: 1.125rem;
      }

      .toolbar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      moul-select {
        width: 220px;
        max-width: 100%;
      }

      .filters {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        margin-bottom: var(--spacing-3);
      }

      .worker-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
      }

      .worker {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-elevated);
      }

      .worker-name {
        font-family: var(--font-mono);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .worker-description {
        margin-top: 2px;
        font-size: var(--font-size-xs);
        color: var(--color-fg-subtle);
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

      .inspector {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        color: var(--color-fg);
      }

      .detail {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        padding-bottom: var(--spacing-3);
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: var(--font-size-sm);
      }

      .detail-label {
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-subtle);
      }

      .row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      pre {
        margin: 0;
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        white-space: pre-wrap;
      }

      .code {
        max-height: 320px;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background-color: var(--color-bg-subtle);
      }

      .error-trace {
        padding: var(--spacing-2);
        border-radius: var(--radius-sm);
        background-color: var(--color-bg-subtle);
        color: var(--color-error-500);
      }
    `];static properties={collection:{state:!0},filter:{state:!0},selectedJob:{state:!0},isInspectorOpen:{state:!0},copied:{state:!0}};copiedTimer;workerMouls=new o(this,e=>e.from({moul:c}).where(({moul:e})=>s(e.type,`worker`)));get queue(){return d(this.collection)}jobs=new o(this,e=>e.from({job:this.queue}).orderBy(({job:e})=>e.createdAt,`desc`).orderBy(({job:e})=>e.id,`asc`),()=>[this.queue]);async setJobState(e,t,n,r){try{await this.queue.update(String(e.id),e=>Object.assign(e,t)).when(`settled`),n()}catch(e){r(e?.message)}}retry(e){return this.setJobState(e,{state:`available`,scheduled_at:new Date().toISOString()},()=>m.success(`Job Retried`,`Job ${e.id} marked as available for immediate processing.`),e=>m.error(`Retry Failed`,e||`Failed to retry job.`))}discard(e){return this.setJobState(e,{state:`discarded`},()=>m.info(`Job Discarded`,`Job ${e.id} has been marked as discarded.`),e=>m.error(`Discard Failed`,e||`Failed to discard job.`))}constructor(){super(),this.collection=u,this.filter=`all`,this.selectedJob=null,this.isInspectorOpen=!1,this.copied=!1}get collections(){let e=this.workerMouls.data.filter(e=>e.name!==u);return[{name:u,label:`_workers (Built-in)`},...e.map(e=>({name:e.name,label:e.name}))]}willUpdate(){this.workerMouls.isReady&&!this.collections.some(e=>e.name===this.collection)&&(this.collection=u)}get allJobs(){return this.jobs.data}inspect(e){this.selectedJob=e,this.isInspectorOpen=!0}async copyPayload(e){let t=e.payload||l(e);await g(typeof t==`string`?t:JSON.stringify(t,null,2))?(this.copied=!0,window.clearTimeout(this.copiedTimer),this.copiedTimer=window.setTimeout(()=>this.copied=!1,2e3)):m.error(`Copy Failed`,`The browser blocked clipboard access.`)}columns=[{key:`id`,title:`Job ID`,render:e=>r`<span class="mono nowrap" style="color: var(--color-primary-400); font-size: 0.8125rem">${e.id}</span>`},{key:`worker`,title:`Worker`,render:e=>r`<span style="font-weight: 600">${e.worker||`anonymous`}</span>`},{key:`queue`,title:`Queue`,render:e=>r`<span class="mono muted">${e.queue||`default`}</span>`},{key:`state`,title:`Status`,render:e=>b(y(e))},{key:`attempt`,title:`Attempts`,align:`end`,render:e=>{let t=e.attempt??0,n=e.max_attempts??3;return r`<span style="color: ${t>=n?`var(--color-error-500)`:`var(--color-fg-subtle)`}">${t}/${n}</span>`}},{key:`scheduled_at`,title:`Scheduled / Created`,render:e=>{let t=e.scheduled_at||e.createdAt||e.created_at;return r`<span class="muted small nowrap">${t?new Date(t).toLocaleTimeString():`-`}</span>`}},{key:`__actions`,title:`Actions`,align:`end`,render:t=>{let n=y(t),i=n===`retryable`||n===`discarded`||n===`completed`,o=n===`available`||n===`retryable`||n===`executing`,s=!!t.$hasPendingWrites;return r`
          <span class="actions" style="display: inline-flex; gap: var(--spacing-1)">
            <moul-tooltip content="Inspect job">
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Inspect job ${t.id}`} @click=${a(()=>this.inspect(t))}>
                <admin-icon name="eye" size="15"></admin-icon>
              </moul-button>
            </moul-tooltip>
            ${i?r`
                  <moul-button
                    variant="secondary"
                    size="sm"
                    aria-label=${`Retry job ${t.id}`}
                    ?is-disabled=${s}
                    @click=${a(()=>this.retry(t))}
                  >
                    <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                    Retry
                  </moul-button>
                `:e}
            ${o?r`
                  <moul-button
                    variant="danger-soft"
                    size="sm"
                    aria-label=${`Discard job ${t.id}`}
                    ?is-disabled=${s}
                    @click=${a(()=>this.discard(t))}
                  >
                    <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
                    Discard
                  </moul-button>
                `:e}
          </span>
        `}}];renderInspector(){let t=this.selectedJob,n=t&&(this.queue.get(String(t.id))??t);return r`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isInspectorOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(this.isInspectorOpen=e.detail.isOpen)}}
      >
        <div slot="header" class="drawer-title">
          <span class="badge-content" style="gap: var(--spacing-2)">
            Job Inspector ${n?b(String(n.state||``).toLowerCase()):e}
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${a(()=>this.isInspectorOpen=!1)}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>
        ${n?r`
              <div class="inspector">
                <div class="detail"><span class="detail-label">Job ID</span><span class="mono">${n.id}</span></div>
                <div class="detail"><span class="detail-label">Worker Handler</span><strong>${n.worker}</strong></div>
                <div class="detail">
                  <span class="detail-label">Queue & Execution Attempts</span>
                  <span>
                    Queue: <code>${n.queue||`default`}</code> • Attempts:
                    <strong>${n.attempt??0} / ${n.max_attempts??3}</strong>
                  </span>
                </div>
                ${n.last_error?r`
                      <div class="detail">
                        <span class="detail-label" style="color: var(--color-error-500)">Last Error Trace</span>
                        <pre class="error-trace">${n.last_error}</pre>
                      </div>
                    `:e}
                <div class="detail" style="border: none; padding: 0">
                  <div class="row-between">
                    <span class="detail-label">Job Payload JSON</span>
                    <moul-button variant="ghost" size="sm" @click=${a(()=>this.copyPayload(n))}>
                      <admin-icon
                        slot="prefix"
                        name=${this.copied?`check`:`copy`}
                        size="14"
                        color=${this.copied?`var(--color-success-500)`:``}
                      ></admin-icon>
                      ${this.copied?`Copied`:`Copy`}
                    </moul-button>
                  </div>
                  <pre class="code">${JSON.stringify(x(n),null,2)}</pre>
                </div>
                <div class="detail">
                  <span class="detail-label">Timestamps</span>
                  <span class="muted" style="font-size: 0.8125rem">
                    Created: ${S(n.createdAt||n.created_at)}<br />
                    Updated: ${S(n.updatedAt||n.updated_at)}<br />
                    Scheduled: ${S(n.scheduled_at)}
                  </span>
                </div>
              </div>
            `:e}
        <moul-button slot="footer" variant="outline" @click=${a(()=>this.isInspectorOpen=!1)}>Close</moul-button>
        ${n?r`
              <moul-button
                slot="footer"
                variant="danger-soft"
                ?is-disabled=${n.state===`discarded`||!!n.$hasPendingWrites}
                @click=${a(()=>this.discard(n))}
              >
                <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
                Discard Job
              </moul-button>
              <moul-button
                slot="footer"
                variant="primary"
                ?is-disabled=${!!n.$hasPendingWrites}
                @click=${a(()=>this.retry(n))}
              >
                <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                Retry Job
              </moul-button>
            `:e}
      </moul-drawer>
    `}render(){let t=this.allJobs,n=this.filter===`all`?t:t.filter(e=>y(e)===this.filter),i=this.collections;return r`
      ${p(`Worker Queue`,`Monitor background jobs, queues, and retries.`,r`
          <moul-badge tone="success">
            <span class="badge-content">
              <admin-icon name="check-circle" weight="fill" size="14"></admin-icon>
              Engine Running
            </span>
          </moul-badge>
        `)}

      <moul-card>
        <moul-card-header>
          <div class="card-header">
            <span class="card-title">
              <admin-icon name="queue" size="20" color="var(--color-primary-500)"></admin-icon>
              Queue (${n.length})
            </span>
            <span class="toolbar">
              ${i.length>1?r`
                    <moul-select
                      aria-label="Worker Collection"
                      selected-key=${this.collection}
                      @selectionchange=${e=>{e.detail.selectedKey&&(this.collection=e.detail.selectedKey)}}
                    >
                      ${i.map(e=>r`<moul-select-item key=${e.name}>${e.label}</moul-select-item>`)}
                    </moul-select>
                  `:e}
              <moul-button variant="secondary" @click=${a(()=>this.queue.utils.refetch())}>
                <admin-icon slot="prefix" name="arrows-clockwise" size="14"></admin-icon>
                Refresh
              </moul-button>
            </span>
          </div>
        </moul-card-header>
        <moul-card-body>
          <div class="filters">
            ${_.map(e=>{let n=e===`all`?t.length:t.filter(t=>y(t)===e).length,i=e===`all`?`All`:e.charAt(0).toUpperCase()+e.slice(1);return r`
                <moul-button variant=${this.filter===e?`primary`:`outline`} size="sm" @click=${a(()=>this.filter=e)}>
                  ${i} (${n})
                </moul-button>
              `})}
          </div>
          <admin-data-table aria-label="Worker Jobs Table" dense .columns=${this.columns} .rows=${n} ?loading=${this.jobs.isLoading}>
            <moul-empty-state slot="empty">
              <admin-icon slot="icon" name="queue" size="32" color="var(--color-fg-subtle)"></admin-icon>
              <span slot="title">No jobs found</span>
              <span slot="description">
                ${this.filter===`all`?`No background jobs in ${this.collection}.`:`No jobs currently marked as ${this.filter}.`}
              </span>
            </moul-empty-state>
          </admin-data-table>
        </moul-card-body>
      </moul-card>

      <moul-card>
        <moul-card-header>
          <span class="card-title">
            <admin-icon name="clock" size="20" color="var(--color-warning-500)"></admin-icon>
            Built-in Registered Workers
          </span>
        </moul-card-header>
        <moul-card-body>
          <div class="worker-list">
            ${v.map(e=>r`
                <div class="worker">
                  <div>
                    <span class="worker-name">${e.name}</span>
                    <div class="worker-description">${e.description}</div>
                  </div>
                  <moul-badge tone="primary">Active</moul-badge>
                </div>
              `)}
          </div>
        </moul-card-body>
      </moul-card>

      ${this.renderInspector()}
    `}};customElements.define(`admin-workers-page`,C);export{C as AdminWorkersPage};