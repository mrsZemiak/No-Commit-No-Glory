import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '@/config/axiosConfig'

export const usePaperStore = defineStore('papers', () => {
  //Reactive state
  const participantPapers = ref<Array<any>>([])
  const selectedPaper = ref<any>(null)
  const reviewerPapers = ref<Array<any>>([])
  const adminPapers = ref<Array<any>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  //Actions
  /** Participant Actions **/
  const createPaper = async (paper: any, file: File | null, isFinal: boolean) => {
    try {
      const formData = new FormData();

      formData.append('authors', JSON.stringify(paper.authors));

      Object.keys(paper).forEach((key) => {
        const value = paper[key];
        if (key !== 'authors' && value !== undefined && value !== null && key !== "file_link") {
          if (typeof value === 'object' && value._id) {
            formData.append(key, value._id);
          } else {
            formData.append(key, value);
          }
        }
      });

      if (file && file instanceof File) {
        formData.append('file_link', file)
      }

      const response = await axiosInstance.post(
        '/auth/participant/papers',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      participantPapers.value.push(response.data); // Add to participant papers
      return response.data;
    } catch (err) {
      console.error('Failed to create paper:', err);
      throw err;
    }
  };

  const getMyPapers = async (filters?: { conference?: string; status?: string }) => {
    loading.value = true;
    error.value = null;

    try {
      const params: any = {};
      if (filters?.conference) params.conference = filters.conference;
      if (filters?.status) params.status = filters.status;

      const response = await axiosInstance.get('/auth/participant/papers', {
        params, // Send filters as query parameters
      });

      participantPapers.value = response.data;
      return response.data;
    } catch (err) {
      error.value = 'Failed to fetch participant papers.';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPaperById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`/auth/participant/papers/${id}`)
      selectedPaper.value = response.data // Set the selected paper details
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch paper details.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePaper = async (id: string, updates: any, file?: File) => {
    try {
      const formData = new FormData();

      Object.keys(updates).forEach((key) => {
        const value = updates[key];
        if (value !== undefined && value !== null && key !== "file") {
          if (typeof value === 'object' && value._id) {
            formData.append(key, value._id);
          } else {
            formData.append(key, value);
          }
        }
      });

      if (file && file instanceof File) {
        formData.append('file_link', file);
      }
      console.log("FormData contents before sending:");
      const response = await axiosInstance.patch(`/auth/participant/papers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const index = participantPapers.value.findIndex((p) => p._id === id);
      if (index !== -1) {
        participantPapers.value[index] = {
          ...participantPapers.value[index],
          ...updates,
        };
      }

      return response.data;
    } catch (err: any) {
      console.error('Failed to update paper:', err.response?.data || err.message);
      throw err;
    }
  };

  /** Reviewer Actions **/
  const getAssignedPapers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/reviewer/papers')
      reviewerPapers.value = response.data // Fetch all assigned papers
    } catch (err) {
      error.value = 'Failed to fetch assigned papers.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const downloadPaperForReview = async (paperId: string) => {
    try {
      const response = await axiosInstance.get(
        `/auth/reviewer/papers/${paperId}/download`,
        {
          responseType: 'blob',
        },
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'paper.pdf') // Change filename as needed
      document.body.appendChild(link)
      link.click()
    } catch (err) {
      console.error('Failed to download paper for review:', err)
      throw err
    }
  }

  /** Admin Actions **/
  const getAllPapers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/admin/papers");
      console.log("Raw API Response:", response.data); // Log raw response
      adminPapers.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch papers.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const getPaperById = async (paperId: string) => {
    try {
      const response = await axiosInstance.get(`/auth/admin/papers/${paperId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch paper with ID ${paperId}:`, error);
      throw error;
    }
  };

  const updateDeadline = async (paperId: string, newDeadline: Date) => {
    try {
      await axiosInstance.patch(`/auth/admin/papers/${paperId}/deadline`, {
        newDeadline,
      });
      console.log("Deadline updated successfully!");
    } catch (error) {
      console.error("Failed to update submission deadline:", error);
      throw error;
    }
  };

  const assignReviewerToPaper = async (paperId: string, reviewerId: string) => {
    try {
      const response = await axiosInstance.patch(`/auth/admin/papers/${paperId}/reviewer`, {
        reviewerId,
      });
      console.log("Reviewer assigned:", response.data);
    } catch (err) {
      console.error("Failed to assign reviewer:", err);
      throw err;
    }
  };

  const downloadPaper = async (fileLink: string) => {
    try {
      const response = await axiosInstance.get(fileLink, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "paper.pdf"); // Change as needed
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading paper:", error);
    }
  };

  const downloadAllPapersInConference = async (conferenceId: string | undefined) => {
    if (!conferenceId) {
      console.error('Conference ID is undefined');
      alert('Chyba: Neznáma konferencia. Skúste to znova.');
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/auth/admin/papers/download/${conferenceId}`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `conference-${conferenceId}-papers.zip`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Failed to download papers for conference:', err);
      alert('Nepodarilo sa stiahnuť práce. Skúste to znova.');
      throw err;
    }
  };

  return {
    //State
    participantPapers,
    selectedPaper,
    reviewerPapers,
    adminPapers,
    loading,
    error,

    //Participant Actions
    createPaper,
    getMyPapers,
    fetchPaperById,
    updatePaper,

    //Reviewer Actions
    getAssignedPapers,
    downloadPaperForReview,

    //Admin Actions
    getAllPapers,
    getPaperById,
    updateDeadline,
    assignReviewerToPaper,
    downloadPaper,
    downloadAllPapersInConference,
  }
})
