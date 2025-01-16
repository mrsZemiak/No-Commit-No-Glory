import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axiosInstance from '@/config/axiosConfig.ts'

export const useConferencesStore = defineStore("conferences", () => {
  // Reactive state
  const adminConferences = ref<Array<any>>([]);
  const participantConferences = ref<Array<any>>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({
    university: "",
    year: "",
    location: "",
    selectedStatus: [] as string[],
  });

  // Computed properties
  const filteredConferences = computed(() => {
    return adminConferences.value.filter((conference) => {
      const matchesUniversity = filters.value.university
        ? conference.university
          .toLowerCase()
          .includes(filters.value.university.toLowerCase())
        : true;
      const matchesYear = filters.value.year
        ? conference.year === parseInt(filters.value.year)
        : true;
      const matchesLocation = filters.value.location
        ? conference.location
          .toLowerCase()
          .includes(filters.value.location.toLowerCase())
        : true;
      const matchesStatus = filters.value.selectedStatus.length
        ? filters.value.selectedStatus.includes(conference.status)
        : true;

      return matchesUniversity && matchesYear && matchesLocation && matchesStatus;
    });
  });

  // Actions
  const fetchAdminConferences = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/admin/conferences");
      adminConferences.value = response.data;
      syncLocalStorage();
    } catch (err) {
      error.value = "Failed to fetch conferences.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchConferenceById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get(`/auth/admin/conferences/${id}`);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch conference:", err);
      throw err;
    }
  };

  const addConference = async (conference: any) => {
    try {
      const response = await axiosInstance.post("/auth/admin/conferences", conference);
      adminConferences.value.push(response.data);
      syncLocalStorage();
    } catch (err) {
      console.error("Failed to add conference:", err);
    }
  };

  const updateConference = async (id: string, updates: any) => {
    try {
      await axiosInstance.patch(`/auth/admin/conferences/${id}`, updates);
      const index = adminConferences.value.findIndex((c) => c._id === id);
      if (index !== -1) {
        adminConferences.value[index] = {
          ...adminConferences.value[index],
          ...updates,
        };
        syncLocalStorage();
      }
    } catch (err) {
      console.error("Failed to update conference:", err);
      throw err;
    }
  };

  const fetchParticipantConferences = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/participant/conferences");
      participantConferences.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch participant conferences.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // LocalStorage synchronization
  const syncLocalStorage = () => {
    localStorage.setItem("adminConferences", JSON.stringify(adminConferences.value));
  };

  const loadFromLocalStorage = () => {
    const savedConferences = localStorage.getItem("adminConferences");
    if (savedConferences) {
      adminConferences.value = JSON.parse(savedConferences);
    }
  };

  // Cross-tab synchronization
  const syncAcrossTabs = () => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === "adminConferences") {
        adminConferences.value = JSON.parse(event.newValue || "[]");
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  };

  // Initialize store with data from localStorage and cross-tab sync
  loadFromLocalStorage();
  syncAcrossTabs();

  return {
    adminConferences,
    participantConferences,
    loading,
    error,
    filters,
    filteredConferences,
    fetchAdminConferences,
    fetchConferenceById,
    addConference,
    updateConference,
    fetchParticipantConferences,
    syncLocalStorage,
  };
});
