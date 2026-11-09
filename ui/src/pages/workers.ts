import { eq } from '@tanstack/db';
import { css, html, LitElement, nothing } from 'lit';
import { BUILT_IN_WORKERS as BUILT_IN, moulsCollection, withoutVirtualProps, workerJobsCollection } from '../api/db';
import '../components/data-table';
import type { DataColumn } from '../components/data-table';
import { copyText, workerStateTone } from '../components/records/record-helpers';
import { LiveQueryController } from '../lib/live-query';
import { onPress } from '../lib/press';
import { toast } from '../lib/toast';
import { baseStyles } from '../styles/base';
import { pageHeader, pageStyles } from '../styles/page';

type Job = Record<string, any>;
type StateFilter = 'all' | 'available' | 'executing' | 'completed' | 'retryable' | 'discarded';

const FILTERS: StateFilter[] = ['all', 'available', 'executing', 'completed', 'retryable', 'discarded'];

const BUILT_IN_WORKERS = [
  { name: 'SendEmail', description: 'Asynchronous transactional email dispatcher' },
  { name: 'DeliverWebhook', description: 'HTTP webhook payload delivery with exponential backoff' },
];

const stateOf = (job: Job) => String(job.state || 'available').toLowerCase();

function stateBadge(state: string) {
  const tone = workerStateTone(state);
  return tone ? html`<moul-badge tone=${tone}>${state}</moul-badge>` : html`<moul-badge variant="bordered">${state}</moul-badge>`;
}

/** The job's payload, parsed when it is a JSON string; the whole job when it has none. */
function payloadOf(job: Job): unknown {
  if (!job.payload) return withoutVirtualProps(job);
  if (typeof job.payload !== 'string') return job.payload;
  try {
    return JSON.parse(job.payload);
  } catch {
    return job.payload;
  }
}

const when = (value: unknown) => (value ? new Date(String(value)).toLocaleString() : 'N/A');

