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
      <v-container fluid>
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
  height: 400px;
  overflow: hidden;

  .banner-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
    background: linear-gradient(
        to bottom,
        rgba(44, 53, 49, 0.7),
        rgba(0, 0, 0, 0.4)
    );
  }
}

.v-main {
  margin-left: 250px;
  padding: 20px;
  width: calc(100% - 250px);
  overflow: auto;
}


</style>
