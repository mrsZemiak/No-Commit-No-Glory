<template>
  <div>
    <!-- Profile Card -->
    <b-card no-body class="card-profile" alt="Image placeholder">
      <b-row class="d-flex flex-column align-items-center">
        <b-col lg="3" md="4" sm="6" xs="12">
          <div class="card-profile-image">
            <a href="#">
              <img :src="profileImage" class="img-thumbnail rounded-circle mx-auto d-block" />
            </a>
          </div>
        </b-col>
      </b-row>

      <b-card-body class="pt-0">
        <div class="text-center">
          <h5 class="h3">{{ profile.firstName }} {{ profile.lastName }}</h5>
          <h5>
            <span class="font-weight-800">27</span>
          </h5>
          <div class="h5 font-weight-300">
            <i class="ni location_pin mr-2"></i>{{ profile.school }}
          </div>
          <div class="h5 mt-4">
            <i class="ni business_briefcase-24 mr-2"></i>{{ profile.position }}
          </div>
          <div>
            <i class="ni education_hat mr-2"></i>{{ profile.university }}
          </div>
          <hr class="my-4" />
          <p>
            {{ profile.aboutMe }}
          </p>
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
import { ref } from "vue";
import EditProfileForm from "./EditProfileForm.vue";
import UnknownPersonPicture from "@/assets/Unknown_person.jpg";

export default {
  components: {
    EditProfileForm,
  },
  setup() {
    const profileImage = UnknownPersonPicture;
    const showModal = ref(false);

    const profile = ref({
      firstName: "Jessica",
      lastName: "Jones",
      school: "Názov školy",
      position: "Solution Manager",
      university: "University of Computer Science",
      aboutMe: "Ryan — the name taken by Melbourne-raised, Brooklyn-based Nick Murphy writes, performs and records all of his own music.",
    });

    const openModal = () => {
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const updateProfile = (updatedData) => {
      console.log("Profile updated with data:", updatedData);
      profile.value = {...updatedData};
      closeModal();
    };

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
