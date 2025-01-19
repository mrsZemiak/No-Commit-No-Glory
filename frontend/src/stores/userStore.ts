import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '@/config/axiosConfig'
import type { User } from '@/types/user.ts'

export const useUserStore = defineStore('users', () => {
  // Reactive state
  const adminUsers = ref<Array<any>>([])
  const reviewers = ref<Array<any>>([])
  const userProfile = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  // Admin-specific actions
  const fetchAllUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/admin/users')
      adminUsers.value = response.data
      console.log("adminUSers.value",adminUsers.value)
    } catch (err) {
      error.value = 'Failed to fetch users.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`/auth/admin/users/${id}`)
      return response.data
    } catch (err) {
      console.error('Failed to fetch user by ID:', err)
      throw err
    }
  }

  const fetchReviewers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get('/auth/admin/reviewers');
      reviewers.value = response.data;
      console.log("Fetched Reviewers:", reviewers.value);
    } catch (err) {
      error.value = 'Failed to fetch reviewers.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (
    id: string,
    updates: { email?: string; role?: string; status?: string },
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/auth/admin/users/${id}`,
        updates,
      )
      const index = adminUsers.value.findIndex(u => u._id === id)
      if (index !== -1) {
        adminUsers.value[index] = { ...adminUsers.value[index], ...updates }
      }
      return response.data
    } catch (err) {
      console.error('Failed to update user:', err)
      throw err
    }
  }

  // Profile-specific actions
  const fetchUserProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/profile')
      userProfile.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch user profile.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (updatedProfile: any, avatarFile?: File) => {
    try {
      const formData = new FormData();
      Object.keys(updatedProfile).forEach((key) => {
        if (key !== "avatar") {
          formData.append(key, updatedProfile[key]);
        }
      });

      if (avatarFile && avatarFile instanceof File) {
        formData.append("avatar", avatarFile); // Append avatar file
      }

      console.log("FormData contents before sending:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]); // Logs key-value pairs
      }

      const response = await axiosInstance.patch('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      userProfile.value = response.data.user;
      return response.data;
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  };

  const setUserProfile = (profile: User) => {
    userProfile.value = profile;
  };

  return {
    // State
    adminUsers,
    userProfile,
    loading,
    error,
    reviewers,

    // Actions
    setUserProfile,
    fetchAllUsers,
    fetchUserById,
    fetchReviewers,
    updateUser,
    fetchUserProfile,
    updateUserProfile,
  }
})
