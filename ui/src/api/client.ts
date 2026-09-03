// API Client for moul Admin Console
import { emitApiRequest } from '../devtools/events';

const TOKEN_KEY = 'moul_admin_token';
const LEGACY_TOKEN_KEY = 'mould_admin_token';

const ADMIN_KEY_STORAGE = 'moul_admin_key';
const LEGACY_ADMIN_KEY_STORAGE = 'mould_admin_key';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getStoredAdminKey(): string | null {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || localStorage.getItem(LEGACY_ADMIN_KEY_STORAGE);
}

export function setStoredAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function removeStoredAdminKey() {
  localStorage.removeItem(ADMIN_KEY_STORAGE);
  localStorage.removeItem(LEGACY_ADMIN_KEY_STORAGE);
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const method = options.method || 'GET';
  const startTime = performance.now();

  // Add Auth Token if available
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Add Admin Key if available
  const adminKey = getStoredAdminKey();
  if (adminKey && !headers.has('X-Admin-Key')) {
    headers.set('X-Admin-Key', adminKey);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    emitApiRequest({
      method,
      url: endpoint,
      status: 0,
      durationMs,
      error: err.message,
    });
    throw err;
  }

  const durationMs = Math.round(performance.now() - startTime);
  emitApiRequest({
    method,
    url: endpoint,
    status: res.status,
    durationMs,
  });

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    let errorData: any = null;
    try {
      errorData = await res.json();
      if (errorData?.message) {
        errorMsg = errorData.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new ApiError(res.status, errorMsg, errorData);
  }

  // Return empty if 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text() as unknown as T;
}

export const api = {
  // Setup
  getSetupStatus: () => request<{ needsSetup: boolean }>('/api/setup'),
  setupRootUser: (data: { username: string; name?: string; email: string; password: string }) =>
    request<{ message: string; id: string }>('/api/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Auth
  verifyAdminKey: () => request<{ needsSetup: boolean }>('/api/setup'),
  adminLogin: (identity: string, password: string) =>
    request<{ token: string; record: any }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    }),
  loginRootUser: (identity: string, password: string) =>
    request<{ token: string; record?: any }>('/api/moul/_rootUsers/auth-with-password', {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    }),
  login: (identity: string, password: string, authMoul: string = 'users') =>
    request<{ token: string; record?: any }>(`/api/moul/${authMoul}/auth-with-password`, {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    }),
  refreshToken: (authMoul: string = '_rootUsers') =>
    request<{ token: string }>(`/api/moul/${authMoul}/refresh`, {
      method: 'POST',
    }),

  // Device Flow Authentication
  requestDeviceCode: (clientId: string = 'moul-web') =>
    request<{
      device_code: string;
      user_code: string;
      verification_uri: string;
      verification_uri_complete: string;
      expires_in: number;
      interval: number;
    }>('/api/oauth2/device/authorize', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId }),
    }),
  pollDeviceToken: (deviceCode: string, clientId: string = 'moul-web') =>
    request<{ access_token: string; token_type: string; expires_in: number }>('/api/oauth2/device/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: deviceCode,
        client_id: clientId,
      }),
    }),
  verifyDeviceCode: (userCode: string, identity: string, password: string) =>
    request<{ success: boolean; token?: string }>('/device/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user_code: userCode,
        auth_moul: '_rootUsers',
        identity,
        password,
      }),
    }),

  // Mouls / Collections
  listMouls: () => request<any[]>('/api/moul'),
  getMoul: (name: string) => request<any>(`/api/moul/${name}`),
  createMoul: (data: any) =>
    request<any>('/api/moul', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMoul: (name: string, data: any) =>
    request<any>(`/api/moul/${name}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteMoul: (name: string) =>
    request<any>(`/api/moul/${name}`, {
      method: 'DELETE',
    }),

  // Email templates & Webhooks
  getEmailTemplates: (name: string) => request<any>(`/api/moul/${name}/email-templates`),
  updateEmailTemplates: (name: string, data: any) =>
    request<any>(`/api/moul/${name}/email-templates`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  sendTestEmail: (name: string, data: { to: string; type: string }) =>
    request<any>(`/api/moul/${name}/email-templates/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listWebhooks: (name: string) => request<any[]>(`/api/moul/${name}/webhooks`),
  createWebhook: (name: string, data: any) =>
    request<any>(`/api/moul/${name}/webhooks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteWebhook: (name: string, id: string) =>
    request<any>(`/api/moul/${name}/webhooks/${id}`, {
      method: 'DELETE',
    }),
  testWebhook: (name: string, id: string) =>
    request<any>(`/api/moul/${name}/webhooks/${id}/test`, {
      method: 'POST',
    }),

  // Records CRUD
  listRecords: (name: string, params?: { page?: number; perPage?: number; sort?: string; filter?: string; search?: string; expand?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.perPage) q.set('perPage', String(params.perPage));
    if (params?.sort) q.set('sort', params.sort);
    if (params?.filter) q.set('filter', params.filter);
    if (params?.search) q.set('search', params.search);
    if (params?.expand) q.set('expand', params.expand);
    const qs = q.toString();
    return request<{ items: any[]; totalItems?: number; page?: number; perPage?: number } | any[]>(
      `/api/moul/${name}/records${qs ? `?${qs}` : ''}`
    );
  },
  getRecord: (name: string, id: string, params?: { expand?: string }) => {
    const q = new URLSearchParams();
    if (params?.expand) q.set('expand', params.expand);
    const qs = q.toString();
    return request<any>(`/api/moul/${name}/records/${id}${qs ? `?${qs}` : ''}`);
  },
  createRecord: (name: string, data: any) =>
    request<any>(`/api/moul/${name}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRecord: (name: string, id: string, data: any) =>
    request<any>(`/api/moul/${name}/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteRecord: (name: string, id: string) =>
    request<any>(`/api/moul/${name}/records/${id}`, {
      method: 'DELETE',
    }),
  retryJobs: (name: string, ids?: string[]) =>
    request<any>(`/api/moul/${name}/retry-jobs`, {
      method: 'POST',
      body: JSON.stringify({ ids: ids || [] }),
    }),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Sysmon
  getMetrics: () => request<any>('/api/system/metrics'),

  // Analytics & Requests
  listVisits: (params?: { page?: number; perPage?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.perPage) q.set('perPage', String(params.perPage));
    const qs = q.toString();
    return request<any>(`/api/visits${qs ? `?${qs}` : ''}`);
  },
  listRequests: (params?: { page?: number; perPage?: number; path?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.perPage) q.set('perPage', String(params.perPage));
    if (params?.path) q.set('path', params.path);
    const qs = q.toString();
    return request<any>(`/api/requests${qs ? `?${qs}` : ''}`);
  },

  // Feature Flags
  listFeatureFlags: () => request<any[]>('/api/feature-flags'),
  createFeatureFlag: (data: any) =>
    request<any>('/api/feature-flags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFeatureFlag: (key: string, data: any) =>
    request<any>(`/api/feature-flags/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteFeatureFlag: (key: string) =>
    request<any>(`/api/feature-flags/${key}`, {
      method: 'DELETE',
    }),
  evalFeatureFlag: (key: string, context: any) =>
    request<any>(`/api/feature-flags/${key}/eval`, {
      method: 'POST',
      body: JSON.stringify({ context }),
    }),

  // Settings & Root User
  getSettings: () => request<any>('/api/settings'),
  updateSettings: (data: any) =>
    request<any>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getRootAccount: () =>
    request<{
      id: string;
      username: string;
      name: string;
      email: string;
      moul: string;
      created_at: string;
      updated_at: string;
    }>('/api/admin/account'),
  updateRootAccount: (data: {
    username?: string;
    name?: string;
    email?: string;
    currentPassword?: string;
    password?: string;
    newPassword?: string;
    passwordConfirm?: string;
    identity?: string;
  }) =>
    request<{
      message: string;
      token?: string;
      record?: {
        id: string;
        username: string;
        name: string;
        email: string;
        moul: string;
        created_at: string;
        updated_at: string;
      };
    }>('/api/admin/account', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  updateRootPassword: (data: { currentPassword: string; password: string; passwordConfirm: string; identity?: string }) =>
    request<{ message: string }>('/api/admin/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
