<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h5>Priradiť recenzenta pre: {{ work?.title }}</h5>
        <button @click="$emit('close')" class="btn-close"></button>
      </div>
      <div class="modal-body">
        <label class="fw-bold" for="reviewer-select">Vyberte recenzenta:</label>
        <multiselect
          v-model="selectedReviewer"
          :options="reviewers"
          :custom-label="(reviewer: User) => `${reviewer.first_name} ${reviewer.last_name} (${reviewer.email})`"
          placeholder="Vyberte hodnotiteľa"
          track-by="_id"
          label="first_name"
          :searchable="true"
          :allow-empty="true"
        />
      </div>
      <div class="modal-footer">
        <button @click="assignReviewer" class="btn btn-primary">Priradiť</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Multiselect from "vue-multiselect";
import type {User} from "@/types/user.ts";
export default defineComponent({
  name: "ModalAssignReviewer",
  components: { Multiselect },
  props: {
    work: {
      type: Object,
      required: true,
    },
    reviewers: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedReviewer: null as User | null,
    };
  },
  methods: {
    assignReviewer() {
      if (!this.selectedReviewer) {
        alert("Prosím vyberte recenzenta.");
        return;
      }
      this.$emit("assign", this.selectedReviewer);
    },
  },
});
</script>

<style lang="scss">

</style>
