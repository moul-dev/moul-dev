import { signal } from '@lit-labs/signals';
import {
  api,
  getAuthToken,
  getStoredAdminKey,
  removeAuthToken,
  removeStoredAdminKey,
  setAuthToken,
  setStoredAdminKey,
} from '../api/client.js';

export interface UserInfo {
  id?: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

const USER_STORAGE_KEY = 'moul_user_info';
const LEGACY_USER_STORAGE_KEY = 'mould_user_info';

function getStoredUser(): UserInfo | null {
  try {
    const raw =
      localStorage.getItem(USER_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_USER_STORAGE_KEY);
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

export interface AuthState {
  token: string | null;
  adminKey: string | null;
  user: UserInfo | null;
  needsSetup: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialToken = getAuthToken();
const initialAdminKey = getStoredAdminKey();
const initialUser = getStoredUser();

export const authStateSignal = signal({
  token: initialToken,
  adminKey: initialAdminKey,
  user: initialUser || (initialToken && initialAdminKey ? { username: 'admin', name: 'admin', email: '', role: 'Admin' } : null),
  needsSetup: false,
  isLoading: true,
  isAuthenticated: Boolean(initialToken && initialAdminKey),
});

export const authActions = {
  async init() {
    authStateSignal.set({ ...authStateSignal.get(), isLoading: true });
    
    const storedKey = getStoredAdminKey();
    const storedToken = getAuthToken();

    let needsSetup = false;
    if (storedKey) {
      try {
        const res = await api.getSetupStatus();
        needsSetup = res.needsSetup;
        if (storedToken) {
          await this.refreshUser();
        }
      } catch {
        this.clearAdminKey();
      }
    }
    
    const currentToken = getAuthToken();
    const currentAdminKey = getStoredAdminKey();

    authStateSignal.set({
      ...authStateSignal.get(),
      needsSetup,
      isLoading: false,
      isAuthenticated: Boolean(currentToken && currentAdminKey),
    });
  },

  async verifyAndSetAdminKey(key: string): Promise<{ needsSetup: boolean }> {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }

    const res = await api.verifyAdminKeyWithKey(trimmedKey);
    setStoredAdminKey(trimmedKey);
    
    authStateSignal.set({
      ...authStateSignal.get(),
      adminKey: trimmedKey,
      needsSetup: res.needsSetup,
      isAuthenticated: Boolean(authStateSignal.get().token && trimmedKey),
    });

    return { needsSetup: res.needsSetup };
  },

  clearAdminKey() {
    removeStoredAdminKey();
    removeAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);

    authStateSignal.set({
      token: null,
      adminKey: null,
      user: null,
      needsSetup: false,
      isLoading: false,
      isAuthenticated: false,
    });
  },

  async adminLogin(identity: string, password?: string) {
    const trimmedIdentity = identity.trim();
    const activeKey = authStateSignal.get().adminKey || getStoredAdminKey();

    if (!activeKey) {
      throw new Error('Master Admin Key is required');
    }
    if (!trimmedIdentity || !password) {
      throw new Error('Username/Email and Password are required');
    }

    try {
      const res = await api.adminLogin(trimmedIdentity, password);
      if (!res.token) {
        throw new Error('Authentication succeeded but no token was returned');
      }

      const userData: UserInfo = res.record || {
        username: trimmedIdentity.includes('@') ? trimmedIdentity.split('@')[0] : trimmedIdentity,
        name: trimmedIdentity.includes('@') ? trimmedIdentity.split('@')[0] : trimmedIdentity,
        email: trimmedIdentity.includes('@') ? trimmedIdentity : '',
        role: 'Admin',
      };
      if (res.record?.name) {
        userData.name = res.record.name;
      }

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setAuthToken(res.token);

      authStateSignal.set({
        ...authStateSignal.get(),
        token: res.token,
        user: userData,
        isAuthenticated: true,
      });
    } catch (err: any) {
      this.clearAdminKey();
      // restore the key if we failed login but key might be fine
      if(activeKey) {
          setStoredAdminKey(activeKey);
          authStateSignal.set({
              ...authStateSignal.get(),
              adminKey: activeKey,
          });
      }
      throw new Error(err.message || 'Invalid root credentials');
    }
  },

  async refreshUser() {
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
        authStateSignal.set({
            ...authStateSignal.get(),
            user: userData,
            isAuthenticated: true,
        });
      }
    } catch {
      // ignore
    }
  },
  
  logout() {
      this.clearAdminKey();
  }
};

export const getAuthState = () => authStateSignal.get();
