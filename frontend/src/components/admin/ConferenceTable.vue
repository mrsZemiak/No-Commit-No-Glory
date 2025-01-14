<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <h3>Konferencie</h3>

      </div>
    </v-card-title>

    <!-- Filters Section -->
    <v-card-subtitle>
      <v-row>
        <v-col cols="10" md="2">
          <v-text-field
            v-model="filters.year"
            label="Filtrovať podľa roku"
            type="number"
            outlined
            dense
          />
        </v-col>
        <v-col cols="10" md="3">
          <v-text-field
            v-model="filters.university"
            label="Filtrovať podľa univerzity"
            outlined
            dense
          />
        </v-col>
        <v-col cols="10" md="3">
          <v-text-field
            v-model="filters.location"
            label="Filtrovať podľa miesta"
            outlined
            dense
          />
        </v-col>
        <v-col cols="10" md="2">
          <v-select
            v-model="filters.selectedStatus"
            :items="statusOptions"
            label="Stav"
            outlined
            dense
            multiple
          />
        </v-col>
        <v-col cols="8" md="2">
          <v-btn color="primary" small @click="resetFilters">Zrušiť filtr</v-btn>
        </v-col>
      </v-row>
    </v-card-subtitle>

    <!-- Data Table -->
    <v-data-table
      :headers="tableHeaders"
      :items="filteredConferences"
      :items-per-page="perPage"
      :pageText="'{0}-{1} z {2}'"
      items-per-page-text="Konferencie na stránku"
      item-value="_id"
      dense
      class="custom-table"

    >
      <template v-slot:body="{ items }">
        <tr v-for="conference in items" :key="conference._id" class="custom-row">
          <td>
            <v-chip
              :color="conference.status === 'Aktuálna' ? 'green' :
              conference.status === 'Nadchádzajúce' ? 'yellow' :
              conference.status === 'Zrušená' ? 'red' : 'grey'"
              dark
              small
              class="custom-chip"
            >
              {{ conference.status }}
            </v-chip>
          </td>
          <td>{{ conference.year }}</td>
          <td>{{ formatTimestamp(conference.date) }}</td>
          <td>{{ conference.university }}</td>
          <td>{{ conference.location }}</td>
          <td>{{ formatTimestamp(conference.start_date) }}</td>
          <td>{{ formatTimestamp(conference.end_date) }}</td>
          <td>{{ formatTimestamp(conference.deadline_submission) }}</td>
          <td style="display: flex; justify-content: center; align-items: center;">
            <v-btn color="primary" @click="viewConferenceDetails(conference)">
              <v-icon size="24">mdi-eye</v-icon>
            </v-btn>
            <v-btn color="#E7B500" class="btn_icons" @click="openDialog('edit', conference)">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
            <v-btn color="tertiary" @click="viewWorksForConference(conference)">
              <v-icon size="24" color="black">mdi-file</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-btn color="primary" class="add_new" @click="openDialog('add')">Pridať konferenciu</v-btn>

    <!-- Dialog for Add/Edit -->
    <v-dialog v-model="dialogVisible" max-width="800px" class="modal-card">
      <v-card>
        <v-card-title>
          {{ dialogMode === 'add' ? 'Pridať konferenciu' : dialogMode === 'edit' ? 'Upraviť konferenciu' : 'Detail konferencie' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="dialogForm.status"
                  :items="statusOptions"
                  label="Stav"
                  outlined
                  dense
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.year"
                  label="Rok"
                  outlined
                  dense
                  type="number"
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.date"
                  label="Dátum konferencie"
                  outlined
                  dense
                  type="date"
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"

                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.university"
                  label="Univerzita"
                  outlined
                  dense
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.location"
                  label="Miesto"
                  outlined
                  dense
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.deadline_submission"
                  label="Deadline"
                  outlined
                  dense
                  type="date"
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.start_date"
                  label="Začiatok konferencie"
                  outlined
                  dense
                  type="date"
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dialogForm.end_date"
                  label="Koniec konferencie"
                  outlined
                  dense
                  type="date"
                  required
                  class="large-text-field"
                  :disabled="dialogMode === 'view'"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="closeDialog">Zrušiť</v-btn>
          <v-btn v-if="dialogMode === 'view'" color="primary" @click="dialogMode = 'edit'">Upraviť</v-btn>
          <v-btn v-if="dialogMode !== 'view'" color="primary" large @click="saveConference">Uložiť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import axiosInstance from "@/config/axiosConfig";
import type { ConferenceAdmin } from "@/types/conference"; // Importing ConferenceAdmin type

export default defineComponent({
  name: "ConferenceTable",
  setup() {
    // State variables
    const conferences = ref<ConferenceAdmin[]>([]); // All conferences
    const filters = ref({
      year: "",
      university: "",
      location: "",
      selectedStatus: [] as string[],
    });
    const dialogVisible = ref(false); // Dialog visibility
    const dialogMode = ref<"add" | "edit" | "view">("add"); // Dialog mode
    const dialogForm = ref<Partial<ConferenceAdmin>>({}); // Form data for dialog
    const snackbar = ref({
      show: false,
      message: "",
      color: "error",
      timeout: 5000,
    });
    const currentPage = ref(1); // Current page
    const perPage = ref(10); // Items per page
    const router = useRouter(); // Vue Router

    // Table Headers
    const tableHeaders = ref([
      { title: "Stav", value: "status" },
      { title: "Rok", value: "year", sortable: true },
      { title: "Konferencia", value: "date", sortable: true },
      { title: "Univerzita", value: "university" },
      { title: "Miesto", value: "location" },
      { title: "Začiatok", value: "start_date", sortable: true },
      { title: "Koniec", value: "end_date", sortable: true },
      { title: "Odovzdanie prác", value: "deadline_submission" },
      { title: "", value: "actions", sortable: false },
    ]);
    // Status options for filtering
    const statusOptions = ['Nadchádzajúca', 'Aktuálna', 'Ukončená', 'Zrušená'];


    // Computed properties
    const filteredConferences = computed(() => {
      return conferences.value.filter((conference) => {
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

    const totalPages = computed(() => {
      return Math.ceil(filteredConferences.value.length / perPage.value);
    });

    // Methods

    // Snackbar display helper
    const showSnackbar = (message: string, color: string) => {
      snackbar.value = { show: true, message, color, timeout: 5000 };
    };

    // Fetch conferences from API
    const fetchConferences = async () => {
      try {
        const response = await axiosInstance.get("/auth/admin/conferences");
        conferences.value = response.data.map((conference: any) => ({
          ...conference,
          date: new Date(conference.date), // Convert to Date object
          start_date: new Date(conference.start_date),
          end_date: new Date(conference.end_date),
          deadline_submission: new Date(conference.deadline_submission),
          deadline_review: conference.deadline_review ? new Date(conference.deadline_review) : null,
        }));
        showSnackbar("Konferencie boli úspešne načítané", "success");
      } catch (error) {
        console.error("Error fetching conferences:", error);
        showSnackbar("Nepodarilo sa načítať konferencie", "error");
      }
    };

    const openDialog = (mode: 'add' | 'edit' | 'view', conference: ConferenceAdmin | null = null) => {
      dialogMode.value = mode; // Set the mode
      dialogVisible.value = true; // Show the dialog

      if (mode === 'add') {
        // Initialize form with default values
        dialogForm.value = {
          year: new Date().getFullYear(),
          university: '',
          date: new Date(), // Keep as Date object
          location: '',
          start_date: new Date(),
          end_date: new Date(),
          deadline_submission: new Date(),
          status: 'Nadchádzajúca',
        };
      } else if (conference) {
        // Populate form with conference data
        dialogForm.value = {
          ...conference, // Copy the conference data directly
          date: new Date(conference.date), // Convert to Date objects
          start_date: new Date(conference.start_date),
          end_date: new Date(conference.end_date),
          deadline_submission: new Date(conference.deadline_submission),
        };
      }
    };

    // Add a new conference
    const saveConference = async () => {
      try {
        if (dialogMode.value === "add") {
          const response = await axiosInstance.post("/auth/admin/conferences", dialogForm.value);
          conferences.value.push(response.data); // Add the new conference to the local state
          showSnackbar("Konferencia bola úspešne pridaná", "success");
        } else if (dialogMode.value === "edit") {
          const response = await axiosInstance.patch(`/auth/admin/conferences/${dialogForm.value._id}`, dialogForm.value);
          const index = conferences.value.findIndex(c => c._id === dialogForm.value._id);
          if (index !== -1) {
            conferences.value[index] = response.data;
            conferences.value = [...conferences.value];
          }
          showSnackbar("Konferencia bola úspešne upravená", "success");
        }
      } catch (error) {
        console.error("Error saving conference:", error);
        showSnackbar(
          dialogMode.value === "add"
            ? "Nepodarilo sa pridať konferenciu"
            : "Nepodarilo sa upraviť konferenciu",
          "error"
        );
      } finally {
        closeDialog(); // Close the dialog after saving
      }
    };

    // Open dialog to add a new conference
    const addConference = () => {
      dialogMode.value = "add";
      dialogForm.value = {};
      dialogVisible.value = true;
    };

    // Open dialog to edit an existing conference
    const editConference = (conference: ConferenceAdmin) => {
      dialogMode.value = "edit";
      dialogForm.value = { ...conference };
      dialogVisible.value = true;
    };

    // View conference details
    const viewConferenceDetails = (conference: ConferenceAdmin) => {
      dialogMode.value = "view";
      dialogForm.value = { ...conference };
      dialogVisible.value = true;
    };

    // Navigate to works for a conference
    const viewWorksForConference = (conference: ConferenceAdmin) => {
      router.push({ name: "ConferencePapers", params: { conferenceId: conference._id } });
    };

    // Close dialog
    const closeDialog = () => {
      dialogVisible.value = false;
    };

    // Reset filters
    const resetFilters = () => {
      filters.value = {
        university: "",
        year: "",
        location: "",
        selectedStatus: [],
      };
    };

    // Format timestamp for display
    const formatTimestamp = (value: number | Date | null): string => {
      if (!value) return "N/A";
      const date =
        value instanceof Date ? value : new Date(value);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // Lifecycle
    fetchConferences();

    return {
      conferences,
      filters,
      dialogVisible,
      dialogMode,
      dialogForm,
      snackbar,
      currentPage,
      perPage,
      tableHeaders,
      statusOptions,
      totalPages,
      filteredConferences,
      openDialog,
      showSnackbar,
      fetchConferences,
      addConference,
      editConference,
      viewConferenceDetails,
      viewWorksForConference,
      saveConference,
      closeDialog,
      resetFilters,
      formatTimestamp,
    };
  },
});
</script>

<style lang="scss">

</style>
