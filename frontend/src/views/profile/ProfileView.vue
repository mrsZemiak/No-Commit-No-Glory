<template>
  <v-container class="profile">
    <v-card class="profile-card" outlined>
      <!-- Profile Header -->
      <v-row>
        <v-col cols="12" md="3" class="d-flex justify-center">
          <v-avatar size="120">
            <v-img :src="profile?.avatar || defaultAvatar"  alt="Avatar"></v-img>/
          </v-avatar>
        </v-col>
        <v-col cols="12" md="9">
          <h3>{{ profile?.first_name }} {{ profile?.last_name }}</h3>
          <p>{{ profile?.university }}</p>
          <p>{{ profile?.faculty }}</p>
          <p>{{ profile?.about }}</p>
          <v-btn color="primary" @click="toggleEditMode" v-if="!editMode">Edit</v-btn>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <!-- Edit Profile Form -->
      <v-form v-if="editMode" ref="formRef" v-model="valid">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.first_name" label="First Name" outlined></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.last_name" label="Last Name" outlined></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.university" label="University" outlined></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.faculty" label="Faculty" outlined></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.about" label="About Me" outlined></v-textarea>
          </v-col>
          <v-col cols="12">
            <v-file-input
              v-model="form.avatar"
              label="Upload Avatar"
              accept="image/*"
              outlined
            ></v-file-input>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.currentPassword"
              label="Current Password"
              type="password"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.newPassword"
              label="New Password"
              type="password"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Form Actions -->
        <v-row>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="secondary" @click="toggleEditMode">Cancel</v-btn>
            <v-btn color="primary" :disabled="!valid" @click="saveProfile">Save</v-btn>
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
    const profile = computed(() => authStore.user); // Reactive user data from the store

    const editMode = ref(false); // Toggle form visibility
    const valid = ref(true); // Form validation state

    const isLoading = ref(false);

    // Initialize form with store data
    const form = ref({
      first_name: profile.value?.first_name || "",
      last_name: profile.value?.last_name || "",
      university: profile.value?.university || "",
      faculty: profile.value?.faculty || "",
      about: profile.value?.about || "",
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
        const formData = new FormData();
        Object.keys(form.value).forEach((key) => {
          const value = form.value[key as keyof typeof form.value];
          if (value) {
            formData.append(key, value as Blob | string); // Use `append` instead of direct assignment
          }
        });

        const response = await axios.patch("/api/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        authStore.user = response.data.user;
        toggleEditMode();
        console.log("Profile updated successfully:", response.data.user);
      } catch (error) {
        console.error("Error saving profile:", error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      authStore.fetchUserProfile(); // Fetch user profile when component mounts
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

<style lang="scss">

.profile-card {
  padding: 16px;
  border-radius: 10px;
}

.v-avatar img {
  border-radius: 50%;
  object-fit: cover;
}

.v-card-title {
  font-weight: bold;
}

.v-textarea,
.v-text-field,
.v-file-input {
  margin-bottom: 16px;
}

.v-btn {
  margin-left: 8px;
}
</style>
