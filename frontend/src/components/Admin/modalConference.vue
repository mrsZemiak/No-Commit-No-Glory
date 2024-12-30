<template>
  <div class="modal-content">
    <button class="btn-close" @click="closeModal"></button>
    <h4>{{ isEditMode ? 'Upraviť konferenciu' : (isViewMode ? 'Zobraziť konferenciu' : 'Pridať konferenciu') }} </h4>
    <form @submit.prevent="submitConference">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label for="name">Univerzita</label>
            <input
              type="text"
              v-model="localConference.university"
              id="name"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="year">Rok</label>
            <input
              type="number"
              v-model="localConference.year"
              id="year"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="location">Miesto konania</label>
            <input
              type="text"
              v-model="localConference.location"
              id="location"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="status">Stav</label>
            <select
              v-model="localConference.status"
              id="status"
              class="form-control"
              :disabled="isViewMode"
              required
            >
              <option value="closed">Skončená</option>
              <option value="open">Aktuálna</option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label for="submissionDeadline">Odovzdanie práce</label>
            <flatpickr
              v-model="localConference.submissionDeadline"
              :config="flatpickrConfig"
              id="submissionDeadline"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="reviewDeadline">Odovzdanie posudku</label>
            <flatpickr
              v-model="localConference.reviewDeadline"
              :config="flatpickrConfig"
              id="reviewDeadline"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="revisionDeadline">Začiatok odovzdávania</label>
            <flatpickr
              v-model="localConference.start_date"
              :config="flatpickrConfig"
              id="revisionDeadline"
              :disabled="isViewMode"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="postConferenceRevisionDeadline">Koniec odovzdávania</label>
            <flatpickr
              v-model="localConference.end_date"
              :config="flatpickrConfig"
              id="postConferenceRevisionDeadline"
              :disabled="isViewMode"
              required
            />
          </div>
        </div>
      </div>

<!--      <div class="form-group">
        <label for="categories">Kategórie</label>
        <VueMultiselect
          v-model="localConference.categories"
          :options="availableCategories"
          label="name"
          track-by="_id"
          placeholder="Vyberte kategórie"
          multiple
          close-on-select
          :disabled="isViewMode"
        />
      </div>-->

      <div class="form-group">
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
import type { ConferenceAdmin, CategoryAdmin } from "@/types/conference";
import flatpickr from "vue-flatpickr-component";

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
      type: String as PropType<"add" | "edit" | "view">,
      required: true,
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
          submissionDeadline: new Date(this.conference.deadline_submission),
          reviewDeadline: new Date(this.conference.deadline_review),
          start_date: new Date(this.conference.start_date),
          end_date: new Date(this.conference.end_date),
        }
        : {
          _id: "",
          university: "",
          year: new Date().getFullYear(),
          location: "",
          submissionDeadline: new Date(),
          reviewDeadline: new Date(),
          start_date: new Date(),
          end_date: new Date(),
          user: "676edcaa19ea5a907dc17565",
          status: "open",
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
          submissionDeadline: new Date(newConference.deadline_submission),
          reviewDeadline: new Date(newConference.deadline_review),
          start_date: new Date(newConference.start_date),
          end_date: new Date(newConference.end_date),
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
        user: "676edcaa19ea5a907dc17565",
      };

      const apiUrl = this.isEditMode
        ? `http://localhost:3000/api/admin/conferences/${this.localConference._id}`
        : `http://localhost:3000/api/admin/conferences`;

      const method = this.isEditMode ? "PATCH" : "POST";
      console.log(JSON.stringify(payload));
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

<!--
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
-->
<style scoped>

</style>
