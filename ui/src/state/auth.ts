import {
  api,
  getAuthToken,
  getStoredAdminKey,
  removeAuthToken,
  removeStoredAdminKey,
  setAuthToken,
  setStoredAdminKey,
} from '../api/client';
import { emitAppAction, emitAuthChange } from '../devtools/events';
import { Store } from '../lib/store';

const USER_STORAGE_KEY = 'moul_admin_user';
const LEGACY_USER_STORAGE_KEY = 'mould_admin_user';

export interface UserInfo {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
}

function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const token = getAuthToken();
    if (token && token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id || payload.sub,
        username: payload.username || payload.identity || 'admin',
        name: payload.name || payload.username || 'admin',
        email: payload.email || '',
        role: payload.role || 'Admin',
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
}

/**
 * Console session: the master admin key (`X-Admin-Key`) plus the root user's token.
 * Port of the React `AuthContext`; credentials live in localStorage via `api/client`.
 */
class AuthStore extends Store {
  token: string | null = getAuthToken();
  adminKey: string | null = getStoredAdminKey();
  private storedUser: UserInfo | null = getStoredUser();
  needsSetup = false;
  isLoading = true;
  private initialized = false;

  get isAuthenticated(): boolean {
    return Boolean(this.token && this.adminKey);
  }

  get user(): UserInfo | null {
    return this.storedUser || (this.isAuthenticated ? { username: 'admin', name: 'admin', role: 'Admin' } : null);
  }

  /** Verifies a stored admin key once at startup and loads the root account. */
  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    this.isLoading = true;
    this.notify();

    const storedKey = getStoredAdminKey();
    const storedToken = getAuthToken();

    if (storedKey) {
      try {
        // Verify existing admin key
        const res = await api.getSetupStatus();
        this.needsSetup = res.needsSetup;
        if (storedToken) {
          await this.refreshUser();
        }
      } catch {
        // Stored admin key is invalid or rotated (401)
        removeStoredAdminKey();
        removeAuthToken();
        clearStoredUser();
        this.adminKey = null;
        this.token = null;
        this.storedUser = null;
        this.needsSetup = false;
      }
    } else {
      // No admin key yet: Do NOT query /api/setup unauthenticated
      this.needsSetup = false;
    }

