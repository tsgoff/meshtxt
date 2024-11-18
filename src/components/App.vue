<template>
    <div class="w-full">
        <RouterView v-slot="{ Component, route }">
            <KeepAlive>
                <Component :is="Component" :key="route.fullPath" />
            </KeepAlive>
        </RouterView>
    </div>
</template>

<script>
import Connection from "../js/Connection.js";

export default {
    name: 'App',
    mounted() {
        Connection.addClientNotificationListener(this.onClientNotification);
    },
    beforeUnmount() {
        Connection.removeClientNotificationListener(this.onClientNotification);
    },
    methods: {
        onClientNotification(clientNotification) {
            alert(clientNotification.message);
        },
    },
}
</script>
