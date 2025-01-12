import { defineStore } from 'pinia';
import axios from 'axios';
import axiosInstance from '@/config/axiosConfig';
import type { User } from '@/types/user.ts'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    role: null as string | null,
    isAuthenticated: false,
  }),

  actions: {
    async register(payload: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      confirmPassword: string;
      university: string;
      role: string;
    }) {
      try {
        const response = await axiosInstance.post('/register', payload);
        return response.data;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },

    async login(email: string, password: string) {
      try {
        const response = await axiosInstance.post('/login', { email, password });
        this.user = response.data.user;
        this.role = response.data.role || '';
        this.token = response.data.token;
        this.isAuthenticated = true;

        //Store tokens in localStorage for persistence
        if (this.token) {
          localStorage.setItem('authToken', this.token);
          localStorage.setItem('userRole', this.role || '');
          localStorage.setItem('refreshToken', response.data.refreshToken); // Save refresh token
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    async fetchUserProfile() {
      try {
        const response = await axiosInstance.get('/auth/profile');
        this.user = response.data.user;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },

    async updateProfile(updatedProfile: any) {
      try {
        const formData = new FormData();
        Object.keys(updatedProfile).forEach((key) => {
          formData.append(key, updatedProfile[key]);
        });

        const response = await axiosInstance.patch('/auth/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.user = response.data.user; // Update the user data in the store
        console.log('Profile updated successfully:', response.data.user);
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      // Clear tokens from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
    },

    async refreshAccessToken() {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;

      try {
        const response = await axiosInstance.post('/refresh-token', { refreshToken });
        this.token = response.data.token;
        localStorage.setItem('authToken', this.token || ''); // Update authToken in localStorage
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`; // Update Axios headers
      } catch (error) {
        console.error('Failed to refresh token:', error);
        await this.logout(); // Clear tokens and redirect to login if refresh fails
      }
    },

    async verifyEmail(token: string) {
      try {
        const response = await axiosInstance.get(`/verify-email?token=${token}`);
        console.log('Email verification response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Email verification failed:', error);
        throw error;
      }
    },

    async loadAuthState(): Promise<void> {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        //Initialize the access token and headers
        this.token = token;
        this.role = role;
        this.isAuthenticated = true;
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

        try {
          //Fetch user profile
          await this.fetchUserProfile();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          await this.logout();
        }
      } else if (refreshToken) {
        //If no access token, try to refresh using the refresh token
        try {
          await this.refreshAccessToken();
          this.isAuthenticated = true;
          await this.fetchUserProfile();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          await this.logout(); // Clear invalid tokens
        }
      } else {
        await this.logout(); // No valid tokens, log out
      }
    }
  },

  getters: {
    isParticipant: (state) => state.role === 'participant',
    isAdmin: (state) => state.role === 'admin',
    isReviewer: (state) => state.role === 'reviewer',
  },
});
