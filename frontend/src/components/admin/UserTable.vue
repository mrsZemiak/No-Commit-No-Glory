<template>
    <!-- Card Header -->
    <v-card class="table-card">
      <v-card-title>
        <h3>Správa používateľov</h3>
      </v-card-title>

      <!-- Filters Section -->
      <v-card-subtitle>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.first_name"
              label="Filtrovať podľa mena"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.last_name"
              label="Filtrovať podľa priezviska"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.email"
              label="Filtrovať podľa emailu"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.university"
              label="Filtrovať podľa univerzity"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.selectedStatus"
              :items="statusOptions"
              label="Stav"
              outlined
              dense
              multiple
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.selectedRole"
              :items="roleOptions"
              label="Rola"
              outlined
              dense
              multiple
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              block
              @click="resetFilters"
              small
            >
              Zrušiť filtrovanie
            </v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <!-- Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="paginatedUsers"
        :items-per-page="perPage"
        class="elevation-1"
        dense
        item-value="_id"
      >

        <template v-slot:body="{ items }">
          <tr v-for="user in items" :key="user._id">
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.university }}</td>
            <td>
              <v-chip
                :color="statusColors[user.status as keyof typeof statusColors]"
                dark
                small
              >
                {{statusLabels[user.status as keyof typeof statusLabels] || user.status }}
              </v-chip>
            </td>
            <td>
              <v-chip
                color="primary"
                dark
                small
              >
                {{ roleLabels[user.role.name as keyof typeof roleLabels] || user.role.name }}
              </v-chip>
            </td>
            <td>
              <v-btn
                @click="editUser(user)"
                color="primary"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal for Editing -->
    <v-dialog v-model="isModalVisible" max-width="600px">
      <v-card>
        <v-card-title>Edit User</v-card-title>
        <v-card-text>
          <modal-edit-user
            :user="selectedUser"
            @update="updateUser"
            @close="closeModal"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeModal">Zatvoriť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  <v-snackbar
    v-model="snackbarVisible"
    color="error"
    :timeout="3000"
    top
  >
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn @click="snackbarVisible = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import axios from "axios";
import ModalEditUser from "./ModalEditUser.vue";
import type { User } from "@/types/user";
import axiosInstance from '@/config/axiosConfig.ts'

export default defineComponent({
  name: "UserTable",
  components: {
    ModalEditUser,
  },
  setup() {
    const users = ref<User[]>([]);
    const filters = ref({
      first_name: "",
      last_name: "",
      email: "",
      university: "",
      selectedStatus: [] as string[],
      selectedRole: [] as string[],
    });
    const currentPage = ref(1);
    const perPage = ref(10);
    const isModalVisible = ref(false);
    const selectedUser = ref<User | null>(null);
    const snackbarMessage = ref("");
    const snackbarVisible = ref(false);

    // Table headers
    const tableHeaders = [
      { title: "Meno", value: "first_name" },
      { title: "Priezvisko", value: "last_name" },
      { title: "Email", value: "email" },
      { title: "Univerzita", value: "university" },
      { title: "Stav", value: "status" },
      { title: "Role", value: "role.name" },
      { title: "Akcie", value: "actions", sortable: false },
    ];

    // Options for filtering
    const statusOptions = [
      { text: "Aktívny", value: "active" },
      { text: "Neaktívny", value: "inactive" },
      { text: "Čakajúci", value: "pending" },
      { text: "Pozastavený", value: "suspended" },
    ];
    const roleOptions = [
      { text: "Účastník", value: "participant" },
      { text: "Recenzent", value: "reviewer" },
      { text: "Admin", value: "admin" },
    ];

    // Labels and colors for status and roles
    const statusLabels = {
      active: "aktívny",
      inactive: "neaktívny",
      pending: "čakajúci",
      suspended: "pozastavený",
    };
    const roleLabels = {
      participant: "Účastník",
      reviewer: "Recenzent",
      admin: "Admin",
    };
    const statusColors = {
      active: "green",
      inactive: "grey",
      pending: "blue",
      suspended: "red",
    };

    // Computed properties
    const filteredUsers = computed(() =>
      (users.value || []).filter((user) => {
        return (
          (!filters.value.first_name ||
            user.first_name
              .toLowerCase()
              .includes(filters.value.first_name.toLowerCase())) &&
          (!filters.value.last_name ||
            user.last_name
              .toLowerCase()
              .includes(filters.value.last_name.toLowerCase())) &&
          (!filters.value.email ||
            user.email
              .toLowerCase()
              .includes(filters.value.email.toLowerCase())) &&
          (!filters.value.university ||
            user.university
              .toLowerCase()
              .includes(filters.value.university.toLowerCase())) &&
          (!filters.value.selectedStatus.length ||
            filters.value.selectedStatus.includes(user.status)) &&
          (!filters.value.selectedRole.length ||
            filters.value.selectedRole.includes(user.role.name))
        );
      })
    );

    const totalPages = computed(() =>
      Math.ceil(filteredUsers.value.length / perPage.value)
    );

    const paginatedUsers = computed(() => {
      const startIndex = (currentPage.value - 1) * perPage.value;
      return filteredUsers.value.slice(
        startIndex,
        startIndex + perPage.value
      );
    });

    // Fetch users from the server
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get<User[]>("/auth/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        users.value = response.data || [];
      } catch (error) {
        snackbarMessage.value = "Error fetching users!";
        snackbarVisible.value = true;
        console.error("Error fetching users:", error);
      }
    };

    // Modal methods
    const editUser = (user: any) => {
      selectedUser.value = { ...user };
      isModalVisible.value = true;
    };
    const closeModal = () => {
      isModalVisible.value = false;
    };
    const updateUser = (updatedUser: any) => {
      const index = users.value.findIndex(
        (user) => user._id === updatedUser._id
      );
      if (index !== -1) {
        users.value[index] = { ...updatedUser };
      }
      closeModal();
    };

    // Reset filters
    const resetFilters = () => {
      filters.value = {
        first_name: "",
        last_name: "",
        email: "",
        university: "",
        selectedStatus: [],
        selectedRole: [],
      };
    };

    // Fetch data on component mount
    onMounted(fetchUsers);

    return {
      users,
      filters,
      currentPage,
      perPage,
      isModalVisible,
      selectedUser,
      snackbarMessage,
      snackbarVisible,
      tableHeaders,
      statusOptions,
      roleOptions,
      statusLabels,
      roleLabels,
      statusColors,
      filteredUsers,
      totalPages,
      paginatedUsers,
      fetchUsers,
      editUser,
      closeModal,
      updateUser,
      resetFilters,
    };
  },
});
</script>

<style lang="scss">
.v-card {
  padding: 25px;

  .v-card-title {
    margin: 10px;
    font-size: 1.5rem;
    color: #116466;
    text-transform: uppercase;
  }

  .v-btn {
    margin-left: 10px;
  }

  .custom-table thead th{
    font-size: 1.3rem;
    background-color: rgba(16, 100, 102, 0.4);
    border-radius: 20px;

  }
  .custom-table td {
    font-size: 1.2rem;
    font-weight: normal;
    padding-top: 20px;

    .custom-chip {
      font-size: 1.1rem;
      padding: 10px 8px;
    }
  }
}
</style>
