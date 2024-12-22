<template>
  <div>
    <div class="table-card">
      <div class="card-header">
        <h3>Správa používateľov</h3>
      </div>

      <div class="filters">
        <div class="filter-dropdown">
          <button @click="dropdownOpen = !dropdownOpen" class="btn btn-primary">
            Filter
          </button>
          <div v-if="dropdownOpen" class="dropdown-content">
            <div class="filter-group">
              <label class="fw-bold">Meno:</label>
              <input type="text" class="form-control" v-model="filters.firstName" placeholder="Filtrovať podľa mena" />
            </div>

            <div class="filter-group">
              <label class="fw-bold">Priezvisko:</label>
              <input type="text" class="form-control" v-model="filters.lastName" placeholder="Filtrovať podľa priezviska" />
            </div>

            <div class="filter-group">
              <label class="fw-bold">Email:</label>
              <input type="text" class="form-control" v-model="filters.email" placeholder="Filtrovať podľa emailu" />
            </div>

            <div class="filter-group">
              <label class="fw-bold">Univerzita:</label>
              <input type="text" class="form-control" v-model="filters.university" placeholder="Filtrovať podľa univerzity" />
            </div>

            <div class="filter-group">
              <label class="fw-bold">Stav:</label>
              <div class="filter-checkbox">
                <input
                  type="checkbox"
                  value="True"
                  v-model="filters.selectedStatus"
                />
                <label>Aktívny</label>
                <input
                  type="checkbox"
                  value="False"
                  v-model="filters.selectedStatus"
                />
                <label>Neaktívny</label>
              </div>
            </div>
            <div class="filter-group">
              <label class="fw-bold">Rola:</label>
              <div class="filter-checkbox">
                <input
                  type="checkbox"
                  value="participant"
                  v-model="filters.selectedRole"
                />
                <label>Študent</label>
                <input
                  type="checkbox"
                  value="reviewer"
                  v-model="filters.selectedRole"
                />
                <label>Recenzent</label>
                <input
                  type="checkbox"
                  value="admin"
                  v-model="filters.selectedRole"
                />
                <label>Admin</label>
              </div>
            </div>


            <div class="filter-group">
              <button @click="resetFilters" class="btn btn-primary btn-sm">Zrušiť filtrovanie</button>
            </div>
          </div>
        </div>
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
          <tr v-for="(user, index) in paginatedUsers" :key="index">
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
              <button class="btn btn-edit btn-sm ml-2" @click="editUser(user)">Upraviť</button>
              <button class="btn btn-delete btn-sm ml-2" @click="deleteUser(user)">Vymazať</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination-footer">
        <div class="pagination">
          <button
            class="btn btn-primary"
            @click="currentPage > 1 && (currentPage--)"
            :disabled="currentPage === 1"
          >
            Previous
          </button>
          <span class="pagination-current">Strana {{ currentPage }}</span>
          <button
            class="btn btn-primary"
            @click="currentPage < totalPages && (currentPage++)"
            :disabled="currentPage === totalPages || remainingItems <= perPage"
          >
            Next
          </button>
        </div>
      </footer>

      <!-- Modal -->
      <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <modal-edit-user :user="selectedUser" @update="updateUser" @close="closeModal" />
        </div>
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
      filters: {
        firstName: '',
        lastName: '',
        email: '',
        university: '',
        selectedStatus: [] as string[],
        selectedRole: [] as string[],
      },
      dropdownOpen: false,
      currentPage: 1,
      perPage: 10,
      isModalVisible: false,
      selectedUser: {} as User,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.perPage);
    },
    paginatedUsers() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      return this.filteredUsers.slice(startIndex, startIndex + this.perPage);
    },
    remainingItems() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const remaining = this.filteredUsers.length - startIndex;
      return remaining;
    },
    filteredUsers() {
      return this.users.filter((user) => {
        const matchesFirstName = this.filters.firstName
          ? user.firstName.toLowerCase().includes(this.filters.firstName.toLowerCase())
          : true;
        const matchesLastName = this.filters.lastName
          ? user.lastName.toLowerCase().includes(this.filters.lastName.toLowerCase())
          : true;
        const matchesEmail = this.filters.email
          ? user.email.toLowerCase().includes(this.filters.email.toLowerCase())
          : true;
        const matchesUniversity = this.filters.university
          ? user.university.toLowerCase().includes(this.filters.university.toLowerCase())
          : true;
        const matchesStatus = this.filters.selectedStatus.length
          ? this.filters.selectedStatus.includes(user.status === 'active' ? 'True' : 'False')
          : true;
        const matchesRole = this.filters.selectedRole.length
          ? this.filters.selectedRole.some((role) => user.roles.includes(role))
          : true;


        return matchesFirstName && matchesLastName && matchesEmail && matchesUniversity && matchesStatus && matchesRole;
      });
    },
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
    resetFilters() {
      this.filters = {
        firstName: '',
        lastName: '',
        email: '',
        university: '',
        selectedStatus: [],
        selectedRole: [],
      };
    },
  },
});
</script>

<style scoped>

</style>
