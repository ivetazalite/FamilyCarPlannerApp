import * as SecureStore from 'expo-secure-store';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('[storage] setItem error:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('[storage] removeItem error:', e);
    }
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken').catch(() => {}),
      SecureStore.deleteItemAsync('refreshToken').catch(() => {}),
    ]);
  },
};
