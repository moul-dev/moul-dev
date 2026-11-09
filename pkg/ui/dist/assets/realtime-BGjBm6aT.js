import{l as e,n as t,o as n,r,t as i}from"./press-CVc8c9H4.js";import{l as a}from"./query-DdOx0cLf.js";import{n as o,o as s,r as c}from"./client-DaTS5Mxb.js";import{t as l}from"./live-query-CaUrZsz9.js";import{i as u}from"./index-BTyfsV_n.js";import{n as d,t as f}from"./page-C5Uax4jB.js";function p(e){let{url:t,token:n,adminKey:r,ticket:i,onConnected:a,onMessage:o,onError:s,signal:c,reconnect:l=!0,reconnectIntervalMs:u=3e3}=e,d=!0,f=new AbortController;c&&c.addEventListener(`abort`,()=>{d=!1,f.abort()});function p(e,t,n){let r=e.split(`
`),i=`message`,a=``;for(let e of r)if(!e.startsWith(`:`)){if(e.startsWith(`event:`))i=e.slice(6).trim();else if(e.startsWith(`data:`)){let t=e.slice(5).trim();a=a?`${a}\n${t}`:t}}if(a)try{let e=JSON.parse(a);i===`connected`?t&&t(e):n&&n({action:e.action||i,moul:e.moul||``,record:e.record||e,oldRecord:e.old_record||e.oldRecord,timestamp:e.timestamp||new Date().toISOString(),raw:a})}catch{n&&n({action:i,moul:``,raw:a})}}return(async()=>{for(;d;){try{let e={Accept:`text/event-stream`};n&&(e.Authorization=`Bearer ${n}`),r&&(e[`X-Admin-Key`]=r);let s=t;if(i){let e=s.includes(`?`)?`&`:`?`;s=`${s}${e}ticket=${encodeURIComponent(i)}`}let c=await fetch(s,{method:`GET`,headers:e,signal:f.signal});if(!c.ok){let e=await c.text();throw Error(e||`SSE connection failed with status ${c.status}`)}if(!c.body)throw Error(`ReadableStream not supported on this response`);let l=c.body.getReader(),u=new TextDecoder(`utf-8`),m=``;for(;d;){let{done:e,value:t}=await l.read();if(e)break;m+=u.decode(t,{stream:!0});let n=m.split(`

`);m=n.pop()||``;for(let e of n)e.trim()&&p(e,a,o)}}catch(e){if(!d||e?.name===`AbortError`)return;s&&s(e instanceof Error?e:Error(String(e)))}if(!d||!l)break;await new Promise(e=>setTimeout(e,u))}})(),()=>{d=!1,f.abort()}}var m=200;function h(e){switch(e){case`delete`:return`warn`;case`create`:return`info`;default:return`debug`}}var g=()=>`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,_=class extends r{static styles=[t,d,e`
      :host {
        --page-gap: var(--spacing-4);
      }

      .badge-content {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-3);
        width: 100%;
      }

      .controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-3);
      }

      moul-select {
        width: 280px;
        max-width: 100%;
      }
    `];static properties={selectedMoul:{state:!0},isStreaming:{state:!0},events:{state:!0}};mouls=new l(this,e=>e.from({moul:u}));unsubscribe;constructor(){super(),this.selectedMoul=`*`,this.isStreaming=!0,this.events=[]}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this.resubscribe()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0}updated(e){(e.has(`selectedMoul`)||e.has(`isStreaming`))&&this.resubscribe()}pushEvent(e){this.events=[e,...this.events].slice(0,m)}resubscribe(){if(this.unsubscribe?.(),this.unsubscribe=void 0,!this.isStreaming)return;let e=this.selectedMoul,t=s(e===`*`?`/api/moul/subscribe`:`/api/moul/${e}/subscribe`);this.unsubscribe=p({url:t,token:o(),adminKey:c(),onMessage:t=>{let n=t.action||`mutation`,r=t.moul||e,i=t.record,a=i?.id?String(i.id):``;this.pushEvent({id:g(),timestamp:new Date().toLocaleTimeString(),level:h(n),message:`[${r}] ${n.toUpperCase()} record: ${a||`new`}`,attributes:{collection:r,action:n,recordId:a||void 0},raw:t.raw||JSON.stringify(i,null,2)})},onError:e=>{this.pushEvent({id:g(),timestamp:new Date().toLocaleTimeString(),level:`error`,message:`Stream error: ${e.message}`,raw:String(e)})}})}render(){let e=this.mouls.data;return n`
      ${f(`Realtime Hub`,`Live record events and mutation stream.`,n`
          <moul-badge tone=${this.isStreaming?`success`:`error`}>
            <span class="badge-content">
              <admin-icon name="broadcast" weight="bold" size="14"></admin-icon>
              ${this.isStreaming?`Connected`:`Disconnected`}
            </span>
          </moul-badge>
        `)}

      <moul-card>
        <moul-card-body>
          <div class="toolbar">
            <div class="controls">
              <!-- A select, not the React page's combobox: <moul-combobox> filters its list by the
                   selected item's text, so reopening it would show only that one collection. -->
              <moul-select
                aria-label="Select Collection"
                placeholder="Select Collection"
                selected-key=${this.selectedMoul}
                @selectionchange=${e=>{e.detail.selectedKey&&(this.selectedMoul=e.detail.selectedKey)}}
              >
                <moul-select-item key="*">All collections</moul-select-item>
                ${a(e,e=>e.name,e=>n`<moul-select-item key=${e.name}>${e.name}</moul-select-item>`)}
              </moul-select>
              <moul-button variant=${this.isStreaming?`danger`:`primary`} @click=${i(()=>this.isStreaming=!this.isStreaming)}>
                <admin-icon slot="prefix" name=${this.isStreaming?`stop`:`play`} size="14"></admin-icon>
                ${this.isStreaming?`Disconnect`:`Connect`}
              </moul-button>
            </div>
            <moul-button variant="ghost" aria-label="Clear Stream Logs" @click=${i(()=>this.events=[])}>
              <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
              Clear (${this.events.length})
            </moul-button>
          </div>
        </moul-card-body>
      </moul-card>

      <moul-logs-viewer
        title="Event Stream"
        max-height="640px"
        search-placeholder="Filter events or record ID..."
        .logs=${this.events}
        @clear=${()=>this.events=[]}
      ></moul-logs-viewer>
    `}};customElements.define(`admin-realtime-page`,_);export{_ as AdminRealtimePage};