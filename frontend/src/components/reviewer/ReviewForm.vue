<template>
  <div class="submission-form">
    <h2>Hodnotenie pre: {{ title }}</h2>
    <form @submit.prevent="handleSubmit">

      <!-- Going through all of the questions in DB -->
      <div v-for="(question, index) in questions" :key="index" class="form-group">
        <label :for="'question-' + index">{{ question.text }}</label>

        <div v-if="question.type === 'rating'">
          <select :id="'question-' + index" v-model="form[question._id]" :disabled="!isEditable || !isReviewer">
            <option disabled value="">Vyberte hodnotenie</option>
            <option v-for="option in getRange(question.options)" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div v-if="question.type === 'yes_no'">
          <div class="custom-radio-group">
            <label class="custom-radio">
              <input type="radio" :name="'question-' + index" v-model="form[question._id]" value="yes" :disabled="!isEditable || !isReviewer" />
              <span class="custom-radio-label">Áno</span>
            </label>
            <label class="custom-radio">
              <input type="radio" :name="'question-' + index" v-model="form[question._id]" value="no" :disabled="!isEditable || !isReviewer" />
              <span class="custom-radio-label">Nie</span>
            </label>
          </div>
        </div>

        <div v-if="question.type === 'text'">
          <textarea :id="'question-' + index" v-model="form[question._id]" :disabled="!isEditable || !isReviewer" placeholder="Vložiť odpoveď" rows="3"></textarea>
        </div>
      </div>

      <div class="form-group">
        <label for="recommendation">Odporúčanie</label>
        <select id="recommendation" v-model="form.recommendation" :disabled="!isEditable || !isReviewer" required>
          <option disabled value="">Vyberte odporúčanie</option>
          <option value="publish">Publikovať</option>
          <option value="publish_with_changes">Publikovať s úpravami</option>
          <option value="reject">Zamietnuť</option>
        </select>
      </div>

      <button type="button" @click="handleSubmitDraft" class="btn btn-secondary" :disabled="!isEditable || !isReviewer">
        Uložiť ako koncept
      </button>
      <button type="button" @click="handleSubmit" :disabled="!allFieldsFilled() || !isEditable || !isReviewer" class="btn btn-primary">
        Odovzdať
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import axiosInstance from "@/config/axiosConfig.ts";

interface Question {
  _id: string;
  text: string;
  type: 'rating' | 'yes_no' | 'text';
  options?: { min: number; max: number };
  category: string;
}
export default defineComponent({
  name: 'ReviewForm',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      questions: [] as Question[],
      form: {} as Record<string, string | number>,
      reviewerId: '',
      reviewId: '',
      isEditable: false,
      isReviewer: false,
      title: this.$route.query.title as string,
    };
  },
  mounted() {
    console.log('Title:', this.title);
    this.fetchQuestions();
    this.fetchReview();
    this.isEditable = this.$route.query.isEditable === 'true';
    this.isReviewer = this.$route.query.isReviewer === 'true';
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axiosInstance.get('/questions');
        this.questions = response.data;
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    },

    async fetchReview() {
      try {
        const response = await axiosInstance.get(`/reviewer/reviews/${this.id}/${this.reviewerId}`);
        const review = response.data.review;
        if (review) {
          this.form.recommendation = review.recommendation;
          review.responses.forEach((response: any) => {
            this.form[response.question] = response.answer;
          });
          this.reviewId = review._id;
        }
      } catch (error) {
        console.error('Error fetching review:', error);
      }
    },
    // Check if all required fields are filled
    allFieldsFilled() {
      const responsesFilled = this.questions.every((question) => {
        return this.form[question._id] !== undefined && this.form[question._id] !== '';
      });
      const recommendationFilled = this.form.recommendation !== undefined && this.form.recommendation !== '';
      return responsesFilled && recommendationFilled;
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

    async handleSubmit() {
      if (!this.allFieldsFilled()) {
        alert('Prosím vyplňte všetky polia pred odoslaním!');
        return;
      }
      try {
        const transformedResponses = this.questions.map((question) => ({
          question: question._id,
          answer: this.form[question._id],
        }));
        const reviewData = {
          paperId: this.id,
          reviewerId: this.reviewerId,
          responses: transformedResponses,
          recommendation: this.form.recommendation,
          isDraft: false,
        };
        const response = await axiosInstance.post('/reviewer/reviews', reviewData);
        console.log('Review submitted:', response.data);
        alert('Hodnotenie bolo úspešne odovzdané!');
        this.$router.push({ name: 'ReviewTable' });
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Chyba pri odosielaní hodnotenia. Skúste znova.');
      }
    },
    async handleSubmitDraft() {
      try {
        const transformedResponses = this.questions.map((question) => ({
          question: question._id,
          answer: this.form[question._id],
        }));
        const reviewData = {
          paperId: this.id,
          reviewerId: '',
          responses: transformedResponses,
          recommendation: this.form.recommendation,
          isDraft: true,
        };
        const response = await axiosInstance.post('/reviewer/reviews', reviewData);
        console.log('Review saved as draft:', response.data);
        alert('Hodnotenie bolo uložené ako koncept!');
        this.$router.push({ name: 'ReviewTable' });
      } catch (error) {
        console.error('Error saving draft:', error);
        alert('Chyba pri ukladaní konceptu. Skúste znova.');
      }
    },
  }
});
</script>

<style lang="scss" scoped>

</style>
