import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '@/config/axiosConfig'

export const useReviewStore = defineStore('reviews', () => {
  // Reactive state
  const reviewerReviews = ref<Array<any>>([]) // Reviews submitted by the reviewer
  const participantReviews = ref<Array<any>>([]) // Reviews visible to participants
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions

  // Reviewer: Submit a new review
  const submitReview = async (review: {
    paperId: string
    reviewerId: string
    responses: Array<any>
    recommendation: 'Publikovať' | 'Publikovať_so_zmenami' | 'Odmietnuť'
  }) => {
    try {
      const response = await axiosInstance.post(
        '/auth/reviewer/reviews',
        review,
      )
      return response.data
    } catch (err) {
      console.error('Failed to submit review:', err)
      throw err
    }
  }

  // Reviewer: Fetch all own reviews
  const getReviewerReviews = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/reviewer/reviews')
      reviewerReviews.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch reviews.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Participant: Fetch reviews for participant papers
  const getParticipantReviews = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/participant/papers')
      participantReviews.value = response.data // Papers with populated reviews
    } catch (err) {
      error.value = 'Failed to fetch reviews for participant papers.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    reviewerReviews,
    participantReviews,
    loading,
    error,

    // Actions
    submitReview,
    getReviewerReviews,
    getParticipantReviews,
  }
})
