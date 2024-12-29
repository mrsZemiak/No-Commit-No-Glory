<template>
  <div class="submission-form">
    <h2>Odovzdanie práce</h2>
    <form @submit.prevent="handleSubmit">

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
            {{ conference.location }} {{conference.id}}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="categoryPick">Výber sekcie</label>
        <select v-model="form.categoryPick" id="category" required>
          <option disabled value="">Vyberte sekciu</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }} {{category.id}}
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


      <button type="submit" class="btn btn-primary">Odovzdať</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';


const TEMP_USER_ID = "676edcaa19ea5a907dc17565"; //toto je len temporary kym nie je login

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
    const response = await axios.get("http://localhost:3000/api/admin/categories");
    categories.value = response.data.map((category: any) => ({
      id: category._id,
      name: category.name,
    }));
    const conferencesResponse = await axios.get("http://localhost:3000/api/admin/conferences");
    conferences.value = conferencesResponse.data.map((conference: any) => ({
      id: conference._id,
      location: conference.location,
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
  fileName.value = file ? file.name : '';
}

async function handleSubmit() {
  if (!form.value.submissionName || !form.value.abstract) {
    alert("Please fill in all required fields.");
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
    user: TEMP_USER_ID
  };

  console.log("Payload:", payload);

  try {
    const response = await axios.post("http://localhost:3000/api/participants/papers", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    alert("Paper submitted successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    alert("Failed to submit paper. Please try again.");
    console.error("Submission error:", error);
  }
}


/*async function handleSubmit() {
  if (!form.value.submissionName || !form.value.abstract) {
    alert("Please fill in all required fields.");
    return;
  }

  const formData = new FormData();
  formData.append("title", form.value.submissionName);
  formData.append("file_link", "Test");  //placeholder
  formData.append("category", form.value.categoryPick);
  formData.append("conference", form.value.conferencePick);
  formData.append("abstract", form.value.abstract);
  formData.append("keywords", form.value.keywords);
  formData.append(
    "authors",
    JSON.stringify([{ firstName: form.value.first_name, lastName: form.value.last_name },
      ...form.value.otherAuthors.map(name => {
        const [firstName, lastName] = name.split(" ");
        return { firstName, lastName };
      })
    ])
  );
  formData.append("user", TEMP_USER_ID);

  formData.forEach((value, key) => console.log(`${key}: ${value}`));

  try {
    const response = await axios.post("http://localhost:3000/api/participants/papers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Paper submitted successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    alert("Failed to submit paper. Please try again.");
    console.error("Submission error:", error);
  }
}
*/



</script>

<style scoped>

</style>
