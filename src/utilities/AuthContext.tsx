import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../services/authService';
import { registerLogoutCallback } from '../services/api';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: { email: string; password: string; firstName: string; lastName: string; phone: string; }) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  refreshSession: (options?: { silent?: boolean }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = React.useCallback(() => {
    setUser(null);
    authService.clearToken();
    localStorage.removeItem('Eventify_user');
    if (window.location.pathname !== '/signin') window.location.href = '/signin';
  }, []);

  useEffect(() => { registerLogoutCallback(logout); }, [logout]);

  const refreshSession = React.useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
    const shouldShowLoading = !options?.silent;
    if (shouldShowLoading) setIsLoading(true);
    try {
      const refreshResp = await authService.refreshToken();
      authService.storeToken(refreshResp.token);
      const me = await authService.getCurrentUser();
      setUser(me);
      localStorage.setItem('Eventify_user', JSON.stringify(me));
      if (shouldShowLoading) setIsLoading(false);
      return true;
    } catch {
      logout();
      if (shouldShowLoading) setIsLoading(false);
      return false;
    }
  }, [logout]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) await refreshSession();
      setIsLoading(false);
    };
    init();
  }, [refreshSession, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await authService.signin({ email, password });
      if (!resp.token) { setIsLoading(false); return false; }
      authService.storeToken(resp.token);
      const me = await authService.getCurrentUser();
      setUser(me);
      localStorage.setItem('Eventify_user', JSON.stringify(me));
      setIsLoading(false);
      return true;
    } catch { setIsLoading(false); return false; }
  };

  const signup = async (payload: { email: string; password: string; firstName: string; lastName: string; phone: string; }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await authService.signup(payload);
      authService.storeToken(resp.token);
      const me = await authService.getCurrentUser();
      setUser(me);
      localStorage.setItem('Eventify_user', JSON.stringify(me));
      setIsLoading(false);
      return true;
    } catch { setIsLoading(false); return false; }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await authService.googleAuth(credential);
      if (!resp.token) { setIsLoading(false); return false; }
      authService.storeToken(resp.token);
      const me = await authService.getCurrentUser();
      setUser(me);
      localStorage.setItem('Eventify_user', JSON.stringify(me));
      setIsLoading(false);
      return true;
    } catch { setIsLoading(false); return false; }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, refreshSession, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};