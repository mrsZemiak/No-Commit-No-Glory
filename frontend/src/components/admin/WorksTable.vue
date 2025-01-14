<template>
  <v-card>
    <!-- Header -->
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <h3>Práce používateľov</h3>
        <v-btn color="primary" @click="resetFilters">Zrušiť filtrovanie</v-btn>
      </div>
    </v-card-title>

    <!-- Filters Section -->
    <v-card-subtitle>
      <v-row>
        <!-- Filter fields -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.title"
            label="Filtrovať podľa názvu"
            outlined
            dense />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.category"
            label="Filtrovať podľa kategórie"
            outlined
            dense />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.year"
            label="Filtrovať podľa roka konferencie"
            type="number"
            outlined
            dense />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.selectedReviews"
            :items="reviewStatusOptions"
            label="Stav práce"
            outlined
            dense
            multiple />
        </v-col>
      </v-row>
    </v-card-subtitle>

    <!-- Data Table -->
    <v-data-table
      :headers="tableHeaders"
      :items="filteredWorks"
      :items-per-page="perPage"
      :pageText="'{0}-{1} z {2}'"
      items-per-page-text="Práce na stránku"
      item-value="_id" dense>

      <template v-slot:body="{ items }">
        <tr v-for="work in items" :key="work._id">
          <td>{{ work.title }}</td>
          <td>{{ work.category?.name }}</td>
          <td>{{ formatTimestamp(work.submission_date) }}</td>
          <td>{{ work.user?.first_name }} {{ work.user?.last_name }}</td>
          <td>{{ work.reviewer ? work.reviewer.first_name + ' ' + work.reviewer.last_name : 'Nepriradený' }}</td>
          <td>
            <v-chip
              :color="statusColors[work.status as keyof typeof PaperStatus]"
              dark
              small
            >
              {{ work.status }}
            </v-chip>
          </td>
          <td>
            <!-- Assign Reviewer Button -->
            <v-btn @click="openDialog('assign', work)" color="success" small>Priradiť recenzenta</v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Reviewer Assignment Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>
          Priradiť recenzenta pre: <strong>{{ selectedWork?.title }}</strong>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedReviewer"
            :items="reviewers"
            :item-text="(reviewer: Reviewer) => `${reviewer.first_name} ${reviewer.last_name} (${reviewer.email})`"
            :item-value="reviewer => reviewer._id"
            label="Vyberte recenzenta"
            outlined
            dense
          />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeDialog">Zrušiť</v-btn>
          <v-btn color="primary" @click="assignReviewer">Priradiť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>


<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import axiosInstance from "@/config/axiosConfig";
import { type Paper, PaperStatus } from '@/types/paper.ts'
import type { Reviewer } from '@/types/user.ts'

export default defineComponent({
  name: "WorksTable",
  computed: {
    PaperStatus() {
      return PaperStatus
    }
  },
  setup() {
    const works = ref<Paper[]>([]);
    const reviewers = ref<Reviewer[]>([]);

    const filters = ref({
      title: "",
      category: "",
      year: null as number | null,
      selectedReviews: [] as string[],
    });

    const dialogVisible = ref(false);
    const selectedWork = ref<Paper | null>(null);
    const selectedReviewer = ref<string | null>(null);
    const perPage = ref(10);
    const currentPage = ref(1);

    const tableHeaders = ref([
      { title: "Názov", value: "title" },
      { title: "Kategória", value: "category.name" },
      { title: "Čas poslania", value: "submission_date" },
      { title: "Meno používateľa", value: "user.first_name" },
      { title: "Recenzent", value: "reviewer" },
      { title: "Hodnotenie", value: "status" },
      { title: "", value: "actions", sortable: false },
    ]);

    const statusOptions =  ["Draft","Odovzdaná","Posudzovanie", "Prijatá", "Prijatá_so_zmenami","Odmietnutá"];


    const statusColors= {
      Draft: "blue",
      Submitted: "grey",
      UnderReview: "yellow",
      Accepted: "green",
      AcceptedWithChanges: "orange",
      Rejected: "red",
    };

    const reviewStatusOptions = [ "Odovzdaná","Posudzovanie", "Prijatá","Prijatá_so_zmenami", "Odmietnutá"];

    // Fetch active reviewers
    const fetchActiveReviewers = async () => {
      try {
        const response = await axiosInstance.get("/auth/admin/users");
        reviewers.value = response.data.filter(
          (user: any) => user.role.name === "reviewer" && user.status === "Aktívny"
        );
      } catch (error) {
        console.error("Failed to fetch active reviewers:", error);
      }
    };

    const fetchWorks = async () => {
      const response = await axiosInstance.get("/auth/admin/papers");
      works.value = response.data;
    };

    const openDialog = (mode: "assign", work: Paper) => {
      if (mode === "assign") {
        selectedWork.value = work;
        selectedReviewer.value = work.reviewer?._id || null;
        dialogVisible.value = true;
      }
    };

    const closeDialog = () => {
      dialogVisible.value = false;
      selectedReviewer.value = null;
    };

    const assignReviewer = async () => {
      if (selectedWork.value && selectedReviewer.value) {
        try {
          await axiosInstance.patch(`/admin/papers/${selectedWork.value._id}/reviewer`, {
            reviewerId: selectedReviewer.value,
          });
          await fetchWorks();
          closeDialog();
        } catch (error) {
          console.error("Failed to assign reviewer:", error);
        }
      }
    };

    const formatTimestamp = (timestamp: number): string => {
      const date = new Date(timestamp);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    };

    const filteredWorks = computed(() => {
      return works.value.filter((work) => {
        const matchesTitle = !filters.value.title || work.title.toLowerCase().includes(filters.value.title.toLowerCase());
        const matchesCategory = !filters.value.category || work.category.name.toLowerCase().includes(filters.value.category.toLowerCase());
        const matchesYear = !filters.value.year || new Date(work.submission_date).getFullYear() === filters.value.year;
        const matchesReviewStatus = !filters.value.selectedReviews.length || filters.value.selectedReviews.includes(work.status);

        return matchesTitle && matchesCategory && matchesYear && matchesReviewStatus;
      });
    });


    // Reset filters
    const resetFilters = () => {
      filters.value = {
        year: null,
        title: "",
        category: "",
        selectedReviews: []
      };
    };

    fetchWorks();
    fetchActiveReviewers();

    return {
      works,
      reviewers,
      filters,
      perPage,
      currentPage,
      dialogVisible,
      selectedWork,
      selectedReviewer,
      tableHeaders,
      statusColors,
      reviewStatusOptions,
      filteredWorks,
      formatTimestamp,
      resetFilters,
      openDialog,
      closeDialog,
      assignReviewer,
    };
  },
});
</script>
