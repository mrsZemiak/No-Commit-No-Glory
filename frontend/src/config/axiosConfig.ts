import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  timeout: 5000,
})

// Axios request interceptor to set the Authorization header
axiosInstance.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Axios response interceptor to handle errors and token refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const authStore = useAuthStore()

    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message

      if (errorMessage === 'Token expired') {
        console.log('Token expired, setting isTokenExpired to true')
        authStore.isTokenExpired = true // Trigger modal in layout
        return Promise.reject(error) // Let frontend handle it
      }

      if (errorMessage === 'Invalid token') {
        console.log('Invalid token, logging out')
        await authStore.logout()
        return Promise.reject(error) // Let frontend handle it
      }
    }

    return Promise.reject(error) // Other errors
  },
)

export default axiosInstance
