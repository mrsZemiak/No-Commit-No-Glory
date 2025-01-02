import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: '/a', // Replace with your backend API base URL
  timeout: 5000, // Optional: Set a timeout for requests
});

// Add Axios response interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    if (error.response?.status === 401) {
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
