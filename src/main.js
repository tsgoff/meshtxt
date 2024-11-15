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
        {
            name: "channel.messages",
            path: '/channels/:channelId/messages',
            props: true,
            component: () => import("./components/pages/ChannelMessagesPage.vue"),
        },
        {
            name: "node.messages",
            path: '/nodes/:nodeId/messages',
            props: true,
            component: () => import("./components/pages/NodeMessagesPage.vue"),
        },
    ],
});

createApp(App)
    .use(router)
    .mount('#app');
