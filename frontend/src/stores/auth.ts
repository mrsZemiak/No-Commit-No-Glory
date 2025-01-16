import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosInstance from "@/config/axiosConfig";
import type { User } from "@/types/user.ts";

export const useAuthStore = defineStore("auth", () => {
  //Reactive state
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const role = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const isTokenExpired = ref(false);

  //Actions
  const register = async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    university: string;
    role: string;
  }) => {
    try {
      const response = await axiosInstance.post("/register", payload);
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/login", { email, password });
      user.value = response.data.user;
      role.value = response.data.role || "";
      token.value = response.data.token;
      isAuthenticated.value = true;

      // Store tokens in localStorage for persistence
      if (token.value) {
        localStorage.setItem("authToken", token.value);
        localStorage.setItem("userRole", role.value || "");
        localStorage.setItem("refreshToken", response.data.refreshToken);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      user.value = response.data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  const updateProfile = async (updatedProfile: any) => {
    try {
      const formData = new FormData();
      Object.keys(updatedProfile).forEach((key) => {
        formData.append(key, updatedProfile[key]);
      });

      const response = await axiosInstance.patch("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      user.value = response.data.user; // Update the user data in the store
      console.log("Profile updated successfully:", response.data.user);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const response = await axiosInstance.post("/refresh-token", { refreshToken });
      token.value = response.data.token;
      localStorage.setItem("authToken", token.value || ""); // Update authToken in localStorage
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token.value}`; // Update Axios headers
      isTokenExpired.value = false; // Reset token expiration state
    } catch (error) {
      console.error("Failed to refresh token:", error);
      isTokenExpired.value = true; // Mark token as expired
    }
  };

  const logout = async () => {
    user.value = null;
    token.value = null;
    role.value = null;
    isAuthenticated.value = false;
    isTokenExpired.value = false;

    //Clear tokens from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    delete axiosInstance.defaults.headers.common["Authorization"];
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await axiosInstance.get(`/verify-email?token=${token}`);
      console.log("Email verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  };

  const loadAuthState = async () => {
    const authToken = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const refreshToken = localStorage.getItem("refreshToken");

    if (authToken) {
      //Initialize the access token and headers
      token.value = authToken;
      role.value = userRole;
      isAuthenticated.value = true;
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      try {
        //Fetch user profile
        await fetchUserProfile();
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        await logout();
      }
    } else if (refreshToken) {
      //If no access token, try to refresh using the refresh token
      try {
        await refreshAccessToken();
        isAuthenticated.value = true;
        await fetchUserProfile();
      } catch (error) {
        console.error("Failed to refresh token:", error);
        await logout(); // Clear invalid tokens
      }
    } else {
      await logout(); // No valid tokens, log out
    }
  };

  //Getters
  const isParticipant = computed(() => role.value === "participant");
  const isAdmin = computed(() => role.value === "admin");
  const isReviewer = computed(() => role.value === "reviewer");

  return {
    user,
    token,
    role,
    isAuthenticated,
    isTokenExpired,
    register,
    login,
    fetchUserProfile,
    updateProfile,
    refreshAccessToken,
    logout,
    verifyEmail,
    loadAuthState,
    isParticipant,
    isAdmin,
    isReviewer,
  };
});
