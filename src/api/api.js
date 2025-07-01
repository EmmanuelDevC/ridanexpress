import axios from 'axios';
import { api_url } from '../utils/config';

const api = axios.create({
  baseURL: `${api_url}/api`,
  withCredentials: true
});

// ✅ Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (already in your code)
export const setupResponseInterceptor = (store) => {
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.data?.forceLogout) {
        localStorage.removeItem('customerToken');
        store.dispatch({ type: 'auth/logout' });
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
