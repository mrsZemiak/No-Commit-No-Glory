<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch, reactive } from 'vue'
import { usePaperStore } from "@/stores/paperStore";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { useUserStore } from '@/stores/userStore.ts'
import { type AdminPaper, PaperStatus } from '@/types/paper'

export default defineComponent({
  name: "ConferencePapers",
  computed: {
    PaperStatus() {
      return PaperStatus
    }
  },
  setup() {
    const paperStore = usePaperStore();
    const userStore = useUserStore();

    // Track which conference is expanded
    const expandedConferenceId = ref<string | null>(null);

    // Filters for conferences
    const conferenceFilters = reactive({
      year: null,
      location: "",
    });

    const itemsPerPage = 5; // Maximum conferences per page
    const currentPage = ref(1);

    // Filters for papers
    const paperFilters = reactive({
      selectedStatus: null as PaperStatus | null,
    });

    // Filtered conferences
    const filteredConferences = computed(() => {
      return groupedPapers.value.filter((conference) => {
        return (
          (!conferenceFilters.year || conference.year == conferenceFilters.year) &&
          (!conferenceFilters.location ||
            conference.location.toLowerCase().includes(conferenceFilters.location.toLowerCase()))
        );
      });
    });

    const resetConferenceFilters = () => {
      conferenceFilters.year = null;
      conferenceFilters.location = "";
    };

    const paginatedConferences = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredConferences.value.slice(start, end);
    });

    // Filtered papers for selected conference
    const filteredPapers = computed(() => {
      return paperStore.adminPapers.filter((paper) => {
        // Ensure the paper belongs to the expanded conference
        const belongsToConference =
          expandedConferenceId.value === paper.conference?._id;

        // Check if the paper matches the selected status filter
        const matchesStatus =
          !paperFilters.selectedStatus ||
          paper.status === paperFilters.selectedStatus;

        // Include the paper if it belongs to the conference and matches the filter
        return belongsToConference && matchesStatus;
      });
    });

    // Reset filters
    const resetFilters = () => {
      paperFilters.selectedStatus = null;
    };


    // Table headers for papers
    const tableHeaders = [
      { title: "", value: "view", sortable: false },
      { title: "Status", value: "status" },
      { title: "Autor", value: "user" },
      { title: "Sekcia", value: "category" },
      { title: "Recenzent", value: "reviewer" },
      { title: "Deadline", value: "deadline_date" },
      { title: "", value: "actions", sortable: false },
    ];

    //Group papers by conference
    const groupedPapers = computed(() => {
      const groups: { [key: string]: any } = {};
      paperStore.adminPapers.forEach((paper) => {
        const { conference } = paper;
        if (!conference || !conference._id) return;
        if (!groups[conference._id]) {
          groups[conference._id] = { ...conference, papers: [] };
        }
        groups[conference._id].papers.push(paper);
      });
      return Object.values(groups);
    });

    const papersForConference = computed(() => {
      if (!expandedConferenceId.value) return [];
      return paperStore.adminPapers.filter(
        (paper) => paper.conference?._id === expandedConferenceId.value
      );
    });

    const isPaperViewDialogOpen = ref(false);
    const isAssignReviewerDialogOpen = ref(false);
    const isDropdownOpen = ref(false);
    const selectedPaper = ref<AdminPaper | null>(null);
    const selectedReviewer = ref<any>(null);

    // Preprocess reviewers to include fullName
    const availableReviewers = computed(() =>
      userStore.reviewers.map((user) => ({
        ...user,
        fullName: `${user.first_name} ${user.last_name}`,
      }))
    );

    const viewPaper = async (paper: AdminPaper) => {
      try {
        selectedPaper.value = await paperStore.getPaperById(paper._id);
        isPaperViewDialogOpen.value = true;
      } catch (error) {
        console.error("Error fetching paper details:", error);
      }
    };

    //Deadline changes
    const isDeadlineDialogOpen = ref(false);
    const newDeadline = ref<Date | null>(null);

    const openDeadlineDialog = (paper: AdminPaper) => {
      selectedPaper.value = paper;
      newDeadline.value = paper.deadline_date ? new Date(paper.deadline_date) : new Date();
      isDeadlineDialogOpen.value = true;
    };

    const changeDeadline = async () => {
      if (!selectedPaper.value || !newDeadline.value) return;

      try {
        await paperStore.updateDeadline(selectedPaper.value._id, newDeadline.value); // Send Date object directly
        console.log("Deadline updated successfully!");
        isDeadlineDialogOpen.value = false;
      } catch (error) {
        console.error("Error updating deadline:", error);
      }
    };


    // Open dialog for assigning a reviewer
    const openAssignReviewerDialog = (paper: AdminPaper) => {
      selectedPaper.value = paper;
      // Fetch reviewers if not already fetched
      if (!userStore.reviewers.length) {
        userStore.fetchReviewers();
      }

      console.log("Available reviewers:", availableReviewers.value);
      selectedReviewer.value = paper.reviewer || null;
      isAssignReviewerDialogOpen.value = true;
    };

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const selectReviewer = (reviewer: any) => {
      selectedReviewer.value = reviewer;
      isDropdownOpen.value = false; // Close dropdown after selection
    };


    // Close the dialog
    const closeAssignReviewerDialog = () => {
      isAssignReviewerDialogOpen.value = false;
    };

    // Assign reviewer to the selected paper
    const assignReviewer = async () => {
      if (!selectedPaper.value || !selectedReviewer.value) return;

      try {
        await paperStore.assignReviewerToPaper(
          selectedPaper.value._id,
          selectedReviewer.value
        );
        closeAssignReviewerDialog();
        console.log("Reviewer assigned successfully!");
      } catch (error) {
        console.error("Error assigning reviewer:", error);
      }
    };

    //Toggle visibility of papers for a conference
    const toggleConference = (conferenceId: string | null) => {
      expandedConferenceId.value =
        expandedConferenceId.value === conferenceId ? null : conferenceId;
    };

    //Format dates as dd.MM.yyyy
    const formatDate = (date: string | Date | null): string => {
      if (!date) return "N/A";
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime())
        ? "Invalid Date"
        : format(parsedDate, "dd.MM.yyyy", { locale: sk });
    };

    // Fetch admin papers on mount
    onMounted(() => {
      paperStore.getAllPapers().then(() => {
        console.log("Papers from API:", paperStore.adminPapers);
      });
      userStore.fetchReviewers().then(() => {
        console.log("Reviewers:", userStore.reviewers);
      });
    });

    return {
      paperStore,
      expandedConferenceId,
      groupedPapers,
      tableHeaders,
      isAssignReviewerDialogOpen,
      selectedPaper,
      selectedReviewer,
      userStore,
      availableReviewers,
      isDropdownOpen,
      isPaperViewDialogOpen,
      isDeadlineDialogOpen,
      newDeadline,
      papersForConference,
      paginatedConferences,
      currentPage,
      itemsPerPage,
      conferenceFilters,
      paperFilters,
      filteredConferences,
      filteredPapers,
      PaperStatus,
      resetConferenceFilters,
      resetFilters,
      viewPaper,
      toggleDropdown,
      selectReviewer,
      openAssignReviewerDialog,
      closeAssignReviewerDialog,
      assignReviewer,
      changeDeadline,
      openDeadlineDialog,
      toggleConference,
      formatDate,
    };
  },
});
</script>

