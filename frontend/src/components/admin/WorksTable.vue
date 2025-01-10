<template>

  <header class="table-header">
    <h3>Práce používateľov</h3>
  </header>

  <div class="filters">
    <div class="filter-dropdown">
      <button @click="dropdownOpen = !dropdownOpen" class="btn filter-btn filter-btn btn-primary">
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
          <label class="fw-bold">Meno používateľa:</label>
          <input
            type="text"
            class="form-control"
            v-model="filters.firstName"
            placeholder="Filtrovať podľa mena"
          />
        </div>
        <div class="filter-group">
          <label class="fw-bold">Priezvisko používateľa:</label>
          <input
            type="text"
            class="form-control"
            v-model="filters.lastName"
            placeholder="Filtrovať podľa priezviska"
          />
        </div>

        <div class="filter-group">
          <label class="fw-bold">Stav práce:</label>
          <div class="filter-checkbox">
            <input
              type="checkbox"
              value="submitted"
              v-model="filters.selectedReviews"
            />
            <label>Odoslané</label>
          </div>
          <div class="filter-checkbox">
            <input
              type="checkbox"
              value="under_review"
              v-model="filters.selectedReviews"
            />
            <label>V procese hodnotenia</label>
          </div>
          <div class="filter-checkbox">
            <input
              type="checkbox"
              value="accepted"
              v-model="filters.selectedReviews"
            />
            <label>Prijaté</label>
          </div>
          <div class="filter-checkbox">
            <input
              type="checkbox"
              value="accepted_with_changes"
              v-model="filters.selectedReviews"
            />
            <label>Prijaté so zmenami</label>
          </div>
          <div class="filter-checkbox">
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

  <div v-for="(conference, conferenceIndex) in conferences" :key="conference._id" class="conference-container">
    <div class="table-card">
      <div class="card-header">
        <h3>{{ conference.year }} - {{ conference.location }}</h3>
        <button class="btn btn-primary btn-sm ml-2" @click="downloadConferenceData(conference._id)">Stiahnuť</button>

      </div>
      <table class="table">
        <thead>
        <tr>
          <th>Názov</th>
          <th>Kategória</th>
          <th>Čas poslania</th>
          <th>Meno používateľa</th>
          <th>Recenzent</th>
          <th>Hodnotenie</th>
          <th>Akcie</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(work, paperIndex) in paginatedWorks[conferenceIndex].papers" :key="work._id">
          <td>{{ work.title }}</td>
          <td>{{ work.category?.name }}</td>
          <td>{{ formatTimestamp(work.submission_date) }}</td>
          <td>{{ work.user?.first_name }} {{ work.user?.last_name }}</td>
          <td>{{ work.reviewer ? work.reviewer.first_name + ' ' + work.reviewer.last_name : 'Nepriradený' }}</td>
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
            <button
              @click="downloadPaper"
              class="icon-button"
              title="Stiahnuť"

            >
              <i class="fa-solid fa-file-arrow-down"></i>
            </button>
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
              class="btn btn-primary btn-sm ml-2"
              @click="openReviewerModal(work)"
              :disabled="work.status === 'accepted' || work.status === 'rejected'"
            >
              Priradiť recenzenta
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <footer class="pagination-footer">
        <div class="pagination">
          <button
            class="btn btn-primary"
            @click="conference.currentPage > 1 && (conference.currentPage--)"
            :disabled="conference.currentPage === 1"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="pagination-current">Strana {{ conference.currentPage }}</span>
          <button
            class="btn btn-primary"
            @click="conference.currentPage < totalPages[conferenceIndex] && (conference.currentPage++)"
            :disabled="conference.currentPage === totalPages[conferenceIndex]"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </footer>
    </div>
  </div>


  <div v-if="isReviewerModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h5>Priradiť recenzenta pre: {{ selectedWork?.title }}</h5>
        <button @click="closeReviewerModal" class="btn-close"></button>
      </div>
      <div class="modal-body">
        <label class="fw-bold" for="reviewer-select">Vyberte recenzenta:</label>
        <multiselect
          v-model="selectedReviewer"
          :options="activeReviewers"
          :custom-label="(reviewer: User) => reviewer.first_name + ' ' + reviewer.last_name + ' (' + reviewer.email + ')'"
          placeholder="Vyberte hodnotiteľa"
          track-by="_id"
          label="first_name"
          :searchable="true"
          :allow-empty="true"
        />

      </div>
      <div class="modal-footer">
        <button @click="assignReviewer" class="btn btn-primary">Priradiť</button>
      </div>
    </div>
  </div>


</template>



<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Multiselect from "vue-multiselect";



interface Paper {
  _id: string;
  title: string;
  category: { name: string };
  submission_date: number;
  status: 'submitted' | 'under review' | 'accepted' | 'rejected' | 'draft';
  conference: { year: number; location: string };
  user: { first_name: string; last_name: string };
  reviewer?: User;

}

interface Conference {
  _id: string;
  year: number;
  location: string;
  papers: Paper[];
  currentPage: number;
}

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  role: {name: string};
}

