<template>
  <div class="table-card">
    <div class="card-header">
      <header class="table-header">
        <h3>Práce na hodnotenie</h3>
      </header>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>Názov</th>
          <th>Rok konferencie</th>
          <th>Hodnotenie</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(work, index) in paginatedWorks" :key="index">
          <td>{{ work.title }}</td>
          <td>{{ work.conferenceYear }}</td>
          <td>
            <span :class="work.reviewed ? 'badge badge-success' : 'badge badge-secondary'">
              {{ work.reviewed ? "Ohodnotené" : "Neohodnotené" }}
            </span>
          </td>
          <td>
            <router-link :to="{ name: 'ReviewForm', params: { id: work._id } }">
              <button class="btn btn-edit btn-sm">Hodnotiť</button>
            </router-link>
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
          :disabled="currentPage === totalPages || paginatedWorks.length === 0"
        >
          Next
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import axios from "axios";


interface Work {
  _id: string;
  title: string;
  reviewed: boolean;
  conferenceYear: number;
}

export default defineComponent({
  name: "ReviewTable",
  data() {
    return {
      works: [] as Work[],
      currentPage: 1,
      perPage: 10,
      totalWorks: 0,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalWorks / this.perPage);
    },
    paginatedWorks() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      return this.works.slice(startIndex, startIndex + this.perPage);
    },
  },
  methods: {
    async fetchWorks() {
      try {
        const reviewerId = "6775538dedbad0434a6f9ca8"; // Replace with actual dynamic ID if needed
        const response = await axios.get(
          `http://localhost:3000/api/reviewer/assigned-papers?reviewerId=${reviewerId}`
        );
        this.works = response.data.map((paper: any) => ({
          _id: paper._id,
          title: paper.title,
          reviewed: paper.status === "reviewed",
          conferenceYear: paper.conference?.year || "Neznámy rok",
        }));
        this.totalWorks = this.works.length;
      } catch (error) {
        console.error("Failed to fetch works:", error);
      }
    },
  },
  mounted() {
    this.fetchWorks();
  },
});
</script>

<style scoped>

</style>
