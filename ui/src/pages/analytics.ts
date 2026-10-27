import { css, html, LitElement, type PropertyValues } from 'lit';
import { api } from '../api/client';
import '../components/data-table';
import type { DataColumn } from '../components/data-table';
import { onPress } from '../lib/press';
import { QueryController } from '../lib/query';
import { baseStyles } from '../styles/base';
import { pageHeader, pageStyles } from '../styles/page';

type Row = Record<string, any>;

const timestampOf = (row: Row) => row.createdAt || row.created_at;
const statusOf = (row: Row) => Number(row.status || row.statusCode || 200);

interface Bucket {
  time: string;
  success: number;
  error: number;
}

// Dummy baseline points so the chart keeps its shape before any traffic arrives.
const EMPTY_SERIES: Bucket[] = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((time) => ({
  time,
  success: 0,
  error: 0,
}));

const CHART_SERIES = [
  { key: 'success', name: 'Success (2xx/3xx)', color: 'var(--color-success-500)' },
  { key: 'error', name: 'Errors (4xx/5xx)', color: 'var(--color-error-500)' },
];

/** Requests per HH:MM bucket, split into successes and errors. */
function bucketRequests(requests: Row[]): Bucket[] {
  if (requests.length === 0) return EMPTY_SERIES;
  const sorted = [...requests].sort(
    (a, b) => new Date(timestampOf(a) || 0).getTime() - new Date(timestampOf(b) || 0).getTime(),
  );
  const buckets = new Map<string, Bucket>();
  for (const r of sorted) {
    const date = timestampOf(r) ? new Date(timestampOf(r)) : new Date();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bucket = buckets.get(time) || { time, success: 0, error: 0 };
    if (statusOf(r) >= 400) {
      bucket.error += 1;
    } else {
      bucket.success += 1;
    }
    buckets.set(time, bucket);
  }
  return buckets.size > 0 ? [...buckets.values()] : [{ time: 'Now', success: 0, error: 0 }];
}

