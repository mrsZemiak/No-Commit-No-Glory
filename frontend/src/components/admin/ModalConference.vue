<template>
  <div class="modal-container">
    <button class="btn-close" @click="closeModal"></button>
    <h4 class="modal-title">
      {{ isEditMode ? 'Upraviť konferenciu' : isViewMode ? 'Zobraziť konferenciu' : 'Pridať konferenciu' }}
    </h4>

    <form class="submission-form" @submit.prevent="submitConference">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="year">Rok</label>
            <input
              type="number"
              v-model="localConference.year"
              id="year"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="name">Univerzita</label>
            <input
              type="text"
              v-model="localConference.university"
              id="name"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="date">Dátum konania</label>
            <flatpickr
              v-model="localConference.date"
              :config="flatpickrConfig"
              id="date"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="location">Miesto konania</label>
            <input
              type="text"
              v-model="localConference.location"
              id="location"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="status">Stav</label>
            <select
              v-model="localConference.status"
              id="status"
              class="form-control"
              :disabled="isViewMode"
              required
            >
              <option value="completed">Ukončená</option>
              <option value="ongoing">Aktuálna</option>
              <option value="upcoming">Nadchádzajúca</option>
              <option value="canceled">Zrušená</option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="submissionDeadline">Odovzdanie práce</label>
            <flatpickr
              v-model="localConference.submissionDeadline"
              :config="flatpickrConfig"
              id="submissionDeadline"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="reviewDeadline">Odovzdanie posudku</label>
            <flatpickr
              v-model="localConference.reviewDeadline"
              :config="flatpickrConfig"
              id="reviewDeadline"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="start_date">Začiatok odovzdávania</label>
            <flatpickr
              v-model="localConference.start_date"
              :config="flatpickrConfig"
              id="start_date"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group">
            <label for="end_date">Koniec odovzdávania</label>
            <flatpickr
              v-model="localConference.end_date"
              :config="flatpickrConfig"
              id="end_date"
              :disabled="isViewMode"
              required
            />
          </div>
        </div>
      </div>

      <div class="form-group buttons">
        <button
          type="submit"
          class="btn btn-primary"
          v-if="!isViewMode">
          {{ isEditMode ? 'Aktualizovať konferenciu' : 'Pridať konferenciu' }}
        </button>
        <button
          v-if="isViewMode"
          class="btn btn-secondary"
          @click="switchToEditMode">
          Upraviť konferenciu
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { Category } from "@/types/category.ts";
import type { ConferenceAdmin } from "@/types/conference.ts";
import flatpickr from "vue-flatpickr-component";
import VueMultiselect from 'vue-multiselect';

export default defineComponent({
  name: "ModalConference",
  components: {
    flatpickr,
    VueMultiselect
  },
  props: {
    conference: {
      type: Object as PropType<ConferenceAdmin | null>,
      required: false,
      default: null,
    },
    mode: {
      type: String as PropType<"add" | "edit" | "view">,
      required: true,
    },
    availableCategories: {
      type: Array as PropType<Category[]> ,
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
          submissionDeadline: this.conference.deadline_submission
            ? new Date(this.conference.deadline_submission)
            : new Date(),
          reviewDeadline: this.conference.deadline_review
            ? new Date(this.conference.deadline_review)
            : new Date(),
          start_date: this.conference.start_date
            ? new Date(this.conference.start_date)
            : new Date(),
          end_date: this.conference.end_date
            ? new Date(this.conference.end_date)
            : new Date(),
          date: this.conference.date ? new Date(this.conference.date) : new Date(),
        }
        : {
          _id: "",
          year: new Date().getFullYear(),
          location: "",
          university: "",
          submissionDeadline: new Date(),
          reviewDeadline: new Date(),
          start_date: new Date(),
          end_date: new Date(),
          user: "",
          status: "",
          date: new Date(),
        },
    };
  },
  computed: {
    isEditMode(): boolean {
      return this.mode === "edit";
    },
    isViewMode(): boolean {
      return this.mode === "view";
    },
  },
  watch: {
    conference(newConference) {
      if (newConference) {
        this.localConference = {
          ...newConference,
          submissionDeadline: newConference?.deadline_submission
            ? new Date(newConference.deadline_submission)
            : new Date(),
          reviewDeadline: newConference?.deadline_review
            ? new Date(newConference.deadline_review)
            : new Date(),
          start_date: newConference?.start_date
            ? new Date(newConference.start_date)
            : new Date(),
          end_date: newConference?.end_date
            ? new Date(newConference.end_date)
            : new Date(),
          date: newConference?.date ? new Date(newConference.date) : new Date(),
        };
      }
    },
  },
  methods: {
    async submitConference() {
      const payload = {
        ...this.localConference,
        deadline_submission: this.localConference.submissionDeadline,
        deadline_review: this.localConference.reviewDeadline,
        start_date: this.localConference.start_date,
        end_date: this.localConference.end_date,
        date: this.conference?.date ? new Date(this.conference.date) : new Date(),
      };

      const apiUrl = this.isEditMode
        ? `http://localhost:5000/admin/conferences/${this.localConference._id}`
        : `http://localhost:5000/admin/conferences`;

      const method = this.isEditMode ? "PUT" : "POST";

      try {
        const response = await fetch(apiUrl, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save conference");
        }

        const savedConference = await response.json();
        this.$emit(this.isEditMode ? "update" : "add", savedConference.conference);
        this.closeModal();
      } catch (error) {
        console.error("Error submitting conference:", error);
        alert("An error occurred while saving the conference");
      }
    },
    switchToEditMode() {
      this.$emit("update:mode", "edit");
    },
    closeModal() {
      this.$emit("close");
    },
  }
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped lang="scss">

</style>
