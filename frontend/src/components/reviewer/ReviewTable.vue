<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h2>Pridelené práce</h2>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="papers"
          :items-per-page="10"
          :pageText="'{0}-{1} z {2}'"
          items-per-page-text="Práce na stránku"
          item-value="_id"
          dense
          class="custom-table"
        >
          <template v-slot:body="{ items }">
            <tr
              v-for="paper in items"
              :key="paper._id"
              class="custom-row"
            >
              <td>
                <v-icon
                  size="24"
                  color="primary"
                  @click="openReviewDialog(paper)"
                  style="cursor: pointer"
                  title="View details"
                >
                  mdi-eye
                </v-icon>
              </td>
              <td>{{ paper.title }}</td>
              <td>{{ paper.category?.name }}</td>
              <td>{{ paper.conference?.year }} </td>
              <td class="d-flex justify-end align-center">
                <v-btn
                  color="#FFCD16"
                  @click="downloadPaper(paper._id)"
                  title="Download Paper"
                >
                  <v-icon size="24">mdi-download</v-icon>
                </v-btn>
                <v-btn
                  color="#primary"
                  @click="openReviewDialog(paper)"
                  title="Recenzovať prácu"
                >
                  <v-icon size="24">mdi-message-draw</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Review Dialog -->
    <v-dialog v-model="reviewDialog" max-width="800px">
      <v-card>
        <v-card-title>Review: {{ selectedPaper?.title }}</v-card-title>
        <v-card-text>
          <v-form ref="reviewForm" @submit.prevent="submitReviewConfirmation">
            <v-container>
              <v-row v-for="(question, index) in questions" :key="index">
                <v-col cols="12">
                  <label>{{ question.text }}</label>
                  <template v-if="question.type === 'rating'">
                    <v-select
                      v-model="reviewResponses[question.text]"
                      :items="grades"
                      item-value="value"
                      item-text="label"
                      placeholder="Vyberte hodnotenie"
                      dense
                    />
                  </template>
                  <template v-else-if="question.type === 'yes_no'">
                    <v-radio-group v-model="reviewResponses[question.text]">
                      <v-radio label="Yes" value="yes"></v-radio>
                      <v-radio label="No" value="no"></v-radio>
                    </v-radio-group>
                  </template>
                  <template v-else-if="question.type === 'text'">
                    <v-textarea
                      v-model="reviewResponses[question.text]"
                      placeholder="Enter your response"
                    ></v-textarea>
                  </template>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="recommendation"
                    :items="['Publikovať', 'Publikovať_so_zmenami', 'Odmietnuť']"
                    label="Recommendation"
                    required
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveDraft">Uložiť ako koncept</v-btn>
          <v-btn color="success" @click="submitReviewConfirmation">Odoslať recenziu</v-btn>
          <v-btn color="secondary" @click="reviewDialog = false">Zrušiť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal for review submit confirmation -->
    <v-dialog v-model="confirmationDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Confirm Submission</v-card-title>
        <v-card-text>
          Are you sure you want to submit this review? Once submitted, you cannot edit it.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="cancelConfirmation">Cancel</v-btn>
          <v-btn color="green" @click="confirmSubmission">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, inject } from 'vue'
import { useReviewStore } from '@/stores/reviewStore';
import { usePaperStore } from '@/stores/paperStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { useQuestionStore } from '@/stores/questionStore.ts'

export default defineComponent({
  setup() {
    const showSnackbar = inject("showSnackbar") as ({ message, color, }: {
      message: string;
      color?: string;
    }) => void;

    if (!showSnackbar) {
      console.error("showSnackbar is not provided");
    }

    const reviewStore = useReviewStore();
    const paperStore = usePaperStore();
    const userStore = useUserStore();
    const questionStore = useQuestionStore();

    const papers = computed(() => paperStore.reviewerPapers);
    const questions = computed(() => questionStore.reviewerQuestions);
    const reviewDialog = ref(false);
    const selectedPaper = ref<{ _id: string; [key: string]: any } | null>(null);
    const reviewResponses = ref<Record<string, number | string | null>>({});
    const recommendation = ref<'Publikovať' | 'Publikovať_so_zmenami' | 'Odmietnuť'>('Publikovať');
    const confirmationDialog = ref(false);

    const headers = [
      { title: '', value: 'actions' },
      { title: 'Názov', value: 'title' },
      { title: 'Sekcia', value: 'category' },
      { title: 'Konferencia', value: 'conferenceYear' },
      { title: '', value: 'download' },
    ];

    const grades = [
      { label: 'A', value: 6 },
      { label: 'B', value: 5 },
      { label: 'C', value: 4 },
      { label: 'D', value: 3 },
      { label: 'E', value: 2 },
      { label: 'Fx', value: 1 },
    ];

    const fetchPapers = async () => {
      await paperStore.getAssignedPapers();
    };

    const openReviewDialog = async (paperId: string) => {
      try {
        selectedPaper.value = await paperStore.getAssignedPapers(paperId);
        console.log('Selected paper:', selectedPaper.value);
        reviewDialog.value = true;
      } catch (error) {
        console.error('Error fetching paper details:', error);
      }
    };

    const user = userStore.userProfile;

    const saveDraft = async () => {
      if (!selectedPaper.value) {
        console.error('Selected paper is not set.');
        return;
      }

      await reviewStore.submitReview({
        paperId: selectedPaper.value._id,
        reviewerId: user._id,
        responses: formatResponses(),
        recommendation: recommendation.value,
        isDraft: true,
      });

      reviewDialog.value = false;
    };

    const submitReviewConfirmation = async () => {
      if (!selectedPaper.value) {
        console.error('No paper selected');
        return;
      }
      confirmationDialog.value = true;
    };

    const confirmSubmission = async () => {
      confirmationDialog.value = false;

      await reviewStore.submitReview({
        paperId: selectedPaper.value!._id,
        reviewerId: user._id,
        responses: formatResponses(),
        recommendation: recommendation.value,
        isDraft: false,
      });

      reviewDialog.value = false; // Close review dialog
    };

    const cancelConfirmation = () => {
      confirmationDialog.value = false; // Close modal without submitting
    };

    const formatResponses = () => {
      return questionStore.reviewerQuestions.map((question) => ({
        question: question._id,
        answer: question.type === 'rating'
          ? Number(reviewResponses.value[question.text])
          : reviewResponses.value[question.text],
      }));
    };

    const downloadPaper = async (paperId: string) => {
      await paperStore.downloadPaperForReview(paperId);
    };

    const getRange = (options: { min: number; max: number } | undefined): number[] => {
      if (!options) return [];
      const range: number[] = [];
      for (let i = options.min; i <= options.max; i++) {
        range.push(i);
      }
      return range;
    };

    fetchPapers();

    return {
      papers,
      headers,
      grades,
      questions,
      reviewDialog,
      selectedPaper,
      reviewResponses,
      recommendation,
      confirmationDialog,
      confirmSubmission,
      cancelConfirmation,
      fetchPapers,
      openReviewDialog,
      saveDraft,
      submitReviewConfirmation,
      downloadPaper,
      getRange,
    };
  },
});
</script>

<style scoped>
/* Add any scoped styles here */
</style>
