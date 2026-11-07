import{c as e,n as t,o as n,r,t as i}from"./press-BQyLhwVv.js";import{n as a}from"./query-DEj2kaNm.js";import{t as o}from"./client-DaTS5Mxb.js";import"./data-table-kOkcDszi.js";import{n as s,t as c}from"./page-ITe5xmEa.js";var l=e=>e.createdAt||e.created_at,u=e=>Number(e.status||e.statusCode||200),d=[`00:00`,`04:00`,`08:00`,`12:00`,`16:00`,`20:00`].map(e=>({time:e,success:0,error:0})),f=[{key:`success`,name:`Success (2xx/3xx)`,color:`var(--color-success-500)`},{key:`error`,name:`Errors (4xx/5xx)`,color:`var(--color-error-500)`}];function p(e){if(e.length===0)return d;let t=[...e].sort((e,t)=>new Date(l(e)||0).getTime()-new Date(l(t)||0).getTime()),n=new Map;for(let e of t){let t=(l(e)?new Date(l(e)):new Date).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`}),r=n.get(t)||{time:t,success:0,error:0};u(e)>=400?r.error+=1:r.success+=1,n.set(t,r)}return n.size>0?[...n.values()]:[{time:`Now`,success:0,error:0}]}function m(e,t){let n=new Map;for(let r of e){let e=t(r);n.set(e,(n.get(e)||0)+1)}return[...n.entries()].map(([e,t])=>({label:e,value:t})).sort((e,t)=>t.value-e.value).slice(0,6)}var h=[{key:`status`,title:`Status`,render:e=>n`<moul-badge tone=${u(e)>=400?`error`:`success`}>${u(e)}</moul-badge>`},{key:`method`,title:`Method`,render:e=>n`<moul-badge variant="bordered">${e.method||`GET`}</moul-badge>`},{key:`path`,title:`Path`,render:e=>n`<span class="mono">${e.path||e.url||`/`}</span>`},{key:`ip`,title:`IP Address`,render:e=>n`<span class="mono muted">${e.ip||`127.0.0.1`}</span>`},{key:`duration`,title:`Duration`,align:`end`,render:e=>n`<span class="muted">${e.duration?`${e.duration}ms`:`<1ms`}</span>`},{key:`createdAt`,title:`Timestamp`,render:e=>n`<span class="muted small nowrap">${l(e)?new Date(l(e)).toLocaleTimeString():`-`}</span>`}],g=[{key:`id`,title:`Session ID`,render:e=>n`<span class="mono nowrap" style="color: var(--color-primary-400)">${e.id}</span>`},{key:`ip`,title:`IP & Location`,render:e=>`${e.ip??``} ${e.country?`(${e.country})`:``}`},{key:`landing_page`,title:`Landing Page`,render:e=>e.landing_page||`/`},{key:`referrer`,title:`Referrer`,render:e=>n`<span class="muted">${e.referrer||`Direct`}</span>`},{key:`createdAt`,title:`First Seen`,render:e=>n`<span class="muted small nowrap">${l(e)?new Date(l(e)).toLocaleString():`-`}</span>`}],_=class extends r{static styles=[t,s,e`
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--spacing-4);
      }

      .charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 9999px;
      }

      .no-data {
        padding: var(--spacing-4);
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }

      .tab-label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .visits {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
      }
    `];static properties={activeTab:{state:!0}};requests=new a(this,()=>({queryKey:[`requests`],queryFn:()=>o.listRequests({perPage:100}),refetchInterval:1e4}));visits=new a(this,()=>({queryKey:[`visits`],queryFn:()=>o.listVisits({perPage:100}),refetchInterval:1e4}));requestRows=[];visitRows=[];series=d;topPaths=[];topReferrers=[];stats={avgDuration:0,errorRate:`0.0`};constructor(){super(),this.activeTab=`requests`}willUpdate(e){let t=this.requests.data,n=this.visits.data,r=Array.isArray(t)?t:t?.items||[],i=Array.isArray(n)?n:n?.items||[];if(r!==this.requestRows){this.requestRows=r,this.series=p(r),this.topPaths=m(r,e=>e.path||e.url||`/`);let e=r.length,t=r.reduce((e,t)=>e+Number(t.duration||0),0),n=r.filter(e=>u(e)>=400).length;this.stats={avgDuration:e>0?Math.round(t/e):0,errorRate:e>0?(n/e*100).toFixed(1):`0.0`}}i!==this.visitRows&&(this.visitRows=i,this.topReferrers=m(i,e=>e.referrer||`Direct / Bookmark`))}refresh(){this.requests.refetch(),this.visits.refetch()}renderRequestsTable(){return n`
      <admin-data-table
        aria-label="HTTP Request Logs"
        dense
        .columns=${h}
        .rows=${this.requestRows}
        ?loading=${this.requests.result.isLoading}
      >
        <moul-empty-state slot="empty">
          <admin-icon slot="icon" name="chart-line-up" size="32" color="var(--color-fg-subtle)"></admin-icon>
          <span slot="title">No requests recorded</span>
          <span slot="description">Incoming API and page traffic will appear here automatically.</span>
        </moul-empty-state>
      </admin-data-table>
    `}renderVisits(){return n`
      <div class="visits">
        ${this.topReferrers.length>0?n`
              <moul-card>
                <moul-card-header>
                  <div class="card-title">
                    <admin-icon name="globe" size="18" color="var(--color-primary-500)"></admin-icon>
                    <span>Top Referrers & Traffic Sources</span>
                  </div>
                </moul-card-header>
                <moul-card-body>
                  <moul-top-list multi-color .data=${this.topReferrers} .valueFormatter=${e=>`${e} visits`}></moul-top-list>
                </moul-card-body>
              </moul-card>
            `:``}
        <admin-data-table
          aria-label="Visitor Sessions"
          dense
          .columns=${g}
          .rows=${this.visitRows}
          ?loading=${this.visits.result.isLoading}
        >
          <moul-empty-state slot="empty">
            <admin-icon slot="icon" name="globe" size="32" color="var(--color-fg-subtle)"></admin-icon>
            <span slot="title">No visits recorded</span>
            <span slot="description">Visitor telemetry and session tracking will show up here.</span>
          </moul-empty-state>
        </admin-data-table>
      </div>
    `}render(){let{avgDuration:e,errorRate:t}=this.stats;return n`
      ${c(`Analytics & Request Logs`,`Traffic, latency, and visitor telemetry.`,n`
          <moul-button variant="outline" @click=${i(()=>this.refresh())}>
            <admin-icon slot="prefix" name="arrows-clockwise" size="14"></admin-icon>
            Refresh
          </moul-button>
        `)}

      <div class="stats">
        <moul-stat label="TOTAL REQUESTS" description="Sampled HTTP requests" .value=${this.requestRows.length}>
          <admin-icon slot="icon" name="chart-line-up" size="20" color="var(--color-primary-500)"></admin-icon>
        </moul-stat>
        <moul-stat label="AVG LATENCY" description="Mean backend processing time" suffix="ms" .value=${e}>
          <admin-icon slot="icon" name="clock" size="20" color="var(--color-success-500)"></admin-icon>
        </moul-stat>
        <moul-stat label="ERROR RATE" description="4xx and 5xx responses" suffix="%" .value=${Number(t)}>
          <admin-icon
            slot="icon"
            name="warning-circle"
            size="20"
            color=${Number(t)>5?`var(--color-error-500)`:`var(--color-fg-subtle)`}
          ></admin-icon>
        </moul-stat>
        <moul-stat label="VISITOR SESSIONS" description="Tracked client sessions" .value=${this.visitRows.length}>
          <admin-icon slot="icon" name="users" size="20" color="var(--color-primary-500)"></admin-icon>
        </moul-stat>
      </div>

      <div class="charts">
        <moul-chart-container title="Requests Over Time" description="Throughput breakdown by status">
          <moul-area-chart
            x-key="time"
            height="220"
            .data=${this.series}
            .series=${f}
            .valueFormatter=${e=>`${e} reqs`}
          ></moul-area-chart>
          <div slot="legend">
            ${f.map(e=>n`<span class="legend-item"><span class="legend-dot" style="background: ${e.color}"></span>${e.name}</span>`)}
          </div>
        </moul-chart-container>

        <moul-card>
          <moul-card-header>
            <div class="card-title">
              <admin-icon name="compass" size="18" color="var(--color-primary-500)"></admin-icon>
              <span>Top Requested Endpoints</span>
            </div>
          </moul-card-header>
          <moul-card-body>
            ${this.topPaths.length===0?n`<div class="no-data">No endpoint data recorded yet.</div>`:n`<moul-top-list multi-color .data=${this.topPaths} .valueFormatter=${e=>`${e} hits`}></moul-top-list>`}
          </moul-card-body>
        </moul-card>
      </div>

      <moul-tabs
        selected-key=${this.activeTab}
        @selectionchange=${e=>{e.target===e.currentTarget&&(this.activeTab=e.detail.selectedKey)}}
      >
        <moul-tab slot="tab" key="requests">
          <span class="tab-label">
            <admin-icon name="list-bullets" size="16"></admin-icon>
            HTTP Request Logs (${this.requestRows.length})
          </span>
        </moul-tab>
        <moul-tab slot="tab" key="visits">
          <span class="tab-label">
            <admin-icon name="globe" size="16"></admin-icon>
            Visitor Sessions (${this.visitRows.length})
          </span>
        </moul-tab>
        <moul-tab-panel key="requests">${this.renderRequestsTable()}</moul-tab-panel>
        <moul-tab-panel key="visits">${this.renderVisits()}</moul-tab-panel>
      </moul-tabs>
    `}};customElements.define(`admin-analytics-page`,_);export{_ as AdminAnalyticsPage};