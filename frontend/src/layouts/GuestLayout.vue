<script lang="ts">
import {defineComponent} from 'vue'
import HomeView from "../views/HomeView.vue";

export default defineComponent({
  name: "GuestLayout",
  components: {HomeView}
})
</script>

<template>
  <div>
    <header>This is the homepage view underneath</header>
    <router-link to="/auth">Go into the app</router-link>
    <main>
      <HomeView> </HomeView>
    </main>
    <footer>Guest Footer</footer>
  </div>
</template>
<style scoped>

</style>
