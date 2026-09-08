import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken, getStoredAdminKey, setStoredAdminKey, removeStoredAdminKey } from '../api/client';
import { emitAuthChange, emitAppAction } from '../devtools/events';

const USER_STORAGE_KEY = 'moul_admin_user';
const LEGACY_USER_STORAGE_KEY = 'mould_admin_user';

export interface UserInfo {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  adminKey: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  needsSetup: boolean;
  isLoading: boolean;
  verifyAndSetAdminKey: (key: string) => Promise<{ needsSetup: boolean }>;
  clearAdminKey: () => void;
  adminLogin: (identityOrKey: string, passwordOrIdentity: string, password?: string) => Promise<void>;
  login: (adminKey: string, identity?: string, password?: string) => Promise<void>;
  saveAdminKey: (key: string) => void;
  saveToken: (token: string) => void;
  updateUser: (updated: Partial<UserInfo>) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  checkSetup: (key?: string) => Promise<boolean>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [adminKey, setAdminKey] = useState<string | null>(getStoredAdminKey());
  const [user, setUser] = useState<UserInfo | null>(getStoredUser());
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
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
        setUser(userData);
        emitAuthChange({
          isAuthenticated: true,
          user: userData,
          adminKey: Boolean(getStoredAdminKey()),
        });
      }
    } catch {
      // ignore
    }
  };

  const checkSetup = async (overrideKey?: string): Promise<boolean> => {
    const keyToUse = overrideKey || adminKey || getStoredAdminKey();
    if (!keyToUse) {
      return false;
    }
    if (overrideKey) {
      setStoredAdminKey(overrideKey);
      setAdminKey(overrideKey);
    }
    try {
      const res = overrideKey ? await api.verifyAdminKeyWithKey(overrideKey) : await api.getSetupStatus();
      setNeedsSetup(res.needsSetup);
      return res.needsSetup;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const storedKey = getStoredAdminKey();
      const storedToken = getAuthToken();

      if (storedKey) {
        try {
          // Verify existing admin key
          const res = await api.getSetupStatus();
          setNeedsSetup(res.needsSetup);
          if (storedToken) {
            await refreshUser();
          }
        } catch {
          // Stored admin key is invalid or rotated (401)
          removeStoredAdminKey();
          removeAuthToken();
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
          setAdminKey(null);
          setToken(null);
          setUser(null);
          setNeedsSetup(false);
        }
      } else {
        // No admin key yet: Do NOT query /api/setup unauthenticated
        setNeedsSetup(false);
      }

      setIsLoading(false);
      emitAuthChange({
        isAuthenticated: Boolean(getAuthToken() && getStoredAdminKey()),
        user: getStoredUser(),
        adminKey: Boolean(getStoredAdminKey()),
      });
    };
    init();
  }, []);

  const verifyAndSetAdminKey = async (key: string): Promise<{ needsSetup: boolean }> => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }

    const res = await api.verifyAdminKeyWithKey(trimmedKey);
    setStoredAdminKey(trimmedKey);
    setAdminKey(trimmedKey);
    setNeedsSetup(res.needsSetup);

    emitAuthChange({
      isAuthenticated: Boolean(token && trimmedKey),
      user,
      adminKey: true,
    });
    emitAppAction({
      action: 'auth:admin-key-verified',
      category: 'auth',
      details: { needsSetup: res.needsSetup },
    });

    return { needsSetup: res.needsSetup };
  };

  const clearAdminKey = () => {
    removeStoredAdminKey();
    removeAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    setAdminKey(null);
    setToken(null);
    setUser(null);
    setNeedsSetup(false);

    emitAuthChange({
      isAuthenticated: false,
      user: null,
      adminKey: false,
    });
    emitAppAction({
      action: 'auth:admin-key-cleared',
      category: 'auth',
    });
  };

  const adminLogin = async (
    identityOrKey: string,
    passwordOrIdentity: string,
    passwordParam?: string
  ) => {
    let activeKey = adminKey || getStoredAdminKey() || '';
    let identity = identityOrKey;
    let password = passwordOrIdentity;

    if (passwordParam !== undefined) {
      // 3 arguments passed: (key, identity, password)
      activeKey = identityOrKey;
      identity = passwordOrIdentity;
      password = passwordParam;
    }

    const trimmedKey = activeKey.trim();
    const trimmedIdentity = identity.trim();

    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }
    if (!trimmedIdentity || !password) {
      throw new Error('Username/Email and Password are required');
    }

    setStoredAdminKey(trimmedKey);
    setAdminKey(trimmedKey);

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
      setUser(userData);
      setAuthToken(res.token);
      setToken(res.token);

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
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
      setUser(null);
      setToken(null);
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
  };

  const login = async (key: string, identity?: string, password?: string) => {
    if (identity && password) {
      return adminLogin(key, identity, password);
    }

    return verifyAndSetAdminKey(key).then(() => {});
  };

  const saveAdminKey = (key: string) => {
    const trimmed = key.trim();
    setStoredAdminKey(trimmed);
    setAdminKey(trimmed);
    emitAuthChange({
      isAuthenticated: Boolean(token && trimmed),
      user,
      adminKey: true,
    });
  };

  const saveToken = (jwtToken: string) => {
    setAuthToken(jwtToken);
    setToken(jwtToken);
    emitAuthChange({
      isAuthenticated: Boolean(jwtToken && adminKey),
      user,
      adminKey: Boolean(adminKey),
    });
  };

  const updateUser = (updated: Partial<UserInfo>) => {
    setUser((prev) => {
      const next: UserInfo = prev
        ? { ...prev, ...updated }
        : { username: 'admin', name: 'admin', role: 'Admin', ...updated };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      emitAuthChange({
        isAuthenticated: Boolean(token && adminKey),
        user: next,
        adminKey: Boolean(adminKey),
      });
      return next;
    });
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    setUser(null);
    setToken(null);

    emitAuthChange({
      isAuthenticated: false,
      user: null,
      adminKey: Boolean(adminKey),
    });
    emitAppAction({
      action: 'auth:logout',
      category: 'auth',
    });
  };

  const isAuthenticated = Boolean(token && adminKey);

  return (
    <AuthContext.Provider
      value={{
        token,
        adminKey,
        user: user || (isAuthenticated ? { username: 'admin', name: 'admin', role: 'Admin' } : null),
        isAuthenticated,
        needsSetup,
        isLoading,
        verifyAndSetAdminKey,
        clearAdminKey,
        adminLogin,
        login,
        saveAdminKey,
        saveToken,
        updateUser,
        refreshUser,
        logout,
        checkSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
