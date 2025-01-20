<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { UserStatus } from "@/types/user";

export default defineComponent({
  name: "UserTable",
  setup() {
    const userStore = useUserStore();

    // Filters for table
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
    const selectedUser = ref<any>({});

    // University and status options
    const universityOptions = [
      "Univerzita Konštantína Filozofa",
      "Univerzita sv. Cyrila a Metoda",
      "Univerzita Mateja Bela",
    ];
    const statusOptions = ["Aktívny", "Neaktívny", "Čakajúci", "Pozastavený"];
    const roleOptions = Object.values(userStore.reverseRoleMapping); //Use Slovak roles from store
    const statusColors = {
      [UserStatus.Active]: "green",
      [UserStatus.Inactive]: "grey",
      [UserStatus.Pending]: "blue",
      [UserStatus.Suspended]: "red",
    };

    const roleColors = {
      'Admin': "cyan",
      'Účastník': "orange",
      'Recenzent': "pink",
      admin: "cyan",
      participant: "orange",
      reviewer: "pink"
    }

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

    // Filtered users computed property
    const filteredUsers = computed(() =>
      userStore.adminUsers.filter((user) => {
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
            filters.value.selectedRole.includes(
              userStore.reverseRoleMapping[user.role.name] || user.role.name
            ))
        );
      })
    );

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

    // Open dialog for edit
    const openDialog = (mode: "edit", user?: any) => {
      dialogMode.value = mode;
      if (mode === "edit" && user) {
        // Populate selected user with Slovak role for UI
        selectedUser.value = {
          ...user,
          role: userStore.reverseRoleMapping[user.role.name || user.role] || user.role,
        };
      } else {
        selectedUser.value = {};
      }
      isDialogOpen.value = true;
    };

    // Close dialog
    const closeDialog = () => {
      isDialogOpen.value = false;
      selectedUser.value = {};
    };

    // Save user changes
    const saveUser = async () => {
      if (dialogMode.value === "edit") {
        //Map Slovak role back to English before sending to the API
        const updates = {
          ...selectedUser.value,
          role:
            userStore.roleMapping[selectedUser.value.role] ||
            selectedUser.value.role,
        };
        await userStore.updateUser(selectedUser.value._id, updates);
      }
      closeDialog();
    };

    // Fetch users on component mount
    onMounted(userStore.fetchAllUsers);

    return {
      filters,
      currentPage,
      perPage,
      isDialogOpen,
      dialogMode,
      selectedUser,
      universityOptions,
      statusOptions,
      roleOptions,
      statusColors,
      tableHeaders,
      filteredUsers,
      roleColors,
      userStore,
      resetFilters,
      openDialog,
      closeDialog,
      saveUser,
    };
  },
});
</script>

<template>
  <v-card class="table-card">
    <!-- Card Header -->
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
            v-model="filters.university"
            label="Filtrovať podľa univerzity"
            outlined
            dense
          />
        </v-col>
        <v-col cols="8" md="2">
          <v-btn color="primary" block @click="resetFilters" small>
            Zrušiť filtr
          </v-btn>
        </v-col>
      </v-row>
    </v-card-subtitle>

    <!-- Table -->
    <v-data-table
      :headers="tableHeaders"
      :items="filteredUsers"
      :items-per-page="perPage"
      :page.sync="currentPage"
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
              {{ user.status }}
            </v-chip>
          </td>
          <td>
            <v-chip
              :color="roleColors[user.role as keyof typeof roleColors]"
              dark small class="custom-chip" prepend-icon="mdi-label">
              {{ userStore.reverseRoleMapping[user.role.name] || userStore.reverseRoleMapping[user.role] || user.role }}
            </v-chip>
          </td>
          <td>{{ user.last_name }}</td>
          <td>{{ user.first_name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.university }}</td>
          <td class="d-flex justify-center align-center">
            <v-btn @click="openDialog('edit', user)" color="#E7B500">
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
      <v-card-title>Úprava používateľa</v-card-title>
      <v-card-text>
        <v-form ref="userForm">
          <v-select
            v-model="selectedUser.status"
            :items="statusOptions"
            label="Stav"
            outlined
            dense
          />
          <v-select
            v-model="selectedUser.role"
            :items="roleOptions"
            label="Rola"
            outlined
            dense
          />
          <v-text-field
            v-model="selectedUser.email"
            label="Email"
            outlined
            dense
          />
          <v-select
            v-model="selectedUser.university"
            :items="universityOptions"
            label="Univerzita"
            outlined
            dense
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" @click="closeDialog">Zrušiť</v-btn>
        <v-btn color="primary" @click="saveUser">Uložiť</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
