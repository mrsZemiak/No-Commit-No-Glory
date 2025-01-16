import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "@/config/axiosConfig";

export const usePaperStore = defineStore("papers", () => {
  //Reactive state
  const participantPapers = ref<Array<any>>([]);
  const selectedPaper = ref<any>(null);
  const reviewerPapers = ref<Array<any>>([]);
  const adminPapers = ref<Array<any>>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  //Actions
  /** Participant Actions **/
  const createPaper = async (paper: any, file: File, isFinal: boolean) => {
    try {
      const formData = new FormData();
      Object.keys(paper).forEach((key) => formData.append(key, paper[key]));
      formData.append("file", file);
      formData.append("isFinal", String(isFinal)); // Indicates if this is the final submission

      const response = await axiosInstance.post("/auth/participant/papers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      participantPapers.value.push(response.data); // Add to participant papers
      return response.data;
    } catch (err) {
      console.error("Failed to create paper:", err);
      throw err;
    }
  };

  const getMyPapers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/participant/papers");
      participantPapers.value = response.data; // Fetch all papers where participant is the author
    } catch (err) {
      error.value = "Failed to fetch participant papers.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const getPaperById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get(`/auth/participant/papers/${id}`);
      selectedPaper.value = response.data; // Set the selected paper details
      return response.data;
    } catch (err) {
      error.value = "Failed to fetch paper details.";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePaper = async (id: string, updates: any, file?: File) => {
    try {
      const formData = new FormData();
      Object.keys(updates).forEach((key) => formData.append(key, updates[key]));
      if (file) {
        formData.append("file", file); // Include file if provided
      }

      const response = await axiosInstance.patch(`/auth/participant/papers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const index = participantPapers.value.findIndex((p) => p._id === id);
      if (index !== -1) {
        participantPapers.value[index] = { ...participantPapers.value[index], ...updates };
      }
      return response.data;
    } catch (err) {
      console.error("Failed to update paper:", err);
      throw err;
    }
  };

  /** Reviewer Actions **/
  const getAssignedPapers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/reviewer/papers");
      reviewerPapers.value = response.data; // Fetch all assigned papers
    } catch (err) {
      error.value = "Failed to fetch assigned papers.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const downloadPaperForReview = async (paperId: string) => {
    try {
      const response = await axiosInstance.get(`/auth/reviewer/papers/${paperId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "paper.pdf"); // Change filename as needed
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Failed to download paper for review:", err);
      throw err;
    }
  };

  /** Admin Actions **/
  const getAllPapersGroupedByConference = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get("/auth/admin/papers");
      adminPapers.value = response.data; // Papers grouped by conference
    } catch (err) {
      error.value = "Failed to fetch papers for admin.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const updatePaperDeadline = async (paperId: string, deadline: string): Promise<void> => {
    try {
      await axiosInstance.patch(`/auth/admin/papers/${paperId}/deadline`, { deadline });

      const conferenceIndex: number = adminPapers.value.findIndex((conference: { papers: Array<{ _id: string }> }) =>
        conference.papers.some((p: { _id: string }) => p._id === paperId)
      );

      if (conferenceIndex !== -1) {
        const paperIndex: number = adminPapers.value[conferenceIndex].papers.findIndex(
          (p: { _id: string }) => p._id === paperId
        );
        if (paperIndex !== -1) {
          adminPapers.value[conferenceIndex].papers[paperIndex].deadline = deadline;
        }
      }
    } catch (err) {
      console.error("Failed to update paper deadline:", err);
      throw err;
    }
  };

  const assignReviewerToPaper = async (paperId: string, reviewerId: string) => {
    try {
      await axiosInstance.patch(`/auth/admin/papers/${paperId}/reviewer`, { reviewerId });
    } catch (err) {
      console.error("Failed to assign reviewer:", err);
      throw err;
    }
  };

  const downloadAllPapersInConference = async (conferenceId: string) => {
    try {
      const response = await axiosInstance.get(`/auth/admin/conferences/${conferenceId}/papers/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "conference-papers.zip"); // Change filename as needed
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Failed to download papers for conference:", err);
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
    getPaperById,
    updatePaper,

    //Reviewer Actions
    getAssignedPapers,
    downloadPaperForReview,

    //Admin Actions
    getAllPapersGroupedByConference,
    updatePaperDeadline,
    assignReviewerToPaper,
    downloadAllPapersInConference,
  };
});