/** The six most frequent values of `pick(row)`, as TopList items. */
function topCounts(rows: Row[], pick: (row: Row) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = pick(row);
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

const requestColumns: DataColumn<Row>[] = [
  {
    key: 'status',
    title: 'Status',
    render: (r) => html`<moul-badge tone=${statusOf(r) >= 400 ? 'error' : 'success'}>${statusOf(r)}</moul-badge>`,
  },
  { key: 'method', title: 'Method', render: (r) => html`<moul-badge variant="bordered">${r.method || 'GET'}</moul-badge>` },
  { key: 'path', title: 'Path', render: (r) => html`<span class="mono">${r.path || r.url || '/'}</span>` },
  { key: 'ip', title: 'IP Address', render: (r) => html`<span class="mono muted">${r.ip || '127.0.0.1'}</span>` },
  {
    key: 'duration',
    title: 'Duration',
    align: 'end',
    render: (r) => html`<span class="muted">${r.duration ? `${r.duration}ms` : '<1ms'}</span>`,
  },
  {
    key: 'createdAt',
    title: 'Timestamp',
    render: (r) =>
      html`<span class="muted small nowrap">${timestampOf(r) ? new Date(timestampOf(r)).toLocaleTimeString() : '-'}</span>`,
  },
];

const visitColumns: DataColumn<Row>[] = [
  {
    key: 'id',
    title: 'Session ID',
    render: (v) => html`<span class="mono nowrap" style="color: var(--color-primary-400)">${v.id}</span>`,
  },
  { key: 'ip', title: 'IP & Location', render: (v) => `${v.ip ?? ''} ${v.country ? `(${v.country})` : ''}` },
  { key: 'landing_page', title: 'Landing Page', render: (v) => v.landing_page || '/' },
  { key: 'referrer', title: 'Referrer', render: (v) => html`<span class="muted">${v.referrer || 'Direct'}</span>` },
  {
    key: 'createdAt',
    title: 'First Seen',
    render: (v) =>
      html`<span class="muted small nowrap">${timestampOf(v) ? new Date(timestampOf(v)).toLocaleString() : '-'}</span>`,
  },
];

/** Request telemetry: headline stats, a traffic chart, top endpoints and referrers, raw logs. */
export class AdminAnalyticsPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
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
    `,
  ];

  static override properties = {
    activeTab: { state: true },
  };

  declare activeTab: 'requests' | 'visits';

  private readonly requests = new QueryController(this, () => ({
    queryKey: ['requests'],
    queryFn: () => api.listRequests({ perPage: 100 }),
    refetchInterval: 10000,
  }));

  private readonly visits = new QueryController(this, () => ({
    queryKey: ['visits'],
    queryFn: () => api.listVisits({ perPage: 100 }),
    refetchInterval: 10000,
  }));

  // Derived from the query data in willUpdate, the counterpart of the React page's useMemo.
  private requestRows: Row[] = [];
  private visitRows: Row[] = [];
  private series: Bucket[] = EMPTY_SERIES;
  private topPaths: { label: string; value: number }[] = [];
  private topReferrers: { label: string; value: number }[] = [];
  private stats = { avgDuration: 0, errorRate: '0.0' };

  constructor() {
    super();
    this.activeTab = 'requests';
  }

  override willUpdate(_changed: PropertyValues): void {
    const reqData = this.requests.data;
    const visitData = this.visits.data;
    const requestRows: Row[] = Array.isArray(reqData) ? reqData : reqData?.items || [];
    const visitRows: Row[] = Array.isArray(visitData) ? visitData : visitData?.items || [];

    if (requestRows !== this.requestRows) {
      this.requestRows = requestRows;
      this.series = bucketRequests(requestRows);
      this.topPaths = topCounts(requestRows, (r) => r.path || r.url || '/');
      const total = requestRows.length;
      const totalDuration = requestRows.reduce((sum, r) => sum + Number(r.duration || 0), 0);
      const errors = requestRows.filter((r) => statusOf(r) >= 400).length;
      this.stats = {
        avgDuration: total > 0 ? Math.round(totalDuration / total) : 0,
        errorRate: total > 0 ? ((errors / total) * 100).toFixed(1) : '0.0',
      };
    }
    if (visitRows !== this.visitRows) {
      this.visitRows = visitRows;
      this.topReferrers = topCounts(visitRows, (v) => v.referrer || 'Direct / Bookmark');
    }
  }

  private refresh() {
    this.requests.refetch();
    this.visits.refetch();
  }

  private renderRequestsTable() {
    return html`
      <admin-data-table
        aria-label="HTTP Request Logs"
        dense
        .columns=${requestColumns}
        .rows=${this.requestRows}
        ?loading=${this.requests.result.isLoading}
      >
        <moul-empty-state slot="empty">
          <admin-icon slot="icon" name="chart-line-up" size="32" color="var(--color-fg-subtle)"></admin-icon>
          <span slot="title">No requests recorded</span>
          <span slot="description">Incoming API and page traffic will appear here automatically.</span>
        </moul-empty-state>
      </admin-data-table>
    `;
  }

  private renderVisits() {
    return html`
      <div class="visits">
        ${this.topReferrers.length > 0
          ? html`
              <moul-card>
                <moul-card-header>
                  <div class="card-title">
                    <admin-icon name="globe" size="18" color="var(--color-primary-500)"></admin-icon>
                    <span>Top Referrers & Traffic Sources</span>
                  </div>
                </moul-card-header>
                <moul-card-body>
                  <moul-top-list multi-color .data=${this.topReferrers} .valueFormatter=${(v: number) => `${v} visits`}></moul-top-list>
                </moul-card-body>
              </moul-card>
            `
          : ''}
        <admin-data-table
          aria-label="Visitor Sessions"
          dense
          .columns=${visitColumns}
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
    `;
  }

  override render() {
    const { avgDuration, errorRate } = this.stats;

    return html`
      ${pageHeader(
        'Analytics & Request Logs',
        'Traffic, latency, and visitor telemetry.',
        html`
          <moul-button variant="outline" @click=${onPress(() => this.refresh())}>
            <admin-icon slot="prefix" name="arrows-clockwise" size="14"></admin-icon>
            Refresh
          </moul-button>
        `,
      )}

      <div class="stats">
        <moul-stat label="TOTAL REQUESTS" description="Sampled HTTP requests" .value=${this.requestRows.length}>
          <admin-icon slot="icon" name="chart-line-up" size="20" color="var(--color-primary-500)"></admin-icon>
        </moul-stat>
        <moul-stat label="AVG LATENCY" description="Mean backend processing time" suffix="ms" .value=${avgDuration}>
          <admin-icon slot="icon" name="clock" size="20" color="var(--color-success-500)"></admin-icon>
        </moul-stat>
        <moul-stat label="ERROR RATE" description="4xx and 5xx responses" suffix="%" .value=${Number(errorRate)}>
          <admin-icon
            slot="icon"
            name="warning-circle"
            size="20"
            color=${Number(errorRate) > 5 ? 'var(--color-error-500)' : 'var(--color-fg-subtle)'}
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
            .series=${CHART_SERIES}
            .valueFormatter=${(v: number) => `${v} reqs`}
          ></moul-area-chart>
          <div slot="legend">
            ${CHART_SERIES.map(
              (s) => html`<span class="legend-item"><span class="legend-dot" style="background: ${s.color}"></span>${s.name}</span>`,
            )}
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
            ${this.topPaths.length === 0
              ? html`<div class="no-data">No endpoint data recorded yet.</div>`
              : html`<moul-top-list multi-color .data=${this.topPaths} .valueFormatter=${(v: number) => `${v} hits`}></moul-top-list>`}
          </moul-card-body>
        </moul-card>
      </div>

      <moul-tabs
        selected-key=${this.activeTab}
        @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
          if (e.target === e.currentTarget) this.activeTab = e.detail.selectedKey as 'requests' | 'visits';
        }}
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
    `;
  }
}

customElements.define('admin-analytics-page', AdminAnalyticsPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-analytics-page': AdminAnalyticsPage;
  }
}
