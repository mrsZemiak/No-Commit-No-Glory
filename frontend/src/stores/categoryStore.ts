import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosInstance from "@/config/axiosConfig";

export const useCategoryStore = defineStore("categories", () => {
  // Reactive state
  const adminCategories = ref<Array<any>>([]);
  const participantCategories = ref<Array<any>>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchAllCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/admin/categories");
      adminCategories.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch categories.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoryById = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/auth/admin/categories/${id}`);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch category by ID:", err);
      throw err;
    }
  };

  const addCategory = async (category: any) => {
    try {
      const response = await axiosInstance.post("/auth/admin/categories", category);
      adminCategories.value.push(response.data);
    } catch (err) {
      console.error("Failed to add category:", err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: any) => {
    try {
      await axiosInstance.patch(`/auth/admin/categories/${id}`, updates);
      const index = adminCategories.value.findIndex((c) => c._id === id);
      if (index !== -1) {
        adminCategories.value[index] = { ...adminCategories.value[index], ...updates };
      }
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/auth/admin/categories/${id}`);
      adminCategories.value = adminCategories.value.filter((c) => c._id !== id);
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  };

  const fetchParticipantCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/participant/categories"); // Endpoint to fetch only active categories with names
      participantCategories.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch participant categories.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  //Computed properties
  const activeParticipantCategories = computed(() => {
    return participantCategories.value.filter((category) => category.status === "active");
  });

  return {
    //State
    adminCategories,
    participantCategories,
    loading,
    error,

    //Actions
    fetchAllCategories,
    fetchCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchParticipantCategories,

    //Computed
    activeParticipantCategories,
  };
});
