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
              <option value="closed">Skončená</option>
              <option value="open">Aktuálna</option>
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
import type { ConferenceAdmin, CategoryAdmin } from "@/types/conference.ts";
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
      type: Array as PropType<CategoryAdmin[]> ,
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
          categories: [],
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
          end_date: new Date(newConference.end_date)
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
@use '@/assets/styles/main.scss' as main;

.modal-container {
  background: main.$custom-white;
  padding: 20px;
  border-radius: main.$border-radius-8;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(main.$primary-shadow, 0.1);
  position: relative;
}

.modal-title {
  font-weight: bold;
  color: main.$primary-shadow;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: main.$primary-shadow;
  }

  input,
  select {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid main.$secondary-light;
    border-radius: main.$border-radius-8;
    background-color: main.$primary-highlight;
    color: main.$primary-shadow;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: main.$primary-color;
      box-shadow: 0 0 5px rgba(main.$primary-color, 0.4);
    }
  }
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .btn-primary {
    background-color: main.$primary-color;
    color: main.$custom-white;

    &:hover {
      background-color: main.$primary-light;
    }
  }

  .btn-secondary {
    background-color: main.$secondary-color;
    color: main.$custom-black;

    &:hover {
      background-color: main.$secondary-light;
    }
  }
}
</style>
