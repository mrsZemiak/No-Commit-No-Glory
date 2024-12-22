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
    name: "Domov",
    icon: "ni ni-shop text-primary",
    path: "/auth/home",
  },
  {
    name: "Profil",
    icon: "ni ni-planet text-orange",
    path: "/auth/profile",
  },
  {
    name: "Odovzdanie práce",
    icon: "ni ni-planet text-orange",
    path: "/auth/submit",
  },
  {
    name: "Moje práce",
    icon: "ni ni-planet text-orange",
    path: "/auth/participantView",
  },
  {
    name: "Práce na hodnotenie",
    icon: "ni ni-planet text-orange",
    path: "/auth/reviews",
  },
  {
    name: "Konferencie",
    icon: "ni ni-planet text-orange",
    path: "/auth/conferences",
  },
  {
    name: "Kategórie",
    icon: "ni ni-planet text-orange",
    path: "/auth/categories",
  },
  {
    name: "Používatelia",
    icon: "ni ni-planet text-orange",
    path: "/auth/users",
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
