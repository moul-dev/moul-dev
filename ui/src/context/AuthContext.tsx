import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken, getStoredAdminKey, setStoredAdminKey, removeStoredAdminKey } from '../api/client';

interface AuthContextType {
  token: string | null;
  adminKey: string | null;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [adminKey, setAdminKey] = useState<string | null>(getStoredAdminKey());
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

      setAuthToken(res.token);
      setToken(res.token);
    } catch (err: any) {
      removeAuthToken();
      setToken(null);
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
    } catch (err: any) {
      removeStoredAdminKey();
      setAdminKey(null);
      throw new Error(err.message || 'Invalid Master Admin Key (Unauthorized)');
    }
  };

  const saveAdminKey = (key: string) => {
    const trimmed = key.trim();
    setStoredAdminKey(trimmed);
    setAdminKey(trimmed);
  };

  const saveToken = (jwtToken: string) => {
    setAuthToken(jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    removeAuthToken();
    removeStoredAdminKey();
    setToken(null);
    setAdminKey(null);
  };

  const isAuthenticated = Boolean(token || adminKey);

  return (
    <AuthContext.Provider
      value={{
        token,
        adminKey,
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
