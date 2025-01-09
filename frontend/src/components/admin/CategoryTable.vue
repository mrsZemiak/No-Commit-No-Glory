<template>
  <div class="table-card">
    <div class="card-header">
      <h2>Správa kategórií</h2>
      <button class="btn btn-primary" @click="openAddModal">Pridať kategóriu</button>
    </div>
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
          <button class="btn btn-edit btn-sm" @click="openEditModal(category)">Upraviť</button>
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
          Predchádzajúca
        </button>
        <span class="pagination-current">Strana {{ currentPage }}</span>
        <button
          class="btn btn-primary"
          @click="currentPage < totalPages && (currentPage++)"
          :disabled="currentPage === totalPages"
        >
          Ďalšia
        </button>
      </div>
    </footer>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <ModalCategory
        v-if="showModal"
        :category="selectedCategory"
        :mode="modalMode"
        @add="handleAddCategory"
        @update="handleUpdateCategory"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import ModalCategory from './ModalCategory.vue';
import type { Category} from '@/types/category.ts';

export default defineComponent({
  name: 'CategoryTable',
  components: { ModalCategory },
  data() {
    return {
      categories: [] as Category[],
      currentPage: 1,
      perPage: 10,
      totalCategories: 0,
      showModal: false,
      selectedCategory: {} as Category,
      modalMode: 'add' as 'add' | 'edit',
      isLoading: false,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalCategories / this.perPage);
    },
    paginatedCategories() {
      return this.categories;
    },
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const response = await axios.get(
          `http://localhost:5000/admin/categories?limit=${this.perPage}&page=${this.currentPage}`
        );
        this.categories = response.data.categories;
        this.totalCategories = response.data.total;
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to fetch categories. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    openAddModal() {
      this.modalMode = 'add';
      this.selectedCategory = { _id: '', name: '', isActive: true };
      this.showModal = true;
    },

    openEditModal(category: Category) {
      this.modalMode = 'edit';
      this.selectedCategory = { ...category };
      this.showModal = true;
    },

    async handleAddCategory(newCategory: Category) {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const response = await axios.post('http://localhost:5000/admin/categories', {
          name: newCategory.name,
        });
        this.categories.push({ _id: response.data.id, name: newCategory.name, isActive: true });
        this.totalCategories += 1;
        this.closeModal();
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },

    async handleUpdateCategory(updatedCategory: Category) {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        await axios.patch(`http://localhost:5000/admin/categories/${updatedCategory._id}`, {
          name: updatedCategory.name,
        });
        const index = this.categories.findIndex((cat) => cat._id === updatedCategory._id);
        if (index !== -1) this.categories[index] = updatedCategory;
        this.closeModal();
      } catch (error) {
        console.error('Error updating category:', error);
        alert('Failed to update category. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    closeModal() {
      this.showModal = false;
    },
  },
});
</script>

<style scoped lang="scss">

</style>
