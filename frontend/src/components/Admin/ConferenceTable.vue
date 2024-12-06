<template>
  <div class="card">
    <div class="card-header">
      <h3>Conferences Management</h3>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>Conference Name</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(conference, index) in conferences" :key="index">
          <td>{{ conference.name }}</td>
          <td>{{ formatTimestamp(conference.startTimestamp) }}</td>
          <td>{{ formatTimestamp(conference.endTimestamp) }}</td>
          <td>
              <span
                :class="`badge ${isOngoing(conference) ? 'badge-success' : 'badge-secondary'}`"
              >
                {{ isOngoing(conference) ? 'Ongoing' : 'Completed' }}
              </span>
          </td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editConference(conference)">
              Edit
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <button @click="nextPage" :disabled="currentPage * itemsPerPage >= totalConferences">
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface Conference {
  name: string;
  startTimestamp: number | null;
  endTimestamp: number | null;
}

export default defineComponent({
  name: "ConferenceTable",
  data() {
    return {
      conferences: [
        {
          name: "International AI Symposium 2023",
          startTimestamp: 1678901234000,
          endTimestamp: 1678991234000,
        },
        {
          name: "Tech Innovations Conference 2024",
          startTimestamp: 1679901234000,
          endTimestamp: null,
        },
        {
          name: "Digital Future Summit",
          startTimestamp: 1678801234000,
          endTimestamp: 1678851234000,
        },
      ] as Conference[],
      currentPage: 1,
      itemsPerPage: 10,
      totalConferences: 30,
    };
  },
  methods: {
    formatTimestamp(timestamp: number | null): string {
      if (timestamp === null) return "N/A";
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    isOngoing(conference: Conference): boolean {
      const now = Date.now();
      return (
        conference.startTimestamp !== null &&
        conference.startTimestamp <= now &&
        (conference.endTimestamp === null || conference.endTimestamp >= now)
      );
    },
    editConference(conference: Conference): void {
      alert(`Editing conference: ${conference.name}`);
    },
    prevPage(): void {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage(): void {
      if (this.currentPage * this.itemsPerPage < this.totalConferences) this.currentPage++;
    },
  },
});
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px auto;
  max-width: 800px;
}

.card-header {
  background: #f4f4f4;
  padding: 15px;
  border-bottom: 1px solid #ddd;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  background: #f4f4f4;
  font-weight: bold;
}

.badge {
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  font-size: 12px;
}

.badge-success {
  background-color: #28a745;
}

.badge-secondary {
  background-color: #6c757d;
}

.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background: #f4f4f4;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