<template>
  <v-card class="conference-card">
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <h3>Konferenčné príspevky</h3>
      </div>
      <!-- Conference Filters -->
      <v-row class="mt-4" dense>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="conferenceFilters.year"
            label="Filter by Year"
            type="number"
            outlined
            dense
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="conferenceFilters.location"
            label="Filter by Location"
            outlined
            dense
          />
        </v-col>
        <v-col cols="12" md="3" class="d-flex justify-center align-center">
          <v-btn color="primary" @click="resetConferenceFilters">Reset Filters</v-btn>
        </v-col>
      </v-row>
    </v-card-title>


      <!-- Loop through grouped conferences -->
      <v-row>
        <v-col
          cols="12"
          v-for="conference in filteredConferences"
          :key="conference._id"
        >
          <v-card outlined class="mb-3">
            <v-card-title>
              <v-row class="align-center">
                <!-- Conference Title Section -->
                <v-col cols="9">
                  <h4>{{ conference.year }} - {{ conference.location }}</h4>
                  <p>Dátum: {{ formatDate(conference.date) }}</p>
                  <p class="green">Počet prác: {{ conference.papers.length }}</p>
                </v-col>

                <!-- Actions Section -->
                <v-col cols="3" class="d-flex justify-end align-center">
                  <v-btn
                    color="primary"
                    @click="toggleConference(conference._id)"
                  >
                    <v-icon left>
                      {{ expandedConferenceId === conference._id ? "mdi-eye-off" : "mdi-eye" }}
                    </v-icon>
                    {{ expandedConferenceId === conference._id ? "Skryť" : "Zobraziť" }} Práce
                  </v-btn>
                  <v-btn
                    color="tertiary"
                    class="mr-2"
                    @click="paperStore.downloadAllPapersInConference(conference._id)"
                  >
                    <v-icon left>mdi-download</v-icon>Stiahnuť všetky práce
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-title>

            <!-- Toggleable section for papers -->
            <v-expand-transition>
              <div v-if="expandedConferenceId === conference._id">
                <v-card-subtitle>
                  <v-row>
                    <v-col ols="6" md="4">
                      <v-select
                        v-model="paperFilters.selectedStatus"
                        :items="Object.values(PaperStatus)"
                        label="Zvolte status"
                        outlined
                        dense
                      />
                    </v-col>
                    <v-col cols="4" md="2" class="d-flex justify-center">
                      <v-btn color="primary" @click="resetFilters" small>Zrušiť filter</v-btn>
                    </v-col>
                  </v-row>
                </v-card-subtitle>
                <v-data-table
                  :headers="tableHeaders"
                  :items="filteredPapers"
                  :items-per-page="10"
                  :pageText="'{0}-{1} z {2}'"
                  items-per-page-text="Práce na stránku"
                  item-value="_id"
                  dense
                  class="custom-table"
                >
                  <template v-slot:body="{ items }">
                    <tr
                      v-for="paper in items"
                      :key="paper._id"
                      class="custom-row"
                    >
                      <td>
                        <v-icon
                          size="24"
                          color="primary"
                          @click="viewPaper(paper)"
                          style="cursor: pointer"
                        >
                          mdi-eye
                        </v-icon>
                      </td>
                      <!-- Status -->
                      <td>
                        <v-chip
                          :color="paper.status === PaperStatus.Accepted
                           ? 'green'
                           : paper.status === PaperStatus.Rejected
                           ? 'red'
                           : paper.status === PaperStatus.AcceptedWithChanges
                           ? '#2c3531'
                           : paper.status === PaperStatus.UnderReview
                           ? '#E7B500'
                           : paper.status === PaperStatus.Submitted
                           ? 'blue'
                           : 'grey'"
                          outlined
                          small
                          class="custom-chip"
                        >
                          {{ paper.status }}
                        </v-chip>
                      </td>
                      <td>
                        {{ paper.user?.first_name }} {{ paper.user?.last_name }}
                      </td>
                      <td>{{ paper.category?.name }}</td>
                      <td>{{ paper.reviewer?.email || "potrebné priradiť" }}</td>
                      <td>{{ formatDate(paper.deadline_date) }}</td>
                      <td class="d-flex justify-end align-center">
                        <!-- Assign Reviewer -->
                        <v-btn
                          color="secondary"
                          title="Assign Reviewer"
                          @click="openAssignReviewerDialog(paper)"
                        >
                          <v-icon size="24">mdi-account-plus</v-icon>
                        </v-btn>
                        <v-btn
                          color="primary"
                          @click="openDeadlineDialog(paper)"
                          title="Edit Deadline"
                        >
                          <v-icon size="24">mdi-timer-edit</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </div>
            </v-expand-transition>
            <v-dialog v-model="isAssignReviewerDialogOpen" max-width="600px" >
              <v-card>
                <v-card-title>Priradiť recenzenta</v-card-title>
                <v-card-text>
                  <div class="custom-select">
                    <div class="select-input" @click="toggleDropdown">
                      <span>{{ selectedReviewer?.fullName || "Vyberte recenzenta zo zoznamu" }}</span>
                      <v-icon>mdi-chevron-down</v-icon>
                    </div>
                    <div v-if="isDropdownOpen" class="dropdown-menu">
                      <div
                        v-for="reviewer in availableReviewers"
                        :key="reviewer._id"
                        class="dropdown-item"
                        @click="selectReviewer(reviewer)"
                      >
                        {{ reviewer.fullName }}, {{reviewer.university}} ({{ reviewer.email }})
                      </div>
                    </div>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="secondary" @click="closeAssignReviewerDialog">Zrušiť</v-btn>
                  <v-btn color="primary" @click="assignReviewer">Priradiť</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="isPaperViewDialogOpen" max-width="900px">
              <v-card>
                <v-card-title>Detaily práce</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-table dense>
                        <template v-slot:default>
                          <tbody>
                          <tr class="spaced-row">
                            <td><strong>Užívateľ:</strong></td>
                            <td>{{ selectedPaper?.user?.first_name }} {{ selectedPaper?.user?.last_name }}</td>
                          </tr>
                          <tr class="spaced-row">
                            <td><strong>Názov:</strong></td>
                            <td>{{ selectedPaper?.title }}</td>
                          </tr>
                          <tr class="spaced-row">
                            <td><strong>Kľúčové slová:</strong></td>
                            <td>{{ selectedPaper?.keywords?.join(", ") }}</td>
                          </tr>
                          <tr class="spaced-row">
                            <td><strong>Autory:</strong></td>
                            <td>
                              {{ selectedPaper?.authors
                              ?.map(
                                (author) => `${author.firstName} ${author.lastName}`
                              )
                              .join(", ") }}
                            </td>
                          </tr>
                          <tr class="spaced-row">
                            <td><strong>Sekcia:</strong></td>
                            <td>{{ selectedPaper?.category?.name }}</td>
                          </tr>
                          <tr class="spaced-row">
                            <td><strong>Deadline:</strong></td>
                            <td>{{ selectedPaper?.deadline_date ? formatDate(selectedPaper.deadline_date) : 'N/A' }}</td>
                          </tr>
                          <tr class="spaced-row">
                            <td><strong>Abstrakt:</strong></td>
                            <td><em>{{ selectedPaper?.abstract }}</em></td>
                          </tr>
                          </tbody>
                        </template>
                      </v-table>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="tertiary" @click="isPaperViewDialogOpen = false">Zrušiť</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="isDeadlineDialogOpen" max-width="400px">
              <v-card>
                <v-card-title>Zmena termínu</v-card-title>
                <v-card-text>
                  <v-date-picker
                    v-model="newDeadline"
                  ></v-date-picker>
                </v-card-text>
                <v-card-actions>
                  <v-btn @click="isDeadlineDialogOpen = false">Zrušiť</v-btn>
                  <v-btn color="primary" @click="changeDeadline">Uložiť</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card>
        </v-col>
      </v-row>
    <v-pagination
      v-model="currentPage"
      :length="Math.ceil(filteredConferences.length / itemsPerPage)"
      class="mt-4"
    />
  </v-card>
</template>

<style lang="scss" scoped>
h4 {
  color: #bc4639;
}

p {
  font-size: 1rem;
  color: #2c3531;
}

.green{
  color: #116466;
}

.custom-select {
  position: relative;
  justify-self: center;
  justify-items: center;
  width: 100%;
  max-width: 500px;

  .select-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f5f5f5;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 1000;

    .dropdown-item {
      padding: 10px;
      cursor: pointer;

      &:hover {
        background: #f0f0f0;
      }
    }
  }
}

.custom-table {
  font-size: 1.1rem;
  padding: 20px;
}

.conference-card {
  border: #116466;
}

</style>
