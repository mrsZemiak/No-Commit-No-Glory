<template>
  <div class="card">
    <div class="card-header">
      <h3>User Management</h3>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Roles</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>
              <span v-for="(role, i) in user.roles" :key="i" class="badge badge-info">
                {{ role }}
              </span>
          </td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editUser(user)">Edit</button>
            <button class="btn btn-danger btn-sm ml-2" @click="deleteUser(user)">Delete</button>
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
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export default defineComponent({
  name: "UserTable",
  data() {
    return {
      users: [
        {
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.johnson@example.com",
          roles: ["student", "reviewer"],
        },
        {
          firstName: "Bob",
          lastName: "Smith",
          email: "bob.smith@example.com",
          roles: ["admin"],
        },
        {
          firstName: "Charlie",
          lastName: "Brown",
          email: "charlie.brown@example.com",
          roles: ["student"],
        },
        {
          firstName: "Diana",
          lastName: "Evans",
          email: "diana.evans@example.com",
          roles: ["reviewer", "admin"],
        },
      ] as User[],
      currentPage: 1,
      itemsPerPage: 10,
      totalUsers: 50,
    };
  },
  methods: {
    editUser(user: User): void {
      alert(`Editing user: ${user.firstName} ${user.lastName}`);
      // Toto je všetko temporary
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
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px auto;
  max-width: 800px;
}

.card-header {
  background: #f4f4f4;
  padding: 15px;
  border-bottom: 1px solid #ddd;
}

.table {
  width: 100%;
  border-collapse: collapse;
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

.badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  font-size: 12px;
  margin-right: 5px;
}

.badge-info {
  background-color: #17a2b8;
}

.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background: #f4f4f4;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
