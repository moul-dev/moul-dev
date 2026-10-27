import{C as e,r as t,v as n,x as r,y as i}from"./index-RipJGQkD.js";import{t as a}from"./repeat-CCJXDy8Q.js";var o=class extends n{static styles=[t,e`
      :host {
        display: block;
        width: 100%;
        overflow-x: auto;
        padding: 0 var(--spacing-1) var(--spacing-1);
        border-radius: min(2rem, calc(var(--radius-base, 0.5rem) * 2.5));
        background-color: var(--color-surface-secondary);
        font-family: var(--font-family-base);
        scrollbar-width: thin;
        scrollbar-color: var(--color-scrollbar-thumb) transparent;
        --_row-separator: color-mix(
          in oklab,
          color-mix(in oklab, var(--color-surface) 81%, var(--color-fg) 19%) 50%,
          transparent
        );
        --_body-radius: var(--radius-2xl, 1rem);
        --_cell-pad-block: var(--spacing-3);
      }

      :host([dense]) {
        --_cell-pad-block: var(--spacing-2);
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: var(--font-size-sm);
        line-height: var(--line-height-sm);
        color: var(--color-fg);
      }

      th {
        position: relative;
        padding: 0.625rem var(--spacing-4);
        font-size: var(--font-size-xs);
        line-height: var(--line-height-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-muted);
        text-align: start;
        white-space: nowrap;
      }

      th:not(:last-child)::after {
        content: '';
        position: absolute;
        inset-inline-end: 0;
        top: 50%;
        width: 1px;
        height: 1rem;
        transform: translateY(-50%);
        background-color: var(--color-separator);
      }

      td {
        padding: var(--_cell-pad-block) var(--spacing-4);
        vertical-align: middle;
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--_row-separator);
      }

      .end {
        text-align: end;
        font-variant-numeric: tabular-nums;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:first-child td:first-child {
        border-start-start-radius: var(--_body-radius);
      }

      tbody tr:first-child td:last-child {
        border-start-end-radius: var(--_body-radius);
      }

      tbody tr:last-child td:first-child {
        border-end-start-radius: var(--_body-radius);
      }

      tbody tr:last-child td:last-child {
        border-end-end-radius: var(--_body-radius);
      }

      @media (hover: hover) {
        tbody tr.row:hover td {
          background-color: color-mix(in oklab, var(--color-surface) 40%, transparent);
        }
      }

      tbody tr.row[aria-selected='true'] td {
        background-color: color-mix(in oklab, var(--color-surface) 10%, transparent);
      }

      /* Outside the table so it spans the visible width, not the scroll width, on narrow screens */
      .empty {
        position: sticky;
        inset-inline-start: 0;
        padding: var(--spacing-6);
        border-radius: var(--_body-radius);
        background-color: var(--color-surface);
        text-align: center;
        color: var(--color-muted);
      }

      /* Utilities for render() templates, which land in this shadow root, not the page's */
      .mono {
        font-family: var(--font-mono);
      }

      .muted {
        color: var(--color-fg-subtle);
      }

      .small {
        font-size: 0.8125rem;
      }

      .nowrap {
        white-space: nowrap;
      }

      /* One line, cut with an ellipsis; pair with a title attribute for the full value */
      .truncate {
        display: inline-block;
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      }

      /* A cell value that opens something, e.g. the record ID that opens the editor */
      .cell-link {
        padding: 3px 7px;
        border-radius: var(--radius-sm);
        border: 1px solid transparent;
        background: transparent;
        color: var(--color-primary-500);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .cell-link:hover {
        border-color: var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        color: var(--color-primary-400);
      }

      .cell-link:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }
    `];static properties={columns:{attribute:!1},rows:{attribute:!1},rowKey:{attribute:!1},isRowSelected:{attribute:!1},loading:{type:Boolean},skeletonRows:{type:Number,attribute:`skeleton-rows`},dense:{type:Boolean,reflect:!0}};constructor(){super(),this.columns=[],this.rows=[],this.rowKey=(e,t)=>String(e.id??t),this.isRowSelected=void 0,this.loading=!1,this.skeletonRows=5,this.dense=!1}renderBody(){return this.loading?Array.from({length:this.skeletonRows},()=>r`
          <tr>
            ${this.columns.map(()=>r`<td><moul-skeleton shape="line" height="1.25rem"></moul-skeleton></td>`)}
          </tr>
        `):a(this.rows,this.rowKey,(e,t)=>r`
        <tr class="row" aria-selected=${this.isRowSelected?String(this.isRowSelected(e)):i}>
          ${this.columns.map(n=>r`
              <td class=${n.align===`end`?`end`:``}>
                ${n.render?n.render(e,t):String(e[n.key]??``)}
              </td>
            `)}
        </tr>
      `)}render(){return r`
      <table aria-label=${this.getAttribute(`aria-label`)??i}>
        <thead>
          <tr>
            ${this.columns.map(e=>r`
                <th class=${e.align===`end`?`end`:``} style=${e.width?`width: ${e.width}`:i}>
                  ${e.title}
                </th>
              `)}
          </tr>
        </thead>
        <tbody>
          ${this.renderBody()}
        </tbody>
      </table>
      ${!this.loading&&this.rows.length===0?r`<div class="empty"><slot name="empty">No data available</slot></div>`:i}
    `}};customElements.define(`admin-data-table`,o);