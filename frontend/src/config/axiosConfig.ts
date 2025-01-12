import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 5000,
});

// Axios request interceptor to set the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios response interceptor to handle errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();

    // If token is expired, try refreshing
    if (error.response?.status === 401) {
      try {
        await authStore.refreshAccessToken();
        // Retry the failed request with the new token
        error.config.headers['Authorization'] = `Bearer ${authStore.token}`;
        return axiosInstance.request(error.config);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await authStore.logout();
        throw error;
      }
    }
    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
