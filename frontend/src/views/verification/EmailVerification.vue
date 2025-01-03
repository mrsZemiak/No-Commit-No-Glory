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
    const token = query.get('token');

    if (token) {
      try {
        const authStore = useAuthStore();
        await authStore.verifyEmail(token); // Pinia store action
        this.$router.push('/email-verified-success'); // Redirect to success page
      } catch (error) {
        console.error(error);
        this.$router.push('/email-verified-failure'); // Redirect to failure page
      }
    } else {
      this.$router.push('/email-verified-failure'); // No token found
    }
  },
});
</script>

<style scoped>

</style>
