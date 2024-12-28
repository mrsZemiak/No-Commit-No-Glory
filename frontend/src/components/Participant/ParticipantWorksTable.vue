<template>
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
              v-model="filters.title"
              placeholder="Filtrovať podľa názvu"
            />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Kategória:</label>
            <input
              type="text"
              class="form-control"
              v-model="filters.category"
              placeholder="Filtrovať podľa konferencie"
            />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Stav práce:</label>
            <div>
              <input
                type="checkbox"
                value="submitted"
                v-model="filters.selectedReviews"
              />
              <label>Odoslané</label>
            </div>
            <div>
              <input
                type="checkbox"
                value="under_review"
                v-model="filters.selectedReviews"
              />
              <label>V procese hodnotenia</label>
            </div>
            <div>
              <input
                type="checkbox"
                value="approved"
                v-model="filters.selectedReviews"
              />
              <label>Schválené</label>
            </div>
            <div>
              <input
                type="checkbox"
                value="rejected"
                v-model="filters.selectedReviews"
              />
              <label>Zamietnuté</label>
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
          <th>Kategória</th>
          <th>Čas poslania</th>
          <th>Hodnotenie</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(work, index) in paginatedWorks" :key="index">
          <td>{{ work.title }}</td>
          <td>{{ work.category.name }}</td>
          <td>{{ formatTimestamp(work.submission_date) }}</td>
          <td>
            <span
              :class="{
                  'badge badge-secondary': work.status === 'submitted',
                  'badge badge-warning': work.status === 'under_review',
                  'badge badge-success': work.status === 'approved',
                  'badge badge-danger': work.status === 'rejected',
                }"
            >
                {{ statusLabels[work.status] || "Neznámy stav" }}
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
import { defineComponent } from "vue";
import axios from "axios";

export interface Paper {
  title: string;
  category: { name: string };
  submission_date: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
}

export default defineComponent({
  name: "ParticipantWorksTable",
  data() {
    return {
      works: [] as Paper[],
      filters: {
        title: "",
        category: "",
        selectedReviews: [] as string[],
      },
      dropdownOpen: false,
      currentPage: 1,
      perPage: 10,
      error: "",
      statusLabels: {
        submitted: "Odoslané",
        under_review: "V procese hodnotenia",
        approved: "Schválené",
        rejected: "Zamietnuté",
      },
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
          this.filters.title === "" ||
          work.title.toLowerCase().includes(this.filters.title.toLowerCase());
        const matchesConference =
          this.filters.category.length === 0 ||
          this.filters.category.includes(work.category.name);
        const matchesReviewed =
          this.filters.selectedReviews.length === 0 ||
          this.filters.selectedReviews.includes(String(work.status));
        return matchesName && matchesConference && matchesReviewed;
      });
    },
  },
  methods: {
    async fetchPapers() {
      try {
        const response = await axios.get("http://localhost:3000/api/participants/papers", {
          params: {userId: "676edcaa19ea5a907dc17565"}, // vymaž po logine
        });
        this.works = response.data;
      } catch (err) {
        this.error = "Nepodarilo sa načítať práce.";
      }
    },
    formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    viewReview(work: Paper): void {
        this.$router.push({ name: 'ReviewResult', params: { id: work.title } }); //zmeň
    },
    editWork(work: Paper): void {
      alert(`Editing work: ${work.title}`);
    },
    resetFilters(): void {
      this.filters.title = "";
      this.filters.category = "";
      this.filters.selectedReviews = [];
    },
  },
  mounted() {
    this.fetchPapers();
  }
});
</script>

<style scoped>

</style>
