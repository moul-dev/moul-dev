import { css, html, LitElement, nothing } from 'lit';
import { api } from '../api/client';
import '../components/data-table';
import type { DataColumn } from '../components/data-table';
import '../components/records/export-modal';
import '../components/records/import-modal';
import '../components/records/record-drawer';
import {
  displayFieldsFor,
  getFileName,
  getFileUrl,
  getRecordDisplayLabel,
  isImageFile,
  workerStateTone,
} from '../components/records/record-helpers';
import { fieldValue } from '../lib/forms';
import { onPress } from '../lib/press';
import { MutationController, QueryController, queryClient } from '../lib/query';
import { router } from '../lib/router';
import { StoreController } from '../lib/store';
import { toast } from '../lib/toast';
import { baseStyles } from '../styles/base';
import { pageStyles } from '../styles/page';

type Rec = Record<string, any>;

const RETRYABLE_STATES = new Set(['failed', 'discarded', 'retryable', 'completed']);

/** Search params of the records grid (the React route validated the same shape with zod). */
function readSearch(params: URLSearchParams) {
  const int = (key: string, fallback: number) => {
    const n = Number.parseInt(params.get(key) ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    page: int('page', 1),
    perPage: int('perPage', 30),
    sort: params.get('sort') || undefined,
    filter: params.get('filter') || undefined,
    search: params.get('search') || undefined,
    create: params.get('create') === 'true',
  };
}

/** Chip linking to a related record; opens the target collection's grid in a new tab. */
function relationChip(target: string, id: string, label: string) {
  return html`
    <a
      class="chip"
      href=${router.href(`/records/${encodeURIComponent(target)}`, { page: 1, perPage: 30, search: id })}
      target="_blank"
      rel="noopener"
      title=${`Target: ${target} · ID: ${id}`}
      style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border: 1px solid var(--color-primary-500); border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-fg); font-size: var(--font-size-xs); text-decoration: none"
    >
      <admin-icon name="link" size="12" color="var(--color-primary-500)"></admin-icon>
      ${label}
    </a>
  `;
}

const dash = html`<span class="muted">-</span>`;

/** Grid cell for one schema field, by type. */
function renderValue(f: any, rec: Rec) {
  const val = rec[f.name];
  if (f.type === 'file') {
    if (!val) return dash;
    const url = getFileUrl(val);
    const name = getFileName(val);
    return html`
      <span style="display: inline-flex; align-items: center; gap: 0.5rem">
        ${isImageFile(val) && url
          ? html`
              <a href=${url} target="_blank" rel="noopener noreferrer" title=${`View ${name}`} style="display: inline-flex">
                <img
                  src=${url}
                  alt=${name}
                  style="width: 28px; height: 28px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border-subtle)"
                />
              </a>
            `
          : html`<admin-icon name="file" size="18" color="var(--color-primary-500)"></admin-icon>`}
        ${url
          ? html`
              <a
                href=${url}
                target="_blank"
                rel="noopener noreferrer"
                title=${name}
                class="small nowrap"
                style="display: inline-flex; align-items: center; gap: 0.25rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; color: var(--color-primary-500); text-decoration: none"
              >
                ${name}
                <admin-icon name="arrow-square-out" size="11"></admin-icon>
              </a>
            `
          : html`<span class="small">${name}</span>`}
      </span>
    `;
  }
  if (f.type === 'relation') {
    if (!val || (Array.isArray(val) && val.length === 0)) return dash;
    const target = f.relationConfig?.targetMoul || '';
    const expanded = rec.expand?.[f.name];
    if ((f.relationConfig?.cardinality || '1:N') === 'M:N') {
      const ids: string[] = Array.isArray(val) ? val.map(String) : [String(val)];
      const expandedList: any[] = Array.isArray(expanded) ? expanded : [];
      return html`
        <span style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center">
          ${ids.map((id, i) => {
            const item = expandedList.find((e) => String(e.id) === id) || expandedList[i];
            return relationChip(target, id, item ? getRecordDisplayLabel(item) : id);
          })}
        </span>
      `;
    }
    const id = String(val);
    return relationChip(target, id, expanded ? getRecordDisplayLabel(expanded) : id);
  }
  if (val === null || val === undefined || (f.type === 'cloak' && val === '')) return dash;
  if (f.type === 'cloak') {
    return html`
      <moul-badge variant="bordered">
        <admin-icon slot="prefix" name="lock" size="12"></admin-icon>
        ${String(val)}
      </moul-badge>
    `;
  }
  if (typeof val === 'boolean') return html`<moul-badge tone=${val ? 'success' : 'error'}>${String(val)}</moul-badge>`;
  const text = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return html`<span class="truncate ${typeof val === 'object' ? 'mono small' : ''}" title=${text}>${text}</span>`;
}

/** Records grid of one collection: search, selection with bulk actions, editing drawer, import/export. */
export class AdminRecordsPage extends LitElement {
  static override styles = [
    baseStyles,
    pageStyles,
    css`
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
    `,
  ];

  static override properties = {
    searchText: { state: true },
    selectedIds: { state: true },
    isDrawerOpen: { state: true },
    drawerRecord: { state: true },
    recordToDelete: { state: true },
    isBatchDeleteOpen: { state: true },
    isBatchDeleting: { state: true },
    isBatchRetrying: { state: true },
    isExportOpen: { state: true },
    isImportOpen: { state: true },
  };

  declare searchText: string;
  declare selectedIds: Set<string>;
  declare isDrawerOpen: boolean;
  declare drawerRecord: Rec | null;
  declare recordToDelete: Rec | null;
  declare isBatchDeleteOpen: boolean;
  declare isBatchDeleting: boolean;
  declare isBatchRetrying: boolean;
  declare isExportOpen: boolean;
  declare isImportOpen: boolean;

  private get moulName(): string {
    return router.location.params.moulName ?? '';
  }

  private get search() {
    return readSearch(router.location.search);
  }

  private readonly moul = new QueryController(this, () => ({
    queryKey: ['moul', this.moulName],
    queryFn: () => api.getMoul(this.moulName),
    enabled: Boolean(this.moulName),
  }));

  /** Relation fields to expand, so cells can show labels instead of IDs. */
  private get expand(): string | undefined {
    const names = (this.moul.data?.fields ?? []).filter((f: any) => f.type === 'relation' && f.name).map((f: any) => f.name);
    return names.length > 0 ? names.join(',') : undefined;
  }

  private readonly records = new QueryController(this, () => {
    const s = this.search;
    const expand = this.expand;
    return {
      queryKey: ['records', this.moulName, s.page, s.perPage, s.sort, s.filter, s.search, expand],
      queryFn: () =>
        api.listRecords(this.moulName, { page: s.page, perPage: s.perPage, sort: s.sort, filter: s.filter, search: s.search, expand }),
      enabled: Boolean(this.moulName),
    };
  });

  private readonly deleteMutation = new MutationController(this, {
    mutationFn: (id: string) => api.deleteRecord(this.moulName, id),
    onSuccess: (_data, id) => {
      this.invalidateRecords();
      this.isDrawerOpen = false;
      if (this.selectedIds.has(String(id))) {
        const next = new Set(this.selectedIds);
        next.delete(String(id));
        this.selectedIds = next;
      }
      toast.info('Record Deleted', 'Record was deleted.');
    },
    onError: (err: any) => toast.error('Delete Failed', err.message || 'Failed to delete record.'),
    onSettled: () => {
      this.recordToDelete = null;
    },
  });

  private readonly retryMutation = new MutationController(this, {
    mutationFn: async (record: Rec) => {
      try {
        return await api.retryJobs(this.moulName, [record.id]);
      } catch {
        return await api.updateRecord(this.moulName, record.id, {
          state: 'available',
          scheduled_at: new Date().toISOString(),
          attempt: 0,
        });
      }
    },
    onSuccess: (_data, record) => {
      this.invalidateRecords();
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
      toast.success('Task Scheduled for Retry', `Worker task ${record.id} marked as available for immediate execution.`);
    },
    onError: (err: any) => toast.error('Retry Failed', err.message || 'Failed to retry worker task.'),
  });

  private lastSearchParam: string | undefined;
  private lastMoulName = '';

  constructor() {
    super();
    this.searchText = '';
    this.selectedIds = new Set();
    this.isDrawerOpen = false;
    this.drawerRecord = null;
    this.recordToDelete = null;
    this.isBatchDeleteOpen = false;
    this.isBatchDeleting = false;
    this.isBatchRetrying = false;
    this.isExportOpen = false;
    this.isImportOpen = false;
    new StoreController(this, router);
  }

  override willUpdate(): void {
    const s = this.search;
    // Keep the search box in step with the URL (back/forward, links with ?search=).
    if (s.search !== this.lastSearchParam) {
      this.lastSearchParam = s.search;
      this.searchText = s.search ?? '';
    }
    // A different collection starts with nothing selected.
    if (this.moulName !== this.lastMoulName) {
      this.lastMoulName = this.moulName;
      this.selectedIds = new Set();
    }
    // ?create=true (the overview's "New Record") opens the create drawer once, then leaves the URL.
    if (s.create) {
      this.openCreate();
      this.setSearch({ create: undefined }, true);
    }
  }

  private get rows(): Rec[] {
    const data = this.records.data;
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.items) ? data.items : [];
  }

  private invalidateRecords() {
    queryClient.invalidateQueries({ queryKey: ['records', this.moulName] });
  }

  private setSearch(patch: Record<string, string | number | boolean | undefined>, replace = false) {
    const s = this.search;
    router.navigate(router.location.pathname, {
      replace,
      search: { page: s.page, perPage: s.perPage, sort: s.sort, filter: s.filter, search: s.search, ...patch },
    });
  }

  private openCreate() {
    this.drawerRecord = null;
    this.isDrawerOpen = true;
  }

  private openDetail(rec: Rec) {
    this.drawerRecord = rec;
    this.isDrawerOpen = true;
  }

  private toggleSelected(ids: string[], selected: boolean) {
    const next = new Set(this.selectedIds);
    for (const id of ids) {
      if (selected) next.add(id);
      else next.delete(id);
    }
    this.selectedIds = next;
  }

  private async batchDelete() {
    const ids = [...this.selectedIds];
    this.isBatchDeleting = true;
    try {
      await Promise.all(ids.map((id) => api.deleteRecord(this.moulName, id)));
      this.invalidateRecords();
      toast.info('Records Deleted', `Successfully deleted ${ids.length} record${ids.length > 1 ? 's' : ''}.`);
      this.selectedIds = new Set();
      this.isBatchDeleteOpen = false;
    } catch (err: any) {
      // Some deletes may have succeeded; refresh so the grid shows what is left.
      this.invalidateRecords();
      toast.error('Batch Delete Failed', err.message || 'Failed to delete selected records.');
    } finally {
      this.isBatchDeleting = false;
    }
  }

  private async batchRetry() {
    const ids = [...this.selectedIds];
    this.isBatchRetrying = true;
    try {
      await api.retryJobs(this.moulName, ids);
      this.invalidateRecords();
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
      toast.success('Tasks Scheduled for Retry', `Successfully scheduled ${ids.length} task${ids.length > 1 ? 's' : ''} for retry.`);
      this.selectedIds = new Set();
    } catch (err: any) {
      toast.error('Batch Retry Failed', err.message || 'Failed to retry selected worker tasks.');
    } finally {
      this.isBatchRetrying = false;
    }
  }

  /** Downloads the selected rows of the current page as JSON, without a server round trip. */
  private exportSelected() {
    const selected = this.rows.filter((r) => this.selectedIds.has(String(r.id)));
    const url = URL.createObjectURL(new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.moulName}-selected-${selected.length}-records.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported Selected', `Downloaded ${selected.length} selected record${selected.length > 1 ? 's' : ''} as JSON.`);
  }

  private columns(type: string, fields: any[]): DataColumn<Rec>[] {
    const rows = this.rows;
    const allSelected = rows.length > 0 && rows.every((r) => this.selectedIds.has(String(r.id)));
    const someSelected = !allSelected && rows.some((r) => this.selectedIds.has(String(r.id)));

    const columns: DataColumn<Rec>[] = [
      {
        key: '__select',
        width: '44px',
        title: html`
          <moul-checkbox
            aria-label="Select all rows on page"
            ?is-checked=${allSelected}
            ?is-indeterminate=${someSelected}
            @change=${(e: CustomEvent<{ isChecked: boolean }>) =>
              this.toggleSelected(
                rows.map((r) => String(r.id)),
                e.detail.isChecked,
              )}
          ></moul-checkbox>
        `,
        render: (rec) => html`
          <moul-checkbox
            aria-label=${`Select record #${rec.id}`}
            ?is-checked=${this.selectedIds.has(String(rec.id))}
            @change=${(e: CustomEvent<{ isChecked: boolean }>) => this.toggleSelected([String(rec.id)], e.detail.isChecked)}
          ></moul-checkbox>
        `,
      },
      {
        key: 'id',
        title: 'ID',
        render: (rec) => html`
          <button type="button" class="cell-link" title=${`Click to view and edit record #${rec.id}`} @click=${() => this.openDetail(rec)}>
            ${String(rec.id)}
          </button>
        `,
      },
    ];

    if (type === 'auth') {
      columns.push(
        { key: 'username', title: 'Username', render: (rec) => rec.username || '-' },
        { key: 'email', title: 'Email', render: (rec) => rec.email || '-' },
      );
    }
    if (type === 'worker') {
      columns.push(
        { key: 'worker', title: 'Worker', render: (rec) => html`<span style="font-weight: 600">${rec.worker || '-'}</span>` },
        {
          key: 'state',
          title: 'State',
          render: (rec) => {
            const tone = workerStateTone(rec.state);
            return tone
              ? html`<moul-badge tone=${tone}>${rec.state || 'available'}</moul-badge>`
              : html`<moul-badge variant="bordered">${rec.state || 'available'}</moul-badge>`;
          },
        },
        { key: 'queue', title: 'Queue', render: (rec) => rec.queue || 'default' },
        {
          key: 'attempt',
          title: 'Attempt',
          align: 'end',
          render: (rec) => {
            const exhausted = (rec.attempt ?? 0) >= (rec.max_attempts ?? 3);
            return html`<span style="color: ${exhausted ? 'var(--color-error-500)' : 'var(--color-fg-subtle)'}">${rec.attempt ?? 0}/${rec.max_attempts ?? 3}</span>`;
          },
        },
      );
    }
    for (const f of fields) {
      columns.push({ key: f.name, title: f.name, render: (rec) => renderValue(f, rec) });
    }
    columns.push(
      {
        key: 'createdAt',
        title: 'Created At',
        render: (rec) => {
          const created = rec.createdAt || rec.created_at || rec.inserted_at;
          return html`<span class="muted small nowrap">${created ? new Date(String(created)).toLocaleString() : '-'}</span>`;
        },
      },
      {
        key: '__actions',
        title: 'Actions',
        align: 'end',
        render: (rec) => {
          const canRetry = type === 'worker' && RETRYABLE_STATES.has(String(rec.state || 'available').toLowerCase());
          const retrying = this.retryMutation.isPending && this.retryMutation.result.variables?.id === rec.id;
          return html`
            <span style="display: inline-flex; align-items: center; gap: 0.25rem">
              ${canRetry
                ? html`
                    <moul-button
                      variant="secondary"
                      size="sm"
                      aria-label=${`Retry task ${rec.id}`}
                      ?is-pending=${retrying}
                      @click=${onPress(() => this.retryMutation.mutate(rec))}
                    >
                      <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                      Retry
                    </moul-button>
                  `
                : nothing}
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`View and edit record ${rec.id}`} @click=${onPress(() => this.openDetail(rec))}>
                <admin-icon name="pencil-simple" size="14"></admin-icon>
              </moul-button>
              <moul-button variant="ghost" is-icon size="sm" aria-label=${`Delete record ${rec.id}`} @click=${onPress(() => (this.recordToDelete = rec))}>
                <admin-icon name="trash" size="14" color="var(--color-error-500)"></admin-icon>
              </moul-button>
            </span>
          `;
        },
      },
    );
    return columns;
  }

  private renderToolbar(totalItems: number) {
    const count = this.selectedIds.size;
    const isWorker = this.moul.data?.type === 'worker';
    return html`
      <moul-card>
        <moul-card-body>
          <div class="toolbar">
            <moul-search-field
              aria-label="Search records"
              placeholder="Search records..."
              .value=${this.searchText}
              @input=${(e: Event) => (this.searchText = fieldValue(e))}
              @submit=${() => this.setSearch({ page: 1, search: this.searchText.trim() || undefined })}
              @clear=${() => this.setSearch({ page: 1, search: undefined })}
            ></moul-search-field>
            ${count > 0
              ? html`
                  <div class="selection">
                    <moul-badge tone="primary">${count} selected</moul-badge>
                    <moul-button variant="ghost" @click=${onPress(() => (this.selectedIds = new Set()))}>Clear</moul-button>
                    <moul-button variant="outline" @click=${onPress(() => this.exportSelected())}>
                      <admin-icon slot="prefix" name="download-simple" size="14"></admin-icon>
                      Export
                    </moul-button>
                    ${isWorker
                      ? html`
                          <moul-button variant="secondary" ?is-pending=${this.isBatchRetrying} @click=${onPress(() => this.batchRetry())}>
                            <admin-icon slot="prefix" name="arrows-counter-clockwise" size="14"></admin-icon>
                            Retry
                          </moul-button>
                        `
                      : nothing}
                    <moul-button variant="danger-soft" @click=${onPress(() => (this.isBatchDeleteOpen = true))}>
                      <admin-icon slot="prefix" name="trash" size="14"></admin-icon>
                      Delete (${count})
                    </moul-button>
                  </div>
                `
              : html`<span class="count">Showing ${this.rows.length} of ${totalItems} record${totalItems !== 1 ? 's' : ''}</span>`}
          </div>
        </moul-card-body>
      </moul-card>
    `;
  }

  private renderDialogs() {
    const count = this.selectedIds.size;
    const rec = this.recordToDelete;
    return html`
      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${rec !== null}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (!e.detail.isOpen) this.recordToDelete = null;
        }}
      >
        <span slot="header">Delete Record</span>
        <p slot="body" class="dialog-text">
          Are you sure you want to delete record <strong>“${rec?.id}”</strong>?<br /><br />This action cannot be undone.
        </p>
        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.recordToDelete = null))}>Cancel</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          ?is-pending=${this.deleteMutation.isPending}
          @click=${onPress(() => {
            if (rec) this.deleteMutation.mutate(String(rec.id));
          })}
        >
          Delete Record
        </moul-button>
      </moul-alert-dialog>

      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${this.isBatchDeleteOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
          if (!e.detail.isOpen) this.isBatchDeleteOpen = false;
        }}
      >
        <span slot="header">Delete ${count} Records</span>
        <p slot="body" class="dialog-text">
          Are you sure you want to delete <strong>${count} selected record${count > 1 ? 's' : ''}</strong> from “${this.moulName}”?
          <br /><br />This action cannot be undone.
        </p>
        <moul-button slot="footer" variant="outline" @click=${onPress(() => (this.isBatchDeleteOpen = false))}>Cancel</moul-button>
        <moul-button slot="footer" variant="danger" ?is-pending=${this.isBatchDeleting} @click=${onPress(() => this.batchDelete())}>
          Delete ${count} Records
        </moul-button>
      </moul-alert-dialog>
    `;
  }

  override render() {
    const name = this.moulName;
    const moul = this.moul.data;
    const type = moul?.type || 'base';
    const s = this.search;
    const rows = this.rows;
    const data = this.records.data;
    const totalItems = data && !Array.isArray(data) && typeof data.totalItems === 'number' ? data.totalItems : rows.length;
    const totalPages = data && !Array.isArray(data) && typeof (data as any).totalPages === 'number' ? Math.max(1, (data as any).totalPages) : 1;
    const fields = displayFieldsFor(moul, rows);

    return html`
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <admin-icon name="database" size="24" color="var(--color-primary-500)"></admin-icon>
            <span class="title-name">${name} Records</span>
            <moul-badge tone="primary">${type}</moul-badge>
          </h1>
          <span class="page-subtitle">Explore records data grid</span>
        </div>
        <div class="page-actions">
          <moul-button variant="outline" @click=${onPress(() => router.navigate(`/collections/${encodeURIComponent(name)}`))}>
            <admin-icon slot="prefix" name="sliders" size="16"></admin-icon>
            Schema & Settings
          </moul-button>
          <moul-button variant="outline" @click=${onPress(() => (this.isExportOpen = true))}>
            <admin-icon slot="prefix" name="download-simple" size="16"></admin-icon>
            Export
          </moul-button>
          <moul-button variant="outline" @click=${onPress(() => (this.isImportOpen = true))}>
            <admin-icon slot="prefix" name="upload-simple" size="16"></admin-icon>
            Import
          </moul-button>
          <moul-button variant="primary" @click=${onPress(() => this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="16"></admin-icon>
            New Record
          </moul-button>
        </div>
      </div>

      ${this.renderToolbar(totalItems)}

      <admin-data-table
        aria-label=${`${name} records table`}
        dense
        skeleton-rows="6"
        .columns=${this.columns(type, fields)}
        .rows=${rows}
        .isRowSelected=${(rec: Rec) => this.selectedIds.has(String(rec.id))}
        ?loading=${this.records.result.isLoading}
      >
        <moul-empty-state slot="empty">
          <admin-icon slot="icon" name="database" size="32" color="var(--color-fg-subtle)"></admin-icon>
          <span slot="title">No records found</span>
          <span slot="description">${s.search?.trim() ? `No records matching "${s.search}".` : `No records in "${name}" yet.`}</span>
          <moul-button slot="actions" variant="primary" @click=${onPress(() => this.openCreate())}>
            <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
            New Record
          </moul-button>
        </moul-empty-state>
      </admin-data-table>

      <div class="pagination">
        <span>Page ${s.page} of ${totalPages}</span>
        <div class="pagination-buttons">
          <moul-button variant="secondary" ?is-disabled=${s.page <= 1} @click=${onPress(() => this.setSearch({ page: Math.max(1, s.page - 1) }))}>
            <admin-icon slot="prefix" name="caret-left" size="14"></admin-icon>
            Previous
          </moul-button>
          <moul-button variant="secondary" ?is-disabled=${s.page >= totalPages} @click=${onPress(() => this.setSearch({ page: s.page + 1 }))}>
            Next
            <admin-icon slot="suffix" name="caret-right" size="14"></admin-icon>
          </moul-button>
        </div>
      </div>

      <admin-record-drawer
        moul-name=${name}
        ?is-open=${this.isDrawerOpen}
        .moul=${moul}
        .fields=${fields}
        .record=${this.drawerRecord}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => (this.isDrawerOpen = e.detail.isOpen)}
        @deleterequest=${(e: CustomEvent<{ record: Rec }>) => (this.recordToDelete = e.detail.record)}
      ></admin-record-drawer>

      ${this.renderDialogs()}

      <admin-export-modal
        moul-name=${name}
        active-filter=${s.filter ?? ''}
        active-search=${s.search ?? ''}
        total-records=${totalItems}
        ?is-open=${this.isExportOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => (this.isExportOpen = e.detail.isOpen)}
      ></admin-export-modal>

      <admin-import-modal
        moul-name=${name}
        ?is-open=${this.isImportOpen}
        @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => (this.isImportOpen = e.detail.isOpen)}
        @imported=${() => this.invalidateRecords()}
      ></admin-import-modal>
    `;
  }
}

customElements.define('admin-records-page', AdminRecordsPage);

declare global {
  interface HTMLElementTagNameMap {
    'admin-records-page': AdminRecordsPage;
  }
}
