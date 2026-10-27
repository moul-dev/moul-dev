import { Store } from './store';

export interface Route {
  /** Path relative to the console base, with `:name` segments, e.g. `/records/:moulName`. */
  path: string;
  /** Custom element rendered for this route. */
  tag?: string;
  /** Loads the module that defines `tag`; called once, on first visit. */
  load?: () => Promise<unknown>;
  /** `app` routes render inside `<admin-layout>`; `bare` routes fill the window. */
  layout?: 'app' | 'bare';
  /** Returns a path to redirect to instead of entering the route. */
  guard?: () => string | undefined;
  /** Unconditional redirect target. */
  redirect?: string;
}

export interface RouteLocation {
  /** Path relative to the console base; always starts with `/`. */
  pathname: string;
  search: URLSearchParams;
  params: Record<string, string>;
  route: Route | undefined;
}

export type SearchInit = Record<string, string | number | boolean | null | undefined> | URLSearchParams | string;

export interface NavigateOptions {
  search?: SearchInit;
  replace?: boolean;
}

function toSearchParams(init: SearchInit | undefined): URLSearchParams {
  if (init === undefined) return new URLSearchParams();
  if (typeof init === 'string' || init instanceof URLSearchParams) return new URLSearchParams(init);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(init)) {
    if (value !== undefined && value !== null && value !== false) params.set(key, String(value));
  }
  return params;
}

function matchPath(pattern: string, pathname: string): Record<string, string> | undefined {
  const want = pattern.split('/').filter(Boolean);
  const have = pathname.split('/').filter(Boolean);
  if (want.length !== have.length) return undefined;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) {
      params[want[i].slice(1)] = decodeURIComponent(have[i]);
    } else if (want[i] !== have[i]) {
      return undefined;
    }
  }
  return params;
}

/**
 * History API router for the console. Paths passed to `navigate` and `href` are relative to
 * the Vite base (`/_moul_`). Same-origin `<a>` clicks under the base, including anchors
 * inside shadow roots, are routed client-side.
 */
export class Router extends Store {
  readonly base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  private routes: Route[] = [];
  location: RouteLocation = { pathname: '/', search: new URLSearchParams(), params: {}, route: undefined };

  start(routes: Route[]): void {
    this.routes = routes;
    window.addEventListener('popstate', () => this.resolve());
    document.addEventListener('click', this.onClick);
    this.resolve();
  }

  /** Absolute URL for a console path, for `<a href>` and `<moul-link href>`. */
  href(to: string, search?: SearchInit): string {
    const [path, query] = to.split('?');
    const params = toSearchParams(query);
    for (const [key, value] of toSearchParams(search)) params.set(key, value);
    const qs = params.toString();
    return `${this.base}${path.startsWith('/') ? path : `/${path}`}${qs ? `?${qs}` : ''}`;
  }

  navigate(to: string, options: NavigateOptions = {}): void {
    const url = this.href(to, options.search);
    if (url === window.location.pathname + window.location.search) return;
    if (options.replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
    this.resolve();
  }

  /** Re-runs route guards against the current URL, e.g. after signing in or out. */
  refresh(): void {
    this.resolve();
  }

  isActive(prefix: string): boolean {
    return this.location.pathname === prefix || this.location.pathname.startsWith(`${prefix}/`);
  }

  private resolve(): void {
    // Guards and redirects can chain (`/` → `/overview` → `/login`); cap the hops.
    for (let hop = 0; hop < 5; hop++) {
      const { pathname: fullPath, search } = window.location;
      let pathname = fullPath.startsWith(this.base) ? fullPath.slice(this.base.length) : fullPath;
      pathname = `/${pathname.replace(/^\/+|\/+$/g, '')}`;

      let route: Route | undefined;
      let params: Record<string, string> = {};
      for (const candidate of this.routes) {
        const matched = matchPath(candidate.path, pathname);
        if (matched) {
          route = candidate;
          params = matched;
          break;
        }
      }

      const redirectTo = route?.redirect ?? route?.guard?.();
      if (redirectTo) {
        window.history.replaceState(null, '', this.href(redirectTo));
        continue;
      }

      this.location = { pathname, search: new URLSearchParams(search), params, route };
      this.notify();
      return;
    }
  }

  private readonly onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const anchor = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement);
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname !== this.base && !url.pathname.startsWith(`${this.base}/`)) return;

    event.preventDefault();
    this.navigate(url.pathname.slice(this.base.length) || '/', { search: url.search });
  };
}

export const router = new Router();
