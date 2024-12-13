<template>
  <div>
    <!-- Profile Card -->
    <b-card no-body class="card-profile" alt="Image placeholder">
      <b-row class="d-flex flex-column align-items-center">
        <b-col lg="3" md="4" sm="6" xs="12" >
          <div class="card-profile-image">
            <a href="#">
              <img :src="profileImage" class="img-thumbnail rounded-circle mx-auto d-block" />
            </a>
          </div>
        </b-col>
      </b-row>


      <b-card-body class="pt-0">
        <div class="text-center">
          <h5 class="h3">Jessica Jones</h5>
          <h5>
            <span class="font-weight-800">27</span>
          </h5>
          <div class="h5 font-weight-300">
            <i class="ni location_pin mr-2"></i>Názov školy
          </div>
          <div class="h5 mt-4">
            <i class="ni business_briefcase-24 mr-2"></i>Solution Manager - Creative Tim Officer
          </div>
          <div>
            <i class="ni education_hat mr-2"></i>University of Computer Science
          </div>
          <hr class="my-4" />
          <p>
            Ryan — the name taken by Melbourne-raised, Brooklyn-based Nick Murphy
            — writes, performs and records all of his own music.
          </p>
          <div class="text-center mt-4">
            <!-- Edit Profile Button -->
            <b-button variant="primary" @click="toggleEditForm">
              Edit Profile
            </b-button>
          </div>
        </div>
      </b-card-body>
    </b-card>

    <!-- Edit Profile Form -->
    <div v-if="showEditForm" class="edit-profile-form mt-3">
      <EditProfileForm />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import EditProfileForm from "./EditProfileForm.vue";
import UnknownPersonPicture from "@/assets/Unknown_person.jpg"

export default {
  components: {
    EditProfileForm,
  },
  setup() {
    const profileImage = UnknownPersonPicture;
    const showEditForm = ref(false);

    const toggleEditForm = () => {
      showEditForm.value = !showEditForm.value;
    };

    return {
      showEditForm,
      toggleEditForm,
      profileImage,
    };
  },
};
</script>

<style scoped>
.edit-profile-form {
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.card-profile-image {
  width: 80px;
  height: auto;
}
</style>
