// TanStack DB collections over the admin API. Pages read them with live queries
// (`LiveQueryController`) and write through them: `insert`/`update`/`delete` apply optimistically,
// the handlers below persist the change, and a failed write rolls back on its own.
import { type Collection, createCollection } from '@tanstack/db';
import { hashKey, type QueryKey } from '@tanstack/query-core';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import type { MoulRules } from '../components/collections/rules-editor';
import { queryClient } from '../lib/query';
import type { MoulField } from '../utils/fields';
import { api } from './client';

type Row = Record<string, any>;

/** A collection schema as `/api/moul` returns it. */
export type Moul = { id?: string; name: string; type: string; fields?: MoulField[]; rules?: MoulRules; [key: string]: any };

export type FeatureFlag = { id?: string; key: string; description?: string; enabled?: boolean; [key: string]: any };

/** Server-side paging, sorting and filtering of one records grid. */
export type RecordsQuery = { page?: number; perPage?: number; sort?: string; filter?: string; search?: string; expand?: string };

/** The built-in job queue, served by `/api/workers` rather than the records API. */
export const BUILT_IN_WORKERS = '_workers';

const VIRTUAL_PROPS = ['$key', '$origin', '$collectionId', '$hasPendingWrites'];

/** The row without the `$`-props TanStack DB adds, for JSON views, exports and form state. */
export function withoutVirtualProps<T extends Row>(row: T): T {
  const plain: Row = { ...row };
  for (const prop of VIRTUAL_PROPS) delete plain[prop];
  return plain as T;
}

/** List endpoints answer with a bare array or a `{ items, totalItems, … }` page. */
const rowsOf = (data: any): Row[] => (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);

/** Waits for every write, then reports the first failure, so one bad row doesn't hide the others' success. */
async function firstFailure(writes: Promise<unknown>[]): Promise<unknown> {
  const results = await Promise.allSettled(writes);
  return results.find((r): r is PromiseRejectedResult => r.status === 'rejected')?.reason;
}

// Every collection, so signing out can drop their rows along with the query cache.
const live = new Set<Collection<any, any, any>>();

function register<T extends Collection<any, any, any>>(collection: T, onCleanedUp?: () => void): T {
  live.add(collection);
  if (onCleanedUp) {
    collection.on('status:change', ({ status }) => {
      if (status !== 'cleaned-up') return;
      live.delete(collection);
      onCleanedUp();
    });
  }
  return collection;
}

/** Stops every collection's sync and drops its rows, so the next session starts clean. */
export function resetCollections(): void {
  for (const collection of live) collection.cleanup({ dependents: true }).catch(() => {});
}

export const moulsCollection = register(
  createCollection(
    queryCollectionOptions({
      id: 'mouls',
      queryKey: ['mouls'],
      queryFn: (): Promise<Moul[]> => api.listMouls(),
      queryClient,
      getKey: (moul: Moul) => moul.name,
      onInsert: async ({ transaction, collection }) => {
        for (const { modified } of transaction.mutations) {
          await collection.utils.writeInsert(await api.createMoul(modified));
        }
      },
      onUpdate: async ({ transaction, collection }) => {
        // The endpoint is a partial update, so properties left out (webhooks, email templates) keep their values.
        for (const { key, changes } of transaction.mutations) await api.updateMoul(key, changes);
        // The saved schema can differ from what was sent (default auth rules); read it back.
        await collection.utils.refetch();
      },
      onDelete: async ({ transaction, collection }) => {
        for (const { key } of transaction.mutations) await api.deleteMoul(key);
        // Deleting a collection can rewrite relations in the others.
        await collection.utils.refetch();
      },
    }),
  ),
);

export const flagsCollection = register(
  createCollection(
    queryCollectionOptions({
      id: 'feature-flags',
      queryKey: ['flags'],
      queryFn: (): Promise<FeatureFlag[]> => api.listFeatureFlags(),
      queryClient,
      getKey: (flag: FeatureFlag) => flag.key,
      onInsert: async ({ transaction, collection }) => {
        for (const { modified } of transaction.mutations) {
          await collection.utils.writeInsert(await api.createFeatureFlag(modified));
        }
      },
      onUpdate: async ({ transaction, collection }) => {
        for (const { key, changes } of transaction.mutations) {
          await collection.utils.writeUpdate(await api.updateFeatureFlag(key, changes));
        }
      },
      onDelete: async ({ transaction, collection }) => {
        for (const { key } of transaction.mutations) {
          await api.deleteFeatureFlag(key);
          await collection.utils.writeDelete(key);
        }
      },
    }),
  ),
);

/** Marks every cached view of `moul`'s records stale (other grid pages, pickers, job queues, counts); those on screen refetch. */
export function invalidateRecords(moul: string, except?: QueryKey): void {
  const skip = except && hashKey(except);
  void queryClient.invalidateQueries({
    predicate: (q) =>
      ['records', 'workerJobs', 'collectionRecordCount'].includes(q.queryKey[0] as string) &&
      q.queryKey[1] === moul &&
      q.queryHash !== skip,
  });
}

/** Requeues worker jobs, falling back to a plain update for collections without the jobs endpoint. */
async function requeueJobs(moul: string, ids: string[]) {
  try {
    await api.retryJobs(moul, ids);
  } catch {
    const scheduled_at = new Date().toISOString();
    await Promise.all(ids.map((id) => api.updateRecord(moul, id, { state: 'available', scheduled_at, attempt: 0 })));
  }
}

