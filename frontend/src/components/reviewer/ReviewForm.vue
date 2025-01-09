<template>
  <div class="submission-form">
    <h2>Hodnotenie pre ID: {{ id }}</h2>
    <form @submit.prevent="handleSubmit">

      <!-- Prejdenie vsetkych otazok -->
      <div v-for="(question, index) in questions" :key="index" class="form-group">

        <label :for="'question-' + index">{{ question.text }}</label>

        <!-- Rendering na zaklade typu hodnotenia -->
        <div v-if="question.type === 'rating'">
          <select
              :id="'question-' + index"
              v-model="form[question.text]"
              required
          >
            <option disabled value="">Vyberte hodnotenie</option>
            <option v-for="option in getRange(question.options)" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div v-if="question.type === 'yes_no'">
          <label>
            <input
                type="radio"
                :name="'question-' + index"
                v-model="form[question.text]"
                value="yes"
            />
            Áno
          </label>
          <label>
            <input
                type="radio"
                :name="'question-' + index"
                v-model="form[question.text]"
                value="no"
            />
            Nie
          </label>
        </div>

        <div v-if="question.type === 'text'">
          <textarea
              :id="'question-' + index"
              v-model="form[question.text]"
              placeholder="Vložiť odpoveď"
              rows="3"
              required
          ></textarea>
        </div>

      </div>

      <button type="submit" class="btn btn-primary">Odovzdať</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

interface Question {
  text: string;
  type: 'rating' | 'yes_no' | 'text';
  options?: { min: number; max: number };
  category: string;
}
export default defineComponent({
  name: 'ReviewForm',
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      questions: [] as Question[],
      form: {} as Record<string, string | number>,
    };
  },
  mounted() {
    this.fetchQuestions();
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        this.questions = response.data;
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    },

    getRange(options: { min: number; max: number } | undefined): number[] {
      if (!options) {
        return [];
      }

      const range: number[] = [];
      for (let i = options.min; i <= options.max; i++) {
        range.push(i);
      }
      return range;
    },
    handleSubmit() {
      console.log('Form submitted:', this.form);
      alert('Form submitted successfully!');
      this.form = {};
    },
  }
});
</script>

<style>




</style>
