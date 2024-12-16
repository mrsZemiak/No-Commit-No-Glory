<template>
  <div class="category-management">
    <h2>Správa kategórií</h2>

    <button class="btn btn-primary" @click="openAddModal">Pridať kategóriu</button>

    <table class="table">
      <thead>
      <tr>
        <th>Názov kategórie</th>
        <th>Akcie</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="category in paginatedCategories" :key="category._id">
        <td>{{ category.name }}</td>
        <td>
          <button class="btn btn-warning btn-sm" @click="openEditModal(category)">Upraviť</button>
          <button class="btn btn-danger btn-sm" @click="deleteCategory(category._id)">Odstrániť</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div class="card-footer">
      <button class="pagination-btn" @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <button class="pagination-btn" @click="nextPage" :disabled="currentPage * itemsPerPage >= categories.length">
        Next
      </button>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <ModalCategory
        v-if="showModal"
        :category="selectedCategory"
        :mode="modalMode"
        @add="addNewCategory"
        @update="updateCategory"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import axios from 'axios';
import ModalCategory from './modalCategory.vue';
import type {CategoryAdmin} from "@/types/conference";

export default defineComponent({
  name: "CategoryTable",
  components: { ModalCategory },
  data() {
    return {
      categories: [] as CategoryAdmin[],
      currentPage: 1,
      itemsPerPage: 10,
      totalCategories: 50,
      showModal: false,
      selectedCategory: {} as CategoryAdmin,
      modalMode: 'add' as 'add' | 'edit',
    };
  },
  mounted() {
    this.fetchCategories();
  },
  computed: {
    paginatedCategories() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = this.currentPage * this.itemsPerPage;
      return this.categories.slice(startIndex, endIndex);
    },
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get("http://localhost:3000/api/categories");
        this.categories = response.data.map((category: CategoryAdmin) => ({
          id: category._id,
          name: category.name,
        }));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },

    openAddModal() {
      this.modalMode = 'add';
      this.selectedCategory = { _id: '', name: '' };
      this.showModal = true;
    },

    openEditModal(category: CategoryAdmin) {
      this.modalMode = 'edit';
      this.selectedCategory = { ...category };
      this.showModal = true;
    },

    async addNewCategory(newCategory: CategoryAdmin) {
      try {
        const response = await axios.post("http://localhost:3000/api/categories", {
          name: newCategory.name,
        });
        this.categories.push({
          _id: response.data._id.$oid,
          name: newCategory.name,
        });
        this.closeModal();
      } catch (error) {
        console.error("Error adding category:", error);
      }
    },

    async updateCategory(updatedCategory: CategoryAdmin) {
      try {
        const response = await axios.put(`http://localhost:3000/api/categories/${updatedCategory._id}`, {
          name: updatedCategory.name,
        });
        const index = this.categories.findIndex((category) => category._id === updatedCategory._id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        this.closeModal();
      } catch (error) {
        console.error("Error updating category:", error);
      }
    },

    async deleteCategory(categoryId: string) {
      try {
        await axios.delete(`http://localhost:3000/api/categories/${categoryId}`);
        this.categories = this.categories.filter((category) => category._id !== categoryId);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },

    closeModal() {
      this.showModal = false;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage * this.itemsPerPage < this.categories.length) this.currentPage++;
    },
  },

});
</script>

<style scoped>

</style>
