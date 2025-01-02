import { defineStore } from 'pinia';
import axios from 'axios';
import type { User } from '@/types/user.ts'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null, // User details
    token: null as string | null, // JWT token
    isAuthenticated: false, // Authentication status
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const response = await axios.post('/login', { email, password });
        this.user = response.data.user;
        this.token = response.data.token;
        this.isAuthenticated = true;

        // Store token in localStorage for persistence
        if (this.token) {
          localStorage.setItem('authToken', this.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      // Clear token from localStorage
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    },

    async verifyEmail(token: string) {
      try {
        const response = await axios.get(`/verify-email/${token}`);
        if (response.data.success) {
          console.log('Email verified successfully.');
          if (this.user) {
            this.user.isVerified = true; // Update user state
          }
        }
      } catch (error) {
        console.error('Email verification failed:', error);
        throw error;
      }
    },

    async loadAuthState(): Promise<void> {
      const token: string | null = localStorage.getItem('authToken');
      if (token) {
        try {
          // Optionally validate token (e.g., by decoding it or pinging the backend)
          this.token = token;
          this.isAuthenticated = true;
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        } catch (error) {
          console.error('Invalid token:', error);
          await this.logout(); // Await the logout promise
        }
      }
    }
  },

  getters: {
    isParticipant: (state) => state.user?.role === 'participant',
    isAdmin: (state) => state.user?.role === 'admin',
    isReviewer: (state) => state.user?.role === 'reviewer',
  },
});
