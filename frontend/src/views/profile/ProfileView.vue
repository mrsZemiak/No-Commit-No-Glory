<template>
  <v-container class="profile">
    <!-- Profile Card -->
    <v-card class="profile-card" outlined>
      <v-row align="center">
        <!-- Avatar -->
        <v-col cols="12" md="3" class="d-flex justify-center">
          <v-avatar size="120">
            <v-img :src="profile?.avatar || defaultAvatar" alt="Avatar"></v-img>
          </v-avatar>
        </v-col>

        <!-- Profile Info -->
        <v-col cols="12" md="7">
          <h3>{{ profile?.first_name }} {{ profile?.last_name }}</h3>
          <p>{{ profile?.university }}</p>
          <p>{{ profile?.faculty }}</p>
        </v-col>

        <!-- Edit Button -->
        <v-col class="d-flex justify-end">
          <v-btn class="flex-grow-0" color="primary" size="large" @click="toggleEditMode" v-if="!editMode">Upraviť</v-btn>
        </v-col>
      </v-row>

      <!-- Edit Profile Form -->
      <v-form v-if="editMode" ref="formRef" v-model="valid">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.first_name" label="Meno" outlined></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.last_name" label="Priezvisko" outlined></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.university" label="Univerzita" outlined></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.faculty" label="Fakulta" outlined></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.about" label="O mne" outlined></v-textarea>
          </v-col>
          <v-col cols="12">
            <v-file-input
              v-model="form.avatar"
              label="Nahrajte avatar"
              accept="image/*"
              outlined
            ></v-file-input>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.currentPassword"
              label="Aktuálne heslo"
              type="password"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.newPassword"
              label="Nové heslo"
              type="password"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Form Actions -->
        <v-row>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="secondary" @click="toggleEditMode">Zrušiť</v-btn>
            <v-btn color="primary" :disabled="!valid" @click="saveProfile">Uložiť</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import defaultAvatar from "@/assets/images/unknown_person.jpg";

export default {
  setup() {
    const authStore = useAuthStore();
    const profile = computed(() => authStore.user); // reactive user data from the store
    const editMode = ref(false); // toggle form visibility
    const valid = ref(true); // form validation state
    const isLoading = ref(false);

    // Initialize form with store data
    const form = ref({
      first_name: "",
      last_name: "",
      university: "",
      faculty: "",
      about: "",
      avatar: null,
      currentPassword: "",
      newPassword: "",
    });

    const toggleEditMode = () => {
      if (editMode.value) {
        // Reset form data if canceled
        form.value = {
          first_name: profile.value?.first_name || "",
          last_name: profile.value?.last_name || "",
          university: profile.value?.university || "",
          faculty: profile.value?.faculty || "",
          about: profile.value?.about || "",
          avatar: null,
          currentPassword: "",
          newPassword: "",
        };
      }
      editMode.value = !editMode.value;
    };

    const saveProfile = async () => {
      isLoading.value = true;
      try {
        await authStore.updateProfile(form.value);
        toggleEditMode();
        console.log("Profile updated successfully");
      } catch (error) {
        console.error("Error saving profile:", error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(async () => {
      if (authStore.isAuthenticated) {
        await authStore.fetchUserProfile(); // Fetch user profile only if authenticated
      }
    });

    return {
      profile,
      defaultAvatar,
      editMode,
      valid,
      form,
      toggleEditMode,
      saveProfile,
    };
  },
};
</script>

<style lang="scss" scoped>

.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .v-btn {
    margin-right: 15px;
    font-size: 1.2rem;
  }
}

.profile-card {
  padding: 16px;
  border-radius: 10px;
  min-width: 100%;
}

.v-avatar img {
  border-radius: 50%;
  object-fit: cover;
  padding-bottom: 20px;
}

.v-card-title {
  font-weight: bold;
}

.v-textarea,
.v-text-field,
.v-file-input {
  margin-bottom: 16px;
}

</style>
