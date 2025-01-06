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
              <input type="text" class="form-control" v-model="filters.first_name" placeholder="Filtrovať podľa mena" />
            </div>

            <div class="filter-group">
              <label class="fw-bold">Priezvisko:</label>
              <input type="text" class="form-control" v-model="filters.last_name" placeholder="Filtrovať podľa priezviska" />
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
                  value="true"
                  v-model="filters.selectedStatus"
                />
                <label>Aktívny</label>
                <input
                  type="checkbox"
                  value="false"
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
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.university }}</td>
            <td>
                 <span :class="{
                    'badge badge-success': user.status === 'active',
                    'badge badge-secondary': user.status === 'inactive',
                    'badge badge-warning': user.status === 'pending',
                    'badge badge-primary': user.status !== 'active' && user.status !== 'inactive' && user.status !== 'pending'
                  }">
                    {{ user.status === 'active' ? 'aktívny' :
                   (user.status === 'inactive' ? 'neaktívny' :
                     (user.status === 'pending' ? 'čaká na schválenie' : user.status)) }}
                  </span>
            </td>
            <td>
                <span class="badge badge-primary">
                    {{ user.role ? roleLabels[user.role.name] || user.role.name : 'Žiadna rola' }}
                </span>
            </td>
            <td class="button-group">
              <button class="icon-button" @click="editUser(user)"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="icon-button" @click="deleteUser(user)"><i class="fa-solid fa-trash-can"></i></button>
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
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="pagination-current">Strana {{ currentPage }}</span>
          <button
            class="btn btn-primary"
            @click="currentPage < totalPages && (currentPage++)"
            :disabled="currentPage === totalPages || remainingItems <= perPage"
          >
            <i class="fa-solid fa-chevron-right"></i>
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
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  status: string;
  role: { name: 'admin' | 'reviewer' | 'participant' };
}

export default defineComponent({
  name: 'UserTable',
  components: {
    ModalEditUser,
  },
  data() {
    return {
      users: [] as User[],
      filters: {
        first_name: '',
        last_name: '',
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
      roleLabels: {
        participant: "Účastník",
        reviewer: "Recenzent",
        admin: "Admin",
      },
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
        const matchesfirst_name = this.filters.first_name
          ? user.first_name.toLowerCase().includes(this.filters.first_name.toLowerCase())
          : true;
        const matcheslast_name = this.filters.last_name
          ? user.last_name.toLowerCase().includes(this.filters.last_name.toLowerCase())
          : true;
        const matchesEmail = this.filters.email
          ? user.email.toLowerCase().includes(this.filters.email.toLowerCase())
          : true;
        const matchesUniversity = this.filters.university
          ? user.university.toLowerCase().includes(this.filters.university.toLowerCase())
          : true;
        const matchesStatus = this.filters.selectedStatus.length
          ? this.filters.selectedStatus.includes(user.status ? 'true' : 'false')
          : true;
        const matchesRole = this.filters.selectedRole.length
          ? this.filters.selectedRole.includes(user.role.name.toLowerCase())
          : true;

        return matchesfirst_name && matcheslast_name && matchesEmail && matchesUniversity && matchesStatus && matchesRole;
      });
    },
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/users")
        this.users = response.data;
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
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
      alert(`Deleting user: ${user.first_name} ${user.last_name}`);
    },
    resetFilters() {
      this.filters = {
        first_name: '',
        last_name: '',
        email: '',
        university: '',
        selectedStatus: [],
        selectedRole: [],
      };
    },
  },
  mounted() {
    this.fetchUsers();
  },
});
</script>

<style scoped>

</style>
