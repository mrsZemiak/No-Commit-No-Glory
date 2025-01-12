<template>
  <div class="banner-container">
    <div class="banner-overlay"></div>
    <img
      src="@/assets/images/bannerAuth.jpg"
      class="banner-image"
      alt="Banner"/>
  </div>
    <SideBar />
    <!-- Main Content -->
    <v-main>
      <v-container class="main-container" fluid>
        <router-view />
      </v-container>
    </v-main>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import SideBar from "@/components/common/SideBar.vue";

export default defineComponent({
  name: "AuthenticatedLayout" ,
  components: { SideBar},
})
</script>

<style lang="scss">

.sidebar {
  z-index: 10;
}

.banner-container {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;

  .banner-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 700px;
    object-fit: cover;
    z-index: 1;
  }

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: linear-gradient(to bottom, rgba(44, 53, 49, 0.7), rgba(0, 0, 0, 0.4));
  }
}

/* Main content styling */
.v-main {
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  overflow: visible;
  padding-top: 0;
  position: relative;
  z-index: 2;
}

.main-container {
  position: relative;
  top: -100px;

  /* Profile card container styling */
  .profile {
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3;
    position: relative;
    margin-top: -30px;
  }

  .profile-card {
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    width: 90%;
    max-width: 900px;
  }
}



</style>
