import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { baseStyles } from '../styles/base';

export interface DataColumn<Row> {
  key: string;
  title: string;
  /** `end` right-aligns the column with tabular figures, for numbers. */
  align?: 'start' | 'end';
  width?: string;
  /**
   * Cell content; defaults to `String(row[key])`. The template renders in the table's shadow
   * root: use its `.mono`, `.muted`, `.small` and `.nowrap` classes or inline styles, not page
   * classes.
   */
  render?: (row: Row, index: number) => unknown;
}

/**
 * Table with per-column cell templates, styled to match `<moul-table>`, which can only print
 * plain strings. Rows go in `rows`; put an empty state in the `empty` slot.
 *
 *   <admin-data-table aria-label="Requests" .columns=${columns} .rows=${rows} ?loading=${isLoading}>
 *     <moul-empty-state slot="empty">…</moul-empty-state>
 *   </admin-data-table>
 */
export class AdminDataTable<Row = Record<string, unknown>> extends LitElement {
  static override styles = [
    baseStyles,
    css`
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

      .empty-cell {
        padding: var(--spacing-6);
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
    `,
  ];

  static override properties = {
    columns: { attribute: false },
    rows: { attribute: false },
    rowKey: { attribute: false },
    loading: { type: Boolean },
    skeletonRows: { type: Number, attribute: 'skeleton-rows' },
    dense: { type: Boolean, reflect: true },
  };

  declare columns: DataColumn<Row>[];
  declare rows: Row[];
  declare rowKey: (row: Row, index: number) => string;
  declare loading: boolean;
  declare skeletonRows: number;
  declare dense: boolean;

  constructor() {
    super();
    this.columns = [];
    this.rows = [];
    this.rowKey = (row, index) => String((row as { id?: unknown }).id ?? index);
    this.loading = false;
    this.skeletonRows = 5;
    this.dense = false;
  }

  private renderBody() {
    if (this.loading) {
      return Array.from(
        { length: this.skeletonRows },
        () => html`
          <tr>
            ${this.columns.map(() => html`<td><moul-skeleton shape="line" height="1.25rem"></moul-skeleton></td>`)}
          </tr>
        `,
      );
    }
    if (this.rows.length === 0) {
      return html`
        <tr>
          <td class="empty-cell" colspan=${this.columns.length}><slot name="empty">No data available</slot></td>
        </tr>
      `;
    }
    return repeat(
      this.rows,
      this.rowKey,
      (row, index) => html`
        <tr class="row">
          ${this.columns.map(
            (column) => html`
              <td class=${column.align === 'end' ? 'end' : ''}>
                ${column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.key] ?? '')}
              </td>
            `,
          )}
        </tr>
      `,
    );
  }

  override render() {
    return html`
      <table aria-label=${this.getAttribute('aria-label') ?? nothing}>
        <thead>
          <tr>
            ${this.columns.map(
              (column) => html`
                <th class=${column.align === 'end' ? 'end' : ''} style=${column.width ? `width: ${column.width}` : nothing}>
                  ${column.title}
                </th>
              `,
            )}
          </tr>
        </thead>
        <tbody>
          ${this.renderBody()}
        </tbody>
      </table>
    `;
  }
}

customElements.define('admin-data-table', AdminDataTable);

declare global {
  interface HTMLElementTagNameMap {
    'admin-data-table': AdminDataTable;
  }
}
