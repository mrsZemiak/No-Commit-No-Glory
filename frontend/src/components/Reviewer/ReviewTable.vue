
<template>
  <div>
    <header class="table-header">
      <h3>Práce na hodnotenie</h3>
    </header>

    <div class="table-container">
      <table class="work-table">
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
              <span :class="work.reviewed ? 'badge success' : 'badge warning'">
                {{ work.reviewed ? "Ohodnotené" : "Neohodnotené" }}
              </span>
          </td>
          <td>
            <router-link :to="{ name: 'ReviewForm', params: { id: work.timestamp } }">
              <button class="btn warning">Hodnotiť</button>
            </router-link>
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
  name: "ReviewTable",
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

    reviewWork(work: Work): void {
      alert(`Editing work: ${work.name}`);

    },
  },
});
</script>

<style scoped>

.table-header {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.work-table {
  width: 100%;
  border-collapse: collapse;
}

.work-table th,
.work-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.work-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.badge.success {
  background-color: #28a745;
  color: white;
}

.badge.warning {
  background-color: #ffc107;
  color: white;
}

.btn {
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 4px;
}

.btn.info {
  background-color: #17a2b8;
  color: white;
}

.btn.warning {
  background-color: #ffc107;
  color: white;
}

.pagination-footer {
  display: flex;
  justify-content: flex-end;
}

.pagination button {
  margin: 0 4px;
  padding: 6px 12px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #d6d6d6;
  cursor: not-allowed;
}

.pagination span {
  margin: 0 8px;
  font-size: 1rem;
}
</style>
