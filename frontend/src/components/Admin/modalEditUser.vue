<template>
  <div class="modal-content">
    <h4>Úprava používateľa</h4>
    <form @submit.prevent="updateUser">
      <div class="form-group">
        <label for="firstName">Meno</label>
        <input type="text" v-model="user.firstName" id="firstName" required />
      </div>
      <div class="form-group">
        <label for="lastName">Priezvisko</label>
        <input type="text" v-model="user.lastName" id="lastName" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="user.email" id="email" required />
      </div>
      <div class="form-group">
        <label for="university">Univerzita</label>
        <input type="text" v-model="user.university" id="university" required />
      </div>
      <div class="form-group">
        <label for="status">Stav</label>
        <select v-model="user.status" id="status" required>
          <option value="active">Aktívny</option>
          <option value="inactive">Neaktívny</option>
        </select>
      </div>
      <div class="form-group">
        <label>Roles</label>
        <div>
          <label>
            <input
              type="checkbox"
              value="participant"
              v-model="user.roles"
            />
            Účastník
          </label>
          <label>
            <input
              type="checkbox"
              value="reviewer"
              v-model="user.roles"
            />
            Recenzent
          </label>
          <label>
            <input
              type="checkbox"
              value="admin"
              v-model="user.roles"
            />
            Admin
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-success">Aktualizovať</button>
    </form>
    <button class="btn-close" @click="closeModal">X</button>
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
