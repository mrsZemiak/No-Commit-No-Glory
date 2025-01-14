<template>
    <!-- Card Header -->
    <v-card class="table-card">
      <v-card-title>
        <h3>Správa používateľov</h3>
      </v-card-title>

      <!-- Filters Section -->
      <v-card-subtitle>
        <v-row>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.selectedStatus"
              :items="statusOptions"
              label="Stav"
              outlined
              dense
              multiple
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.selectedRole"
              :items="roleOptions"
              label="Rola"
              outlined
              dense
              multiple
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.last_name"
              label="Filtrovať podľa priezviska"
              outlined
              dense
            />
          </v-col>
          <v-col cols="10" md="2">
            <v-text-field
              v-model="filters.first_name"
              label="Filtrovať podľa mena"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.university"
              label="Filtrovať podľa univerzity"
              outlined
              dense
            />
          </v-col>
          <v-col cols="8" md="2">
            <v-btn
              color="primary"
              block
              @click="resetFilters"
              small
            >
              Zrušiť filtr
            </v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <!-- Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="paginatedUsers"
        :items-per-page="perPage"
        :page.sync="currentPage"
        :total-items="filteredUsers.length"
        class="custom-table"
        dense
        item-value="_id"
      >

        <template v-slot:body="{ items }">
          <tr v-for="user in items" :key="user._id">
            <td>
              <v-chip
                :color="statusColors[user.status as keyof typeof statusColors]"
                dark
                small
                class="custom-chip"
              >
                {{user.status }}
              </v-chip>
            </td>
            <td>
              <v-chip
                color="primary"
                dark
                small
                class="custom-chip"
              >
                {{ user.role.name || user.role }}
              </v-chip>
            </td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.university }}</td>
            <td style="display: flex; justify-content: center; align-items: center;">
              <v-btn
                @click="openDialog('edit', user)"
                color="#E7B500"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

  <!-- Dialog for Editing Users -->
  <v-dialog v-model="isDialogOpen" max-width="800px">
    <v-card>
      <v-card-title>
        "Úprava používateľa"
      </v-card-title>
      <v-card-text>
        <v-form ref="userForm">
          <v-text-field
            v-model="selectedUser.email"
            label="Email"
            outlined
            dense
          />
          <v-select
            v-model="selectedUser.university"
            :items="['Univerzita Konštantína Filozofa', 'Univerzita sv. Cyrila a Metoda', 'Univerzita Mateja Bela']"
            label="Univerzita"
            outlined
            dense
          />
          <v-select
            v-model="selectedUser.status"
            :items="['Čakajúci', 'Aktívny', 'Neaktívny', 'Pozastavený']"
            label="Stav"
            outlined
            dense
          />
          <v-radio-group
            v-model="selectedUser.role"
            row
            label="Role"
          >
            <v-radio label="Účastník" value="participant"></v-radio>
            <v-radio label="Recenzent" value="reviewer"></v-radio>
            <v-radio label="Admin" value="admin"></v-radio>
          </v-radio-group>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" @click="closeDialog">Zrušiť</v-btn>
        <v-btn color="primary" @click="saveUser">Uložiť</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { type AdminUser, UserStatus } from '@/types/user'
import axiosInstance from '@/config/axiosConfig.ts'

export default defineComponent({
  name: "UserTable",
  setup() {
    const users = ref<AdminUser[]>([]);
    const filters = ref({
      first_name: "",
      last_name: "",
      university: "",
      selectedStatus: [] as string[],
      selectedRole: [] as string[],
    });
    const currentPage = ref(1);
    const perPage = ref(10);
    const isDialogOpen = ref(false);
    const dialogMode = ref<"edit">("edit");
    const selectedUser = ref<AdminUser>({
      _id: "",
      first_name: "",
      last_name: "",
      email: "",
      university: "",
      role: {name: ""},
      status: UserStatus.Inactive,
      isVerified: false,
    });
    const snackbar = ref({
      show: false,
      message: "",
      color: "error",
      timeout: 5000,
    });

    const showSnackbar = ({ message, color }: { message: string; color?: string }) => {
      snackbar.value = {
        show: true,
        message,
        color: color || "error",
        timeout: 5000,
      };
    };

    // Table headers
    const tableHeaders = [
      { title: "Stav", value: "status" },
      { title: "Role", value: "role" },
      { title: "Priezvisko", value: "last_name" },
      { title: "Meno", value: "first_name" },
      { title: "Email", value: "email" },
      { title: "Univerzita", value: "university" },
      { title: "", value: "actions", sortable: false },
    ];

    // Options for filtering
    const statusOptions = ["Aktívny", "Neaktívny", "Čakajúci", "Pozastavený"];
    const roleOptions = ["Účastník", "Recenzent","Admin"];

    // Labels and colors for status and roles
    const statusLabels = {
      active: "Aktívny",
      inactive: "Neaktívny",
      pending: "Čakajúci",
      suspended: "Pozastavený",
    };

    const statusColors = {
      Aktívny: "green",
      Neaktívny: "grey",
      Čakajúci: "blue",
      Pozastavený: "red",
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
        const response = await axiosInstance.get("/auth/admin/users");
        users.value = response.data.map((user: any) => ({
          ...user,
          role: typeof user.role === "string" ? { name: user.role } : user.role,
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
        showSnackbar({ message: "Nepodarilo sa načítať používateľov", color: "error" });
      }
    };

    const openDialog = (mode: "edit", user?: AdminUser) => {
      dialogMode.value = mode;

      if (mode === "edit" && user) {
        // Populate the form with the user's data
        selectedUser.value = {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          university: user.university,
          status: user.status,
          role: user.role,
          isVerified: user.isVerified,
        };
      } else {
        // Reset the form for "add" mode
        selectedUser.value = {
          _id: "",
          first_name: "",
          last_name: "",
          email: "",
          university: "",
          status: UserStatus.Pending,
          role: { name: "" },
          isVerified: true,
        };
      }

      isDialogOpen.value = true;
    };

    const closeDialog = () => {
      isDialogOpen.value = false;
      Object.assign(selectedUser, { _id: "", firstName: "", lastName: "", role: null, status: "" });
    };

    const saveUser = async () => {
      try {
        if (dialogMode.value === "edit") {
          // Create a shallow copy of the user with only the necessary fields
          const userPayload = {
            email: selectedUser.value.email,
            status: selectedUser.value.status,
            role: selectedUser.value.role,
          };

          await axiosInstance.patch(`/auth/admin/users/${selectedUser.value._id}`, userPayload);

          const index = users.value.findIndex((user) => user._id === selectedUser.value._id);
          if (index !== -1) users.value[index] = { ...selectedUser.value };

          showSnackbar({ message: "Používateľ bol upravený", color: "success" });
        }

        closeDialog();
      } catch (error) {
        console.error("Error saving user:", error);
        showSnackbar({ message: "Nepodarilo sa uložiť používateľa", color: "error" });
      }
    };

    // Reset filters
    const resetFilters = () => {
      filters.value = {
        first_name: "",
        last_name: "",
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
      selectedUser,
      dialogMode,
      snackbar,
      tableHeaders,
      statusOptions,
      roleOptions,
      statusLabels,
      statusColors,
      filteredUsers,
      totalPages,
      paginatedUsers,
      isDialogOpen,
      saveUser,
      showSnackbar,
      fetchUsers,
      resetFilters,
      openDialog,
      closeDialog,
    };
  },
});
</script>

<style lang="scss">

</style>