export default defineComponent({
  name: "WorksTable",
  components: {
    Multiselect,
  },
  props: {
    conferenceId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      conferences: [] as Conference[],
      filters: {
        title: "",
        category: "",
        selectedReviews: [] as string[],
        year: null as number | null,
        firstName: "",
        lastName: "",
      },
      dropdownOpen: false,
      currentPage: 1,
      perPage: 10,
      error: "",
      statusLabels: {
        draft: "Návrh",
        submitted: "Odoslané",
        'under review': "V procese hodnotenia",
        accepted: "Schválené",
        rejected: "Zamietnuté",
      },
      reviewers: [] as User[],
      activeReviewers: [] as User[],
      isReviewerModalOpen: false,
      selectedWork: null as Paper | null,
      selectedReviewer: null as User | null,
    };
  },
  computed: {
    totalPages() {
      return this.conferences.map((conference) => {
        const filteredPapers = this.filterPapersForConference(conference);
        return Math.ceil(filteredPapers.length / this.perPage);
      });
    },
    paginatedWorks() {
      return this.conferences.map((conference, index) => {
        const startIndex = (conference.currentPage - 1) * this.perPage;
        const filteredPapers = this.filterPapersForConference(conference);
        const paginatedPapers = filteredPapers.slice(startIndex, startIndex + this.perPage);
        return {
          ...conference,
          papers: paginatedPapers,
        };
      });
    },
  },
  methods: {
    filterPapers(work: Paper): boolean {
      const matchesName = this.filters.title === "" || work.title.toLowerCase().includes(this.filters.title.toLowerCase());
      const matchesCategory = this.filters.category.length === 0 || this.filters.category.includes(work.category.name);
      const matchesYear = this.filters.year === null || work.conference.year === this.filters.year;
      const matchesReviewed = this.filters.selectedReviews.length === 0 || this.filters.selectedReviews.includes(work.status);
      const matchesFirstName = this.filters.firstName === "" || (work.user && work.user.first_name.toLowerCase().includes(this.filters.firstName.toLowerCase()));
      const matchesLastName = this.filters.lastName === "" || (work.user && work.user.last_name.toLowerCase().includes(this.filters.lastName.toLowerCase()));

      return matchesName && matchesCategory && matchesYear && matchesReviewed && matchesFirstName && matchesLastName;
    },
    filterPapersForConference(conference: Conference) {
      return conference.papers.filter(this.filterPapers);
    },

    async fetchPapers() {
      try {
        const response = await axios.get("/api/admin/papers");
        console.log(response.data);
        console.log(this.conferenceId);
        if (this.conferenceId) {
          this.conferences = response.data
            .filter((conference: Conference) => conference._id === this.conferenceId)
            .map((conference: Conference) => ({
              ...conference,
              currentPage: 1,
            }));
        } else {
          this.conferences = response.data.map((conference: Conference) => ({
            ...conference,
            currentPage: 1,
          }));
        }
      } catch (err) {
        this.error = "Nepodarilo sa načítať práce.";
      }
    },
    async fetchReviewers() {
      try {
        const response = await axios.get("/api/admin/users");

        this.reviewers = response.data
          .filter((user: User) => user.role && user.role.name === 'reviewer')
          .map((user: User) => ({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
          }));
      } catch (err) {
        this.error = "Nepodarilo sa načítať zoznam hodnotiteľov.";
      }
    },
    async fetchActiveReviewers() {
      try {
        const response = await axios.get("/api/admin/users");

        this.activeReviewers = response.data
          .filter((user: User) => user.role && user.role.name === 'reviewer' && user.status === 'active')
          .map((user: User) => ({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
          }));
      } catch (err) {
        this.error = "Nepodarilo sa načítať zoznam hodnotiteľov.";
      }
    },
    formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    downloadPaper() {
      alert("Downloading work");
    },
    downloadConferenceData(conferenceId: string) {
      axios({
        url: `/api/conferences/${conferenceId}/papers/download`,
        method: 'GET',
        responseType: 'blob',
      })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;

          link.setAttribute('download', `conference-${conferenceId}-papers.zip`);

          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Error downloading conference data:', error);
          alert('Nepodarilo sa stiahnuť dáta konferencie.');
        });
    },

    resetFilters(): void {
      this.filters.title = "";
      this.filters.category = "";
      this.filters.selectedReviews = [];
      this.filters.year = null;
    },
    openReviewerModal(work: Paper) {
      this.selectedWork = work;
      this.selectedReviewer = work.reviewer || null;
      this.isReviewerModalOpen = true;
    },
    closeReviewerModal() {
      this.isReviewerModalOpen = false;
      this.selectedReviewer = null;
    },
    async assignReviewer() {
      if (!this.selectedReviewer) {
        alert("Prosím vyberte recenzenta.");
        return;
      }

      if (this.selectedWork && this.selectedWork._id) {
        try {
          const response = await axios.patch(`/api/admin/papers/${this.selectedWork._id}/reviewer`, {
            reviewerId: this.selectedReviewer,
          });

          if (response.status === 200) {
            alert("Hodnotiteľ bol úspešne priradený.");
            this.closeReviewerModal();
            await this.fetchPapers();
          }
        } catch (err) {
          this.error = "Nepodarilo sa priradiť hodnotiteľa.";
          alert(this.error);
        }
      }
    },
  },

  mounted() {
    this.fetchPapers();
    this.fetchReviewers();
    this.fetchActiveReviewers();
  },
});
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>
