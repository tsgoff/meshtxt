<template>
    <div class="w-full">
        <RouterView/>
    </div>
</template>

<script>
import Connection from "../js/Connection.js";
import GlobalState from "../js/GlobalState.js";

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
    computed: {
        GlobalState() {
            return GlobalState;
        },
    },
}
</script>
