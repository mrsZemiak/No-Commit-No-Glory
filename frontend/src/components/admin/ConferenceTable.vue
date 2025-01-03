<template>
  <div class="table-card">
    <div class="card-header">
      <h3>Konferencie</h3>
      <button class="btn btn-primary" @click="addConference">Pridať konferenciu</button>
    </div>

    <div class="filters">
      <div class="filter-dropdown">
        <button @click="dropdownOpen = !dropdownOpen" class="btn btn-primary">
          Filter
        </button>
        <div v-if="dropdownOpen" class="dropdown-content">
          <div class="filter-group">
            <label class="fw-bold">Názov konferencie:</label>
            <input type="text" class="form-control" v-model="filters.university" placeholder="Filtrovať podľa univerzity" />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Rok:</label>
            <input type="number" class="form-control" v-model="filters.year" placeholder="Filtrovať podľa roku" />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Miesto:</label>
            <input type="text" class="form-control" v-model="filters.location" placeholder="Filtrovať podľa miesta" />
          </div>

          <div class="filter-group">
            <label class="fw-bold">Stav:</label>
            <div class="filter-checkbox">
              <input
                type="checkbox"
                value="open"
                v-model="filters.selectedStatus"
              />
              <label>Aktuálna</label>
              <input
                type="checkbox"
                value="closed"
                v-model="filters.selectedStatus"
              />
              <label>Skončená</label>
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
          <th>Univerzita</th>
          <th>Rok</th>
          <th>Miesto</th>
          <th>Dátum konferencie</th>
          <th>Odovzdanie prác</th>
          <th>Stav</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(conference, index) in paginatedConferences" :key="index">
          <td>{{ conference.university }}</td>
          <td>{{ conference.year }}</td>
          <td>{{ conference.location }}</td>
          <td>{{ formatTimestamp(conference.end_date) }}</td>
          <td>{{ formatTimestamp(conference.deadline_submission) }}</td>
          <td>
              <span :class="`badge ${conference.status === 'open' ? 'badge-success' : 'badge-secondary'}`">
    {{ conference.status === 'open' ? 'Aktuálna' : 'Skončená' }}
  </span>
          </td>
          <td>
            <button @click="viewConferenceDetails(conference)" class="btn btn-primary btn-sm ml-2">
              Zobraziť detaily
            </button>
            <button @click="viewWorksForConference(conference)" class="btn btn-secondary btn-sm ml-2">
              Zobraziť práce
            </button>
            <button class="btn btn-edit btn-sm ml-2" @click="editConference(conference)">
              Upraviť
            </button>
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

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <ModalConference
        v-if="showModal"
        :conference="selectedConference"
        :mode="modalMode"
        @update:mode="modalMode = $event"
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
import ModalConference from "@/components/admin/ModalConference.vue";
import type { ConferenceAdmin, CategoryAdmin } from "@/types/conference.ts";
import axios from "axios";

export default defineComponent({
  name: "ConferenceTable",
  components: { ModalConference },
  data() {
    return {
      conferences: [] as ConferenceAdmin[],
      categories: [] as CategoryAdmin[],
      filters: {
        university: "",
        year: "",
        location: "",
        selectedStatus: [] as string[],
      },
      dropdownOpen: false,
      currentPage: 1,
      perPage: 10,
      showModal: false,
      selectedConference: null as ConferenceAdmin | null,
      modalMode: "add" as "add" | "edit" | "view",
    };
  },
  mounted() {
    this.fetchCategories();
    this.fetchConferences();
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredConferences.length / this.perPage);
    },
    paginatedConferences() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      return this.filteredConferences.slice(startIndex, startIndex + this.perPage);
    },
    remainingItems() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const remaining = this.filteredConferences.length - startIndex;
      return remaining;
    },
    filteredConferences() {
      return this.conferences.filter((conference) => {
        const matchesName = this.filters.university
          ? conference.university.toLowerCase().includes(this.filters.university.toLowerCase())
          : true;
        const matchesYear = this.filters.year
          ? conference.year === parseInt(this.filters.year)
          : true;
        const matchesLocation = this.filters.location
          ? conference.location.toLowerCase().includes(this.filters.location.toLowerCase())
          : true;
        const matchesStatus = this.filters.selectedStatus.length
          ? this.filters.selectedStatus.includes(conference.status)
          : true;

        return matchesName && matchesYear && matchesLocation && matchesStatus;
      });
    },
  },
  methods: {
    async fetchConferences() {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/conferences");
        this.conferences = response.data;
      } catch (error) {
        console.error("Error fetching conferences:", error);
      }
    },
    async fetchCategories() {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/categories");
        this.categories = response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    formatTimestamp(value: number | Date | null): string {
      if (!value) return "N/A";
      const date = value instanceof Date ? value : new Date(value);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    viewConferenceDetails(conference: ConferenceAdmin) {
      this.selectedConference = conference;
      this.modalMode = "view";
      this.showModal = true;
    },
    viewWorksForConference(conference: ConferenceAdmin) {
      this.$router.push({ name: 'works', params: { conferenceId: conference._id } });
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
      const index = this.conferences.findIndex((conf) => conf._id === updatedConference._id);
      if (index !== -1) {
        this.conferences[index] = updatedConference;
        this.conferences = [...this.conferences];
      }
      this.fetchConferences();

      this.closeModal();
    },
    closeModal() {
      this.showModal = false;
    },
    resetFilters() {
      this.filters = {
        university: "",
        year: "",
        location: "",
        selectedStatus: [],
      };
    },
  },

});
</script>

<style scoped>

</style>
