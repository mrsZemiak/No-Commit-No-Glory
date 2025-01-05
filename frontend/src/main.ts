import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './assets/styles/main.scss';
import 'bootstrap';
import 'flatpickr/dist/flatpickr.min.css';


const app = createApp(App);

app.use(createPinia());
app.use(router);


app.mount('#app');
