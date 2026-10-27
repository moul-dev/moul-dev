import{C as e,c as t,d as n,l as r,r as i,t as a,u as o,v as s,x as c,y as l}from"./index-RipJGQkD.js";import"./data-table-D9L3z-YW.js";import{n as u,t as d}from"./page-BkXVDI8g.js";import{t as f}from"./toast-CFk4KYOX.js";import{c as p,t as m}from"./record-helpers--GpKp9o_.js";var h=[`all`,`available`,`executing`,`completed`,`retryable`,`discarded`],g=`_workers`,_=[{name:`SendEmail`,description:`Asynchronous transactional email dispatcher`},{name:`DeliverWebhook`,description:`HTTP webhook payload delivery with exponential backoff`}],v=e=>String(e.state||`available`).toLowerCase();function y(e){let t=p(e);return t?c`<moul-badge tone=${t}>${e}</moul-badge>`:c`<moul-badge variant="bordered">${e}</moul-badge>`}function b(e){if(!e.payload)return e;if(typeof e.payload!=`string`)return e.payload;try{return JSON.parse(e.payload)}catch{return e.payload}}var x=e=>e?new Date(String(e)).toLocaleString():`N/A`,S=class extends s{static styles=[i,u,e`
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
    `];static properties={collection:{state:!0},filter:{state:!0},selectedJob:{state:!0},isInspectorOpen:{state:!0},copied:{state:!0}};copiedTimer;mouls=new r(this,()=>({queryKey:[`mouls`],queryFn:n.listMouls}));jobs=new r(this,()=>{let e=this.collection;return{queryKey:[`workerJobs`,e],queryFn:()=>e===g?n.listWorkers({perPage:100,sort:`-createdAt`}):n.listRecords(e,{perPage:100,sort:`-createdAt`}),refetchInterval:5e3}});updateJob(e,t){return this.collection===g?n.updateWorkerJob(e.id,t):n.updateRecord(this.collection,e.id,t)}retryMutation=new t(this,{mutationFn:e=>this.updateJob(e,{state:`available`,scheduled_at:new Date().toISOString()}),onSuccess:(e,t)=>{o.invalidateQueries({queryKey:[`workerJobs`]}),f.success(`Job Retried`,`Job ${t.id} marked as available for immediate processing.`),this.selectedJob?.id===t.id&&(this.selectedJob={...this.selectedJob,state:`available`})},onError:e=>f.error(`Retry Failed`,e.message||`Failed to retry job.`)});discardMutation=new t(this,{mutationFn:e=>this.updateJob(e,{state:`discarded`}),onSuccess:(e,t)=>{o.invalidateQueries({queryKey:[`workerJobs`]}),f.info(`Job Discarded`,`Job ${t.id} has been marked as discarded.`),this.selectedJob?.id===t.id&&(this.selectedJob={...this.selectedJob,state:`discarded`})},onError:e=>f.error(`Discard Failed`,e.message||`Failed to discard job.`)});constructor(){super(),this.collection=g,this.filter=`all`,this.selectedJob=null,this.isInspectorOpen=!1,this.copied=!1}get collections(){let e=(this.mouls.data??[]).filter(e=>e.type===`worker`&&e.name!==g);return[{name:g,label:`_workers (Built-in)`},...e.map(e=>({name:e.name,label:e.name}))]}willUpdate(){this.mouls.data&&!this.collections.some(e=>e.name===this.collection)&&(this.collection=g)}get allJobs(){let e=this.jobs.data;return Array.isArray(e)?e:e?.items||[]}inspect(e){this.selectedJob=e,this.isInspectorOpen=!0}async copyPayload(e){let t=e.payload||e;await m(typeof t==`string`?t:JSON.stringify(t,null,2))?(this.copied=!0,window.clearTimeout(this.copiedTimer),this.copiedTimer=window.setTimeout(()=>this.copied=!1,2e3)):f.error(`Copy Failed`,`The browser blocked clipboard access.`)}columns=[{key:`id`,title:`Job ID`,render:e=>c`<span class="mono nowrap" style="color: var(--color-primary-400); font-size: 0.8125rem">${e.id}</span>`},{key:`worker`,title:`Worker`,render:e=>c`<span style="font-weight: 600">${e.worker||`anonymous`}</span>`},{key:`queue`,title:`Queue`,render:e=>c`<span class="mono muted">${e.queue||`default`}</span>`},{key:`state`,title:`Status`,render:e=>y(v(e))},{key:`attempt`,title:`Attempts`,align:`end`,render:e=>{let t=e.attempt??0,n=e.max_attempts??3;return c`<span style="color: ${t>=n?`var(--color-error-500)`:`var(--color-fg-subtle)`}">${t}/${n}</span>`}},{key:`scheduled_at`,title:`Scheduled / Created`,render:e=>{let t=e.scheduled_at||e.createdAt||e.created_at;return c`<span class="muted small nowrap">${t?new Date(t).toLocaleTimeString():`-`}</span>`}},{key:`__actions`,title:`Actions`,align:`end`,render:e=>{let t=v(e),n=t===`retryable`||t===`discarded`||t===`completed`,r=t===`available`||t===`retryable`||t===`executing`,i=this.retryMutation.isPending&&this.retryMutation.result.variables?.id===e.id,o=this.discardMutation.isPending&&this.discardMutation.result.variables?.id===e.id;return c`
          <span class="actions" style="display: inline-flex; gap: var(--spacing-1)">
            <moul-button variant="ghost" is-icon size="sm" aria-label=${`Inspect job ${e.id}`} @click=${a(()=>this.inspect(e))}>
              <admin-icon name="eye" size="15"></admin-icon>
            </moul-button>
            ${n?c`
                  <moul-button
                    variant="secondary"
                    size="sm"
                    aria-label=${`Retry job ${e.id}`}
                    ?is-pending=${i}
                    @click=${a(()=>this.retryMutation.mutate(e))}
                  >
                    <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                    Retry
                  </moul-button>
                `:l}
            ${r?c`
                  <moul-button
                    variant="danger-soft"
                    size="sm"
                    aria-label=${`Discard job ${e.id}`}
                    ?is-pending=${o}
                    @click=${a(()=>this.discardMutation.mutate(e))}
                  >
                    <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
                    Discard
                  </moul-button>
                `:l}
          </span>
        `}}];renderInspector(){let e=this.selectedJob;return c`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isInspectorOpen}
        @openchange=${e=>{e.target===e.currentTarget&&(this.isInspectorOpen=e.detail.isOpen)}}
      >
        <div slot="header" class="drawer-title">
          <span class="badge-content" style="gap: var(--spacing-2)">
            Job Inspector ${e?y(String(e.state||``).toLowerCase()):l}
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${a(()=>this.isInspectorOpen=!1)}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>
        ${e?c`
              <div class="inspector">
                <div class="detail"><span class="detail-label">Job ID</span><span class="mono">${e.id}</span></div>
                <div class="detail"><span class="detail-label">Worker Handler</span><strong>${e.worker}</strong></div>
                <div class="detail">
                  <span class="detail-label">Queue & Execution Attempts</span>
                  <span>
                    Queue: <code>${e.queue||`default`}</code> • Attempts:
                    <strong>${e.attempt??0} / ${e.max_attempts??3}</strong>
                  </span>
                </div>
                ${e.last_error?c`
                      <div class="detail">
                        <span class="detail-label" style="color: var(--color-error-500)">Last Error Trace</span>
                        <pre class="error-trace">${e.last_error}</pre>
                      </div>
                    `:l}
                <div class="detail" style="border: none; padding: 0">
                  <div class="row-between">
                    <span class="detail-label">Job Payload JSON</span>
                    <moul-button variant="ghost" size="sm" @click=${a(()=>this.copyPayload(e))}>
                      <admin-icon
                        slot="prefix"
                        name=${this.copied?`check`:`copy`}
                        size="14"
                        color=${this.copied?`var(--color-success-500)`:``}
                      ></admin-icon>
                      ${this.copied?`Copied`:`Copy`}
                    </moul-button>
                  </div>
                  <pre class="code">${JSON.stringify(b(e),null,2)}</pre>
                </div>
                <div class="detail">
                  <span class="detail-label">Timestamps</span>
                  <span class="muted" style="font-size: 0.8125rem">
                    Created: ${x(e.createdAt||e.created_at)}<br />
                    Updated: ${x(e.updatedAt||e.updated_at)}<br />
                    Scheduled: ${x(e.scheduled_at)}
                  </span>
                </div>
              </div>
            `:l}
        <moul-button slot="footer" variant="outline" @click=${a(()=>this.isInspectorOpen=!1)}>Close</moul-button>
        ${e?c`
              <moul-button
                slot="footer"
                variant="danger-soft"
                ?is-disabled=${e.state===`discarded`}
                ?is-pending=${this.discardMutation.isPending}
                @click=${a(()=>this.discardMutation.mutate(e))}
              >
                <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
                Discard Job
              </moul-button>
              <moul-button slot="footer" variant="primary" ?is-pending=${this.retryMutation.isPending} @click=${a(()=>this.retryMutation.mutate(e))}>
                <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                Retry Job
              </moul-button>
            `:l}
      </moul-drawer>
    `}render(){let e=this.allJobs,t=this.filter===`all`?e:e.filter(e=>v(e)===this.filter),n=this.collections;return c`
      ${d(`Worker Queue`,`Monitor background jobs, queues, and retries.`,c`
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
              Queue (${t.length})
            </span>
            <span class="toolbar">
              ${n.length>1?c`
                    <moul-select
                      aria-label="Worker Collection"
                      selected-key=${this.collection}
                      @selectionchange=${e=>{e.detail.selectedKey&&(this.collection=e.detail.selectedKey)}}
                    >
                      ${n.map(e=>c`<moul-select-item key=${e.name}>${e.label}</moul-select-item>`)}
                    </moul-select>
                  `:l}
              <moul-button variant="secondary" @click=${a(()=>this.jobs.refetch())}>
                <admin-icon slot="prefix" name="arrows-clockwise" size="14"></admin-icon>
                Refresh
              </moul-button>
            </span>
          </div>
        </moul-card-header>
        <moul-card-body>
          <div class="filters">
            ${h.map(t=>{let n=t===`all`?e.length:e.filter(e=>v(e)===t).length,r=t===`all`?`All`:t.charAt(0).toUpperCase()+t.slice(1);return c`
                <moul-button variant=${this.filter===t?`primary`:`outline`} size="sm" @click=${a(()=>this.filter=t)}>
                  ${r} (${n})
                </moul-button>
              `})}
          </div>
          <admin-data-table aria-label="Worker Jobs Table" dense .columns=${this.columns} .rows=${t} ?loading=${this.jobs.result.isLoading}>
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
            ${_.map(e=>c`
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
    `}};customElements.define(`admin-workers-page`,S);export{S as AdminWorkersPage};