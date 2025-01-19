<template>
  <v-container class="submission-form">
    <v-card outlined>
      <v-card-title>
        <h2>Vložiť prácu</h2>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.first_name"
                label="Meno"
                outlined
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.last_name"
                label="Priezvisko"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.submissionName"
                label="Názov práce"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="form.conferencePick"
                :items="conferences"
                item-text="location"
                item-value="id"
                label="Výber konferencie"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="form.categoryPick"
                :items="categories"
                item-text="name"
                item-value="id"
                label="Výber sekcie"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <div
                v-for="(author, index) in form.otherAuthors"
                :key="index"
                class="d-flex align-center mb-2"
              >
                <v-text-field
                  v-model="form.otherAuthors[index]"
                  label="Meno autora"
                  outlined
                  dense
                  class="flex-grow-1"
                />
                <v-btn color="error" @click="removeAuthor(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <v-btn color="primary" @click="addAuthor">Pridať autora</v-btn>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.keywords"
                label="Kľúčové slová"
                outlined
                placeholder="Vložte kľúčové slová oddelené čiarkou"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.abstract"
                label="Abstrakt"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="form.projectFile"
                label="Projektový súbor"
                outlined
                accept=".pdf,.docx"
                required
                @change="handleFileChange"
              />
            </v-col>
          </v-row>
          <v-btn color="primary" type="submit">Odovzdať</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
      <v-btn @click="snackbar.show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axiosInstance from '@/config/axiosConfig'

const route = useRoute()
const workId = route.params.workId

const categories = ref<{ id: string; name: string }[]>([])
const conferences = ref<{ id: string; location: string }[]>([])
const fileName = ref<string>('')

const form = ref({
  first_name: '',
  last_name: '',
  submissionName: '',
  otherAuthors: [] as string[],
  keywords: '',
  abstract: '',
  categoryPick: '',
  conferencePick: '',
  projectFile: null as File | null,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'error',
  timeout: 5000,
})

const showSnackbar = ({
  message,
  color = 'error',
}: {
  message: string
  color?: string
}) => {
  snackbar.value = { show: true, message, color, timeout: 5000 }
}

onMounted(async () => {
  try {
    const [categoriesResponse, conferencesResponse] = await Promise.all([
      axiosInstance.get('/auth/participant/categories'),
      axiosInstance.get('/auth/participant/conferences'),
    ])
    categories.value = categoriesResponse.data.map((category: any) => ({
      id: category._id,
      name: category.name,
    }))
    conferences.value = conferencesResponse.data.map((conference: any) => ({
      id: conference._id,
      location: conference.location,
    }))

    if (workId) {
      const response = await axiosInstance.get(
        `/auth/participant/papers/${workId}`,
      )
      const data = response.data
      form.value.submissionName = data.title
      form.value.abstract = data.abstract
      form.value.keywords = data.keywords
      form.value.categoryPick = data.category?._id || ''
      form.value.conferencePick = data.conference?._id || ''
      form.value.first_name = data.authors[0]?.firstName || ''
      form.value.last_name = data.authors[0]?.lastName || ''
      form.value.otherAuthors = data.authors
        .slice(1)
        .map((author: any) => `${author.firstName} ${author.lastName}`)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showSnackbar({ message: 'Nepodarilo sa načítať údaje.', color: 'error' })
  }
})

const addAuthor = () => {
  form.value.otherAuthors.push('')
}

const removeAuthor = (index: number) => {
  form.value.otherAuthors.splice(index, 1)
}

const handleFileChange = () => {
  if (form.value.projectFile) {
    fileName.value = form.value.projectFile.name
  }
}

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('title', form.value.submissionName)
  formData.append('category', form.value.categoryPick)
  formData.append('conference', form.value.conferencePick)
  formData.append('abstract', form.value.abstract)
  formData.append('keywords', form.value.keywords)
  formData.append(
    'authors',
    JSON.stringify([
      { firstName: form.value.first_name, lastName: form.value.last_name },
      ...form.value.otherAuthors.map(name => {
        const [firstName, lastName] = name.split(' ')
        return { firstName, lastName }
      }),
    ]),
  )
  if (form.value.projectFile) {
    formData.append('file', form.value.projectFile)
  }

  const url = workId ? `/participant/papers/${workId}` : '/participant/papers'

  try {
    if (workId) {
      await axiosInstance.patch(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      showSnackbar({
        message: 'Práca bola úspešne aktualizovaná.',
        color: 'success',
      })
    } else {
      await axiosInstance.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      showSnackbar({
        message: 'Práca bola úspešne odovzdaná.',
        color: 'success',
      })
    }
  } catch (error) {
    console.error('Submission error:', error)
    showSnackbar({ message: 'Nepodarilo sa uložiť prácu.', color: 'error' })
  }
}
</script>

<style scoped>
.submission-form {
  max-width: 100%;
  margin: auto;
}
</style>
