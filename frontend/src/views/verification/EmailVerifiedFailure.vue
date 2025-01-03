<template>
  <div class="email-verification-container">
    <!-- Logo -->
    <img src="../../assets/logo.png" alt="SciSubmit Logo" class="logo" />

    <!-- Failure Message -->
    <h2>Email Verification Failed</h2>
    <p>
      We could not verify your email address. Please ensure the link is correct or try again.
    </p>

    <!-- Back Home Button -->
    <button @click="navigateToHome" class="button">
      Back to Home
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'EmailVerificationFailure',
  setup() {
    const router = useRouter();

    const navigateToHome = () => {
      router.push('/'); // Redirect to home page
    };

    return { navigateToHome };
  },
});
</script>

<style scoped>
.email-verification-container {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #2c3531;
  background-color: #f7f7f7;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 600px;
  margin: 50px auto;
  text-align: center;
}

.logo {
  max-width: 100px;
  margin-bottom: 20px;
}

h2 {
  color: #116466;
  margin-bottom: 20px;
}

p {
  color: #2c3531;
  margin-bottom: 20px;
}

.button {
  background-color: #bc4639;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #a03931;
}
</style>
