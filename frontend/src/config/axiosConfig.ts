import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
});

// Add Axios response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      try {
        await authStore.refreshAccessToken(); // Attempt to refresh the token

        // Retry the original request with the new token
        error.config.headers['Authorization'] = `Bearer ${authStore.token}`;
        return axiosInstance(error.config);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await authStore.logout(); // Logout if token refresh fails
      }
    }
    return Promise.reject(error); // Reject other errors
  }
);

export default axiosInstance;
