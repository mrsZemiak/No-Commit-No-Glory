import { defineStore } from "pinia";
import axiosInstance from '@/config/axiosConfig.ts'

export const useConferencesStore = defineStore("conferences", {
  state: () => ({
    adminConferences: [] as Array<any>, // Full conference data for admins
    participantConferences: [] as Array<any>, // Limited conference data for participants
    loading: false,
    error: null as string | null,
    filters: {
      university: "",
      year: "",
      location: "",
      selectedStatus: [] as string[],
    },
  }),
  getters: {
    // Getter: Filtered conferences
    filteredConferences(state) {
      return state.adminConferences.filter((conference) => {
        const matchesUniversity = state.filters.university
          ? conference.university
            .toLowerCase()
            .includes(state.filters.university.toLowerCase())
          : true;
        const matchesYear = state.filters.year
          ? conference.year === parseInt(state.filters.year)
          : true;
        const matchesLocation = state.filters.location
          ? conference.location
            .toLowerCase()
            .includes(state.filters.location.toLowerCase())
          : true;
        const matchesStatus = state.filters.selectedStatus.length
          ? state.filters.selectedStatus.includes(conference.status)
          : true;

        return matchesUniversity && matchesYear && matchesLocation && matchesStatus;
      });
    },
  },
  actions: {
    async fetchAdminConferences() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/auth/admin/conferences");
        this.adminConferences = response.data;
      } catch (err) {
        this.error = "Failed to fetch conferences.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchConferenceById(id: string) {
      try {
        const response = await axiosInstance.get(`/auth/admin/conferences/${id}`);
        return response.data;
      } catch (err) {
        console.error("Failed to fetch conference:", err);
        throw err;
      }
    },
    async updateConference(id: string, updates: any) {
      try {
        await axiosInstance.patch(`/auth/admin/conferences/${id}`, updates);
        const index = this.adminConferences.findIndex((c) => c._id === id);
        if (index !== -1) {
          this.adminConferences[index] = { ...this.adminConferences[index], ...updates };
        }
      } catch (err) {
        console.error("Failed to update conference:", err);
        throw err;
      }
    },
    // Fetch limited conference data for participants
    async fetchParticipantConferences() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/auth/participant/conferences");
        this.participantConferences = response.data;
      } catch (err) {
        this.error = "Failed to fetch participant conferences.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
