import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import "./style.css";

import App from './components/App.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import("./components/MainPage.vue"),
        },
    ],
})

createApp(App)
    .use(router)
    .mount('#app');
