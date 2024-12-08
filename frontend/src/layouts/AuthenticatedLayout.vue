<script lang="ts">
import {defineComponent} from 'vue'
import SideBar from "@/components/sideBar/SideBar.vue";


export default defineComponent({
  name: "AuthenticatedLayout" ,
  components: {SideBar},
})
</script>

<template>
  <div class="layout">
    <SideBar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>

</style>
