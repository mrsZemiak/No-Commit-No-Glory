<template>
  <div class="submission-form">
    <h2>Odovzdanie práce</h2>
    <form @submit.prevent="handleSubmit">

      <div class="form-group">
        <label for="firstName">Meno</label>
        <input
          type="text"
          id="firstName"
          v-model="form.firstName"
          placeholder="Vaše meno"
          required
        />
      </div>

      <div class="form-group">
        <label for="lastName">Priezvisko</label>
        <input
          type="text"
          id="lastName"
          v-model="form.lastName"
          placeholder="Vaše priezvisko"
          required
        />
      </div>

      <div class="form-group">
        <label for="submissionName">Názov práce</label>
        <input
          type="text"
          id="submissionName"
          v-model="form.submissionName"
          placeholder="Názov práce"
          required
        />
      </div>

      <div class="form-group">
        <label for="categoryPick">Výber sekcie</label>
        <select v-model="form.categoryPick" id="category" required>
          <option disabled value="">Vyberte sekciu</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Autori</label>
        <div v-for="(author, index) in form.otherAuthors" :key="index" class="author-row">
          <input
            type="text"
            v-model="form.otherAuthors[index]"
            placeholder="Vložte meno autora"
          />
          <button type="button" @click="removeAuthor(index)">Odstrániť</button>
        </div>
        <button type="button" @click="addAuthor">Pridať autora</button>
      </div>

      <div class="form-group">
        <label for="keywords">Kľúčové slová</label>
        <input
          type="text"
          id="keywords"
          v-model="form.keywords"
          placeholder="Vložte kľúčové slová oddelené čiarkou"
          required
        />
      </div>

      <div class="form-group">
        <label for="abstract">Abstrakt</label>
        <textarea
          id="abstract"
          v-model="form.abstract"
          placeholder="Vložte svoj abstrakt"
          rows="5"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="projectFile">Projektový súbor</label>
        <input
          type="file"
          id="projectFile"
          @change="handleFileChange"
          accept=".pdf,.docx"
          required
        />
        <small class="form-text text-muted">Akceptované formáty: PDF, Word (.docx)</small>
      </div>


      <button type="submit">Odovzdať</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';


const categories = ref([] as { id: string; name: string }[]);

const form = ref({
  firstName: "",
  lastName: "",
  submissionName: "",
  otherAuthors: [] as string[],
  keywords: "",
  abstract: "",
  categoryPick: "",
  projectFile: null as File | null
});

onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/categories"); // Adjust the URL to your API
    categories.value = response.data.map((category: any) => ({
      id: category._id.$oid,
      name: category.name,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
});
function addAuthor() {
  form.value.otherAuthors.push("");
}

function removeAuthor(index: number) {
  form.value.otherAuthors.splice(index, 1);
}

function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;
  form.value.projectFile = file;
}

function handleSubmit() {

  console.log("Form submitted:", form.value);

  if (!form.value.projectFile) {
    alert("Prosím vyberte projektový súbor (PDF alebo Word).");
    return;
  }
  alert("Form submitted successfully!");

  form.value = {
    firstName: "",
    lastName: "",
    submissionName: "",
    otherAuthors: [],
    keywords: "",
    abstract: "",
    categoryPick: "",
    projectFile: null,
  };
}

</script>

<style scoped>

</style>
