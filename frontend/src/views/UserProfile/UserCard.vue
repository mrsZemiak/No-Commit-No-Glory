<template>
  <div>
    <!-- Profile Card -->
    <b-card no-body class="card-profile" alt="Image placeholder">
      <b-row class="d-flex flex-column align-items-center">
        <b-col lg="3" md="4" sm="6" xs="12">
          <div class="card-profile-image">
              <img :src="profileImage" class="img-thumbnail rounded-circle mx-auto d-block" />
          </div>
        </b-col>
      </b-row>

      <b-card-body class="pt-0">
        <div class="text-center">
          <h3>{{ profile.first_name || '' }} {{ profile.last_name || '' }}</h3>
          <h5>
            <span class="font-weight-800">27</span>
          </h5>
          <div class="h5 font-weight-300">
            <i class="ni location_pin mr-2"></i>{{ profile.university || '' }}
          </div>
          <div class="h5 mt-4">
            <i class="ni business_briefcase-24 mr-2"></i>{{ profile.email || '' }}
          </div>
<!--          <div>-->
<!--            <i class="ni education_hat mr-2"></i>{{ profile.university || '' }}-->
<!--          </div>-->
          <hr class="my-4" />
          <div class="text-center mt-4">
            <b-button variant="primary" class="btn btn-primary" @click="openModal">Upraviť profil</b-button>
          </div>
        </div>
      </b-card-body>
    </b-card>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <EditProfileForm
          :profile="profile"
          @update="updateProfile"
          @close="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import EditProfileForm from "./EditProfileForm.vue";
import UnknownPersonPicture from "@/assets/Unknown_person.jpg";
import axios from "axios";

export default {
  components: {
    EditProfileForm,
  },
  setup() {
    const profileImage = UnknownPersonPicture;
    const showModal = ref(false);

    const profile = ref(null);

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user/profile");
        profile.value = response.data;

      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    const openModal = () => {
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };


    const updateProfile = async (updatedData) => {
      try {
        const response = await axios.put("http://localhost:3000/api/user/profile", updatedData);
        console.log("Profile updated successfully:", response.data);
        profile.value = { ...profile.value, ...response.data.user };

        closeModal();
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    };


    onMounted(fetchUserProfile);

    return {
      showModal,
      openModal,
      closeModal,
      updateProfile,
      profileImage,
      profile,
    };
  },
};
</script>

<style scoped>
</style>
