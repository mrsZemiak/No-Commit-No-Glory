<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
await authStore.loadAuthState();

export default defineComponent({
  name: 'App',
});



</script>

<style lang="scss">
@use "@/assets/styles/main";
</style>
