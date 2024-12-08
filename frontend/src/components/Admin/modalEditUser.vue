<template>
  <div class="modal-content">
    <h4>Edit User</h4>
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
import { defineComponent, PropType } from 'vue';

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
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
}
</style>
