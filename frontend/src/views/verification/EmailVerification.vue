<template>
  <v-container class="email-verification-container">
    <!-- Card for Message -->
    <v-card class="text-center" outlined>
      <v-card-title class="text-h3">Email Verification</v-card-title>
      <v-card-text>
        <p>Your email is being verified. Please wait...</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth.ts';

export default defineComponent({
  async mounted() {
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token'); // Extract the token from the query string

    if (token) {
      try {
        const authStore = useAuthStore();
        await authStore.verifyEmail(token); // Call the Pinia action for verification
        this.$router.push('/email-verified-success'); // Redirect to success page
      } catch (error) {
        console.error('Email verification failed:', error);
        this.$router.push('/email-verified-failure'); // Redirect to failure page
      }
    } else {
      console.error('No token provided for email verification');
      this.$router.push('/email-verified-failure'); // Redirect to failure page
    }
  },
});
</script>

<style scoped lang="scss">
.email-verification-container {
  display: flex;
  flex-direction: column; /* Stack image and card vertically */
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
}

.verification-image {
  max-width: 300px; /* Adjust as needed */
  margin-bottom: 16px;
}

v-card {
  max-width: 400px;
  padding: 16px;
}

p {
  font-size: 1.2rem;
}
</style>
