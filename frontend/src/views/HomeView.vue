<template>
  <div id="app">
    <div class="d-flex justify-content-center align-items-center">

      <button class="btn btn-primary" @click="showLoginSignupForm = true">
        Login / Sign Up
      </button>
    </div>

    <!-- modal -->
    <div v-if="showLoginSignupForm" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <modalLoginSignup />
        <button class="btn-close" @click="closeModal">X</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import modalLoginSignup from '@/components/modalLoginSignup.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    modalLoginSignup,
  },
  setup() {

    const showLoginSignupForm = ref(false);


    const closeModal = () => {
      showLoginSignupForm.value = false;
    };

    return { showLoginSignupForm, closeModal };
  },
});
</script>

<style scoped>
.d-flex {
  height: 100vh;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
}
</style>
