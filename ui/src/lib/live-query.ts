import {
  type Collection,
  type CollectionStatus,
  createLiveQueryCollection,
  type InitialQueryBuilder,
  Query,
  type QueryBuilder,
  type QueryResult,
  type Transaction,
} from '@tanstack/db';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

const sameDeps = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

/**
 * Lit counterpart of TanStack DB's `useLiveQuery`. `query` builds the live query, or returns
 * nothing to disable it; it is rebuilt whenever a value from `deps` changes, like the React
 * hook's dependency array. Rows update in place as the source collections sync or take
 * optimistic writes.
 *
 *   private flags = new LiveQueryController(this, (q) => q.from({ flag: flagsCollection }).orderBy(({ flag }) => flag.key));
 *   render() { const { data, isLoading } = this.flags; ... }
 */
export class LiveQueryController<TQuery extends QueryBuilder<any>> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly query: (q: InitialQueryBuilder) => TQuery | null | undefined;
  private readonly deps: () => readonly unknown[];
  private lastDeps?: readonly unknown[];
  private live?: Collection<any, any, any>;
  private release?: () => void;

  constructor(
    host: ReactiveControllerHost,
    query: (q: InitialQueryBuilder) => TQuery | null | undefined,
    deps: () => readonly unknown[] = () => [],
  ) {
    this.host = host;
    this.query = query;
    this.deps = deps;
    host.addController(this);
  }

  // Nothing is built in the constructor: it runs from a field initializer, before the host's
  // own constructor has set the state `query` and `deps` read.
  hostConnected(): void {
    this.rebuildIfDepsChanged();
  }

  hostUpdate(): void {
    this.rebuildIfDepsChanged();
  }

  hostDisconnected(): void {
    this.teardown();
    this.lastDeps = undefined;
  }

  private rebuildIfDepsChanged() {
    const deps = this.deps();
    if (this.lastDeps && sameDeps(deps, this.lastDeps)) return;
    this.lastDeps = deps;
    this.teardown();

    const built = this.query(new Query());
    if (!built) return;
    const live = createLiveQueryCollection({ query: built, startSync: true });
    const update = () => this.host.requestUpdate();
    const subscription = live.subscribeChanges(update, { includeInitialState: false });
    const offStatus = live.on('status:change', update);
    const offHealth = live.on('health:change', update);
    this.live = live;
    this.release = () => {
      subscription.unsubscribe();
      offStatus();
      offHealth();
      // Release the source subscriptions now instead of after the live query's gcTime.
      live.cleanup().catch(() => {});
    };
  }

  private teardown() {
    this.release?.();
    this.release = undefined;
    this.live = undefined;
  }

  /** Result rows in query order; empty while loading or disabled. */
  get data(): QueryResult<TQuery>[] {
    return (this.live?.toArray ?? []) as QueryResult<TQuery>[];
  }

  /** The first row, for `findOne()` queries. */
  get first(): QueryResult<TQuery> | undefined {
    return this.data[0];
  }

  get status(): CollectionStatus | 'disabled' {
    return this.live?.status ?? 'disabled';
  }

  /** True until the first result is ready; false for a disabled query. */
  get isLoading(): boolean {
    return this.status === 'idle' || this.status === 'loading';
  }

  get isReady(): boolean {
    return this.status === 'ready';
  }

  /** The first load failed, so there is nothing to show. */
  get isError(): boolean {
    return this.status === 'error' || this.status === 'crashed';
  }
}

/**
 * Tracks the TanStack DB transactions a host starts, so it can show a pending state (a
 * "Saving..." button) until each one is persisted or rolled back.
 *
 *   private readonly saving = new TransactionController(this);
 *   await this.saving.track(moulsCollection.update(name, (draft) => { ... }));
 */
export class TransactionController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly pending = new Set<Transaction<any>>();

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {}

  get isPending(): boolean {
    return this.pending.size > 0;
  }

  /** Resolves once `tx` is persisted; rejects with the handler's error after the rollback. */
  async track(tx: Transaction<any>): Promise<void> {
    this.pending.add(tx);
    this.host.requestUpdate();
    try {
      await tx.when('settled');
    } finally {
      this.pending.delete(tx);
      this.host.requestUpdate();
    }
  }
}
