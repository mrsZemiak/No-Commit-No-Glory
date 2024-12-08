<template>
  <div class="submission-form">
    <h2>Submission Form</h2>
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
        <label for="sectionPick">Výber sekcie</label>
        <select v-model="form.sectionPick" id="section" required>
          <option disabled value="">Vyberte sekciu</option>
          <option v-for="section in sections" :key="section" :value="section">
            {{ section }}
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
import { ref } from 'vue';

const sections = ref(["Technology", "Science", "Art", "Music", "Sports"]);

const form = ref({
  firstName: "",
  lastName: "",
  submissionName: "",
  otherAuthors: [] as string[],
  keywords: "",
  abstract: "",
  sectionPick: "",
  projectFile: null as File | null
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

  // Reset the form after submission
  form.value = {
    firstName: "",
    lastName: "",
    submissionName: "",
    otherAuthors: [],
    keywords: "",
    abstract: "",
    sectionPick: "",
    projectFile: null,
  };
}

</script>

<style scoped>
.submission-form {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.author-row input {
  flex: 1;
}

button {
  padding: 10px 15px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="button"] {
  background: #e74c3c;
  color: white;
}

button[type="submit"] {
  background: #2ecc71;
  color: white;
}

button[type="button"]:hover {
  background: #c0392b;
}

button[type="submit"]:hover {
  background: #27ae60;
}
</style>
