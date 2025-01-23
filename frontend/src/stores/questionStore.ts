import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/config/axiosConfig'
import type { Question } from '@/types/question.ts'

export const useQuestionStore = defineStore('questions', () => {
  //Reactive state
  const adminQuestions = ref<Array<any>>([])
  const reviewerQuestions = ref<Array<any>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  //Actions
  const fetchAllQuestions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/admin/questions')
      adminQuestions.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch questions.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchQuestionById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get(`/auth/admin/questions/${id}`)
      return response.data
    } catch (err) {
      console.error('Failed to fetch question by ID:', err)
      throw err
    }
  }

  const addQuestion = async (question: Question) => {
    try {
      const response = await axiosInstance.post(
        '/auth/admin/questions',
        question,
      )
      adminQuestions.value = [...adminQuestions.value]
    } catch (err) {
      console.error('Failed to add question:', err)
      throw err
    }
  }

  const updateQuestion = async (id: string, updates: any) => {
    try {
      await axiosInstance.patch(`/auth/admin/questions/${id}`, updates)
      const index = adminQuestions.value.findIndex(q => q._id === id)
      if (index !== -1) {
        adminQuestions.value[index] = {
          ...adminQuestions.value[index],
          ...updates,
        }
      }
    } catch (err) {
      console.error('Failed to update question:', err)
      throw err
    }
  }

  const deleteQuestion = async (id: string) => {
    try {
      await axiosInstance.delete(`/auth/admin/questions/${id}`)
      adminQuestions.value = adminQuestions.value.filter(q => q._id !== id)
    } catch (err) {
      console.error('Failed to delete question:', err)
      throw err
    }
  }

  const fetchReviewerQuestions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('/auth/reviewer/questions')
      reviewerQuestions.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch reviewer questions.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    adminQuestions,
    reviewerQuestions,
    loading,
    error,

    // Actions
    fetchAllQuestions,
    fetchQuestionById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    fetchReviewerQuestions,
  }
})
