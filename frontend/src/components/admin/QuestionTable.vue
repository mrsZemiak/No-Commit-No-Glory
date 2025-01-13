<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <h3>Správa Otázok</h3>
      </div>
    </v-card-title>

    <v-card-subtitle>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.text"
            label="Filtrovať podľa textu"
            outlined
            dense
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            label="Typ otázky"
            multiple
            outlined
            dense
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.category"
            :items="categoryOptions"
            label="Kategória"
            multiple
            outlined
            dense
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn color="primary" small @click="resetFilters">Zrušiť filtrovanie</v-btn>
        </v-col>
      </v-row>
    </v-card-subtitle>

    <v-data-table
      :headers="tableHeaders"
      :items="paginatedQuestions"
      :items-per-page="perPage":pageText="'{0}-{1} z {2}'"
      items-per-page-text="Otázky na stránku"
      item-value="_id"
      dense
      class="elevation-1"
    >
      <template v-slot:body="{ items }">
        <tr v-for="question in items" :key="question._id">
          <td>{{ question.text }}</td>
          <td>
            <v-chip color="primary" dark small>
              {{ questionLabels[question.type] || "Neznámy typ" }}
            </v-chip>
          </td>
          <td>
            <v-chip color="brown" dark small>
              {{ question.category || "N/A" }}
            </v-chip>
          </td>
          <td>
            <v-btn @click="openDialog('edit', question)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-btn color="primary" @click="openDialog('add')">Pridať Otázku</v-btn>

    <v-dialog v-model="dialogVisible" max-width="600px">
      <v-card>
        <v-card-title>{{ dialogMode === 'add' ? 'Pridať Otázku' : 'Upraviť Otázku' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="dialogForm.text"
              label="Text otázky"
              outlined
              dense
              required
            />
            <v-select
              v-model="dialogForm.type"
              :items="typeOptions"
              label="Typ otázky"
              outlined
              dense
              required
            />
            <v-select
              v-model="dialogForm.category"
              :items="categoryOptions"
              label="Kategória"
              outlined
              dense
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="dialogVisible = false">Zrušiť</v-btn>
          <v-btn color="primary" @click="submitDialogForm">Uložiť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '@/config/axiosConfig';
import type { Question } from '@/types/question';

const questions = ref<Question[]>([]);
const filters = ref({
  text: '',
  type: [] as string[],
  category: [] as string[],
});
const currentPage = ref(1);
const perPage = 10;

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const dialogForm = ref<Question>({
  _id: '',
  text: '',
  type: 'text',
  options: {
    min: 1,
    max: 6,
  },
  category: '',
});

const typeOptions = [
  { text: 'Textová otázka', value: 'text' },
  { text: 'Hodnotenie', value: 'rating' },
  { text: 'Áno/Nie', value: 'yes_no' },
];
const categoryOptions = [
  { text: 'Dodržiavanie pravidiel', value: 'Dodržiavanie pravidiel' },
  { text: 'Hodnotenie', value: 'Hodnotenie' },
  { text: 'Obsah práce', value: 'Obsah práce' },
  { text: 'Štruktúra práce', value: 'Štruktúra práce' },
];
const questionLabels = {
  rating: 'Hodnotenie',
  text: 'Text',
  yes_no: 'Áno/Nie',
};

const tableHeaders = [
  { title: 'Text', value: 'text' },
  { title: 'Typ', value: 'type' },
  { title: 'Kategória', value: 'category' },
  { title: '', value: 'actions', sortable: false },
];

const fetchQuestions = async () => {
  try {
    const response = await axiosInstance.get('/auth/admin/questions');
    questions.value = response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
};

const filteredQuestions = computed(() => {
  return questions.value.filter((question) => {
    const matchesText = filters.value.text
      ? question.text.toLowerCase().includes(filters.value.text.toLowerCase())
      : true;
    const matchesType = filters.value.type.length
      ? filters.value.type.includes(question.type)
      : true;
    const matchesCategory = filters.value.category.length
      ? filters.value.category.includes(question.category)
      : true;
    return matchesText && matchesType && matchesCategory;
  });
});

const paginatedQuestions = computed(() => {
  const startIndex = (currentPage.value - 1) * perPage;
  return filteredQuestions.value.slice(startIndex, startIndex + perPage);
});

const openDialog = (mode: 'add' | 'edit', question: Question | null = null) => {
  dialogMode.value = mode;
  dialogVisible.value = true;

  if (mode === 'add') {
    dialogForm.value = {
      _id: '',
      text: '',
      type: 'text',
      category: '',
    };
  } else if (question) {
    dialogForm.value = { ...question };
  }
};

const submitDialogForm = async () => {
  try {
    if (dialogMode.value === 'add') {
      const response = await axiosInstance.post('/auth/admin/questions', dialogForm.value);
      questions.value.push(response.data);
    } else {
      await axiosInstance.patch(`/auth/admin/questions/${dialogForm.value._id}`, dialogForm.value);
      const index = questions.value.findIndex((q) => q._id === dialogForm.value._id);
      if (index !== -1) {
        questions.value[index] = dialogForm.value;
      }
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('Error saving question:', error);
  }
};

const resetFilters = () => {
  filters.value = {
    text: '',
    type: [],
    category: [],
  };
};

onMounted(fetchQuestions);
</script>

<style lang="scss">
</style>
