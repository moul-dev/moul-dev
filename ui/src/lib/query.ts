import {
  type DefaultError,
  hashKey,
  MutationObserver,
  type MutationObserverOptions,
  type MutationObserverResult,
  QueryClient,
  type QueryKey,
  QueryObserver,
  type QueryObserverOptions,
  type QueryObserverResult,
} from '@tanstack/query-core';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      retry: 1,
    },
  },
});
// Wires window focus and online listeners so stale queries refetch like they did in React Query.
queryClient.mount();

/**
 * Lit counterpart of `useQuery`. `options` is re-read before every host update, so the
 * query key may depend on reactive properties; a changed key switches queries the same way
 * React Query does on re-render.
 *
 *   private mouls = new QueryController(this, () => ({ queryKey: ['mouls'], queryFn: api.getMouls }));
 *   render() { const { data, isLoading } = this.mouls.result; ... }
 */
export class QueryController<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> implements ReactiveController
{
  private readonly host: ReactiveControllerHost;
  private readonly options: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>;
  private readonly observer: QueryObserver<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>;
  private unsubscribe?: () => void;
  result: QueryObserverResult<TData, TError>;

  constructor(
    host: ReactiveControllerHost,
    options: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
  ) {
    this.host = host;
    this.options = options;
    const defaulted = this.defaultedOptions();
    this.observer = new QueryObserver(queryClient, defaulted);
    this.result = this.observer.getOptimisticResult(defaulted);
    host.addController(this);
  }

  private defaultedOptions() {
    return queryClient.defaultQueryOptions(this.options());
  }

  hostConnected(): void {
    // The constructor ran from a field initializer, before the host's constructor set its
    // state; re-read the options so the first fetch doesn't use an undefined key.
    this.observer.setOptions(this.defaultedOptions());
    this.unsubscribe = this.observer.subscribe((result) => {
      this.result = result;
      this.host.requestUpdate();
    });
    this.observer.updateResult();
  }

  hostUpdate(): void {
    const defaulted = this.defaultedOptions();
    this.observer.setOptions(defaulted);
    this.result = this.observer.getOptimisticResult(defaulted);
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  get data(): TData | undefined {
    return this.result.data;
  }

  refetch() {
    return this.result.refetch();
  }
}

/**
 * Reads a query's cached data and re-renders the host when it changes, without observing the
 * query: it never fetches, and has no options of its own to replace those of whatever does fetch
 * it (a query collection, say).
 */
export class QueryDataController<TData = unknown> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly queryKey: () => QueryKey;
  private unsubscribe?: () => void;

  constructor(host: ReactiveControllerHost, queryKey: () => QueryKey) {
    this.host = host;
    this.queryKey = queryKey;
    host.addController(this);
  }

  hostConnected(): void {
    this.unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.queryHash === hashKey(this.queryKey())) this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  get data(): TData | undefined {
    return queryClient.getQueryData<TData>(this.queryKey());
  }
}

/**
 * Lit counterpart of `useMutation`. `mutate` swallows the rejection (handle it in `onError`);
 * `mutateAsync` returns the promise.
 */
export class MutationController<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>
  implements ReactiveController
{
  private readonly host: ReactiveControllerHost;
  private readonly observer: MutationObserver<TData, TError, TVariables, TContext>;
  private unsubscribe?: () => void;
  result: MutationObserverResult<TData, TError, TVariables, TContext>;

  constructor(host: ReactiveControllerHost, options: MutationObserverOptions<TData, TError, TVariables, TContext>) {
    this.host = host;
    this.observer = new MutationObserver(queryClient, options);
    this.result = this.observer.getCurrentResult();
    host.addController(this);
  }

  hostConnected(): void {
    this.unsubscribe = this.observer.subscribe((result) => {
      this.result = result;
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  get isPending(): boolean {
    return this.result.isPending;
  }

  mutate: MutationObserver<TData, TError, TVariables, TContext>['mutate'] = (variables, options) => {
    const promise = this.observer.mutate(variables, options);
    promise.catch(() => {});
    return promise;
  };

  mutateAsync: MutationObserver<TData, TError, TVariables, TContext>['mutate'] = (variables, options) =>
    this.observer.mutate(variables, options);

  reset(): void {
    this.observer.reset();
  }
}
