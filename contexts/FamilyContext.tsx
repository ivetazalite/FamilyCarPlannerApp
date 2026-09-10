import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FamilySettings } from '@/types';

interface FamilyContextValue {
  settings: FamilySettings;
  updateSettings: (s: Partial<FamilySettings>) => void;
}

const DEFAULT_SETTINGS: FamilySettings = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  vehicleName: 'Kia e-Niro',
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FamilySettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((s: Partial<FamilySettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  return (
    <FamilyContext.Provider value={{ settings, updateSettings }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily(): FamilyContextValue {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
