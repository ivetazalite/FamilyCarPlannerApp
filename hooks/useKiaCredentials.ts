import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';

const KEY_USERNAME = 'kia_username';
const KEY_PASSWORD = 'kia_password';

interface KiaCredentials {
  username: string | null;
  password: string | null;
  isLoaded: boolean;
  hasCreds: boolean;
  save: (username: string, password: string) => Promise<void>;
  clear: () => Promise<void>;
}

export function useKiaCredentials(): KiaCredentials {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      console.log('[useKiaCredentials] Loading credentials from SecureStore');
      const [u, p] = await Promise.all([
        storage.getItem(KEY_USERNAME),
        storage.getItem(KEY_PASSWORD),
      ]);
      console.log('[useKiaCredentials] Credentials loaded, hasCreds:', !!(u && p));
      setUsername(u);
      setPassword(p);
      setIsLoaded(true);
    }
    load();
  }, []);

  const save = useCallback(async (u: string, p: string) => {
    console.log('[useKiaCredentials] Saving credentials for username:', u);
    await Promise.all([
      storage.setItem(KEY_USERNAME, u),
      storage.setItem(KEY_PASSWORD, p),
    ]);
    setUsername(u);
    setPassword(p);
    console.log('[useKiaCredentials] Credentials saved successfully');
  }, []);

  const clear = useCallback(async () => {
    console.log('[useKiaCredentials] Clearing credentials');
    await Promise.all([
      storage.removeItem(KEY_USERNAME),
      storage.removeItem(KEY_PASSWORD),
    ]);
    setUsername(null);
    setPassword(null);
    console.log('[useKiaCredentials] Credentials cleared');
  }, []);

  const hasCreds = !!(username && password);

  return { username, password, isLoaded, hasCreds, save, clear };
}
