<script setup lang="ts">

import { useRouter } from 'vue-router';

interface Link {
  name: string;
  icon: string;
  path: string;
}

const router = useRouter();

const links: Link[] = [
  {
    name: "Home",
    icon: "ni ni-shop text-primary",
    path: "/auth/home",
  },
  {
    name: "Profile",
    icon: "ni ni-planet text-orange",
    path: "/auth/profile",
  },
  {
    name: "Submission",
    icon: "ni ni-planet text-orange",
    path: "/auth/studentSubmission",
  },
  {
    name: "My works",
    icon: "ni ni-planet text-orange",
    path: "/auth/participantView",
  },
  {
    name: "Review",
    icon: "ni ni-planet text-orange",
    path: "/auth/review",
  },
];

function navigateTo(path: string): void {
  router.push(path);
}
</script>

<template>
  <nav class="sidebar">
    <ul>
      <li v-for="(link, index) in links" :key="index" @click="navigateTo(link.path)" class="sidebar-item">
        <i :class="link.icon" class="icon"></i>
        <span class="link-name">{{ link.name }}</span>
      </li>

      <li>Odhlásiť sa</li>
    </ul>
  </nav>
</template>

<style scoped>

</style>
