<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useCategoryStore } from "@/stores/categoryStore";

export default defineComponent({
  name: "CategoryTable",
  setup() {
    // Initialize the category store
    const categoryStore = useCategoryStore();

    // Dialogs and form state
    const isDialogOpen = ref(false);
    const isDeleteDialogOpen = ref(false);
    const dialogMode = ref<"add" | "edit">("add");
    const currentCategory = reactive({ _id: "", name: "", isActive: true });
    const valid = ref(false);

    // Headers for the data table
    const headers = [
      { title: "Stav", key: "isActive" },
      { title: "Názov kategórie", key: "name" },
      { title: "", value: "actions", sortable: false },
    ];

    // Dialog handling
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
          await categoryStore.addCategory({ name: currentCategory.name, isActive: currentCategory.isActive });
        } else {
          await categoryStore.updateCategory(currentCategory._id, { name: currentCategory.name, isActive: currentCategory.isActive });
        }
        closeDialog();
      } catch (error) {
        console.error("Error saving category:", error);
      }
    };

    // Delete confirmation handling
    const confirmDelete = (category: { _id: string; name: string; isActive: boolean }) => {
      Object.assign(currentCategory, category);
      isDeleteDialogOpen.value = true;
    };

    const closeDeleteDialog = () => {
      isDeleteDialogOpen.value = false;
    };

    const deleteCategory = async () => {
      try {
        await categoryStore.deleteCategory(currentCategory._id);
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        closeDeleteDialog();
      }
    };

    onMounted(() => {
      categoryStore.fetchAllCategories().then(() => {
        console.log("Fetched Categories:", categoryStore.categories);
      });
    });

    return {
      categoryStore,
      isDialogOpen,
      isDeleteDialogOpen,
      dialogMode,
      currentCategory,
      valid,
      headers,
      openDialog,
      closeDialog,
      saveCategory,
      confirmDelete,
      closeDeleteDialog,
      deleteCategory,
    };
  },
});
</script>

<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <h3>Správa kategórií</h3>
      </div>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="categoryStore.categories"
      class="custom-table"
      :pageText="'{0}-{1} z {2}'"
      items-per-page-text="Kategórie na stránku"
    >
      <template v-slot:body="{ items }">
        <tr v-for="category in items" :key="category._id" class="custom-row">
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
          <td>{{ category.name }}</td>
          <td class="d-flex justify-end align-center w-100">
            <v-btn color="#E7B500" @click="openDialog('edit', category)">
              <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
            <v-btn color="#BC463A" @click="confirmDelete(category)">
              <v-icon size="24" color="white">mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-btn color="primary" class="add_new" @click="openDialog('add')">Pridať kategóriu</v-btn>

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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="isDeleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Potvrdenie odstránenia</v-card-title>
        <v-card-text>
          <p>Ste si istí, že chcete odstrániť kategóriu <strong>{{ currentCategory.name }}</strong>?</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="closeDeleteDialog">Zrušiť</v-btn>
          <v-btn color="red" @click="deleteCategory">Odstrániť</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style lang="scss">
</style>
