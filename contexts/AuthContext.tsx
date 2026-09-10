import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, RegisterData } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const MOCK_USER: User = {
  id: 'mock-1',
  name: 'Alice Smith',
  email: 'alice@family.com',
  color: '#3B82F6',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[Auth] Using mock user — backend not available');
    setUser(MOCK_USER);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log('[Auth] Login button pressed for:', email);
    setUser({ ...MOCK_USER, email });
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    console.log('[Auth] Register button pressed for:', registerData.email);
    setUser({ ...MOCK_USER, email: registerData.email, name: registerData.name, color: registerData.color });
  }, []);

  const logout = useCallback(async () => {
    console.log('[Auth] Logout button pressed, clearing mock user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    console.log('[Auth] Update profile called with:', profileData);
    setUser(prev => (prev ? { ...prev, ...profileData } : prev));
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
