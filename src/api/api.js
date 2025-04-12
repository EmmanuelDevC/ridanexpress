// api.js (updated)
import axios from 'axios';
import { api_url } from '../utils/config';

const api = axios.create({
  baseURL: `${api_url}/api`,
  withCredentials: true
});

// Export a function to set up interceptors later
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