    this.isLoading = false;
    this.notify();
    emitAuthChange({
      isAuthenticated: Boolean(getAuthToken() && getStoredAdminKey()),
      user: getStoredUser(),
      adminKey: Boolean(getStoredAdminKey()),
    });
  }

  async refreshUser(): Promise<void> {
    if (!getAuthToken() || !getStoredAdminKey()) return;
    try {
      const acc = await api.getRootAccount();
      if (acc) {
        const userData: UserInfo = {
          id: acc.id,
          username: acc.username || 'admin',
          name: acc.name || acc.username || 'admin',
          email: acc.email || '',
          role: 'Admin',
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        this.storedUser = userData;
        this.notify();
        emitAuthChange({
          isAuthenticated: true,
          user: userData,
          adminKey: Boolean(getStoredAdminKey()),
        });
      }
    } catch {
      // ignore
    }
  }

  async checkSetup(overrideKey?: string): Promise<boolean> {
    const keyToUse = overrideKey || this.adminKey || getStoredAdminKey();
    if (!keyToUse) {
      return false;
    }
    if (overrideKey) {
      setStoredAdminKey(overrideKey);
      this.adminKey = overrideKey;
    }
    try {
      const res = overrideKey ? await api.verifyAdminKeyWithKey(overrideKey) : await api.getSetupStatus();
      this.needsSetup = res.needsSetup;
      return res.needsSetup;
    } catch {
      return false;
    } finally {
      this.notify();
    }
  }

  async verifyAndSetAdminKey(key: string): Promise<{ needsSetup: boolean }> {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }

    const res = await api.verifyAdminKeyWithKey(trimmedKey);
    setStoredAdminKey(trimmedKey);
    this.adminKey = trimmedKey;
    this.needsSetup = res.needsSetup;
    this.notify();

    emitAuthChange({
      isAuthenticated: Boolean(this.token && trimmedKey),
      user: this.storedUser,
      adminKey: true,
    });
    emitAppAction({
      action: 'auth:admin-key-verified',
      category: 'auth',
      details: { needsSetup: res.needsSetup },
    });

    return { needsSetup: res.needsSetup };
  }

  clearAdminKey(): void {
    removeStoredAdminKey();
    removeAuthToken();
    clearStoredUser();
    this.adminKey = null;
    this.token = null;
    this.storedUser = null;
    this.needsSetup = false;
    this.notify();

    emitAuthChange({
      isAuthenticated: false,
      user: null,
      adminKey: false,
    });
    emitAppAction({
      action: 'auth:admin-key-cleared',
      category: 'auth',
    });
  }

  /** Signs in the root user with the stored admin key. */
  async adminLogin(identity: string, password: string): Promise<void> {
    const trimmedKey = (this.adminKey || getStoredAdminKey() || '').trim();
    const trimmedIdentity = identity.trim();

    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }
    if (!trimmedIdentity || !password) {
      throw new Error('Username/Email and Password are required');
    }

    setStoredAdminKey(trimmedKey);
    this.adminKey = trimmedKey;

    try {
      const res = await api.adminLogin(trimmedIdentity, password);
      if (!res.token) {
        throw new Error('Authentication succeeded but no token was returned');
      }

      const fallbackName = trimmedIdentity.includes('@') ? trimmedIdentity.split('@')[0] : trimmedIdentity;
      const userData: UserInfo = res.record || {
        username: fallbackName,
        name: fallbackName,
        email: trimmedIdentity.includes('@') ? trimmedIdentity : '',
        role: 'Admin',
      };
      if (res.record?.name) {
        userData.name = res.record.name;
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      this.storedUser = userData;
      setAuthToken(res.token);
      this.token = res.token;
      // A root user just signed in, so setup is complete.
      this.needsSetup = false;
      this.notify();

      emitAuthChange({
        isAuthenticated: true,
        user: userData,
        adminKey: true,
      });
      emitAppAction({
        action: 'auth:login-success',
        category: 'auth',
        details: { username: userData.username, role: userData.role },
      });
    } catch (err: any) {
      removeAuthToken();
      clearStoredUser();
      this.storedUser = null;
      this.token = null;
      this.notify();
      emitAuthChange({
        isAuthenticated: false,
        user: null,
        adminKey: Boolean(trimmedKey),
      });
      emitAppAction({
        action: 'auth:login-failed',
        category: 'auth',
        details: { error: err.message },
      });
      throw new Error(err.message || 'Invalid root credentials');
    }
  }

  saveAdminKey(key: string): void {
    const trimmed = key.trim();
    setStoredAdminKey(trimmed);
    this.adminKey = trimmed;
    this.notify();
    emitAuthChange({
      isAuthenticated: Boolean(this.token && trimmed),
      user: this.storedUser,
      adminKey: true,
    });
  }

  saveToken(jwtToken: string): void {
    setAuthToken(jwtToken);
    this.token = jwtToken;
    this.notify();
    emitAuthChange({
      isAuthenticated: Boolean(jwtToken && this.adminKey),
      user: this.storedUser,
      adminKey: Boolean(this.adminKey),
    });
  }

  updateUser(updated: Partial<UserInfo>): void {
    const next: UserInfo = this.storedUser
      ? { ...this.storedUser, ...updated }
      : { username: 'admin', name: 'admin', role: 'Admin', ...updated };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
    this.storedUser = next;
    this.notify();
    emitAuthChange({
      isAuthenticated: this.isAuthenticated,
      user: next,
      adminKey: Boolean(this.adminKey),
    });
  }

  logout(): void {
    removeAuthToken();
    clearStoredUser();
    this.storedUser = null;
    this.token = null;
    this.notify();

    emitAuthChange({
      isAuthenticated: false,
      user: null,
      adminKey: Boolean(this.adminKey),
    });
    emitAppAction({
      action: 'auth:logout',
      category: 'auth',
    });
  }
}

export const auth = new AuthStore();
