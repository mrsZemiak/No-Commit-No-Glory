<template>
  <v-dialog v-model="isVisible" max-width="500px">
    <v-card>
      <v-card-title>
        <span>Priradiť recenzenta pre: {{ work?.title }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-select
          v-model="selectedReviewer"
          :items="reviewers"
          item-text="fullName"
          item-value="_id"
          label="Vyberte hodnotiteľa"
          :loading="isLoading"
          outlined
        ></v-select>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="secondary" @click="closeModal">Zrušiť</v-btn>
        <v-btn color="primary" @click="assignReviewer">Priradiť</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axiosInstance from "@/config/axiosConfig";
import type { User } from "@/types/user";

export default defineComponent({
  name: "ModalAssignReviewer",
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    work: {
      type: Object,
      required: true,
    },
  },
  emits: ["close", "snackbar", "refreshWork"],
  setup(props, { emit }) {
    const reviewers = ref<User[]>([]);
    const selectedReviewer = ref<string | null>(null);
    const isLoading = ref(false);

    const fetchReviewers = async () => {
      isLoading.value = true;
      try {
        const response = await axiosInstance.get("/admin/reviewers");
        reviewers.value = response.data;
      } catch (error) {
        console.error("Error fetching reviewers:", error);
        emit("snackbar", { message: "Nepodarilo sa načítať recenzentov.", color: "error" });
      } finally {
        isLoading.value = false;
      }
    };

    const assignReviewer = async () => {
      if (!selectedReviewer.value) {
        emit("snackbar", { message: "Prosím vyberte recenzenta.", color: "error" });
        return;
      }
      try {
        const response = await axiosInstance.patch(`/admin/papers/${props.work._id}/reviewer`, {
          reviewerId: selectedReviewer.value,
        });
        emit("snackbar", { message: response.data.message, color: "success" });
        emit("refreshWork"); // Refresh the parent component's work data
        closeModal();
      } catch (error) {
        console.error("Error assigning reviewer:", error);
        emit("snackbar", { message: "Nepodarilo sa prideliť recenzenta.", color: "error" });
      }
    };

    const closeModal = () => {
      emit("close");
    };

    onMounted(() => {
      fetchReviewers();
    });

    return {
      reviewers,
      selectedReviewer,
      isLoading,
      assignReviewer,
      closeModal,
    };
  },
});
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>
