<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useReviewStore } from '@/stores/reviewStore';
import { format } from 'date-fns'
import { usePaperStore } from '@/stores/paperStore.ts'
import type { Review } from '@/types/review.ts'

export default defineComponent({
  name: 'ReviewTable',
  setup() {
    const reviewStore = useReviewStore();
    const paperStore = usePaperStore();
    const viewReviewDialog = ref(false);
    const selectedReview = ref<any>(null);
    const submittedReviews = computed(() => reviewStore.reviewerReviews);

    const headers = [
      { title: 'Draft', value: 'draft' },
      { title: 'Odporúčanie', value: 'recommendation' },
      { title: 'ŠVK', value: 'conference'},
      { title: 'Dátum', value: 'created_at' },
      { title: 'Názov práce', value: 'title' },
      { title: '', value: 'actions' },
    ];

    const papers = computed(() =>
      paperStore.reviewerPapers.filter(
        (paper) =>
          !reviewStore.reviewerReviews.some(
            (review) => review.paper === paper._id
          )
      )
    );

    const filters = ref({
      title: '',
      conferenceYear: '',
      recommendation: '',
    });

    const recommendations = [
      { text: 'Publikovať', value: 'Publikovať' },
      { text: 'Publikovať so zmenami', value: 'Publikovať_so_zmenami' },
      { text: 'Odmietnuť', value: 'Odmietnuť' },
    ];

    // Filtered reviews
    const filteredReviews = computed(() => {
      return reviewStore.reviewerReviews.filter((review) => {
        const matchesTitle =
          !filters.value.title ||
          review.paper.title
            .toLowerCase()
            .includes(filters.value.title.toLowerCase());
        const matchesConferenceYear =
          !filters.value.conferenceYear ||
          review.paper.conference?.year === filters.value.conferenceYear;
        const matchesRecommendation =
          !filters.value.recommendation ||
          review.recommendation === filters.value.recommendation;

        return matchesTitle && matchesConferenceYear && matchesRecommendation;
      });
    });

    const resetFilters = () => {
      filters.value = {
        title: '',
        conferenceYear: '',
        recommendation: '',
      };
    };

    const viewReview = (review: Review) => {
      selectedReview.value = review;
      viewReviewDialog.value = true;
    };

    const formatDate = (date: Date | string) =>
      format(new Date(date), 'dd.MM.yyyy')

    onMounted(() => {
      reviewStore.fetchAllReviews();
    });

    return {
      papers,
      headers,
      submittedReviews,
      viewReviewDialog,
      selectedReview,
      filters,
      recommendations,
      filteredReviews,
      resetFilters,
      formatDate,
      viewReview,
    };
  },
});
</script>

<template>
    <v-card>
      <v-card-title>
        <h2>Odovzdané recenzie</h2>
      </v-card-title>
      <v-card-subtitle>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.recommendation"
              :items="recommendations"
              label="Odporúčanie"
              item-value="value"
              item-title="text"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.title"
              label="Názov práce"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.conferenceYear"
              label="Rok konferencie"
              outlined
              dense
            />
          </v-col>
          <v-col cols="8" md="2">
            <v-btn color="primary" small @click="resetFilters"
            >Zrušiť filter</v-btn
            >
          </v-col>
        </v-row>
      </v-card-subtitle>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredReviews"
          :items-per-page="10"
          dense
          class="custom-table"
        >
          <template v-slot:body="{ items }">
            <tr v-for="review in items" :key="review._id">
              <td>
                <v-icon
                  v-if="review.isDraft"
                  title="Draft"
                  size="26"
                  color="orange"
                  class="mr-2"
                >
                  mdi-alert-outline
                </v-icon>
              </td>
              <td>
                <v-chip
                  :color="
                  review.recommendation === 'Publikovať'? 'green'
                  : review.recommendation === 'Publikovať_so_zmenami'? 'E7B500'
                  : review.recommendation === 'Odmietnuť'? 'red': 'grey'"
                  outlined
                  small
                  class="d-flex justify-center custom-chip rounded"
                >
                  {{ review.recommendation }}
                </v-chip>
              </td>
              <td>{{ review.paper.conference?.year }} - {{ formatDate(review.paper.conference?.date) }}</td>
              <td>{{ formatDate(review.created_at )}}</td>
              <td>{{ review.paper.title }}</td>
              <td class="d-flex justify-end align-center">
                <v-btn color="primary" @click="viewReview(review)">
                  <v-icon size="26">mdi-eye</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- View Review Dialog -->
    <v-dialog v-model="viewReviewDialog" max-width="1200px">
      <v-card>
        <v-card-title>Podrobnosti recenzie</v-card-title>
        <v-card-text>
          <p><strong>Odporúčanie:</strong> {{ selectedReview?.recommendation }}</p>
          <p><strong>Názov práce:</strong> {{ selectedReview?.paper?.title }}</p>
          <p><strong>Komentáre:</strong> {{ selectedReview?.comments || 'N/A' }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="viewReviewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<style lang="scss">

</style>
