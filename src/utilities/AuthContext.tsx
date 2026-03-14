import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../services/authService';
import { registerLogoutCallback } from '../services/api';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<boolean>;
  /**
   * Refreshes token + user. If `silent` it will not toggle the global loading state.
   */
  refreshSession: (options?: { silent?: boolean }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = React.useCallback(() => {
    setUser(null);
    authService.clearToken();
    localStorage.removeItem('TketEnt_user');
    // Force redirect to signin when token invalid/expired
    if (window.location.pathname !== '/signin') {
      window.location.href = '/signin';
    }
  }, []);

  // register logout callback so api layer can clear session on 401
  useEffect(() => {
    registerLogoutCallback(logout);
  }, [logout]);

  const refreshSession = React.useCallback(
    async (options?: { silent?: boolean }): Promise<boolean> => {
      const shouldShowLoading = !options?.silent;
      if (shouldShowLoading) setIsLoading(true);

      try {
        // refresh token in case role or permissions were updated on the backend
        const refreshResp = await authService.refreshToken();
        authService.storeToken(refreshResp.token);
        const me = await authService.getCurrentUser();
        setUser(me);
        localStorage.setItem('TketEnt_user', JSON.stringify(me));


        if (shouldShowLoading) setIsLoading(false);
        return true;
      } catch (e) {
        logout();
        if (shouldShowLoading) setIsLoading(false);
        return false;
      }
    },
    [logout]
  );

  useEffect(() => {
    // attempt to restore session if token exists
    const init = async () => {
      const token = localStorage.getItem('auth_token');
    if (token) {
        await refreshSession();
      }
      setIsLoading(false);
    };
    init();
  }, [refreshSession, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Always attempt backend call, regardless of local storage state
      const resp = await authService.signin({ email, password });
      if (!resp.token) {
        setIsLoading(false);
        console.error('Sign-in failed: No token returned');
        return false;
      }
      authService.storeToken(resp.token);
      const me = await authService.getCurrentUser();
      setUser(me);
      localStorage.setItem('TketEnt_user', JSON.stringify(me));
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      console.error('Sign-in error:', err);
      return false;
    }
  };

  const signup = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await authService.signup(payload);
      authService.storeToken(resp.token);
      const me = await authService.getCurrentUser();
      setUser(me);
      localStorage.setItem('TketEnt_user', JSON.stringify(me));
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    refreshSession,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};