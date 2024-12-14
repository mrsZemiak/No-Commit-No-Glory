<template>
  <div>
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
          <th>Čas poslania</th>
          <th>Hodnotenie</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(work, index) in works" :key="index">
          <td>{{ work.name }}</td>
          <td>{{ formatTimestamp(work.timestamp) }}</td>
          <td>
              <span :class="work.reviewed ? 'badge badge-success' : 'badge badge-secondary'">
                {{ work.reviewed ? "Ohodnotené" : "Neohodnotené" }}
              </span>
          </td>
          <td>
            <button @click="viewReview(work)" class="btn btn-warning"> Pozrieť hodnotenie</button>
            <button @click="editWork(work)" class="btn btn-primary">Upraviť</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-footer">
      <div class="pagination">
        <button
          @click="currentPage > 1 && (currentPage--)"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <span>Page {{ currentPage }}</span>
        <button
          @click="currentPage < Math.ceil(totalWorks / perPage) && (currentPage++)"
          :disabled="currentPage === Math.ceil(totalWorks / perPage)"
        >
          Next
        </button>
      </div>
    </footer>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

interface Work {
  name: string;
  timestamp: number;
  reviewed: boolean;
}

export default defineComponent({
  name: "ParticipantWorksTable",
  data() {
    return {
      works: [
        { name: "Math Assignment 1", timestamp: 1678901234000, reviewed: true },
        { name: "History Essay", timestamp: 1678992345000, reviewed: false },
        { name: "Physics Lab Report", timestamp: 1679083456000, reviewed: true },
        { name: "Literature Review", timestamp: 1679174567000, reviewed: false },
      ] as Work[],
      currentPage: 1,
      perPage: 10,
      totalWorks: 50,  //toto potom zmeniť
    };
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
