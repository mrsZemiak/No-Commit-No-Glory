<template>
  <div class="submission-form">
    <h2>Odovzdanie práce</h2>
    <form>
      <div class="form-group">
        <label for="first_name">Meno</label>
        <input
          type="text"
          id="first_name"
          v-model="form.first_name"
          placeholder="Vaše meno"
          required
        />
      </div>

      <div class="form-group">
        <label for="last_name">Priezvisko</label>
        <input
          type="text"
          id="last_name"
          v-model="form.last_name"
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
        <label for="conferencePick">Výber konferencie</label>
        <select v-model="form.conferencePick" id="conferencePick" required>
          <option disabled value="">Vyberte konferenciu</option>
          <option v-for="conference in conferences" :key="conference.id" :value="conference.id">
            {{ conference.location }}
          </option>
        </select>
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
          <button type="button" class="btn btn-delete" @click="removeAuthor(index)">Odstrániť</button>
        </div>
        <button type="button" class="btn btn-edit" @click="addAuthor">Pridať autora</button>
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
        <div class="file-upload">
          <input
            type="file"
            id="projectFile"
            @change="handleFileChange"
            accept=".pdf,.docx"
            required
            class="file-input-submit"
          />
          <label for="projectFile" class="custom-file-label btn btn-edit">
            Vložiť súbor
          </label>
          <p v-if="fileName" class="file-name">
            Vložený súbor: {{ fileName }}
          </p>
        </div>
        <small class="form-text text-muted">Akceptované formáty: PDF, Word (.docx)</small>
      </div>

      <div class="form-group">
        <button
          type="button"
          class="btn btn-secondary"
          @click="saveAsDraft"
        >
          Uložiť ako návrh
        </button>
        <button
          type="button"
          class="btn btn-primary ml-2"
          @click="publishWork"
        >
          Odovzdať
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const workId = route.params.workId;

const TEMP_USER_ID = "63f1a5b9b7d88c6d22d6f3d8"; // Temporary User ID

const categories = ref([] as { id: string; name: string }[]);
const fileName = ref<string>('');
const conferences = ref([] as { id: string; location: string }[]);

const form = ref({
  first_name: "",
  last_name: "",
  submissionName: "",
  otherAuthors: [] as string[],
  keywords: "",
  abstract: "",
  categoryPick: "",
  conferencePick: "",
  projectFile: null as File | null
});

onMounted(async () => {
  try {
    // Fetch categories and conferences
    const [categoriesResponse, conferencesResponse] = await Promise.all([
      axios.get("http://localhost:3000/api/admin/categories"),
      axios.get("http://localhost:3000/api/admin/conferences"),
    ]);
    categories.value = categoriesResponse.data.filter((category: any) => category.isActive).map((category: any) => ({
      id: category._id,
      name: category.name,
    }));
    conferences.value = conferencesResponse.data.filter((conference: any) => conference.status === "open").map((conference: any) => ({
      id: conference._id,
      location: conference.location,
    }));

    if (workId) {
      const response = await axios.get(`http://localhost:3000/api/participant/papers/${workId}`);
      const data = response.data;
      console.log(data);
      form.value.submissionName = data.title;
      form.value.abstract = data.abstract;
      form.value.keywords = data.keywords;
      form.value.categoryPick = data.category ? data.category._id : '';
      form.value.conferencePick = data.conference ? data.conference._id : '';
      form.value.first_name = data.authors[0]?.firstName || '';
      form.value.last_name = data.authors[0]?.lastName || '';
      form.value.otherAuthors = data.authors.slice(1).map((author: any) => `${author.firstName} ${author.lastName}`);
    }
  } catch (error) {
    console.error("Error fetching categories, conferences, or work data:", error);
  }
});
function addAuthor() {
  form.value.otherAuthors.push("");
}
function saveAsDraft() {
  handleSubmit(false);
}

function publishWork() {
  handleSubmit(true);
}
function removeAuthor(index: number) {
  form.value.otherAuthors.splice(index, 1);
}

function handleFileChange(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;
  form.value.projectFile = file;
  fileName.value = file ? file.name : '';
}

async function handleSubmit(isFinalSubmission: boolean) {
  if (!form.value.first_name || !form.value.last_name || !form.value.submissionName || !form.value.abstract || !form.value.categoryPick || !form.value.conferencePick) {
    alert("Prosím vyplňte všetky políčka.");
    return;
  }

  const payload = {
    title: form.value.submissionName,
    file_link: "temporary_file_path",
    category: form.value.categoryPick,
    conference: form.value.conferencePick,
    abstract: form.value.abstract,
    keywords: form.value.keywords,
    authors: [
      { firstName: form.value.first_name, lastName: form.value.last_name },
      ...form.value.otherAuthors.map(name => {
        const [firstName, lastName] = name.split(" ");
        return { firstName, lastName };
      })
    ],
    user: TEMP_USER_ID,
    final_submission: isFinalSubmission
  };

  const workId = route.params.workId;
  const url = workId
    ? `http://localhost:3000/api/participant/papers/${workId}`
    : "http://localhost:3000/api/participant/papers";

  try {
    let response;
    if (workId) {
      response = await axios.put(url, payload);
      alert("Práca bola úspešne zmenená!");
    } else {
      response = await axios.post(url, payload);
      alert("Práca bola úspešne odovzdaná!");
    }
    console.log("Response:", response.data);
  } catch (error) {
    alert("Failed to save the work. Please try again.");
    console.error("Submission error:", error);
  }
}
</script>

<style scoped>
</style>