/** Background jobs of the built-in queue or a worker collection, with retry, discard and an inspector. */
export class AdminWorkersPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
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
    `,
  ];

  static override properties = {
    collection: { state: true },
    filter: { state: true },
    selectedJob: { state: true },
    isInspectorOpen: { state: true },
    copied: { state: true },
  };

  declare collection: string;
  declare filter: StateFilter;
  declare selectedJob: Job | null;
  declare isInspectorOpen: boolean;
  declare copied: boolean;

  private copiedTimer?: number;

  private readonly workerMouls = new LiveQueryController(this, (q) =>
    q.from({ moul: moulsCollection }).where(({ moul }) => eq(moul.type, 'worker')),
  );

  /** The selected queue's latest jobs, polled every 5 seconds. */
  private get queue() {
    return workerJobsCollection(this.collection);
  }

  // Newest first, as the server sends them, so polled-in jobs land on top.
  private readonly jobs = new LiveQueryController(
    this,
    (q) =>
      q
        .from({ job: this.queue })
        .orderBy(({ job }) => job.createdAt, 'desc')
        .orderBy(({ job }) => job.id, 'asc'),
    () => [this.queue],
  );

  /** Moves the job to `changes` at once; the badge and buttons spring back if the server refuses. */
  private async setJobState(job: Job, changes: Record<string, unknown>, done: () => void, failed: (message: string) => void) {
    try {
      await this.queue.update(String(job.id), (draft) => Object.assign(draft, changes)).when('settled');
      done();
    } catch (err: any) {
      failed(err?.message);
    }
  }

  private retry(job: Job) {
    return this.setJobState(
      job,
      { state: 'available', scheduled_at: new Date().toISOString() },
      () => toast.success('Job Retried', `Job ${job.id} marked as available for immediate processing.`),
      (message) => toast.error('Retry Failed', message || 'Failed to retry job.'),
    );
  }

  private discard(job: Job) {
    return this.setJobState(
      job,
      { state: 'discarded' },
      () => toast.info('Job Discarded', `Job ${job.id} has been marked as discarded.`),
      (message) => toast.error('Discard Failed', message || 'Failed to discard job.'),
    );
  }

  constructor() {
    super();
    this.collection = BUILT_IN;
    this.filter = 'all';
    this.selectedJob = null;
    this.isInspectorOpen = false;
    this.copied = false;
  }

  private get collections() {
    const userWorkers = this.workerMouls.data.filter((m) => m.name !== BUILT_IN);
    return [{ name: BUILT_IN, label: '_workers (Built-in)' }, ...userWorkers.map((m) => ({ name: m.name, label: m.name }))];
  }

  override willUpdate(): void {
    // Fall back to the built-in queue when the selected worker collection disappears.
    if (this.workerMouls.isReady && !this.collections.some((c) => c.name === this.collection)) this.collection = BUILT_IN;
  }

  private get allJobs(): Job[] {
    return this.jobs.data;
  }

  private inspect(job: Job) {
    this.selectedJob = job;
    this.isInspectorOpen = true;
  }

  private async copyPayload(job: Job) {
    const payload = job.payload || withoutVirtualProps(job);
    if (!(await copyText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)))) {
      toast.error('Copy Failed', 'The browser blocked clipboard access.');
      return;
    }
    this.copied = true;
    window.clearTimeout(this.copiedTimer);
    this.copiedTimer = window.setTimeout(() => (this.copied = false), 2000);
  }

  private readonly columns: DataColumn<Job>[] = [
    {
      key: 'id',
      title: 'Job ID',
      render: (job) => html`<span class="mono nowrap" style="color: var(--color-primary-400); font-size: 0.8125rem">${job.id}</span>`,
    },
    { key: 'worker', title: 'Worker', render: (job) => html`<span style="font-weight: 600">${job.worker || 'anonymous'}</span>` },
    { key: 'queue', title: 'Queue', render: (job) => html`<span class="mono muted">${job.queue || 'default'}</span>` },
    { key: 'state', title: 'Status', render: (job) => stateBadge(stateOf(job)) },
    {
      key: 'attempt',
      title: 'Attempts',
      align: 'end',
      render: (job) => {
        const attempt = job.attempt ?? 0;
        const max = job.max_attempts ?? 3;
        return html`<span style="color: ${attempt >= max ? 'var(--color-error-500)' : 'var(--color-fg-subtle)'}">${attempt}/${max}</span>`;
      },
    },
    {
      key: 'scheduled_at',
      title: 'Scheduled / Created',
      render: (job) => {
        const at = job.scheduled_at || job.createdAt || job.created_at;
        return html`<span class="muted small nowrap">${at ? new Date(at).toLocaleTimeString() : '-'}</span>`;
      },
    },
    {
      key: '__actions',
      title: 'Actions',
      align: 'end',
      render: (job) => {
        const state = stateOf(job);
        const canRetry = state === 'retryable' || state === 'discarded' || state === 'completed';
        const canDiscard = state === 'available' || state === 'retryable' || state === 'executing';
        // A state change still on its way to the server; another click would race it.
        const saving = Boolean(job.$hasPendingWrites);
        return html`
          <span class="actions" style="display: inline-flex; gap: var(--spacing-1)">
            <moul-tooltip content="Inspect job">
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Inspect job ${job.id}`} @click=${onPress(() => this.inspect(job))}>
                <admin-icon name="eye" size="15"></admin-icon>
              </moul-button>
            </moul-tooltip>
            ${canRetry
              ? html`
                  <moul-button
                    variant="secondary"
                    size="sm"
                    aria-label=${`Retry job ${job.id}`}
                    ?is-disabled=${saving}
                    @click=${onPress(() => this.retry(job))}
                  >
                    <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                    Retry
                  </moul-button>
                `
              : nothing}
            ${canDiscard
              ? html`
                  <moul-button
                    variant="danger-soft"
                    size="sm"
                    aria-label=${`Discard job ${job.id}`}
                    ?is-disabled=${saving}
                    @click=${onPress(() => this.discard(job))}
                  >
                    <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
                    Discard
                  </moul-button>
                `
              : nothing}
          </span>
        `;
      },
    },
  ];

  private renderInspector() {
    // The live row, so the inspector follows polling and optimistic changes; the snapshot once it leaves the queue.
    const selected = this.selectedJob;
    const job = selected && (this.queue.get(String(selected.id)) ?? selected);
    return html`
      <moul-drawer
        placement="right"
        size="md"
        ?is-open=${this.isInspectorOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (e.target === e.currentTarget) this.isInspectorOpen = e.detail.isOpen;
        }}
      >
        <div slot="header" class="drawer-title">
          <span class="badge-content" style="gap: var(--spacing-2)">
            Job Inspector ${job ? stateBadge(String(job.state || '').toLowerCase()) : nothing}
          </span>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${onPress(() => (this.isInspectorOpen = false))}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>
        ${job
          ? html`
              <div class="inspector">
                <div class="detail"><span class="detail-label">Job ID</span><span class="mono">${job.id}</span></div>
                <div class="detail"><span class="detail-label">Worker Handler</span><strong>${job.worker}</strong></div>
                <div class="detail">
                  <span class="detail-label">Queue & Execution Attempts</span>
                  <span>
                    Queue: <code>${job.queue || 'default'}</code> • Attempts:
                    <strong>${job.attempt ?? 0} / ${job.max_attempts ?? 3}</strong>
                  </span>
                </div>
                ${job.last_error
                  ? html`
                      <div class="detail">
                        <span class="detail-label" style="color: var(--color-error-500)">Last Error Trace</span>
                        <pre class="error-trace">${job.last_error}</pre>
                      </div>
                    `
                  : nothing}
                <div class="detail" style="border: none; padding: 0">
                  <div class="row-between">
                    <span class="detail-label">Job Payload JSON</span>
                    <moul-button variant="ghost" size="sm" @click=${onPress(() => this.copyPayload(job))}>
                      <admin-icon
                        slot="prefix"
                        name=${this.copied ? 'check' : 'copy'}
                        size="14"
                        color=${this.copied ? 'var(--color-success-500)' : ''}
                      ></admin-icon>
                      ${this.copied ? 'Copied' : 'Copy'}
                    </moul-button>
                  </div>
                  <pre class="code">${JSON.stringify(payloadOf(job), null, 2)}</pre>
                </div>
                <div class="detail">
                  <span class="detail-label">Timestamps</span>
                  <span class="muted" style="font-size: 0.8125rem">
                    Created: ${when(job.createdAt || job.created_at)}<br />
                    Updated: ${when(job.updatedAt || job.updated_at)}<br />
                    Scheduled: ${when(job.scheduled_at)}
                  </span>
                </div>
              </div>
            `
          : nothing}
        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.isInspectorOpen = false))}>Close</moul-button>
        ${job
          ? html`
              <moul-button
                slot="footer"
                variant="danger-soft"
                ?is-disabled=${job.state === 'discarded' || Boolean(job.$hasPendingWrites)}
                @click=${onPress(() => this.discard(job))}
              >
                <admin-icon slot="prefix" name="prohibit" size="14"></admin-icon>
                Discard Job
              </moul-button>
              <moul-button
                slot="footer"
                variant="primary"
                ?is-disabled=${Boolean(job.$hasPendingWrites)}
                @click=${onPress(() => this.retry(job))}
              >
                <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                Retry Job
              </moul-button>
            `
          : nothing}
      </moul-drawer>
    `;
  }

  override render() {
    const all = this.allJobs;
    const jobs = this.filter === 'all' ? all : all.filter((j) => stateOf(j) === this.filter);
    const collections = this.collections;

    return html`
      ${pageHeader(
        'Worker Queue',
        'Monitor background jobs, queues, and retries.',
        html`
          <moul-badge tone="success">
            <span class="badge-content">
              <admin-icon name="check-circle" weight="fill" size="14"></admin-icon>
              Engine Running
            </span>
          </moul-badge>
        `,
      )}

      <moul-card>
        <moul-card-header>
          <div class="card-header">
            <span class="card-title">
              <admin-icon name="queue" size="20" color="var(--color-primary-500)"></admin-icon>
              Queue (${jobs.length})
            </span>
            <span class="toolbar">
              ${collections.length > 1
                ? html`
                    <moul-select
                      aria-label="Worker Collection"
                      selected-key=${this.collection}
                      @selectionchange=${(e: CustomEvent<{ selectedKey: string }>) => {
                        if (e.detail.selectedKey) this.collection = e.detail.selectedKey;
                      }}
                    >
                      ${collections.map((c) => html`<moul-select-item key=${c.name}>${c.label}</moul-select-item>`)}
                    </moul-select>
                  `
                : nothing}
              <moul-button variant="secondary" @click=${onPress(() => this.queue.utils.refetch())}>
                <admin-icon slot="prefix" name="arrows-clockwise" size="14"></admin-icon>
                Refresh
              </moul-button>
            </span>
          </div>
        </moul-card-header>
        <moul-card-body>
          <div class="filters">
            ${FILTERS.map((f) => {
              const count = f === 'all' ? all.length : all.filter((j) => stateOf(j) === f).length;
              const label = f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1);
              return html`
                <moul-button variant=${this.filter === f ? 'primary' : 'outline'} size="sm" @click=${onPress(() => (this.filter = f))}>
                  ${label} (${count})
                </moul-button>
              `;
            })}
          </div>
          <admin-data-table aria-label="Worker Jobs Table" dense .columns=${this.columns} .rows=${jobs} ?loading=${this.jobs.isLoading}>
            <moul-empty-state slot="empty">
              <admin-icon slot="icon" name="queue" size="32" color="var(--color-fg-subtle)"></admin-icon>
              <span slot="title">No jobs found</span>
              <span slot="description">
                ${this.filter === 'all' ? `No background jobs in ${this.collection}.` : `No jobs currently marked as ${this.filter}.`}
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
            ${BUILT_IN_WORKERS.map(
              (w) => html`
                <div class="worker">
                  <div>
                    <span class="worker-name">${w.name}</span>
                    <div class="worker-description">${w.description}</div>
                  </div>
                  <moul-badge tone="primary">Active</moul-badge>
                </div>
              `,
            )}
          </div>
        </moul-card-body>
      </moul-card>

      ${this.renderInspector()}
    `;
  }
}

customElements.define('admin-workers-page', AdminWorkersPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-workers-page': AdminWorkersPage;
  }
}
