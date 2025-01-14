<template>
  <v-navigation-drawer app permanent class="sidebar">

    <!-- Logo Section -->

    <div class="logo-container">
      <router-link to="/" class="logo-link">
      <img src="@/assets/images/logo.png" alt="SciSubmit Logo" class="sidebar-logo" />
      </router-link>
    </div>

    <!-- General Links Top -->


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
          <v-list-item-title>{{ link.name }}</v-list-item-title>
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
import { useAuthStore } from '@/stores/auth';

interface Link {
  name: string;
  path: string;
}

// Access the router and auth store
const router = useRouter();
const authStore = useAuthStore();

// Link definitions
const generalLinksBottom: Link[] = [
  { name: "Profil", path: "/auth/profile" },
  { name: "Odhlásiť sa", path: "/auth/logout" },
];
const participantLinks: Link[] = [
  { name: "Odovzdanie práce", path: "/auth/participant/submit" },
  { name: "Moje práce", path: "/auth/participant/works" },
];
const reviewerLinks: Link[] = [
  { name: "Práce na hodnotenie", path: "/auth/reviewer/reviews" },
  { name: "Udeliť hodnotenie", path: "/auth/reviewer/review" },
];
const adminLinks: Link[] = [
  { name: "Konferencie", path: "/auth/admin/conferences" },
  { name: "Používatelia", path: "/auth/admin/users" },
  { name: "Práce", path: "/auth/admin/papers-list" },
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

function navigateTo(path: string): void {
  if (path === "/auth/logout") {
    authStore.logout();
    router.push("/");
  } else {
    router.push(path);
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 350px;
  top: 0;
  background-color: #f8f9fa;
  border-radius: 0 10px 10px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  font-size: 1.5rem;

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    margin-bottom: 16px;
  }

  .sidebar-logo {
    width: 80%;
    height: auto;
    margin-left: 30px;
    object-fit: contain;
  }

  .v-list-item-title {
    font-size: 1.2rem;
    font-family: 'Lato', sans-serif;
    color: #2c3531;
  }
}



</style>
