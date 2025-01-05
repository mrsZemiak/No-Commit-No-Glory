<template>
  <div class="modal-container">
    <button class="btn-close" @click="closeModal">✕</button>
    <h4>{{ isEditMode ? 'Upraviť kategóriu' : 'Pridať kategóriu' }}</h4>

    <form class="submission-form" @submit.prevent="submitCategory">
      <div class="form-group">
        <label for="name">Názov kategórie</label>
        <input
          type="text"
          v-model="localCategory.name"
          id="name"
          required
        />
        <span v-if="!localCategory.name" class="error-message">Názov kategórie je povinný.</span>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isLoading">
        <span v-if="isLoading">Loading...</span>
        <span v-else>{{ isEditMode ? 'Aktualizovať kategóriu' : 'Pridať kategóriu' }}</span>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { CategoryAdmin } from '@/types/conference.ts';

export default defineComponent({
  name: 'ModalCategory',
  props: {
    category: {
      type: Object as PropType<CategoryAdmin | null>,
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
        : { name: '' },
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
@use '@/assets/styles/main.scss' as main;

.modal-container {
  background: main.$custom-white;
  padding: 20px;
  border-radius: main.$border-radius-8;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(main.$primary-shadow, 0.1);
  position: relative;
}

h4 {
  margin-bottom: 20px;
  font-weight: bold;
  color: main.$primary-shadow;
}

.error-message {
  font-size: 0.875rem;
  color: main.$delete-color;
  margin-top: 5px;
}

.submission-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

button[disabled] {
  background-color: main.$secondary-light;
  cursor: not-allowed;
}
</style>
