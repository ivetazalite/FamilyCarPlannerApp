import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '@/utils/storage';
import api from '@/utils/api';
import type { User, RegisterData } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await storage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      console.log('[Auth] Restoring session from stored token');
      const { data } = await api.get<User>('/api/users/me');
      setUser(data);
      console.log('[Auth] Session restored for user:', data.email);
    } catch (e) {
      console.warn('[Auth] Session restore failed:', e);
      await storage.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    console.log('[Auth] Login attempt for:', email);
    const { data } = await api.post('/api/auth/login', { email, password });
    await storage.setItem('accessToken', data.accessToken);
    await storage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    console.log('[Auth] Login successful for:', data.user.email);
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    console.log('[Auth] Register attempt for:', registerData.email);
    const { data } = await api.post('/api/auth/register', registerData);
    await storage.setItem('accessToken', data.accessToken);
    await storage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    console.log('[Auth] Registration successful for:', data.user.email);
  }, []);

  const logout = useCallback(async () => {
    console.log('[Auth] Logging out user:', user?.email);
    await storage.clearTokens();
    setUser(null);
    console.log('[Auth] Logout complete');
  }, [user]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    console.log('[Auth] Updating profile:', profileData);
    const { data } = await api.patch<User>('/api/users/me', profileData);
    setUser(data);
    console.log('[Auth] Profile updated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
