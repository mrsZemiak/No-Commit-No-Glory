<template>
  <div id="app">
    <div class="layout">

      <SideBar />
      <div class="main-content">
        <router-view />
        <UserTable></UserTable>
        <ConferenceTable></ConferenceTable>
      </div>
    </div>
  </div>
</template>

<script>

import SideBar from "@/components/sideBar/SideBar.vue";
import UserTable from "@/components/Admin/UserTable.vue";
import ConferenceTable from "@/components/Admin/ConferenceTable.vue";



export default {
  name: 'App',
  components: {
    ConferenceTable,
    UserTable,

    SideBar,
  },
};
</script>

<style>
/* Layout styles */
.layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
}
</style>
