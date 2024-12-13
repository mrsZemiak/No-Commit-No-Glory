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
.sidebar {
  background-color: #f8f9fa;
  width: 250px;
  height: 100vh;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.sidebar-item:hover {
  background-color: #e2e6ea;
}

.icon {
  margin-right: 10px;
  font-size: 20px;
}

.link-name {
  font-size: 16px;
  color: #333;
}

.sidebar-item .text-primary {
  color: #007bff;
}

.sidebar-item .text-orange {
  color: #fd7e14;
}
</style>
