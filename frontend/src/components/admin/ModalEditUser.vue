<template>
  <div class="modal-content">
    <h4>Úprava používateľa</h4>
    <form @submit.prevent="updateUser">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="user.email" id="email" required />
      </div>
      <div class="form-group">
        <label for="university">Univerzita</label>
        <select v-model="user.university" id="university" required>
          <option value="UKF">UKF</option>
          <option value="UCM">UCM</option>
          <option value="UMB">UMB</option>
        </select>
      </div>
      <div class="form-group">
        <label for="status">Stav</label>
        <select v-model="user.status" id="status" required>
          <option value="active">Aktívny</option>
          <option value="inactive">Neaktívny</option>
          <option value="suspended">Pozastavený</option>
        </select>
      </div>
      <div class="form-group user-role-group">
        <label class="role-label">Role</label>
        <div class="role-options">
          <label class="role-option">
            <input
              type="radio"
              value="participant"
              v-model="user.role.name"
            />
            Účastník
          </label>
          <label class="role-option">
            <input
              type="radio"
              value="reviewer"
              v-model="user.role.name"
            />
            Recenzent
          </label>
          <label class="role-option">
            <input
              type="radio"
              value="admin"
              v-model="user.role.name"
            />
            Admin
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Aktualizovať</button>
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
