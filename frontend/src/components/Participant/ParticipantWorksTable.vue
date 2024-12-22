<template xmlns="http://www.w3.org/1999/html">
  <div class="table-card">
    <div class="card-header">
      <header class="table-header">
        <h3>Moje práce</h3>
      </header>
    </div>

    <div class="filters">
      <div class="filter-dropdown">
        <button @click="dropdownOpen = !dropdownOpen" class="btn btn-primary">
          Filter
        </button>

        <div v-if="dropdownOpen" class="dropdown-content">
          <div class="filter-group">
            <label class="fw-bold">Názov:</label>
            <input
              type="text"
              class="form-control"
              v-model="filters.name"
              placeholder="Filtrovať podľa názvu"
            />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Konferencia:</label>
            <input
              type="text"
              class="form-control"
              v-model="filters.conference"
              placeholder="Filtrovať podľa konferencie"
            />
          </div>

          <div class="filter-group">
            <div class="filter-checkbox">
              <label class="fw-bold">Hodnotenie:</label>
              <div>
                <input
                  type="checkbox"
                  value="true"
                  v-model="filters.selectedReviews"
                />
                <label>Ohodnotené</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  value="false"
                  v-model="filters.selectedReviews"
                />
                <label>Neohodnotené</label>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <button @click="resetFilters" class="btn btn-primary btn-sm">Zrušiť filtrovanie</button>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>Názov</th>
          <th>Konferencia</th>
          <th>Čas poslania</th>
          <th>Hodnotenie</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(work, index) in paginatedWorks" :key="index">
          <td>{{ work.name }}</td>
          <td>{{ work.conference }}</td>
          <td>{{ formatTimestamp(work.timestamp) }}</td>
          <td>
              <span :class="work.reviewed ? 'badge badge-success' : 'badge badge-secondary'">
                {{ work.reviewed ? "Ohodnotené" : "Neohodnotené" }}
              </span>
          </td>
          <td>
            <button @click="viewReview(work)" class="btn btn-primary btn-sm">Pozrieť hodnotenie</button>
            <button class="btn btn-edit btn-sm ml-2" @click="editWork(work)">Upraviť</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-footer">
      <div class="pagination">
        <button
          class="btn btn-primary"
          @click="currentPage > 1 && (currentPage--)"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <span class="pagination-current">Strana {{ currentPage }}</span>
        <button
          class="btn btn-primary"
          @click="currentPage < totalPages && (currentPage++)"
          :disabled="currentPage === totalPages || remainingItems <= perPage"
        >
          Next
        </button>
      </div>
    </footer>
  </div>
</template>



<script lang="ts">
import { defineComponent, computed } from "vue";

interface Work {
  name: string;
  conference: string;
  timestamp: number;
  reviewed: boolean;
}

export default defineComponent({
  name: "ParticipantWorksTable",
  data() {
    return {
      works: [
        { name: "Math Assignment 1", conference: "A", timestamp: 1678901234000, reviewed: true },
        { name: "History Essay", conference: "B", timestamp: 1678992345000, reviewed: false },
        { name: "Physics Lab Report", conference: "A", timestamp: 1679083456000, reviewed: true },
        { name: "Literature Review", conference: "A", timestamp: 1679174567000, reviewed: false },
        { name: "Literature Review", conference: "A", timestamp: 1679174567000, reviewed: false },
      ] as Work[],
      filters: {
        name: "",
        conference: "",
        selectedReviews: [] as string[],
      },
      dropdownOpen: false,
      currentPage: 1,
      perPage: 10,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredWorks.length / this.perPage);
    },
    paginatedWorks() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      return this.filteredWorks.slice(startIndex, startIndex + this.perPage);
    },
    remainingItems() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const remaining = this.filteredWorks.length - startIndex;
      return remaining;
    },

    filteredWorks() {
      return this.works.filter((work) => {
        const matchesName =
          this.filters.name === "" ||
          work.name.toLowerCase().includes(this.filters.name.toLowerCase());
        const matchesConference =
          this.filters.conference.length === 0 ||
          this.filters.conference.includes(work.conference);
        const matchesReviewed =
          this.filters.selectedReviews.length === 0 ||
          this.filters.selectedReviews.includes(String(work.reviewed));
        return matchesName && matchesConference && matchesReviewed;
      });
    },
  },
  methods: {
    formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    viewReview(work: Work): void {
      alert(`Viewing review for: ${work.name}`);
    },
    editWork(work: Work): void {
      alert(`Editing work: ${work.name}`);
    },
    resetFilters(): void {
      this.filters.name = "";
      this.filters.conference = "";
      this.filters.selectedReviews = [];
    },
  },
});
</script>

<style scoped>

</style>
