import { getAuthToken, getStoredAdminKey } from './api/client';
import type { Route } from './lib/router';

const requireAuth = () => (!getAuthToken() || !getStoredAdminKey() ? '/login' : undefined);

/** Console page inside the authenticated shell. */
function page(path: string, tag: string, load: () => Promise<unknown>): Route {
  return { path, tag, load, layout: 'app', guard: requireAuth };
}

// First match wins. Pages load on first visit, so each one is its own chunk.
export const routes: Route[] = [
  { path: '/', redirect: '/overview' },
  { path: '/login', tag: 'admin-login-page', load: () => import('./pages/login'), layout: 'bare' },
  { path: '/setup', tag: 'admin-setup-page', load: () => import('./pages/setup'), layout: 'bare' },

  page('/overview', 'admin-overview-page', () => import('./pages/overview')),
  page('/collections', 'admin-collections-page', () => import('./pages/collections')),
  page('/collections/:moulName', 'admin-collection-page', () => import('./pages/collection')),
  page('/records/:moulName', 'admin-records-page', () => import('./pages/records')),
  page('/realtime', 'admin-realtime-page', () => import('./pages/realtime')),
  page('/analytics', 'admin-analytics-page', () => import('./pages/analytics')),
  page('/workers', 'admin-workers-page', () => import('./pages/workers')),
  page('/flags', 'admin-flags-page', () => import('./pages/flags')),
  page('/settings', 'admin-settings-page', () => import('./pages/settings')),
  page('/docs', 'admin-docs-page', () => import('./pages/docs')),
];
