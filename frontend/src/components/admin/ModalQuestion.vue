<template>
  <div class="modal-content">
    <button class="btn-close" @click="closeModal"></button>
    <h4>{{ isEditMode ? 'Upraviť otázku' : 'Pridať otázku' }}</h4>
    <form @submit.prevent="submitQuestion">
      <div class="form-group mb-3">
        <label for="text">Text otázky</label>
        <input type="text" v-model="localQuestion.text" id="text" required />
      </div>
      <div class="form-group mb-3">
        <label for="type">Typ otázky</label>
        <select id="type" v-model="localQuestion.type" class="form-select" @change="handleTypeChange" required>
          <option value="text">Text</option>
          <option value="yes_no">Áno/Nie</option>
          <option value="rating">Hodnotenie</option>
        </select>
      </div>
      <div v-if="localQuestion.type === 'rating'" class="form-group mb-3">
        <label>Možnosti hodnotenia</label>
        <div class="form-inline">
          <label for="min">Minimálna hodnota</label>
          <input type="number" v-model="minOption" id="min" class="form-control mx-2" required />

          <label for="max">Maximálna hodnota</label>
          <input type="number" v-model="maxOption" id="max" class="form-control mx-2" required />
        </div>
      </div>
      <div class="form-group mb-3">
        <label for="category">Kategória</label>
        <select v-model="localQuestion.category"  class="form-select">
          <option value="Dodržiavanie pravidiel">Dodržiavanie pravidiel</option>
          <option value="Hodnotenie">Hodnotenie</option>
          <option value="Obsah práce">Obsah práce</option>
          <option value="Štruktúra práce">Štruktúra práce</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">
        {{ isEditMode ? 'Aktualizovať otázku' : 'Pridať otázku' }}
      </button>
    </form>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Question } from "@/types/question";

export default defineComponent({
  name: "ModalQuestion",
  props: {
    question: {
      type: Object as PropType<Question | null>,
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
      localQuestion: this.question
        ? { ...this.question }
        : { text: "", type: "text", options: { min: 1, max: 6 }, category: "Dodržiavanie pravidiel" },
    };
  },
  computed: {
    isEditMode(): boolean {
      return this.mode === "edit";
    },
    minOption: {
      get() {
        if (this.localQuestion.type === 'rating') {
          return this.localQuestion.options?.min ?? 1;
        }
        return null;
      },
      set(value: number) {
        if (this.localQuestion.type === 'rating') {
          if (!this.localQuestion.options) {
            this.localQuestion.options = { min: 1, max: 6 };
          }
          this.localQuestion.options.min = value;
        }
      },
    },
    maxOption: {
      get() {
        if (this.localQuestion.type === 'rating') {
          return this.localQuestion.options?.max ?? 6;
        }
        return null;
      },
      set(value: number) {
        if (this.localQuestion.type === 'rating') {
          if (!this.localQuestion.options) {
            this.localQuestion.options = { min: 1, max: 6 };
          }
          this.localQuestion.options.max = value;
        }
      },
    },
  },
  watch: {
    question(newQuestion) {
      if (newQuestion) {
        this.localQuestion = { ...newQuestion };
        if (this.localQuestion.type === 'rating' && !this.localQuestion.options) {
          this.localQuestion.options = { min: 1, max: 6 };
        } else if (this.localQuestion.type !== 'rating') {
          delete this.localQuestion.options;
        }
      }
    },
  },
  methods: {
    handleTypeChange() {
      if (this.localQuestion.type === 'rating' && !this.localQuestion.options) {
        this.localQuestion.options = { min: 1, max: 6 };
      } else if (this.localQuestion.type !== 'rating') {
        delete this.localQuestion.options;
      }
    },
    submitQuestion() {
      const event = this.isEditMode ? "update" : "add";
      this.$emit(event, this.localQuestion);
      this.closeModal();
    },
    closeModal() {
      this.$emit("close");
    },
  },
});
</script>

<style lang="scss">
</style>
