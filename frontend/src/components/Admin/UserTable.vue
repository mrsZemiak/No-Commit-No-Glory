<template>
  <div id="app">
    <div class="card">
      <div class="card-header">
        <h3>User Management</h3>
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
              <button class="btn btn-warning btn-sm" @click="editUser(user)">Upraviť</button>
              <button class="btn btn-danger btn-sm ml-2" @click="deleteUser(user)">Vymazať</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage * itemsPerPage >= totalUsers">Next</button>
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.badge-info {
  background-color: #17a2b8;
}

.badge-success {
  background-color: #28a745;
}

.badge-secondary {
  background-color: #6c757d;
}

.badge-warning {
  background-color: #ffc107;
}

.table th,
.table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  background: #f4f4f4;
  font-weight: bold;
}

.table .badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  color: white;
}
</style>
