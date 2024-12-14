<template>
  <div class="modal-content">
    <button class="btn-close" @click="closeModal"></button>
    <h4>{{ isEditMode ? 'Upraviť konferenciu' : 'Pridať konferenciu' }}</h4>
    <form @submit.prevent="submitConference">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label for="name">Názov konferencie</label>
            <input type="text" v-model="localConference.name" id="name" required />
          </div>
          <div class="form-group mb-3">
            <label for="year">Rok</label>
            <input type="number" v-model="localConference.year" id="year" required />
          </div>
          <div class="form-group mb-3">
            <label for="location">Miesto konania</label>
            <input type="text" v-model="localConference.location" id="location" required />
          </div>
          <div class="form-group mb-3">
            <label for="conferenceDate">Dátum konferencie</label>
            <flatpickr
              v-model="localConference.conferenceDate"
              :config="flatpickrConfig"
              id="conferenceDate"
              required
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label for="submissionDeadline">Odovzdanie práce</label>
            <flatpickr
              v-model="localConference.submissionDeadline"
              :config="flatpickrConfig"
              id="submissionDeadline"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="reviewDeadline">Odovzdanie posudku</label>
            <flatpickr
              v-model="localConference.reviewDeadline"
              :config="flatpickrConfig"
              id="reviewDeadline"
              required />
          </div>
          <div class="form-group mb-3">
            <label for="revisionDeadline">Odovzdanie úprav</label>
            <flatpickr
              v-model="localConference.revisionDeadline"
              :config="flatpickrConfig"
              id="revisionDeadline"
              required />
          </div>
          <div class="form-group mb-3">
            <label for="postConferenceRevisionDeadline">Oprava práce po konferencii</label>
            <flatpickr
              :config="flatpickrConfig"
              v-model="localConference.postConferenceRevisionDeadline"
              id="postConferenceRevisionDeadline"
              required
            />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="categories">Kategórie</label>
        <select
          id="categories"
          v-model="localConference.categories"
          multiple
        >
          <option v-for="category in availableCategories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn btn-success">{{ isEditMode ? 'Aktualizovať konferenciu' : 'Pridať konferenciu' }}</button>
    </form>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { ConferenceAdmin, CategoryAdmin } from "@/types/conference";
import flatpickr from 'vue-flatpickr-component';

export default defineComponent({
  name: "ModalConference",
  components: {
    flatpickr,
  },
  props: {
    conference: {
      type: Object as PropType<ConferenceAdmin | null>,
      required: false,
      default: null,
    },
    mode: {
      type: String as PropType<"add" | "edit">,
      required: true,
    },
    availableCategories: {
      type: Array as PropType<CategoryAdmin[]>,
      default: () => [],
    },
  },
  data() {
    return {
      flatpickrConfig: {
        dateFormat: "Y-m-d",
        altFormat: "d-m-Y",
        altInput: true,
        allowInput: true,
      },
      localConference: this.conference
        ? {
          ...this.conference,
          conferenceDate: new Date(this.conference.conferenceDate),
          submissionDeadline: new Date(this.conference.submissionDeadline),
          reviewDeadline: new Date(this.conference.reviewDeadline),
          revisionDeadline: new Date(this.conference.revisionDeadline),
          postConferenceRevisionDeadline: new Date(this.conference.postConferenceRevisionDeadline),
        }
        : {
          name: "",
          year: new Date().getFullYear(),
          location: "",
          conferenceDate: new Date(),
          submissionDeadline: new Date(),
          reviewDeadline: new Date(),
          revisionDeadline: new Date(),
          postConferenceRevisionDeadline: new Date(),
          categories: [],
        },
    };
  },
  computed: {
    isEditMode(): boolean {
      return this.mode === "edit";
    },
  },
  watch: {
    conference(newConference) {
      if (newConference) {
        this.localConference = { ...newConference };
      }
    },
  },
  methods: {
    submitConference() {
      const event = this.isEditMode ? "update" : "add";
      this.$emit(event, this.localConference);
      this.closeModal();
    },
    closeModal() {
      this.$emit("close");
    },
  },
});
</script>

<style scoped>


</style>
