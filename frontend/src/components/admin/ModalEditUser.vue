<template>
  <div class="modal-container">
    <h4>Úprava používateľa</h4>
    <form class="submission-form" @submit.prevent="updateUser">
      <div class="form-group">
        <label for="first_name">Meno</label>
        <input type="text" id="first_name" v-model="user.first_name" required />
      </div>
      <div class="form-group">
        <label for="last_name">Priezvisko</label>
        <input type="text" id="last_name" v-model="user.last_name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="user.email" required />
      </div>
      <div class="form-group">
        <label for="status">Stav</label>
        <select id="status" v-model="user.status" required>
          <option value="active">Aktívny</option>
          <option value="inactive">Neaktívny</option>
        </select>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Aktualizovať</button>
      </div>
    </form>
    <button class="btn-close" @click="closeModal"></button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'ModalEditUser',
  props: {
    user: {
      type: Object as PropType<any>,
      required: true
    }
  },
  methods: {
    updateUser() {
      this.$emit('update', this.user);
    },
    closeModal() {
      this.$emit('close');
    }
  }
});
</script>

<style scoped>

</style>
