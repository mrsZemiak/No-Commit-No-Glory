<script lang="ts">
import {defineComponent} from 'vue'
import SideBar from "@/components/sideBar/SideBar.vue";
import ConferenceTable from "@/components/Admin/ConferenceTable.vue";
import UserTable from "@/components/Admin/UserTable.vue";
import CategoryTable from "@/components/Admin/CategoryTable.vue";


export default defineComponent({
  name: "AuthenticatedLayout" ,
  components: {UserTable, ConferenceTable, SideBar, CategoryTable},
})
</script>

<template>
  <div class="layout">
    <SideBar class="sidebar"/>
    <div class="main-content">
      <router-view />
      <ConferenceTable></ConferenceTable>
      <UserTable></UserTable>
      <CategoryTable></CategoryTable>

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
