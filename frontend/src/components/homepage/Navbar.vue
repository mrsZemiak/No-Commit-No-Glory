<template>
  <v-app-bar
    app
    color="rgba(210, 233, 227, 0.8)"
    elevate-on-scroll
    flat
  >
    <!-- Logo -->
    <v-app-bar-title>
      <img src="@/assets/images/logo_h.png" alt="Logo" height="50" />
    </v-app-bar-title>

    <!-- Spacer -->
    <v-spacer></v-spacer>

    <!-- GitHub Icon -->
    <v-btn
      href="https://github.com/Elfonator/No-Commit-No-Glory"
      target="_blank"
      variant="text"
    class="github-icon"
    >
    <v-icon size="36" color="#2C3531">mdi-github</v-icon>
    </v-btn>

    <!-- Login Button -->
    <v-btn
      outlined
      class="login-button me-4"
      @click="openLoginModal"
    >
      Prihlásenie
      <v-icon left>
        mdi-login
      </v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Navbar',
  methods: {
    openLoginModal() {
      // Logic for opening the login modal
      console.log('Open login modal');
    },
  },
});
</script>

<style lang="scss">

.github-icon {
  color: #000;
  &:hover {
    color: #555;
  }
}

.login-button {
  display:flex;
  align-items: center;
  gap:8px;
  font-weight: bold;
  color: #fff !important;
  border: none;
  border-radius: 5px;
  background-color: #BC463A ;
  padding: 6px 12px;
  box-shadow: 0 0 4px rgba( 0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(188, 70, 58, 0.7) !important;
    color: #fff !important;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 4px rgba(188, 70, 58, 0.5);
  }

  .v-icon {
    font-size: 20px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.v-app-bar {
  box-shadow: none;

  .v-app-bar-title {
    padding-top: 8px;

    img {
      max-height: 50px;
      height: auto;
    }
  }
}

</style>
