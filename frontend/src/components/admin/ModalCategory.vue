<template>
  <div class="modal-content">
    <button class="btn-close" @click="closeModal"></button>
    <h4>{{ isEditMode ? 'Upraviť kategóriu' : 'Pridať kategóriu' }}</h4>

    <form @submit.prevent="submitCategory">
      <div class="form-group mb-3">
        <label for="name">Názov kategórie</label>
        <input type="text" v-model="localCategory.name" id="name" required />
      </div>

      <div class="form-group mb-3">
        <label for="isActive">Stav kategórie</label>
        <select id="isActive" v-model="localCategory.isActive" class="form-select">
          <option :value="true">Aktívna</option>
          <option :value="false">Neaktívna</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">
        {{ isEditMode ? 'Aktualizovať kategóriu' : 'Pridať kategóriu' }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Category } from '@/types/category.ts';

export default defineComponent({
  name: 'ModalCategory',
  props: {
    category: {
      type: Object as PropType<Category| null>,
      required: false,
      default: null,
    },
    mode: {
      type: String as PropType<'add' | 'edit'>,
      required: true,
    },
  },
  data() {
    return {
      localCategory: this.category
        ? { ...this.category }
        : { name: '', isActive: true },
      isLoading: false,
    };
  },
  computed: {
    isEditMode(): boolean {
      return this.mode === 'edit';
    },
  },
  watch: {
    category(newCategory) {
      if (newCategory) {
        this.localCategory = { ...newCategory };
      }
    },
  },
  methods: {
    async submitCategory() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const event = this.isEditMode ? 'update' : 'add';
        this.$emit(event, this.localCategory);
        this.closeModal();
      } catch (error) {
        console.error('Error submitting category:', error);
      } finally {
        this.isLoading = false;
      }
    },
    closeModal() {
      this.$emit('close');
    },
  },
});
</script>

<style scoped lang="scss">

</style>
