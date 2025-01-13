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
          <v-col cols="12">
            <v-file-input
              v-model="form.avatar"
              label="Nahrajte avatar"
              accept="image/*"
              outlined
              @change="onAvatarChange"
            ></v-file-input>
          </v-col>
          <v-col cols="12" class="text-center">
            <img
              :src="avatarPreview"
              alt="Avatar Preview"
              style="max-width: 150px; border-radius: 10%;"
            />
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from "@/stores/auth";
import defaultAvatar from "@/assets/images/unknown_person.jpg";
import { AxiosError } from 'axios'

interface FormType {
  first_name: string;
  last_name: string;
  university: string;
  faculty: string;
  about: string;
  avatar: File | null;
  currentPassword: string;
  newPassword: string;
  [key: string]: any; // Allow dynamic indexing
}

export default {
  setup: function() {
    const authStore = useAuthStore()
    const profile = computed(() => authStore.user) // reactive user data from the store
    const editMode = ref(false) // toggle form visibility
    const isLoading = ref(false)
    const errorMessage = ref('')
    const valid = ref(true)
    const formRef = ref()
    const validateForm = () => {
      if (formRef.value) {
        valid.value = formRef.value.validate()
      }
    }

    // Initialize form with store data
    const form = ref<FormType>({
      first_name: '',
      last_name: '',
      university: '',
      faculty: '',
      about: '',
      avatar: null,
      currentPassword: '',
      newPassword: ''
    })

    // Populate form data with the user's profile
    const populateForm = () => {
      form.value = {
        first_name: profile.value?.first_name || '',
        last_name: profile.value?.last_name || '',
        university: profile.value?.university || '',
        faculty: profile.value?.faculty || '',
        about: profile.value?.about || '',
        avatar: null, // avatar upload will be handled separately
        currentPassword: '',
        newPassword: ''
      }
    }

    const toggleEditMode = () => {
      if (!editMode.value) {
        populateForm() // Populate the form when entering edit mode
      }
      editMode.value = !editMode.value
    }

    let avatarObjectURL: string | null = null

    watch(
      () => form.value.avatar, // Watch the avatar property
      (newAvatar, oldAvatar) => {
        // Revoke the previous object URL if it exists
        if (avatarObjectURL) {
          URL.revokeObjectURL(avatarObjectURL)
          avatarObjectURL = null // Reset the stored URL
        }

        // Create a new object URL for the new avatar
        if (newAvatar instanceof File) {
          avatarObjectURL = URL.createObjectURL(newAvatar)
        }
      }
    )

    // Computed property for avatar preview
    const avatarPreview = computed(() => {
      if (form.value.avatar instanceof File) {
        return avatarObjectURL || URL.createObjectURL(form.value.avatar)
      }
      return profile.value?.avatar || '' // Default profile avatar
    })

    const onAvatarChange = (file: File | null) => {
      form.value.avatar = file
    }

    const saveProfile = async () => {
      isLoading.value = true
      errorMessage.value = '' // Clear any previous errors
      try {
        const updatedForm = new FormData()
        for (const key in form.value) {
          if (form.value[key]) {
            updatedForm.append(key, form.value[key])
          }
        }

        // Call the store action to update the profile
        await authStore.updateProfile(updatedForm)

        toggleEditMode()
        console.log('Profile updated successfully')
      } catch (error) {
        if (error instanceof AxiosError) {
          errorMessage.value = error.response?.data?.message || 'Failed to update profile.'
        } else {
          errorMessage.value = 'An unknown error occurred.'
        }
      } finally {
        isLoading.value = false
      }
    }

    onMounted(async () => {
      if (authStore.isAuthenticated) {
        try {
          await authStore.fetchUserProfile() // Fetch user profile only if authenticated
          populateForm() // Populate the form with fetched data
        } catch (error) {
          console.error('Error fetching profile:', error)
          errorMessage.value = 'Failed to load profile data.'
        }
      }
    })

    return {
      profile,
      defaultAvatar,
      editMode,
      isLoading,
      errorMessage,
      form,
      valid,
      avatarPreview,
      onAvatarChange,
      validateForm,
      toggleEditMode,
      saveProfile
    }
  }
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
  border-radius: 10%;
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
