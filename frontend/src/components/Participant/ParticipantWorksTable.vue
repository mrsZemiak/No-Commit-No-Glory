<template>
  <div class="table-card">
    <div class="card-header">
      <header class="table-header">
        <h3>Moje práce</h3>
      </header>
    </div>

    <div class="filters">
      <div class="filter-dropdown">
        <button @click="dropdownOpen = !dropdownOpen" class="btn filter-btn btn-primary">
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
              placeholder="Filtrovať podľa kategórie"
            />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Rok konferencie:</label>
            <input
              type="number"
              class="form-control"
              v-model="filters.year"
              placeholder="Filtrovať podľa roka konferencie"
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
                value="under review"
                v-model="filters.selectedReviews"
              />
              <label>V procese hodnotenia</label>
            </div>
            <div>
              <input
                type="checkbox"
                value="accepted"
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
          <th>Rok konferencie</th>
          <th>Hodnotenie</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="work in paginatedWorks" :key="work._id">
          <td>{{ work.title }}</td>
          <td>{{ work.category.name }}</td>
          <td>{{ formatTimestamp(work.submission_date) }}</td>
          <td>{{ work.conference.year }}</td>
          <td>
              <span :class="{
                'badge badge-secondary': work.status === 'submitted',
                'badge badge-yellow': work.status === 'under review',
                'badge badge-green': work.status === 'accepted',
                'badge badge-red': work.status === 'rejected',
                'badge badge-primary': work.status === 'draft',
              }">
                {{ statusLabels[work.status] || "Neznámy stav" }}
              </span>
          </td>
          <td class="button-group-multiple">
            <router-link
              v-if="work.status === 'accepted' || work.status === 'rejected'"
              :to="{ name: 'ReviewForm', params: { id: work._id }, query: {
                isEditable: 'false',
                isReviewer: 'false'
              } }">
              <button class="btn btn-edit btn-sm ml-2">Pozrieť hodnotenie</button>
            </router-link>
            <div v-else>
              <button class="btn btn-edit btn-sm ml-2" disabled>Pozrieť hodnotenie</button>
            </div>
            <button
              v-if="work.status === 'draft'"
              class="btn btn-edit btn-sm ml-2"
              @click="editWork(work)"
            >
              Upraviť
            </button>
            <div v-else>
              <button class="btn btn-edit btn-sm ml-2" disabled>Upraviť</button>
            </div>
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
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="pagination-current">Strana {{ currentPage }}</span>
        <button
          class="btn btn-primary"
          @click="currentPage < totalPages && (currentPage++)"
          :disabled="currentPage === totalPages || remainingItems <= perPage"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export interface Author {
  firstName: string;
  lastName: string;
}

export interface Paper {
  _id: string;
  title: string;
  category: { id: string; name: string };
  submission_date: number;
  status: "submitted" | "under review" | "accepted" | "rejected" | "draft";
  conference: { id: string; year: number };
  authors: Author[];
  keywords: string[];
  abstract: string;
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
        year: null as number | null,
      },
      dropdownOpen: false,
      currentPage: 1,
      perPage: 10,
      error: "",
      statusLabels: {
        draft: "Návrh",
        submitted: "Odoslané",
        "under review": "V procese hodnotenia",
        accepted: "Schválené",
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
        const matchesCategory =
          this.filters.category === "" ||
          work.category.name
            .toLowerCase()
            .includes(this.filters.category.toLowerCase());
        const matchesYear =
          this.filters.year === null || work.conference.year === this.filters.year;
        const matchesReviewed =
          this.filters.selectedReviews.length === 0 ||
          this.filters.selectedReviews.includes(work.status);
        return matchesName && matchesCategory && matchesYear && matchesReviewed;
      });
    },
  },
  methods: {
    async fetchPapers() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/participant/papers",
          {
            params: { userId: "63f1a5b9b7d88c6d22d6f3d8" },
          }
        );
        this.works = response.data.map((work: any) => ({
          ...work,
          _id: work._id?.$oid || work._id,
        }));
      } catch (err) {
        this.error = "Nepodarilo sa načítať práce.";
      }
    },
    formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    editWork(work: Paper): void {
      this.$router.push({
        name: "EditSubmission",
        params: { workId: work._id },
      });
    },
    resetFilters(): void {
      this.filters.title = "";
      this.filters.category = "";
      this.filters.selectedReviews = [];
      this.filters.year = null;
    },
  },
  mounted() {
    this.fetchPapers();
  },
});
</script>

<style scoped>
</style>
