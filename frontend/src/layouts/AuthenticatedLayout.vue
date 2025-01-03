<script lang="ts">
import {defineComponent} from 'vue'
import SideBar from "@/components/common/SideBar.vue";


export default defineComponent({
  name: "AuthenticatedLayout" ,
  components: { SideBar},
})
</script>

<template>
  <div class="layout">
    <SideBar class="sidebar"/>
    <div class="main-content">
      <router-view />


    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  height: 100%;
  position: fixed;
  z-index: 10;
}

.main-content {
  margin-left: 250px;
  padding: 20px;
  width: calc(100% - 250px);
  overflow: auto;
}
</style>
