<template>
  <div class="modal-content">
    <button class="btn-close" @click="closeModal"></button>
    <h4>{{ isEditMode ? 'Upraviť kategóriu' : 'Pridať kategóriu' }}</h4>

    <form @submit.prevent="submitCategory">
      <div class="form-group mb-3">
        <label for="name">Názov kategórie</label>
        <input type="text" v-model="localCategory.name" id="name" required />
      </div>

      <button type="submit" class="btn btn-success">
        {{ isEditMode ? 'Aktualizovať kategóriu' : 'Pridať kategóriu' }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type {CategoryAdmin} from "@/types/conference";

export default defineComponent({
  name: "ModalCategory",
  props: {
    category: {
      type: Object as PropType<CategoryAdmin | null>,
      required: false,
      default: null,
    },
    mode: {
      type: String as PropType<"add" | "edit">,
      required: true,
    },
  },
  data() {
    return {
      localCategory: this.category
        ? { ...this.category }
        : { name: "" },
    };
  },
  computed: {
    isEditMode(): boolean {
      return this.mode === "edit";
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
    submitCategory() {
      const event = this.isEditMode ? "update" : "add";
      this.$emit(event, this.localCategory);
      this.closeModal();
    },
    closeModal() {
      this.$emit("close");
    },
  },
});
</script>

<style scoped>

</style>
