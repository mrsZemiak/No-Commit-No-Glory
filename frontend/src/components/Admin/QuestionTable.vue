<template>
  <div class="table-card">
    <div class="card-header">
      <h2>Správa Otázok</h2>
      <div class="header-buttons">
        <button class="btn btn-primary" @click="openAddModal">Pridať Otázku</button>
        <button @click="dropdownOpen = !dropdownOpen" class="btn btn-primary">
          Filter
        </button>
      </div>
    </div>
      <div class="filters">
        <div class="filter-dropdown">

          <div v-if="dropdownOpen" class="dropdown-content">
            <div class="filter-group">
              <label class="fw-bold">Text:</label>
              <input type="text" class="form-control" v-model="filters.text" placeholder="Filtrovať podľa textu" />
            </div>

            <div class="filter-group">
              <label class="fw-bold">Typ:</label>
              <div class="filter-checkbox">
                <label><input type="checkbox" v-model="filters.type" value="text" /> Textová otázka</label>
                <label><input type="checkbox" v-model="filters.type" value="rating" /> Hodnotenie</label>
                <label><input type="checkbox" v-model="filters.type" value="yes_no" /> Áno/Nie</label>
              </div>
            </div>

            <div class="filter-group">
              <label class="fw-bold">Kategória:</label>
              <div class="filter-checkbox">
                <label><input type="checkbox" v-model="filters.category" value="Dodržiavanie pravidiel" /> Dodržiavanie pravidiel</label>
                <label><input type="checkbox" v-model="filters.category" value="Hodnotenie" /> Hodnotenie</label>
                <label><input type="checkbox" v-model="filters.category" value="Obsah práce" /> Obsah práce</label>
                <label><input type="checkbox" v-model="filters.category" value="Štruktúra práce" /> Štruktúra práce</label>
              </div>
            </div>

            <div class="filter-group">
              <button @click="resetFilters" class="btn btn-primary btn-sm">Zrušiť filtrovanie</button>
            </div>
          </div>
        </div>
      </div>

    <table class="table">
      <thead>
      <tr>
        <th>Text</th>
        <th>Typ</th>
        <th>Kategória</th>
        <th>Akcie</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="question in paginatedQuestions" :key="question._id">

        <td>{{ question.text }}</td>
        <td><span class=" badge badge-primary">{{ questionLabels[question.type] || "Neznámy typ" }}</span></td>
        <td><span class=" badge badge-brown">{{ question.category || "N/A" }}</span></td>
        <td class="button-group">
          <button class="icon-button" @click="openEditModal(question)">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
<!--          <button class="icon-button" @click="deleteQuestion(question._id)">-->
<!--            <i class="fa-solid fa-trash-can"></i>-->
<!--          </button>-->
        </td>
      </tr>
      </tbody>
    </table>

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

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <ModalQuestion
          v-if="showModal"
          :question="selectedQuestion"
          :mode="modalMode"
          @add="addNewQuestion"
          @update="updateQuestion"
          @close="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import ModalQuestion from "./ModalQuestion.vue";
import type { Question } from "@/types/question";



export default defineComponent({
  name: "QuestionTable",
  components: { ModalQuestion },
  data() {
    return {
      questions: [] as Question[],
      currentPage: 1,
      perPage: 10,
      totalQuestions: 0,
      showModal: false,
      selectedQuestion: {} as Question,
      modalMode: "add" as "add" | "edit",
      dropdownOpen: false,
      filters: {
        text: "",
        type: [] as string[],
        category: [] as string[],
      },
      questionLabels: {
        rating: "Hodnotenie",
        text: "Text",
        yes_no: "Áno/Nie"
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.perPage);
    },
    paginatedQuestions() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      return this.filteredQuestions.slice(startIndex, startIndex + this.perPage);
    },
    remainingItems() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      return this.filteredQuestions.length - startIndex;
    },
    filteredQuestions() {
      return this.questions.filter((question) => {
        const matchesText = this.filters.text
          ? question.text.toLowerCase().includes(this.filters.text.toLowerCase())
          : true;
        const matchesType = this.filters.type.length > 0
          ? this.filters.type.includes(question.type)
          : true;
        const matchesCategory = this.filters.category.length > 0
          ? this.filters.category.includes(question.category)
          : true;

        return matchesText && matchesType && matchesCategory;
      });
    },
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/questions");
        this.questions = response.data;
        this.totalQuestions = response.data.length;
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },
    openAddModal() {
      this.modalMode = "add";
      this.selectedQuestion = {
        _id: "",
        text: "",
        type: "text",
        options: undefined,
        category: "",
      };
      this.showModal = true;
    },
    openEditModal(question: Question) {
      this.modalMode = "edit";
      this.selectedQuestion = { ...question };
      this.showModal = true;
    },
    async addNewQuestion(newQuestion: Question) {
      try {
        const response = await axios.post("http://localhost:3000/api/admin/questions", newQuestion);
        this.questions.push(response.data);
        this.totalQuestions++;
        await this.fetchQuestions();
        this.closeModal();
      } catch (error) {
        console.error("Error adding question:", error);
      }
    },
    async updateQuestion(updatedQuestion: Question) {
      try {
        await axios.patch(`http://localhost:3000/api/admin/questions/${updatedQuestion._id}`, updatedQuestion);
        const index = this.questions.findIndex((q) => q._id === updatedQuestion._id);
        if (index !== -1) {
          this.questions[index] = updatedQuestion;
        }
        this.closeModal();
      } catch (error) {
        console.error("Error updating question:", error);
      }
    },
    // async deleteQuestion(questionId: string) {
      // try {
      //   await axios.delete(`/api/questions/${questionId}`);
      //   this.questions = this.questions.filter((q) => q._id !== questionId);
      //   this.totalQuestions--;
      // } catch (error) {
      //   console.error("Error deleting question:", error);
      // }
    // },
    closeModal() {
      this.showModal = false;
    },
    resetFilters() {
      this.filters = {
        text: "",
        type: [],
        category: [],
      };
    },
  },
  mounted() {
    this.fetchQuestions();
  },
});
</script>

<style scoped>
</style>