// Marks an update as a retry, which the records handler sends to the retry endpoint instead of PATCHing.
const RETRY = { action: 'retry' } as const;
const isRetry = (metadata: unknown) => (metadata as typeof RETRY | undefined)?.action === RETRY.action;

export const recordsQueryKey = (moul: string, query: RecordsQuery): QueryKey => ['records', moul, query];

function createRecordsCollection(moul: string, query: RecordsQuery, onCleanedUp: () => void) {
  const queryKey = recordsQueryKey(moul, query);
  return register(
    createCollection(
      queryCollectionOptions({
        id: `records:${hashKey(queryKey)}`,
        queryKey,
        queryFn: () => api.listRecords(moul, query),
        select: rowsOf,
        queryClient,
        getKey: (record: Row) => String(record.id),
        onInsert: async ({ transaction, collection }) => {
          const error = await firstFailure(
            transaction.mutations.map(({ modified }) => {
              // The key is a placeholder until the server assigns the real ID.
              const { id: _placeholder, ...data } = modified;
              return api.createRecord(moul, data);
            }),
          );
          await collection.utils.refetch();
          invalidateRecords(moul, queryKey);
          if (error) throw error;
        },
        onUpdate: async ({ transaction, collection }) => {
          const retries = transaction.mutations.filter((m) => isRetry(m.metadata)).map((m) => String(m.key));
          const writes = transaction.mutations
            .filter((m) => !isRetry(m.metadata))
            .map((m) => api.updateRecord(moul, String(m.key), m.changes));
          if (retries.length > 0) writes.push(requeueJobs(moul, retries));
          const error = await firstFailure(writes);
          // A refetch rather than the PATCH response: the grid's rows carry expanded relations.
          await collection.utils.refetch();
          invalidateRecords(moul, queryKey);
          if (error) throw error;
        },
        onDelete: async ({ transaction, collection }) => {
          const error = await firstFailure(transaction.mutations.map(({ key }) => api.deleteRecord(moul, String(key))));
          // Pulls the next page's first rows up, and drops the rows that did delete before a failure rolls back the rest.
          await collection.utils.refetch();
          invalidateRecords(moul, queryKey);
          if (error) throw error;
        },
      }),
    ),
    onCleanedUp,
  );
}

export type RecordsCollection = ReturnType<typeof createRecordsCollection>;

const recordViews = new Map<string, RecordsCollection>();

/**
 * The records of one grid page (one `query`), keyed by record ID. Views are shared by query and
 * dropped once their collection is garbage collected.
 */
export function recordsCollection(moul: string, query: RecordsQuery = {}) {
  const id = hashKey(recordsQueryKey(moul, query));
  let collection = recordViews.get(id);
  if (!collection) {
    collection = createRecordsCollection(moul, query, () => recordViews.delete(id));
    recordViews.set(id, collection);
  }
  return collection;
}

/** Puts worker jobs back in the queue: `available` at once, persisted through the retry endpoint. */
export function retryJobs(records: RecordsCollection, ids: string[]) {
  const scheduled_at = new Date().toISOString();
  return records.update(ids, { metadata: RETRY }, (drafts) => {
    for (const draft of drafts) Object.assign(draft, { state: 'available', scheduled_at, attempt: 0 });
  });
}

/** `totalItems`/`totalPages` of a records list response; a collection only keeps its rows. */
export function pageTotals(data: unknown): { totalItems?: number; totalPages?: number } {
  const page = data as { totalItems?: unknown; totalPages?: unknown } | undefined;
  return {
    totalItems: typeof page?.totalItems === 'number' ? page.totalItems : undefined,
    totalPages: typeof page?.totalPages === 'number' ? page.totalPages : undefined,
  };
}

function createWorkerJobsCollection(name: string, onCleanedUp: () => void) {
  const builtIn = name === BUILT_IN_WORKERS;
  const queryKey = ['workerJobs', name];
  return register(
    createCollection(
      queryCollectionOptions({
        id: `worker-jobs:${name}`,
        queryKey,
        queryFn: () =>
          builtIn ? api.listWorkers({ perPage: 100, sort: '-createdAt' }) : api.listRecords(name, { perPage: 100, sort: '-createdAt' }),
        select: rowsOf,
        queryClient,
        getKey: (job: Row) => String(job.id),
        refetchInterval: 5000,
        onUpdate: async ({ transaction, collection }) => {
          const error = await firstFailure(
            transaction.mutations.map(({ key, changes }) =>
              builtIn ? api.updateWorkerJob(String(key), changes) : api.updateRecord(name, String(key), changes),
            ),
          );
          await collection.utils.refetch();
          if (!builtIn) invalidateRecords(name, queryKey);
          if (error) throw error;
        },
      }),
    ),
    onCleanedUp,
  );
}

const workerJobViews = new Map<string, ReturnType<typeof createWorkerJobsCollection>>();

/** The latest 100 jobs of a worker collection (or the built-in queue), polled every 5 seconds. */
export function workerJobsCollection(name: string) {
  let collection = workerJobViews.get(name);
  if (!collection) {
    collection = createWorkerJobsCollection(name, () => workerJobViews.delete(name));
    workerJobViews.set(name, collection);
  }
  return collection;
}
