import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

// Create the app instance
const app = createApp(App);

// Use plugins
app.use(vuetify);
app.use(router);
app.use(createPinia());

// Mount the app to the DOM
app.mount('#app');
