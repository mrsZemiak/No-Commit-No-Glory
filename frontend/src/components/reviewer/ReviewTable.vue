<template>
  <div class="table-card">
    <div class="card-header">
      <header class="table-header">
        <h3>Práce na hodnotenie</h3>
      </header>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Názov</th>
            <th>Rok konferencie</th>
            <th>Hodnotenie</th>
            <th>Akcie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(work, index) in paginatedWorks" :key="index">
            <td>{{ work.title }}</td>
            <td>{{ work.conferenceYear }}</td>
            <td>
              <span
                :class="{
                  'badge badge-secondary': work.status === 'submitted',
                  'badge badge-yellow': work.status === 'under review',
                  'badge badge-red': work.status === 'rejected',
                  'badge badge-green': work.status === 'accepted',
                  'badge badge-primary': work.status === 'draft',
                }"
              >
                {{ statusLabels[work.status] || 'Neznámy stav' }}
              </span>
            </td>
            <td class="button-group-multiple">
              <button
                @click="downloadPaper"
                class="icon-button"
                title="Stiahnuť"
              >
                <i class="fa-solid fa-file-arrow-down"></i>
              </button>
              <router-link
                :to="{
                  name: 'ReviewForm',
                  params: { id: work._id },
                  query: {
                    title: work.title,
                    isEditable:
                      work.status === 'under review' || work.status === 'draft'
                        ? 'true'
                        : 'false',
                    isReviewer: 'true',
                  },
                }"
              >
                <button class="btn btn-edit btn-sm">Hodnotiť</button>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-footer">
      <div class="pagination">
        <button
          class="btn btn-primary"
          @click="currentPage > 1 && currentPage--"
          :disabled="currentPage === 1"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="pagination-current">Strana {{ currentPage }}</span>
        <button
          class="btn btn-primary"
          @click="currentPage < totalPages && currentPage++"
          :disabled="currentPage === totalPages || paginatedWorks.length === 0"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import axiosInstance from '@/config/axiosConfig.ts'

interface Work {
  _id: string
  title: string
  conferenceYear: number
  status: 'submitted' | 'under review' | 'accepted' | 'rejected' | 'draft'
}

export default defineComponent({
  name: 'ReviewTable',
  data() {
    return {
      works: [] as Work[],
      currentPage: 1,
      perPage: 10,
      totalWorks: 0,
      statusLabels: {
        draft: 'Návrh',
        submitted: 'Odoslané',
        'under review': 'V procese hodnotenia',
        accepted: 'Schválené',
        rejected: 'Zamietnuté',
      },
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalWorks / this.perPage)
    },
    paginatedWorks() {
      const startIndex = (this.currentPage - 1) * this.perPage
      return this.works.slice(startIndex, startIndex + this.perPage)
    },
  },
  methods: {
    async fetchWorks() {
      try {
        const reviewerId = '6775538dedbad0434a6f9ca8' //temporary id
        const response = await axiosInstance.get(
          `/auth/reviewer/papers`,
        )
        this.works = response.data.map((paper: any) => ({
          _id: paper._id,
          title: paper.title,
          conferenceYear: paper.conference?.year || 'Neznámy rok',
          status: paper.status,
        }))
        this.totalWorks = this.works.length
      } catch (error) {
        console.error('Failed to fetch works:', error)
      }
    },
    downloadPaper() {
      alert('Downloading work')
    },
  },
  mounted() {
    this.fetchWorks()
  },
})
</script>

<style scoped></style>
