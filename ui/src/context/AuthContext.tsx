import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken, getStoredAdminKey, setStoredAdminKey, removeStoredAdminKey } from '../api/client';
import { emitAuthChange, emitAppAction } from '../devtools/events';

const USER_STORAGE_KEY = 'mould_admin_user';

export interface UserInfo {
  id?: string;
  username?: string;
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
  adminLogin: (adminKey: string, identity: string, password: string) => Promise<void>;
  login: (adminKey: string, identity?: string, password?: string) => Promise<void>;
  saveAdminKey: (key: string) => void;
  saveToken: (token: string) => void;
  logout: () => void;
  checkSetup: (key?: string) => Promise<boolean>;
}

function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const token = getAuthToken();
    if (token && token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id || payload.sub,
        username: payload.username || payload.identity || 'admin',
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

  const checkSetup = async (overrideKey?: string): Promise<boolean> => {
    if (overrideKey) {
      setStoredAdminKey(overrideKey);
      setAdminKey(overrideKey);
    }
    try {
      const res = await api.getSetupStatus();
      setNeedsSetup(res.needsSetup);
      return res.needsSetup;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await checkSetup();
      setIsLoading(false);
      emitAuthChange({
        isAuthenticated: Boolean(token || adminKey),
        user,
        adminKey: Boolean(adminKey),
      });
    };
    init();
  }, []);

  const adminLogin = async (key: string, identity: string, password: string) => {
    const trimmedKey = key.trim();
    const trimmedIdentity = identity.trim();

    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }
    if (!trimmedIdentity || !password) {
      throw new Error('Username/Email and Password are required');
    }

    // Set admin key in storage so request headers send X-Admin-Key
    setStoredAdminKey(trimmedKey);
    setAdminKey(trimmedKey);

    try {
      const res = await api.adminLogin(trimmedIdentity, password);
      if (!res.token) {
        throw new Error('Authentication succeeded but no token was returned');
      }

      const userData: UserInfo = res.record || {
        username: trimmedIdentity.includes('@') ? trimmedIdentity.split('@')[0] : trimmedIdentity,
        email: trimmedIdentity.includes('@') ? trimmedIdentity : '',
        role: 'Admin',
      };
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
      setUser(null);
      setToken(null);
      emitAuthChange({
        isAuthenticated: false,
        user: null,
        adminKey: false,
      });
      emitAppAction({
        action: 'auth:login-failed',
        category: 'auth',
        details: { error: err.message },
      });
      throw new Error(err.message || 'Invalid Admin Key or root credentials');
    }
  };

  const login = async (key: string, identity?: string, password?: string) => {
    if (identity && password) {
      return adminLogin(key, identity, password);
    }

    // Admin key only
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      throw new Error('Master Admin Key is required');
    }
    setStoredAdminKey(trimmedKey);
    setAdminKey(trimmedKey);
    try {
      const res = await api.verifyAdminKey();
      setNeedsSetup(res.needsSetup);
      emitAuthChange({
        isAuthenticated: true,
        user: { username: 'admin', role: 'Admin' },
        adminKey: true,
      });
      emitAppAction({
        action: 'auth:admin-key-verified',
        category: 'auth',
        details: { needsSetup: res.needsSetup },
      });
    } catch (err: any) {
      removeStoredAdminKey();
      setAdminKey(null);
      emitAuthChange({
        isAuthenticated: false,
        user: null,
        adminKey: false,
      });
      throw new Error(err.message || 'Invalid Master Admin Key (Unauthorized)');
    }
  };

  const saveAdminKey = (key: string) => {
    const trimmed = key.trim();
    setStoredAdminKey(trimmed);
    setAdminKey(trimmed);
    emitAuthChange({
      isAuthenticated: true,
      user,
      adminKey: true,
    });
  };

  const saveToken = (jwtToken: string) => {
    setAuthToken(jwtToken);
    setToken(jwtToken);
    emitAuthChange({
      isAuthenticated: true,
      user,
      adminKey: Boolean(adminKey),
    });
  };

  const logout = () => {
    removeAuthToken();
    removeStoredAdminKey();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setToken(null);
    setAdminKey(null);

    emitAuthChange({
      isAuthenticated: false,
      user: null,
      adminKey: false,
    });
    emitAppAction({
      action: 'auth:logout',
      category: 'auth',
    });
  };

  const isAuthenticated = Boolean(token || adminKey);

  return (
    <AuthContext.Provider
      value={{
        token,
        adminKey,
        user: user || (isAuthenticated ? { username: 'admin', role: 'Admin' } : null),
        isAuthenticated,
        needsSetup,
        isLoading,
        adminLogin,
        login,
        saveAdminKey,
        saveToken,
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
