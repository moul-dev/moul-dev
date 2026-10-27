import { getAuthToken, getStoredAdminKey } from './api/client';
import type { Route } from './lib/router';

const requireAuth = () => (!getAuthToken() || !getStoredAdminKey() ? '/login' : undefined);

/** Console page inside the authenticated shell. */
function page(path: string, tag: string, load: () => Promise<unknown>): Route {
  return { path, tag, load, layout: 'app', guard: requireAuth };
}

const notPorted = () => import('./pages/not-ported');

// First match wins. Pages load on first visit, so each one is its own chunk.
export const routes: Route[] = [
  { path: '/', redirect: '/overview' },
  { path: '/login', tag: 'admin-login-page', load: () => import('./pages/login'), layout: 'bare' },
  { path: '/setup', tag: 'admin-setup-page', load: () => import('./pages/setup'), layout: 'bare' },

  page('/overview', 'admin-not-ported-page', notPorted),
  page('/collections', 'admin-not-ported-page', notPorted),
  page('/collections/:moulName', 'admin-not-ported-page', notPorted),
  page('/records/:moulName', 'admin-not-ported-page', notPorted),
  page('/realtime', 'admin-not-ported-page', notPorted),
  page('/analytics', 'admin-not-ported-page', notPorted),
  page('/workers', 'admin-not-ported-page', notPorted),
  page('/flags', 'admin-not-ported-page', notPorted),
  page('/settings', 'admin-not-ported-page', notPorted),
  page('/docs', 'admin-not-ported-page', notPorted),
];
