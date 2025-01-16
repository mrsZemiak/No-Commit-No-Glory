import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "@/config/axiosConfig";

export const useUserStore = defineStore("users", () => {
  // Reactive state
  const adminUsers = ref<Array<any>>([]);
  const userProfile = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  // Admin-specific actions
  const fetchAllUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/admin/users");
      adminUsers.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch users.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchUserById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get(`/auth/admin/users/${id}`);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch user by ID:", err);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: { email?: string; role?: string; status?: string }) => {
    try {
      const response = await axiosInstance.patch(`/auth/admin/users/${id}`, updates);
      const index = adminUsers.value.findIndex((u) => u._id === id);
      if (index !== -1) {
        adminUsers.value[index] = { ...adminUsers.value[index], ...updates };
      }
      return response.data;
    } catch (err) {
      console.error("Failed to update user:", err);
      throw err;
    }
  };

  // Profile-specific actions
  const fetchUserProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/profile");
      userProfile.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch user profile.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const updateUserProfile = async (updatedProfile: any, avatarFile?: File) => {
    try {
      const formData = new FormData();
      Object.keys(updatedProfile).forEach((key) => {
        formData.append(key, updatedProfile[key]);
      });

      if (avatarFile) {
        formData.append("avatar", avatarFile); // Include avatar file if provided
      }

      const response = await axiosInstance.patch("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      userProfile.value = response.data;
      return response.data;
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  };

  return {
    // State
    adminUsers,
    userProfile,
    loading,
    error,

    // Actions
    fetchAllUsers,
    fetchUserById,
    updateUser,
    fetchUserProfile,
    updateUserProfile,
  };
});
