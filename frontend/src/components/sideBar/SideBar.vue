<script setup lang="ts">

import { useRouter } from 'vue-router';

interface Link {
  name: string;
  path: string;
}

const router = useRouter();
const participantLinks: Link[] = [
  {
    name: "Odovzdanie práce",
    path: "/auth/submit",
  },
  {
    name: "Moje práce",
    path: "/auth/participant",
  },
];
const reviewerLinks: Link[] = [
  {
    name: "Práce na hodnotenie",
    path: "/auth/reviews",
  },
];

const adminLinks: Link[] = [
  {
    name: "Konferencie",
    path: "/auth/conferences",
  },
  {
    name: "Kategórie",
    path: "/auth/categories",
  },
  {
    name: "Používatelia",
    path: "/auth/users",
  },
  {
    name: "Práce",
    path: "/auth/papers"
  }
];

const generalLinksTop: Link[] = [
  {
    name: "Domov",
    path: "/auth/home",
  },
]
const generalLinksBottom: Link[] = [
  {
    name: "Profil",
    path: "/auth/profile",
  },
  {
    name: "Odhlásiť sa",
    path: "/auth/logout",
  },
];

function navigateTo(path: string): void {
  router.push(path);
}
</script>

<template>
  <nav class="sidebar d-flex flex-column h-100">
    <ul>
      <li
        v-for="(link, index) in generalLinksTop"
        :key="'general-top-' + index"
        @click="navigateTo(link.path)"
        class="sidebar-item"
      >
        <span class="link-name">{{ link.name }}</span>
      </li>
      <li class="sidebar-category">Účastník</li>
      <li
        v-for="(link, index) in participantLinks"
        :key="'participant-' + index"
        @click="navigateTo(link.path)"
        class="sidebar-item"
      >
        <span class="link-name">{{ link.name }}</span>
      </li>

      <li class="sidebar-category">Recenzent</li>
      <li
        v-for="(link, index) in reviewerLinks"
        :key="'reviewer-' + index"
        @click="navigateTo(link.path)"
        class="sidebar-item"
      >
        <span class="link-name">{{ link.name }}</span>
      </li>

      <li class="sidebar-category">Admin</li>
      <li
        v-for="(link, index) in adminLinks"
        :key="'admin-' + index"
        @click="navigateTo(link.path)"
        class="sidebar-item"
      >
        <span class="link-name">{{ link.name }}</span>
      </li>
    </ul>
    <ul class="bottom-links mt-auto">
      <li
        v-for="(link, index) in generalLinksBottom"
        :key="'general-bottom-' + index"
        @click="navigateTo(link.path)"
        class="sidebar-item"
      >
        <span class="link-name">{{ link.name }}</span>
      </li>
    </ul>
  </nav>
</template>

<style scoped>

</style>
