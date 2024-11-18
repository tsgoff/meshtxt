import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import vClickOutside from "click-outside-vue3";
import "./style.css";

import App from './components/App.vue';
import GlobalState from "./js/GlobalState.js";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: "main",
            path: '/',
            component: () => import("./components/pages/MainPage.vue"),
        },
        {
            name: "connect",
            path: '/connect',
            component: () => import("./components/pages/ConnectPage.vue"),
        },
        {
            name: "channel.messages",
            path: '/channels/:channelId/messages',
            props: true,
            component: () => import("./components/pages/ChannelMessagesPage.vue"),
        },
        {
            name: "node",
            path: '/nodes/:nodeId',
            props: true,
            component: () => import("./components/pages/NodePage.vue"),
        },
        {
            name: "node.messages",
            path: '/nodes/:nodeId/messages',
            props: true,
            component: () => import("./components/pages/NodeMessagesPage.vue"),
        },
        {
            name: "node.traceroutes",
            path: '/nodes/:nodeId/traceroutes',
            props: true,
            component: () => import("./components/pages/NodeTraceRoutesPage.vue"),
        },
        {
            name: "node.traceroutes.run",
            path: '/nodes/:nodeId/traceroutes/run',
            props: true,
            component: () => import("./components/pages/NodeRunTraceRoutePage.vue"),
        },
        {
            name: "traceroute",
            path: '/traceroutes/:traceRouteId',
            props: true,
            component: () => import("./components/pages/TraceRoutePage.vue"),
        },
    ],
});

createApp(App)
    .use(router)
    .use(vClickOutside)
    .mount('#app');

// disconnect before unloading page (chrome webview on android was crashing without this...)
window.addEventListener("beforeunload", () => {
    if(GlobalState.connection){
        GlobalState.connection.disconnect();
        GlobalState.isConnected = false;
    }
});
