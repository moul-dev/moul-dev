import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Base class for app-wide state singletons; dispatches `change` when state moves. */
export class Store extends EventTarget {
  protected notify(): void {
    this.dispatchEvent(new Event('change'));
  }
}

/** Re-renders the host element whenever one of the given stores changes. */
export class StoreController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly stores: Store[];

  constructor(host: ReactiveControllerHost, ...stores: Store[]) {
    this.host = host;
    this.stores = stores;
    host.addController(this);
  }

  private readonly onChange = () => this.host.requestUpdate();

  hostConnected(): void {
    for (const store of this.stores) store.addEventListener('change', this.onChange);
  }

  hostDisconnected(): void {
    for (const store of this.stores) store.removeEventListener('change', this.onChange);
  }
}

/** Tracks a CSS media query; `matches` stays current and re-renders the host on change. */
export class MediaQueryController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly list: MediaQueryList;
  matches: boolean;

  constructor(host: ReactiveControllerHost, query: string) {
    this.host = host;
    this.list = window.matchMedia(query);
    this.matches = this.list.matches;
    host.addController(this);
  }

  private readonly onChange = (event: MediaQueryListEvent) => {
    this.matches = event.matches;
    this.host.requestUpdate();
  };

  hostConnected(): void {
    this.matches = this.list.matches;
    this.list.addEventListener('change', this.onChange);
  }

  hostDisconnected(): void {
    this.list.removeEventListener('change', this.onChange);
  }
}
