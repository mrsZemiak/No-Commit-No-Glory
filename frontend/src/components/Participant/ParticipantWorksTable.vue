<template>
  <div class="table-card">
    <div class="card-header">
      <header class="table-header">
        <h3>Odoslané práce</h3>
      </header>
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
          <td> {{ work.conference }}</td>
          <td>{{ formatTimestamp(work.timestamp) }}</td>
          <td>
              <span :class="work.reviewed ? 'badge badge-success' : 'badge badge-secondary'">
                {{ work.reviewed ? "Ohodnotené" : "Neohodnotené" }}
              </span>
          </td>
          <td>
            <button @click="viewReview(work)" class="btn btn-primary btn-sm"> Pozrieť hodnotenie</button>
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
      ] as Work[],
      currentPage: 1,
      perPage: 10,
      totalWorks: 50,
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
    remainingItems() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const remaining = this.works.length - startIndex;
      return remaining;
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
  },
});
</script>

<style scoped>
</style>
