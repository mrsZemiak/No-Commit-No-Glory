<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <h3>Správa kategórií</h3>
      </div>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="categories"
      class="custom-table"
    >
      <template v-slot:body="{ items }">
        <tr v-for="category in items" :key="category._id" class="custom-row">
          <td>{{ category.name }}</td>
          <td>
            <v-chip
              :color="category.isActive ? 'green' : 'grey'"
              dark
              small
              class="custom-chip"
            >
              {{ category.isActive ? 'Aktívna' : 'Neaktívna' }}
            </v-chip>
          </td>
          <td>
            <v-btn @click="openDialog('edit', category)">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-btn color="primary" @click="openDialog('add')">Pridať kategóriu</v-btn>
    <!-- Add/Edit Dialog -->
    <v-dialog v-model="isDialogOpen" max-width="800px">
      <v-card>
        <v-card-title>
          {{ dialogMode === 'add' ? 'Pridať kategóriu' : 'Upraviť kategóriu' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="currentCategory.name"
              label="Názov kategórie"
              required
              outlined
            />
            <v-select
              v-model="currentCategory.isActive"
              :items="[{ title: 'Aktívna', value: true }, { title: 'Neaktívna', value: false }]"
              label="Stav"
              outlined
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="closeDialog">Zrušiť</v-btn>
          <v-btn :disabled="!valid" color="primary" @click="saveCategory">
            {{ dialogMode === 'add' ? 'Pridať' : 'Uložiť' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import axiosInstance from "@/config/axiosConfig";

export default defineComponent({
  name: "CategoryTable",
  setup(_, { emit }) {
    const categories = ref<Array<{ _id: string; name: string; isActive: boolean }>>([]);
    const isDialogOpen = ref(false);
    const dialogMode = ref<"add" | "edit">("add");
    const currentCategory = reactive({ _id: "", name: "", isActive: true });
    const valid = ref(false);
    const headers = ref([
      { title: "Názov kategórie", key: "name" },
      { title: "Stav", key: "isActive"},
      { title: "", value: "actions", sortable: false },
    ]);

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/auth/admin/categories");
        // Extract only the `categories` array from the response
        categories.value = response.data.categories;
      } catch (error) {
        console.error("Error fetching categories:", error);
        showSnackbar({ message: "Nepodarilo sa načítať kategórie", color: "error" });
      }
    };

    const openDialog = (mode: "add" | "edit", category = { _id: "", name: "", isActive: true }) => {
      dialogMode.value = mode;
      Object.assign(currentCategory, category);
      isDialogOpen.value = true;
    };

    const closeDialog = () => {
      isDialogOpen.value = false;
      Object.assign(currentCategory, { _id: "", name: "", isActive: true });
    };

    const saveCategory = async () => {
      try {
        if (dialogMode.value === "add") {
          const response = await axiosInstance.post("/auth/admin/categories", currentCategory);
          categories.value.push(response.data);
          showSnackbar({ message: "Kategória bola pridaná", color: "success" });
        } else {
          await axiosInstance.patch(`/auth/admin/categories/${currentCategory._id}`, currentCategory);
          const index = categories.value.findIndex((cat) => cat._id === currentCategory._id);
          if (index !== -1) categories.value[index] = { ...currentCategory };
          showSnackbar({ message: "Kategória bola upravená", color: "success" });
        }
        closeDialog();
      } catch (error) {
        console.error("Error saving category:", error);
        showSnackbar({ message: "Nepodarilo sa uložiť kategóriu", color: "error" });
      }
    };

    const showSnackbar = ({ message, color }: { message: string; color: string }) => {
      emit("snackbar", { message, color });
    };

    onMounted(fetchCategories);

    return {
      categories,
      isDialogOpen,
      dialogMode,
      currentCategory,
      valid,
      headers,
      fetchCategories,
      openDialog,
      closeDialog,
      saveCategory,
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
    background-color: rgba(16, 100, 102, 0.2);
    color: #2c3531;

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

div .v-btn {
  font-size:1.2rem;
}
</style>
