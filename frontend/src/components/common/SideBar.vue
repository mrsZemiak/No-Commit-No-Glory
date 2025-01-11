<template>
  <v-navigation-drawer app permanent class="sidebar">
    <!-- General Links Top -->
    <v-list>
      <v-list-item
        v-for="(link, index) in generalLinksTop"
        :key="'general-top-' + index"
        @click="navigateTo(link.path)"
      >
        <v-list-item-title>{{ link.name }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Role-Based Links -->
    <template v-if="roleSpecificLinks.length">
      <v-list-subheader v-if="authStore.isParticipant">Účastník</v-list-subheader>
      <v-list-subheader v-if="authStore.isReviewer">Recenzent</v-list-subheader>
      <v-list-subheader v-if="authStore.isAdmin">Admin</v-list-subheader>
      <v-list>
        <v-list-item
          v-for="(link, index) in roleSpecificLinks"
          :key="authStore.role + '-' + index"
          @click="navigateTo(link.path)"
        >
          <v-list-item-title class="text-h6">{{ link.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>

    <!-- General Links Bottom -->
    <v-divider class="my-4"></v-divider>
    <v-list>
      <v-list-item
        v-for="(link, index) in generalLinksBottom"
        :key="'general-bottom-' + index"
        @click="navigateTo(link.path)"
      >
        <v-list-item-title>{{ link.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; //Use auth store for role-based rendering

interface Link {
  name: string;
  path: string;
}

// Access the router and auth store
const router = useRouter();
const authStore = useAuthStore();

// Link definitions
const generalLinksTop: Link[] = [{ name: "SciSubmit", path: "/" }];
const generalLinksBottom: Link[] = [
  { name: "Profil", path: "/auth/profile" },
  { name: "Odhlásiť sa", path: "/auth/logout" },
];
const participantLinks: Link[] = [
  { name: "Odovzdanie práce", path: "/auth/reviewer/submit" },
  { name: "Moje práce", path: "/auth/reviewer/participant" },
];
const reviewerLinks: Link[] = [
  { name: "Práce na hodnotenie", path: "/auth/reviewer/reviews" },
  { name: "Udeliť hodnotenie", path: "/auth/reviewer/review" },
];
const adminLinks: Link[] = [
  { name: "Konferencie", path: "/auth/admin/conferences" },
  { name: "Používatelia", path: "/auth/admin/users" },
  { name: "Práce", path: "/auth/admin/papers" },
  { name: "Kategórie", path: "/auth/admin/categories" },
  { name: "Otázky", path: "/auth/admin/questions" },
];

// Filter links dynamically based on role using authStore getters
const roleSpecificLinks = computed(() => {
  if (authStore.isParticipant) return participantLinks;
  if (authStore.isReviewer) return reviewerLinks;
  if (authStore.isAdmin) return adminLinks;
  return [];
});


// Navigation
function navigateTo(path: string): void {
  if (path === "/auth/logout") {
    authStore.logout();
  } else {
    router.push(path);
  }
}
</script>

<style lang="scss">
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  font-size: 1.5rem;

  .v-list-item-title {
    font-size: 1.5rem;
    font-family: 'Lato', sans-serif;
    color: #2c3531;
  }
}
</style>
