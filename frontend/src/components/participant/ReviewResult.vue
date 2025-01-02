<template>
  <div class="review-result">
    <h2>Výsledok hodnotenia pre ID: {{ id }}</h2>
    <div v-for="(question, index) in questions" :key="index" class="result-group">
      <label class="fw-bold">{{ question.text }}</label>
      <div v-if="question.type === 'rating'">
        <p>{{ reviewData[question.text] || 'N/A' }}</p>
      </div>
      <div v-if="question.type === 'yes_no'">
        <p>{{ reviewData[question.text] === 'yes' ? 'Áno' : 'Nie' }}</p>
      </div>
      <div v-if="question.type === 'text'">
        <p>{{ reviewData[question.text] || 'Žiadna odpoveď' }}</p>
      </div>
    </div>
    <button @click="$router.push('/')" class="btn btn-primary">Späť na tabuľku</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'ReviewResult',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      questions: [] as {
        text: string;
        type: 'rating' | 'yes_no' | 'text';
      }[],
      reviewData: {} as Record<string, string | number>,
    };
  },
  mounted() {
    this.fetchReviewData();
  },
  methods: {
    async fetchReviewData() {
      try {
        // Fetch questions and review data for the specific work
        const [questionsResponse, reviewResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/questions'),
          axios.get(`http://localhost:3000/api/review/${this.id}`),
        ]);

        this.questions = questionsResponse.data;
        this.reviewData = reviewResponse.data;
      } catch (error) {
        console.error('Error fetching review data:', error);
      }
    },
  },
});
</script>

<style scoped>
.result-group {
  margin-bottom: 1rem;
}
</style>
