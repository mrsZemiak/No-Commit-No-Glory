<template>
  <div>
    <h1>Email Verification</h1>
    <p>Verifying your email...</p>
  </div>
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

<style scoped>

</style>
