<template>
  <div class="card">
    <div class="card-header">
      <h3>Konferencie</h3>
      <button class="btn btn-primary" @click="addConference">Pridať konferenciu</button>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>Názov</th>
          <th>Rok</th>
          <th>Miesto</th>
          <th>Dátum konferencie</th>
          <th>Uzávierka prihlášok</th>
          <th>Stav</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(conference, index) in paginatedConferences" :key="index">
          <td>{{ conference.name }}</td>
          <td>{{ conference.year }}</td>
          <td>{{ conference.location }}</td>
          <td>{{ formatTimestamp(conference.conferenceDate) }}</td>
          <td>{{ formatTimestamp(conference.submissionDeadline) }}</td>
          <td>
              <span
                :class="`badge ${isOngoing(conference) ? 'badge-success' : 'badge-secondary'}`"
              >
                {{ isOngoing(conference) ? 'Aktuálna' : 'Skončená' }}
              </span>
          </td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editConference(conference)">
              Upraviť
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
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <ModalConference
        v-if="showModal"
        :conference="selectedConference"
        :mode="modalMode"
        :availableCategories="categories"
        @add="addNewConference"
        @update="updateConference"
        @close="closeModal"
      />
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModalConference from "@/components/Admin/modalConference.vue";
import type {ConferenceAdmin, CategoryAdmin} from "@/types/conference";
import ModalEditUser from "@/components/Admin/modalEditUser.vue";




export default defineComponent({
  name: "ConferenceTable",
  components: {ModalEditUser, ModalConference },
  data() {
    return {
      conferences: [
        {
          name: "International AI Symposium 2023",
          year: 2023,
          location: "New York",
          conferenceDate: new Date("2023-06-01"),
          submissionDeadline: new Date("2023-04-01"),
          reviewDeadline: new Date("2023-04-15"),
          revisionDeadline: new Date("2023-05-01"),
          postConferenceRevisionDeadline: new Date("2023-06-15"),
          categories: ["1", "3"],
        },
        {
          name: "Tech Innovations Conference 2024",
          year: 2024,
          location: "San Francisco",
          conferenceDate: new Date("2024-08-20"),
          submissionDeadline: new Date("2024-06-01"),
          reviewDeadline: new Date("2024-06-20"),
          revisionDeadline: new Date("2024-07-01"),
          postConferenceRevisionDeadline: new Date("2024-09-01"),
          categories: ["2"],
        },
      ] as ConferenceAdmin[],
      categories: [
        { id: "1", name: "Artificial Intelligence" },
        { id: "2", name: "Data Science" },
        { id: "3", name: "Cybersecurity" },
      ] as CategoryAdmin[],
      currentPage: 1,
      itemsPerPage: 10,
      totalConferences: 30,
      showModal: false,
      selectedConference: null as ConferenceAdmin | null,
      modalMode: "add" as "add" | "edit",
    };
  },
  computed: {
    paginatedConferences() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = this.currentPage * this.itemsPerPage;
      return this.conferences.slice(startIndex, endIndex);
    }
  },
  methods: {
    formatTimestamp(value: number | Date | null): string {
      if (!value) return "N/A";
      const date = value instanceof Date ? value : new Date(value);

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    isOngoing(conference: ConferenceAdmin): boolean {
      const now = new Date().getTime();
      return new Date(conference.conferenceDate).getTime() > now;
    },
    addConference() {
      this.modalMode = "add";
      this.selectedConference = null;
      this.showModal = true;
    },

    editConference(conference: ConferenceAdmin) {
      this.modalMode = "edit";
      this.selectedConference = { ...conference };
      this.showModal = true;
    },

    addNewConference(newConference: ConferenceAdmin) {
      this.conferences.push(newConference);
      this.closeModal();
    },

    updateConference(updatedConference: ConferenceAdmin) {
      const index = this.conferences.findIndex(
        (conf) => conf.name === updatedConference.name && conf.year === updatedConference.year
      );

      if (index !== -1) {
        this.conferences[index] = updatedConference;
      }

      this.closeModal();
    },

    closeModal() {
      this.showModal = false;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage * this.itemsPerPage < this.totalConferences) this.currentPage++;
    },
  }
});

</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}


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
