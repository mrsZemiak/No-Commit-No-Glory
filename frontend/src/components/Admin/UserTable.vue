<template>
  <div>
    <div class="table-card">
      <div class="card-header">
        <h3>Správa používateľov</h3>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th>Meno</th>
            <th>Priezvisko</th>
            <th>Email</th>
            <th>Univerzita</th>
            <th>Stav</th>
            <th>Role</th>
            <th>Akcie</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(user, index) in users" :key="index">
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.university }}</td>
            <td>
                <span :class="{
                  'badge badge-success': user.status === 'active',
                  'badge badge-secondary': user.status === 'inactive',
                  'badge badge-warning': user.status !== 'active' && user.status !== 'inactive'
                }">
                      {{ user.status === 'active' ? 'aktívny' : (user.status === 'inactive' ? 'neaktívny' : user.status) }}
                </span>
            </td>
            <td>
                <span v-for="(role, i) in user.roles" :key="i" class="badge badge-info">
                  {{ role }}
                </span>
            </td>
            <td>
              <button class="btn btn-edit btn-sm" @click="editUser(user)">Upraviť</button>
              <button class="btn btn-delete btn-sm ml-2" @click="deleteUser(user)">Vymazať</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer">
        <button class="btn btn-primary" @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <button class="btn btn-primary" @click="nextPage" :disabled="currentPage * itemsPerPage >= totalUsers">Next</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <modal-edit-user :user="selectedUser" @update="updateUser" @close="closeModal" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ModalEditUser from './modalEditUser.vue';
import axios from "axios";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  status: string;
  roles: string[];
}

export default defineComponent({
  name: 'UserTable',
  components: {
    ModalEditUser,
  },
  data() {
    return {
      users: [
        { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', university: 'University A', status: 'active', roles: ['participant', 'reviewer'] },
        { firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com', university: 'University B', status: 'inactive', roles: ['admin'] },
      ] as User[],
      currentPage: 1,
      itemsPerPage: 10,
      totalUsers: 50,
      isModalVisible: false,
      selectedUser: {} as User,
    };
  },
  methods: {
    editUser(user: User): void {
      this.selectedUser = { ...user };
      this.isModalVisible = true;
    },
    closeModal(): void {
      this.isModalVisible = false;
    },
    updateUser(updatedUser: User): void {
      const index = this.users.findIndex((user) => user.email === updatedUser.email);
      if (index !== -1) {
        this.users[index] = { ...updatedUser };
      }
      this.closeModal();
    },
    deleteUser(user: User): void {
      alert(`Deleting user: ${user.firstName} ${user.lastName}`);
    },
    prevPage(): void {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage(): void {
      if (this.currentPage * this.itemsPerPage < this.totalUsers) this.currentPage++;
    },
  },
});
</script>

<style scoped>

</style>
