<template>
  <v-container class="unauthorized-container">
    <v-card class="text-center" outlined>
      <v-card-title class="text-h3">Prístup odmietnutý</v-card-title>
      <v-card-text>
        <p>Nemáte potrebné povolenia na prístup k tejto stránke.</p>
        <p>Budete presmerovaní na domovskú stránku za {{ countdown }} sekund.</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="redirectNow">Domovská stránka</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "UnauthorizedPage",
  setup() {
    const router = useRouter();
    const countdown = ref(5); // Countdown timer (5 seconds)

    const redirectNow = () => {
      router.push("/"); // Redirect to homepage
    };

    // Countdown logic
    onMounted(() => {
      const interval = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(interval);
          redirectNow(); // Redirect when countdown reaches 0
        }
      }, 1000);
    });

    return {
      countdown,
      redirectNow,
    };
  },
});
</script>

<style scoped lang="scss">
.unauthorized-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

v-card {
  max-width: 400px;
  padding: 16px;
}

p {
  font-size: 1.2rem;
}

</style>
