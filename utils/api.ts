import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from './storage';

const API_BASE: string =
  (Constants.expoConfig?.extra?.backendUrl as string | undefined) ??
  'http://localhost:3001';

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(`[API] Response ${res.status} ${res.config.url}`);
    return res;
  },
  async (error) => {
    const status = error.response?.status;
    console.warn(`[API] Error ${status} ${error.config?.url}`, error.message);

    if (status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = await storage.getItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('[API] Attempting token refresh');
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
            refreshToken,
          });
          await storage.setItem('accessToken', data.accessToken);
          await storage.setItem('refreshToken', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          await storage.clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE };
