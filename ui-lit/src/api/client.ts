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
