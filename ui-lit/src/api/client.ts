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

const resolveApiPath = (path: string): string => {
  return path;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = resolveApiPath(path);
  const headers = new Headers(options.headers || {});

  const token = getAuthToken();
  const adminKey = getStoredAdminKey();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (adminKey && !headers.has('X-Admin-Key')) {
    headers.set('X-Admin-Key', adminKey);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });

  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw new Error(
      (data as any)?.message ||
      (data as any)?.error ||
      `Request failed with status ${res.status}`
    );
  }

  return data as T;
}

export const api = {
  getSetupStatus: () => request<{ needsSetup: boolean; message: string }>('/api/setup'),
  setupRootUser: (data: any) =>
    request<{ message: string }>('/api/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adminLogin: (identity: string, password?: string) =>
    request<{
      token: string;
      record?: {
        id: string;
        username: string;
        name: string;
        email: string;
        role: string;
      };
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    }),
  verifyAdminKeyWithKey: async (key: string): Promise<{ needsSetup: boolean }> => {
    const url = resolveApiPath('/api/setup');
    const headers = new Headers();
    headers.set('X-Admin-Key', key);
    headers.set('Content-Type', 'application/json');

    const res = await fetch(url, { method: 'GET', headers });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      throw new Error(
        (data as any)?.message ||
        (data as any)?.error ||
        `Request failed with status ${res.status}`
      );
    }
    return data as { needsSetup: boolean };
  },
  getRootAccount: () =>
    request<{
      id: string;
      username: string;
      name: string;
      email: string;
      moul: string;
      createdAt?: string;
      updatedAt?: string;
      created_at?: string;
      updated_at?: string;
    }>('/api/admin/account'),
};
